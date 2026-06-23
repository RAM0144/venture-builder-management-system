import { prisma } from "@/lib/prisma"


export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url, process.env.NEXTAUTH_URL)

        const token = searchParams.get("token")

        console.log(token, "verifytoken")

        if(!token) {
            return Response.redirect(
                `${process.env.NEXTAUTH_URL}/login?error=missing-token`
            )
        }

        const user = await prisma.user.findFirst({
            where: {
                verifyToken: token,
                verifyTokenExpiry: { gt: new Date() }
            }
        })

        if(!user){
            return Response.redirect(
                `${process.env.NEXTAUTH_URL}/login?error=invalid-token`
            )
        }

        await prisma.user.update({
            where: { id: user.id },
            data: {
                emailVerified: true,
                verifyToken: null,
                verifyTokenExpiry: null
            }
        })

        return Response.redirect(
            `${process.env.NEXTAUTH_URL}/login?verified=true`
        )

    } catch (error) {
         console.log(error)
        return NextResponse.redirect(
            new URL("/login?error=something-went-wrong", req.url)
        )
    }
}