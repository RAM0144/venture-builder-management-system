"use client"

import { useSession } from "next-auth/react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"

const initialState = {
    name:        "",
    description: "",
    location:    "",
    managerName: "",
    managerEmail: ""
}

export default function CreateHubPage() {

    const { data: session } = useSession()
    const router            = useRouter()

    const [formData, setFormData] = useState(initialState)
    const [loading, setLoading]   = useState(false)
    const [error, setError]       = useState("")
    const [success, setSuccess]   = useState(false)

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
        setError("")
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError("")

        if (!formData.name.trim()) {
            setError("Hub name is required")
            return
        }

         if (!formData.location.trim()) {
            setError("Hub location is required")
            return
        }
        if (!formData.description.trim()) {
            setError("Hub description is required")
            return
        }

         if (!formData.managerName.trim()) {
            setError("Hub managerName is required")
            return
        }

         if (!formData.managerEmail.trim()) {
            setError("Hub email is required")
            return
        }

        setLoading(true)

        try {
            const res = await fetch("/api/hubs", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
             })  

             const data = await res.json()
             if(res.ok){
                setSuccess(true)
                setTimeout(() => {
                    router.push(`/admin/hubs/${data.hub.id}`)
                }, 1500)
             }else{
                setError(data.message || "Something went wrong")
             }

        } catch (error) {
            console.log(error)
            setError("Something went wrong. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50">

            {/* Navbar */}
            <nav className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-5xl mx-auto px-4 h-14 flex items-center gap-2">
                    <Link href="/admin/hubs"
                        className="text-gray-400 hover:text-gray-600">
                        <svg className="w-5 h-5" fill="none"
                            stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round"
                                strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </Link>
                    {/* ✅ span inside nav div */}
                    <span className="font-medium text-gray-900">Create Hub</span>
                </div>
            </nav>

            <div className="max-w-lg mx-auto px-4 py-8">

                <div className="mb-6">
                    <h1 className="text-xl font-medium text-gray-900">
                        Create new hub
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Add a hub and create a manger account
                    </p>
                </div>

                {success && (
                    <div className="mb-4 px-4 py-3 bg-green-50 border
                                    border-green-200 rounded-xl text-sm
                                    text-green-700">
                       ✓ Hub created! Redirecting...
                    </div>
                )}


                {error && (
                    <div className="mb-4 px-4 py-3 bg-red-50 border
                                    border-red-200 rounded-xl text-sm
                                    text-red-600">
                        {error}
                    </div>    
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="bg-white border border-gray-200 rounded-xl p-4">
                      <h2 className="text-sm font-medium text-gray-900 mb-4">
                        Hub details
                      </h2>
                      <div className="space-y-4">

                        <div>
                           <label className="block text-sx font-medium 
                                            text-gray-700 mb-1">
                             Hub name
                             <span className="text-red-500 ml-0.5">*</span>
                           </label>
                           <input type="text" 
                            name="name"
                            placeholder="e.g. Chennai Hub"
                            value={formData.name}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border
                                       border-gray-200 rounded-lg text-sm
                                       focus:outline-none focus:ring-2 
                                       focus:ring-blue-500
                                       focus:border-transparent
                                       placeholder:text-gray-400"
                           />
                        </div>

                        <div>
                            <label className="block text-sm font-medium
                                              text-gray-700 mb-1">
                                Location 
                                <span className="text-red-500 ml-0.5">*</span>
                            </label>
                            <input type="text" 
                             name="location"
                             placeholder="e.g. Chennai, Tamil Nadu"
                             value={formData.location}
                             onChange={handleChange}
                             className="w-full px-3 py-2 border border-gray-200
                                        rounded-lg text-sm focus:outline-none
                                        focus:ring-2 focus:ring-blue-500
                                        focus:border-transparent placeholder:text-gray-400"
                            />
                        </div>

                        <div>
                                <label className="block text-sm font-medium
                                                  text-gray-700 mb-1">
                                    Description
                                    <span className="text-red-500 ml-0.5">
                                        *
                                    </span>
                                </label>
                                <textarea name="description"
                                    placeholder="Brief description of this hub..."
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows={3}
                                    className="w-full px-3 py-2 border
                                               border-gray-200 rounded-lg text-sm
                                               focus:outline-none focus:ring-2
                                               focus:ring-blue-500
                                               placeholder:text-gray-400
                                               resize-none" />
                            </div>

                      </div>
                    </div>

                     {/* ── Hub Manager Account ────────────────────── */}
                     <div className="bg-white border border-gray-200 rounded-xl p-5">
                        <div className="flex items-start justify-between mb-1">
                            <h2 className="text-sm font-medium text-gray-900">
                                Hub manager account
                            </h2>
                        </div>
                        <p className="text-xs text-gray-500 mb-4">
                            Manager will receive an email to set their password
                            and log in to the hub dashboard 
                        </p>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium 
                                                  text-gray-700 mb-1">
                                    Manager name
                                 <span className="text-red-500 ml-0.5">*</span>
                                </label>
                                <input type="text" name="managerName"
                                  placeholder="e.g. ram"
                                    value={formData.managerName}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border
                                               border-gray-200 rounded-lg text-sm
                                               focus:outline-none focus:ring-2
                                               focus:ring-blue-500
                                               placeholder:text-gray-400" 
                                />
                            </div>

                              <div>
                                <label className="block text-sm font-medium
                                                  text-gray-700 mb-1">
                                    Manager email
                                     <span className="text-red-500 ml-0.5">*</span>
                                </label>
                                <input name="managerEmail" type="email"
                                    placeholder="manager@hub.com"
                                    value={formData.managerEmail}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border
                                               border-gray-200 rounded-lg text-sm
                                               focus:outline-none focus:ring-2
                                               focus:ring-blue-500
                                               placeholder:text-gray-400" />
                            </div>   

                        </div>

                        {/* Info box */}
                        {formData.managerEmail && (
                            <div className="mt-3 px-3 py-2.5 bg-blue-50 border
                                            border-blue-100 rounded-lg">
                                <p className="text-xs text-blue-700">
                                    📧 An invite email will be sent to{" "}
                                    <span className="font-medium">
                                        {formData.managerEmail}
                                    </span>{" "}
                                    with a link to set their password
                                </p>
                            </div>
                        )}
                     </div>
                     <button type="submit" disabled={loading}
                       className="w-full py-2.5 bg-blue-600 hover:bg-blue-700
                                   disabled:bg-blue-400 disabled:cursor-not-allowed
                                   text-white text-sm font-medium rounded-lg
                                   transition-colors">
                        {loading ? "Creating..." : "Create hub"}
                     </button>
                </form>

            </div>
        </div>
    )
}


