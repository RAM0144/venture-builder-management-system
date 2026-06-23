"use client"

import { useSession } from "next-auth/react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

//  List All VBs
export default function VentureBuildersList() {

    const { data: session, status } = useSession()
    const router = useRouter()    

    const [vbs, setVbs]         = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch]   = useState("")

    useEffect(() => {
        if (status === "unauthenticated") router.push("/login")
    }, [status])

    useEffect(() => {
        const fetchVBs = async () => {
            try {
               const res = await fetch("/api/venture-builders")
               const data = await res.json()
               setVbs(data.users || []) 
            } catch (error) {
                console.log(error)
            }finally{
                setLoading(false)
            }
        }
        if(session?.user?.role === "ADMIN") fetchVBs()
    },[session])

    const filtered = vbs.filter(vb =>
        vb.name.toLowerCase().includes(search.toLowerCase()) ||
        vb.email.toLowerCase().includes(search.toLowerCase()) ||
        vb.profile?.startupName?.toLowerCase().includes(search.toLowerCase())
    )

    return(
        <div className="min-h-screen bg-gray-50">
            
            {/* Navbar */}
            <nav className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-5xl mx-auto px-4 h-14 flex items-center
                                justify-between">
                    <div className="flex items-center gap-2">
                        <Link href="/admin"
                            className="text-gray-400 hover:text-gray-600">
                            <svg className="w-5 h-5" fill="none"
                                stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round"
                                    strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </Link>
                        <span className="font-medium text-gray-900">
                            Venture Builders
                        </span>
                    </div>
                    <Link href="/admin/venture-builders/create"
                        className="text-sm bg-blue-600 hover:bg-blue-700 text-white
                                   px-4 py-1.5 rounded-lg transition-colors">
                        + Add VB
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
                    <input
                        type="text"
                        placeholder="Search by name, email or startup..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 border border-gray-200
                                   rounded-xl text-sm focus:outline-none
                                   focus:ring-2 focus:ring-blue-500
                                   placeholder:text-gray-400 bg-white"
                    />
                </div>

                {/* List */}
                {loading ? (
                    <div className="space-y-3">
                        {[...Array(4)].map((_, i) => (
                            <div key={i}
                                className="animate-pulse bg-white border
                                           border-gray-200 rounded-2xl p-5">
                                <div className="h-4 bg-gray-200 rounded w-40 mb-2">
                                </div>
                                <div className="h-3 bg-gray-200 rounded w-56">
                                </div>
                            </div>
                        ))}
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-16 bg-white border
                                    border-gray-200 rounded-2xl">
                        <p className="text-gray-500 text-sm mb-3">
                            {search ? "No results found" : "No venture builders yet"}
                        </p>
                        {!search && (
                            <Link href="/admin/venture-builders/create"
                                className="text-sm text-blue-600 font-medium
                                           hover:underline">
                                Add your first VB →
                            </Link>
                        )}
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filtered.map((vb) => (
                            <Link key={vb.id}
                            href={`/admin/venture-builders/${vb.id}`}
                                className="block bg-white border border-gray-200
                                           rounded-2xl p-5">

                                <div className="flex items-start justify-between
                                                gap-3 flex-wrap">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-medium text-gray-900">
                                                {vb.name}
                                            </h3>
                                            {/* Status badges */}
                                            {vb.isFirstLogin ? (
                                                <span className="text-xs px-2 py-0.5
                                                                 bg-amber-50 text-amber-700
                                                                 rounded-full">
                                                    Pending setup
                                                </span>
                                            ) : (
                                                <span className="text-xs px-2 py-0.5
                                                                 bg-green-50 text-green-700
                                                                 rounded-full">
                                                    Active
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-500">
                                            {vb.email}
                                        </p>
                                        {vb.phone && (
                                            <p className="text-sm text-gray-400">
                                                {vb.phone}
                                            </p>
                                        )}
                                    </div>

                                    <div className="text-right">
                                        {vb.ventureBuilderProfile?.organizationName && (
                                            <p className="text-sm font-medium
                                                          text-gray-700">
                                                {vb.ventureBuilderProfile.organizationName}
                                            </p>
                                        )}
                                        {/* {vb.ventureBuilderProfile?.startupCategory && (
                                            <p className="text-xs text-gray-400">
                                                {vb.ventureBuilderProfile.startupCategory}
                                            </p>
                                        )} */}
                                    </div>
                                </div>

                                {/* Profile completion */}
                                {!vb.isFirstLogin && (
                                    <div className="mt-3 pt-3 border-t border-gray-100">
                                        <div className="flex items-center
                                                        justify-between mb-1">
                                            <p className="text-xs text-gray-400">
                                                Profile completion
                                            </p>
                                            <p className="text-xs text-gray-600">
                                                {vb.ventureBuilderProfile?.profileCompleted || 0}%
                                            </p>
                                        </div>
                                        <div className="w-full bg-gray-100
                                                        rounded-full h-1.5">
                                            <div
                                                className="bg-blue-600 h-1.5
                                                           rounded-full transition-all"
                                                style={{
                                                    width: `${vb.ventureBuilderProfile?.profileCompleted || 0}%`
                                                }}
                                            />
                                        </div>
                                    </div>
                                )}

                            </Link>
                        ))}
                    </div>
                )}

            </div>
        
        </div>
    )
}