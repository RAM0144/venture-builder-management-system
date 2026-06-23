import { getServerSession } from "next-auth"
// import { authOptions } from "../../../auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/lib/auth"

export async function GET(req, { params }) {
    try {
        const session = await getServerSession(authOptions)

        if (!session || session.user.role !== "HUB") {
            return Response.json(
                { message: "Unauthorized" },
                { status: 401 }
            )
        }

        const { id } = await params

        const assignments = await prisma.milestoneAssignment.findMany({
            where: { userId: id },
            orderBy: {
                milestone: { orderNumber: "asc" }
            },
            include: {
                milestone: true,
                documents: true
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