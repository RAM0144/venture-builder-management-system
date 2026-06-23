"use client"
import { signOut, useSession } from "next-auth/react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"


export default function VbDetails(){

    const { id } = useParams()

    const { data: session, status } = useSession() 

    const [vb, setVb] = useState([])
    const [profile, setProfile] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
     

    useEffect(() => {
        const fetchVBDetails = async () => {
            
            try {
                const res = await fetch(`/api/venture-builders/${id}`)
                const data = await res.json()

                if (!res.ok) {
                setError(data.message || "VB not found")
                return
               }
                setVb(data.user)
                setProfile(data.profile)
                console.log(data.vb)
            } catch (error) {
                console.log(error)
                setError("Something went wrong")
            } finally {
                setLoading(false)
            }
        }
       if(id) fetchVBDetails()
    },[id])

    return (
        <div className="min-h-screen bg-gray-50">
          
           <nav className="bg-white border-b border-gray-200 sticky top-0 z-10">
            <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
             <div className="flex items-center gap-2">
                   <Link href="/admin/venture-builders"
                        className="text-gray-400 hover:text-gray-600">
                        <svg className="w-5 h-5" fill="none"
                            stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round"
                                strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </Link>
                 <span className="font-medium text-gray-900">VB Details</span>
                 <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 font-medium">Admin</span>
             </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-500 hidden sm:block ">
                    {session?.user?.name}
                </span>
                <button onClick={()=> signOut({ callbackUrl:"/login" })}
                    className="px-4 py-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded 
                    rounded-lg hover:bg-red-100 cursor-pointer"
                    >
                    Sign out
                </button>
              </div>
            </div>
           </nav>

           <div className="max-w-5xl mx-auto px-4 py-6">

            {/* header */}
             <div className="flex items-start justify-between gap-4 flex-wrap ">
               <div>
                   <h1 className="text-xl font-medium text-gray-900">
                    {vb?.name}
                  </h1>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {vb?.email}
                  </p>
               </div>
                {vb?.isFirstLogin ? (
                    <span className="text-xs px-3 py-1 bg-amber-50
                                     text-amber-700 rounded-full font-medium">
                        Pending setup
                    </span>
                ) : (
                    <span className="text-xs px-3 py-1 bg-green-50
                                     text-green-700 rounded-full font-medium">
                        Active
                    </span>
                )}
             </div>

              {/* Account info — from USER model */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-4">
                <h2 className="text-base font-medium text-gray-900 mb-4">
                    Account Information
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <InfoRow label="Full name"   value={vb?.name} />
                    <InfoRow label="Email"       value={vb?.email} />
                    <InfoRow label="Phone"       value={vb?.phone} />
                    <InfoRow label="Status"
                        value={vb?.isActive ? "Active" : "Inactive"} />
                    <InfoRow label="Account setup"
                        value={vb?.isFirstLogin
                            ? "Pending"
                            : "Completed"} />
                    <InfoRow label="Joined"
                        value={vb?.createdAt
                            ? new Date(vb.createdAt)
                                .toLocaleDateString("en-IN", {
                                    day: "numeric",
                                    month: "short",
                                    year: "numeric"
                                })
                            : null} />
                </div>
            </div>
            
             {/* No profile yet */}
            {!profile ? (
                <div className="bg-white border border-gray-200
                                rounded-2xl p-8 text-center">
                    <p className="text-gray-500 text-sm mb-4">
                        This VB has not filled their profile yet
                    </p>
                    <Link href={`/admin/venture-builders/${vb.id}/profile`}
                          className="inline-block bg-blue-600 text-white
                                     px-3 py-2 rounded-lg hover:bg-blue-700">
                        Create Profile
                    </Link>
                </div>
            ) : (
                <>
                    {/* Profile completion */}
                    <div className="bg-white border border-gray-200
                                    rounded-2xl p-5 mb-4">
                        <div className="flex justify-between mb-2">
                            <h2 className="font-medium text-gray-900">
                                Venture Builder Profile
                            </h2>
                            <Link href={`/admin/venture-builders/${vb.id}/profile`}
                            className="border border-gray-300 px-3 py-2 rounded-lg text-sm
                                       hover:bg-gray-50 text-green-500">
                                Edit Profile
                            </Link>
                        </div>                
                        <div className="flex items-center justify-between mb-2">
                            <p className="text-sm font-medium text-gray-700">
                                Profile completion
                            </p>
                            <p className="text-sm font-medium text-blue-600">
                                {profile.profileCompleted || 0}%
                            </p>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2">
                            <div
                                className="bg-blue-600 h-2 rounded-full transition-all"
                                style={{ width: `${profile.profileCompleted || 0}%` }}
                            />
                        </div>
                    </div>

                     <div>
                        <Link href="">
                        </Link>
                     </div>

                     {/* Organization — from VentureBuilderProfile model */}
                    <div className="bg-white border border-gray-200
                                    rounded-2xl p-6 mb-4">
                        <h2 className="text-base font-medium text-gray-900 mb-4">
                            Organization Details
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2
                                        lg:grid-cols-3 gap-4">
                            <InfoRow label="Organization name"
                                value={profile.organizationName} />
                            <InfoRow label="Legal entity"
                                value={profile.legalEntityType} />
                            <InfoRow label="Registration number"
                                value={profile.registrationNumber} />
                            <InfoRow label="GST number"
                                value={profile.gstNumber} />
                            <InfoRow label="Date of incorporation"
                                value={profile.dateOfIncorporation
                                    ? new Date(profile.dateOfIncorporation)
                                        .toLocaleDateString("en-IN", {
                                            day: "numeric",
                                            month: "short",
                                            year: "numeric"
                                        })
                                    : null} />
                            <InfoRow label="Office address"
                                value={profile.registeredOfficeAddress} />
                        </div>
                    </div>

                     {/* Contact */}
                    <div className="bg-white border border-gray-200
                                    rounded-2xl p-6 mb-4">
                        <h2 className="text-base font-medium text-gray-900 mb-4">
                            Contact Person
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2
                                        lg:grid-cols-3 gap-4">
                            <InfoRow label="Name"
                                value={profile.contactPersonName} />
                            <InfoRow label="Designation"
                                value={profile.contactPersonDesignation} />
                            <InfoRow label="Email"
                                value={profile.contactPersonEmail} />
                            <InfoRow label="Mobile"
                                value={profile.contactPersonMobile} />
                        </div>
                    </div>

                    {/* Experience */}
                    <div className="bg-white border border-gray-200
                                    rounded-2xl p-6 mb-4">
                        <h2 className="text-base font-medium text-gray-900 mb-4">
                            Experience & Expertise
                        </h2>
                        <div className="space-y-4">
                            <LongTextRow label="Founder experience"
                                value={profile.founderExperience} />
                            {/* ✅ correct field name from your model */}
                            <LongTextRow label="Minimum viable product"
                                value={profile.minimumViableProduct} />
                            <LongTextRow label="Mentor network access"
                                value={profile.mentorNetworkAccess} />
                            <LongTextRow label="Startup framework approach"
                                value={profile.startupFrameworkApproach} />
                        </div>
                    </div>

                    {/* Commitment */}
                    <div className="bg-white border border-gray-200
                                    rounded-2xl p-6 mb-4">
                        <h2 className="text-base font-medium text-gray-900 mb-4">
                            Commitment & Strategy
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2
                                        gap-4 mb-4">
                            <InfoRow label="DPIIT startup target"
                                value={profile.startupTargetUnderstanding} />
                            <InfoRow label="Coordination commitment"
                                value={profile.coordinationCommitment} />
                        </div>
                        {profile.startupTargetComments && (
                            <LongTextRow label="Comments"
                                value={profile.startupTargetComments} />
                        )}
                        <div className="mt-4">
                            <LongTextRow label="Tier-2 / Tier-3 strategy"
                                value={profile.tier2Tier3Strategy} />
                        </div>
                    </div>

                    {/* Declarations */}
                    <div className="bg-white border border-gray-200
                                    rounded-2xl p-6 mb-4">
                        <h2 className="text-base font-medium text-gray-900 mb-4">
                            Declarations
                        </h2>
                        <div className="space-y-3">
                            <DeclarationRow
                                label="Information is accurate"
                                value={profile.declarationAccuracy} />
                            <DeclarationRow
                                label="Understands VB scheme"
                                value={profile.declarationSchemeUnderstanding} />
                        </div>
                    </div>

                    {/* Documents */}
                    {profile.legalEntityProof && (
                        <div className="bg-white border border-gray-200
                                        rounded-2xl p-6">
                            <h2 className="text-base font-medium text-gray-900 mb-4">
                                Documents
                            </h2>
                            <a href={profile.legalEntityProof}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-blue-600 hover:underline
                                           flex items-center gap-1">
                                <svg className="w-4 h-4" fill="none"
                                    stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round"
                                        strokeLinejoin="round" strokeWidth={2}
                                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002
                                           2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0
                                           -6L10 14" />
                                </svg>
                                View legal entity proof
                            </a>
                        </div>
                    )}
                </>

            )}
           </div>
        </div>
    )
}

// ─── Helper Components ──────────────────────
function InfoRow({ label, value, fullWidth }) {
    return (
        <div className={fullWidth ? "sm:col-span-3" : ""}>
            <p className="text-xs text-gray-400 mb-0.5">{label}</p>
            <p className="text-sm font-medium text-gray-800">
                {value || "—"}
            </p>
        </div>
    )
}

function LongTextRow({ label, value }) {
    return (
        <div>
            <p className="text-xs text-gray-400 mb-1">{label}</p>
            <p className="text-sm text-gray-700 leading-relaxed
                          bg-gray-50 rounded-lg px-3 py-2 whitespace-pre-line">
                {value || "—"}
            </p>
        </div>
    )
}

function DeclarationRow({ label, value }) {
    return (
        <div className="flex items-center gap-2">
            <div className={`w-5 h-5 rounded flex items-center justify-center
                            flex-shrink-0
                            ${value ? "bg-green-100" : "bg-gray-100"}`}>
                {value ? (
                    <svg className="w-3 h-3 text-green-600" fill="none"
                        stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round"
                            strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                ) : (
                    <svg className="w-3 h-3 text-gray-400" fill="none"
                        stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round"
                            strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                )}
            </div>
            <p className="text-sm text-gray-700">{label}</p>
        </div>
    )
}