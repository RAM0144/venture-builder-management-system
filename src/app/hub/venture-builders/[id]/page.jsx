"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"

const STATUS_COLORS = {
    PENDING:     "bg-gray-100 text-gray-600",
    IN_PROGRESS: "bg-blue-50 text-blue-700",
    SUBMITTED:   "bg-amber-50 text-amber-700",
    APPROVED:    "bg-green-50 text-green-700",
    REJECTED:    "bg-red-50 text-red-600"
}

const STATUS_LABELS = {
    PENDING:     "Pending",
    IN_PROGRESS: "In Progress",
    SUBMITTED:   "Submitted",
    APPROVED:    "Approved",
    REJECTED:    "Rejected"
}

export default function HubVBDetailPage() {

    const { id }            = useParams()
    const { data: session } = useSession()
    const router            = useRouter()

    const [vb, setVb]           = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError]     = useState("")

    useEffect(() => {
        const fetchVB = async () => {
            try {
                // reuse the admin API — hub can view VB details
                const res  = await fetch(`/api/venture-builders/${id}`)
                const data = await res.json()

                if (!res.ok) {
                    setError(data.message)
                    return
                }

                // also get milestone assignments
                const milestonesRes  = await fetch(
                    `/api/hubs/vb-milestones/${id}`
                )
                const milestonesData = await milestonesRes.json()

                setVb({
                    ...data.user,
                    profile:      data.profile,
                    milestones:   milestonesData.assignments || []
                })

            } catch (error) {
                console.log(error)
                setError("Something went wrong")
            } finally {
                setLoading(false)
            }
        }

        if (id) fetchVB()
    }, [id])

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center
                            justify-center">
                <p className="text-sm text-gray-500">Loading VB details...</p>
            </div>
        )
    }

    if (error || !vb) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center
                            justify-center">
                <div className="text-center">
                    <p className="text-sm text-red-500 mb-3">
                        {error || "VB not found"}
                    </p>
                    <Link href="/hub/venture-builders"
                        className="text-sm text-blue-600 hover:underline">
                        ← Back
                    </Link>
                </div>
            </div>
        )
    }

    const profile  = vb.profile
    const approved = vb.milestones.filter(m => m.status === "APPROVED").length
    const total    = vb.milestones.length

    return (
        <div className="min-h-screen bg-gray-50">

            <nav className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-5xl mx-auto px-4 h-14 flex items-center
                                justify-between">
                    <div className="flex items-center gap-2">
                        <Link href="/hub/venture-builders"
                            className="text-gray-400 hover:text-gray-600">
                            <svg className="w-5 h-5" fill="none"
                                stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round"
                                    strokeLinejoin="round" strokeWidth={2}
                                    d="M15 19l-7-7 7-7" />
                            </svg>
                        </Link>
                        <span className="font-medium text-gray-900">
                            VB Details
                        </span>
                    </div>
                    <span className="text-xs bg-blue-50 text-blue-700
                                     px-2.5 py-1 rounded-full font-medium">
                        Hub View
                    </span>
                </div>
            </nav>

            <div className="max-w-5xl mx-auto px-4 py-6">

                {/* VB header */}
                <div className="bg-white border border-gray-200
                                rounded-2xl p-6 mb-4">
                    <div className="flex items-start justify-between gap-3 mb-4">
                        <div>
                            <h1 className="text-xl font-medium text-gray-900">
                                {vb.name}
                            </h1>
                            <p className="text-sm text-gray-500 mt-0.5">
                                {vb.email}
                            </p>
                            {vb.phone && (
                                <p className="text-sm text-gray-400 mt-0.5">
                                    {vb.phone}
                                </p>
                            )}
                        </div>
                        {vb.isFirstLogin ? (
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

                    {/* Stats row */}
                    <div className="grid grid-cols-3 gap-3">
                        <div className="bg-gray-50 rounded-xl p-3 text-center">
                            <p className="text-lg font-medium text-gray-900">
                                {profile?.profileCompleted || 0}%
                            </p>
                            <p className="text-xs text-gray-400 mt-0.5">
                                Profile
                            </p>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-3 text-center">
                            <p className="text-lg font-medium text-green-600">
                                {approved}
                            </p>
                            <p className="text-xs text-gray-400 mt-0.5">
                                Approved
                            </p>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-3 text-center">
                            <p className="text-lg font-medium text-gray-900">
                                {total}
                            </p>
                            <p className="text-xs text-gray-400 mt-0.5">
                                Milestones
                            </p>
                        </div>
                    </div>
                </div>

                {/* Organization details */}
                {profile && (
                    <div className="bg-white border border-gray-200
                                    rounded-2xl p-6 mb-4">
                        <h2 className="font-medium text-gray-900 mb-4">
                            Organization Details
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2
                                        lg:grid-cols-3 gap-4">
                            <InfoRow label="Organization"
                                value={profile.organizationName} />
                            <InfoRow label="Legal entity"
                                value={profile.legalEntityType} />
                            <InfoRow label="Registration"
                                value={profile.registrationNumber} />
                            <InfoRow label="Contact person"
                                value={profile.contactPersonName} />
                            <InfoRow label="Contact email"
                                value={profile.contactPersonEmail} />
                            <InfoRow label="Contact mobile"
                                value={profile.contactPersonMobile} />
                        </div>
                    </div>
                )}

                {/* Milestones */}
                <div className="bg-white border border-gray-200
                                rounded-2xl p-6">
                    <h2 className="font-medium text-gray-900 mb-4">
                        Milestone Progress
                    </h2>

                    {vb.milestones.length === 0 ? (
                        <p className="text-sm text-gray-400 text-center py-6">
                            No milestones assigned yet
                        </p>
                    ) : (
                        <div className="space-y-3">
                            {vb.milestones.map((assignment) => (
                                <div key={assignment.id}
                                    className="border border-gray-100
                                               rounded-xl p-4">

                                    <div className="flex items-start
                                                    justify-between gap-3 mb-2">
                                        <div className="flex items-start gap-3">
                                            <div className="w-8 h-8 rounded-lg
                                                            bg-blue-50 flex items-center
                                                            justify-center flex-shrink-0">
                                                <span className="text-blue-600
                                                                 font-medium text-xs">
                                                    {assignment.milestone
                                                        .orderNumber}
                                                </span>
                                            </div>
                                            <div>
                                                <p className="font-medium
                                                              text-gray-900 text-sm">
                                                    {assignment.milestone.title}
                                                </p>
                                                {assignment.deadline && (
                                                    <p className="text-xs
                                                                  text-amber-600 mt-0.5">
                                                        📅 {new Date(assignment.deadline)
                                                            .toLocaleDateString("en-IN", {
                                                                day: "numeric",
                                                                month: "short",
                                                                year: "numeric"
                                                            })}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        <span className={`text-xs px-2.5 py-1
                                                         rounded-full font-medium
                                                         flex-shrink-0
                                                         ${STATUS_COLORS[
                                            assignment.status]}`}>
                                            {STATUS_LABELS[assignment.status]}
                                        </span>
                                    </div>

                                    {/* Admin note */}
                                    {assignment.adminNote && (
                                        <div className="ml-11 px-3 py-2
                                                        bg-gray-50 rounded-lg">
                                            <p className="text-xs text-gray-500">
                                                Admin note:
                                            </p>
                                            <p className="text-xs text-gray-700 mt-0.5">
                                                {assignment.adminNote}
                                            </p>
                                        </div>
                                    )}

                                    {/* Documents */}
                                    {assignment.documents?.length > 0 && (
                                        <div className="ml-11 mt-2 flex
                                                        flex-wrap gap-2">
                                            {assignment.documents.map(doc => (
                                                <a key={doc.id}
                                                    href={doc.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center
                                                               gap-1 text-xs
                                                               text-blue-600
                                                               hover:underline
                                                               bg-blue-50 px-2.5
                                                               py-1 rounded-lg">
                                                    📎 {doc.name}
                                                </a>
                                            ))}
                                        </div>
                                    )}

                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </div>
        </div>
    )
}

// ─── Helper ─────────────────────────────────
function InfoRow({ label, value }) {
    return (
        <div>
            <p className="text-xs text-gray-400 mb-0.5">{label}</p>
            <p className="text-sm font-medium text-gray-800">
                {value || "—"}
            </p>
        </div>
    )
}