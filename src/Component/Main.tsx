import { useUser } from "@/context/user";
import Link from "next/link";
import React, { Suspense } from "react";
import Footer from "./fotter";
import Client from "./subComponents/client";

import Loader from "./loader";
import dynamic from "next/dynamic";

const Freelancer = dynamic(() => import("./subComponents/Freelancer"), {
  ssr: false,
  loading: () => (
    <div>
      <Loader />
    </div>
  ),
});
const Main = () => {
  const { user } = useUser();

  return (
    <div>
      {user?.onBoarding === true ? (
        <div>
          {user?.role === "Client" ? (
            <Suspense
              fallback={
                <div>
                  <Loader></Loader>
                </div>
              }
            >
              <Client />
            </Suspense>
          ) : (
            <div className="w-full">
              <Suspense
                fallback={
                  <div>
                    <Loader />
                  </div>
                }
              >
                <Freelancer />
              </Suspense>
            </div>
          )}
        </div>
      ) : (
             <div className="dark:bg-gray-900 transition-colors duration-300 overflow-x-hidden">
          {/* Hero Section */}
          <main className="relative container mx-auto px-6 py-24 md:py-40">
            {/* Background gradient blob */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/20 dark:bg-purple-600/10 rounded-full blur-3xl -z-10"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/20 dark:bg-indigo-600/10 rounded-full blur-3xl -z-10"></div>

            <div className="max-w-5xl mx-auto text-center space-y-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-full text-indigo-600 dark:text-indigo-400 text-sm font-medium">
                <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></span>
                Welcome to NextGig
              </div>

              <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 dark:text-white leading-tight">
                Your Next{" "}
                <span className="relative inline-block">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400">
                    Gig
                  </span>
                  <svg
                    className="absolute -bottom-2 left-0 w-full"
                    height="12"
                    viewBox="0 0 200 12"
                    fill="none"
                  >
                    <path
                      d="M2 10C50 2 150 2 198 10"
                      stroke="url(#gradient)"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                    <defs>
                      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#6366f1" />
                        <stop offset="50%" stopColor="#9333ea" />
                        <stop offset="100%" stopColor="#ec4899" />
                      </linearGradient>
                    </defs>
                  </svg>
                </span>
                <br />
                Starts Here
              </h1>

              <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed max-w-3xl mx-auto">
                Connect talented freelancers with exciting opportunities. Post jobs, receive applications, and manage everything seamlessly with AI-powered assistance.
              </p>

              {/* Stats */}
              {/* <div className="flex flex-wrap items-center justify-center gap-8 pt-8">
                <div>
                  <div className="text-3xl font-bold text-gray-900 dark:text-white">10K+</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Active Users</div>
                </div>
                <div className="w-px h-12 bg-gray-300 dark:bg-gray-700"></div>
                <div>
                  <div className="text-3xl font-bold text-gray-900 dark:text-white">5K+</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Jobs Posted</div>
                </div>
                <div className="w-px h-12 bg-gray-300 dark:bg-gray-700"></div>
                <div>
                  <div className="text-3xl font-bold text-gray-900 dark:text-white">98%</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Satisfaction Rate</div>
                </div>
              </div> */}
            </div>
          </main>

          {/* How It Works Section */}
          <section className="relative bg-gradient-to-b from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 py-24">
            <div className="container mx-auto px-6">
              <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                  How <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">NextGig</span> Works
                </h2>
                <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                  Simple, streamlined process to connect clients and freelancers
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                {/* Step 1 */}
                <div className="group relative bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-gray-700 overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
                  
                  <div className="relative z-10">
                    <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div className="text-sm font-bold text-indigo-600 dark:text-indigo-400 mb-3">STEP 1</div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                      Clients Post Jobs
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                      Clients create detailed job postings with requirements, budget, and timeline to attract the right talent.
                    </p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="group relative bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-gray-700 overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
                  
                  <div className="relative z-10">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                      </svg>
                    </div>
                    <div className="text-sm font-bold text-green-600 dark:text-green-400 mb-3">STEP 2</div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                      Freelancers Apply
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                      Skilled freelancers browse opportunities and submit applications with their proposals and portfolios.
                    </p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="group relative bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 dark:border-gray-700 overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>
                  
                  <div className="relative z-10">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="text-sm font-bold text-blue-600 dark:text-blue-400 mb-3">STEP 3</div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                      Clients Accept
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                      Clients review applications, compare profiles, and accept the best-fit freelancer to start collaboration.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Features Section */}
          <section className="py-24 bg-white dark:bg-gray-900">
            <div className="container mx-auto px-6">
              <div className="text-center mb-16">
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
                  Platform Features
                </h2>
                <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                  Everything you need to succeed on NextGig
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                {/* AI Chatbot Feature */}
                <div className="flex gap-6 items-start bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 p-8 rounded-3xl shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300">
                  <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-3">AI-Powered Chatbot</h4>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                      Get instant answers to job-related queries 24/7. Our intelligent chatbot helps with posting jobs, understanding requirements, application tracking, and platform navigation.
                    </p>
                  </div>
                </div>

                {/* Application Management */}
                <div className="flex gap-6 items-start bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 p-8 rounded-3xl shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300">
                  <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Application Management</h4>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                      Streamlined dashboard to manage all job applications. Clients can review, compare, and accept applications with ease while freelancers track their submission status.
                    </p>
                  </div>
                </div>

                {/* Smart Matching */}
                <div className="flex gap-6 items-start bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 p-8 rounded-3xl shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300">
                  <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Smart Job Recommendations</h4>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                      AI-powered system recommends relevant jobs to freelancers based on their skills, experience, and preferences, ensuring perfect matches every time.
                    </p>
                  </div>
                </div>

                {/* Real-time Notifications */}
                <div className="flex gap-6 items-start bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 p-8 rounded-3xl shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all duration-300">
                  <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-teal-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Real-time Notifications</h4>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                      Stay updated with instant notifications for new job postings, application status changes, messages, and acceptance confirmations.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="relative py-24 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-700 dark:via-purple-700 dark:to-pink-700"></div>
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMSIgb3BhY2l0eT0iMC4xIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyaWQpIi8+PC9zdmc+')] opacity-20"></div>
            
            <div className="relative container mx-auto px-6 text-center">
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
                Ready to Get Started?
              </h2>
              <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
                Join thousands of freelancers and clients already working together on NextGig
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/signup"
                  className="px-10 py-5 bg-white text-indigo-600 rounded-2xl font-bold text-lg transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-105 hover:bg-gray-50"
                >
                  Join as Freelancer
                </Link>
                <Link
                  href="/signup"
                  className="px-10 py-5 bg-transparent border-2 border-white text-white rounded-2xl font-bold text-lg transition-all duration-300 hover:bg-white hover:text-indigo-600"
                >
                  Join as Client
                </Link>
              </div>
            </div>
          </section>

          <Footer />
        </div>
      )}
    </div>
  );
};

export default Main;
