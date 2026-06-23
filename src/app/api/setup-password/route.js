import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function POST(req) {
    try {
        const { token, password } = await req.json()

        if(!token || !password){
            return Response.json(
                { message: "Token and password are required" },
                { status: 400 }
            )
        }

    const user =  await prisma.user.findFirst({
        where: {
            inviteToken: token,
            inviteTokenExpiry: { gt: new Date() }
        }
    })

    if(!user){
        return Response.json(
             { message: "Invalid or expired invite link" },
             { status: 400 }
        )
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    await prisma.user.update({
      where: {id: user.id},
      data: {
        password: hashedPassword,
        emailVerified: true,
        isFirstLogin: false,
        inviteToken: null,
        inviteTokenExpiry: null
      }
    })

    return Response.json({
        message: "Password set successfully. Please login."
    })

     } catch (error) {
        console.log(error)
        return Response.json(
            { message: "Something went wrong" },
            { status: 500 }
        )
    }
}