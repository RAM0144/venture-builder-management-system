// const { PrismaClient } = require("@prisma/client")
// const bcrypt = require("bcryptjs")

import { PrismaClient } from "@prisma/client"
// import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

// async function main() {

//     const existingAdmin = await prisma.user.findUnique({
//         where: {
//             email: "ram440163@gmail.com"
//         }
//     })

//     if (existingAdmin) {
//         console.log("Admin already exists")
//         return
//     }

//     const hashedPassword = await bcrypt.hash(
//         "Admin@123",
//         10
//     )

//     await prisma.user.create({
//         data: {
//             name: "Admin",

//             email: "ram440163@gmail.com",

//             phone: "9944016322",

//             password: hashedPassword,

//             role: "ADMIN",

//             isActive: true,

//             isFirstLogin: false,

//             emailVerified: true

//         }
//     })

//     console.log("Admin created successfully")
// }

// main()
//     .catch((e) => {
//         console.error(e)
//         process.exit(1)
//     })
//     .finally(async () => {
//         await prisma.$disconnect()
//     })


async function main() {

    console.log("Seeding milestones...")

    // clear existing milestones first
    await prisma.milestone.deleteMany()

    await prisma.milestone.createMany({
        data: [
            {
                orderNumber: 1,
                title: "DPIIT Registration",
                targetCount: 25,
                description: `1. Number of startups scouted
                              2. Number of startups onboarded
                              3. StartupTN Smart Cards distributed
                              4. DPIIT-registered startups list submitted`
            },
            {
                orderNumber: 2,
                title: "Prototyping & Validation",
                targetCount: 25,
                description: `1. Startups connected to incubation centers
                              2. Gap analysis completed
                              3. Smart Cards and services utilized
                              4. Mentor connects conducted`
            },
            {
                orderNumber: 3,
                title: "MVP Development",
                targetCount: 25,
                description: `1. SME product review sessions
                              2. Business modeling programs
                              3. Credit access and fundraising sessions`
            },
            {
                orderNumber: 4,
                title: "Review & Analysis",
                targetCount: 25,
                description: `1. Review of onboarded startups
                              2. Success stories report
                              3. Final report submission`
            }
        ]
    })

    console.log("✅ Milestones seeded successfully")
}

main()
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })