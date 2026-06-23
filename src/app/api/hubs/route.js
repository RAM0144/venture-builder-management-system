import { getServerSession } from "next-auth"
import { authOptions } from "../auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import crypto from "crypto"
import { sendHubInviteEmail } from "@/lib/mail"

//Get all hubs
export async function GET(req) {
    try {
        const session = await getServerSession(authOptions)

         if (!session || session.user.role !== "ADMIN") {
            return Response.json(
                { message: "Unauthorized" },
                { status: 401 }
            )
        }

        const hubs = await prisma.hub.findMany({
            orderBy: { createdAt: "desc" },
            include: {
                 assignments: {
                    where: {
                        user: { role: "VB" } 
                    },
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                role: true,
                                ventureBuilderProfile: {
                                    select: {
                                        organizationName: true,
                                        profileCompleted: true
                                    }
                                }
                            }
                        }
                    }
                },
                _count: {
                    select: { 
                        assignments: {
                            where: {
                                user: { role: "VB" }
                            } 
                    }
                  }
                }
            
            }
        })
        return Response.json({ hubs })
    } catch (error) {
        console.log(error)
        return Response.json(
            { message: "Something went wrong" },
            { status: 500 }
        ) 
    }
}




//Post create hub

export async function POST(req) {
    
    try {
        const session = await getServerSession(authOptions)

        if(!session || session.user.role !== "ADMIN"){
            return Response.json(
                {message: "Unauthorized"},
                {status: 401}
            )
        }

        const { name, description, location, managerName, managerEmail } = await req.json()

         if (!name) {
            return Response.json(
                { message: "Hub name is required" },
                { status: 400 }
            )
        }

        let managerId = null

        // Create hub manager user if email provided
        if(managerEmail?.trim()){

            //check if user already exists
            const existing = await prisma.user.findUnique({
                where: { email: managerEmail }
            })

            if (existing) {
                return Response.json(
                    { message: "A user with this email already exists" },
                    { status: 400 }
                )
            }

            const inviteToken = crypto.randomBytes(32).toString("hex")
            const inviteTokenExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

            const hubUser = await prisma.user.create({
                data: {
                    name: managerName,
                    email: managerEmail,
                    password: "",
                    role: "HUB",
                    isFirstLogin: true,
                    isActive: true,
                    inviteToken,
                    inviteTokenExpiry,
                    createdBy: session.user.id
                }
            })

            managerId = hubUser.id

            //send invite email
            try{
                await sendHubInviteEmail(
                    managerEmail,
                    managerName,
                    inviteToken,
                    name
                )
            }catch (emailError){
                 console.log("Email failed:", emailError)
                // don't fail if email fails — user still created
            }
        }


        // Create the hub
        const hub = await prisma.hub.create({
            data: {
                name: name,
                description: description,
                location: location,
                isActive: true,
                managerId
            }
        })

        // Assign hub manager to hub
         // ── Assign hub manager to hub ────────────────────────────────────
        if (managerId) {
            await prisma.hubAssignment.create({
                data: {
                    hubId:  hub.id,
                    userId: managerId
                }
            })
        }

        return Response.json(
            { message: "Hub created successfully", hub },
            { status: 201 }
        )

        // if(!name){
        //     return Response.json(
        //         { message: "Hub name is required" },
        //         { status: 400 }
        //     )
        // }

        // const hub = await prisma.hub.create({
        //     data: {
        //         name, description, location
        //     }
        // })

        // return Response.json(
        //     { message: "Hub created successfully", hub },
        //     { status: 201 }
        // )
        
    } catch (error) {
        console.log(error)
        return Response.json(
            { message: "Something went wrong" },
            { status: 500 }
        )
    }
}