"use client"

import { useSession } from "next-auth/react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function ManageHubPage() {

    const { id }            = useParams()
    const { data: session } = useSession()
    const router            = useRouter()

    const [hub, setHub]               = useState(null)
    const [allVBs, setAllVBs]         = useState([])
    const [loading, setLoading]       = useState(true)
    const [assigning, setAssigning]   = useState(false)
    const [removing, setRemoving]     = useState("")  // ✅ used in handleRemove
    const [error, setError]           = useState("")
    const [toast, setToast]           = useState("")
    const [showAssign, setShowAssign] = useState(false)
    const [selectedVB, setSelectedVB] = useState("")

    const [editMode, setEditMode] = useState(false)
    const [editData, setEditData] = useState({
        name: "", description: "", location: ""
    })

    const showToast = (msg) => {
        setToast(msg)
        setTimeout(() => setToast(""), 3000)
    }

    useEffect(() => {
        const fetchHub = async () => {
            try {
                const res  = await fetch(`/api/hubs/${id}`)
                const data = await res.json()

                if (!res.ok) {
                    router.push("/admin/hubs")
                    return
                }

                setHub(data.hub)
                setEditData({
                    name:        data.hub.name,
                    description: data.hub.description || "",
                    location:    data.hub.location || ""
                })
            } catch (error) {
                console.log(error)
            } finally {
                setLoading(false)
            }
        }

        const fetchAllVBs = async () => {
            try {
                const res  = await fetch("/api/venture-builders")
                const data = await res.json()
                setAllVBs(data.users || [])
            } catch (error) {
                console.log(error)
            }
        }

        if (id) {
            fetchHub()
            fetchAllVBs()
        }
    }, [id])

    const assignedIds   = hub?.assignments?.map(a => a.user.id) || []
    const unassignedVBs = allVBs.filter(vb => !assignedIds.includes(vb.id))

    const handleAssign = async () => {
        if (!selectedVB) return
        setAssigning(true)
        setError("")

        try {
            const res = await fetch(`/api/hubs/${id}/assign`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId: selectedVB })
            })

            const data = await res.json()

            if (res.ok) {
                const hubRes  = await fetch(`/api/hubs/${id}`)
                const hubData = await hubRes.json()
                setHub(hubData.hub)
                setSelectedVB("")
                setShowAssign(false)
                showToast("VB assigned successfully!")
            } else {
                setError(data.message || "Something went wrong")
            }
        } catch (error) {
            setError("Something went wrong")
        } finally {
            setAssigning(false)
        }
    }

    // ✅ handleRemove defined
    const handleRemove = async (userId) => {
        if (!confirm("Remove this VB from the hub?")) return
        setRemoving(userId)

        try {
            const res = await fetch(`/api/hubs/${id}/assign`, {
                method: "DELETE",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId })
            })

            if (res.ok) {
                setHub({
                    ...hub,
                    assignments: hub.assignments.filter(
                        a => a.user.id !== userId
                    )
                })
                showToast("VB removed from hub")
            }
        } catch (error) {
            console.log(error)
        } finally {
            setRemoving("")
        }
    }

    const handleEditSave = async () => {
        try {
            const res = await fetch(`/api/hubs/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(editData)
            })

            const data = await res.json()

            if (res.ok) {
                setHub({ ...hub, ...editData })
                setEditMode(false)
                showToast("Hub updated!")
            } else {
                setError(data.message)
            }
        } catch (error) {
            console.log(error)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center
                            justify-center">
                <p className="text-sm text-gray-500">Loading hub...</p>
            </div>
        )
    }

    return (
        // ✅ bg-gray-50 not bg-gray-200
        <div className="min-h-screen bg-gray-50">

            {/* ✅ right-4 not rigth-4, added text-white */}
            {toast && (
                <div className="fixed top-4 right-4 z-50 px-4 py-2.5
                                bg-gray-900 text-white text-sm rounded-lg
                                shadow-lg">
                    {toast}
                </div>
            )}

            {/* ✅ border-b not border */}
            <nav className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-5xl mx-auto px-4 h-14 flex items-center
                                justify-between">
                    <div className="flex items-center gap-2">
                        <Link href="/admin/hubs"
                            className="text-gray-400 hover:text-gray-600">
                            <svg className="w-5 h-5" fill="none"
                                stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round"
                                    strokeLinejoin="round" strokeWidth={2}
                                    d="M15 19l-7-7 7-7" />
                            </svg>
                        </Link>
                        <span className="font-medium text-gray-900">
                            Manage Hub
                        </span>
                    </div>
                    <button onClick={() => setEditMode(!editMode)}
                        className="text-sm text-blue-600 hover:underline
                                   font-medium">
                        {editMode ? "Cancel" : "Edit hub"}
                    </button>
                </div>
            </nav>

            <div className="max-w-5xl mx-auto px-4 py-6">

                {/* Hub info / edit */}
                <div className="bg-white border border-gray-200
                                rounded-2xl p-6 mb-5">

                    {editMode ? (
                        <div className="space-y-4">
                            <h2 className="font-medium text-gray-900 mb-4">
                                Edit hub details
                            </h2>

                            <div>
                                <label className="block text-sm font-medium
                                                  text-gray-700 mb-1">
                                    Hub name
                                </label>
                                <input type="text"
                                    value={editData.name}
                                    onChange={(e) => setEditData({
                                        ...editData, name: e.target.value
                                    })}
                                    className="w-full px-3 py-2 border
                                               border-gray-200 rounded-lg
                                               text-sm focus:outline-none
                                               focus:ring-2 focus:ring-blue-500" />
                            </div>

                            <div>
                                <label className="block text-sm font-medium
                                                  text-gray-700 mb-1">
                                    Location
                                </label>
                                <input type="text"
                                    value={editData.location}
                                    onChange={(e) => setEditData({
                                        ...editData, location: e.target.value
                                    })}
                                    className="w-full px-3 py-2 border
                                               border-gray-200 rounded-lg
                                               text-sm focus:outline-none
                                               focus:ring-2 focus:ring-blue-500" />
                            </div>

                            <div>
                                <label className="block text-sm font-medium
                                                  text-gray-700 mb-1">
                                    Description
                                </label>
                                <textarea
                                    value={editData.description}
                                    onChange={(e) => setEditData({
                                        ...editData, description: e.target.value
                                    })}
                                    rows={3}
                                    className="w-full px-3 py-2 border
                                               border-gray-200 rounded-lg
                                               text-sm focus:outline-none
                                               focus:ring-2 focus:ring-blue-500
                                               resize-none" />
                            </div>

                            <div className="flex gap-3">
                                <button onClick={handleEditSave}
                                    className="px-5 py-2 bg-blue-600
                                               hover:bg-blue-700 text-white
                                               text-sm font-medium rounded-lg
                                               transition-colors">
                                    Save changes
                                </button>
                                <button onClick={() => setEditMode(false)}
                                    className="px-5 py-2 border border-gray-200
                                               text-gray-600 text-sm rounded-lg
                                               hover:bg-gray-50 transition-colors">
                                    Cancel
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div>
                            <div className="flex items-start justify-between
                                            gap-3 mb-3">
                                <div>
                                    <h1 className="text-xl font-medium
                                                   text-gray-900">
                                        {hub.name}
                                    </h1>
                                    {hub.location && (
                                        <p className="text-sm text-gray-500 mt-1">
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

                            <div className="flex gap-4 text-sm text-gray-500">
                                <span>
                                    {hub.assignments?.length || 0} VB
                                    {hub.assignments?.length !== 1 ? "s" : ""}
                                    assigned
                                </span>
                                <span>
                                    Created {new Date(hub.createdAt)
                                        .toLocaleDateString("en-IN", {
                                            day: "numeric",
                                            month: "short",
                                            year: "numeric"
                                        })}
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Assign VB section */}
                <div className="bg-white border border-gray-200
                                rounded-2xl p-6 mb-5">

                    <div className="flex items-center justify-between mb-4">
                        <h2 className="font-medium text-gray-900">
                            Assigned Venture Builders
                            <span className="text-sm text-gray-400
                                             font-normal ml-2">
                                ({hub.assignments?.length || 0})
                            </span>
                        </h2>
                        <button
                            onClick={() => setShowAssign(!showAssign)}
                            className="text-sm bg-blue-600 hover:bg-blue-700
                                       text-white px-4 py-1.5 rounded-lg
                                       transition-colors">
                            + Assign VB
                        </button>
                    </div>

                    {/* Assign dropdown */}
                    {showAssign && (
                        <div className="mb-4 p-4 bg-gray-50 rounded-xl
                                        border border-gray-200">
                            <p className="text-sm font-medium text-gray-700 mb-3">
                                Select a VB to assign
                            </p>

                            {error && (
                                <p className="text-xs text-red-500 mb-2">
                                    {error}
                                </p>
                            )}

                            {unassignedVBs.length === 0 ? (
                                <p className="text-sm text-gray-400">
                                    All VBs are already assigned to this hub
                                </p>
                            ) : (
                                <div className="flex gap-2">
                                    <select
                                        value={selectedVB}
                                        onChange={(e) =>
                                            setSelectedVB(e.target.value)}
                                        className="flex-1 px-3 py-2 border
                                                   border-gray-200 rounded-lg
                                                   text-sm focus:outline-none
                                                   focus:ring-2 focus:ring-blue-500
                                                   bg-white">
                                        <option value="">Select VB...</option>
                                        {unassignedVBs.map(vb => (
                                            <option key={vb.id} value={vb.id}>
                                                {vb.name} — {vb.email}
                                            </option>
                                        ))}
                                    </select>
                                    <button
                                        onClick={handleAssign}
                                        disabled={!selectedVB || assigning}
                                        className="px-4 py-2 bg-blue-600
                                                   hover:bg-blue-700
                                                   disabled:bg-blue-400
                                                   disabled:cursor-not-allowed
                                                   text-white text-sm
                                                   font-medium rounded-lg
                                                   transition-colors">
                                        {assigning ? "Assigning..." : "Assign"}
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* VB list */}
                    {hub.assignments?.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-sm text-gray-400">
                                No VBs assigned to this hub yet
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {hub.assignments?.map((assignment) => (
                                <div key={assignment.user.id}
                                    className="flex items-center justify-between
                                               border border-gray-100 rounded-xl
                                               p-5 gap-3 flex-wrap">

                                    <div>
                                        <div className="flex items-center gap-2">
                                            <p className="font-medium
                                                          text-gray-900 text-sm">
                                                {assignment.user.name}
                                            </p>
                                            {assignment.user.isFirstLogin ? (
                                                <span className="text-xs px-2
                                                                 py-0.5 bg-amber-50
                                                                 text-amber-700
                                                                 rounded-full">
                                                    Pending setup
                                                </span>
                                            ) : (
                                                <span className="text-xs px-2
                                                                 py-0.5 bg-green-50
                                                                 text-green-700
                                                                 rounded-full">
                                                    Active
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-gray-500 mt-0.5">
                                            {assignment.user.email}
                                        </p>
                                        {assignment.user.ventureBuilderProfile
                                            ?.organizationName && (
                                            <p className="text-gray-400 mt-0.5">
                                                🏢 {assignment.user
                                                    .ventureBuilderProfile
                                                    .organizationName}
                                            </p>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-3">
                                        {assignment.user.ventureBuilderProfile && (
                                            <div className="text-right">
                                                <p className="text-xs text-gray-400">
                                                    Profile
                                                </p>
                                                <p className="text-xs font-medium
                                                              text-gray-700">
                                                    {assignment.user
                                                        .ventureBuilderProfile
                                                        .profileCompleted || 0}%
                                                </p>
                                            </div>
                                        )}
                                        <Link
                                            href={`/admin/venture-builders/${assignment.user.id}`}
                                            className="text-xs text-blue-600
                                                       hover:underline">
                                            View
                                        </Link>
                                        {/* ✅ handleRemove now works */}
                                        <button
                                            onClick={() => handleRemove(
                                                assignment.user.id
                                            )}
                                            disabled={
                                                removing === assignment.user.id
                                            }
                                            className="text-xs text-red-500
                                                       hover:text-red-700
                                                       disabled:opacity-50">
                                            {removing === assignment.user.id
                                                ? "Removing..."
                                                : "Remove"}
                                        </button>
                                    </div>

                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </div>
        </div>
    )
}

