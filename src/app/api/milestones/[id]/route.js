import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

// GET single milestone with all assignments
export async function GET(req, { params }) {
    try {
        const session = await getServerSession(authOptions)

        if (!session) {
            return Response.json(
                { message: "Unauthorized" },
                { status: 401 }
            )
        }

        const { id } = await params

        const milestone = await prisma.milestone.findUnique({
            where: { id },
            include: {
                assignments: {
                    include: {
                        user: {
                            select: {
                                id:           true,
                                name:         true,
                                email:        true,
                                isFirstLogin: true,
                                ventureBuilderProfile: {
                                    select: {
                                        organizationName: true,
                                        profileCompleted: true
                                    }
                                }
                            }
                        },
                        documents: true  // ← all uploaded evidence
                    },
                    orderBy: { createdAt: "desc" }
                }
            }
        })


// const milestone = await prisma.milestone.findUnique({
//     where: { id },
//     include: {
//         assignments: {
//             include: {
//                 user: {
//                     select: {
//                         id:    true,
//                         name:  true,
//                         email: true,
//                         ventureBuilderProfile: {
//                             select: {
//                                 organizationName:        true,
//                                 profileCompleted:        true,
//                                 // ✅ include all document fields
//                                 minimumViableProduct:    true,
//                                 legalEntityProof:        true,
//                                 pastEngagementDocuments: true
//                             }
//                         }
//                     }
//                 },
//                 milestone: true,
//                 documents: {
//                     orderBy: { createdAt: "asc" }
//                 }
//             }
//         }
//     }
// })

        if (!milestone) {
            return Response.json(
                { message: "Milestone not found" },
                { status: 404 }
            )
        }

        return Response.json({ milestone })

    } catch (error) {
        console.log(error)
        return Response.json(
            { message: "Something went wrong" },
            { status: 500 }
        )
    }
}

// PUT update milestone (admin only)
export async function PUT(req, { params }) {
    try {
        const session = await getServerSession(authOptions)

        if (!session || session.user.role !== "ADMIN") {
            return Response.json(
                { message: "Unauthorized" },
                { status: 401 }
            )
        }

        const { id } = await params
        const { title, description, isActive } = await req.json()

        const milestone = await prisma.milestone.update({
            where: { id },
            data:  { title, description, isActive }
        })

        return Response.json({ message: "Milestone updated", milestone })

    } catch (error) {
        console.log(error)
        return Response.json(
            { message: "Something went wrong" },
            { status: 500 }
        )
    }
}

// DELETE milestone (admin only)
export async function DELETE(req, { params }) {
    try {
        const session = await getServerSession(authOptions)

        if (!session || session.user.role !== "ADMIN") {
            return Response.json(
                { message: "Unauthorized" },
                { status: 401 }
            )
        }

        const { id } = await params

        // delete documents first
        await prisma.document.deleteMany({
            where: {
                assignment: { milestoneId: id }
            }
        })

        // delete assignments
        await prisma.milestoneAssignment.deleteMany({
            where: { milestoneId: id }
        })

        // delete milestone
        await prisma.milestone.delete({ where: { id } })

        return Response.json({ message: "Milestone deleted" })

    } catch (error) {
        console.log(error)
        return Response.json(
            { message: "Something went wrong" },
            { status: 500 }
        )
    }
}