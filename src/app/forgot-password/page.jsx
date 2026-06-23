"use client"
import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import logo from "../assets/logo.png"

export default function ForgotPassword() {

    const [email, setEmail] = useState("")
    const [loading, setLoading] = useState(false)
    const [sent, setSent] = useState(false)
    const [error, setError] = useState("")

    const handleSubmit = async(e) => {
        e.preventDefault()
        setLoading(true)
        setError("")

        try {
             await fetch("/api/forgot-password", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({email})
            })
            //always show success — don't reveal if email exists
            setSent(true)
        } catch (error) {
            console.log(error)
            setError("Something went wrong. Please try again")
        } finally{
            setLoading(false)
        }
    }

    if(sent){
        return(
            <div className="min-h-screen flex items-center justify-center
                            bg-gray-50 px-4">

                <div className="w-full max-w-sm bg-white border border-gray-200
                                rounded-2xl p-8 shadow-sm text-center">

                    <div className="w-11 h-11 rounded-xl bg-green-50 flex
                                    items-center justify-center mx-auto mb-3">
                        <svg className="w-6 h-6 text-green-600" fill="none"
                            stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round"
                                strokeWidth={2}
                                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5
                                   19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2
                                   0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                    </div>

                    <h1 className="text-lg font-medium text-gray-900 mb-2">
                        Check your inbox
                    </h1>
                    <p className="text-sm text-gray-500 mb-2">
                        If <span className="font-medium text-gray-700">
                            {email}
                        </span> is registered, you'll receive a reset link shortly.
                    </p>
                    <p className="text-xs text-gray-400 mb-6">
                        Check your spam folder if you don't see it.
                    </p>

                    <Link href="/login"
                        className="text-sm text-blue-600 font-medium
                                   hover:underline">
                        ← Back to sign in
                    </Link>

                </div>
            </div>
        )
    }

    return(
        <div className="min-h-screen bg-gray-50 flex flex-col">

           <nav className="bg-white border-b border-gray-200 w-full">
                                                <div className="max-w-4xl mx-auto px-6 h-13 flex items-center">
                                                  <div className="flex items-center gap-3">
                                                    <Image src={logo} alt="Logo"
                                                          width={120} height={40} loading="eager"
                                                          className="w-auto h-auto"/>
                                                  </div>
                                                </div>
                    </nav>

            <div className="flex-1 flex items-center justify-center px-4 py-10">
                 <div className="w-full max-w-sm bg-white border border-gray-200 rounded-2xl
               shadow-sm p-8">
              <div className="text-center mb-6">
                    <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center 
                                    justify-center mx-auto mb-3">
                        <svg className="w-6 h-6 text-blue-600" fill="none"
                            stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 
                                   17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 
                                   01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                        </svg>

                    </div>
                     <h1 className="text-lg font-medium text-gray-900">Forgot password?</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Enter your email and we'll send a reset link
                    </p>
                </div>

                {/* Info box */}
                <div className="mb-4 px-3 py-2 bg-blue-50 border border-blue-100 
                                rounded-lg text-sm text-blue-700 flex gap-2">
                    <span className="mt-0.5">ℹ️</span>
                    <span>We'll send a link valid for 1 hour. Check spam if not received.</span>
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
                            Email address
                        </label>
                        <input
                            type="email"
                            placeholder="ram@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
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
                        {loading ? "Sending..." : "Send reset link"}
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
        </div>
    )
}