"use client"

import { useEffect, useState } from "react"
import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
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

// ─── VB Card Component ──────────────────────
function VBCard({ vb }) {

    const milestones = vb.milestoneAssignments || []

    const approved   = milestones.filter(m => m.status === "APPROVED").length
    const submitted  = milestones.filter(m => m.status === "SUBMITTED").length
    const inProgress = milestones.filter(m => m.status === "IN_PROGRESS").length
    const pending    = milestones.filter(m => m.status === "PENDING").length

    const completion = vb.ventureBuilderProfile?.profileCompleted || 0

    return (
        <Link href={`/hub/venture-builders/${vb.id}`}
            className="block bg-white border border-gray-200 rounded-2xl p-5
                       hover:border-blue-300 transition-all group">

            <div className="flex items-start justify-between gap-3 mb-4">
                <div>
                    <div className="flex items-center gap-2 mb-0.5">
                        <h3 className="font-medium text-gray-900
                                       group-hover:text-blue-600
                                       transition-colors">
                            {vb.name}
                        </h3>
                        {vb.isFirstLogin ? (
                            <span className="text-xs px-2 py-0.5 bg-amber-50
                                             text-amber-700 rounded-full">
                                Pending setup
                            </span>
                        ) : (
                            <span className="text-xs px-2 py-0.5 bg-green-50
                                             text-green-700 rounded-full">
                                Active
                            </span>
                        )}
                    </div>
                    <p className="text-sm text-gray-500">{vb.email}</p>
                    {vb.ventureBuilderProfile?.organizationName && (
                        <p className="text-xs text-gray-400 mt-0.5">
                            🏢 {vb.ventureBuilderProfile.organizationName}
                        </p>
                    )}
                </div>

                {/* Profile completion */}
                <div className="text-right flex-shrink-0">
                    <p className="text-xs text-gray-400 mb-1">Profile</p>
                    <p className={`text-sm font-medium
                                  ${completion === 100
                            ? "text-green-600"
                            : "text-gray-700"}`}>
                        {completion}%
                    </p>
                </div>
            </div>

            {/* Profile completion bar */}
            <div className="w-full bg-gray-100 rounded-full h-1.5 mb-4">
                <div
                    className={`h-1.5 rounded-full transition-all
                                ${completion === 100
                            ? "bg-green-500"
                            : "bg-blue-600"}`}
                    style={{ width: `${completion}%` }}
                />
            </div>

            {/* Milestone status pills */}
            {milestones.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                    {milestones.map((assignment) => (
                        <div key={assignment.id}
                            className="flex items-center gap-1.5">
                            <span className="text-xs text-gray-400">
                                M{assignment.milestone.orderNumber}
                            </span>
                            <span className={`text-xs px-2 py-0.5 rounded-full
                                             font-medium
                                             ${STATUS_COLORS[assignment.status]}`}>
                                {STATUS_LABELS[assignment.status]}
                            </span>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-xs text-gray-400">
                    No milestones assigned yet
                </p>
            )}

        </Link>
    )
}

export default function HubDashboardPage() {

    const { data: session, status } = useSession()
    const router = useRouter()

    const [hub, setHub]         = useState(null)
    const [vbs, setVbs]         = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError]     = useState("")

    useEffect(() => {
        if (status === "unauthenticated") router.push("/login")
        if (status === "authenticated" && session.user.role !== "HUB") {
            router.push("/login")
        }
    }, [status, session])

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const [hubRes, vbsRes] = await Promise.all([
                    fetch("/api/hubs/dashboard"),
                    fetch("/api/hubs/vbs")
                ])

                const hubData = await hubRes.json()
                const vbsData = await vbsRes.json()

                if (hubRes.ok) setHub(hubData.hub)
                else setError(hubData.message)

                setVbs(vbsData.vbs || [])

            } catch (error) {
                console.log(error)
                setError("Something went wrong")
            } finally {
                setLoading(false)
            }
        }

        if (session?.user?.role === "HUB") fetchDashboard()
    }, [session])

    // calculate stats
    const getAllMilestoneAssignments = () => {
        return vbs.flatMap(vb => vb.milestoneAssignments || [])
    }

    const stats = {
        totalVBs:    vbs.length,
        activeVBs:   vbs.filter(vb => !vb.isFirstLogin).length,
        totalMilestones: getAllMilestoneAssignments().length,
        approved:    getAllMilestoneAssignments()
                        .filter(a => a.status === "APPROVED").length,
        submitted:   getAllMilestoneAssignments()
                        .filter(a => a.status === "SUBMITTED").length,
        inProgress:  getAllMilestoneAssignments()
                        .filter(a => a.status === "IN_PROGRESS").length
    }

    if (status === "loading" || loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center
                            justify-center">
                <p className="text-sm text-gray-500">Loading dashboard...</p>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50">

            {/* Navbar */}
            <nav className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-6xl mx-auto px-4 h-14 flex items-center
                                justify-between">
                    <div className="flex items-center gap-3">
                        <span className="font-medium text-gray-900">
                            Hub Dashboard
                        </span>
                        {hub && (
                            <span className="text-xs bg-blue-50 text-blue-700
                                             px-2.5 py-1 rounded-full font-medium">
                                {hub.name}
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-500 hidden sm:block">
                            {session?.user?.name}
                        </span>
                        <button
                            onClick={() => signOut({ callbackUrl: "/login" })}
                            className="px-4 py-1.5 text-sm text-red-600
                                       bg-red-50 border border-red-200
                                       rounded-lg hover:bg-red-100
                                       transition-colors">
                            Sign out
                        </button>
                    </div>
                </div>
            </nav>

            <div className="max-w-6xl mx-auto px-4 py-8">

                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-xl font-medium text-gray-900">
                        Welcome, {session?.user?.name?.split(" ")[0]} 👋
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        {hub
                            ? `Monitoring ${hub.name} - ${hub.location || ""}`
                            : "Hub overview"}
                    </p>
                </div>

                {/* Error */}
                {error && (
                    <div className="mb-5 px-4 py-3 bg-red-50 border
                                    border-red-200 rounded-xl text-sm
                                    text-red-600">
                        {error}
                    </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6
                                gap-3 mb-6">
                    {[
                        {
                            label: "Total VBs",
                            value: stats.totalVBs,
                            color: "text-gray-900"
                        },
                        {
                            label: "Active VBs",
                            value: stats.activeVBs,
                            color: "text-green-600"
                        },
                        {
                            label: "Milestones",
                            value: stats.totalMilestones,
                            color: "text-gray-900"
                        },
                        {
                            label: "Approved",
                            value: stats.approved,
                            color: "text-green-600"
                        },
                        {
                            label: "Submitted",
                            value: stats.submitted,
                            color: "text-amber-500"
                        },
                        {
                            label: "In Progress",
                            value: stats.inProgress,
                            color: "text-blue-600"
                        }
                    ].map(({ label, value, color }) => (
                        <div key={label}
                            className="bg-white border border-gray-200
                                       rounded-xl p-4 text-center">
                            <p className={`text-2xl font-medium ${color}`}>
                                {value}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                                {label}
                            </p>
                        </div>
                    ))}
                </div>

                {/* Hub info */}
                {hub && (
                    <div className="bg-white border border-gray-200
                                    rounded-2xl p-5 mb-6">
                        <div className="flex items-start justify-between gap-3">
                            <div>
                                <h2 className="font-medium text-gray-900">
                                    {hub.name}
                                </h2>
                                {hub.location && (
                                    <p className="text-sm text-gray-500 mt-0.5">
                                        📍 {hub.location}
                                    </p>
                                )}
                                {hub.description && (
                                    <p className="text-sm text-gray-400 mt-1">
                                        {hub.description}
                                    </p>
                                )}
                            </div>
                            <span className={`text-xs px-3 py-1 rounded-full
                                             font-medium flex-shrink-0
                                             ${hub.isActive
                                    ? "bg-green-50 text-green-700"
                                    : "bg-red-50 text-red-600"}`}>
                                {hub.isActive ? "Active" : "Inactive"}
                            </span>
                        </div>
                    </div>
                )}

                {/* VBs overview */}
                <div className="flex items-center justify-between mb-4">
                    <h2 className="font-medium text-gray-900">
                        Venture Builders
                        <span className="text-sm text-gray-400
                                         font-normal ml-2">
                            ({vbs.length})
                        </span>
                    </h2>
                    <Link href="/hub/venture-builders"
                        className="text-sm text-blue-600 hover:underline
                                   font-medium">
                        View all →
                    </Link>
                </div>

                {vbs.length === 0 ? (
                    <div className="text-center py-12 bg-white border
                                    border-gray-200 rounded-2xl">
                        <p className="text-sm text-gray-400">
                            No venture builders assigned to this hub yet
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {vbs.map((vb) => (
                            <VBCard key={vb.id} vb={vb} />
                        ))}
                    </div>
                )}

            </div>
        </div>
    )
}

