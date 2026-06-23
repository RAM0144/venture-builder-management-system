import { SendResetEmail } from "@/lib/mail"
import { prisma } from "@/lib/prisma"
import crypto from "crypto"

export async function POST(req) {
    
    try {
        const { email } = await req.json()

        if(!email){
            return Response.json(
                { message: "Email is required" },
                { status: 400 }
            )
        }

        const user = await prisma.user.findUnique({
            where: { email }
        })

         // always return success — don't reveal if email exists

         if(!user){
            return Response.json(
                { message: "If this email exists a reset link has been sent"}
            )
         }

         const token = crypto.randomBytes(32).toString("hex")

         await prisma.user.update({
            where: { email },
            data: {
                resetToken: token,
                resetTokenExpiry: new Date(Date.now() + 1000 * 60 * 60) // 1 hour
            }
         })

         try {
             await SendResetEmail(email, user.name, token)
         } catch (emailError) {
            console.log("Email failed:", emailError)
         }

         return Response.json({
            message: "If this email exists a reset link has been sent"
         })

    } catch (error) {
        console.log(error)

    }
}