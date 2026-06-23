import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { sendMilestoneReviewed } from "@/lib/mail";

// GET single assignment
export async function GET(req, {params}) {
    try {
        const session = await getServerSession(authOptions)

        if(!session){
            return Response.json(
                { message: "Unauthorized" },
                { status: 401 }
            )
        }

        const { id } = await params

        const assignment = await prisma.milestoneAssignment.findUnique({
            where: { id },
            include: {
                milestone: true,
                user: {
                   select: { id: true, name: true, email: true }
                },
                document: {
                    orderBy: { createdAt: "asc" } // show in upload order
                }
            }
        })
        if(!assignment){
            return Response.json(
                {message: "Assignment not found"},
                {status: 404}
            )
        }
        return Response.json({ assignment })

    } catch (error) {
         console.log(error)
        return Response.json(
            { message: "Something went wrong" },
            { status: 500 }
        )
    }
}

// PUT - VB submits or admin reviews
export async function PUT(req, {params}) {
    try {
        const session =  await getServerSession(authOptions)

        if(!session){
            return Response.json(
                {message: "Unauthorized"},
                {status: 401}
            )
        }

        const { id } = await params
        const body = await req.json()
        const { action } = body

        //VB starts milestone
        if(action === "start"){
            const assignment = await prisma.milestoneAssignment.update({
                where: { id },
                data: { status: "IN_PROGRESS" }
            })
            return Response.json({
                message: "Milestone started",
                assignment
            })
        }

        //VB: submit current batches for admin review
        if(action === "submit") {
          // must have at least one pending batch
            const pendingBatches = await prisma.document.count({
                where: { assignmentId: id, batchStatus: "PENDING" }
            })

            if (pendingBatches === 0) {
                return Response.json(
                    { message: "Upload at least one batch before submitting" },
                    { status: 400 }
                )
            }  
        
            const assignment = await prisma.milestoneAssignment.update({
                where: { id },
                data: {
                    status:      "SUBMITTED",
                    submittedAt: new Date()
                }
            })

            return Response.json({
                message: "Submitted for review",
                assignment
            })
       }

        
        // ── Admin: review a specific BATCH (not whole milestone) ──
        if (action === "reviewBatch") {
            if (session.user.role !== "ADMIN") {
                return Response.json(
                    { message: "Unauthorized" },
                    { status: 401 }
                )
            }

     const { documentId, batchStatus, adminFeedback } = body

            if (!["APPROVED", "REJECTED"].includes(batchStatus)) {
                return Response.json(
                    { message: "Invalid batch status" },
                    { status: 400 }
                )
            }

            // get the document / batch
            const document = await prisma.document.findUnique({
                where: { id: documentId }
            })

            if (!document) {
                return Response.json(
                    { message: "Batch not found" },
                    { status: 404 }
                )
            }

            // update batch status
            await prisma.document.update({
                where: { id: documentId },
                data: {
                    batchStatus,
                    adminFeedback: adminFeedback || null,
                    reviewedAt:    new Date()
                }
            })

            // get current assignment with milestone
            const current = await prisma.milestoneAssignment.findUnique({
                where: { id },
                include: {
                    milestone:  true,
                    documents:  true,
                    user:       true
                }
            })

            // recalculate completedCount from ALL approved batches
            const approvedDocs = current.documents.filter(
                d => d.id === documentId
                    ? batchStatus === "APPROVED"
                    : d.batchStatus === "APPROVED"
            )

            const newCompletedCount = approvedDocs.reduce(
                (sum, d) => sum + d.completedCount, 0
            )

            // determine new milestone status
            const targetCount      = current.milestone.targetCount
            const isComplete       = newCompletedCount >= targetCount

            // check if any pending batches remain
            const remainingPending = current.documents.filter(
                d => d.id !== documentId && d.batchStatus === "PENDING"
            ).length

            let newStatus = current.status

            if (isComplete) {
                newStatus = "APPROVED"  // milestone fully complete
            } else if (remainingPending > 0) {
                newStatus = "SUBMITTED" // still has pending batches
            } else {
                newStatus = "IN_PROGRESS" // all batches reviewed, not yet complete
            }

            const updatedAssignment = await prisma.milestoneAssignment.update({
                where: { id },
                data: {
                    completedCount: newCompletedCount,
                    status:         newStatus,
                    reviewedAt:     new Date(),
                    reviewedById:   session.user.id,
                    // only set adminNote on milestone approval
                    ...(isComplete && {
                        adminNote: adminFeedback || "Milestone target reached!"
                    })
                },
                include: {
                    user:      true,
                    milestone: true,
                    documents: { orderBy: { createdAt: "asc" } }
                }
            })

            // send email only when milestone fully approved
            if (isComplete) {
                try {
                    await sendMilestoneReviewed(
                        updatedAssignment.user.email,
                        updatedAssignment.user.name,
                        updatedAssignment.milestone.title,
                        "APPROVED",
                        `Congratulations! You completed all ${targetCount} startups.`
                    )
                } catch (emailError) {
                    console.log("Email failed:", emailError)
                }
            }

            return Response.json({
                message: isComplete
                    ? "Batch approved — milestone complete!"
                    : `Batch ${batchStatus.toLowerCase()}`,
                assignment: updatedAssignment,
                isComplete,
                newCompletedCount,
                targetCount
            })
        }

        return Response.json({ message: "Invalid action" }, { status: 400 })

    } catch (error) {
        console.log(error)
        return Response.json(
            { message: "Something went wrong" },
            { status: 500 }
        )
    }
}