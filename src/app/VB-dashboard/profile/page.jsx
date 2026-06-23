"use client"

import { useEffect, useState } from "react"
import { useSession }          from "next-auth/react"
import { useRouter }           from "next/navigation"
import Link                    from "next/link"
import VBProfileForm           from "@/components/VBProfileForm"

export default function VBProfilePage() {

    const { data: session, status } = useSession()
    const router = useRouter()

    const [initialData, setInitialData] = useState(null)
    const [loading, setLoading]         = useState(true)

    useEffect(() => {
        if (status === "unauthenticated") router.push("/login")
        if (status === "authenticated" && session?.user?.role !== "VB") {
            router.push("/login")
        }
    }, [status, session])

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res  = await fetch("/api/venture-builders/profile")
                const data = await res.json()
                if (data.profile) setInitialData(data.profile)
            } catch (err) {
                console.log(err)
            } finally {
                setLoading(false)
            }
        }
        if (session?.user?.role === "VB") fetchProfile()
    }, [session])

    if (status === "loading" || loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center
                            justify-center">
                <div className="flex items-center gap-3">
                    <div className="w-4 h-4 border-2 border-blue-600
                                    border-t-transparent rounded-full
                                    animate-spin" />
                    <p className="text-sm text-gray-500">Loading profile...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50">

            {/* Navbar */}
            <nav className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-4xl mx-auto px-5 flex items-center
                                justify-between" style={{ height: "52px" }}>
                    <div className="flex items-center gap-3">
                        {/* ✅ back to /vb not /VB-dashboard */}
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
                            {initialData ? "Edit Profile" : "Complete Profile"}
                        </span>
                    </div>
                    <span className="text-xs bg-blue-50 text-blue-700
                                     px-2.5 py-1 rounded-full font-medium">
                        Venture Builder
                    </span>
                </div>
            </nav>

            <div className="max-w-4xl mx-auto px-5 py-8">

                <div className="mb-6">
                    <h1 className="text-xl font-medium text-gray-900">
                        Venture Builder Application Form
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Fill in your organization and experience details
                    </p>
                </div>

                {/* ✅ Shared form component */}
                <VBProfileForm
                    apiUrl="/api/venture-builders/profile"
                    method="POST"
                    backHref="/VB-dashboard"
                    backLabel="← Back to dashboard"
                    prefillEmail={session?.user?.email || ""}
                    initialData={initialData}
                />
            </div>
        </div>
    )
}