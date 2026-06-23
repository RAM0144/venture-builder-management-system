import { getServerSession } from "next-auth"
import { authOptions } from "../../auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

// GET — logged in VB's assigned milestones only
export async function GET(req) {
    try {
        const session = await getServerSession(authOptions)

        if (!session) {
            return Response.json(
                { message: "Unauthorized" },
                { status: 401 }
            )
        }

        if (session.user.role !== "VB") {
            return Response.json(
                { message: "Access denied" },
                { status: 403 }
            )
        }

        // ✅ only fetch assignments for this VB
        const assignments = await prisma.milestoneAssignment.findMany({
            where: { userId: session.user.id },
            orderBy: {
                milestone: { orderNumber: "asc" }  // ordered 1,2,3,4
            },
            include: {
                milestone: true,   // full milestone details
                // documents: true    // uploaded evidence
                documents: {
                    orderBy: { createdAt: "asc" }  // ✅ chronological order
                }
            }
        })

        return Response.json({ assignments })

    } catch (error) {
        console.log(error)
        return Response.json(
            { message: "Something went wrong" },
            { status: 500 }
        )
    }
}