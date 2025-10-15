"use client"

import { Badge } from '@/components/ui/badge'
import { getApplicants, getFreelancer } from '@/lib/api'
import { useQuery } from '@tanstack/react-query'
import { 
  X, Star, Clock, Briefcase, TrendingUp, Users, 
  Search, Filter, ChevronRight, Award, ArrowUpRight,
  Zap, MessageSquare, DollarSign
} from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

export interface Freelancer {
  profileVisibility: boolean;
  profilePicture: string;
  name: string;
  Proffession: string;
  Skills: string[];
  Experience: string;
  role: string;
  _id: string;
}

interface Applicant {
  Availability: string;
  Bio: string;
  ContactPreference: string;
  Experience: number;
  HourlyRate: number;
  Portfolio: string[];
  Proffession: string;
  Skills: string[];
  contactdetails: {
    email: string;
    phone: string;
  };
  createdAt: string;
  email: string;
  languages: string[];
  location: string;
  name: string;
  onBoarding: boolean;
  profilePicture: string;
  profileVisibility: string;
  resumePdf: string;
  role: string;
  updatedAt: string;
  userId: string;
  _id: string;
  __v: number;
}

// Skeleton Components
const FreelancerCardSkeleton = () => (
  <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 animate-pulse">
    <div className="flex items-start gap-4">
      <div className="w-20 h-20 rounded-2xl bg-gray-200 dark:bg-gray-700 flex-shrink-0" />
      <div className="flex-1 space-y-3">
        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
        <div className="flex gap-2">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16" />
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16" />
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16" />
        </div>
        <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-32" />
      </div>
    </div>
  </div>
)

const Client = () => {
  const [searchQuery, setSearchQuery] = React.useState('')

  const { data, isLoading, isError, error } = useQuery<Freelancer[]>({
    queryKey: ['clients'],
    queryFn: getFreelancer
  })
  
  const { data: applicants, isLoading: loadingApplicants } = useQuery({
    queryKey: ['fetchJobData'],
    queryFn: getApplicants
  })

  // Calculate stats
  const totalFreelancers = data?.filter(f => f.profileVisibility).length || 0
  const totalApplicants = Array.isArray(applicants) 
    ? applicants.reduce((acc, job) => acc + (job.applicants?.length || 0), 0) 
    : 0

  const filteredFreelancers = data
    ?.filter(f => f.profileVisibility)
    ?.filter(f => 
      searchQuery === '' ||
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.Skills.some(s => s.toLowerCase().includes(searchQuery.toLowerCase())) ||
      f.Proffession.toLowerCase().includes(searchQuery.toLowerCase())
    )

  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-black pt-24">
        <div className="text-center p-8 bg-white dark:bg-gray-900 rounded-2xl shadow-xl max-w-md border border-gray-200 dark:border-gray-800">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Error Loading Data</h3>
          <p className="text-gray-600 dark:text-gray-400">{error.message}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black pt-20">
      {/* Main Container */}
      <div className="relative max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Users className="w-6 h-6 text-white" />
                </div>
                Find Talent
              </h1>
            </div>
            
            <Link
              href="/postJob"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              <TrendingUp className="w-5 h-5" />
              Post a Job
            </Link>
          </div>
        </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Sidebar - Stats & Quick Actions */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Overview Stats Card */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800 shadow-lg">
              <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-5 flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Overview
              </h3>
              <div className="space-y-4">
                {/* Available Freelancers */}
                <div className="group p-4 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl border border-blue-200 dark:border-blue-800/30 hover:shadow-md transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-xs font-medium text-blue-700 dark:text-gray-400 mb-1">Available</p>
                      <p className="text-2xl font-bold text-blue-900 dark:text-white">
                        {isLoading ? '...' : totalFreelancers}
                      </p>
                      <p className="text-xs text-blue-600 dark:text-blue-400 font-medium mt-1">Freelancers</p>
                    </div>
                    <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </div>

                {/* Total Applicants */}
                <div className="group p-4 bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl border border-purple-200 dark:border-purple-800/30 hover:shadow-md transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-xs font-medium text-purple-700 dark:text-gray-400 mb-1">Total</p>
                      <p className="text-2xl font-bold text-purple-900 dark:text-white">
                        {loadingApplicants ? '...' : totalApplicants}
                      </p>
                      <p className="text-xs text-purple-600 dark:text-purple-400 font-medium mt-1">Applicants</p>
                    </div>
                    <div className="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                      <TrendingUp className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </div>

                {/* Active Jobs - FIXED */}
                <div className="group p-4 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/20 dark:to-green-800/20 rounded-xl border border-green-200 dark:border-green-800/30 hover:shadow-md transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-xs font-medium text-green-700 dark:text-gray-400 mb-1">Active</p>
                      <p className="text-2xl font-bold text-green-900 dark:text-white">
                        {Array.isArray(applicants) ? applicants.length : 0}
                      </p>
                      <p className="text-xs text-green-600 dark:text-green-400 font-medium mt-1">Jobs</p>
                    </div>
                    <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center shadow-lg">
                      <Briefcase className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions Card */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800 shadow-lg">
              <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4">
                Quick Actions
              </h3>
              <div className="space-y-2">
                <Link
                  href="/talent/browse"
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors">
                      <Search className="w-4 h-4 text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400" />
                    </div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Browse All Talent</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                </Link>

                <Link
                  href="/applications/applicants"
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center group-hover:bg-purple-100 dark:group-hover:bg-purple-900/30 transition-colors">
                      <Briefcase className="w-4 h-4 text-gray-600 dark:text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400" />
                    </div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">My Posted Jobs</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors" />
                </Link>

                <Link
                  href="/chat"
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center group-hover:bg-green-100 dark:group-hover:bg-green-900/30 transition-colors">
                      <MessageSquare className="w-4 h-4 text-gray-600 dark:text-gray-400 group-hover:text-green-600 dark:group-hover:text-green-400" />
                    </div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Messages</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors" />
                </Link>

                <Link
                  href="/createdContact/showingJobs"
                  className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center group-hover:bg-yellow-100 dark:group-hover:bg-yellow-900/30 transition-colors">
                      <DollarSign className="w-4 h-4 text-gray-600 dark:text-gray-400 group-hover:text-yellow-600 dark:group-hover:text-yellow-400" />
                    </div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Contracts</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-yellow-600 dark:group-hover:text-yellow-400 transition-colors" />
                </Link>
              </div>
            </div>
          </div>

          {/* Main Content - Freelancers List */}
          <div className="lg:col-span-6 space-y-6">
            
            {/* Search and Filter Bar */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-200 dark:border-gray-800 shadow-lg">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500 group-focus-within:text-blue-600 dark:group-focus-within:text-blue-400 transition-colors" />
                  <input
                    type="text"
                    placeholder="Search by name, skills, or profession..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-10 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:outline-none transition-all"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <button className="flex items-center justify-center gap-2 px-5 py-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl font-medium text-gray-700 dark:text-gray-300 transition-all border border-gray-200 dark:border-gray-700">
                  <Filter className="w-5 h-5" />
                  <span className="hidden sm:inline">Filters</span>
                </button>
              </div>
            </div>

            {/* Results Header */}
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                {searchQuery ? 'Search Results' : 'Recommended Freelancers'}
              </h2>
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-900 px-4 py-2 rounded-full border border-gray-200 dark:border-gray-800">
                {isLoading ? 'Loading...' : `${filteredFreelancers?.length || 0} available`}
              </span>
            </div>

            {/* Freelancers Grid */}
            <div className="space-y-4">
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <FreelancerCardSkeleton key={i} />
                ))
              ) : filteredFreelancers && filteredFreelancers.length > 0 ? (
                filteredFreelancers.map((freelancer, idx) => (
                  <div
                    key={idx}
                    className="group bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800 hover:border-blue-500 dark:hover:border-blue-700 hover:shadow-xl transition-all duration-300"
                  >
                    <div className="flex flex-col sm:flex-row gap-5">
                      {/* Profile Picture */}
                      <div className="relative flex-shrink-0">
                        <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-gray-200 dark:border-gray-700 group-hover:border-blue-500 dark:group-hover:border-blue-600 transition-all shadow-lg">
                          <Image
                            src={freelancer.profilePicture || '/default-avatar.png'}
                            alt={freelancer.name}
                            width={80}
                            height={80}
                            className="object-cover w-full h-full"
                          />
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full animate-pulse" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <div className="flex-1 min-w-0">
                            <Link 
                              href={`/profile/publicView/${freelancer._id}-${freelancer.role}`}
                              className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate block"
                            >
                              {freelancer.name}
                            </Link>
                            <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-1.5 mt-1.5">
                              <Briefcase className="w-4 h-4 flex-shrink-0" />
                              <span className="truncate">{freelancer.Proffession}</span>
                            </p>
                          </div>
                          <Badge className="bg-gradient-to-r from-blue-100 to-blue-200 dark:from-blue-900/40 dark:to-blue-800/40 text-blue-700 dark:text-blue-300 border-0 font-bold shadow-sm whitespace-nowrap">
                            <Clock className="w-3.5 h-3.5 mr-1" />
                            {freelancer.Experience}y
                          </Badge>
                        </div>

                        {/* Skills */}
                        <div className="flex flex-wrap gap-2 mb-4">
                          {freelancer.Skills.slice(0, 5).map((skill, i) => (
                            <span
                              key={i}
                              className="px-3 py-1.5 text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors cursor-default border border-gray-200 dark:border-gray-700"
                            >
                              {skill}
                            </span>
                          ))}
                          {freelancer.Skills.length > 5 && (
                            <span className="px-3 py-1.5 text-xs font-semibold bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg border border-blue-200 dark:border-blue-800">
                              +{freelancer.Skills.length - 5} more
                            </span>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-wrap gap-3">
                          <Link
                            href={`/profile/publicView/${freelancer._id}-${freelancer.role}`}
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-semibold hover:bg-gray-800 dark:hover:bg-gray-100 transition-all duration-300 hover:scale-105 hover:shadow-lg group/btn"
                          >
                            View Profile
                            <ArrowUpRight className="w-4 h-4 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                          </Link>
                          <button className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-200 dark:hover:bg-gray-700 transition-all hover:shadow-md border border-gray-200 dark:border-gray-700">
                            <MessageSquare className="w-4 h-4" />
                            Message
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-lg">
                  <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="w-10 h-10 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    No freelancers found
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                    {searchQuery 
                      ? `No results for "${searchQuery}". Try adjusting your search.` 
                      : 'No freelancers are currently available.'}
                  </p>
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="mt-4 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors"
                    >
                      Clear Search
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar - Recent Activity */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Recent Applicants Card */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800 shadow-lg">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Recent Applicants
                </h3>
                <Link 
                  href="/applications/applicants" 
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-semibold"
                >
                  View all
                </Link>
              </div>

              <div className="space-y-3 max-h-[500px] overflow-y-auto custom-scrollbar">
                {loadingApplicants ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="animate-pulse flex gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                      <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-xl flex-shrink-0" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full" />
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                      </div>
                    </div>
                  ))
                ) : Array.isArray(applicants) && applicants.every(job => job.applicants?.length === 0) ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-3">
                      <Users className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">No applicants yet</p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1.5">Post a job to receive applications</p>
                    <Link
                      href="/postJob"
                      className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors"
                    >
                      <TrendingUp className="w-4 h-4" />
                      Post Job
                    </Link>
                  </div>
                ) : (
                  Array.isArray(applicants) &&
                  applicants.slice(0, 5).map((job, i) =>
                    job.applicants?.slice(0, 2).map((applicant: Applicant, idx: number) => (
                      <Link
                        key={`${i}-${idx}`}
                        href={`/profile/publicView/${applicant.userId}-${applicant.role}`}
                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all cursor-pointer group border border-transparent hover:border-gray-200 dark:hover:border-gray-700"
                      >
                        <div className="relative w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 border-2 border-gray-200 dark:border-gray-700 group-hover:border-blue-500 dark:group-hover:border-blue-600 transition-colors">
                          <Image
                            src={applicant.profilePicture}
                            alt={applicant.name}
                            width={48}
                            height={48}
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-semibold text-gray-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                            {applicant.name}
                          </h4>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                            Applied to: {job.title}
                          </p>
                          <p className="text-xs text-blue-600 dark:text-blue-400 font-medium mt-1">
                            2h ago
                          </p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors flex-shrink-0" />
                      </Link>
                    ))
                  )
                )}
              </div>
            </div>

            {/* Top Rated Freelancers Card */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800 shadow-lg">
              <div className="flex items-center gap-2 mb-5">
                <Award className="w-5 h-5 text-yellow-500" />
                <h3 className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Top Rated
                </h3>
              </div>

              <div className="space-y-3">
                {[1, 2, 3].map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-br from-yellow-100 to-orange-100 dark:from-yellow-900/10 dark:to-orange-900/10 border border-yellow-200 dark:border-yellow-800/30 hover:shadow-lg transition-all cursor-pointer group"
                  >
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center flex-shrink-0 shadow-md group-hover:scale-110 transition-transform">
                      <Award className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-yellow-700 dark:group-hover:text-yellow-400 transition-colors truncate">
                        Top Freelancer {i + 1}
                      </h4>
                      <div className="flex items-center gap-1.5 mt-1">
                        <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                        <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">5.0</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">(127 reviews)</span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(156, 163, 175, 0.4);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(107, 114, 128, 0.6);
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(75, 85, 99, 0.4);
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(107, 114, 128, 0.6);
        }
      `}</style>
    </div>
  )
}

export default Client
