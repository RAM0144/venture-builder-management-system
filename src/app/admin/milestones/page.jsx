"use client"

import { useSession } from "next-auth/react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function AdminMilestonesPage() {

    const { data: session, status } = useSession()
    const router = useRouter()

    const [milestones, setMilestones] = useState([])
    const [loading, setLoading]       = useState(true)

    useEffect(() => {
        if (status === "unauthenticated") router.push("/login")
    }, [status])

    useEffect(() => {
        const fetchMilestones = async () => {
            try {
                const res  = await fetch("/api/milestones")
                const data = await res.json()
                setMilestones(data.milestones || [])
            } catch (error) {
                console.log(error)
            } finally {
                setLoading(false)
            }
        }
        if (session?.user?.role === "ADMIN") fetchMilestones()
    }, [session])

    //  Fixed — based on completedCount / targetCount
    const getCompletion = (milestone) => {

        // const total    = milestone._count?.assignments || 0
        // if (total === 0) return 0
        // const approved = milestone.assignments?.filter(
        //     a => a.status === "APPROVED"
        // ).length || 0
        // return Math.round((approved / total) * 100)

        const assignments = milestone.assignments || []
        if(assignments.length === 0) return 0

        const targetCount = milestone.targetCount || 0
        if(targetCount === 0) return 0

            // sum all completedCounts across all VBs
        const totalCompleted = assignments.reduce(
            (sum, a) => sum + (a.completedCount || 0), 0
        )

        // max possible = targetCount × number of VBs
        const maxPossible = targetCount * assignments.length

        return Math.round((totalCompleted / maxPossible) * 100)

    }

    const MILESTONE_COLORS = [
        { bg: "bg-blue-50",   text: "text-blue-600",   bar: "bg-blue-600",   pct: "text-blue-600" },
        { bg: "bg-green-50",  text: "text-green-600",  bar: "bg-green-600",  pct: "text-green-600" },
        { bg: "bg-amber-50",  text: "text-amber-600",  bar: "bg-amber-500",  pct: "text-amber-600" },
        { bg: "bg-gray-100",  text: "text-gray-500",   bar: "bg-gray-400",   pct: "text-gray-500" }
    ]

    return (
        <div className="min-h-screen bg-gray-50">

            <nav className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-5xl mx-auto px-5 h-13 flex items-center
                                gap-3" style={{ height: "52px" }}>
                    <Link href="/admin"
                        className="text-gray-400 hover:text-gray-600
                                   transition-colors">
                        <svg className="w-4 h-4" fill="none"
                            stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round"
                                strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </Link>
                    <span className="text-sm font-medium text-gray-900">
                        Milestones
                    </span>
                </div>
            </nav>

            <div className="max-w-5xl mx-auto px-5 py-7">

                <div className="mb-6">
                    <h1 className="text-xl font-medium text-gray-900">
                        StartupTN Milestones
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Assign milestones to venture builders and track progress
                    </p>
                </div>

                {loading ? (
                    <div className="space-y-3">
                        {[...Array(4)].map((_, i) => (
                            <div key={i}
                                className="animate-pulse bg-white border
                                           border-gray-200 rounded-xl p-5">
                                <div className="flex gap-3">
                                    <div className="w-9 h-9 bg-gray-200 rounded-lg" />
                                    <div className="flex-1">
                                        <div className="h-4 bg-gray-200 rounded
                                                        w-48 mb-2" />
                                        <div className="h-3 bg-gray-200 rounded w-72" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="space-y-3">
                        {milestones.map((milestone, index) => {
                            const colors     = MILESTONE_COLORS[index] ||
                                               MILESTONE_COLORS[3]
                            const completion = getCompletion(milestone)
                            const total      = milestone._count?.assignments || 0

                            return (
                                <Link key={milestone.id}
                                    href={`/admin/milestones/${milestone.id}`}
                                    className="flex items-center gap-4 bg-white
                                               border border-gray-200
                                               hover:border-blue-300 rounded-xl
                                               p-4 transition-all group">

                                    {/* Order number */}
                                    <div className={`w-10 h-10 rounded-xl flex
                                                    items-center justify-center
                                                    flex-shrink-0 text-sm
                                                    font-medium ${colors.bg}
                                                    ${colors.text}`}>
                                        {milestone.orderNumber}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center
                                                        justify-between gap-3 mb-1">
                                            <h3 className="text-sm font-medium
                                                           text-gray-900
                                                           group-hover:text-blue-600
                                                           transition-colors">
                                                {milestone.title}
                                            </h3>
                                            <span className={`text-xs font-medium
                                                             flex-shrink-0
                                                             ${ completion === 100 
                                                             ? "text-green-600" : colors.pct}`}>
                                                {completion}%
                                            </span>
                                        </div>

                                        {/* Checklist items preview */}
                                        <p className="text-xs text-gray-400
                                                      truncate mb-2">
                                            {milestone.description
                                                ?.trim()
                                                .split("\n")
                                                .filter(Boolean)
                                                .map(i => i.replace(
                                                    /^\d+\.\s*/, ""
                                                ))
                                                .join(" · ")}
                                        </p>

                                        {/* Progress bar */}
                                        <div className="w-full bg-gray-100
                                                        rounded-full h-1">
                                            <div
                                                className={`h-1 rounded-full
                                                           transition-all
                                                           ${completion === 100 ?
                                                            "bg-green-500": colors.bar}`}
                                                style={{ width: `${completion}%` }}
                                            />
                                        </div>

                                        <p className="text-xs text-gray-400 mt-1.5">
                                            Target: {milestone.targetCount} startups
                                            · {total} VB{total !== 1 ? "s" : ""}   assigned
                                        </p>
                                    </div>

                                    <svg className="w-4 h-4 text-gray-300
                                                    group-hover:text-blue-400
                                                    flex-shrink-0 transition-colors"
                                        fill="none" stroke="currentColor"
                                        viewBox="0 0 24 24">
                                        <path strokeLinecap="round"
                                            strokeLinejoin="round" strokeWidth={2}
                                            d="M9 5l7 7-7 7" />
                                    </svg>

                                </Link>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}


// Because getCompletion calculates based on assignment status 
// (APPROVED/PENDING) but your batch system uses completedCount 
// from documents — the milestone status stays IN_PROGRESS even
//  when target is reached until all batches are approved.
// The real completion % should be based on completedCount / targetCount
//  not assignment status.

// The Real Problem
// // ❌ Wrong — based on assignment STATUS
// // milestone.status = IN_PROGRESS even when 20/25 done
// const approved = milestone.assignments?.filter(
//     a => a.status === "APPROVED"  // ← this is whole milestone approval
// ).length || 0
// return Math.round((approved / total) * 100)  // shows 0% until fully done

// ✅ Correct — based on completedCount vs targetCount
// completedCount = sum of approved batches = 5/25 = 20%

// Milestone 1 — DPIIT Registration
//   targetCount = 25
//   3 VBs assigned

//   VB 1: completedCount = 5   (20%)
//   VB 2: completedCount = 25  (100% ✅)
//   VB 3: completedCount = 0   (0%)

//   totalCompleted = 5 + 25 + 0 = 30
//   maxPossible    = 25 × 3     = 75
//   completion     = 30/75      = 40%

//   AdminMilestoneDetailPage shows each VB individually:
//     VB1 → 5/25 = 20%
//     VB2 → 25/25 = 100%
//     VB3 → 0/25 = 0%

//   AdminMilestonesPage shows overall:
//     → 40% overall completion ✅
