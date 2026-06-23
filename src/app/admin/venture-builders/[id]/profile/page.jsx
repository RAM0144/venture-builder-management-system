"use client"

import VBProfileForm from "@/components/VBProfileForm"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function AdminVBProfilePage() {

    const { id } =  useParams()
    const { data: session } = useSession()
    const router = useRouter()

    const [vbUser, setVbUser]       = useState(null)
    const [initialData, setInitialData] = useState(null)
    const [loading, setLoading]     = useState(true)
    const [toast, setToast]         = useState("")

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch(`/api/venture-builders/${id}/profile`)
                const data = await res.json()
                console.log("API response:", data)
                setVbUser(data.user)
                if(data.profile) setInitialData(data.profile)
            } catch (error) {
               console.log(error)
            } finally {
                setLoading(false)
             
            }
        }
        if (id) fetchData()
    },[id])

    const showToast = (msg) => {
        setToast(msg)
        setTimeout(() => setToast(""), 3000);
    }

    if(loading){
        return(
            <div className="min-h-screen bg-gray-50 flex items-center
                            justify-center">
                <div className="flex items-center gap-3">
                    <div className="w-4 h-4 border-2 border-blue-600
                                    border-t-transparent rounded-full
                                    animate-spin" />
                    <p className="text-sm text-gray-500">Loading...</p>
                </div>
            </div> 
        )
    }

    return(
        <div className="min-h-screen bg-gray-50">
         
         {toast && (
            <div className="fixed top-4 right-4 z-50 px-4 py-2.5
                                bg-gray-900 text-white text-sm rounded-lg
                                shadow-lg">
                 {toast} 
             </div>   
         )}
          
          <nav className="bg-white border-b border-gray-200 sticky top-0 z-10">
            <div className="max-w-4xl mx-auto px-5 flex items-center 
                            justify-between h-14">
                <div className="flex items-center gap-3">
                    <Link href={`/admin/venture-builders/${id}`}
                     className="text-gray-400 hover:text-gray-400"
                    >
                    <svg className="w-4 h-4" fill="none"
                                stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round"
                                    strokeLinejoin="round" strokeWidth={2}
                                    d="M15 19l-7-7 7-7" />
                            </svg>
                    </Link>
                    <span className="text-sm font-medium text-gray-900">
                        {initialData? "Edit" : "Create"} VB Profile
                    </span>
                </div>
                <div className="flex items-center">
                    {vbUser && (
                        <span className="text-sm text-gray-500 m-3">
                            {vbUser.name}
                        </span>
                    )}
                    <span className="text-xs bg-red-50 text-red-700 
                                     rounded-xl px-2.5 py-1 font-medium ">
                        Admin
                    </span>
                </div>
            </div>
          </nav>

          <div className="max-w-4xl mx-auto ps-5 py-8">
            <div className="mb-6">
                <h1 className="text-xl font-medium text-gray-900">
                 {initialData? "Edit" : "Create"}   Venture Builder Profile
                </h1>
                {vbUser && (
                    <p className="text-sm text-gray-500 mt-1">
                        {vbUser.name} { vbUser.email}
                    </p>
                )}
            </div>

            <VBProfileForm 
              apiUrl={`/api/venture-builders/${id}/profile`}
              method="POST"
              backHref={`/admin/venture-builders/${id}`}
              backLabel="← Back to VB details"
              prefillEmail={vbUser?.email || ""}
              initialData={initialData}
              isAdminView={true}
              onSuccess={() => showToast("Profile saved!")}
            />
          </div>

        </div>
    )
}

// "use client"

// import { useSession } from "next-auth/react"
// import Link from "next/link"
// import { useState } from "react"


// const initialState = {
//     organizationName: "",
//     legalEntityType: "",
//     registrationNumber: "",
//     dateOfIncorporation: "",
//     gstNumber: "",
//     registeredOfficeAddress: "",
//     contactPersonName: "",
//     contactPersonDesignation: "",
//     contactPersonEmail: "",
//     contactPersonMobile: "",
//     founderExperience: "",
//     minimumViableProduct: null,
//     mentorNetworkAccess: "",
//     startupFrameworkApproach: "",
//     startupTargetUnderstanding: "Yes",
//     startupTargetComments: "",
//     coordinationCommitment: "Yes",
//     tier2Tier3Strategy: "",
//     legalEntityProof: null,
//     pastEngagementDocuments: [],
//     declarationAccuracy: false,
//     declarationSchemeUnderstanding: false
// }

// // input style
// const inputClass = `w-full px-3 py-2.5 border border-gray-200 rounded-lg
//                     text-sm focus:outline-none focus:ring-2
//                     focus:ring-blue-500 focus:border-transparent
//                     placeholder:text-gray-400 bg-white`

// const textareaClass = `w-full px-3 py-2.5 border border-gray-200 rounded-lg
//                        text-sm focus:outline-none focus:ring-2
//                        focus:ring-blue-500 focus:border-transparent
//                        placeholder:text-gray-400 resize-none`

// // Section wrapper component
// function Section({ title, icon, color, children }) {
//     return (
//         <div className="bg-white border border-gray-200 rounded-2xl p-6">
//             <div className="flex items-center gap-2 mb-5">
//                 <div className={`w-7 h-7 rounded-lg ${color} flex
//                                 items-center justify-center`}>
//                     {icon}
//                 </div>
//                 <h2 className="text-base font-medium text-gray-900">
//                     {title}
//                 </h2>
//             </div>
//             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//                 {children}
//             </div>
//         </div>
//     )
// }

// // Field wrapper component
// function Field({ label, required, fullWidth, children }) {
//     return (
//         <div className={fullWidth ? "sm:col-span-2" : ""}>
//             <label className="block text-sm font-medium text-gray-700 mb-1">
//                 {label}
//                 {required && (
//                     <span className="text-red-500 ml-0.5">*</span>
//                 )}
//             </label>
//             {children}
//         </div>
//     )
// }


// export default function Profile() {

//     const { data: session, status } = useSession()

//     const [formData, setFormData] = useState(initialState)
//     const [loading, setLoading] = useState(true)
//     const [saving, setSaving] = useState(false)
//     const [error, setError] = useState("")
//     const [success, setSuccess] = useState(false)
//     const [isEdit, setIsEdit] = useState(false)

//     const handleChange = (e) => {
//         const { name, value, type, checked } = e.target
//         setFormData(prev => ({
//             ...prev,
//             [name]: type === "checkbox" ? checked : value
//         }))
//         setError("")
//         setSuccess(false)
//     }

//     const handleFileChange = () => {

//         const { name, files, multiple } = e.target

//         if (multiple) {
//             setFormData(prev => ({
//                 ...prev,
//                 [name]: Array.from(files)
//             }))
//         } else {
//             setFormData(prev => ({
//                 ...prev,
//                 [name]: files[0]
//             }))
//         }
//     }

//     // const handleSubmit = (e) => {
//     //     e.preventDefault()
//     //     setError("")
//     //     setSuccess(false)
//     //     try {

//     //     } catch (error) {
//     //         setError("Something went wrong. Please try again." || error)

//     //     }finally{
//     //         setSaving(false)
//     //     }
//     // }


//     // if(loading){
//     //     return(
//     //         <div className="min ">
//     //             <p>Loading profile...</p>
//     //         </div>
//     //     )
//     // }

//     return (
//         <div className="min-h-screen bg-gray-50">
//             <nav className="bg-white border border-gray-200 sticky top-0 z-10">
//                 <div className="max-w-4xl mx-auto flex items-center px-4 h-14 justify-between ">
//                     <div className="flex items-center gap-2">
//                         <Link href="/admin/venture-builders" className="text-gray-400 hover:text-gray-600
//                                        transition-colors">
//                             <svg className="w-5 h-5" fill="none"
//                                 stroke="currentColor" viewBox="0 0 24 24">
//                                 <path strokeLinecap="round"
//                                     strokeLinejoin="round" strokeWidth={2}
//                                     d="M15 19l-7-7 7-7" />
//                             </svg>
//                         </Link>
//                         <span className="font-medium text-gray-900">
//                             {isEdit ? "Edit Profile" : "Complete Profile"}
//                         </span>
//                     </div>
//                     <div className="flex items-center">
//                         <span className="text-xs text-gray-700 px-2.5 py-1 rounded-full 
//                                      sm:block font-medium">
//                             {session?.user?.role}
//                         </span>
//                         <span className="text-xs bg-blue-50 text-blue-700 px-2.5 py-1
//                                 rounded-full font-medium">
//                             Venture Builder Profile
//                         </span>
//                     </div>
//                 </div>
//             </nav>


//             <div className="max-w-4xl mx-auto px-4 py-8">
//                {/* header */}
//                <div className="mb-6">
//                  <h1 className="text-xl font-medium text-gray-900">
//                     Venture Builder Application Form
//                  </h1>
//                  <p className="text-sm text-gray-500 mt-1">
//                     Fill in your organization and experience details
//                  </p>
//                </div>

//                {/* Alerts */}
//                {error && (
//                  <div className="mb-5 px-4 py-3 bg-red-50 border border-red-200 
//                                  rounded-xl text-sm text-red-600 flex items-center gap-2">
//                      <svg className="w-4 h-4 flex-shrink-0" fill="none"
//                             stroke="currentColor" viewBox="0 0 24 24">
//                             <path strokeLinecap="round" strokeLinejoin="round"
//                                 strokeWidth={2}
//                                 d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0
//                                    9 9 0 0118 0z" />
//                         </svg>
                        
//                   </div>  
//                )}

//                {success && (
//                  <div className="mb-5 px-4 py-3 bg-green-50 border
//                                  border-green-200 rounded-xl text-sm
//                                  text-green-700 flex items-center gap-2">
//                     <svg className="w-4 h-4 flex-shrink-0" fill="none"
//                             stroke="currentColor" viewBox="0 0 24 24">
//                             <path strokeLinecap="round" strokeLinejoin="round"
//                                 strokeWidth={2} d="M5 13l4 4L19 7" />
//                         </svg>
//                         Profile {isEdit? "updated": "Submitted"} Successfully
//                  </div>   
//                )}

//                <form className="space-y-5">
//                   {/* ── Organization Details ──────────── */}
//                  <Section
//                    title="Organization Details"
//                    color="bg-blue-50"
//                    icon={
//                             <svg className="w-4 h-4 text-blue-600"
//                                 fill="none" stroke="currentColor"
//                                 viewBox="0 0 24 24">
//                                 <path strokeLinecap="round"
//                                     strokeLinejoin="round" strokeWidth={2}
//                                     d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2
//                                        2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9
//                                        7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1
//                                        1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
//                             </svg>
//                         }>
                 
//                    <Field label="Organization name" required fullWidth>
//                      <input name="organizationName" type="text"
//                             placeholder="e.g. TechVentures Pvt Ltd"
//                             value={formData.organizationName}
//                             onChange={handleChange}
//                             required
//                             className={inputClass}
//                      />
//                    </Field>
//                    <Field label="Legal entity type" required>
//                             <select name="legalEntityType"
//                                 value={formData.legalEntityType}
//                                 onChange={handleChange}
//                                 required
//                                 className={inputClass}>
//                                 <option value="">Select legal entity</option>
//                                 <option value="Private Limited Company">
//                                     Private Limited Company
//                                 </option>
//                                 <option value="LLP">LLP</option>
//                                 <option value="Section 8 Company">
//                                     Section 8 Company
//                                 </option>
//                                 <option value="Society">Society</option>
//                                 <option value="Trust">Trust</option>
//                                 <option value="Partnership">Partnership</option>
//                                 <option value="Other">Other</option>
//                             </select>
//                         </Field>

//                         <Field label="Registration Number (e.g., CIN, LLPIN, etc.)"
//                             required>
//                             <input name="registrationNumber" type="text"
//                                 placeholder="e.g. U72900TN2020PTC123456"
//                                 value={formData.registrationNumber}
//                                 onChange={handleChange}
//                                 required
//                                 className={inputClass} />
//                         </Field>

//                         <Field label="Date of Incorporation/Registration" required>
//                             <input name="dateOfIncorporation" type="date"
//                                 value={formData.dateOfIncorporation}
//                                 onChange={handleChange}
//                                 required
//                                 className={inputClass} />
//                         </Field>

//                         <Field label="GST Number (if applicable)">
//                             <input name="gstNumber" type="text"
//                                 placeholder="e.g. 33AAAAA0000A1Z5"
//                                 value={formData.gstNumber}
//                                 onChange={handleChange}
//                                 className={inputClass} />
//                         </Field>

//                         <Field label="Registered Office Address in Tamil Nadu"
//                             required fullWidth>
//                             <textarea name="registeredOfficeAddress"
//                                 placeholder="Full registered office address"
//                                 value={formData.registeredOfficeAddress}
//                                 onChange={handleChange}
//                                 rows={3}
//                                 required
//                                 className={textareaClass} />
//                         </Field>

//                     </Section>

//                     {/* ── Contact Person ────────────────── */}
//                     <Section
//                         title="Primary Contact Person"
//                         color="bg-purple-50"
//                         icon={
//                             <svg className="w-4 h-4 text-purple-600"
//                                 fill="none" stroke="currentColor"
//                                 viewBox="0 0 24 24">
//                                 <path strokeLinecap="round"
//                                     strokeLinejoin="round" strokeWidth={2}
//                                     d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12
//                                        14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
//                             </svg>
//                         }>

//                         <Field label="Contact person name" required>
//                             <input name="contactPersonName" type="text"
//                                 placeholder="Full name"
//                                 value={formData.contactPersonName}
//                                 onChange={handleChange}
//                                 required
//                                 className={inputClass} />
//                         </Field>

//                         <Field label="Designation" required>
//                             <input name="contactPersonDesignation"
//                                 type="text"
//                                 placeholder="e.g. CEO, Director"
//                                 value={formData.contactPersonDesignation}
//                                 onChange={handleChange}
//                                 required
//                                 className={inputClass} />
//                         </Field>

//                         <Field label="Email address" required>
//                             <input name="contactPersonEmail" type="email"
//                                 placeholder="contact@organization.com"
//                                 value={formData.contactPersonEmail}
//                                 onChange={handleChange}
//                                 required
//                                 className={inputClass} />
//                         </Field>

//                         <Field label="Mobile number" required>
//                             <input name="contactPersonMobile" type="tel"
//                                 placeholder="+91 98765 43210"
//                                 value={formData.contactPersonMobile}
//                                 onChange={handleChange}
//                                 required
//                                 className={inputClass} />
//                         </Field>

//                     </Section>

//                     {/* ── Experience & Expertise ────────── */}
//                     <Section
//                         title="Experience & Expertise"
//                         color="bg-amber-50"
//                         icon={
//                             <svg className="w-4 h-4 text-amber-600"
//                                 fill="none" stroke="currentColor"
//                                 viewBox="0 0 24 24">
//                                 <path strokeLinecap="round"
//                                     strokeLinejoin="round" strokeWidth={2}
//                                     d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42
//                                        0 001.946-.806 3.42 3.42 0 014.438 0
//                                        3.42 3.42 0 001.946.806 3.42 3.42 0
//                                        013.138 3.138 3.42 3.42 0 00.806
//                                        1.946 3.42 3.42 0 010 4.438 3.42
//                                        3.42 0 00-.806 1.946 3.42 3.42 0
//                                        01-3.138 3.138 3.42 3.42 0 00-1.946
//                                        .806 3.42 3.42 0 01-4.438 0 3.42
//                                        3.42 0 00-1.946-.806 3.42 3.42 0
//                                        01-3.138-3.138 3.42 3.42 0 00-.806
//                                        -1.946 3.42 3.42 0 010-4.438 3.42
//                                        3.42 0 00.806-1.946 3.42 3.42 0
//                                        013.138-3.138z" />
//                             </svg>
//                         }>

//                         <Field label="Describe the relevant experience and expertise of your founders/core 
//                         team in startup building, business/technology consulting, incubation, or entrepreneurship support. (Maximum 300 words)"
//                             required fullWidth>
//                             <textarea name="founderExperience"
//                                 placeholder="Describe your founding team's background, expertise and relevant experience..."
//                                 value={formData.founderExperience}
//                                 onChange={handleChange}
//                                 rows={5}
//                                 required
//                                 className={textareaClass} />
//                         </Field>



//                         <div>
//                             <label className="block text-sm font-medium text-gray-700 mb-1">
//                                 Provide documented outcomes and past engagements that substantiate your entity's proven ability to support idea-to-MVP (Minimum Viable Product) journeys.
//                                 <span className="text-red-500 ml-0.5">*</span>
//                             </label>

//                             <p className="text-xs text-gray-500 mb-2">
//                                 Upload supporting documents such as case studies, startup outcomes, testimonials, or proof of MVP support.
//                             </p>
//                             <input type="file"
//                                 accept=".pdf,.jpg,.jpeg,.png"
//                                 name="minimumViableProduct"
//                                 onChange={handleFileChange}
//                                 className="w-full px-3 py-2 border
//                                                border-gray-200 rounded-lg
//                                                text-sm text-gray-500
//                                                file:mr-3 file:py-1 file:px-3
//                                                file:rounded-lg file:border-0
//                                                file:text-xs file:font-medium
//                                                file:bg-blue-50
//                                                file:text-blue-600
//                                                hover:file:bg-blue-100
//                                                cursor-pointer" />
//                             {formData.minimumViableProduct && (
//                                 <p className="text-xs text-green-600 mt-1">
//                                     ✓ {formData.minimumViableProduct.name} selected
//                                 </p>
//                             )}
//                         </div>

//                         <Field label="Describe your access (in-house or through a reliable network)
//                          to mentors, domain experts, and essential service providers necessary to support early-stage ventures."
//                             required fullWidth>
//                             <textarea name="mentorNetworkAccess"
//                                 placeholder="Describe your access to mentors, advisors and service providers..."
//                                 value={formData.mentorNetworkAccess}
//                                 onChange={handleChange}
//                                 rows={4}
//                                 required
//                                 className={textareaClass} />
//                         </Field>

//                         <Field label="Briefly explain your approach to integrating ideas, talent, support services, mentoring, 
//                         and funding assistance under a unified operational framework for startup creation."
//                             required fullWidth>
//                             <textarea name="startupFrameworkApproach"
//                                 placeholder="Describe your methodology or framework for creating and supporting startups..."
//                                 value={formData.startupFrameworkApproach}
//                                 onChange={handleChange}
//                                 rows={4}
//                                 required
//                                 className={textareaClass} />
//                         </Field>

//                     </Section>

//                     {/* ── Understanding of Scheme & Commitment ────── */}
//                     <Section
//                         title="Understanding of Scheme & Commitment"
//                         color="bg-green-50"
//                         icon={
//                             <svg className="w-4 h-4 text-green-600"
//                                 fill="none" stroke="currentColor"
//                                 viewBox="0 0 24 24">
//                                 <path strokeLinecap="round"
//                                     strokeLinejoin="round" strokeWidth={2}
//                                     d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0
//                                        9 9 0 0118 0z" />
//                             </svg>
//                         }>

//                         <Field label="Do you understand the target of creating 25 DPIIT-registered startups within a 12-month period as mandated by the scheme?"
//                             required>
//                             <select name="startupTargetUnderstanding"
//                                 value={formData.startupTargetUnderstanding}
//                                 onChange={handleChange}
//                                 className={inputClass}>
//                                 <option value="Yes">Yes</option>
//                                 <option value="No">No</option>
//                             </select>
//                         </Field>

//                         <Field label="Are you committed to working in close coordination with StartupTN Regional Hubs and adhering to the prescribed Standard Operating Procedure (SOP) and reporting protocols?"
//                             required>
//                             <select name="coordinationCommitment"
//                                 value={formData.coordinationCommitment}
//                                 onChange={handleChange}
//                                 className={inputClass}>

//                                 <option value="Yes">Yes</option>
//                                 <option value="No">No</option>
//                             </select>
//                         </Field>

//                         <Field label="If you answered 'No' to the previous question, or if you have any comments/questions regarding the target, please elaborate here." fullWidth>
//                             <textarea name="startupTargetComments"
//                                 placeholder="Any comments or questions about the startup target..."
//                                 value={formData.startupTargetComments}
//                                 onChange={handleChange}
//                                 rows={3}
//                                 className={textareaClass} />
//                         </Field>

//                         <Field label="How do you plan to strategically focus on ventures emerging from Tier-2 and Tier-3 regions, and/or those led by women, SC/ST, or youth entrepreneurs, or addressing locally relevant challenges?"
//                             required fullWidth>
//                             <textarea name="tier2Tier3Strategy"
//                                 placeholder="Describe your strategy for engaging startups in Tier-2 and Tier-3 cities..."
//                                 value={formData.tier2Tier3Strategy}
//                                 onChange={handleChange}
//                                 rows={5}
//                                 required
//                                 className={textareaClass} />
//                         </Field>

//                     </Section>

//                     {/* ── Document Upload ───────────────── */}
//                     <div className="bg-white border border-gray-200
//                                     rounded-2xl p-6">
//                         <div className="flex items-center gap-2 mb-5">
//                             <div className="w-7 h-7 rounded-lg bg-indigo-50
//                                             flex items-center justify-center">
//                                 <svg className="w-4 h-4 text-indigo-600"
//                                     fill="none" stroke="currentColor"
//                                     viewBox="0 0 24 24">
//                                     <path strokeLinecap="round"
//                                         strokeLinejoin="round" strokeWidth={2}
//                                         d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2
//                                            -2V5a2 2 0 012-2h5.586a1 1 0
//                                            01.707.293l5.414 5.414a1 1 0
//                                            01.293.707V19a2 2 0 01-2 2z" />
//                                 </svg>
//                             </div>
//                             <h2 className="text-base font-medium text-gray-900">
//                                 Upload Documents
//                             </h2>
//                         </div>

//                         <div className="space-y-4">

//                             <div>
//                                 <label className="block text-sm font-medium
//                                                   text-gray-700 mb-1">
//                                     Upload Proof of Legal Entity Registration (e.g., Certificate of Incorporation, LLP Agreement, Trust Deed, Society Registration Certificate)

//                                 </label>
//                                 <input type="file"
//                                     name="legalEntityProof"
//                                     accept=".pdf,.jpg,.jpeg,.png"
//                                     onChange={handleFileChange}
//                                     className="w-full px-3 py-2 border
//                                                border-gray-200 rounded-lg
//                                                text-sm text-gray-500
//                                                file:mr-3 file:py-1 file:px-3
//                                                file:rounded-lg file:border-0
//                                                file:text-xs file:font-medium
//                                                file:bg-blue-50
//                                                file:text-blue-600
//                                                hover:file:bg-blue-100
//                                                cursor-pointer" />
//                                 {formData.legalEntityProof && (
//                                     <p className="text-xs text-green-600 mt-1">
//                                         ✓ {formData.legalEntityProof.name} uploaded
//                                     </p>
//                                 )}
//                             </div>

//                             <div>
//                                 <label className="block text-sm font-medium
//                                                   text-gray-700 mb-1">
//                                     Upload Supporting Documents for Past Engagements / Outcomes (e.g., success stories, case studies, client testimonials, links to supported startups, etc.).
//                                     <span className="text-xs text-gray-400 ml-1">
//                                         Multiple files allowed
//                                     </span>
//                                 </label>
//                                 <input type="file"
//                                     multiple
//                                     accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
//                                     name="pastEngagementDocuments"
//                                     onChange={handleFileChange}
//                                     className="w-full px-3 py-2 border
//                                                     border-gray-200 rounded-lg
//                                                     text-sm text-gray-500
//                                                     file:mr-3 file:py-1 file:px-3
//                                                     file:rounded-lg file:border-0
//                                                     file:text-xs file:font-medium
//                                                     file:bg-blue-50
//                                                     file:text-blue-600
//                                                     hover:file:bg-blue-100
//                                                     cursor-pointer" />
//                                 {formData.pastEngagementDocuments?.length > 0 && (
//                                     <p className="text-xs text-green-600 mt-1">
//                                         ✓ {formData.pastEngagementDocuments.length} file(s) selected
//                                     </p>
//                                 )}
//                             </div>


//                         </div>
//                     </div>

//                     {/* ── Declarations ──────────────────── */}
//                     <div className="bg-white border border-gray-200
//                                     rounded-2xl p-6">
//                         <div className="flex items-center gap-2 mb-5">
//                             <div className="w-7 h-7 rounded-lg bg-red-50
//                                             flex items-center justify-center">
//                                 <svg className="w-4 h-4 text-red-500"
//                                     fill="none" stroke="currentColor"
//                                     viewBox="0 0 24 24">
//                                     <path strokeLinecap="round"
//                                         strokeLinejoin="round" strokeWidth={2}
//                                         d="M9 12l2 2 4-4m5.618-4.016A11.955
//                                            11.955 0 0112 2.944a11.955 11.955
//                                            0 01-8.618 3.04A12.02 12.02 0 003
//                                            9c0 5.591 3.824 10.29 9 11.622
//                                            5.176-1.332 9-6.03 9-11.622
//                                            0-1.042-.133-2.052-.382-3.016z" />
//                                 </svg>
//                             </div>
//                             <h2 className="text-base font-medium text-gray-900">
//                                 Declarations
//                             </h2>
//                         </div>

//                         <div className="space-y-4">

//                             <label className="flex items-start gap-3
//                                               cursor-pointer group">
//                                 <input type="checkbox"
//                                     name="declarationAccuracy"
//                                     checked={formData.declarationAccuracy}
//                                     onChange={handleChange}
//                                     className="mt-0.5 w-4 h-4 rounded
//                                                border-gray-300 text-blue-600
//                                                focus:ring-blue-500 cursor-pointer" />
//                                 <span className="text-sm text-gray-700
//                                                  group-hover:text-gray-900">
//                                     Declaration: I/We hereby declare that all the information provided in this Expression of Interest is true and accurate to the best of my/our knowledge and belief. I/
//                                     We understand that any false claims or misrepresentation may lead to disqualification
//                                 </span>
//                             </label>

//                             <label className="flex items-start gap-3
//                                               cursor-pointer group">
//                                 <input type="checkbox"
//                                     name="declarationSchemeUnderstanding"
//                                     checked={formData.declarationSchemeUnderstanding}
//                                     onChange={handleChange}
//                                     className="mt-0.5 w-4 h-4 rounded
//                                                border-gray-300 text-blue-600
//                                                focus:ring-blue-500 cursor-pointer" />
//                                 <span className="text-sm text-gray-700
//                                                  group-hover:text-gray-900">
//                                     Declaration: I/We have read and understood the "Venture Builder" scheme details, including the eligibility criteria, execution targets, incentives, and monitoring framework
//                                     as outlined in the Expression of Interest and the Standard Operating Procedure (SOP).
//                                 </span>
//                             </label>

//                             {(!formData.declarationAccuracy ||
//                                 !formData.declarationSchemeUnderstanding) && (
//                                     <p className="text-xs text-amber-600">
//                                         Both declarations must be accepted to submit
//                                     </p>
//                                 )}

//                         </div>
//                     </div>

//                     {/* ── Submit Button ─────────────────── */}
//                     <div className="flex items-center justify-between pb-8">
//                         <Link href="/admin/venture-builders"
//                             className="text-sm text-gray-500
//                                        hover:text-gray-700 transition-colors">
//                             ← Back to dashboard
//                         </Link>

//                         <button type="submit" disabled={saving}
//                             className="px-8 py-2.5 bg-blue-600
//                                        hover:bg-blue-700
//                                        disabled:bg-blue-400
//                                        disabled:cursor-not-allowed
//                                        text-white text-sm font-medium
//                                        rounded-lg transition-colors">
//                             {saving
//                                 ? "Saving..."
//                                 : isEdit
//                                     ? "Update profile"
//                                     : "Submit application"
//                             }
//                         </button>
//                     </div>
//                </form>

//             </div>
//         </div>
//     )
// }