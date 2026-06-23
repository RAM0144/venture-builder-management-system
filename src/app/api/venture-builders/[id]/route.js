import { getServerSession } from "next-auth"
import { authOptions } from "../../auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"

 
 // GET the user VB data ADMIN only
 export async function GET(req, {params}) {
    try {
        const session = await getServerSession(authOptions)

        if(!session || session.user.role !== "ADMIN" && session.user.role !== "HUB" ){
            return Response.json(
                {message: "Unauthorized"},
                {status: 401}
            )
        }

        const { id } = await params

        const user = await prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                isActive:true,
                isFirstLogin: true,
                createdAt: true
            }
        })

        if(!user){
            return Response.json(
                { message: "VB not found" },
                { status: 404 }
            )
        }

        //Get profile separately from venture builder
        const profile = await prisma.ventureBuilderProfile.findUnique({
            where: { userId: id }
        })

        return Response.json({ user, profile})

    } catch (error) {
        console.log(error)
        return Response.json(
            {message: "Something went wrong"},
            {status: 500}
        )
    }
 }