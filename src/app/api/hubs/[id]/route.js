import { getServerSession } from "next-auth"
import { authOptions } from "../../auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"


//Get single hub
export async function GET(req, {params}) {
    try {
        const session = await getServerSession(authOptions)
        if(!session || session.user.role !== "ADMIN"){
            return Response.json(
                { message: "Unauthorized" },
                { status: 401 }
            )
        }

        const { id } = await params
        const hub = await prisma.hub.findUnique({
             where: { id },
            include: {
                // manager: {
                //     select: { id: true, name: true, email: true }
                // },
                assignments: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                phone: true,
                                isFirstLogin: true,
                                isActive:     true,
                                role:         true,  // ✅ include role
                                ventureBuilderProfile: {
                                    select: {
                                        organizationName: true,
                                        profileCompleted: true,
                                        legalEntityType: true
                                    }
                                }
                            }
                        }
                    }
                }
            }
        })

         if (!hub) {
            return Response.json(
                { message: "Hub not found" },
                { status: 404 }
            )
        }


        // ✅ filter assignments to only show VB role users
        const filteredHub = {
            ...hub,
            assignments: hub.assignments.filter(
                a => a.user.role === "VB"
            )
        }

        return Response.json({ hub: filteredHub })
        
    } catch (error) {
        console.log(error)
        return Response.json(
            { message: "Something went wrong" },
            { status: 500 }
        )
    }
}

//Put update hub

export async function PUT(req, {params}) {
    try {
        const session = await getServerSession(authOptions)

        if(!session || session.user.role !== "ADMIN"){
            return Response.json(
                {message: "Unauthorized"},
                {status: 401}
            )
        }

        const { id } = await params

        const { name, description, location } = await req.json()

         await prisma.hub.update({
            where: {id},
            data: {
                name, description, location
            }
        })

        return Response.json(
            {message: "Hub updated successfully"}
        )

    } catch (error) {
        console.log(error)
        return Response.json(
            { message: "Something went wrong" },
            { status: 500 }
        )
    }
}

//Delete single hub

export async function DELETE(req, {params}) {
    try {
        const session = await getServerSession(authOptions)

        if(!session || session.user.role !== "ADMIN"){
            return Response.json(
                {message: "Unauthorized"},
                {status: 401}
            )
        }

         const { id } = await params

         // delete assignments first
        await prisma.hubAssignment.deleteMany({
            where: { hubId: id }
        })

        await prisma.hub.delete({
            where: { id }
        })

        return Response.json({ message: "Hub deleted" })

    } catch (error) {
       console.log(error)
        return Response.json(
            { message: "Something went wrong" },
            { status: 500 }
        ) 
    }
}