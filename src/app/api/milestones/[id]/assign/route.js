import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { sendMilestoneAssigned } from "@/lib/mail"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"


//POST assign milestone to VB
export async function POST(req, {params}) {
    try {
        
        const session = await getServerSession(authOptions)

        if(!session || session.user.role !== "ADMIN"){
            return Response.json(
                { message: "Unauthorized" },
                { status: 401 }
            )
        }

        const { id } = await params
        const { userId, deadline } = await req.json()

        if (!userId) {
            return Response.json(
                { message: "User ID is required" },
                { status: 400 }
            )
        }


        // check already assigned
        const existing = await prisma.milestoneAssignment.findUnique({
            where: {
                milestoneId_userId: { milestoneId: id, userId }
            }
        })

        // check already assigned
        if (existing) {
            return Response.json(
                { message: "Milestone already assigned to this VB" },
                { status: 400 }
            )
        }

        const assignment = await prisma.milestoneAssignment.create({
            data: {
                milestoneId: id,
                userId,
                deadline: deadline ? new Date(deadline) : null
            },
            include: {
                user: true,
                milestone: true,
            }
        })

        // send email
        try {
            await sendMilestoneAssigned(
                assignment.user.email,
                assignment.user.name,
                assignment.milestone.title,
                deadline
            )
            
        } catch (emailError) {
            console.log("Email failed:", emailError)
        }

        return Response.json(
            { message: "Milestone assigned", assignment },
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