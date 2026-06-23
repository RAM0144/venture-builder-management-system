"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useParams } from "next/navigation"
import Link from "next/link"

const STATUS_COLORS = {
    PENDING:     "bg-gray-100 text-gray-500",
    IN_PROGRESS: "bg-blue-50 text-blue-700",
    SUBMITTED:   "bg-amber-50 text-amber-700",
    APPROVED:    "bg-green-50 text-green-700",
    REJECTED:    "bg-red-50 text-red-600"
}

const STATUS_LABELS = {
    PENDING:     "Pending",
    IN_PROGRESS: "In progress",
    SUBMITTED:   "Submitted",
    APPROVED:    "Approved",
    REJECTED:    "Rejected"
}

// ── PDF Report Generator ────────────────────────────────────────────────────
// ✅ FIXED: uses completedCount not startupCount
const generateVBReport = (assignment, milestone) => {
    const statusColor = {
        APPROVED:    "#16a34a",
        SUBMITTED:   "#d97706",
        IN_PROGRESS: "#2563eb",
        PENDING:     "#6b7280",
        REJECTED:    "#dc2626"
    }

    const fmt = (dateStr) =>
        dateStr
            ? new Date(dateStr).toLocaleDateString("en-IN", {
                  day: "numeric", month: "long", year: "numeric"
              })
            : "—"

    // ✅ completedCount from approved batches only
    const approvedCount = (assignment.documents || [])
        .filter(d => d.batchStatus === "APPROVED")
        .reduce((sum, d) => sum + d.completedCount, 0)

    const targetCount = milestone?.targetCount ?? 0
    const pct         = targetCount > 0
        ? Math.min(Math.round((approvedCount / targetCount) * 100), 100)
        : 0
    const barColor    = pct >= 100 ? "#16a34a" : "#2563eb"

    // ✅ Batch table in PDF — each batch with status + download link
    const batchRows = (assignment.documents || []).length > 0
        ? (assignment.documents || []).map((d, idx) => {
            const bColor = d.batchStatus === "APPROVED"
                ? "#16a34a"
                : d.batchStatus === "REJECTED"
                    ? "#dc2626"
                    : "#d97706"

            return `
            <tr>
              <td style="padding:8px 12px;border-bottom:1px solid #f3f4f6;
                         font-size:12px;color:#374151;">#${idx + 1}</td>
              <td style="padding:8px 12px;border-bottom:1px solid #f3f4f6;
                         font-size:12px;">
                <a href="${d.url}" style="color:#2563eb;text-decoration:none;">
                  📎 ${d.name}
                </a>
              </td>
              <td style="padding:8px 12px;border-bottom:1px solid #f3f4f6;
                         font-size:12px;font-weight:600;color:#374151;
                         text-align:center;">
                +${d.completedCount}
              </td>
              <td style="padding:8px 12px;border-bottom:1px solid #f3f4f6;
                         text-align:center;">
                <span style="font-size:11px;font-weight:600;color:${bColor};
                             background:${bColor}18;padding:2px 8px;
                             border-radius:999px;">
                  ${d.batchStatus}
                </span>
              </td>
              <td style="padding:8px 12px;border-bottom:1px solid #f3f4f6;
                         font-size:11px;color:#6b7280;">
                ${d.note || "—"}
              </td>
              <td style="padding:8px 12px;border-bottom:1px solid #f3f4f6;
                         font-size:11px;color:#6b7280;font-style:italic;">
                ${d.adminFeedback || "—"}
              </td>
            </tr>`
          }).join("")
        : `<tr><td colspan="6" style="padding:16px;text-align:center;
              color:#9ca3af;font-size:12px;">No batches uploaded</td></tr>`

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8"/>
  <title>VB Report — ${assignment.user.name}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      color: #111827; background: #fff; padding: 48px;
      font-size: 13px;
    }
    .header {
      display: flex; justify-content: space-between;
      align-items: flex-start; border-bottom: 2px solid #e5e7eb;
      padding-bottom: 20px; margin-bottom: 28px;
    }
    .logo { font-size: 13px; font-weight: 700; color: #2563eb;
            letter-spacing: .05em; text-transform: uppercase; }
    .generated { font-size: 11px; color: #9ca3af; margin-top: 4px; }
    h1 { font-size: 22px; font-weight: 700; color: #111827; }
    .sub { font-size: 13px; color: #6b7280; margin-top: 4px; }
    .badge {
      display: inline-block; padding: 4px 12px; border-radius: 999px;
      font-size: 12px; font-weight: 600; color: #fff;
    }
    .section { margin-top: 28px; }
    .section-title {
      font-size: 11px; font-weight: 700; color: #6b7280;
      letter-spacing: .08em; text-transform: uppercase;
      margin-bottom: 12px; padding-bottom: 6px;
      border-bottom: 1px solid #f3f4f6;
    }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
    .info-cell {
      background: #f9fafb; border: 1px solid #f3f4f6;
      border-radius: 10px; padding: 12px 14px;
    }
    .info-label { font-size: 11px; color: #9ca3af; margin-bottom: 3px; }
    .info-value { font-size: 14px; font-weight: 600; color: #111827; }
    .progress-wrap {
      background: #f3f4f6; border-radius: 999px;
      height: 10px; margin: 8px 0 6px; overflow: hidden;
    }
    .progress-fill {
      height: 10px; border-radius: 999px;
      background: ${barColor}; width: ${pct}%;
    }
    table {
      width: 100%; border-collapse: collapse;
      background: #fff; border: 1px solid #f3f4f6;
      border-radius: 10px; overflow: hidden;
    }
    th {
      background: #f9fafb; padding: 10px 12px;
      font-size: 11px; font-weight: 600; color: #6b7280;
      text-align: left; text-transform: uppercase;
      letter-spacing: .05em; border-bottom: 1px solid #e5e7eb;
    }
    .summary-box {
      display: flex; gap: 12px; margin-top: 12px;
    }
    .summary-cell {
      flex: 1; background: #f9fafb; border: 1px solid #f3f4f6;
      border-radius: 8px; padding: 10px 14px; text-align: center;
    }
    .summary-num { font-size: 20px; font-weight: 700; }
    .summary-lbl { font-size: 10px; color: #9ca3af; margin-top: 2px; }
    .footer {
      margin-top: 48px; padding-top: 16px; border-top: 1px solid #e5e7eb;
      font-size: 11px; color: #9ca3af; text-align: center;
    }
    @media print { body { padding: 32px; } }
  </style>
</head>
<body>

  <div class="header">
    <div>
      <div class="logo">StartupTN</div>
      <div class="generated">
        Generated on ${new Date().toLocaleDateString("en-IN", {
            day: "numeric", month: "long", year: "numeric"
        })}
      </div>
    </div>
    <div style="text-align:right;">
      <div style="font-size:11px;color:#6b7280;">Milestone ${milestone?.orderNumber}</div>
      <div style="font-size:13px;font-weight:600;color:#111827;">
        ${milestone?.title ?? ""}
      </div>
    </div>
  </div>

  <!-- VB Info -->
  <div style="display:flex;justify-content:space-between;
              align-items:flex-start;gap:16px;margin-bottom:28px;">
    <div>
      <h1>${assignment.user.name}</h1>
      <p class="sub">${assignment.user.email}</p>
      ${assignment.user.ventureBuilderProfile?.organizationName
          ? `<p class="sub" style="margin-top:3px;">
               🏢 ${assignment.user.ventureBuilderProfile.organizationName}
             </p>`
          : ""}
    </div>
    <span class="badge"
      style="background:${statusColor[assignment.status] ?? "#6b7280"}">
      ${STATUS_LABELS[assignment.status] ?? assignment.status}
    </span>
  </div>

  <!-- Progress -->
  <div class="section">
    <div class="section-title">Startup progress</div>
    <div style="display:flex;justify-content:space-between;
                align-items:center;margin-bottom:4px;">
      <span style="font-size:12px;color:#6b7280;">
        ${approvedCount} of ${targetCount} startups approved
      </span>
      <span style="font-size:13px;font-weight:700;color:${barColor};">
        ${pct}%
      </span>
    </div>
    <div class="progress-wrap"><div class="progress-fill"></div></div>
    <p style="font-size:12px;color:#6b7280;margin-top:4px;">
      ${pct >= 100
          ? "✅ Target reached"
          : `${targetCount - approvedCount} more startup${
              targetCount - approvedCount !== 1 ? "s" : ""
            } needed`}
    </p>

    <div class="summary-box">
      <div class="summary-cell">
        <div class="summary-num">${approvedCount}</div>
        <div class="summary-lbl">Approved</div>
      </div>
      <div class="summary-cell">
        <div class="summary-num">${targetCount}</div>
        <div class="summary-lbl">Target</div>
      </div>
      <div class="summary-cell">
        <div class="summary-num" style="color:${
            targetCount - approvedCount > 0 ? "#d97706" : "#16a34a"
        }">
          ${Math.max(targetCount - approvedCount, 0)}
        </div>
        <div class="summary-lbl">Remaining</div>
      </div>
      <div class="summary-cell">
        <div class="summary-num">
          ${(assignment.documents || []).length}
        </div>
        <div class="summary-lbl">Batches</div>
      </div>
    </div>
  </div>

  <!-- Key dates -->
  <div class="section">
    <div class="section-title">Status timeline</div>
    <div class="info-grid">
      <div class="info-cell">
        <div class="info-label">Assigned on</div>
        <div class="info-value">${fmt(assignment.createdAt)}</div>
      </div>
      <div class="info-cell">
        <div class="info-label">Deadline</div>
        <div class="info-value">${fmt(assignment.deadline)}</div>
      </div>
      <div class="info-cell">
        <div class="info-label">Last submitted</div>
        <div class="info-value">${fmt(assignment.submittedAt)}</div>
      </div>
      <div class="info-cell">
        <div class="info-label">Last reviewed</div>
        <div class="info-value">${fmt(assignment.reviewedAt)}</div>
      </div>
    </div>
  </div>

  <!-- Batch uploads table -->
  <div class="section">
    <div class="section-title">
      Batch upload history (${(assignment.documents || []).length} batches)
    </div>
    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>Document</th>
          <th style="text-align:center;">Startups</th>
          <th style="text-align:center;">Status</th>
          <th>Remarks</th>
          <th>Admin Feedback</th>
        </tr>
      </thead>
      <tbody>${batchRows}</tbody>
    </table>
  </div>

  ${assignment.adminNote
      ? `<div class="section">
           <div class="section-title">Final admin note</div>
           <div style="background:#fafafa;border:1px solid #e5e7eb;
                       border-radius:10px;padding:12px 14px;
                       font-size:13px;color:#374151;font-style:italic;">
             ${assignment.adminNote}
           </div>
         </div>`
      : ""}

  <div class="footer">
    StartupTN Venture Builder Portal &nbsp;·&nbsp;
    Confidential &nbsp;·&nbsp; ${new Date().getFullYear()}
  </div>

</body>
</html>`

    const win = window.open("", "_blank", "width=960,height=700")
    if (!win) {
        alert("Allow pop-ups to download the report.")
        return
    }
    win.document.write(html)
    win.document.close()
    win.focus()
    setTimeout(() => { win.print(); win.close() }, 700)
}

// ── BatchReviewForm — defined OUTSIDE main component ✅ ───────────────────
function BatchReviewForm({ doc, onReview }) {
    const [feedback, setFeedback]     = useState("")
    const [decision, setDecision]     = useState("")
    const [submitting, setSubmitting] = useState(false)
    const [open, setOpen]             = useState(false)

    const handleSubmit = async () => {
        if (!decision) return
        setSubmitting(true)
        await onReview(decision, feedback)
        setSubmitting(false)
        setOpen(false)
        setFeedback("")
        setDecision("")
    }

    if (!open) {
        return (
            <button onClick={() => setOpen(true)}
                className="mt-1 text-xs bg-amber-500 hover:bg-amber-600
                           text-white px-3 py-1.5 rounded-lg font-medium
                           transition-colors">
                Review this batch
            </button>
        )
    }

    return (
        <div className="mt-2 space-y-2 p-2 bg-white rounded-lg
                        border border-gray-200">
            <p className="text-xs font-medium text-gray-700">
                Decision for this batch
            </p>
            <div className="flex gap-2">
                <button onClick={() => setDecision("APPROVED")}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-medium
                               transition-colors
                               ${decision === "APPROVED"
                            ? "bg-green-600 text-white"
                            : "border border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
                    ✓ Approve batch
                </button>
                <button onClick={() => setDecision("REJECTED")}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-medium
                               transition-colors
                               ${decision === "REJECTED"
                            ? "bg-red-600 text-white"
                            : "border border-gray-200 text-gray-600 hover:bg-gray-50"}`}>
                    ✗ Reject batch
                </button>
            </div>
            <input type="text"
                placeholder="Feedback to VB (optional)"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-gray-200
                           rounded-lg text-xs focus:outline-none
                           focus:ring-2 focus:ring-blue-500
                           placeholder:text-gray-400" />
            <div className="flex gap-2">
                <button onClick={handleSubmit}
                    disabled={!decision || submitting}
                    className="flex-1 py-1.5 bg-blue-600 hover:bg-blue-700
                               disabled:bg-blue-400 disabled:cursor-not-allowed
                               text-white text-xs font-medium rounded-lg
                               transition-colors">
                    {submitting ? "Submitting..." : "Submit review"}
                </button>
                <button onClick={() => { setOpen(false); setDecision("") }}
                    className="px-3 py-1.5 border border-gray-200 text-gray-600
                               text-xs rounded-lg hover:bg-gray-50
                               transition-colors">
                    Cancel
                </button>
            </div>
        </div>
    )
}

// ── VBDetailModal — defined OUTSIDE main component ✅ ─────────────────────
function VBDetailModal({ assignment, milestone, onClose }) {
    if (!assignment) return null

    // ✅ FIXED: use completedCount from approved batches
    const approvedCount = (assignment.documents || [])
        .filter(d => d.batchStatus === "APPROVED")
        .reduce((sum, d) => sum + d.completedCount, 0)

    const targetCount = milestone?.targetCount ?? 0
    const pct         = targetCount > 0
        ? Math.min(Math.round((approvedCount / targetCount) * 100), 100)
        : 0

    const fmt = (dateStr) =>
        dateStr
            ? new Date(dateStr).toLocaleDateString("en-IN", {
                  day: "numeric", month: "short", year: "numeric"
              })
            : null

    const timeline = [
        { label: "Assigned",  date: assignment.createdAt,  dot: "bg-gray-400" },
        { label: "Submitted", date: assignment.submittedAt, dot: "bg-amber-500" },
        { label: "Reviewed",  date: assignment.reviewedAt,  dot: "bg-blue-500" }
    ].filter(t => t.date)

    return (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end
                        sm:items-center justify-center px-0 sm:px-4"
            onClick={onClose}>
            <div className="bg-white w-full sm:max-w-lg rounded-t-2xl
                            sm:rounded-2xl max-h-[90vh] overflow-y-auto shadow-xl"
                onClick={(e) => e.stopPropagation()}>

                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-100
                                px-5 py-4 flex items-start justify-between
                                rounded-t-2xl z-10">
                    <div>
                        <p className="text-sm font-medium text-gray-900">
                            {assignment.user.name}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                            {assignment.user.email}
                        </p>
                        {assignment.user.ventureBuilderProfile
                            ?.organizationName && (
                            <p className="text-xs text-gray-400 mt-0.5">
                                🏢 {assignment.user.ventureBuilderProfile
                                    .organizationName}
                            </p>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <span className={`text-xs px-2.5 py-1 rounded-full
                                         font-medium flex-shrink-0
                                         ${STATUS_COLORS[assignment.status]}`}>
                            {STATUS_LABELS[assignment.status]}
                        </span>
                        <button onClick={onClose}
                            className="p-1.5 rounded-lg text-gray-400
                                       hover:text-gray-600 hover:bg-gray-100
                                       transition-colors">
                            <svg className="w-4 h-4" fill="none"
                                stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round"
                                    strokeLinejoin="round" strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>

                <div className="px-5 py-4 space-y-5">

                    {/* Progress */}
                    <div className="bg-gray-50 rounded-xl p-4 border
                                    border-gray-100">
                        <div className="flex items-center justify-between mb-1">
                            <p className="text-xs font-medium text-gray-700">
                                Startup progress
                            </p>
                            <p className={`text-xs font-medium
                                          ${pct >= 100
                                ? "text-green-600"
                                : "text-blue-600"}`}>
                                {pct}%
                            </p>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                            <div
                                className={`h-2 rounded-full transition-all
                                            duration-700
                                            ${pct >= 100
                                        ? "bg-green-500"
                                        : "bg-blue-600"}`}
                                style={{ width: `${pct}%` }}
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <p className="text-xs text-gray-500">
                                {approvedCount} of {targetCount} startups approved
                            </p>
                            {pct >= 100 && (
                                <span className="text-xs text-green-600 font-medium">
                                    ✅ Target reached
                                </span>
                            )}
                        </div>

                        <div className="grid grid-cols-3 gap-2 mt-3">
                            <div className="bg-white rounded-lg p-2.5 text-center
                                            border border-gray-100">
                                <p className="text-base font-medium text-gray-900">
                                    {approvedCount}
                                </p>
                                <p className="text-xs text-gray-400">Approved</p>
                            </div>
                            <div className="bg-white rounded-lg p-2.5 text-center
                                            border border-gray-100">
                                <p className="text-base font-medium text-gray-900">
                                    {targetCount}
                                </p>
                                <p className="text-xs text-gray-400">Target</p>
                            </div>
                            <div className="bg-white rounded-lg p-2.5 text-center
                                            border border-gray-100">
                                <p className={`text-base font-medium
                                              ${targetCount - approvedCount > 0
                                        ? "text-amber-600"
                                        : "text-green-600"}`}>
                                    {Math.max(targetCount - approvedCount, 0)}
                                </p>
                                <p className="text-xs text-gray-400">Remaining</p>
                            </div>
                        </div>
                    </div>

                    {/* Timeline */}
                    {timeline.length > 0 && (
                        <div>
                            <p className="text-xs font-medium text-gray-700 mb-2.5">
                                Status timeline
                            </p>
                            <div className="space-y-2">
                                {timeline.map((t) => (
                                    <div key={t.label}
                                        className="flex items-center gap-3
                                                   bg-gray-50 rounded-lg px-3
                                                   py-2.5 border border-gray-100">
                                        <span className={`w-2 h-2 rounded-full
                                                         flex-shrink-0 ${t.dot}`} />
                                        <p className="text-xs text-gray-500 w-20
                                                      flex-shrink-0">
                                            {t.label}
                                        </p>
                                        <p className="text-xs font-medium text-gray-800">
                                            {fmt(t.date)}
                                        </p>
                                    </div>
                                ))}
                                {assignment.deadline && (
                                    <div className="flex items-center gap-3
                                                    bg-amber-50 rounded-lg px-3
                                                    py-2.5 border border-amber-100">
                                        <span className="w-2 h-2 rounded-full
                                                         bg-amber-400 flex-shrink-0" />
                                        <p className="text-xs text-amber-600 w-20
                                                      flex-shrink-0">Deadline</p>
                                        <p className="text-xs font-medium text-amber-700">
                                            {fmt(assignment.deadline)}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* ✅ Batch uploads with view + download */}
                    <div>
                        <p className="text-xs font-medium text-gray-700 mb-2.5">
                            Batch uploads
                            <span className="font-normal text-gray-400 ml-1">
                                ({(assignment.documents || []).length} batches)
                            </span>
                        </p>

                        {assignment.documents?.length > 0 ? (
                            <div className="space-y-2">
                                {assignment.documents.map((doc, idx) => (
                                    <div key={doc.id}
                                        className={`rounded-lg px-3 py-2.5 border
                                                   ${doc.batchStatus === "APPROVED"
                                            ? "bg-green-50 border-green-100"
                                            : doc.batchStatus === "REJECTED"
                                                ? "bg-red-50 border-red-100"
                                                : "bg-amber-50 border-amber-100"}`}>

                                        <div className="flex items-center
                                                        justify-between gap-2 mb-1">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs text-gray-400">
                                                    #{idx + 1}
                                                </span>
                                                <span className="text-xs font-medium
                                                                 text-gray-700">
                                                    {doc.name}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1.5
                                                            flex-shrink-0">
                                                <span className="text-xs font-medium
                                                                 text-gray-700">
                                                    +{doc.completedCount}
                                                </span>
                                                <span className={`text-xs px-1.5 py-0.5
                                                                 rounded-full font-medium
                                                                 ${doc.batchStatus === "APPROVED"
                                                        ? "bg-green-100 text-green-700"
                                                        : doc.batchStatus === "REJECTED"
                                                            ? "bg-red-100 text-red-600"
                                                            : "bg-amber-100 text-amber-700"}`}>
                                                    {doc.batchStatus === "APPROVED"
                                                        ? "✓ Approved"
                                                        : doc.batchStatus === "REJECTED"
                                                            ? "✗ Rejected"
                                                            : "⏳ Pending"}
                                                </span>
                                            </div>
                                        </div>

                                        {doc.note && (
                                            <p className="text-xs text-gray-400 mb-1.5">
                                                {doc.note}
                                            </p>
                                        )}

                                        {doc.adminFeedback && (
                                            <p className="text-xs text-gray-500
                                                          italic mb-2">
                                                Feedback: {doc.adminFeedback}
                                            </p>
                                        )}

                                        {/* ✅ View + Download buttons */}
                                        <div className="flex gap-2 mt-1.5">
                                            <a href={doc.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-1.5
                                                           text-xs text-blue-600
                                                           bg-blue-50 hover:bg-blue-100
                                                           border border-blue-100
                                                           px-2.5 py-1 rounded-lg
                                                           transition-colors">
                                                <svg className="w-3 h-3" fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24">
                                                    <path strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M10 6H6a2 2 0 00-2 2v10a2
                                                           2 0 002 2h10a2 2 0 002-2v-4
                                                           M14 4h6m0 0v6m0-6L10 14" />
                                                </svg>
                                                View document
                                            </a>
                                            <a href={doc.url}
                                                download={doc.name}
                                                className="flex items-center gap-1.5
                                                           text-xs text-gray-600
                                                           bg-white hover:bg-gray-50
                                                           border border-gray-200
                                                           px-2.5 py-1 rounded-lg
                                                           transition-colors">
                                                <svg className="w-3 h-3" fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24">
                                                    <path strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M12 10v6m0 0l-3-3m3 3l3-3
                                                           m2 8H7a2 2 0 01-2-2V5a2 2
                                                           0 012-2h5.586a1 1 0
                                                           01.707.293l5.414 5.414a1
                                                           1 0 01.293.707V19a2 2 0
                                                           01-2 2z" />
                                                </svg>
                                                Download
                                            </a>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-xs text-gray-400 bg-gray-50
                                          rounded-lg px-3 py-3 border border-gray-100">
                                No batches uploaded yet
                            </p>
                        )}
                    </div>

                    {/* Admin note */}
                    {assignment.adminNote && (
                        <div>
                            <p className="text-xs font-medium text-gray-700 mb-1.5">
                                Admin note
                            </p>
                            <div className="bg-gray-50 border border-gray-200
                                            rounded-lg px-3 py-2.5">
                                <p className="text-xs text-gray-600 italic">
                                    {assignment.adminNote}
                                </p>
                            </div>
                        </div>
                    )}

                </div>

                {/* Footer — Download PDF */}
                <div className="sticky bottom-0 bg-white border-t border-gray-100
                                px-5 py-3.5">
                    <button
                        onClick={() => generateVBReport(assignment, milestone)}
                        className="w-full flex items-center justify-center gap-2
                                   bg-gray-900 hover:bg-gray-800 text-white
                                   text-sm font-medium py-2.5 rounded-xl
                                   transition-colors">
                        <svg className="w-4 h-4" fill="none"
                            stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0
                                   01-2-2V5a2 2 0 012-2h5.586a1 1 0
                                   01.707.293l5.414 5.414a1 1 0
                                   01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Download PDF report
                    </button>
                </div>

                {/* ✅ Add this inside VBDetailModal, in the footer section */}

                {/* <div className="sticky bottom-0 bg-white border-t border-gray-100
                                px-5 py-3.5 space-y-2">

                    
                    {assignment.user.ventureBuilderProfile && (
                        <DownloadAllDocs
                            profile={assignment.user.ventureBuilderProfile}
                            vbName={assignment.user.name}
                        />
                    )}

                
                    <button
                        onClick={() => generateVBReport(assignment, milestone)}
                        className="w-full flex items-center justify-center gap-2
                                bg-gray-900 hover:bg-gray-800 text-white
                                text-sm font-medium py-2.5 rounded-xl
                                transition-colors">
                        <svg className="w-4 h-4" fill="none"
                            stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0
                                01-2-2V5a2 2 0 012-2h5.586a1 1 0
                                01.707.293l5.414 5.414a1 1 0
                                01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Download PDF report
                    </button>
                </div> */}

            </div>
        </div>
    )
}


// ── DownloadAllDocs Component ─────────────────────────────────────────────
// function DownloadAllDocs({ profile, vbName }) {

//     const [downloading, setDownloading] = useState(false)
//     const [showList, setShowList]       = useState(false)

//     // collect all profile documents
//     const docs = [
//         profile.minimumViableProduct && {
//             label: "MVP journey outcomes",
//             url:   profile.minimumViableProduct,
//             name:  `${vbName}_MVP_document`
//         },
//         profile.legalEntityProof && {
//             label: "Legal entity registration proof",
//             url:   profile.legalEntityProof,
//             name:  `${vbName}_legal_entity_proof`
//         },
//         ...(Array.isArray(profile.pastEngagementDocuments)
//             ? profile.pastEngagementDocuments.map((url, idx) => ({
//                 label: `Past engagement document ${idx + 1}`,
//                 url,
//                 name:  `${vbName}_past_engagement_${idx + 1}`
//               }))
//             : [])
//     ].filter(Boolean)

//     // download single file
//     const downloadFile = (url, filename) => {
//         const a    = document.createElement("a")
//         a.href     = url
//         a.download = filename
//         a.target   = "_blank"
//         document.body.appendChild(a)
//         a.click()
//         document.body.removeChild(a)
//     }

//     // download all one by one with delay
//     const handleDownloadAll = async () => {
//         if (docs.length === 0) return
//         setDownloading(true)

//         for (let i = 0; i < docs.length; i++) {
//             downloadFile(docs[i].url, docs[i].name)
//             // small delay so browser doesn't block multiple downloads
//             await new Promise(r => setTimeout(r, 600))
//         }

//         setDownloading(false)
//     }

//     if (docs.length === 0) return null

//     return (
//         <div className="border border-gray-200 rounded-xl overflow-hidden">

//             {/* Header */}
//             <button
//                 onClick={() => setShowList(!showList)}
//                 className="w-full flex items-center justify-between gap-2
//                            px-4 py-3 bg-gray-50 hover:bg-gray-100
//                            transition-colors text-left">
//                 <div className="flex items-center gap-2">
//                     <svg className="w-4 h-4 text-gray-600 flex-shrink-0"
//                         fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                         <path strokeLinecap="round" strokeLinejoin="round"
//                             strokeWidth={2}
//                             d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0
//                                012-2h5.586a1 1 0 01.707.293l5.414 5.414a1
//                                1 0 01.293.707V19a2 2 0 01-2 2z" />
//                     </svg>
//                     <span className="text-xs font-medium text-gray-700">
//                         Profile documents
//                     </span>
//                     <span className="text-xs bg-blue-50 text-blue-700
//                                      px-2 py-0.5 rounded-full font-medium">
//                         {docs.length}
//                     </span>
//                 </div>
//                 <svg className={`w-4 h-4 text-gray-400 transition-transform
//                                  ${showList ? "rotate-180" : ""}`}
//                     fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round"
//                         strokeWidth={2} d="M19 9l-7 7-7-7" />
//                 </svg>
//             </button>

//             {/* Document list */}
//             {showList && (
//                 <div className="border-t border-gray-200">
//                     {docs.map((doc, idx) => (
//                         <div key={idx}
//                             className="flex items-center justify-between gap-2
//                                        px-4 py-2.5 border-b border-gray-100
//                                        last:border-0">
//                             <div className="flex items-center gap-2 min-w-0">
//                                 <div className="w-7 h-7 rounded-lg bg-blue-50
//                                                 flex items-center justify-center
//                                                 flex-shrink-0">
//                                     <svg className="w-3.5 h-3.5 text-blue-600"
//                                         fill="none" stroke="currentColor"
//                                         viewBox="0 0 24 24">
//                                         <path strokeLinecap="round"
//                                             strokeLinejoin="round" strokeWidth={2}
//                                             d="M9 12h6m-6 4h6m2 5H7a2 2 0
//                                                01-2-2V5a2 2 0 012-2h5.586a1
//                                                1 0 01.707.293l5.414 5.414a1
//                                                1 0 01.293.707V19a2 2 0 01-2 2z" />
//                                     </svg>
//                                 </div>
//                                 <span className="text-xs text-gray-700 truncate">
//                                     {doc.label}
//                                 </span>
//                             </div>
//                             <div className="flex items-center gap-2 flex-shrink-0">
//                                 {/* View */}
//                                 <a href={doc.url}
//                                     target="_blank"
//                                     rel="noopener noreferrer"
//                                     className="text-xs text-blue-600
//                                                hover:underline">
//                                     View
//                                 </a>
//                                 {/* Download single */}
//                                 <button
//                                     onClick={() =>
//                                         downloadFile(doc.url, doc.name)}
//                                     className="text-xs text-gray-500
//                                                hover:text-gray-700 flex
//                                                items-center gap-1">
//                                     <svg className="w-3 h-3" fill="none"
//                                         stroke="currentColor" viewBox="0 0 24 24">
//                                         <path strokeLinecap="round"
//                                             strokeLinejoin="round" strokeWidth={2}
//                                             d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2
//                                                2 0 01-2-2V5a2 2 0 012-2h5.586a1 1
//                                                0 01.707.293l5.414 5.414a1 1 0
//                                                01.293.707V19a2 2 0 01-2 2z" />
//                                     </svg>
//                                     Download
//                                 </button>
//                             </div>
//                         </div>
//                     ))}

//                     {/* Download all button */}
//                     <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
//                         <button
//                             onClick={handleDownloadAll}
//                             disabled={downloading}
//                             className="w-full flex items-center justify-center
//                                        gap-2 bg-blue-600 hover:bg-blue-700
//                                        disabled:bg-blue-400
//                                        disabled:cursor-not-allowed
//                                        text-white text-xs font-medium
//                                        py-2 rounded-lg transition-colors">
//                             {downloading ? (
//                                 <>
//                                     <div className="w-3 h-3 border-2 border-white
//                                                     border-t-transparent rounded-full
//                                                     animate-spin" />
//                                     Downloading {docs.length} files...
//                                 </>
//                             ) : (
//                                 <>
//                                     <svg className="w-3.5 h-3.5" fill="none"
//                                         stroke="currentColor" viewBox="0 0 24 24">
//                                         <path strokeLinecap="round"
//                                             strokeLinejoin="round" strokeWidth={2}
//                                             d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2
//                                                2 0 01-2-2V5a2 2 0 012-2h5.586a1 1
//                                                0 01.707.293l5.414 5.414a1 1 0
//                                                01.293.707V19a2 2 0 01-2 2z" />
//                                     </svg>
//                                     Download all {docs.length} documents
//                                 </>
//                             )}
//                         </button>
//                     </div>
//                 </div>
//             )}
//         </div>
//     )
// }

// ── Main Page ───────────────────────────────────────────────────────────────
export default function AdminMilestoneDetailPage() {

    const { id }            = useParams()
    const { data: session } = useSession()

    const [milestone, setMilestone]     = useState(null)
    const [allVBs, setAllVBs]           = useState([])
    const [loading, setLoading]         = useState(true)
    const [showAssign, setShowAssign]   = useState(false)
    const [selectedVB, setSelectedVB]   = useState("")
    const [deadline, setDeadline]       = useState("")
    const [assigning, setAssigning]     = useState(false)
    const [assignError, setAssignError] = useState("")
    const [toast, setToast]             = useState("")
    const [vbModal, setVbModal]         = useState(null)

    const showToast = (msg) => {
        setToast(msg)
        setTimeout(() => setToast(""), 3000)
    }

    const refreshMilestone = async () => {
        const res  = await fetch(`/api/milestones/${id}`)
        const data = await res.json()
        setMilestone(data.milestone)
    }

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [mRes, vbRes] = await Promise.all([
                    fetch(`/api/milestones/${id}`),
                    fetch("/api/venture-builders")
                ])
                const mData  = await mRes.json()
                const vbData = await vbRes.json()
                setMilestone(mData.milestone)
                setAllVBs(vbData.users || [])
            } catch (error) {
                console.log(error)
            } finally {
                setLoading(false)
            }
        }
        if (id) fetchData()
    }, [id])

    // ✅ handleBatchReview INSIDE main component
    const handleBatchReview = async (
        assignmentId,
        documentId,
        batchStatus,
        adminFeedback
    ) => {
        try {
            const res = await fetch(`/api/assignments/${assignmentId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "reviewBatch",
                    documentId,
                    batchStatus,
                    adminFeedback
                })
            })
            const data = await res.json()
            if (res.ok) {
                await refreshMilestone()
                showToast(
                    data.isComplete
                        ? `🎉 Milestone complete! ${data.newCompletedCount}/${data.targetCount} startups`
                        : `Batch ${batchStatus.toLowerCase()}!`
                )
            }
        } catch (error) {
            console.log(error)
        }
    }

    const handleAssign = async () => {
        if (!selectedVB) return
        setAssigning(true)
        setAssignError("")
        try {
            const res = await fetch(`/api/milestones/${id}/assign`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId:   selectedVB,
                    deadline: deadline || null
                })
            })
            const data = await res.json()
            if (res.ok) {
                await refreshMilestone()
                setSelectedVB("")
                setDeadline("")
                setShowAssign(false)
                showToast("Milestone assigned!")
            } else {
                setAssignError(data.message)
            }
        } catch (error) {
            setAssignError("Something went wrong")
        } finally {
            setAssigning(false)
        }
    }

    const assignedIds   = milestone?.assignments?.map(a => a.user.id) || []
    const unassignedVBs = allVBs.filter(vb => !assignedIds.includes(vb.id))

    const assignments = milestone?.assignments || []
    const total       = assignments.length
    const approved    = assignments.filter(a => a.status === "APPROVED").length
    const submitted   = assignments.filter(a => a.status === "SUBMITTED").length
    const inProgress  = assignments.filter(a => a.status === "IN_PROGRESS").length
    const pending     = assignments.filter(a => a.status === "PENDING").length
    const rejected    = assignments.filter(a => a.status === "REJECTED").length
    const completion  = total > 0
        ? Math.round((approved / total) * 100)
        : 0

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center
                            justify-center">
                <div className="flex items-center gap-3">
                    <div className="w-4 h-4 border-2 border-blue-600
                                    border-t-transparent rounded-full
                                    animate-spin" />
                    <p className="text-sm text-gray-500">Loading milestone...</p>
                </div>
            </div>
        )
    }

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

            {/* VB Detail Modal */}
            <VBDetailModal
                assignment={vbModal}
                milestone={milestone}
                onClose={() => setVbModal(null)}
            />

            {/* Navbar */}
            <nav className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-5xl mx-auto px-5 flex items-center gap-3"
                    style={{ height: "52px" }}>
                    <Link href="/admin/milestones"
                        className="text-gray-400 hover:text-gray-600">
                        <svg className="w-4 h-4" fill="none"
                            stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round"
                                strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </Link>
                    <span className="text-sm font-medium text-gray-900">
                        Milestone {milestone?.orderNumber} — {milestone?.title}
                    </span>
                </div>
            </nav>

            <div className="max-w-5xl mx-auto px-5 py-7">

                {/* Milestone info */}
                <div className="bg-white border border-gray-200 rounded-xl
                                p-5 mb-4">
                    <div className="flex items-start gap-4">
                        <div className="w-11 h-11 rounded-xl bg-blue-50 flex
                                        items-center justify-center flex-shrink-0">
                            <span className="text-blue-600 font-medium text-lg">
                                {milestone?.orderNumber}
                            </span>
                        </div>
                        <div className="flex-1">
                            <h1 className="text-lg font-medium text-gray-900">
                                {milestone?.title}
                            </h1>
                            <p className="text-xs text-gray-400 mt-0.5 mb-4">
                                Target: {milestone?.targetCount} startups per VB
                            </p>
                            {milestone?.description && (
                                <div className="space-y-2">
                                    {milestone.description
                                        .trim()
                                        .split("\n")
                                        .filter(Boolean)
                                        .map((item, i) => (
                                            <div key={i}
                                                className="flex items-start gap-2.5">
                                                <span className="w-5 h-5 rounded-full
                                                                 bg-blue-50 text-blue-600
                                                                 flex items-center
                                                                 justify-center
                                                                 flex-shrink-0
                                                                 text-xs font-medium
                                                                 mt-0.5">
                                                    {i + 1}
                                                </span>
                                                <span className="text-sm text-gray-600">
                                                    {item.replace(/^\d+\.\s*/, "")}
                                                </span>
                                            </div>
                                        ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Progress Report */}
                <div className="bg-white border border-gray-200 rounded-xl
                                p-5 mb-4">
                    <h2 className="text-sm font-medium text-gray-900 mb-4">
                        Progress report
                    </h2>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
                        <div className="bg-gray-50 rounded-xl p-3">
                            <p className="text-xs text-gray-500 mb-1">VBs assigned</p>
                            <p className="text-2xl font-medium text-gray-900">
                                {total}
                            </p>
                            <p className="text-xs text-gray-400 mt-0.5">total</p>
                        </div>
                        <div className="bg-green-50 rounded-xl p-3">
                            <p className="text-xs text-green-600 mb-1">Approved</p>
                            <p className="text-2xl font-medium text-green-700">
                                {approved}
                            </p>
                            <p className="text-xs text-green-600 mt-0.5">complete</p>
                        </div>
                        <div className="bg-amber-50 rounded-xl p-3">
                            <p className="text-xs text-amber-600 mb-1">Submitted</p>
                            <p className="text-2xl font-medium text-amber-700">
                                {submitted}
                            </p>
                            <p className="text-xs text-amber-600 mt-0.5">
                                awaiting review
                            </p>
                        </div>
                        <div className="bg-blue-50 rounded-xl p-3">
                            <p className="text-xs text-blue-600 mb-1">In progress</p>
                            <p className="text-2xl font-medium text-blue-700">
                                {inProgress}
                            </p>
                            <p className="text-xs text-blue-600 mt-0.5">working</p>
                        </div>
                    </div>

                    <div className="mb-4">
                        <div className="flex items-center justify-between mb-1.5">
                            <p className="text-xs font-medium text-gray-700">
                                Overall completion
                            </p>
                            <p className={`text-xs font-medium
                                          ${completion === 100
                                ? "text-green-600"
                                : "text-blue-600"}`}>
                                {completion}%
                            </p>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2">
                            <div
                                className={`h-2 rounded-full transition-all
                                            duration-700
                                            ${completion === 100
                                        ? "bg-green-500"
                                        : "bg-blue-600"}`}
                                style={{ width: `${completion}%` }}
                            />
                        </div>
                        <p className="text-xs text-gray-400 mt-1.5">
                            {approved} of {total} VB
                            {total !== 1 ? "s" : ""} completed
                        </p>
                    </div>

                    <div className="border-t border-gray-100 pt-4">
                        <p className="text-xs font-medium text-gray-700 mb-3">
                            Status breakdown
                        </p>
                        <div className="space-y-2">
                            {[
                                { label: "Approved",    count: approved,
                                  bar: "bg-green-500", text: "text-green-600" },
                                { label: "Submitted",   count: submitted,
                                  bar: "bg-amber-500", text: "text-amber-600" },
                                { label: "In progress", count: inProgress,
                                  bar: "bg-blue-500",  text: "text-blue-600" },
                                { label: "Pending",     count: pending,
                                  bar: "bg-gray-300",  text: "text-gray-500" },
                                { label: "Rejected",    count: rejected,
                                  bar: "bg-red-400",   text: "text-red-600" }
                            ].map(({ label, count, bar, text }) => (
                                <div key={label}
                                    className="flex items-center gap-3">
                                    <p className="text-xs text-gray-500 w-20
                                                  flex-shrink-0">
                                        {label}
                                    </p>
                                    <div className="flex-1 bg-gray-100
                                                    rounded-full h-1.5">
                                        <div
                                            className={`h-1.5 rounded-full
                                                       transition-all ${bar}`}
                                            style={{
                                                width: total > 0
                                                    ? `${Math.round(
                                                        (count / total) * 100
                                                      )}%`
                                                    : "0%"
                                            }}
                                        />
                                    </div>
                                    <p className={`text-xs font-medium w-6
                                                  text-right flex-shrink-0
                                                  ${text}`}>
                                        {count}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Status pills */}
                <div className="grid grid-cols-5 gap-2 mb-4">
                    {Object.entries(STATUS_LABELS).map(([key, label]) => {
                        const count = assignments.filter(
                            a => a.status === key
                        ).length
                        return (
                            <div key={key}
                                className="bg-white border border-gray-200
                                           rounded-xl p-3 text-center">
                                <p className="text-lg font-medium text-gray-900">
                                    {count}
                                </p>
                                <p className="text-xs text-gray-400 mt-0.5">
                                    {label}
                                </p>
                            </div>
                        )
                    })}
                </div>

                {/* Assignments list */}
                <div className="bg-white border border-gray-200 rounded-xl p-5">

                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-sm font-medium text-gray-900">
                            Assigned VBs
                            <span className="text-gray-400 font-normal ml-1.5">
                                ({total})
                            </span>
                        </h2>
                        <button
                            onClick={() => setShowAssign(!showAssign)}
                            className="text-xs bg-blue-600 hover:bg-blue-700
                                       text-white px-3 py-1.5 rounded-lg
                                       transition-colors font-medium">
                            + Assign VB
                        </button>
                    </div>

                    {/* Assign form */}
                    {showAssign && (
                        <div className="mb-4 p-4 bg-gray-50 rounded-xl
                                        border border-gray-200">
                            <p className="text-sm font-medium text-gray-800 mb-3">
                                Select VB and set deadline
                            </p>
                            {assignError && (
                                <p className="text-xs text-red-500 mb-2">
                                    {assignError}
                                </p>
                            )}
                            {unassignedVBs.length === 0 ? (
                                <p className="text-sm text-gray-400">
                                    All VBs are already assigned
                                </p>
                            ) : (
                                <div className="space-y-3">
                                    <select value={selectedVB}
                                        onChange={(e) =>
                                            setSelectedVB(e.target.value)}
                                        className="w-full px-3 py-2 border
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
                                    <div>
                                        <label className="block text-xs
                                                          text-gray-500 mb-1">
                                            Deadline
                                            <span className="text-gray-400 ml-1">
                                                (optional)
                                            </span>
                                        </label>
                                        <input type="date" value={deadline}
                                            onChange={(e) =>
                                                setDeadline(e.target.value)}
                                            className="w-full px-3 py-2 border
                                                       border-gray-200 rounded-lg
                                                       text-sm focus:outline-none
                                                       focus:ring-2
                                                       focus:ring-blue-500" />
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={handleAssign}
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
                                        <button
                                            onClick={() => setShowAssign(false)}
                                            className="px-4 py-2 border
                                                       border-gray-200 text-gray-600
                                                       text-sm rounded-lg
                                                       hover:bg-gray-50
                                                       transition-colors">
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ✅ VB list with per-batch review */}
                    {assignments.length === 0 ? (
                        <div className="text-center py-10">
                            <p className="text-sm text-gray-400">
                                No VBs assigned yet
                            </p>
                            <button onClick={() => setShowAssign(true)}
                                className="mt-3 text-xs text-blue-600
                                           hover:underline font-medium">
                                Assign first VB →
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {assignments.map((assignment) => {
                                const approvedCount = (assignment.documents || [])
                                    .filter(d => d.batchStatus === "APPROVED")
                                    .reduce((sum, d) => sum + d.completedCount, 0)

                                const target = milestone?.targetCount || 0
                                const pct    = target > 0
                                    ? Math.min(100, Math.round(
                                        (approvedCount / target) * 100
                                      ))
                                    : 0

                                return (
                                    <div key={assignment.id}
                                        className="border border-gray-100
                                                   rounded-xl p-4">

                                        {/* VB header */}
                                        <div className="flex items-start
                                                        justify-between gap-3 mb-3">
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium
                                                              text-gray-900">
                                                    {assignment.user.name}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {assignment.user.email}
                                                </p>
                                                {assignment.user
                                                    .ventureBuilderProfile
                                                    ?.organizationName && (
                                                    <p className="text-xs
                                                                  text-gray-400 mt-0.5">
                                                        🏢 {assignment.user
                                                            .ventureBuilderProfile
                                                            .organizationName}
                                                    </p>
                                                )}
                                                {assignment.deadline && (
                                                    <p className="text-xs
                                                                  text-amber-600 mt-1">
                                                        📅 {new Date(assignment.deadline)
                                                            .toLocaleDateString("en-IN",
                                                            {
                                                                day: "numeric",
                                                                month: "short",
                                                                year: "numeric"
                                                            })}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="flex items-center
                                                            gap-2 flex-shrink-0">
                                                <span className={`text-xs px-2.5 py-1
                                                                 rounded-full font-medium
                                                                 ${STATUS_COLORS[
                                                    assignment.status]}`}>
                                                    {STATUS_LABELS[assignment.status]}
                                                </span>
                                                {/* ✅ Details button → opens modal */}
                                                <button
                                                    onClick={() =>
                                                        setVbModal(assignment)}
                                                    className="text-xs border
                                                               border-gray-200
                                                               text-gray-600
                                                               hover:bg-gray-50
                                                               px-2.5 py-1 rounded-lg
                                                               transition-colors
                                                               font-medium">
                                                    Details
                                                </button>
                                            </div>
                                        </div>

                                        {/* Cumulative progress bar */}
                                        <div className="mb-3">
                                            <div className="flex items-center
                                                            justify-between mb-1">
                                                <span className="text-xs text-gray-400">
                                                    {approvedCount}/{target} startups approved
                                                </span>
                                                <span className={`text-xs font-medium
                                                                 ${pct === 100
                                                        ? "text-green-600"
                                                        : "text-gray-500"}`}>
                                                    {pct}%
                                                </span>
                                            </div>
                                            <div className="w-full bg-gray-100
                                                            rounded-full h-1.5">
                                                <div
                                                    className={`h-1.5 rounded-full
                                                               transition-all
                                                               ${pct === 100
                                                            ? "bg-green-500"
                                                            : "bg-blue-500"}`}
                                                    style={{ width: `${pct}%` }}
                                                />
                                            </div>
                                        </div>

                                        {/* Batch history with per-batch review */}
                                        {assignment.documents?.length > 0 && (
                                            <div className="space-y-2">
                                                <p className="text-xs font-medium
                                                              text-gray-500">
                                                    Batch history
                                                    <span className="font-normal ml-1">
                                                        ({assignment.documents.length})
                                                    </span>
                                                </p>
                                                {assignment.documents.map(
                                                    (doc, idx) => (
                                                    <div key={doc.id}
                                                        className={`rounded-lg p-3
                                                                   border
                                                                   ${doc.batchStatus === "APPROVED"
                                                            ? "bg-green-50 border-green-100"
                                                            : doc.batchStatus === "REJECTED"
                                                                ? "bg-red-50 border-red-100"
                                                                : "bg-amber-50 border-amber-200"}`}>

                                                        <div className="flex items-start
                                                                        justify-between
                                                                        gap-2 mb-1.5">
                                                            <div className="flex items-center
                                                                            gap-2 min-w-0">
                                                                <span className="text-xs
                                                                                 text-gray-400
                                                                                 flex-shrink-0">
                                                                    #{idx + 1}
                                                                </span>
                                                                <span className="text-xs
                                                                                 font-medium
                                                                                 text-gray-700
                                                                                 truncate">
                                                                    {doc.name}
                                                                </span>
                                                            </div>
                                                            <div className="flex items-center
                                                                            gap-1.5
                                                                            flex-shrink-0">
                                                                <span className="text-xs
                                                                                 font-medium
                                                                                 text-gray-700">
                                                                    +{doc.completedCount}
                                                                </span>
                                                                <span className={`text-xs
                                                                                 px-1.5 py-0.5
                                                                                 rounded-full
                                                                                 font-medium
                                                                                 ${doc.batchStatus === "APPROVED"
                                                                        ? "bg-green-100 text-green-700"
                                                                        : doc.batchStatus === "REJECTED"
                                                                            ? "bg-red-100 text-red-600"
                                                                            : "bg-amber-100 text-amber-700"}`}>
                                                                    {doc.batchStatus === "APPROVED"
                                                                        ? "✓"
                                                                        : doc.batchStatus === "REJECTED"
                                                                            ? "✗"
                                                                            : "⏳"}
                                                                </span>
                                                            </div>
                                                        </div>

                                                        {doc.note && (
                                                            <p className="text-xs
                                                                          text-gray-400 mb-1.5">
                                                                {doc.note}
                                                            </p>
                                                        )}

                                                        {doc.adminFeedback && (
                                                            <p className="text-xs
                                                                          text-gray-500
                                                                          italic mb-1.5">
                                                                Feedback: {doc.adminFeedback}
                                                            </p>
                                                        )}

                                                        {/* ✅ View + Download per batch */}
                                                        <div className="flex gap-2 mb-1.5">
                                                            <a href={doc.url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="flex items-center
                                                                           gap-1 text-xs
                                                                           text-blue-600
                                                                           hover:underline">
                                                                <svg className="w-3 h-3"
                                                                    fill="none"
                                                                    stroke="currentColor"
                                                                    viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round"
                                                                        strokeLinejoin="round"
                                                                        strokeWidth={2}
                                                                        d="M10 6H6a2 2 0 00-2
                                                                           2v10a2 2 0 002 2h10a2
                                                                           2 0 002-2v-4M14 4h6m0
                                                                           0v6m0-6L10 14" />
                                                                </svg>
                                                                View
                                                            </a>
                                                            <a href={doc.url}
                                                                download={doc.name}
                                                                className="flex items-center
                                                                           gap-1 text-xs
                                                                           text-gray-500
                                                                           hover:text-gray-700">
                                                                <svg className="w-3 h-3"
                                                                    fill="none"
                                                                    stroke="currentColor"
                                                                    viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round"
                                                                        strokeLinejoin="round"
                                                                        strokeWidth={2}
                                                                        d="M12 10v6m0 0l-3-3m3
                                                                           3l3-3m2 8H7a2 2 0
                                                                           01-2-2V5a2 2 0 012-2
                                                                           h5.586a1 1 0
                                                                           01.707.293l5.414
                                                                           5.414a1 1 0
                                                                           01.293.707V19a2 2 0
                                                                           01-2 2z" />
                                                                </svg>
                                                                Download
                                                            </a>
                                                        </div>

                                                        {/* Per-batch review */}
                                                        {doc.batchStatus === "PENDING" && (
                                                            <BatchReviewForm
                                                                doc={doc}
                                                                onReview={(
                                                                    batchStatus,
                                                                    adminFeedback
                                                                ) =>
                                                                    handleBatchReview(
                                                                        assignment.id,
                                                                        doc.id,
                                                                        batchStatus,
                                                                        adminFeedback
                                                                    )}
                                                            />
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

