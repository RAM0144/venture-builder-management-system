import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";


export async function GET(req) {
    try {
        const session = await getServerSession(authOptions)
        if(!session || session.user.role !== "HUB"){
            return Response.json(
                { message: "Unauthorized" },
                { status: 401 } 
            )
        }

        //get hub assigned to this user 
        const hubAssignment = await prisma.hubAssignment.findFirst({
            where: { userId: session.user.id },
             include: {
                hub: {
                    include: {
                        assignments: {
                            where: {
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
                                                milestone: {
                                                    orderNumber: "asc"
                                                }
                                            }
                                        },
                                        ventureBuilderProfile: {
                                            select: {
                                                organizationName: true,
                                                legalEntityType:  true,
                                                profileCompleted: true,
                                                contactPersonName: true,
                                                contactPersonEmail: true
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        })

        if (!hubAssignment) {
            return Response.json(
                { message: "No hub assigned to this user" },
                { status: 404 }
            )
        }

        return Response.json({ hub: hubAssignment.hub })

    } catch (error) {
         console.log(error)
        return Response.json(
            { message: "Something went wrong" },
            { status: 500 }
        )
    }
}