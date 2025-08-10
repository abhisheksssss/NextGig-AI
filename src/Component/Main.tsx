import { useUser } from '@/context/user'
import Link from 'next/link';
import React, { Suspense } from 'react'
import Footer from './fotter';
import Client from './subComponents/client';

import Loader from './loader';
import dynamic from 'next/dynamic';

const Freelancer = dynamic(() => import('./subComponents/Freelancer'), {
  ssr: false,
  loading: () =><div><Loader /></div> ,
});
const Main = () => {
    const { user } = useUser();

    return (
        <div> 
            {user?.onBoarding === true ? (
                <div>
                    {user?.role === "Client" ? (
                     <Suspense fallback={<div><Loader></Loader></div>}>
                            <Client />
                          </Suspense>
                    ) : (
                        <div className='w-full'>
                          <Suspense fallback={<div><Loader/></div>}>
                            <Freelancer />
                          </Suspense>
                        </div>
                    )}
                </div>
            ) : (
                <div className="dark:bg-gray-900 transition-colors duration-300 overflow-x-hidden">
                    {/* Hero Section */}
               <main className="container mx-auto px-6 py-20 md:py-32">
  <div className="grid md:grid-cols-2 gap-8 md:gap-16 items-center">

    {/* Left Column: Text Content */}
    <div className="text-center md:text-left">
   

      <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 dark:text-white leading-tight mb-6 animate-appear">
        Optimize Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">Efforts</span>
      </h1>

      <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-xl mx-auto md:mx-0 mb-10 transition-all duration-500">
        Connect with talented professionals and find exciting opportunities. We make it easy to get work done.
      </p>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
        <Link
          href="#"
          className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-700 dark:to-purple-700 text-white rounded-xl font-semibold transition-all duration-300 text-center shadow-lg hover:shadow-xl hover:shadow-indigo-500/40 hover:from-indigo-700 hover:to-purple-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none transform hover:-translate-y-1"
        >
          Post a Job
        </Link>
        <Link
          href="#"
          className="px-8 py-4 border border-indigo-200 dark:border-indigo-700 text-indigo-600 dark:text-indigo-400 rounded-xl font-semibold transition-all duration-300 text-center hover:border-indigo-600 hover:text-white hover:bg-indigo-600 dark:hover:bg-indigo-700 dark:hover:text-white focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none"
        >
          Find Work
        </Link>
      </div>
    </div>

    {/* Right Column: Visual Element */}
    <div className="relative transition-transform duration-300 hover:rotate-1">
      {/* Subtle background glow effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-400/10 to-purple-400/10 dark:from-indigo-600/10 dark:to-purple-600/10 rounded-full blur-3xl opacity-80 group-hover:opacity-100 duration-1000 ease-in-out"></div>

      {/* Refined card */}
      <div className="relative bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl p-8 sm:p-12 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-700 transition-colors group">
        <div className="text-center space-y-6">
          <div className="relative w-20 h-20 mx-auto">
            <div className="absolute inset-0 rounded-2xl -z-10 bg-gradient-to-br from-indigo-500 to-purple-600 blur-xl opacity-60 group-hover:opacity-30 transition-opacity duration-500"></div>
            <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 transition-colors group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
            Smart Connections
          </h3>
          <p className="text-gray-600 dark:text-gray-400">Find the right fit, faster.</p>
        </div>
      </div>
    </div>

  </div>
</main>



                    {/* Features Section */}
                    <section className="bg-gray-50 dark:bg-gray-800 py-16">
                        <div className="container mx-auto px-6">
                            <h2 className="text-3xl font-bold text-center text-gray-800 dark:text-white mb-12">
                                Why Choose Our Platform?
                            </h2>
                            <div className="grid md:grid-cols-3 gap-8">
                                <div className="text-center p-6 bg-white dark:bg-gray-700 rounded-xl shadow-lg">
                                    <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <svg className="w-8 h-8 text-indigo-600 dark:text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-3">Fast Matching</h3>
                                    <p className="text-gray-600 dark:text-gray-300">AI-powered algorithm matches you with the perfect freelancer or job in seconds.</p>
                                </div>
                                
                                <div className="text-center p-6 bg-white dark:bg-gray-700 rounded-xl shadow-lg">
                                    <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-3">Secure Payments</h3>
                                    <p className="text-gray-600 dark:text-gray-300">Protected transactions with escrow system ensuring safe payments for everyone.</p>
                                </div>
                                
                                <div className="text-center p-6 bg-white dark:bg-gray-700 rounded-xl shadow-lg">
                                    <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-3">Global Network</h3>
                                    <p className="text-gray-600 dark:text-gray-300">Connect with talented professionals from around the world, anytime.</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    <Footer />
                </div>
            )}
        </div>
    )
}

export default Main;
