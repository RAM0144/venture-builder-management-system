import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function POST(req) {
    
    try {
        const { token, password } = await req.json()
        if(!token || !password){
            return Response.json(
                {message: "Token and Password are required"},
                {status: 400}
            )
        }

        if(password.length < 8){
           return Response.json(
                { message: "Password must be at least 8 characters" },
                { status: 400 }
            ) 
        }

        const user = await prisma.user.findFirst({
            where: {
                resetToken: token,
                resetTokenExpiry: {gt: new Date()}
            }
        })

        if(!user){
            return Response.json(
                { message: "Invalid or expired reset link" },
                { status: 400 }
            )
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        await prisma.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                resetToken: null,
                resetTokenExpiry: null
            }
        })
          return Response.json({
            message: "Password updated successfully"
        })
    } catch (error) {
          console.log(error)
        return Response.json(
            { message: "Something went wrong" },
            { status: 500 }
        )
    }
}