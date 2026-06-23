// ── Registration Number Validators ────────────────────────────────────────
export const REG_PATTERNS = {
    "Private Limited Company": {
        pattern: /^[LU][0-9]{5}[A-Z]{2}[0-9]{4}[A-Z]{3}[0-9]{6}$/,
        example: "U72900TN2020PTC123456",
        label:   "CIN"
    },
    "Public Limited Company": {
        pattern: /^[LU][0-9]{5}[A-Z]{2}[0-9]{4}[A-Z]{3}[0-9]{6}$/,
        example: "L17110MH1973PLC019786",
        label:   "CIN"
    },
    "LLP": {
        pattern: /^AAA-[0-9]{4}$|^[A-Z]{3}-[0-9]{4}$/i,
        example: "AAA-1234",
        label:   "LLPIN"
    },
    "Section 8 Company": {
        pattern: /^[LU][0-9]{5}[A-Z]{2}[0-9]{4}[A-Z]{3}[0-9]{6}$/,
        example: "U85300TN2010NPL012345",
        label:   "CIN"
    },
    "Society": {
        pattern: /^.{5,50}$/,
        example: "Society registration number",
        label:   "Society Reg No."
    },
    "Trust": {
        pattern: /^.{5,50}$/,
        example: "Trust deed number",
        label:   "Trust Reg No."
    },
    "Partnership": {
        pattern: /^.{5,50}$/,
        example: "Partnership registration number",
        label:   "Partnership Reg No."
    },
    "Other": {
        pattern: /^.{5,50}$/,
        example: "Registration number",
        label:   "Reg No."
    }
}

export function validateRegistrationNumber(number, entityType) {
    if (!number || !entityType) return null
    const config = REG_PATTERNS[entityType]
    if (!config) return null
    return config.pattern.test(number.trim().toUpperCase())
        ? null
        : `Invalid ${config.label} format for ${entityType}. Example: ${config.example}`
}

// ── GST Validator ─────────────────────────────────────────────────────────
export function validateGST(gst) {
    if (!gst || gst.trim() === "") return null  // optional field
    const pattern = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/
    return pattern.test(gst.trim().toUpperCase())
        ? null
        : "Invalid GST format. Example: 33AADCB2230M1ZV"
}

// ── Email Validator ───────────────────────────────────────────────────────
export function validateEmail(email) {
    if (!email || email.trim() === "") return "Email is required"
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return pattern.test(email.trim())
        ? null
        : "Invalid email format"
}

// ── Mobile Validator ──────────────────────────────────────────────────────
export function validateMobile(mobile) {
    if (!mobile || mobile.trim() === "") return "Mobile number is required"
    // 10-digit Indian mobile — optional +91 or 0 prefix
    const pattern = /^(\+91|0)?[6-9][0-9]{9}$/
    return pattern.test(mobile.replace(/\s/g, ""))
        ? null
        : "Invalid mobile number. Must be a valid 10-digit Indian number"
}

// ── File Validator ────────────────────────────────────────────────────────
export const ALLOWED_FILE_TYPES = {
    image:    ["image/jpeg", "image/png", "image/jpg", "image/webp"],
    pdf:      ["application/pdf"],
    document: [
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ]
}

export const ALL_ALLOWED_TYPES = [
    ...ALLOWED_FILE_TYPES.image,
    ...ALLOWED_FILE_TYPES.pdf,
    ...ALLOWED_FILE_TYPES.document
]

export const MAX_FILE_SIZE = 5 * 1024 * 1024  // 5MB

export function validateFile(file) {
    if (!file) return null

    if (!ALL_ALLOWED_TYPES.includes(file.type)) {
        return `Invalid file type. Allowed: JPG, PNG, PDF, DOC, DOCX`
    }

    if (file.size > MAX_FILE_SIZE) {
        return `File too large. Maximum size is 5MB`
    }

    return null
}

export function validateFiles(files) {
    for (const file of files) {
        const err = validateFile(file)
        if (err) return err
    }
    return null
}

// ── Run all profile validations ───────────────────────────────────────────
export function validateProfile(body) {
    const errors = {}

    if (!body.organizationName?.trim()) {
        errors.organizationName = "Organization name is required"
    }

    if (!body.legalEntityType) {
        errors.legalEntityType = "Legal entity type is required"
    }

    if (!body.registrationNumber?.trim()) {
        errors.registrationNumber = "Registration number is required"
    } else {
        const regErr = validateRegistrationNumber(
            body.registrationNumber,
            body.legalEntityType
        )
        if (regErr) errors.registrationNumber = regErr
    }

    if (!body.dateOfIncorporation) {
        errors.dateOfIncorporation = "Date of incorporation is required"
    }

    const gstErr = validateGST(body.gstNumber)
    if (gstErr) errors.gstNumber = gstErr

    if (!body.registeredOfficeAddress?.trim()) {
        errors.registeredOfficeAddress = "Office address is required"
    }

    if (!body.contactPersonName?.trim()) {
        errors.contactPersonName = "Contact person name is required"
    }

    const emailErr = validateEmail(body.contactPersonEmail)
    if (emailErr) errors.contactPersonEmail = emailErr

    const mobileErr = validateMobile(body.contactPersonMobile)
    if (mobileErr) errors.contactPersonMobile = mobileErr

    if (!body.founderExperience?.trim()) {
        errors.founderExperience = "Founder experience is required"
    }

    if (!body.mentorNetworkAccess?.trim()) {
        errors.mentorNetworkAccess = "Mentor network access is required"
    }

    if (!body.startupFrameworkApproach?.trim()) {
        errors.startupFrameworkApproach = "Startup framework approach is required"
    }

    if (!body.tier2Tier3Strategy?.trim()) {
        errors.tier2Tier3Strategy = "Tier-2/3 strategy is required"
    }

    if (!body.declarationAccuracy || !body.declarationSchemeUnderstanding) {
        errors.declarations = "Both declarations must be accepted"
    }

    return errors
}