"use client"
import axios from 'axios'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'
import { FiMail, FiLock, FiGithub, FiAlertCircle } from 'react-icons/fi'

const LoginPage = () => {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState("")
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        setIsLoading(true)
        setError("")

        const result = await axios.post("/api/auth/login", {
            email,
            password,
        })

        if (result.status !== 200) {
            setError("Invalid email or password. Please try again.")
            setIsLoading(false)
        } else {
            router.push("/")
        }
    }

    return (
        <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
            <div className="w-full max-w-md ">
                <div className="bg-background rounded-2xl shadow-xl  dark:shadow-gray-500 dark:border-t-2  overflow-hidden">
                    <div className="p-8">
                        <div className="text-center mb-8">
                            <h1 className="text-3xl font-bold text-foreground mb-2">Welcome Back</h1>
                            <p className="text-gray-500">Sign in to continue to your account</p>
                        </div>

                        {error && (
                            <div className="mb-6 bg-red-50 text-red-600 p-3 rounded-lg flex items-start text-sm">
                                <FiAlertCircle className="mr-2 mt-0.5 flex-shrink-0" />
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Email</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <FiMail className="text-gray-400  dark:text-gray-200" />
                                    </div>
                                    <input
                                        type="email"
                                        placeholder="you@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full pl-10 pr-3 py-3 border text-black border-gray-300 rounded-lg focus:ring-2  dark:text-gray-200 focus:ring-indigo-500 focus:border-indigo-500 transition"
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700  dark:text-gray-200 mb-1">Password</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <FiLock className="text-gray-400  dark:text-gray-200" />
                                    </div>
                                    <input
                                        type="password"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full pl-10 pr-3 py-3 border text-black border-gray-300 rounded-lg focus:ring-2  dark:text-gray-200 focus:ring-indigo-500 focus:border-indigo-500 transition"
                                        required
                                    />
                                </div>
                                <div className="mt-1 text-right">
                                    <Link href="/forgot-password" className="text-sm text-indigo-600 hover:text-indigo-500">
                                        Forgot password?
                                    </Link>
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-white  dark:text-black bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition ${isLoading ? 'opacity-80' : ''}`}
                            >
                                {isLoading ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white  dark:text-black " xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Signing in...
                                    </>
                                ) : 'Sign In'}
                            </button>
                        </form>

                        <div className="mt-6">
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-gray-300"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-2 bg-background text-gray-500 dark:text-gray-200">
                                        Or continue with
                                    </span>
                                </div>
                            </div>

                            <div className="mt-6 w-full gap-3">
                                <button
                                    className="w-full inline-flex justify-center items-center py-2 px-4 border border-gray-300 rounded-lg bg-background text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                                >
                                    <FiGithub className="mr-2" /> GitHub
                                </button>
                             
                            </div>
                        </div>

                        <div className="mt-6 text-center text-sm">
                            <p className="text-gray-600">
                                Dont have an account?{' '}
                                <a href="/signup" className="font-medium text-indigo-600 hover:text-indigo-500">
                                    Sign up
                                </a>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default LoginPage