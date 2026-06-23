import { getServerSession } from "next-auth"
import { authOptions } from "../auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

// GET all VBs - admin only
export async function GET(req) {
    try {
        const session = await getServerSession(authOptions)

           if (!session || session.user.role !== "ADMIN") {
            return Response.json(
                { message: "Unauthorized" },
                { status: 401 }
            )
        }

        const users = await prisma.user.findMany({
            where: { role: "VB" },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                isActive: true,
                isFirstLogin: true,
                createdAt: true,
                ventureBuilderProfile : {
                    select: {
                    organizationName: true,   // ✅ correct field
                    legalEntityType: true,
                    profileCompleted: true
                  }
                }
            },
             
        })

        return Response.json({ users })

    } catch (error) {
       
    console.log("VB API ERROR:", error)

    return Response.json(
        {
            message: "Something went wrong",
            error: error.message
        },
        { status: 500 }
    )
   }
    
}