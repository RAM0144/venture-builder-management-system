import { sendVerificationEmail } from "@/lib/mail"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import crypto from "crypto"

export async function POST(req) {
    
    try {

        const {name, email, phone, password} = await req.json()

        const existingUser = await prisma.user.findUnique({
            where: { email }
        })

        if(existingUser){
           return Response.json({ message: "user already exists" },
                { status: 400 }
            ) 
        }

        const hashedPassword = await bcrypt.hash(password, 10)

        const token = crypto.randomBytes(32).toString("hex")

        const user = await prisma.user.create({
            data: {
                name,
                email,
                phone,
                password: hashedPassword,
                verifyToken: token,
                verifyTokenExpiry: new Date(Date.now() + 1000 * 60 * 60)
            }
        })

        // email verification
        await sendVerificationEmail(email, name, token)

        return Response.json(
            {message: "Vb created successfully", user},
            {status: 201}    
        )
    } catch (error) {
       return Response.json({ message: "Something went wrong", error }, { status: 500 }) 
    }
}