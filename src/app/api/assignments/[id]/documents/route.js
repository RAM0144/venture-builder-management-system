// import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"


export async function POST(req, {params}) {
    try {
        const session = await getServerSession(authOptions)
        if(!session){
           return Response.json({ message: "Unauthorized" }, 
            { status: 401 }) 
        }

        const { id } = await params
        const { name, url, completedCount, note } = await req.json()

        if (!name || !url) {
            return Response.json(
                { message: "Name and URL are required" },
                { status: 400 }
            )
        }

        if (!completedCount || Number(completedCount) <= 0) {
            return Response.json(
                { message: "Enter how many startups you completed" },
                { status: 400 }
            )
        }

        // get assignment to check it exists
        const assignment = await prisma.milestoneAssignment.findUnique({
            where: { id },
            include: { milestone: true }
        })

        if (!assignment) {
            return Response.json(
                { message: "Assignment not found" },
                { status: 404 }
            )
        }

        // check total won't exceed target with current approved batches
        const approvedBatches = await prisma.document.findMany({
            where: { assignmentId: id, batchStatus: "APPROVED" }
        })

        const currentApproved = approvedBatches.reduce(
            (sum, d) => sum + d.completedCount, 0
        )

        const remaining = assignment.milestone.targetCount - currentApproved

        if (remaining <= 0) {
            return Response.json(
                { message: "Target already reached — no more uploads needed" },
                { status: 400 }
            )
        }

        if (Number(completedCount) > remaining) {
            return Response.json(
                {
                    message: `You can only add ${remaining} more startups to reach the target of ${assignment.milestone.targetCount}`
                },
                { status: 400 }
            )
        }

        //Create document - batchStatus as PENDING
        const document = await prisma.document.create({
            data: {
                name,
                url,
                type:  "link",
                completedCount: Number(completedCount),
                note:           note || null,
                batchStatus:    "PENDING",
                assignmentId:   id,
                uploadedById:   session.user.id
            }
        })

        // Keep assignment as IN_PROGRESS when uploading
        await prisma.milestoneAssignment.update({
            where: { id },
            data: { status: "IN_PROGRESS" }
        })

        return Response.json(
            { message: "Batch uploaded successfully", document },
            { status: 201 }
        )

    } catch (error) {
       console.log(error)
        return Response.json(
            { message: "Something went wrong" },
            { status: 500 }
        ) 
    }
}

// Delete - remove document
export async function DELETE(req, {params}) {
    try {
        const session = await getServerSession(authOptions)

        if(!session){
            return Response.json(
                { message: "Unauthorized" },
                { status: 401 }
            )
        }

        const { id } = await params
        const { documentId } = await req.json()

        // get document to find its completedCount
        const doc = await prisma.document.findUnique({
            where: { id: documentId }
        })

        if(!doc){
           return Response.json(
                { message: "Document not found" },
                { status: 404 }
            ) 
        }

         // delete doc AND subtract its count from assignment
        // await prisma.$transaction([
        //     prisma.document.delete({ where: { id: documentId } }),
        //     prisma.milestoneAssignment.update({
        //         where: { id },
        //         data: {
        //             completedCount: {
        //                 decrement: doc.completedCount
        //             }
        //         }
        //     })
        // ])

        // only allow deleting PENDING or REJECTED batches
        if(doc.batchStatus === "APPROVED"){
           return Response.json(
                { message: "Cannot delete an approved batch" },
                { status: 400 }
            ) 
        }

        await prisma.document.delete({
            where: { id: documentId }
        })

        return Response.json({ message: "Document removed or Batch removed" })

    } catch (error) {
       console.log(error)
        return Response.json(
            { message: "Something went wrong" },
            { status: 500 }
        ) 
    }
}




//POST - VB uploads documents link as evidence with completedCount for this batch
// export async function POST(req, {params}) {
//     try {
//         const session = await getServerSession(authOptions)

//         if(!session){
//             return Response.json(
//               { message: "Unauthorized" },
//               { status: 401 }  
//             )
//         }

//        const { id } = await params
//        const { name, url, type, completedCount, note } = await req.json()

//        if (!name || !url) {
//             return Response.json(
//                 { message: "Name and URL are required" },
//                 { status: 400 }
//             )
//         }

//         if(!completedCount || Number(completedCount) <= 0) {
//             return Response.json(
//                { message: "Please enter how many startups you completed" },
//                { status: 400 } 
//             )
//         }

//         // get current assignment
//         const assignment = await prisma.milestoneAssignment.findUnique({
//              where: { id },
//             include: { milestone: true }
//         })

//         if (!assignment) {
//             return Response.json(
//                 { message: "Assignment not found" },
//                 { status: 404 }
//             )
//         }

//         const newTotal = current.completedCount + Number(completedCount)
//         const cappedTotal = Math.min(newTotal, current.milestone.targetCount)

//         const [document] = await prisma.$transaction([
          
//           //1.create document  
//           prisma.document.create({
//             data: {
//                 name,
//                 url,
//                 type: type || "link",
//                 completedCount: Number(completedCount),
//                 note: note || null,
//                 assignmentId: id,
//                 uploadedById: session.user.id
//             }
//           }),

//           // 2. update completedCount on assignment
//             prisma.milestoneAssignment.update({
//                 where: { id },
//                 data: {
//                     completedCount: cappedTotal,
//                     status:         "IN_PROGRESS"
//                 }
//             })
//         ])

//         return Response.json(
//             { message: "Document uploaded successfully", document },
//             { status: 201 }
//         )

//     } catch (error) {
//          console.log(error)
//         return Response.json(
//             { message: "Something went wrong" },
//             { status: 500 }
//         )
//     }
// }