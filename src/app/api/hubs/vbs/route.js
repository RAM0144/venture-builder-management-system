import { getServerSession } from "next-auth";
// import { authOptions } from "../../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";


//Get all VBs in hub
export async function GET(req){
    try {
        const session = await getServerSession(authOptions)

        if(!session || session.user.role !== "HUB"){
            return Response.json(
                { message: "Unauthorized" },
                { status: 401 }
            )
        }

        // find hub this user belongs to
        const hubAssignment = await prisma.hubAssignment.findFirst({
            where: { userId: session.user.id },
            select: { hubId: true }
        })

        if(!hubAssignment){
           return Response.json({ vbs: [] }) 
        }

        //get all VBs in this hub
        const assignments = await prisma.hubAssignment.findMany({
            where: { 
                hubId: hubAssignment.hubId,
                user: {
                    role: "VB"
                }
            },
            include: {
                user: {
                     select: {
                        id:           true,
                        name:         true,
                        email:        true,
                        phone:        true,
                        isFirstLogin: true,
                        milestoneAssignments: {
                            include: {
                                milestone: true,
                                documents: true
                            },
                            orderBy: {
                                milestone: { orderNumber: "asc" }
                            }
                        },
                        ventureBuilderProfile: {
                            select: {
                                organizationName:  true,
                                legalEntityType:   true,
                                profileCompleted:  true,
                                contactPersonName:  true,
                                contactPersonEmail: true,
                                startupFrameworkApproach: true
                            }
                        }
                    }    
                }
            }
        })
        const vbs = assignments.map(a => a.user)
        return Response.json({ vbs })
    } catch (error) {
        console.log(error)
        return Response.json(
            { message: "Something went wrong" },
            { status: 500 }
        )
    }
}