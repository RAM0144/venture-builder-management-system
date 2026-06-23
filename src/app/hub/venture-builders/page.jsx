"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
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

// All VBs in Hub
export default function HubVentureBuildersList() {

    const { data: session, status } = useSession()
    const router = useRouter()

    const [vbs, setVbs]         = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch]   = useState("")
    const [filter, setFilter]   = useState("ALL")

    useEffect(() => {
        if (status === "unauthenticated") router.push("/login")
    }, [status])

    useEffect(() => {
        const fetchVBs = async () => {
            try {
                const res  = await fetch("/api/hubs/vbs")
                const data = await res.json()
                setVbs(data.vbs || [])
            } catch (error) {
                console.log(error)
            } finally {
                setLoading(false)
            }
        }
        if (session?.user?.role === "HUB") fetchVBs()
    }, [session])

    const filtered = vbs.filter(vb => {
        const matchSearch =
            vb.name.toLowerCase().includes(search.toLowerCase()) ||
            vb.email.toLowerCase().includes(search.toLowerCase()) ||
            vb.ventureBuilderProfile?.organizationName
                ?.toLowerCase().includes(search.toLowerCase())

        if (filter === "ALL") return matchSearch
        if (filter === "ACTIVE") return matchSearch && !vb.isFirstLogin
        if (filter === "PENDING") return matchSearch && vb.isFirstLogin
        return matchSearch
    })

    return (
        <div className="min-h-screen bg-gray-50">

            <nav className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-5xl mx-auto px-4 h-14 flex items-center
                                justify-between">
                    <div className="flex items-center gap-2">
                        <Link href="/hub"
                            className="text-gray-400 hover:text-gray-600">
                            <svg className="w-5 h-5" fill="none"
                                stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round"
                                    strokeLinejoin="round" strokeWidth={2}
                                    d="M15 19l-7-7 7-7" />
                            </svg>
                        </Link>
                        <span className="font-medium text-gray-900">
                            Venture Builders
                        </span>
                    </div>
                    <span className="text-sm text-gray-500">
                        {vbs.length} total
                    </span>
                </div>
            </nav>

            <div className="max-w-5xl mx-auto px-4 py-6">

                {/* Search + Filter */}
                <div className="flex gap-3 mb-5 flex-wrap">
                    <div className="relative flex-1 min-w-0">
                        <svg className="absolute left-3 top-1/2 -translate-y-1/2
                                        w-4 h-4 text-gray-400"
                            fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round"
                                strokeWidth={2}
                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <input type="text"
                            placeholder="Search by name, email or organization..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full pl-9 pr-4 py-2.5 border border-gray-200
                                       rounded-xl text-sm focus:outline-none
                                       focus:ring-2 focus:ring-blue-500
                                       placeholder:text-gray-400 bg-white" />
                    </div>

                    <div className="flex gap-2">
                        {["ALL", "ACTIVE", "PENDING"].map(f => (
                            <button key={f}
                                onClick={() => setFilter(f)}
                                className={`px-3 py-2 rounded-lg text-xs
                                           font-medium transition-colors
                                           ${filter === f
                                    ? "bg-blue-600 text-white"
                                    : "bg-white border border-gray-200 text-gray-600"}`}>
                                {f === "ALL"     ? "All"
                                 : f === "ACTIVE" ? "Active"
                                 : "Pending setup"}
                            </button>
                        ))}
                    </div>
                </div>

                {/* List */}
                {loading ? (
                    <div className="space-y-3">
                        {[...Array(3)].map((_, i) => (
                            <div key={i}
                                className="animate-pulse bg-white border
                                           border-gray-200 rounded-2xl p-5">
                                <div className="h-4 bg-gray-200 rounded w-40 mb-2" />
                                <div className="h-3 bg-gray-200 rounded w-56" />
                            </div>
                        ))}
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-16 bg-white border
                                    border-gray-200 rounded-2xl">
                        <p className="text-sm text-gray-400">
                            {search ? "No results found" : "No VBs in this hub"}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filtered.map((vb) => (
                            <Link key={vb.id}
                                href={`/hub/venture-builders/${vb.id}`}
                                className="block bg-white border border-gray-200
                                           rounded-2xl p-5 hover:border-blue-300
                                           transition-all group">

                                <div className="flex items-start justify-between
                                                gap-3 mb-3">
                                    <div>
                                        <div className="flex items-center gap-2 mb-0.5">
                                            <h3 className="font-medium text-gray-900
                                                           group-hover:text-blue-600
                                                           transition-colors">
                                                {vb.name}
                                            </h3>
                                            {vb.isFirstLogin ? (
                                                <span className="text-xs px-2 py-0.5
                                                                 bg-amber-50
                                                                 text-amber-700
                                                                 rounded-full">
                                                    Pending setup
                                                </span>
                                            ) : (
                                                <span className="text-xs px-2 py-0.5
                                                                 bg-green-50
                                                                 text-green-700
                                                                 rounded-full">
                                                    Active
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-500">
                                            {vb.email}
                                        </p>
                                        {vb.ventureBuilderProfile
                                            ?.organizationName && (
                                            <p className="text-xs text-gray-400 mt-0.5">
                                                🏢 {vb.ventureBuilderProfile
                                                    .organizationName}
                                            </p>
                                        )}
                                    </div>

                                    <div className="text-right flex-shrink-0">
                                        <p className="text-xs text-gray-400 mb-1">
                                            Profile
                                        </p>
                                        <p className="text-sm font-medium text-gray-700">
                                            {vb.ventureBuilderProfile
                                                ?.profileCompleted || 0}%
                                        </p>
                                    </div>
                                </div>

                                {/* Milestone badges */}
                                {vb.milestoneAssignments?.length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                        {vb.milestoneAssignments.map(a => (
                                            <span key={a.id}
                                                className={`text-xs px-2 py-0.5
                                                           rounded-full font-medium
                                                           ${STATUS_COLORS[a.status]}`}>
                                                M{a.milestone.orderNumber}:{" "}
                                                {STATUS_LABELS[a.status]}
                                            </span>
                                        ))}
                                    </div>
                                )}

                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}