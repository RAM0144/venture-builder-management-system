import { getServerSession } from "next-auth";
// import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { validateRegistrationNumber, validateGST, validateEmail, validateMobile } from "@/lib/validators";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

//GET - admin fetches a VB's profile
export async function GET(req, {params}) {
    try {
        const session = await getServerSession(authOptions)
         if (!session || session.user.role !== "ADMIN") {
            return Response.json({ message: "Unauthorized" }, { status: 401 })
        }

        const { id } = await params

        const user  = await prisma.user.findUnique({
          where: { id },
          select: { id: true, name: true, email: true, ventureBuilderProfile: true }
        })

        const profile = await prisma.ventureBuilderProfile.findUnique({
            where: { userId: id }
        })

        return Response.json({ user, profile })


    } catch (error) {
        console.log(error)
        return Response.json(
            {message: "Something went wrong"},
            {status: 500}
        )
    }
}

export async function POST(req, { params }){
    try {
        const session = await getServerSession(authOptions)

        if (!session || session.user.role !== "ADMIN") {
            return Response.json({ message: "Unauthorized" }, { status: 401 })
        }

        const { id } = await params
        const body = await req.json()

        //same validations as VB self-edit
        const fieldErrors = {}

        const regErr = validateRegistrationNumber(
            body.registrationNumber,
            body.legalEntityType
        )

        if (regErr) fieldErrors.registrationNumber = regErr

        const gstErr = validateGST(body.gstNumber)
        if (gstErr) fieldErrors.gstNumber = gstErr

        const emailErr = validateEmail(body.contactPersonEmail)
        if (emailErr) fieldErrors.contactPersonEmail = emailErr

        const mobileErr = validateMobile(body.contactPersonMobile)
        if (mobileErr) fieldErrors.contactPersonMobile = mobileErr

        if(!body.startupTargetUnderstanding){
            fieldErrors.startupTargetUnderstanding = "Please select an answer"
        }

        if(!body.coordinationCommitment){
            fieldErrors.coordinationCommitment = "Please select an answer"
        }

        if (Object.keys(fieldErrors).length > 0) {
            return Response.json(
                { message: "Validation failed", errors: fieldErrors },
                { status: 400 }
            )
        }

         const trackFields = [
            body.organizationName,
            body.legalEntityType,
            body.registrationNumber,
            body.dateOfIncorporation,
            body.registeredOfficeAddress,
            body.contactPersonName,
            body.contactPersonDesignation,
            body.contactPersonEmail,
            body.contactPersonMobile,
            body.founderExperience,
            body.mentorNetworkAccess,
            body.startupFrameworkApproach,body.startupTargetUnderstanding,
            body.coordinationCommitment,
            body.tier2Tier3Strategy,
            body.declarationAccuracy,
            body.declarationSchemeUnderstanding
        ]

        const filled = trackFields.filter(
            f => f !== "" && f !== null && f !== undefined && f !==false
        ).length

        const profileCompleted = Math.round(
            (filled / trackFields.length) * 100
        )

        const data = {
            organizationName:              body.organizationName,
            legalEntityType:               body.legalEntityType,
            registrationNumber:            body.registrationNumber || "",
            dateOfIncorporation:           new Date(body.dateOfIncorporation),
            gstNumber:                     body.gstNumber?.trim() || null,
            registeredOfficeAddress:       body.registeredOfficeAddress || "",
            contactPersonName:             body.contactPersonName || "",
            contactPersonDesignation:      body.contactPersonDesignation || "",
            contactPersonEmail:            body.contactPersonEmail?.trim() || "",
            contactPersonMobile:           body.contactPersonMobile?.trim() || "",
            founderExperience:             body.founderExperience || "",
            minimumViableProduct:          body.minimumViableProduct || null,
            mentorNetworkAccess:           body.mentorNetworkAccess || "",
            startupFrameworkApproach:      body.startupFrameworkApproach || "",
            startupTargetUnderstanding:    body.startupTargetUnderstanding || "",
            startupTargetComments:         body.startupTargetComments || null,
            coordinationCommitment:        body.coordinationCommitment || "",
            tier2Tier3Strategy:            body.tier2Tier3Strategy || "",
            legalEntityProof:              body.legalEntityProof || null,
            pastEngagementDocuments:       body.pastEngagementDocuments || [],
            declarationAccuracy:           body.declarationAccuracy || false,
            declarationSchemeUnderstanding: body.declarationSchemeUnderstanding || false,
            profileCompleted
        }

        const profile = await prisma.ventureBuilderProfile.upsert({
            where:  { userId: id },
            update: data,
            create: { userId: id, ...data }
        })

        return Response.json(
            { message: "Profile saved", profile },
            { status: 201 }
        )

    } catch (error) {
        console.log(error)
        return Response.json(
            {message: "Something went wrong"},
            {status: 500}
        )
    }
}