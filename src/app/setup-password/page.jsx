"use client"
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";


export default function SetupPasswordPage() {

    const router = useRouter()
    const searchParams = useSearchParams()
    const token = searchParams.get("token")

    const [formData, setFormData] = useState({
        password: "",
        confirmPassword: ""
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")

    const handleChange = async (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
        setError("")
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError("")
        // Validate passwords match
        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match")
            return
        }

        // Validate password length
        if (formData.password.length < 8) {
            setError("Password must be at least 8 characters")
            return
        }

        if (!token) {
            setError("Invalid or missing reset token")
            return
        }

        setLoading(true)

        try {
            const res = await fetch("/api/setup-password", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    token,
                    password: formData.password
                })
            })
            const data = await res.json()

            if (res.ok) {
                setSuccess(true)
                setTimeout(() => router.push("/login"), 3000);
            } else {
                setError(data.message || "Something went wrong")
            }

            // setup-password/page.jsx — update the redirect
            // if (res.ok) {
            //     // redirect based on role
            //     if (data.role === "HUB") {
            //         router.push("/hub")
            //     } else if (data.role === "VB") {
            //         router.push("/VB-dashboard")
            //     } else {
            //         router.push("/login")
            //     }
            // }

        } catch (error) {
            console.log(error)
            setError("Something went wrong. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    if (!token) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
                <div className="w-full max-w-sm bg-white border border-gray-200
                               rounded-2xl p-8 shadow-sm text-center">
                    <div className="w-11 h-11 rounded-xl bg-red-50 flex items-center 
                                    justify-center mx-auto mb-3">
                        <svg className="w-6 h-6 text-red-500" fill="none"
                            stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round"
                                strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </div>
                    <h1 className="text-lg font-medium text-gray-900 mb-2">
                        Invalid
                    </h1>
                    <p className="text-sm text-gray-500 mb-4">
                        This reset link is invalid or has expired.
                    </p>
                    <Link href="/"
                        className="text-sm text-blue-600 font-medium hover:underline"
                    >
                        Request a new link
                    </Link>
                </div>
            </div>
        )
    }

    //Success state
    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
                <div className="w-full max-w-sm bg-white border border-gray-200
                                 rounded-2xl p-8 shadow-sm text-center">
                    <div className="w-11 h-11 rounded-xl bg-green-50 flex items-center 
                                    justify-center mx-auto mb-3">
                        <svg className="w-6 h-6 text-green-600" fill="none"
                            stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round"
                                strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h1 className="text-lg font-medium text-gray-900 mb-2">
                        Password set!
                    </h1>
                    <p className="text-sm text-gray-500 mb-4">
                        Redirected you to sign in...
                    </p>
                    <Link href="/login"
                        className="text-sm text-blue-600 font-medium hover:underline">
                        Go to sign in
                    </Link>
                </div>
            </div>
        )
    }


    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
            
            <nav>
                
            </nav>

            <div className="w-full max-w-sm bg-white border border-gray-200
                           rounded-2xl p-8 shadow-sm">

                <div className="text-center mb-6">
                    <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center
                           justify-center mx-auto mb-3">
                        <svg className="w-6 h-6 text-blue-600" fill="none"
                            stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 
                                   2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 
                                   0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 
                                   9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                    </div>
                    <h1 className="text-lg font-medium text-gray-900">Set Your Password</h1>
                </div>

                {/* Error */}
                {error && (
                    <div className="mb-4 px-3 py-2 bg-red-50 border border-red-200 
                                    rounded-lg text-sm text-red-600">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            New password
                        </label>
                        <input
                            name="password"
                            type="password"
                            placeholder="Min. 8 characters"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg 
                                       text-sm focus:outline-none focus:ring-2 
                                       focus:ring-blue-500 focus:border-transparent 
                                       placeholder:text-gray-400"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Confirm password
                        </label>
                        <input
                            name="confirmPassword"
                            type="password"
                            placeholder="Repeat your password"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg 
                                       text-sm focus:outline-none focus:ring-2 
                                       focus:ring-blue-500 focus:border-transparent 
                                       placeholder:text-gray-400"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-2.5 bg-blue-600 hover:bg-blue-700
                                   disabled:bg-blue-400 disabled:cursor-not-allowed
                                   text-white text-sm font-medium rounded-lg 
                                   transition-colors">
                        {loading ? "Saving..." : "Set password"}
                    </button>
                </form>
                <p className="text-center text-sm text-gray-500 mt-4">
                    <Link href="/login"
                        className="text-blue-600 font-medium hover:underline">
                        ← Back to sign in
                    </Link>
                </p>
            </div>

        </div>
    )
}