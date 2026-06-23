"use client"

import { useEffect, useState } from "react"
import {
    validateRegistrationNumber,
    validateGST,
    validateEmail,
    validateMobile,
    validateFile,
    validateFiles,
    REG_PATTERNS,
    MAX_FILE_SIZE
} from "@/lib/validators"

const inputClass = `w-full px-3 py-2.5 border rounded-lg text-sm
                    focus:outline-none focus:ring-2 focus:ring-blue-500
                    focus:border-transparent placeholder:text-gray-400 bg-white`

const errorInputClass = `w-full px-3 py-2.5 border border-red-400 rounded-lg
                         text-sm focus:outline-none focus:ring-2
                         focus:ring-red-400 placeholder:text-gray-400 bg-white`

const textareaClass = `w-full px-3 py-2.5 border border-gray-200 rounded-lg
                       text-sm focus:outline-none focus:ring-2
                       focus:ring-blue-500 placeholder:text-gray-400 resize-none`

const errorTextareaClass = `w-full px-3 py-2.5 border border-red-400 rounded-lg
                            text-sm focus:outline-none focus:ring-2
                            focus:ring-red-400 placeholder:text-gray-400 resize-none`

function Section({ title, icon, color, children }) {
    return (
        <div className="bg-white border border-gray-200 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-5">
                <div className={`w-7 h-7 rounded-lg ${color} flex
                                items-center justify-center flex-shrink-0`}>
                    {icon}
                </div>
                <h2 className="text-sm font-medium text-gray-900">{title}</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {children}
            </div>
        </div>
    )
}

function Field({ label, required, fullWidth, error, children }) {
    return (
        <div className={fullWidth ? "sm:col-span-2" : ""}>
            <label className="block text-xs font-medium text-gray-700 mb-1">
                {label}
                {required && <span className="text-red-500 ml-0.5">*</span>}
            </label>
            {children}
            {error && (
                <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                    <svg className="w-3 h-3 flex-shrink-0" fill="none"
                        stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {error}
                </p>
            )}
        </div>
    )
}

const initialState = {
    organizationName:               "",
    legalEntityType:                "",
    registrationNumber:             "",
    dateOfIncorporation:            "",
    gstNumber:                      "",
    registeredOfficeAddress:        "",
    contactPersonName:              "",
    contactPersonDesignation:       "",
    contactPersonEmail:             "",
    contactPersonMobile:            "",
    founderExperience:              "",
    minimumViableProduct:           null,
    mentorNetworkAccess:            "",
    startupFrameworkApproach:       "",
    startupTargetUnderstanding:     "",
    startupTargetComments:          "",
    coordinationCommitment:         "",
    tier2Tier3Strategy:             "",
    legalEntityProof:               null,
    pastEngagementDocuments:        [],
    declarationAccuracy:            false,
    declarationSchemeUnderstanding: false
}

export default function VBProfileForm({
    apiUrl,
    method = "POST",
    backHref,
    backLabel = "← Back",
    prefillEmail = "",
    initialData = null,
    isAdminView = false,
    onSuccess
}) {
    const [formData, setFormData] = useState(
        initialData
            ? {
                ...initialState,
                ...initialData,
                dateOfIncorporation: initialData.dateOfIncorporation
                    ? new Date(initialData.dateOfIncorporation)
                        .toISOString().split("T")[0]
                    : "",
                gstNumber:                initialData.gstNumber || "",
                startupTargetComments:    initialData.startupTargetComments || "",
                legalEntityProof:         initialData.legalEntityProof || null,
                pastEngagementDocuments:  initialData.pastEngagementDocuments || [],
                // ✅ pre-fill email if provided
                contactPersonEmail: initialData.contactPersonEmail || prefillEmail
              }
            : {
                ...initialState,
                contactPersonEmail: prefillEmail  // ✅ auto-fill VB email
              }
    )

      console.log("Prefill email:", prefillEmail)
      console.log("Initial Data:", initialData)

    // useEffect(() => {
    //     if(prefillEmail && !initialData) {
    //         setFormData(prev => ({
    //             ...prev,
    //             contactPersonEmail: prefillEmail
    //         }))
    //     }
    // }, [prefillEmail, initialData])

    const [fieldErrors, setFieldErrors] = useState({})
    const [saving, setSaving]           = useState(false)
    const [error, setError]             = useState("")
    const [success, setSuccess]         = useState(false)

    // live validation helpers
    const setFieldError = (name, msg) => {
        setFieldErrors(prev => ({ ...prev, [name]: msg || undefined }))
    }

    const clearFieldError = (name) => {
        setFieldErrors(prev => {
            const next = { ...prev }
            delete next[name]
            return next
        })
    }

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target
        const newVal = type === "checkbox" ? checked : value

        setFormData(prev => ({ ...prev, [name]: newVal }))
        setError("")
        setSuccess(false)

        // ── Live validation ──────────────────────────────────────────────
        if (name === "registrationNumber") {
            const err = validateRegistrationNumber(value, formData.legalEntityType)
            err ? setFieldError(name, err) : clearFieldError(name)
        }

        if (name === "legalEntityType") {
            // re-validate reg number when entity type changes
            if (formData.registrationNumber) {
                const err = validateRegistrationNumber(
                    formData.registrationNumber, value
                )
                err
                    ? setFieldError("registrationNumber", err)
                    : clearFieldError("registrationNumber")
            }
            clearFieldError("legalEntityType")
        }

        if (name === "gstNumber") {
            const err = validateGST(value)
            err ? setFieldError(name, err) : clearFieldError(name)
        }

        if (name === "contactPersonEmail") {
            const err = validateEmail(value)
            err ? setFieldError(name, err) : clearFieldError(name)
        }

        if (name === "contactPersonMobile") {
            const err = validateMobile(value)
            err ? setFieldError(name, err) : clearFieldError(name)
        }
    }

    const handleFileChange = (e) => {
        const { name, files, multiple } = e.target

        if (multiple) {
            const fileArr = Array.from(files)
            const err     = validateFiles(fileArr)
            if (err) {
                setFieldError(name, err)
                e.target.value = ""
                return
            }
            clearFieldError(name)
            setFormData(prev => ({ ...prev, [name]: fileArr }))
        } else {
            const file = files[0]
            if (!file) return
            const err  = validateFile(file)
            if (err) {
                setFieldError(name, err)
                e.target.value = ""
                return
            }
            clearFieldError(name)
            setFormData(prev => ({ ...prev, [name]: file }))
        }
    }

    const validateAll = () => {
        const errors = {}

        if (!formData.organizationName?.trim()) {
            errors.organizationName = "Required"
        }
        if (!formData.legalEntityType) {
            errors.legalEntityType = "Required"
        }

        const regErr = validateRegistrationNumber(
            formData.registrationNumber,
            formData.legalEntityType
        )
        if (!formData.registrationNumber?.trim()) {
            errors.registrationNumber = "Required"
        } else if (regErr) {
            errors.registrationNumber = regErr
        }

        if (!formData.dateOfIncorporation) {
            errors.dateOfIncorporation = "Required"
        }

        const gstErr = validateGST(formData.gstNumber)
        if (gstErr) errors.gstNumber = gstErr

        if (!formData.registeredOfficeAddress?.trim()) {
            errors.registeredOfficeAddress = "Required"
        }

        if (!formData.contactPersonName?.trim()) {
            errors.contactPersonName = "Required"
        }

        const emailErr = validateEmail(formData.contactPersonEmail)
        if (emailErr) errors.contactPersonEmail = emailErr

        const mobileErr = validateMobile(formData.contactPersonMobile)
        if (mobileErr) errors.contactPersonMobile = mobileErr

        if (!formData.founderExperience?.trim()) {
            errors.founderExperience = "Required"
        }
        if (!formData.mentorNetworkAccess?.trim()) {
            errors.mentorNetworkAccess = "Required"
        }
        if (!formData.startupFrameworkApproach?.trim()) {
            errors.startupFrameworkApproach = "Required"
        }
        if (!formData.tier2Tier3Strategy?.trim()) {
            errors.tier2Tier3Strategy = "Required"
        }
        if (!formData.declarationAccuracy ||
            !formData.declarationSchemeUnderstanding) {
            errors.declarations = "Both declarations must be accepted"
        }

        return errors
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError("")
        setSuccess(false)

        const errors = validateAll()

        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors)
            setError("Please fix the errors below before submitting")
            window.scrollTo({ top: 0, behavior: "smooth" })
            return
        }

        setSaving(true)

        try {
            const res  = await fetch(apiUrl, {
                method,
                headers: { "Content-Type": "application/json" },
                body:    JSON.stringify({
                    ...formData,
                    // send file names for now (replace with actual upload URLs)
                    minimumViableProduct: formData.minimumViableProduct?.name || null,
                    legalEntityProof:     formData.legalEntityProof?.name || null,
                    pastEngagementDocuments: Array.isArray(
                        formData.pastEngagementDocuments
                    )
                        ? formData.pastEngagementDocuments.map(
                            f => f?.name || f
                          ).filter(Boolean)
                        : []
                })
            })

            const data = await res.json()

            if (res.ok) {
                setSuccess(true)
                setFieldErrors({})
                window.scrollTo({ top: 0, behavior: "smooth" })
                onSuccess?.(data.profile)
            } else {
                if (data.errors) {
                    setFieldErrors(data.errors)
                }
                setError(data.message || "Something went wrong")
                window.scrollTo({ top: 0, behavior: "smooth" })
            }
        } catch (err) {
            console.log(err)
            setError("Something went wrong. Please try again.")
        } finally {
            setSaving(false)
        }
    }

    // helper for input class
    const ic = (field) =>
        fieldErrors[field]
            ? errorInputClass + " border-red-400"
            : inputClass + " border-gray-200"

    const tc = (field) =>
        fieldErrors[field]
            ? errorTextareaClass
            : textareaClass

    // reg number placeholder based on entity type
    const regPlaceholder = formData.legalEntityType
        ? REG_PATTERNS[formData.legalEntityType]?.example || "Registration number"
        : "Select entity type first"

    const regLabel = formData.legalEntityType
        ? REG_PATTERNS[formData.legalEntityType]?.label || "Registration Number"
        : "Registration Number"

    const fileInputClass = `w-full px-3 py-2 border border-gray-200 rounded-lg
                            text-sm text-gray-500 file:mr-3 file:py-1 file:px-3
                            file:rounded-lg file:border-0 file:text-xs file:font-medium
                            file:bg-blue-50 file:text-blue-600 hover:file:bg-blue-100
                            cursor-pointer`

    const fileInputErrorClass = `w-full px-3 py-2 border border-red-400 rounded-lg
                                 text-sm text-gray-500 file:mr-3 file:py-1 file:px-3
                                 file:rounded-lg file:border-0 file:text-xs file:font-medium
                                 file:bg-red-50 file:text-red-600 cursor-pointer`

    return (
        <form onSubmit={handleSubmit} className="space-y-5">

            {/* Global error */}
            {error && (
                <div className="px-4 py-3 bg-red-50 border border-red-200
                                rounded-xl text-sm text-red-600 flex
                                items-center gap-2">
                    <svg className="w-4 h-4 flex-shrink-0" fill="none"
                        stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {error}
                </div>
            )}

            {success && (
                <div className="px-4 py-3 bg-green-50 border border-green-200
                                rounded-xl text-sm text-green-700 flex
                                items-center gap-2">
                    <svg className="w-4 h-4 flex-shrink-0" fill="none"
                        stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round"
                            strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Profile saved successfully!
                </div>
            )}

            {/* ── Organization Details ──────────────────────────────────── */}
            <Section title="Organization Details" color="bg-blue-50"
                icon={
                    <svg className="w-4 h-4 text-blue-600" fill="none"
                        stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14
                               0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1
                               m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>}>

                <Field label="Organization name" required fullWidth
                    error={fieldErrors.organizationName}>
                    <input name="organizationName" type="text"
                        placeholder="e.g. TechVentures Pvt Ltd"
                        value={formData.organizationName}
                        onChange={handleChange}
                        className={ic("organizationName")} />
                </Field>

                <Field label="Legal entity type" required
                    error={fieldErrors.legalEntityType}>
                    <select name="legalEntityType"
                        value={formData.legalEntityType}
                        onChange={handleChange}
                        className={ic("legalEntityType")}>
                        <option value="">Select legal entity</option>
                        <option value="Private Limited Company">
                            Private Limited Company
                        </option>
                        <option value="LLP">LLP</option>
                        <option value="Section 8 Company">Section 8 Company</option>
                        <option value="Society">Society</option>
                        <option value="Trust">Trust</option>
                        <option value="Partnership">Partnership</option>
                        <option value="Other">Other</option>
                    </select>
                </Field>

                <Field label={`${regLabel} (CIN/LLPIN/etc.)`} required
                    error={fieldErrors.registrationNumber}>
                    <input name="registrationNumber" type="text"
                        placeholder={regPlaceholder}
                        value={formData.registrationNumber}
                        onChange={handleChange}
                        className={ic("registrationNumber")} />
                    {formData.legalEntityType && !fieldErrors.registrationNumber && (
                        <p className="text-xs text-gray-400 mt-1">
                            Format: {REG_PATTERNS[formData.legalEntityType]?.example}
                        </p>
                    )}
                </Field>

                <Field label="Date of Incorporation / Registration" required
                    error={fieldErrors.dateOfIncorporation}>
                    <input name="dateOfIncorporation" type="date"
                        value={formData.dateOfIncorporation}
                        onChange={handleChange}
                        max={new Date().toISOString().split("T")[0]}
                        className={ic("dateOfIncorporation")} />
                </Field>

                <Field label="GST Number"
                    error={fieldErrors.gstNumber}>
                    <input name="gstNumber" type="text"
                        placeholder="e.g. 33AADCB2230M1ZV (optional)"
                        value={formData.gstNumber}
                        onChange={handleChange}
                        className={ic("gstNumber")} />
                    {!fieldErrors.gstNumber && (
                        <p className="text-xs text-gray-400 mt-1">
                            Format: 2 digits + 5 letters + 4 digits + 1 letter + 1 digit + Z + 1 char
                        </p>
                    )}
                </Field>

                <Field label="Registered Office Address in Tamil Nadu" required
                    fullWidth error={fieldErrors.registeredOfficeAddress}>
                    <textarea name="registeredOfficeAddress"
                        placeholder="Full registered office address"
                        value={formData.registeredOfficeAddress}
                        onChange={handleChange}
                        rows={3}
                        className={tc("registeredOfficeAddress")} />
                </Field>

            </Section>

            {/* ── Contact Person ────────────────────────────────────────── */}
            <Section title="Primary Contact Person" color="bg-purple-50"
                icon={
                    <svg className="w-4 h-4 text-purple-600" fill="none"
                        stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round"
                            strokeWidth={2}
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7
                               0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>}>

                <Field label="Contact person name" required
                    error={fieldErrors.contactPersonName}>
                    <input name="contactPersonName" type="text"
                        placeholder="Full name"
                        value={formData.contactPersonName}
                        onChange={handleChange}
                        className={ic("contactPersonName")} />
                </Field>

                <Field label="Designation" required
                    error={fieldErrors.contactPersonDesignation}>
                    <input name="contactPersonDesignation" type="text"
                        placeholder="e.g. CEO, Director"
                        value={formData.contactPersonDesignation}
                        onChange={handleChange}
                        className={ic("contactPersonDesignation")} />
                </Field>

                {/* ✅ Email pre-filled from VB account, editable */}
                <Field label="Email address" required
                    error={fieldErrors.contactPersonEmail}>
                    <input name="contactPersonEmail" type="email"
                        placeholder="contact@organization.com"
                        value={formData.contactPersonEmail}
                        onChange={handleChange}
                        className={ic("contactPersonEmail")} />
                    {prefillEmail && (
                        <p className="text-xs text-gray-400 mt-1">
                            Pre-filled from VB account email
                        </p>
                    )}
                </Field>

                {/* ✅ Mobile with Indian format validation */}
                <Field label="Mobile number" required
                    error={fieldErrors.contactPersonMobile}>
                    <input name="contactPersonMobile" type="tel"
                        placeholder="e.g. 9876543210"
                        value={formData.contactPersonMobile}
                        onChange={handleChange}
                        maxLength={13}
                        className={ic("contactPersonMobile")} />
                    {!fieldErrors.contactPersonMobile && (
                        <p className="text-xs text-gray-400 mt-1">
                            10-digit Indian mobile number
                        </p>
                    )}
                </Field>

            </Section>

            {/* ── Experience & Expertise ────────────────────────────────── */}
            <Section title="Experience & Expertise" color="bg-amber-50"
                icon={
                    <svg className="w-4 h-4 text-amber-600" fill="none"
                        stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946
                               -.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946
                               .806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806
                               1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806
                               1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0
                               00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42
                               0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42
                               3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42
                               3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                    </svg>}>

                <Field
                    label="Describe your founders/core team experience in startup building
                           (max 300 words)"
                    required fullWidth
                    error={fieldErrors.founderExperience}>
                    <textarea name="founderExperience"
                        placeholder="Describe your founding team's background..."
                        value={formData.founderExperience}
                        onChange={handleChange}
                        rows={5}
                        className={tc("founderExperience")} />
                    <p className="text-xs text-gray-400 mt-1">
                        {formData.founderExperience.split(/\s+/).filter(Boolean).length}
                        /300 words
                    </p>
                </Field>

                {/* ✅ MVP document upload with validation */}
                <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                        MVP journey outcomes document
                        <span className="text-red-500 ml-0.5">*</span>
                    </label>
                    <p className="text-xs text-gray-500 mb-2">
                        Upload case studies, startup outcomes, or proof of MVP support
                        (JPG, PNG, PDF, DOC, DOCX — max 5MB)
                    </p>
                    <input type="file"
                        accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                        name="minimumViableProduct"
                        onChange={handleFileChange}
                        className={fieldErrors.minimumViableProduct
                            ? fileInputErrorClass
                            : fileInputClass} />
                    {fieldErrors.minimumViableProduct && (
                        <p className="text-xs text-red-500 mt-1">
                            {fieldErrors.minimumViableProduct}
                        </p>
                    )}
                    {formData.minimumViableProduct &&
                     !fieldErrors.minimumViableProduct && (
                        <p className="text-xs text-green-600 mt-1">
                            ✓ {formData.minimumViableProduct?.name ||
                               formData.minimumViableProduct} selected
                        </p>
                    )}
                </div>

                <Field label="Mentor and expert network access" required fullWidth
                    error={fieldErrors.mentorNetworkAccess}>
                    <textarea name="mentorNetworkAccess"
                        placeholder="Describe your access to mentors, advisors and service providers..."
                        value={formData.mentorNetworkAccess}
                        onChange={handleChange}
                        rows={4}
                        className={tc("mentorNetworkAccess")} />
                </Field>

                <Field label="Startup framework approach" required fullWidth
                    error={fieldErrors.startupFrameworkApproach}>
                    <textarea name="startupFrameworkApproach"
                        placeholder="Describe your methodology for creating and supporting startups..."
                        value={formData.startupFrameworkApproach}
                        onChange={handleChange}
                        rows={4}
                        className={tc("startupFrameworkApproach")} />
                </Field>

            </Section>

            {/* ── Scheme Understanding & Commitment ────────────────────── */}
            <Section title="Scheme Understanding & Commitment" color="bg-green-50"
                icon={
                    <svg className="w-4 h-4 text-green-600" fill="none"
                        stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>}>

                <Field label="Do you understand the 25 DPIIT startup target in 12 months?"
                    required>
                    <select name="startupTargetUnderstanding"
                        value={formData.startupTargetUnderstanding}
                        onChange={handleChange}
                        className={ic("startupTargetUnderstanding")}
                        >
                        <option value="" disabled>
                            Select your answer
                        </option>     
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                    </select>
                </Field>

                <Field label="Are you committed to coordination with StartupTN Regional Hubs?"
                    required>
                    <select name="coordinationCommitment"
                        value={formData.coordinationCommitment}
                        onChange={handleChange}
                        className={ic("coordinationCommitment")}
                        >
                         <option value="" disabled>
                            Select your answer
                         </option>   
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                    </select>
                </Field>

                <Field label="Comments on target (if 'No' above)" fullWidth
                    error={fieldErrors.startupTargetComments}>
                    <textarea name="startupTargetComments"
                        placeholder="Any comments or questions about the startup target..."
                        value={formData.startupTargetComments}
                        onChange={handleChange}
                        rows={3}
                        className={tc("startupTargetComments")} />
                </Field>

                <Field label="Tier-2 / Tier-3 focus strategy" required fullWidth
                    error={fieldErrors.tier2Tier3Strategy}>
                    <textarea name="tier2Tier3Strategy"
                        placeholder="Describe your strategy for engaging startups in Tier-2 and Tier-3 cities..."
                        value={formData.tier2Tier3Strategy}
                        onChange={handleChange}
                        rows={5}
                        className={tc("tier2Tier3Strategy")} />
                </Field>

            </Section>

            {/* ── Document Upload ───────────────────────────────────────── */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-5">
                    <div className="w-7 h-7 rounded-lg bg-indigo-50 flex
                                    items-center justify-center">
                        <svg className="w-4 h-4 text-indigo-600" fill="none"
                            stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2
                                   0 012-2h5.586a1 1 0 01.707.293l5.414
                                   5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                    <h2 className="text-sm font-medium text-gray-900">
                        Upload Documents
                    </h2>
                </div>

                <div className="space-y-5">

                    {/* Legal entity proof */}
                    <div>
                        <label className="block text-xs font-medium
                                          text-gray-700 mb-1">
                            Legal Entity Registration Proof
                            <span className="text-xs text-gray-400 ml-1">
                                (Certificate of Incorporation, LLP Agreement, etc.)
                            </span>
                        </label>
                        <p className="text-xs text-gray-400 mb-2">
                            Accepted: JPG, PNG, PDF, DOC, DOCX — Max 5MB
                        </p>
                        <input type="file"
                            name="legalEntityProof"
                            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                            onChange={handleFileChange}
                            className={fieldErrors.legalEntityProof
                                ? fileInputErrorClass
                                : fileInputClass} />
                        {fieldErrors.legalEntityProof && (
                            <p className="text-xs text-red-500 mt-1">
                                {fieldErrors.legalEntityProof}
                            </p>
                        )}
                        {formData.legalEntityProof &&
                         !fieldErrors.legalEntityProof && (
                            <p className="text-xs text-green-600 mt-1">
                                ✓ {formData.legalEntityProof?.name ||
                                   formData.legalEntityProof}
                            </p>
                        )}
                    </div>

                    {/* Past engagement docs */}
                    <div>
                        <label className="block text-xs font-medium
                                          text-gray-700 mb-1">
                            Supporting Documents for Past Engagements
                            <span className="text-xs text-gray-400 ml-1">
                                (Multiple files allowed)
                            </span>
                        </label>
                        <p className="text-xs text-gray-400 mb-2">
                            Success stories, case studies, testimonials
                            — JPG, PNG, PDF, DOC, DOCX — Max 5MB each
                        </p>
                        <input type="file"
                            multiple
                            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                            name="pastEngagementDocuments"
                            onChange={handleFileChange}
                            className={fieldErrors.pastEngagementDocuments
                                ? fileInputErrorClass
                                : fileInputClass} />
                        {fieldErrors.pastEngagementDocuments && (
                            <p className="text-xs text-red-500 mt-1">
                                {fieldErrors.pastEngagementDocuments}
                            </p>
                        )}
                        {Array.isArray(formData.pastEngagementDocuments) &&
                         formData.pastEngagementDocuments.length > 0 &&
                         !fieldErrors.pastEngagementDocuments && (
                            <p className="text-xs text-green-600 mt-1">
                                ✓ {formData.pastEngagementDocuments.length} file(s) selected
                            </p>
                        )}
                    </div>

                </div>
            </div>

            {/* ── Declarations ──────────────────────────────────────────── */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-5">
                    <div className="w-7 h-7 rounded-lg bg-red-50 flex
                                    items-center justify-center">
                        <svg className="w-4 h-4 text-red-500" fill="none"
                            stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955
                                   0 0112 2.944a11.955 11.955 0 01-8.618 3.04
                                   A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9
                                   11.622 5.176-1.332 9-6.03 9-11.622
                                   0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                    </div>
                    <h2 className="text-sm font-medium text-gray-900">
                        Declarations
                    </h2>
                </div>

                <div className="space-y-4">

                    <label className="flex items-start gap-3 cursor-pointer group">
                        <input type="checkbox"
                            name="declarationAccuracy"
                            checked={formData.declarationAccuracy}
                            onChange={handleChange}
                            className="mt-0.5 w-4 h-4 rounded border-gray-300
                                       text-blue-600 focus:ring-blue-500" />
                        <span className="text-xs text-gray-700
                                         group-hover:text-gray-900">
                            We declare that all information provided is true and
                            accurate. We understand that any false claims may lead
                            to disqualification.
                        </span>
                    </label>

                    <label className="flex items-start gap-3 cursor-pointer group">
                        <input type="checkbox"
                            name="declarationSchemeUnderstanding"
                            checked={formData.declarationSchemeUnderstanding}
                            onChange={handleChange}
                            className="mt-0.5 w-4 h-4 rounded border-gray-300
                                       text-blue-600 focus:ring-blue-500" />
                        <span className="text-xs text-gray-700
                                         group-hover:text-gray-900">
                            We have read and understood the "Venture Builder" scheme
                            details including eligibility criteria, targets, incentives,
                            and monitoring framework.
                        </span>
                    </label>

                    {fieldErrors.declarations && (
                        <p className="text-xs text-red-500 flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none"
                                stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round"
                                    strokeLinejoin="round" strokeWidth={2}
                                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0
                                       9 9 0 0118 0z" />
                            </svg>
                            {fieldErrors.declarations}
                        </p>
                    )}

                </div>
            </div>

            {/* ── Submit ────────────────────────────────────────────────── */}
            <div className="flex items-center justify-between pb-8">
                <a href={backHref}
                    className="text-sm text-gray-500 hover:text-gray-700
                               transition-colors">
                    {backLabel}
                </a>
                <button type="submit" disabled={saving}
                    className="px-8 py-2.5 bg-blue-600 hover:bg-blue-700
                               disabled:bg-blue-400 disabled:cursor-not-allowed
                               text-white text-sm font-medium rounded-lg
                               transition-colors">
                    {saving ? "Saving..." : "Save profile"}
                </button>
            </div>

        </form>
    )
}