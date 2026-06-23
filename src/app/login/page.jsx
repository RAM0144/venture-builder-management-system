"use client"

import { getSession, signIn } from "next-auth/react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import logo from "../assets/logo.png"

const initialState = {
    email: "",
    password: ""
}

export default function Login() {

    const router = useRouter()

    const [formData, setFormData] = useState(initialState)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

     const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
        setError("")
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError("")

        try {

            const res = await signIn("credentials", {
                email: formData.email,
                password: formData.password,
                redirect: false
            })

            if(res?.error){
                setError(res.error || "Something went wrong")
            }else{
                const session = await getSession()
                if(session?.user?.role === "ADMIN"){
                  router.push("/admin")
                }else if(session?.user?.role === "VB"){
                   router.push("/VB-dashboard")
                }else if(session?.user?.role === "HUB"){
                    router.push("/hub")
                }
            }
            
        } catch (error) {
            console.log(error)
            setError("Something went wrong. Please try again.")
        }finally{
            setLoading(false)
        }
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
             <div className="w-full max-w-sm bg-white border border-gray-200 
                          rounded-2xl p-8 shadow-sm">
             {/* Header */}
                <div className="text-center mb-6">
                    <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center 
                                    justify-center mx-auto mb-3">
                                        
                        <svg className="w-6 h-6 text-blue-600 mx-auto" fill="none"
                            stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a00-7-7z" />
                        </svg>

                    </div>
                    <h1 className="text-lg font-medium text-gray-900">Welcome back</h1>
                    <p className="text-sm text-gray-500 mt-1">Sign in to your account</p>
                </div>

                  {/* Error message */}
                {error && (
                    <div className="mb-4 px-3 py-2 bg-red-50 border border-red-200 
                                    rounded-lg text-sm text-red-600">
                        {error}
                    </div>
                )}

               <div className="">
                  <form onSubmit={handleSubmit} className="space-y-4 ">
                  <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email address
                        </label>
                        <input
                            name="email"
                            type="email"
                            placeholder="ram@example.com"
                            value={formData.email}
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
                            Password
                        </label>
                        <input
                            name="password"
                            type="password"
                            placeholder="Your password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 border border-gray-200 rounded-lg 
                                       text-sm focus:outline-none focus:ring-2 
                                       focus:ring-blue-500 focus:border-transparent 
                                       placeholder:text-gray-400"
                        />
                         <div className="text-right mt-1">
                            <Link href="/forgot-password"
                                className="text-xs text-blue-600 hover:underline">
                                Forgot password?
                            </Link>
                        </div>
                    </div>
                    <button
                         type="submit"
                        disabled={loading}
                        className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 
                                   disabled:bg-blue-400 disabled:cursor-not-allowed
                                   text-white text-sm font-medium rounded-lg 
                                   transition-colors mt-2">
                        {loading ? "Signing in..." : "Sign in"}
                    </button>
                </form>
                 <p className="text-center text-sm text-gray-500 mt-4">
                    Don't have an account?{" "}
                    <Link href="/register"
                        className="text-blue-600 font-medium hover:underline">
                        Register
                    </Link>
                </p>
               </div>
          </div>
            </div>
        </div>
    )
}