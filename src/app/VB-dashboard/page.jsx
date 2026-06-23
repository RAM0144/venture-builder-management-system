"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { signOut, useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import "@tabler/icons-webfont/dist/tabler-icons.min.css";
import logo from "../assets/logo.png"
import Image from "next/image"

export default function VBDashboardPage() {

    const { data: session, status } = useSession()
    const router = useRouter()

    const [loading, setLoading]         = useState(true)
    const [profile, setProfile]         = useState(null)
    const [assignments, setAssignments] = useState([])
  
    useEffect(() => {
        if (status === "unauthenticated") router.push("/login")
        if (status === "authenticated" && session.user.role !== "VB") {
            router.push("/admin")
        }
    }, [status, session])

        useEffect(() => {
        const fetchProfile = async () => {
            try {
                const [profileRes, milestonesRes] = await Promise.all([
                    fetch("/api/venture-builders/profile"),
                    fetch("/api/venture-builders/milestones")
                ])

                const profileData    = await profileRes.json()
                const milestonesData = await milestonesRes.json()

                if (profileData.profile) setProfile(profileData.profile)
                setAssignments(milestonesData.assignments || [])
            } catch (error) {
                console.error(error)
            } finally {
                setLoading(false)
            }
        }

        if (session?.user?.role === "VB") fetchProfile()
    }, [session])

    // calculate completion from profile fields
    // const getCompletion = (profile) => {
    //     if (!profile) return 0
    //     const fields = [
    //         profile.organizationName,
    //         profile.legalEntityType,
    //         profile.registrationNumber,
    //         profile.registeredOfficeAddress,
    //         profile.contactPersonName,
    //         profile.contactPersonEmail,
    //         profile.contactPersonMobile,
    //         profile.founderExperience,
    //         profile.minimumViableProduct,
    //         profile.mentorNetworkAccess,
    //         profile.startupFrameworkApproach,
    //         profile.startupTargetUnderstanding,
    //         profile.startupTargetComments ,
    //         profile.coordinationCommitment,
    //         profile.tier2Tier3Strategy,
    //         profile.legalEntityProof,
    //         profile.pastEngagementDocuments,
    //         profile.declarationAccuracy,
    //         profile.declarationSchemeUnderstanding
    //     ]
    //     const filled = fields.filter(Boolean).length
    //     return Math.round((filled / fields.length) * 100)
    // }

    const completion = profile?.profileCompleted || 0

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

    if (status === "loading" || loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center
                            justify-center">
                <div className="flex items-center gap-3">
                    <div className="w-4 h-4 border-2 border-blue-600
                                    border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm text-gray-500">Loading dashboard...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50">

            {/* Navbar */}
            <nav className="bg-white border-b border-gray-200 sticky top-0 z-20 px-4 py-3">
                <div className="max-w-6xl mx-auto px-6 h-13 flex items-center
                                justify-between" style={{ height: "52px" }}>

                    <div className="flex items-center gap-3">
                        <Image src={logo} alt="StartupTN Logo"
                            width={120} height={40} loading="eager"
                            className="w-auto h-auto"/>
                        <span className="text-xs bg-blue-50 text-blue-700
                                         border border-blue-200 px-2 py-0.5
                                         rounded-full font-medium">
                            Venture Builder
                        </span>
                    </div>

                    <div className="flex items-center gap-3">
                        <span className="text-medium text-gray-500 hidden sm:block">
                            {session?.user?.name}
                        </span>
                        <div className="w-7 h-7 rounded-full bg-blue-50
                                        text-blue-700 text-medium font-medium
                                        flex items-center justify-center">
                            {session?.user?.name?.charAt(0)}
                        </div>
                        <button
                            onClick={() => signOut({ callbackUrl: "/login" })}
                            className="text-medium text-red-600 bg-red-50 border
                                       border-red-200 px-3 py-1.5 rounded-lg
                                       hover:bg-red-100 transition-colors">
                            Sign out
                        </button>
                    </div>
                </div>
            </nav>

            <div className="max-w-6xl mx-auto px-4 py-3">

                {/* Page header */}
                <div className="mb-6">
                    <h1 className="text-xl font-medium text-gray-900">
                        Welcome back, {session?.user?.name?.split(" ")[0]} 👋
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Manage your Venture Builder profile and StartupTN activities
                    </p>
                </div>

                {/* Incomplete profile banner */}
                {!profile && (
                    <div className="bg-amber-50 border border-amber-200
                                    rounded-xl p-4 mb-5 flex items-center
                                    justify-between gap-3 flex-wrap">
                        <div>
                            <p className="text-sm font-medium text-amber-800">
                                Complete your profile
                            </p>
                            <p className="text-xs text-amber-600 mt-0.5">
                                Fill in organization details to unlock full access
                            </p>
                        </div>
                        <Link href="/VB-dashboard/profile"
                            className="text-xs font-medium bg-amber-600
                                       hover:bg-amber-700 text-white px-4 py-2
                                       rounded-lg transition-colors whitespace-nowrap">
                            Complete now →
                        </Link>
                    </div>
                )}

                {/* Stats row */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-5">
                    {[
                        {
                            icon: "ti-chart-bar",
                            color: "bg-blue-50 text-blue-600",
                            label: "Profile completion",
                            value: `${completion}%`
                        },
                        {
                            icon: "ti-building",
                            color: "bg-green-50 text-green-600",
                            label: "Organization",
                            value: profile?.organizationName || "Not added"
                        },
                        {
                            icon: "ti-file-description",
                            color: "bg-amber-50 text-amber-600",
                            label: "Legal entity",
                            value: profile?.legalEntityType || "Not added"
                        },
                        {
                            icon: "ti-hash",
                            color: "bg-gray-100 text-gray-500",
                            label: "Registration no.",
                            value: profile?.registrationNumber || "Not added"
                        }
                    ].map(({ icon, color, label, value }) => (
                        <div key={label}
                            className="bg-white border border-gray-200
                                       rounded-xl p-5">
                            <div className={`w-8 h-8 rounded-lg flex items-center
                                            justify-center mb-3 text-sm ${color}`}>
                                <i className={`ti ${icon}`} aria-hidden="true" />
                            </div>
                            <p className="text-xs text-gray-500 mb-1">{label}</p>
                            <p className="text-sm font-medium text-gray-900
                                          truncate">
                                {value}
                            </p>
                        </div>
                    ))}
                </div>

                
                {/* Profile completion bar */}
                <div className="bg-white border border-gray-200 rounded-xl
                                p-5 mb-5">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">
                            Profile completion
                        </span>
                        <span className={`text-sm font-medium
                                         ${completion === 100
                                ? "text-green-600"
                                : "text-blue-600"}`}>
                            {completion}%
                        </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5 mb-2">
                        <div
                            className={`h-1.5 rounded-full transition-all
                                        duration-500
                                        ${completion === 100
                                    ? "bg-green-500"
                                    : "bg-blue-600"}`}
                            style={{ width: `${completion}%` }}
                        />
                    </div>
                    <p className="text-xs text-gray-400">
                        {completion === 100
                            ? "Profile complete! You can now submit milestones."
                            : "Complete all sections — required for milestone submissions"}
                    </p>
                </div>

                {/* Quick actions */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">

                    <div className="bg-white border border-gray-200 rounded-xl p-5">
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <p className="text-sm font-medium text-gray-900">
                                    Profile
                                </p>
                                <p className="text-xs text-gray-500 mt-0.5">
                                    Manage VB details
                                </p>
                            </div>
                            <div className="w-9 h-9 rounded-xl bg-blue-50
                                            flex items-center justify-center">
                                <i className="ti ti-user-circle text-blue-600"
                                   style={{ fontSize: "18px" }} aria-hidden="true" />
                            </div>
                        </div>
                        <Link href="/VB-dashboard/profile"
                            className="block text-center text-xs font-medium
                                       bg-blue-600 hover:bg-blue-700 text-white
                                       py-2.5 rounded-lg transition-colors">
                            {profile ? "Edit profile" : "Create profile"}
                        </Link>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-xl p-5">
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <p className="text-sm font-medium text-gray-900">
                                    Documents
                                </p>
                                <p className="text-xs text-gray-500 mt-0.5">
                                    Upload supporting files
                                </p>
                            </div>
                            <div className="w-9 h-9 rounded-xl bg-green-50
                                            flex items-center justify-center">
                                <i className="ti ti-folder text-green-600"
                                   style={{ fontSize: "18px" }} aria-hidden="true" />
                            </div>
                        </div>
                        <Link href="/VB-dashboard/profile"
                            className="block text-center text-xs font-medium
                                       bg-green-600 hover:bg-green-700 text-white
                                       py-2.5 rounded-lg transition-colors">
                            Upload documents
                        </Link>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-xl p-5">
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <p className="text-sm font-medium text-gray-900">
                                    Milestones
                                </p>
                                <p className="text-xs text-gray-500 mt-0.5">
                                    Track your progress
                                </p>
                            </div>
                            <div className="w-9 h-9 rounded-xl flex items-center
                                            justify-center"
                                style={{ background: "#EEEDFE" }}>
                                <i className="ti ti-trophy"
                                   style={{ fontSize: "18px", color: "#534AB7" }}
                                   aria-hidden="true" />
                            </div>
                        </div>
                        <Link href="/VB-dashboard/milestones"
                            className="block text-center text-xs font-medium
                                       text-white py-2.5 rounded-lg
                                       transition-colors"
                            style={{ background: "#534AB7" }}
                            onMouseEnter={e =>
                                e.target.style.background = "#3C3489"}
                            onMouseLeave={e =>
                                e.target.style.background = "#534AB7"}>
                            View milestones
                        </Link>
                    </div>

                </div>

                {/* Milestone overview */}
                {assignments.length > 0 && (
                    <div className="bg-white border border-gray-200
                                    rounded-xl p-5 mb-5">
                        <div className="flex items-center justify-between mb-4">
                            <p className="text-sm font-medium text-gray-900">
                                Milestone overview
                            </p>
                            <Link href="/VB-dashboard/milestones"
                                className="text-xs text-blue-600 hover:underline">
                                View all →
                            </Link>
                        </div>

                        <div className="space-y-1">
                            {assignments.map((assignment) => (
                                <div key={assignment.id}
                                    className="flex items-center gap-3 py-2.5
                                               border-b border-gray-100 last:border-0">
                                    <div className="w-7 h-7 rounded-full
                                                    bg-blue-50 text-blue-600
                                                    text-xs font-medium flex
                                                    items-center justify-center
                                                    flex-shrink-0">
                                        {assignment.milestone.orderNumber}
                                    </div>
                                    <p className="text-sm text-gray-700 flex-1">
                                        {assignment.milestone.title}
                                    </p>
                                    <span className={`text-xs font-medium px-2.5
                                                     py-1 rounded-full
                                                     ${STATUS_COLORS[
                                        assignment.status]}`}>
                                        {STATUS_LABELS[assignment.status]}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Organization details */}
                {profile && (
                    <div className="bg-white border border-gray-200 rounded-xl p-5">
                        <div className="flex items-center justify-between mb-5">
                            <p className="text-sm font-medium text-gray-900">
                                Organization details
                            </p>
                            <Link href="/VB-dashboard/profile"
                                className="text-xs text-blue-600 hover:underline">
                                Edit →
                            </Link>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-4">
                            {[
                                {
                                    label: "Organization",
                                    value: profile.organizationName
                                },
                                {
                                    label: "Legal entity",
                                    value: profile.legalEntityType
                                },
                                {
                                    label: "Registration no.",
                                    value: profile.registrationNumber
                                },
                                {
                                    label: "Contact person",
                                    value: profile.contactPersonName
                                },
                                {
                                    label: "Email",
                                    value: profile.contactPersonEmail
                                },
                                {
                                    label: "Mobile",
                                    value: profile.contactPersonMobile
                                }
                            ].map(({ label, value }) => (
                                <div key={label}>
                                    <p className="text-xs text-gray-400 uppercase
                                                  tracking-wide mb-1"
                                        style={{ letterSpacing: "0.04em" }}>
                                        {label}
                                    </p>
                                    <p className="text-sm font-medium text-gray-900">
                                        {value || "—"}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

            </div>
        </div>
    )
}


