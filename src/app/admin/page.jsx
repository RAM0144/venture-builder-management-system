"use client"

import { useEffect, useState } from "react"
import { useSession, signOut } from "next-auth/react"
import { useRouter }           from "next/navigation"
import Link                    from "next/link"
import Image                   from "next/image"
import logo                    from "../assets/logo.png"
import "@tabler/icons-webfont/dist/tabler-icons.min.css"

export default function AdminDashboard() {

    const { data: session, status } = useSession()
    const router = useRouter()

    const [stats, setStats]   = useState({
        totalVBs:    0,
        activeVBs:   0,
        pendingSetup: 0
    })
    const [recentVBs, setRecentVBs]         = useState([])
    const [milestones, setMilestones]       = useState([])
    const [loading, setLoading]             = useState(true)

    useEffect(() => {
        if (status === "unauthenticated") router.push("/login")
        if (status === "authenticated" && session.user.role !== "ADMIN") {
            router.push("/VB-dashboard")
        }
    }, [status, session])

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [vbRes, milestoneRes] = await Promise.all([
                    fetch("/api/venture-builders"),
                    fetch("/api/milestones")
                ])

                const vbData        = await vbRes.json()
                const milestoneData = await milestoneRes.json()

                const vbs = vbData.users || []

                setStats({
                    totalVBs:    vbs.length,
                    activeVBs:   vbs.filter(v => !v.isFirstLogin).length,
                    pendingSetup: vbs.filter(v => v.isFirstLogin).length
                })

                // show 4 most recent
                setRecentVBs(vbs.slice(0, 4))
                setMilestones(milestoneData.milestones || [])

            } catch (error) {
                console.error(error)
            } finally {
                setLoading(false)
            }
        }
        if (session?.user?.role === "ADMIN") fetchData()
    }, [session])

    // milestone completion %
    const getMilestoneCompletion = (milestone) => {
        const assignments = milestone.assignments || []
        if (assignments.length === 0) return 0
        const target    = milestone.targetCount || 0
        if (target === 0) return 0
        const total     = assignments.reduce(
            (sum, a) => sum + (a.completedCount || 0), 0
        )
        return Math.min(
            100,
            Math.round((total / (target * assignments.length)) * 100)
        )
    }

    const MILESTONE_COLORS = [
        { num: "bg-blue-50 text-blue-800",   bar: "bg-blue-600" },
        { num: "bg-green-50 text-green-800", bar: "bg-green-600" },
        { num: "bg-amber-50 text-amber-800", bar: "bg-amber-500" },
        { num: "bg-gray-100 text-gray-500",  bar: "bg-gray-400" }
    ]

    const initials = (name = "") =>
        name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)

    if (status === "loading") return null

    return (
        <div className="min-h-screen bg-gray-50">

            {/* ── Navbar ───────────────────────────────────── */}
            <nav className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-6xl mx-auto px-5 flex items-center
                                justify-between" style={{ height: "52px" }}>

                    <div className="flex items-center gap-3">
                        {/* Logo */}
                        <Image src={logo} alt="Logo"
                            width={120} height={40} loading="eager"
                            className="w-auto h-auto" />

                        <span className="text-gray-300 text-sm hidden sm:block">
                            |
                        </span>

                        <span className="text-sm text-gray-500 hidden sm:block">
                            Admin dashboard
                        </span>

                        {/* <span className="text-xs font-medium bg-blue-50
                                         text-blue-800 border border-blue-200
                                         px-2.5 py-0.5 rounded-full">
                            Admin
                        </span> */}
                    </div>

                    <div className="flex items-center gap-3">
                        {/* <span className="text-sm text-gray-500 hidden sm:block">
                            {session?.user?.name}
                        </span> */}

                        <span className="text-sm font-medium text-blue-600 
                                         bg-blue-50 border border-blue-200
                                          px-2.5 py-0.5 rounded-lg">
                            {session.user.name}
                        </span>

                        {/* Avatar */}
                        {/* <div className="w-8 h-8 rounded-full bg-blue-600
                                        text-white text-xs font-medium flex
                                        items-center justify-center flex-shrink-0">
                            {initials(session?.user?.name)}
                        </div> */}

                        {/* Sign out */}
                        <button
                            onClick={() => signOut({ callbackUrl: "/login" })}
                            className="flex items-center gap-1.5 text-xs
                                       font-medium text-red-700 bg-red-50
                                       border border-red-200 px-3 py-1.5
                                       rounded-lg hover:bg-red-100
                                       transition-colors">
                            <i className="ti ti-logout" style={{ fontSize: "14px" }}
                               aria-hidden="true" />
                            Sign out
                        </button>
                    </div>
                </div>
            </nav>

            <div className="max-w-6xl mx-auto px-5 py-7">

                {/* ── Header ───────────────────────────────── */}
                <div className="mb-6">
                    <h1 className="text-xl font-medium text-gray-900">
                        Dashboard
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Manage venture builders, hubs and milestones
                    </p>
                </div>

                {/* ── Stats ────────────────────────────────── */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">

                    <div className="bg-white border border-gray-200
                                    rounded-xl p-5">
                        <div className="w-9 h-9 rounded-xl bg-blue-50 flex
                                        items-center justify-center mb-3">
                            <i className="ti ti-users text-blue-600"
                               style={{ fontSize: "18px" }} aria-hidden="true" />
                        </div>
                        <p className="text-xs text-gray-500 mb-1">Total VBs</p>
                        <p className="text-3xl font-medium text-gray-900">
                            {loading ? "—" : stats.totalVBs}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                            registered venture builders
                        </p>
                    </div>

                    <div className="bg-white border border-gray-200
                                    rounded-xl p-5">
                        <div className="w-9 h-9 rounded-xl bg-green-50 flex
                                        items-center justify-center mb-3">
                            <i className="ti ti-circle-check text-green-600"
                               style={{ fontSize: "18px" }} aria-hidden="true" />
                        </div>
                        <p className="text-xs text-gray-500 mb-1">Active VBs</p>
                        <p className="text-3xl font-medium text-green-600">
                            {loading ? "—" : stats.activeVBs}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                            accounts fully set up
                        </p>
                    </div>

                    <div className="bg-white border border-gray-200
                                    rounded-xl p-5">
                        <div className="w-9 h-9 rounded-xl bg-amber-50 flex
                                        items-center justify-center mb-3">
                            <i className="ti ti-clock text-amber-600"
                               style={{ fontSize: "18px" }} aria-hidden="true" />
                        </div>
                        <p className="text-xs text-gray-500 mb-1">Pending setup</p>
                        <p className="text-3xl font-medium text-amber-500">
                            {loading ? "—" : stats.pendingSetup}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                            invited but not logged in yet
                        </p>
                    </div>

                </div>

                {/* ── Quick Actions ─────────────────────────── */}
                <p className="text-sm font-medium text-gray-900 mb-3">
                    Quick actions
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">

                    {/* Add VB — primary */}
                    <Link href="/admin/venture-builders/create-VB"
                        className="flex items-center gap-4 bg-blue-600
                                   hover:bg-blue-700 rounded-xl p-5
                                   transition-colors group">
                        <div className="w-10 h-10 rounded-xl bg-white/20
                                        flex items-center justify-center
                                        flex-shrink-0">
                            <i className="ti ti-user-plus text-white"
                               style={{ fontSize: "20px" }} aria-hidden="true" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white">
                                Add venture builder
                            </p>
                            <p className="text-xs text-blue-200 mt-0.5">
                                Create account and send invite
                            </p>
                        </div>
                        <i className="ti ti-arrow-right text-blue-300"
                           style={{ fontSize: "16px" }} aria-hidden="true" />
                    </Link>

                    {/* View VBs */}
                    <Link href="/admin/venture-builders"
                        className="flex items-center gap-4 bg-white
                                   border border-gray-200 hover:border-blue-200
                                   hover:bg-blue-50 rounded-xl p-5
                                   transition-colors group">
                        <div className="w-10 h-10 rounded-xl bg-blue-50
                                        flex items-center justify-center
                                        flex-shrink-0">
                            <i className="ti ti-users text-blue-600"
                               style={{ fontSize: "20px" }} aria-hidden="true" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900">
                                View all VBs
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5">
                                Manage venture builders
                            </p>
                        </div>
                        <i className="ti ti-arrow-right text-gray-300
                                      group-hover:text-blue-400"
                           style={{ fontSize: "16px" }} aria-hidden="true" />
                    </Link>

                    {/* Manage Hubs */}
                    <Link href="/admin/hubs"
                        className="flex items-center gap-4 bg-white
                                   border border-gray-200 hover:border-purple-200
                                   hover:bg-purple-50 rounded-xl p-5
                                   transition-colors group">
                        <div className="w-10 h-10 rounded-xl flex items-center
                                        justify-center flex-shrink-0"
                            style={{ background: "#EEEDFE" }}>
                            <i className="ti ti-building"
                               style={{ fontSize: "20px", color: "#534AB7" }}
                               aria-hidden="true" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900">
                                Manage hubs
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5">
                                Create and assign VBs to hubs
                            </p>
                        </div>
                        <i className="ti ti-arrow-right text-gray-300
                                      group-hover:text-purple-400"
                           style={{ fontSize: "16px" }} aria-hidden="true" />
                    </Link>

                    {/* Milestones */}
                    <Link href="/admin/milestones"
                        className="flex items-center gap-4 bg-white
                                   border border-gray-200 hover:border-green-200
                                   hover:bg-green-50 rounded-xl p-5
                                   transition-colors group">
                        <div className="w-10 h-10 rounded-xl bg-green-50
                                        flex items-center justify-center
                                        flex-shrink-0">
                            <i className="ti ti-trophy text-green-600"
                               style={{ fontSize: "20px" }} aria-hidden="true" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900">
                                Milestones
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5">
                                Assign and track progress
                            </p>
                        </div>
                        <i className="ti ti-arrow-right text-gray-300
                                      group-hover:text-green-400"
                           style={{ fontSize: "16px" }} aria-hidden="true" />
                    </Link>

                </div>

                {/* ── Bottom row ────────────────────────────── */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

                    {/* Recent VBs */}
                    <div className="bg-white border border-gray-200 rounded-xl p-5">
                        <div className="flex items-center justify-between mb-4">
                            <p className="text-sm font-medium text-gray-900">
                                Recent VBs
                            </p>
                            <Link href="/admin/venture-builders"
                                className="text-xs text-blue-600
                                           hover:underline font-medium">
                                View all →
                            </Link>
                        </div>

                        {loading ? (
                            <div className="space-y-3">
                                {[...Array(3)].map((_, i) => (
                                    <div key={i}
                                        className="animate-pulse flex gap-3
                                                   items-center">
                                        <div className="w-8 h-8 bg-gray-200
                                                        rounded-full" />
                                        <div className="flex-1">
                                            <div className="h-3 bg-gray-200
                                                            rounded w-32 mb-1" />
                                            <div className="h-2.5 bg-gray-100
                                                            rounded w-44" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : recentVBs.length === 0 ? (
                            <p className="text-sm text-gray-400 text-center py-6">
                                No VBs yet
                            </p>
                        ) : (
                            <div className="space-y-1">
                                {recentVBs.map((vb) => (
                                    <Link key={vb.id}
                                        href={`/admin/venture-builders/${vb.id}`}
                                        className="flex items-center gap-3
                                                   py-2.5 border-b border-gray-100
                                                   last:border-0 hover:bg-gray-50
                                                   rounded-lg px-1 transition-colors">
                                        <div className="w-8 h-8 rounded-full
                                                        bg-blue-50 text-blue-700
                                                        text-xs font-medium flex
                                                        items-center justify-center
                                                        flex-shrink-0">
                                            {initials(vb.name)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium
                                                          text-gray-900 truncate">
                                                {vb.name}
                                            </p>
                                            <p className="text-xs text-gray-400
                                                          truncate">
                                                {vb.email}
                                            </p>
                                        </div>
                                        <span className={`text-xs font-medium
                                                         px-2 py-0.5 rounded-full
                                                         flex-shrink-0
                                                         ${vb.isFirstLogin
                                                ? "bg-amber-50 text-amber-800"
                                                : "bg-green-50 text-green-800"}`}>
                                            {vb.isFirstLogin ? "Pending" : "Active"}
                                        </span>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Milestone progress */}
                    <div className="bg-white border border-gray-200 rounded-xl p-5">
                        <div className="flex items-center justify-between mb-4">
                            <p className="text-sm font-medium text-gray-900">
                                Milestone progress
                            </p>
                            <Link href="/admin/milestones"
                                className="text-xs text-blue-600
                                           hover:underline font-medium">
                                View all →
                            </Link>
                        </div>

                        {loading ? (
                            <div className="space-y-4">
                                {[...Array(4)].map((_, i) => (
                                    <div key={i}
                                        className="animate-pulse">
                                        <div className="h-3 bg-gray-200
                                                        rounded w-40 mb-2" />
                                        <div className="h-1.5 bg-gray-100
                                                        rounded w-full" />
                                    </div>
                                ))}
                            </div>
                        ) : milestones.length === 0 ? (
                            <p className="text-sm text-gray-400 text-center py-6">
                                No milestones yet
                            </p>
                        ) : (
                            <div className="space-y-1">
                                {milestones.map((milestone, idx) => {
                                    const colors = MILESTONE_COLORS[idx] ||
                                                   MILESTONE_COLORS[3]
                                    const pct    = getMilestoneCompletion(milestone)

                                    return (
                                        <Link key={milestone.id}
                                            href={`/admin/milestones/${milestone.id}`}
                                            className="flex items-center gap-3
                                                       py-2.5 border-b border-gray-100
                                                       last:border-0 group">
                                            <div className={`w-7 h-7 rounded-lg
                                                            flex items-center
                                                            justify-center
                                                            flex-shrink-0 text-xs
                                                            font-medium
                                                            ${colors.num}`}>
                                                {milestone.orderNumber}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-medium
                                                              text-gray-700 mb-1.5
                                                              truncate
                                                              group-hover:text-blue-600">
                                                    {milestone.title}
                                                </p>
                                                <div className="flex items-center
                                                                gap-2">
                                                    <div className="flex-1
                                                                    bg-gray-100
                                                                    rounded-full
                                                                    h-1">
                                                        <div
                                                            className={`h-1 rounded-full
                                                                       transition-all
                                                                       ${pct === 100
                                                                ? "bg-green-500"
                                                                : colors.bar}`}
                                                            style={{ width: `${pct}%` }}
                                                        />
                                                    </div>
                                                    <span className={`text-xs
                                                                     font-medium
                                                                     flex-shrink-0
                                                                     w-8 text-right
                                                                     ${pct === 100
                                                            ? "text-green-600"
                                                            : "text-gray-500"}`}>
                                                        {pct}%
                                                    </span>
                                                </div>
                                            </div>
                                        </Link>
                                    )
                                })}
                            </div>
                        )}
                    </div>

                </div>

            </div>
        </div>
    )
}


// "use client"

// import { useEffect, useState } from "react"
// import { useSession, signOut } from "next-auth/react"
// import { useRouter } from "next/navigation"
// import Link from "next/link"
// import "@tabler/icons-webfont/dist/tabler-icons.min.css";

// //Admin Dashboard
// export default function AdminDashboard() {

//     const { data: session, status } = useSession()
//     const router = useRouter()

//     const [stats, setStats] = useState({
//         totalVBs: 0,
//         activeVBs: 0,
//         pendingSetup: 0
//     })
//     const [loading, setLoading] = useState(true)

//     useEffect(() => {
//         if (status === "unauthenticated") router.push("/login")
//         if (status === "authenticated" && session.user.role !== "ADMIN") {
//             router.push("/VB-dashboard")
//         }
//     }, [status, session])

//     useEffect(() => {
//         const fetchStats = async () => {
//             try {
//                 const res = await fetch("/api/venture-builders")
//                 const data = await res.json()
//                 const vbs = data.users || []

//                 setStats({
//                     totalVBs: vbs.length,
//                     activeVBs: vbs.filter(v => v.isActive).length,
//                     pendingSetup: vbs.filter(v => v.isFirstLogin).length
//                 })
//             } catch (error) {
//                 console.error(error)
//             } finally {
//                 setLoading(false)
//             }
//         }
//         if (session?.user?.role === "ADMIN") fetchStats()
//     }, [session])

//     if (status === "loading") return null

//     return (
//         <div className="min-h-screen bg-gray-50">

//             {/* Navbar */}
//             <nav className="bg-white border-b border-gray-200 sticky top-0 z-10">
//                 <div className="max-w-5xl mx-auto px-4 h-14 flex items-center
//                                 justify-between">
//                     <div className="flex items-center gap-2">
//                         <span className="font-medium text-gray-900">
//                             Admin Panel
//                         </span>
//                         <span className="text-xs bg-blue-50 text-blue-700
//                                          px-2 py-0.5 rounded-full font-medium">
//                             Admin
//                         </span>
//                     </div>
//                     <div className="flex items-center gap-3">
//                         <span className="text-sm text-gray-500 hidden sm:block">
//                             {session?.user?.name}
//                         </span>
//                         <button
//                             onClick={() => signOut({ callbackUrl: "/login" })}
//                             className="px-4 py-2 text-sm bg-red-50 text-red-600 
//                              border border-red-200 rounded-lg hover:bg-red-100 cursor-pointer">
//                             Sign out
//                         </button>
//                     </div>
//                 </div>
//             </nav>

//             <div className="max-w-5xl mx-auto px-4 py-8">

//                 {/* Header */}
//                 <div className="mb-6">
//                     <h1 className="text-xl font-medium text-gray-900">
//                         Dashboard
//                     </h1>
//                     <p className="text-sm text-gray-500 mt-1">
//                         Manage venture builders and track progress
//                     </p>
//                 </div>

//                 {/* Stats */}
//                 <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
//                     <div className="bg-white border border-gray-200 rounded-xl p-5">
//                         <p className="text-xs text-gray-500 mb-1">Total VBs</p>
//                         <p className="text-3xl font-medium text-gray-900">
//                             {loading ? "—" : stats.totalVBs}
//                         </p>
//                     </div>
//                     <div className="bg-white border border-gray-200 rounded-xl p-5">
//                         <p className="text-xs text-gray-500 mb-1">Active VBs</p>
//                         <p className="text-3xl font-medium text-gray-900">
//                             {loading ? "—" : stats.activeVBs}
//                         </p>
//                     </div>
//                     <div className="bg-white border border-gray-200 rounded-xl p-5">
//                         <p className="text-xs text-gray-500 mb-1">Pending setup</p>
//                         <p className="text-3xl font-medium text-amber-500">
//                             {loading ? "—" : stats.pendingSetup}
//                         </p>
//                         <p className="text-xs text-gray-400 mt-1">
//                             Invited but not logged in yet
//                         </p>
//                     </div>
//                 </div>

//                 {/* Quick actions */}
//                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
//                     <Link href="/admin/venture-builders/create-VB"
//                         className="bg-blue-600 hover:bg-blue-700 text-white
//                                    rounded-2xl p-5 transition-colors group">
//                         <div className="flex items-center gap-3">
//                             <div className="w-9 h-9 rounded-xl bg-white/20 flex
//                                             items-center justify-center">
//                                 <svg className="w-5 h-5" fill="none"
//                                     stroke="currentColor" viewBox="0 0 24 24">
//                                     <path strokeLinecap="round" strokeLinejoin="round"
//                                         strokeWidth={2}
//                                         d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
//                                 </svg>
//                             </div>
//                             <div>
//                                 <p className="font-medium">Add Venture Builder</p>
//                                 <p className="text-sm text-blue-100 mt-0.5">
//                                     Create account and send invite
//                                 </p>
//                             </div>
//                         </div>
//                     </Link>

//                     <Link href="/admin/venture-builders"
//                         className="bg-white border border-gray-200 hover:border-gray-300
//                                    rounded-2xl p-5 transition-colors group">
//                         <div className="flex items-center gap-3">
//                             <div className="w-9 h-9 rounded-xl bg-gray-100 flex
//                                             items-center justify-center">
//                                 <svg className="w-5 h-5 text-gray-600" fill="none"
//                                     stroke="currentColor" viewBox="0 0 24 24">
//                                     <path strokeLinecap="round" strokeLinejoin="round"
//                                         strokeWidth={2}
//                                         d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10
//                                            0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3
//                                            3 0 015.356-1.857M7 20v-2c0-.656.126-1.283
//                                            .356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3
//                                            3 0 11-6 0 3 3 0 016 0z" />
//                                 </svg>
//                             </div>
//                             <div>
//                                 <p className="font-medium text-gray-900">
//                                     View all VBs
//                                 </p>
//                                 <p className="text-sm text-gray-500 mt-0.5">
//                                     Manage venture builders
//                                 </p>
//                             </div>
//                         </div>
//                     </Link>


//                     <Link href="/admin/hubs"
//                         className="bg-white border border-gray-200 hover:border-gray-300
//                                   rounded-2xl p-5 transition-colors">
//                         <div className="flex items-center gap-3">
//                             <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center
//                                             justify-center">
//                                 <svg className="w-5 h-5 text-gray-600" fill="none"
//                                     stroke="currentColor" viewBox="0 0 24 24">
//                                     <path strokeLinecap="round" strokeLinejoin="round"
//                                         strokeWidth={2}
//                                         d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14
//                                         0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1
//                                         m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5
//                                         m-4 0h4" />
//                                 </svg>
//                             </div>
//                             <p className="font-medium text-gray-900">Manage Hubs</p>
//                             <p className="text-sm text-gray-500 mt-0.5">Create and assign VBs to hubs</p>
//                         </div>
//                     </Link>

//                     <Link href="/admin/milestones"
//                         className="bg-white border border-gray-200 hover:boder-gray-300
//                                   rounded-2xl p-5 transition-colors">
//                         <div className="flex items-center gap-3">
//                             <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center
//                                             justify-center">
//                                 <svg className="w-5 h-5 text-gray-600" fill="none"
//                                     stroke="currentColor" viewBox="0 0 24 24">
//                                     <path strokeLinecap="round" strokeLinejoin="round"
//                                         strokeWidth={2}
//                                         d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946
//                                         -.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946
//                                         .806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806
//                                         1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806
//                                         1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0
//                                         00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42
//                                         0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42
//                                         3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42
//                                         3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
//                                 </svg>
//                             </div>
//                             <p className="font-medium text-gray-900">Milestones</p>
//                             <p className="text-sm text-gray-500 mt-0.5">Assign milestones</p>
//                         </div>
//                     </Link>
//                 </div>

//             </div>
//         </div>
//     )
// }