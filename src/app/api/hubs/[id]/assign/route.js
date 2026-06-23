// Assign VB to Hub

import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"

// POST assign VB to hub
export async function POST(req, {params}) {
    
    try {
        const session = await getServerSession(authOptions)

        if (!session || session.user.role !== "ADMIN") {
            return Response.json(
                { message: "Unauthorized" },
                { status: 401 }
            )
        }

        const { id } = await params

        const { userId } = await req.json()

        const user = await prisma.user.findUnique({
            where: { id: userId }
        })

         if (!user) {
            return Response.json(
                { message: "User ID is required" },
                { status: 400 }
            )
        }

        if(user.role !== "VB"){
            return Response.json(
                { message: "Only VB users can be assigned to hubs" },
                { status: 400 }
            )
        }

          // check already assigned
        const existing = await prisma.hubAssignment.findUnique({
            where: {
                hubId_userId: { hubId: id, userId }
            }
        })

         if (existing) {
            return Response.json(
                { message: "VB already assigned to this hub" },
                { status: 400 }
            )
        }

        const assignment = await prisma.hubAssignment.create({
            data: { hubId: id, userId },
             include: {
                user: {
                    select: { id: true, name: true, email: true }
                }
            }
        })

        return Response.json(
            { message: "VB assigned successfully", assignment },
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


// DELETE remove VB from hub