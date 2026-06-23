"use client"

import { useSession } from "next-auth/react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"

export default function HubsListPage() {

    const { data: session, status } = useSession()
    const router = useRouter()

    const [hubs, setHubs]       = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch]   = useState("")
    const [deleting, setDeleting] = useState("")  // ✅ added
    const [toast, setToast]     = useState("")    // ✅ added

    useEffect(() => {
        if (status === "unauthenticated") router.push("/login")
    }, [status])

    useEffect(() => {
        const fetchHubs = async () => {
            try {
                const res  = await fetch("/api/hubs")
                const data = await res.json()
                setHubs(data.hubs || [])
            } catch (error) {
                console.log(error)
            } finally {
                setLoading(false)
            }
        }
        if (session?.user?.role === "ADMIN") fetchHubs()
    }, [session])

    const showToast = (msg) => {
        setToast(msg)
        setTimeout(() => setToast(""), 3000)
    }

    // ✅ handleDelete defined
    const handleDelete = async (hubId) => {
        if (!confirm("Delete this hub? All VB assignments will be removed.")) return
        setDeleting(hubId)

        try {
            const res = await fetch(`/api/hubs/${hubId}`, {
                method: "DELETE"
            })

            if (res.ok) {
                setHubs(hubs.filter(h => h.id !== hubId))
                showToast("Hub deleted")
            }
        } catch (error) {
            console.log(error)
        } finally {
            setDeleting("")
        }
    }

    const filtered = hubs.filter(hub =>
        hub.name.toLowerCase().includes(search.toLowerCase()) ||
        hub.location?.toLowerCase().includes(search.toLowerCase())
    )

    return (
        <div className="min-h-screen bg-gray-50">

            {/* Toast */}
            {toast && (
                <div className="fixed top-4 right-4 z-50 px-4 py-2.5
                                bg-gray-900 text-white text-sm rounded-lg
                                shadow-lg">
                    {toast}
                </div>
            )}

            {/* Navbar */}
            {/* ✅ sticky top-0 not top-10 */}
            <nav className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-5xl mx-auto px-4 h-14 flex items-center
                                justify-between">
                    <div className="flex items-center gap-2">
                        <Link href="/admin"
                            className="text-gray-400 hover:text-gray-600">
                            <svg className="w-5 h-5" fill="none"
                                stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round"
                                    strokeLinejoin="round" strokeWidth={2}
                                    d="M15 19l-7-7 7-7" />
                            </svg>
                        </Link>
                        <span className="font-medium text-gray-900">Hubs</span>
                    </div>
                    <Link href="/admin/hubs/create"
                        className="text-sm bg-blue-600 hover:bg-blue-700
                                   text-white px-4 py-1.5 rounded-lg
                                   transition-colors">
                        + Create Hub
                    </Link>
                </div>
            </nav>

            <div className="max-w-5xl mx-auto px-4 py-6">

                {/* Search */}
                <div className="relative mb-5">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2
                                    w-4 h-4 text-gray-400"
                        fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input type="text"
                        placeholder="Search hubs..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 border border-gray-200
                                   rounded-xl text-sm focus:outline-none
                                   focus:ring-2 focus:ring-blue-500
                                   placeholder:text-gray-400 bg-white" />
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
                        <p className="text-gray-500 text-sm mb-3">
                            {search ? "No hubs found" : "No hubs created yet"}
                        </p>
                        {!search && (
                            <Link href="/admin/hubs/create"
                                className="text-sm text-blue-600 font-medium
                                           hover:underline">
                                Create your first hub →
                            </Link>
                        )}
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filtered.map((hub) => (
                            <div key={hub.id}
                                className="bg-white border border-gray-200
                                           rounded-2xl p-5">

                                <div className="flex items-start justify-between
                                                gap-3 flex-wrap">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-medium text-gray-900">
                                                {hub.name}
                                            </h3>
                                            <span className={`text-xs px-2 py-0.5
                                                             rounded-full font-medium
                                                             ${hub.isActive
                                                    ? "bg-green-50 text-green-700"
                                                    : "bg-red-50 text-red-600"}`}>
                                                {hub.isActive ? "Active" : "Inactive"}
                                            </span>
                                        </div>
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
                                        <p className="text-xs text-gray-400 mt-2">
                                            {hub._count.assignments} VB
                                            {hub._count.assignments !== 1 ? "s" : ""}
                                            assigned
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <Link href={`/admin/hubs/${hub.id}`}
                                            className="text-sm text-blue-600
                                                       hover:underline font-medium">
                                            Manage
                                        </Link>
                                        {/* ✅ handleDelete now works */}
                                        <button
                                            onClick={() => handleDelete(hub.id)}
                                            disabled={deleting === hub.id}
                                            className="text-sm text-red-500
                                                       hover:text-red-700
                                                       disabled:opacity-50">
                                            {deleting === hub.id
                                                ? "Deleting..."
                                                : "Delete"}
                                        </button>
                                    </div>
                                </div>

                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

