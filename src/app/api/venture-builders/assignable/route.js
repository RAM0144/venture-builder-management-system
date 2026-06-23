import { getServerSession } from "next-auth"
// import { authOptions } from "../../auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/lib/auth"


export async function GET(req) {
    
    try {
        const session = await getServerSession(authOptions)

        if(!session || session.user.role !== "ADMIN"){
            return Response.json(
                { message: "Unauthorized" },
                { status: 401 }
            )
        }

        const users = await prisma.user.findMany({
           where: {
               role: "VB",
            isFirstLogin: false,
            ventureBuilderProfile: {
                profileCompleted: {
                gte: 100
              }
            }
           },
           orderBy: { createdAt: "desc" },
           select: {
             id: true, 
             name: true, 
             email: true, 
             phone: true, 
             ventureBuilderProfile: {
              select: 
                { organizationName: true, 
                    profileCompleted: true 
                }
             }      
           }
        })

        return Response.json({ users })

    } catch (error) {
         return Response.json(
        {
            message: "Something went wrong",
            error: error.message
        },
        { status: 500 }
      )
    }
}