import { useUser } from '@/context/user'
import Link from 'next/link';
import Image from 'next/image';
import React from 'react'
import cat from "@/public/catImg.png";
import Footer from './fotter';
import Client from './subComponents/client';
import Freelancer from './subComponents/Freelancer';
const Main = () => {
    const { user } = useUser();

    return (
        <div>
            {user?.onBoarding === true ? (
                <div>
                {user?.role === "Client" ? (
                   <div >
<Client />
                   </div> 
                ) : (
                    <div className='w-full'>
                    <Freelancer />

                    </div>
                )}
                </div>
            ) : (
                <div className="dark:bg-gray-900 transition-colors duration-300 overflow-x-hidden">
                    {/* Hero Section */}
                    <main className="container mx-auto px-6 py-16 md:py-24">
                        <div className="flex flex-col md:flex-row items-center">
                            <div className="md:w-1/2 mb-12 md:mb-0">
                                <h1 className="text-4xl md:text-5xl font-bold text-gray-800 dark:text-white leading-tight mb-6">
                                    Optimize Your <span className="text-indigo-600 dark:text-indigo-400">Efforts.</span>
                                </h1>
                                
                                <div className="mb-8">
                                    <div className="flex flex-wrap gap-3 mb-3">
                                        <span className="px-4 py-2 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 rounded-full text-sm font-medium">
                                            Quick and Intelligent Pairing
                                        </span>
                                        <span className="px-4 py-2 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 rounded-full text-sm font-medium">
                                            Rapid and Clever Matching
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap gap-3 mb-3">
                                        <span className="px-4 py-2 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 rounded-full text-sm font-medium">
                                            Swift and Wise Connections
                                        </span>
                                        <span className="px-4 py-2 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 rounded-full text-sm font-medium">
                                            Speedy and Sharp
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap gap-3">
                                        <span className="px-4 py-2 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 rounded-full text-sm font-medium">
                                            Efficient and Insightful Matches
                                        </span>
                                    </div>
                                </div>
                                
                                <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
                                    Find the best talent or gigs instantly with our AI-powered matching platform.
                                </p>
                                
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <Link
                                        href="#" 
                                        className="px-8 py-3 bg-indigo-600 dark:bg-indigo-700 text-white rounded-lg font-medium hover:bg-indigo-700 dark:hover:bg-indigo-800 transition text-center shadow-lg shadow-indigo-200 dark:shadow-indigo-900/50"
                                    >
                                        Post a Job
                                    </Link>
                                    <Link
                                        href="#" 
                                        className="px-8 py-3 border border-indigo-600 dark:border-indigo-400 text-indigo-600 dark:text-indigo-400 rounded-lg font-medium hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition text-center"
                                    >
                                        Learn More
                                    </Link>
                                </div>
                            </div>
                            
                            <div className="md:w-1/2">
                                <div className="relative">
                                    <div className="absolute -top-6 -left-6 w-64 h-64 bg-indigo-200 dark:bg-indigo-800 rounded-full mix-blend-multiply filter blur-xl opacity-70 dark:opacity-30 animate-blob"></div>
                                    <div className="absolute -bottom-8 -right-8 w-64 h-64 bg-blue-200 dark:bg-blue-800 rounded-full mix-blend-multiply filter blur-xl opacity-70 dark:opacity-30 animate-blob animation-delay-2000"></div>
                                    <div className="absolute top-20 -right-20 w-64 h-64 bg-purple-200 dark:bg-purple-800 rounded-full mix-blend-multiply filter blur-xl opacity-70 dark:opacity-30 animate-blob animation-delay-4000"></div>
                                    <div className="relative bg-transparent p-8 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700">
                                        <Image 
                                            src={cat} 
                                            alt="AI matching illustration" 
                                            className="w-full h-auto dark:bg-gray-800 rounded-2xl"
                                            priority
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </main>

                 

                    {/* AI Solutions Section */}
               <Footer/>

             
                </div>
            )}
        </div>
    )
}

export default Main;