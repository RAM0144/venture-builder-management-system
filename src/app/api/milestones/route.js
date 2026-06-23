import { getServerSession } from "next-auth"
// import { authOptions } from "../auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/lib/auth"



// Get all milestones  — admin and VB can view
export async function GET(req) {
    try {
        const session = await getServerSession(authOptions)

        if(!session ){
            return Response.json(
                 { message: "Unauthorized" },
                { status: 401 }
            )
        }

        const milestones = await prisma.milestone.findMany({
            orderBy: { orderNumber: "asc" },
             include: {
                assignments: {
                    select: {
                      status: true,
                      completedCount: true
                    }
                },
                _count: { 
                    select: { assignments: true } 
                }
            }
        })
        return Response.json({ milestones })

    } catch (error) {
         console.log(error)
        return Response.json(
            { message: "Something went wrong" },
            { status: 500 }
        )
    }
}

