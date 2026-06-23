
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
const BATCH_COLORS = {
    PENDING:  "bg-amber-50 text-amber-700 border-amber-200",
    APPROVED: "bg-green-50 text-green-700 border-green-200",
    REJECTED: "bg-red-50 text-red-600 border-red-200"
}

const BATCH_LABELS = {
    PENDING:  "Awaiting review",
    APPROVED: "Approved",
    REJECTED: "Rejected"
}

export default function VBMilestonesPage() {

    const { data: session, status } = useSession()
    const router = useRouter()

    const [assignments, setAssignments] = useState([])
    const [loading, setLoading]         = useState(true)
    const [toast, setToast]             = useState("")

    // upload modal state
    const [uploadModal, setUploadModal] = useState(null)
    const [docName, setDocName]         = useState("")
    const [docUrl, setDocUrl]           = useState("")
    const [docNote, setDocNote]         = useState("")
    const [batchCount, setBatchCount]   = useState("")
    const [uploading, setUploading]     = useState(false)
    const [uploadError, setUploadError] = useState("")

    const showToast = (msg) => {
        setToast(msg)
        setTimeout(() => setToast(""), 3000)
    }

    useEffect(() => {
        if (status === "unauthenticated") router.push("/login")
    }, [status])

    useEffect(() => {
        const fetchMilestones = async () => {
            try {
                const res  = await fetch("/api/venture-builders/milestoneAssignment")
                const data = await res.json()
                setAssignments(data.assignments || [])
            } catch (error) {
                console.log(error)
            } finally {
                setLoading(false)
            }
        }
        if (session?.user?.role === "VB") fetchMilestones()
    }, [session])

    // start milestone
    const handleStart = async (assignmentId) => {
        try {
            const res = await fetch(`/api/assignments/${assignmentId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "start" })
            })
            const data = await res.json()
            if (res.ok) {
                setAssignments(assignments.map(a =>
                    a.id === assignmentId
                        ? { ...a, status: "IN_PROGRESS" }
                        : a
                ))
                showToast("Milestone started!")
            }
        } catch (error) {
            console.log(error)
        }
    }

    // submit for review
    const handleSubmit = async (assignmentId) => {
        try {
            const res = await fetch(`/api/assignments/${assignmentId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "submit" })
            })
            const data = await res.json()
            if (res.ok) {
                setAssignments(assignments.map(a =>
                    a.id === assignmentId
                        ? { ...a, status: "SUBMITTED" }
                        : a
                ))
                showToast("Submitted for review!")
            } else {
                showToast(data.message || "Something went wrong")
            }
        } catch (error) {
            console.log(error)
        }
    }

    const resetModal = () => {
        setUploadModal(null)
        setDocName("")
        setDocUrl("")
        setDocNote("")
        setBatchCount("")
        setUploadError("")
    }

    // upload document with batch count
    const handleUpload = async () => {
        setUploadError("")

        if (!docName.trim()) {
            setUploadError("Document name is required")
            return
        }
        if (!docUrl.trim()) {
            setUploadError("Document link is required")
            return
        }
        if (!batchCount || Number(batchCount) <= 0) {
            setUploadError("Please enter how many startups you completed this time")
            return
        }

        // const remaining = uploadModal.milestone.targetCount
        //     - uploadModal.completedCount

        // if (Number(batchCount) > remaining) {
        //     setUploadError(
        //         `You can only add ${remaining} more — target is ${uploadModal.milestone.targetCount}`
        //     )
        //     return
        // }

        setUploading(true)

        try {
            const res = await fetch(
                `/api/assignments/${uploadModal.id}/documents`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        name:           docName,
                        url:            docUrl,
                        // type:           "link",
                        completedCount: Number(batchCount),
                        note:           docNote || null
                    })
                }
            )

            const data = await res.json()

            if (res.ok) {
                // update assignment locally

                // const newCompleted = Math.min(
                //     uploadModal.completedCount + Number(batchCount),
                //     uploadModal.milestone.targetCount
                // )

                setAssignments(assignments.map(a =>
                    a.id === uploadModal.id
                        ? {
                            ...a,
                            // completedCount: newCompleted,
                            status:         "IN_PROGRESS",
                            documents: [
                                ...(a.documents || []),
                                data.document
                            ]
                        }
                        : a
                ))

                // reset modal
                resetModal()

                // setDocName("")
                // setDocUrl("")
                // setDocNote("")
                // setBatchCount("")
                // setUploadModal(null)
                // showToast(`Uploaded! Progress: ${newCompleted}/${uploadModal.milestone.targetCount}`)

            } else {
                setUploadError(data.message || "Something went wrong")
            }
        } catch (error) {
            setUploadError("Something went wrong. Please try again.")
        } finally {
            setUploading(false)
        }
    }

    // delete document
    // const handleDeleteDoc = async (assignmentId, documentId, docCompletedCount) => {
    //     if (!confirm("Remove this document?")) return

    //     try {
    //         const res = await fetch(
    //             `/api/assignments/${assignmentId}/documents`,
    //             {
    //                 method: "DELETE",
    //                 headers: { "Content-Type": "application/json" },
    //                 body: JSON.stringify({ documentId })
    //             }
    //         )

    //         if (res.ok) {
    //             setAssignments(assignments.map(a =>
    //                 a.id === assignmentId
    //                     ? {
    //                         ...a,
    //                         completedCount: Math.max(
    //                             0,
    //                             a.completedCount - docCompletedCount
    //                         ),
    //                         documents: a.documents.filter(
    //                             d => d.id !== documentId
    //                         )
    //                     }
    //                     : a
    //             ))
    //             showToast("Document removed")
    //         }
    //     } catch (error) {
    //         console.log(error)
    //     }
    // }

      const handleDeleteBatch = async (assignmentId, documentId) => {
            if(!confirm("Remove this batch?")) return
            try {
                const res = await fetch(
                    `/api/assignments/${assignmentId}/documents`,
                    {
                        method: "DELETE",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ documentId })
                    }
                )
                if (res.ok) {
                setAssignments(assignments.map(a =>
                    a.id === assignmentId
                        ? {
                            ...a,
                            documents: a.documents.filter(
                                d => d.id !== documentId
                            )
                        }
                        : a
                ))
                showToast("Batch removed")
            }
            } catch (error) {
              console.log(error)   
            }
      }

    // const stats = {
    //     total:    assignments.length,
    //     approved: assignments.filter(a => a.status === "APPROVED").length,
    //     pending:  assignments.filter(a =>
    //         ["PENDING", "IN_PROGRESS"].includes(a.status)
    //     ).length
    // }

    // calculate approved count from documents
    const getApprovedCount = (assignment) =>
        (assignment.documents || [])
            .filter(d => d.batchStatus === "APPROVED")
            .reduce((sum, d) => sum + d.completedCount, 0)

    const hasPendingBatch = (assignment) =>
        (assignment.documents || []).some(d => d.batchStatus === "PENDING")

    const stats = {
        total:    assignments.length,
        approved: assignments.filter(a => a.status === "APPROVED").length,
        pending:  assignments.filter(a =>
            ["PENDING", "IN_PROGRESS", "SUBMITTED"].includes(a.status)
        ).length
    }

    return (
        // <div className="min-h-screen bg-gray-50">

        //     {/* Toast */}
        //     {toast && (
        //         <div className="fixed top-4 right-4 z-50 px-4 py-2.5
        //                         bg-gray-900 text-white text-sm rounded-lg
        //                         shadow-lg">
        //             {toast}
        //         </div>
        //     )}

        //     {/* Upload Modal */}
        //     {uploadModal && (
        //         <div className="fixed inset-0 bg-black/40 z-50 flex
        //                         items-center justify-center px-4">
        //             <div className="bg-white rounded-2xl w-full max-w-md p-6">

        //                 {/* Modal header */}
        //                 <div className="flex items-start justify-between mb-1">
        //                     <div>
        //                         <h3 className="font-medium text-gray-900">
        //                             Upload evidence
        //                         </h3>
        //                         <p className="text-sm text-gray-500 mt-0.5">
        //                             {uploadModal.milestone.title}
        //                         </p>
        //                     </div>
        //                     <button
        //                         onClick={() => {
        //                             setUploadModal(null)
        //                             setDocName("")
        //                             setDocUrl("")
        //                             setDocNote("")
        //                             setBatchCount("")
        //                             setUploadError("")
        //                         }}
        //                         className="text-gray-400 hover:text-gray-600
        //                                    p-1 rounded-lg hover:bg-gray-100">
        //                         <svg className="w-4 h-4" fill="none"
        //                             stroke="currentColor" viewBox="0 0 24 24">
        //                             <path strokeLinecap="round"
        //                                 strokeLinejoin="round" strokeWidth={2}
        //                                 d="M6 18L18 6M6 6l12 12" />
        //                         </svg>
        //                     </button>
        //                 </div>

        //                 {/* Current progress */}
        //                 <div className="bg-blue-50 border border-blue-100
        //                                 rounded-xl p-3 mb-4">
        //                     <div className="flex items-center justify-between mb-1.5">
        //                         <span className="text-xs font-medium text-blue-700">
        //                             Current progress
        //                         </span>
        //                         <span className="text-xs font-medium text-blue-700">
        //                             {uploadModal.completedCount} /
        //                             {uploadModal.milestone.targetCount} startups
        //                         </span>
        //                     </div>
        //                     <div className="w-full bg-blue-100 rounded-full h-1.5">
        //                         <div
        //                             className="bg-blue-600 h-1.5 rounded-full"
        //                             style={{
        //                                 width: `${Math.min(100, Math.round(
        //                                     (uploadModal.completedCount /
        //                                     uploadModal.milestone.targetCount) * 100
        //                                 ))}%`
        //                             }}
        //                         />
        //                     </div>
        //                     <p className="text-xs text-blue-600 mt-1.5">
        //                         {uploadModal.milestone.targetCount -
        //                          uploadModal.completedCount} more startups needed
        //                         to reach target
        //                     </p>
        //                 </div>

        //                 {uploadError && (
        //                     <div className="mb-3 px-3 py-2 bg-red-50 border
        //                                     border-red-200 rounded-lg text-xs
        //                                     text-red-600">
        //                         {uploadError}
        //                     </div>
        //                 )}

        //                 <div className="space-y-3 mb-4">

        //                     {/* Batch count — most important field */}
        //                     <div>
        //                         <label className="block text-sm font-medium
        //                                           text-gray-700 mb-1">
        //                             Startups completed this time
        //                             <span className="text-red-500 ml-0.5">*</span>
        //                         </label>
        //                         <input type="number"
        //                             min="1"
        //                             max={uploadModal.milestone.targetCount -
        //                                  uploadModal.completedCount}
        //                             placeholder={`e.g. 5 (max: ${
        //                                 uploadModal.milestone.targetCount -
        //                                 uploadModal.completedCount
        //                             } remaining)`}
        //                             value={batchCount}
        //                             onChange={(e) => {
        //                                 setBatchCount(e.target.value)
        //                                 setUploadError("")
        //                             }}
        //                             className="w-full px-3 py-2 border
        //                                        border-gray-200 rounded-lg
        //                                        text-sm focus:outline-none
        //                                        focus:ring-2 focus:ring-blue-500
        //                                        placeholder:text-gray-400" />
        //                         <p className="text-xs text-gray-400 mt-1">
        //                             How many startups did you complete
        //                             in this batch?
        //                         </p>
        //                     </div>

        //                     {/* Document name */}
        //                     <div>
        //                         <label className="block text-sm font-medium
        //                                           text-gray-700 mb-1">
        //                             Document name
        //                             <span className="text-red-500 ml-0.5">*</span>
        //                         </label>
        //                         <input type="text"
        //                             placeholder="e.g. Startup list batch 1"
        //                             value={docName}
        //                             onChange={(e) => {
        //                                 setDocName(e.target.value)
        //                                 setUploadError("")
        //                             }}
        //                             className="w-full px-3 py-2 border
        //                                        border-gray-200 rounded-lg
        //                                        text-sm focus:outline-none
        //                                        focus:ring-2 focus:ring-blue-500
        //                                        placeholder:text-gray-400" />
        //                     </div>

        //                     {/* Document link */}
        //                     <div>
        //                         <label className="block text-sm font-medium
        //                                           text-gray-700 mb-1">
        //                             Google Drive / Dropbox link
        //                             <span className="text-red-500 ml-0.5">*</span>
        //                         </label>
        //                         <input type="url"
        //                             placeholder="https://drive.google.com/..."
        //                             value={docUrl}
        //                             onChange={(e) => {
        //                                 setDocUrl(e.target.value)
        //                                 setUploadError("")
        //                             }}
        //                             className="w-full px-3 py-2 border
        //                                        border-gray-200 rounded-lg
        //                                        text-sm focus:outline-none
        //                                        focus:ring-2 focus:ring-blue-500
        //                                        placeholder:text-gray-400" />
        //                     </div>

        //                     {/* Optional note */}
        //                     <div>
        //                         <label className="block text-sm font-medium
        //                                           text-gray-700 mb-1">
        //                             Note
        //                             <span className="text-xs text-gray-400 ml-1">
        //                                 (optional)
        //                             </span>
        //                         </label>
        //                         <input type="text"
        //                             placeholder="e.g. Chennai district startups"
        //                             value={docNote}
        //                             onChange={(e) => setDocNote(e.target.value)}
        //                             className="w-full px-3 py-2 border
        //                                        border-gray-200 rounded-lg
        //                                        text-sm focus:outline-none
        //                                        focus:ring-2 focus:ring-blue-500
        //                                        placeholder:text-gray-400" />
        //                     </div>

        //                 </div>

        //                 {/* Preview of new total */}
        //                 {batchCount && Number(batchCount) > 0 && (
        //                     <div className="mb-4 px-3 py-2 bg-green-50 border
        //                                     border-green-200 rounded-lg">
        //                         <p className="text-xs text-green-700">
        //                             After upload: {Math.min(
        //                                 uploadModal.completedCount +
        //                                 Number(batchCount),
        //                                 uploadModal.milestone.targetCount
        //                             )} / {uploadModal.milestone.targetCount} startups
        //                             {(uploadModal.completedCount +
        //                               Number(batchCount)) >=
        //                              uploadModal.milestone.targetCount && (
        //                                 <span className="font-medium ml-1">
        //                                     🎉 Target reached!
        //                                 </span>
        //                             )}
        //                         </p>
        //                     </div>
        //                 )}

        //                 <div className="flex gap-2">
        //                     <button
        //                         onClick={handleUpload}
        //                         disabled={uploading}
        //                         className="flex-1 py-2.5 bg-blue-600
        //                                    hover:bg-blue-700 disabled:bg-blue-400
        //                                    disabled:cursor-not-allowed text-white
        //                                    text-sm font-medium rounded-lg
        //                                    transition-colors">
        //                         {uploading ? "Uploading..." : "Upload evidence"}
        //                     </button>
        //                     <button
        //                         onClick={() => {
        //                             setUploadModal(null)
        //                             setDocName("")
        //                             setDocUrl("")
        //                             setDocNote("")
        //                             setBatchCount("")
        //                             setUploadError("")
        //                         }}
        //                         className="flex-1 py-2.5 border border-gray-200
        //                                    text-gray-600 text-sm rounded-lg
        //                                    hover:bg-gray-50 transition-colors">
        //                         Cancel
        //                     </button>
        //                 </div>

        //             </div>
        //         </div>
        //     )}

        //     {/* Navbar */}
        //     <nav className="bg-white border-b border-gray-200 sticky top-0 z-10">
        //         <div className="max-w-5xl mx-auto px-5 flex items-center
        //                         justify-between" style={{ height: "52px" }}>
        //             <div className="flex items-center gap-3">
        //                 <Link href="/VB-dashboard"
        //                     className="text-gray-400 hover:text-gray-600">
        //                     <svg className="w-4 h-4" fill="none"
        //                         stroke="currentColor" viewBox="0 0 24 24">
        //                         <path strokeLinecap="round"
        //                             strokeLinejoin="round" strokeWidth={2}
        //                             d="M15 19l-7-7 7-7" />
        //                     </svg>
        //                 </Link>
        //                 <span className="text-sm font-medium text-gray-900">
        //                     My Milestones
        //                 </span>
        //             </div>
        //         </div>
        //     </nav>

        //     <div className="max-w-5xl mx-auto px-5 py-7">

        //         {/* Stats */}
        //         <div className="grid grid-cols-3 gap-3 mb-6">
        //             <div className="bg-white border border-gray-200
        //                             rounded-xl p-4 text-center">
        //                 <p className="text-2xl font-medium text-gray-900">
        //                     {stats.total}
        //                 </p>
        //                 <p className="text-xs text-gray-400 mt-1">
        //                     Total assigned
        //                 </p>
        //             </div>
        //             <div className="bg-white border border-gray-200
        //                             rounded-xl p-4 text-center">
        //                 <p className="text-2xl font-medium text-green-600">
        //                     {stats.approved}
        //                 </p>
        //                 <p className="text-xs text-gray-400 mt-1">
        //                     Approved
        //                 </p>
        //             </div>
        //             <div className="bg-white border border-gray-200
        //                             rounded-xl p-4 text-center">
        //                 <p className="text-2xl font-medium text-amber-500">
        //                     {stats.pending}
        //                 </p>
        //                 <p className="text-xs text-gray-400 mt-1">
        //                     In progress
        //                 </p>
        //             </div>
        //         </div>

        //         {/* Milestones list */}
        //         {loading ? (
        //             <div className="space-y-3">
        //                 {[...Array(4)].map((_, i) => (
        //                     <div key={i}
        //                         className="animate-pulse bg-white border
        //                                    border-gray-200 rounded-xl p-5">
        //                         <div className="h-4 bg-gray-200 rounded w-48 mb-2" />
        //                         <div className="h-3 bg-gray-200 rounded w-72" />
        //                     </div>
        //                 ))}
        //             </div>
        //         ) : assignments.length === 0 ? (
        //             <div className="text-center py-16 bg-white border
        //                             border-gray-200 rounded-xl">
        //                 <p className="text-sm text-gray-400">
        //                     No milestones assigned yet
        //                 </p>
        //             </div>
        //         ) : (
        //             <div className="space-y-4">
        //                 {assignments.map((assignment) => {

        //                     const target    = assignment.milestone.targetCount
        //                     const completed = assignment.completedCount || 0
        //                     const pct       = Math.min(
        //                         100,
        //                         Math.round((completed / target) * 100)
        //                     )
        //                     const remaining = target - completed

        //                     return (
        //                         <div key={assignment.id}
        //                             className="bg-white border border-gray-200
        //                                        rounded-xl p-5">

        //                             {/* Header */}
        //                             <div className="flex items-start justify-between
        //                                             gap-3 mb-4">
        //                                 <div className="flex items-start gap-3">
        //                                     <div className="w-9 h-9 rounded-xl
        //                                                     bg-blue-50 flex items-center
        //                                                     justify-center flex-shrink-0">
        //                                         <span className="text-blue-600
        //                                                          font-medium text-sm">
        //                                             {assignment.milestone.orderNumber}
        //                                         </span>
        //                                     </div>
        //                                     <div>
        //                                         <h3 className="text-sm font-medium
        //                                                        text-gray-900">
        //                                             {assignment.milestone.title}
        //                                         </h3>
        //                                         <p className="text-xs text-gray-400 mt-0.5">
        //                                             Assigned:{" "}
        //                                             {new Date(assignment.createdAt)
        //                                                 .toLocaleDateString("en-IN", {
        //                                                     day: "numeric",
        //                                                     month: "short",
        //                                                     year: "numeric"
        //                                                 })}
        //                                         </p>
        //                                         {assignment.deadline && (
        //                                             <p className="text-xs
        //                                                           text-amber-600 mt-0.5">
        //                                                 📅 Deadline:{" "}
        //                                                 {new Date(assignment.deadline)
        //                                                     .toLocaleDateString("en-IN", {
        //                                                         day: "numeric",
        //                                                         month: "short",
        //                                                         year: "numeric"
        //                                                     })}
        //                                             </p>
        //                                         )}
        //                                     </div>
        //                                 </div>

        //                                 <span className={`text-xs px-2.5 py-1
        //                                                  rounded-full font-medium
        //                                                  flex-shrink-0
        //                                                  ${STATUS_COLORS[
        //                                     assignment.status]}`}>
        //                                     {STATUS_LABELS[assignment.status]}
        //                                 </span>
        //                             </div>

        //                             {/* Progress bar */}
        //                             <div className="mb-4">
        //                                 <div className="flex items-center
        //                                                 justify-between mb-1.5">
        //                                     <span className="text-xs text-gray-500">
        //                                         Startup progress
        //                                     </span>
        //                                     <span className={`text-xs font-medium
        //                                                      ${pct === 100
        //                                             ? "text-green-600"
        //                                             : "text-blue-600"}`}>
        //                                         {completed} / {target} startups
        //                                     </span>
        //                                 </div>
        //                                 <div className="w-full bg-gray-100
        //                                                 rounded-full h-2">
        //                                     <div
        //                                         className={`h-2 rounded-full
        //                                                    transition-all duration-500
        //                                                    ${pct === 100
        //                                                 ? "bg-green-500"
        //                                                 : "bg-blue-600"}`}
        //                                         style={{ width: `${pct}%` }}
        //                                     />
        //                                 </div>
        //                                 <div className="flex items-center
        //                                                 justify-between mt-1">
        //                                     <span className="text-xs text-gray-400">
        //                                         {pct}% complete
        //                                     </span>
        //                                     {remaining > 0 &&
        //                                      assignment.status !== "APPROVED" && (
        //                                         <span className="text-xs text-gray-400">
        //                                             {remaining} more needed
        //                                         </span>
        //                                     )}
        //                                 </div>
        //                             </div>

        //                             {/* Checklist */}
        //                             {assignment.milestone.description && (
        //                                 <div className="mb-4 space-y-1 pl-1">
        //                                     {assignment.milestone.description
        //                                         .trim()
        //                                         .split("\n")
        //                                         .filter(Boolean)
        //                                         .map((item, i) => (
        //                                             <p key={i}
        //                                                 className="text-xs
        //                                                            text-gray-500
        //                                                            flex items-start
        //                                                            gap-1.5">
        //                                                 <span className="text-gray-300 mt-0.5">
        //                                                     ▸
        //                                                 </span>
        //                                                 {item.replace(/^\d+\.\s*/, "")}
        //                                             </p>
        //                                         ))}
        //                                 </div>
        //                             )}

        //                             {/* Admin note */}
        //                             {assignment.adminNote && (
        //                                 <div className="mb-4 px-3 py-2.5 bg-gray-50
        //                                                 border border-gray-100
        //                                                 rounded-lg">
        //                                     <p className="text-xs font-medium
        //                                                   text-gray-500 mb-0.5">
        //                                         Admin note
        //                                     </p>
        //                                     <p className="text-sm text-gray-700">
        //                                         {assignment.adminNote}
        //                                     </p>
        //                                 </div>
        //                             )}

        //                             {/* Upload history */}
        //                             {assignment.documents?.length > 0 && (
        //                                 <div className="mb-4">
        //                                     <p className="text-xs font-medium
        //                                                   text-gray-500 mb-2">
        //                                         Upload history
        //                                         <span className="font-normal ml-1">
        //                                             ({assignment.documents.length}
        //                                             {" "}batch
        //                                             {assignment.documents.length !== 1
        //                                                 ? "es"
        //                                                 : ""})
        //                                         </span>
        //                                     </p>
        //                                     <div className="space-y-2">
        //                                         {assignment.documents.map((doc, idx) => (
        //                                             <div key={doc.id}
        //                                                 className="flex items-center
        //                                                            justify-between
        //                                                            gap-2 bg-gray-50
        //                                                            border
        //                                                            border-gray-100
        //                                                            rounded-lg
        //                                                            px-3 py-2">
        //                                                 <div className="flex items-center
        //                                                                 gap-2 min-w-0">
        //                                                     <span className="text-xs
        //                                                                      text-gray-400
        //                                                                      flex-shrink-0">
        //                                                         #{idx + 1}
        //                                                     </span>
        //                                                     <a href={doc.url}
        //                                                         target="_blank"
        //                                                         rel="noopener noreferrer"
        //                                                         className="text-xs
        //                                                                    text-blue-600
        //                                                                    hover:underline
        //                                                                    truncate">
        //                                                         📎 {doc.name}
        //                                                     </a>
        //                                                     {doc.note && (
        //                                                         <span className="text-xs
        //                                                                          text-gray-400
        //                                                                          truncate">
        //                                                             — {doc.note}
        //                                                         </span>
        //                                                     )}
        //                                                 </div>
        //                                                 <div className="flex items-center
        //                                                                 gap-2 flex-shrink-0">
        //                                                     <span className="text-xs
        //                                                                      font-medium
        //                                                                      text-green-700
        //                                                                      bg-green-50
        //                                                                      px-2 py-0.5
        //                                                                      rounded-full">
        //                                                         +{doc.completedCount}
        //                                                     </span>
        //                                                     {/* only allow delete if not submitted/approved */}
        //                                                     {!["SUBMITTED",
        //                                                        "APPROVED"].includes(
        //                                                         assignment.status
        //                                                     ) && (
        //                                                         <button
        //                                                             onClick={() =>
        //                                                                 handleDeleteDoc(
        //                                                                     assignment.id,
        //                                                                     doc.id,
        //                                                                     doc.completedCount
        //                                                                 )}
        //                                                             className="text-xs
        //                                                                        text-red-400
        //                                                                        hover:text-red-600">
        //                                                             ✕
        //                                                         </button>
        //                                                     )}
        //                                                 </div>
        //                                             </div>
        //                                         ))}
        //                                     </div>
        //                                 </div>
        //                             )}

        //                             {/* Actions */}
        //                             <div className="flex gap-2 flex-wrap pt-3
        //                                             border-t border-gray-100">

        //                                 {assignment.status === "PENDING" && (
        //                                     <button
        //                                         onClick={() =>
        //                                             handleStart(assignment.id)}
        //                                         className="text-xs px-4 py-2
        //                                                    bg-blue-600
        //                                                    hover:bg-blue-700
        //                                                    text-white rounded-lg
        //                                                    font-medium
        //                                                    transition-colors">
        //                                         Start milestone
        //                                     </button>
        //                                 )}

        //                                 {["IN_PROGRESS", "REJECTED"].includes(
        //                                     assignment.status
        //                                 ) && (
        //                                     <>
        //                                         <button
        //                                             onClick={() =>
        //                                                 setUploadModal(assignment)}
        //                                             className="text-xs px-4 py-2
        //                                                        border border-gray-200
        //                                                        text-gray-700 rounded-lg
        //                                                        hover:bg-gray-50
        //                                                        font-medium
        //                                                        transition-colors">
        //                                             📎 Upload evidence
        //                                             {remaining > 0 && (
        //                                                 <span className="ml-1
        //                                                                  text-gray-400">
        //                                                     ({remaining} left)
        //                                                 </span>
        //                                             )}
        //                                         </button>

        //                                         {/* Only show submit if has documents */}
        //                                         {assignment.documents?.length > 0 && (
        //                                             <button
        //                                                 onClick={() =>
        //                                                     handleSubmit(
        //                                                         assignment.id
        //                                                     )}
        //                                                 className="text-xs px-4 py-2
        //                                                            bg-green-600
        //                                                            hover:bg-green-700
        //                                                            text-white rounded-lg
        //                                                            font-medium
        //                                                            transition-colors">
        //                                                 Submit for review
        //                                                 {pct < 100 && (
        //                                                     <span className="ml-1
        //                                                                      opacity-80">
        //                                                         ({pct}% done)
        //                                                     </span>
        //                                                 )}
        //                                             </button>
        //                                         )}
        //                                     </>
        //                                 )}

        //                                 {assignment.status === "SUBMITTED" && (
        //                                     <span className="text-xs text-amber-600
        //                                                      bg-amber-50 px-3 py-2
        //                                                      rounded-lg">
        //                                         ⏳ Waiting for admin review...
        //                                     </span>
        //                                 )}

        //                                 {/* {assignment.status === "APPROVED" && (
        //                                     <span className="text-xs text-green-600
        //                                                      bg-green-50 px-3 py-2
        //                                                      rounded-lg font-medium">
        //                                         ✓ Milestone completed —
        //                                         {completed}/{target} startups
        //                                     </span>
        //                                 )} */}

        //                                 {assignment.completedCount >= assignment.milestone.targetCount ? (
        //                                     <span className="text-green-600">
        //                                         ✓ Milestone completed
        //                                     </span>
        //                                 ): (
        //                                     <span  className="text-blue-600">
        //                                         Progress: {assignment.completedCount} / {assignment.milestone.targetCount}
        //                                     </span>
        //                                 )}

        //                             </div>

        //                         </div>
        //                     )
        //                 })}
        //             </div>
        //         )}
        //     </div>
        // </div>

        
    
     
           <div className="min-h-screen bg-gray-50">

            {/* Toast */}
            {toast && (
                <div className="fixed top-4 right-4 z-50 px-4 py-2.5
                                bg-gray-900 text-white text-sm rounded-lg shadow-lg">
                    {toast}
                </div>
            )}

            {/* Upload Modal */}
            {uploadModal && (
                <div className="fixed inset-0 bg-black/40 z-50 flex
                                items-center justify-center px-4">
                    <div className="bg-white rounded-2xl w-full max-w-md p-6">

                        <div className="flex items-start justify-between mb-3">
                            <div>
                                <h3 className="font-medium text-gray-900">
                                    Upload new batch
                                </h3>
                                <p className="text-xs text-gray-500 mt-0.5">
                                    {uploadModal.milestone.title}
                                </p>
                            </div>
                            <button onClick={resetModal}
                                className="text-gray-400 hover:text-gray-600
                                           p-1 rounded-lg hover:bg-gray-100">
                                <svg className="w-4 h-4" fill="none"
                                    stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round"
                                        strokeLinejoin="round" strokeWidth={2}
                                        d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Current approved progress */}
                        <div className="bg-blue-50 border border-blue-100
                                        rounded-xl p-3 mb-4">
                            <div className="flex items-center justify-between mb-1.5">
                                <span className="text-xs font-medium text-blue-700">
                                    Approved progress
                                </span>
                                <span className="text-xs font-medium text-blue-700">
                                    {getApprovedCount(uploadModal)} /
                                    {uploadModal.milestone.targetCount} startups
                                </span>
                            </div>
                            <div className="w-full bg-blue-100 rounded-full h-1.5">
                                <div
                                    className="bg-blue-600 h-1.5 rounded-full"
                                    style={{
                                        width: `${Math.min(100, Math.round(
                                            (getApprovedCount(uploadModal) /
                                             uploadModal.milestone.targetCount) * 100
                                        ))}%`
                                    }}
                                />
                            </div>
                            <p className="text-xs text-blue-600 mt-1.5">
                                {uploadModal.milestone.targetCount -
                                 getApprovedCount(uploadModal)} more startups
                                needed to reach target
                            </p>
                        </div>

                        {uploadError && (
                            <div className="mb-3 px-3 py-2 bg-red-50 border
                                            border-red-200 rounded-lg text-xs
                                            text-red-600">
                                {uploadError}
                            </div>
                        )}

                        <div className="space-y-3 mb-4">

                            <div>
                                <label className="block text-xs font-medium
                                                  text-gray-700 mb-1">
                                    Startups completed in this batch
                                    <span className="text-red-500 ml-0.5">*</span>
                                </label>
                                <input type="number" min="1"
                                    max={uploadModal.milestone.targetCount -
                                         getApprovedCount(uploadModal)}
                                    placeholder={`e.g. 5 (max: ${
                                        uploadModal.milestone.targetCount -
                                        getApprovedCount(uploadModal)
                                    } remaining)`}
                                    value={batchCount}
                                    onChange={(e) => {
                                        setBatchCount(e.target.value)
                                        setUploadError("")
                                    }}
                                    className="w-full px-3 py-2 border
                                               border-gray-200 rounded-lg text-sm
                                               focus:outline-none focus:ring-2
                                               focus:ring-blue-500
                                               placeholder:text-gray-400" />
                                <p className="text-xs text-gray-400 mt-1">
                                    How many startups did you complete this batch?
                                </p>
                            </div>

                            <div>
                                <label className="block text-xs font-medium
                                                  text-gray-700 mb-1">
                                    Document name
                                    <span className="text-red-500 ml-0.5">*</span>
                                </label>
                                <input type="text"
                                    placeholder="e.g. Startup list batch 3"
                                    value={docName}
                                    onChange={(e) => {
                                        setDocName(e.target.value)
                                        setUploadError("")
                                    }}
                                    className="w-full px-3 py-2 border
                                               border-gray-200 rounded-lg text-sm
                                               focus:outline-none focus:ring-2
                                               focus:ring-blue-500
                                               placeholder:text-gray-400" />
                            </div>

                            <div>
                                <label className="block text-xs font-medium
                                                  text-gray-700 mb-1">
                                    Google Drive / Dropbox link
                                    <span className="text-red-500 ml-0.5">*</span>
                                </label>
                                <input type="url"
                                    placeholder="https://drive.google.com/..."
                                    value={docUrl}
                                    onChange={(e) => {
                                        setDocUrl(e.target.value)
                                        setUploadError("")
                                    }}
                                    className="w-full px-3 py-2 border
                                               border-gray-200 rounded-lg text-sm
                                               focus:outline-none focus:ring-2
                                               focus:ring-blue-500
                                               placeholder:text-gray-400" />
                            </div>

                            <div>
                                <label className="block text-xs font-medium
                                                  text-gray-700 mb-1">
                                    Remarks
                                    <span className="text-gray-400 ml-1">
                                        (optional)
                                    </span>
                                </label>
                                <input type="text"
                                    placeholder="e.g. Chennai district startups"
                                    value={docNote}
                                    onChange={(e) => setDocNote(e.target.value)}
                                    className="w-full px-3 py-2 border
                                               border-gray-200 rounded-lg text-sm
                                               focus:outline-none focus:ring-2
                                               focus:ring-blue-500
                                               placeholder:text-gray-400" />
                            </div>

                        </div>

                        {/* Preview */}
                        {batchCount && Number(batchCount) > 0 && (
                            <div className="mb-4 px-3 py-2 bg-green-50 border
                                            border-green-200 rounded-lg">
                                <p className="text-xs text-green-700">
                                    After upload:{" "}
                                    {getApprovedCount(uploadModal)} approved
                                    + {batchCount} pending ={" "}
                                    {getApprovedCount(uploadModal) +
                                     Number(batchCount)} /{" "}
                                    {uploadModal.milestone.targetCount}
                                    {(getApprovedCount(uploadModal) +
                                      Number(batchCount)) >=
                                     uploadModal.milestone.targetCount && (
                                        <span className="font-medium ml-1">
                                            🎉 Will reach target on approval!
                                        </span>
                                    )}
                                </p>
                            </div>
                        )}

                        <p className="text-xs text-gray-400 mb-3">
                            📌 Upload now. Submit for review when you're ready for
                            admin to check.
                        </p>

                        <div className="flex gap-2">
                            <button onClick={handleUpload} disabled={uploading}
                                className="flex-1 py-2.5 bg-blue-600
                                           hover:bg-blue-700 disabled:bg-blue-400
                                           disabled:cursor-not-allowed text-white
                                           text-sm font-medium rounded-lg
                                           transition-colors">
                                {uploading ? "Uploading..." : "Upload batch"}
                            </button>
                            <button onClick={resetModal}
                                className="flex-1 py-2.5 border border-gray-200
                                           text-gray-600 text-sm rounded-lg
                                           hover:bg-gray-50 transition-colors">
                                Cancel
                            </button>
                        </div>

                    </div>
                </div>
            )}

            {/* Navbar */}
            <nav className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-5xl mx-auto px-5 flex items-center
                                justify-between" style={{ height: "52px" }}>
                    <div className="flex items-center gap-3">
                        <Link href="/VB-dashboard"
                            className="text-gray-400 hover:text-gray-600">
                            <svg className="w-4 h-4" fill="none"
                                stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round"
                                    strokeLinejoin="round" strokeWidth={2}
                                    d="M15 19l-7-7 7-7" />
                            </svg>
                        </Link>
                        <span className="text-sm font-medium text-gray-900">
                            My Milestones
                        </span>
                    </div>
                </div>
            </nav>

            <div className="max-w-5xl mx-auto px-5 py-7">

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                    <div className="bg-white border border-gray-200
                                    rounded-xl p-4 text-center">
                        <p className="text-2xl font-medium text-gray-900">
                            {stats.total}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">Total</p>
                    </div>
                    <div className="bg-white border border-gray-200
                                    rounded-xl p-4 text-center">
                        <p className="text-2xl font-medium text-green-600">
                            {stats.approved}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">Approved</p>
                    </div>
                    <div className="bg-white border border-gray-200
                                    rounded-xl p-4 text-center">
                        <p className="text-2xl font-medium text-blue-600">
                            {stats.pending}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">In progress</p>
                    </div>
                </div>

                {/* Milestones */}
                {loading ? (
                    <div className="space-y-3">
                        {[...Array(4)].map((_, i) => (
                            <div key={i}
                                className="animate-pulse bg-white border
                                           border-gray-200 rounded-xl p-5">
                                <div className="h-4 bg-gray-200 rounded w-48 mb-2" />
                                <div className="h-3 bg-gray-200 rounded w-72" />
                            </div>
                        ))}
                    </div>
                ) : assignments.length === 0 ? (
                    <div className="text-center py-16 bg-white border
                                    border-gray-200 rounded-xl">
                        <p className="text-sm text-gray-400">
                            No milestones assigned yet
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {assignments.map((assignment) => {
                            const target        = assignment.milestone.targetCount
                            const approvedCount = getApprovedCount(assignment)
                            const pct           = Math.min(
                                100,
                                Math.round((approvedCount / target) * 100)
                            )
                            const remaining     = target - approvedCount
                            const pendingBatch  = hasPendingBatch(assignment)

                            return (
                                <div key={assignment.id}
                                    className="bg-white border border-gray-200
                                               rounded-xl p-5">

                                    {/* Header */}
                                    <div className="flex items-start justify-between
                                                    gap-3 mb-4">
                                        <div className="flex items-start gap-3">
                                            <div className="w-9 h-9 rounded-xl
                                                            bg-blue-50 flex items-center
                                                            justify-center flex-shrink-0">
                                                <span className="text-blue-600
                                                                 font-medium text-sm">
                                                    {assignment.milestone.orderNumber}
                                                </span>
                                            </div>
                                            <div>
                                                <h3 className="text-sm font-medium
                                                               text-gray-900">
                                                    {assignment.milestone.title}
                                                </h3>
                                                <p className="text-xs text-gray-400 mt-0.5">
                                                    Assigned:{" "}
                                                    {new Date(assignment.createdAt)
                                                        .toLocaleDateString("en-IN", {
                                                            day: "numeric",
                                                            month: "short",
                                                            year: "numeric"
                                                        })}
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

                                    {/* Progress bar — based on APPROVED batches only */}
                                    <div className="mb-4">
                                        <div className="flex items-center
                                                        justify-between mb-1.5">
                                            <span className="text-xs text-gray-500">
                                                Approved startup progress
                                            </span>
                                            <span className={`text-xs font-medium
                                                             ${pct === 100
                                                    ? "text-green-600"
                                                    : "text-blue-600"}`}>
                                                {approvedCount} / {target} startups
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-100
                                                        rounded-full h-2">
                                            <div
                                                className={`h-2 rounded-full
                                                           transition-all duration-500
                                                           ${pct === 100
                                                        ? "bg-green-500"
                                                        : "bg-blue-600"}`}
                                                style={{ width: `${pct}%` }}
                                            />
                                        </div>
                                        <div className="flex items-center
                                                        justify-between mt-1">
                                            <span className="text-xs text-gray-400">
                                                {pct}% approved
                                            </span>
                                            {remaining > 0 &&
                                             assignment.status !== "APPROVED" && (
                                                <span className="text-xs text-gray-400">
                                                    {remaining} more needed
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Milestone description */}
                                    {assignment.milestone.description && (
                                        <div className="mb-4 space-y-1">
                                            {assignment.milestone.description
                                                .trim()
                                                .split("\n")
                                                .filter(Boolean)
                                                .map((item, i) => (
                                                    <p key={i}
                                                        className="text-xs text-gray-500
                                                                   flex items-start gap-1.5">
                                                        <span className="text-gray-300 mt-0.5">
                                                            ▸
                                                        </span>
                                                        {item.replace(/^\d+\.\s*/, "")}
                                                    </p>
                                                ))}
                                        </div>
                                    )}

                                    {/* Admin note on milestone */}
                                    {assignment.adminNote &&
                                     assignment.status === "APPROVED" && (
                                        <div className="mb-4 px-3 py-2.5 bg-green-50
                                                        border border-green-100
                                                        rounded-lg">
                                            <p className="text-xs font-medium
                                                          text-green-700 mb-0.5">
                                                Admin note
                                            </p>
                                            <p className="text-xs text-green-600">
                                                {assignment.adminNote}
                                            </p>
                                        </div>
                                    )}

                                    {/* Batch history */}
                                    {assignment.documents?.length > 0 && (
                                        <div className="mb-4">
                                            <p className="text-xs font-medium
                                                          text-gray-500 mb-2">
                                                Batch history
                                                <span className="font-normal ml-1">
                                                    ({assignment.documents.length}
                                                    {" "}batch
                                                    {assignment.documents.length !== 1
                                                        ? "es"
                                                        : ""})
                                                </span>
                                            </p>
                                            <div className="space-y-2">
                                                {assignment.documents.map(
                                                    (doc, idx) => (
                                                    <div key={doc.id}
                                                        className={`border rounded-lg
                                                                   px-3 py-2.5
                                                                   ${BATCH_COLORS[
                                                            doc.batchStatus]}`}>

                                                        <div className="flex items-start
                                                                        justify-between
                                                                        gap-2 mb-1">
                                                            <div className="flex items-center
                                                                            gap-2 min-w-0">
                                                                <span className="text-xs
                                                                                 text-gray-400
                                                                                 flex-shrink-0">
                                                                    #{idx + 1}
                                                                </span>
                                                                <a href={doc.url}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="text-xs
                                                                               text-blue-600
                                                                               hover:underline
                                                                               truncate">
                                                                    📎 {doc.name}
                                                                </a>
                                                            </div>
                                                            <div className="flex items-center
                                                                            gap-2 flex-shrink-0">
                                                                <span className="text-xs
                                                                                 font-medium
                                                                                 text-gray-700">
                                                                    +{doc.completedCount}
                                                                    {" "}startups
                                                                </span>
                                                                <span className={`text-xs
                                                                                 font-medium
                                                                                 px-1.5 py-0.5
                                                                                 rounded-full
                                                                                 ${doc.batchStatus === "APPROVED"
                                                                        ? "bg-green-100 text-green-700"
                                                                        : doc.batchStatus === "REJECTED"
                                                                            ? "bg-red-100 text-red-600"
                                                                            : "bg-amber-100 text-amber-700"}`}>
                                                                    {BATCH_LABELS[doc.batchStatus]}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        {doc.note && (
                                                            <p className="text-xs
                                                                          text-gray-400 mb-1">
                                                                {doc.note}
                                                            </p>
                                                        )}

                                                        {/* Admin feedback per batch */}
                                                        {doc.adminFeedback && (
                                                            <div className="mt-1.5
                                                                            bg-white/60
                                                                            rounded-lg
                                                                            px-2.5 py-1.5">
                                                                <p className="text-xs
                                                                              font-medium
                                                                              text-gray-500
                                                                              mb-0.5">
                                                                    Admin feedback
                                                                </p>
                                                                <p className="text-xs
                                                                              text-gray-600
                                                                              italic">
                                                                    {doc.adminFeedback}
                                                                </p>
                                                            </div>
                                                        )}

                                                        {/* Delete pending/rejected batch */}
                                                        {doc.batchStatus !== "APPROVED" &&
                                                         assignment.status !== "SUBMITTED" && (
                                                            <button
                                                                onClick={() =>
                                                                    handleDeleteBatch(
                                                                        assignment.id,
                                                                        doc.id
                                                                    )}
                                                                className="mt-1.5 text-xs
                                                                           text-red-400
                                                                           hover:text-red-600">
                                                                Remove batch
                                                            </button>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Action buttons */}
                                    <div className="flex gap-2 flex-wrap pt-3
                                                    border-t border-gray-100">

                                        {assignment.status === "PENDING" && (
                                            <button
                                                onClick={() =>
                                                    handleStart(assignment.id)}
                                                className="text-xs px-4 py-2
                                                           bg-blue-600
                                                           hover:bg-blue-700
                                                           text-white rounded-lg
                                                           font-medium
                                                           transition-colors">
                                                Start milestone
                                            </button>
                                        )}

                                        {["IN_PROGRESS", "REJECTED"].includes(
                                            assignment.status
                                        ) && (
                                            <>
                                                <button
                                                    onClick={() =>
                                                        setUploadModal(assignment)}
                                                    className="text-xs px-4 py-2
                                                               border border-gray-200
                                                               text-gray-700 rounded-lg
                                                               hover:bg-gray-50
                                                               font-medium
                                                               transition-colors">
                                                    📎 Upload batch
                                                    {remaining > 0 && (
                                                        <span className="ml-1
                                                                         text-gray-400">
                                                            ({remaining} left)
                                                        </span>
                                                    )}
                                                </button>

                                                {/* Submit only if has pending batch */}
                                                {pendingBatch && (
                                                    <button
                                                        onClick={() =>
                                                            handleSubmit(
                                                                assignment.id
                                                            )}
                                                        className="text-xs px-4 py-2
                                                                   bg-green-600
                                                                   hover:bg-green-700
                                                                   text-white rounded-lg
                                                                   font-medium
                                                                   transition-colors">
                                                        Submit for review
                                                    </button>
                                                )}
                                            </>
                                        )}

                                        {assignment.status === "SUBMITTED" && (
                                            <span className="text-xs text-amber-600
                                                             bg-amber-50 px-3 py-2
                                                             rounded-lg">
                                                ⏳ Admin reviewing your batches...
                                            </span>
                                        )}

                                        {assignment.status === "APPROVED" && (
                                            <span className="text-xs text-green-600
                                                             bg-green-50 px-3 py-2
                                                             rounded-lg font-medium">
                                                🎉 Milestone complete —
                                                {approvedCount}/{target} startups
                                            </span>
                                        )}

                                    </div>

                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
     
    )
}