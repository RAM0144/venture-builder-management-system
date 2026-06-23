"use client"

import { useSession } from "next-auth/react"
import Link from "next/link"
import { useState } from "react"

const initialState = {
    name: "",
    email: "",
    phone: ""
}

export default function CreateVB() {

     
    const [formData, setFormData] = useState(initialState)
    const [loading, setLoading]   = useState(false)
    const [error, setError]       = useState("")
    const [success, setSuccess]   = useState(false)

    const handleChange = (e) => {
        setFormData({
            ...formData, [e.target.name]: e.target.value
        })
        setError("")
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError("")
        if(!formData.name || !formData.email){
            setError("Name and email are required")
        }

        setLoading(true)

        try {
            const res = await fetch("/api/invite", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            })

            const data = await res.json()
            if(res.ok){
                setSuccess(true)
                setFormData(initialState)
            }else {
                setError(data.message || "Something went wrong")
            }
        } catch (error) {
            console.log(error)
            setError("Something went wrong. Please try again.")
        }finally{
            setLoading(false)
        }
    }

    return(
        <div className="min-h-screen bg-gray-50">
           {/* Navbar */}
            <nav className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-5xl mx-auto px-4 h-14 flex items-center gap-2">
                    <Link href="/admin/venture-builders"
                        className="text-gray-400 hover:text-gray-600">
                        <svg className="w-5 h-5" fill="none"
                            stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round"
                                strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </Link>
                    <span className="font-medium text-gray-900">
                        Add Venture Builder
                    </span>
                </div>
            </nav>

            <div className="max-w-lg mx-auto px-4 py-8">
                 <div className="mb-6">
                    <h1 className="text-xl font-medium text-gray-900">
                        Create VB account
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        An invite email will be sent to set up their password
                    </p>
                </div>

                {/* Success state */}
                {success && (
                    <div className="mb-5 px-4 py-4 bg-green-50 border
                                    border-green-200 rounded-xl">
                        <div className="flex items-center gap-2 mb-2">
                            <svg className="w-4 h-4 text-green-600" fill="none"
                                stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round"
                                    strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <p className="text-sm font-medium text-green-800">
                                VB created and invite sent!
                            </p>
                        </div>
                        <p className="text-xs text-green-700">
                            An invite email has been sent. The VB will set up
                            their password using the link.
                        </p>
                        <div className="flex gap-3 mt-3">
                            <button
                                onClick={() => setSuccess(false)}
                                className="text-xs text-green-700 font-medium
                                           hover:underline">
                                Add another VB
                            </button>
                            <Link href="/admin/venture-builders"
                                className="text-xs text-green-700 font-medium
                                           hover:underline">
                                View all VBs →
                            </Link>
                        </div>
                    </div>
                )}

                {/* Form */}
                <div className="bg-white border border-gray-200 rounded-2xl p-6">
                     {error && (
                        <div className="mb-4 px-3 py-2 bg-red-50 border
                                        border-red-200 rounded-lg text-sm
                                        text-red-600">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium
                                              text-gray-700 mb-1">
                                Full name
                                <span className="text-red-500 ml-0.5">*</span>
                            </label>
                            <input name="name" type="text"
                                placeholder="e.g. Ram Kumar"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                className="w-full px-3 py-2 border border-gray-200
                                           rounded-lg text-sm focus:outline-none
                                           focus:ring-2 focus:ring-blue-500
                                           focus:border-transparent
                                           placeholder:text-gray-400" />
                        </div>

                        <div>
                            <label className="block text-sm font-medium
                                              text-gray-700 mb-1">
                                Email address
                                <span className="text-red-500 ml-0.5">*</span>
                            </label>
                            <input name="email" type="email"
                                placeholder="ram@example.com"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                className="w-full px-3 py-2 border border-gray-200
                                           rounded-lg text-sm focus:outline-none
                                           focus:ring-2 focus:ring-blue-500
                                           focus:border-transparent
                                           placeholder:text-gray-400" />
                            <p className="text-xs text-gray-400 mt-1">
                                Invite will be sent to this email
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium
                                              text-gray-700 mb-1">
                                Phone number
                                <span className="text-xs text-gray-400 ml-1">
                                    (optional)
                                </span>
                            </label>
                            <input name="phone" type="tel"
                                placeholder="+91 98765 43210"
                                value={formData.phone}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-200
                                           rounded-lg text-sm focus:outline-none
                                           focus:ring-2 focus:ring-blue-500
                                           focus:border-transparent
                                           placeholder:text-gray-400" />
                        </div>

                        <div className="pt-2">
                            <button type="submit" disabled={loading}
                                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700
                                           disabled:bg-blue-400
                                           disabled:cursor-not-allowed
                                           text-white text-sm font-medium
                                           rounded-lg transition-colors">
                                {loading
                                    ? "Creating and sending invite..."
                                    : "Create account and send invite"}
                            </button>
                        </div>
                    </form>
                </div>
                 {/* Info box */}
                <div className="mt-4 px-4 py-3 bg-blue-50 border border-blue-100
                                rounded-xl text-sm text-blue-700">
                    <p className="font-medium mb-1">What happens next?</p>
                    <ol className="text-xs text-blue-600 space-y-1 list-decimal
                                   list-inside">
                        <li>VB receives invite email with a magic link</li>
                        <li>VB clicks the link and sets their password</li>
                        <li>VB logs in and fills their profile details</li>
                    </ol>
                </div>
            </div>
         </div>   
    )
}