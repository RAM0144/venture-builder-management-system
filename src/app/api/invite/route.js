import { getServerSession } from "next-auth"
import { authOptions } from "../auth/[...nextauth]/route"
import { prisma } from "@/lib/prisma"
import crypto from "crypto"
import { sendInviteEmail } from "@/lib/mail"

//  Admin Creates + Invites VB
export async function POST(req) {
    
    try {
        const session = await getServerSession(authOptions)
        if(!session || session.user.role !== "ADMIN"){
            return Response.json(
                {message: "Unauthorized"},
                {status: 401}
            )
        }

        const { name, email, phone } = await req.json()

                if(!name || !email){
            return Response.json(
                { message: "Name and email are required" },
                { status: 400 }
            )
        }

        const existing = await prisma.user.findUnique({
            where: { email }
        })

        if(existing) {
            return Response.json(
                { message: "Email already registered" },
                { status: 400 }
            )
        }

        const token = crypto.randomBytes(32).toString("hex")

        const user = await prisma.user.create({
            data: {
                name,
                email,
                phone,
                role: "VB",
                inviteToken: token,
                inviteTokenExpiry: new Date(Date.now() + 1000 * 60 * 60 * 24), // 24 hours
                createdBy: session.user.id,
            }
        })

        //send invite link
        try {
            await sendInviteEmail(email, name, token)
        } catch (emailError) {
            console.log("Email failed:", emailError)
        }

                return Response.json(
            { message: "VB created and invite sent", user },
            { status: 201 }
        )

    } catch (error) {
        return Response.json(
             { message: "Something went wrong", error }, { status: 500 }
        )
    }
}