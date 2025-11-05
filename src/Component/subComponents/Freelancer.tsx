"use client"

import React, { useEffect, useState } from 'react'
import JobCards from './JobCards'
import { useQuery } from '@tanstack/react-query'
import { fetchJobs } from '@/lib/api'
import News from './news';
import Loader from '../loader'
import { useUser } from '@/context/user'
import { Briefcase, Filter, Search, TrendingUp, X, Sparkles } from 'lucide-react'
import FilterModal from './filter'
import TrendingJobsList from './TrendinJobList'
import RecommendedJobsList from './recommendedJobsList'

export interface JobPostPayload1 {
  _id: string;
  title: string;
  description: string;
  skills: string[];
  budget: number;
  clientId: string;
  status: boolean;
  createdAt: string;
  applicants?: string[];
}

const Freelancer = () => {
  const { setGoogleQuery } = useUser();
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'trending' | 'recommended' | null>(null);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['freelancer'],
    queryFn: fetchJobs,
    staleTime: 1000 * 60 * 5,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  useEffect(() => {
    if (data) {
      console.log("This is the data", data.google);
      setGoogleQuery(data.google);
    }
  }, [data, setGoogleQuery]);

  // Filter logic for non-trending jobs
  const getFilteredJobs = () => {
    let jobs = data?.data || [];

    // For recommended filter - sort by most recent (replace with your AI logic)
    if (activeFilter === 'recommended') {
      jobs = [...jobs].sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }

    // Apply search query
    if (searchQuery) {
      jobs = jobs.filter((job: JobPostPayload1) =>
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    return jobs;
  };

  const filteredJobs = getFilteredJobs();

  const handleFilterSelect = (filter: 'trending' | 'recommended' | null) => {
    setActiveFilter(filter);
    setSearchQuery('');
  };

  if (isLoading) {
    return (
      <div className='fixed inset-0 flex items-center justify-center bg-white/80 dark:bg-black/50 backdrop-blur-sm z-50'>
        <Loader />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-black pt-24 flex items-center justify-center px-4">
        <div className="text-center p-8 bg-white dark:bg-gray-900 rounded-2xl shadow-xl max-w-md border border-gray-200 dark:border-gray-800">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Briefcase className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Error Loading Jobs</h3>
          <p className="text-gray-600 dark:text-gray-400">{(error as Error).message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-gray-50 dark:bg-black pt-20 px-4 sm:px-6 lg:px-8'>
      <div className='max-w-[1600px] mx-auto'>
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Briefcase className="w-6 h-6 text-white" />
                </div>
                Find Jobs
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2 ml-1">
                Discover opportunities that match your skills
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-900 px-4 py-2 rounded-full border border-gray-200 dark:border-gray-800 shadow-sm">
                {activeFilter === 'trending' ? 'Trending Jobs' : `${filteredJobs?.length || 0} jobs available`}
              </span>
            </div>
          </div>
        </div>

        {/* Main Layout */}
        <div className='flex flex-col lg:flex-row gap-6'>
          {/* Left Side - Job Listings */}
          <div className='flex-1 lg:w-[70%] space-y-6'>
            {/* Search Bar with Filter */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-4 border border-gray-200 dark:border-gray-800 shadow-lg relative">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500 group-focus-within:text-green-600 dark:group-focus-within:text-green-400 transition-colors" />
                  <input
                    type="text"
                    placeholder="Search jobs by title, description, or skills..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    disabled={activeFilter === 'trending'}
                    className="w-full pl-12 pr-10 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-transparent focus:outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  {searchQuery && activeFilter !== 'trending' && (
                    <button
                      onClick={() => setSearchQuery('')}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <button 
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  className={`flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-medium transition-all border ${
                    isFilterOpen || activeFilter
                      ? 'bg-green-600 text-white border-green-600'
                      : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <Filter className="w-5 h-5" />
                  <span className="hidden sm:inline">
                    {activeFilter === 'trending' ? 'Trending' : activeFilter === 'recommended' ? 'For You' : 'Filters'}
                  </span>
                  {activeFilter && (
                    <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                  )}
                </button>
              </div>

              {/* Filter Modal Dropdown */}
              <FilterModal
                isOpen={isFilterOpen}
                onClose={() => setIsFilterOpen(false)}
                onSelectFilter={handleFilterSelect}
              />
            </div>

            {/* Active Filter Badge */}
            {activeFilter && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">Active filter:</span>
                <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${
                  activeFilter === 'trending' 
                    ? 'bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20 border border-orange-200 dark:border-orange-900/30'
                    : 'bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 border border-blue-200 dark:border-blue-900/30'
                }`}>
                  <span className={`text-sm font-semibold ${
                    activeFilter === 'trending'
                      ? 'text-orange-700 dark:text-orange-400'
                      : 'text-blue-700 dark:text-blue-400'
                  }`}>
                    {activeFilter === 'trending' 
                      ? '🔥 Trending Jobs' 
                      : '✨ Jobs Recommended According To Your Activity'}
                  </span>
                  <button
                    onClick={() => setActiveFilter(null)}
                    className={`p-1 rounded-full transition-colors ${
                      activeFilter === 'trending'
                        ? 'hover:bg-orange-200 dark:hover:bg-orange-900/40'
                        : 'hover:bg-blue-200 dark:hover:bg-blue-900/40'
                    }`}
                  >
                    <X className={`w-3 h-3 ${
                      activeFilter === 'trending'
                        ? 'text-orange-700 dark:text-orange-400'
                        : 'text-blue-700 dark:text-blue-400'
                    }`} />
                  </button>
                </div>
              </div>
            )}

            {/* Results Header - Only show for non-trending */}
            {activeFilter !== 'trending' && (
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  {activeFilter === 'recommended' ? (
                    <>
                      <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-500" />
                      Jobs Recommended According To Your Activity
                    </>
                  ) : searchQuery ? (
                    <>
                      <Search className="w-5 h-5 text-green-600 dark:text-green-500" />
                      Search Results
                    </>
                  ) : (
                    <>
                      <TrendingUp className="w-5 h-5 text-green-600 dark:text-green-500" />
                      Recommended Jobs
                    </>
                  )}
                </h2>
              </div>
            )}

            {/* Job Cards - Conditional Rendering */}
            {activeFilter === 'trending' ? (
              // Show trending jobs component
              <TrendingJobsList />
            ): activeFilter === 'recommended' ? (
  <RecommendedJobsList />
) 
            : (
              // Show regular/recommended jobs
              <div className="space-y-4">
                {filteredJobs && filteredJobs.length > 0 ? (
                  filteredJobs.map((job: JobPostPayload1) => (
                    <div key={job._id}>      
                      <JobCards
                        clientId={job.clientId}
                        description={job.description}
                        createdAt={job.createdAt}
                        title={job.title}
                        skills={job.skills}
                        status={job.status}
                        _id={job._id}
                      />
                    </div>
                  ))
                ) : (
                  <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-lg">
                    <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Briefcase className="w-10 h-10 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                      No jobs found
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
                      {searchQuery
                        ? `No results for "${searchQuery}". Try different keywords.`
                        : 'No jobs are currently available. Check back later!'}
                    </p>
                    {(searchQuery || activeFilter) && (
                      <button
                        onClick={() => {
                          setSearchQuery('');
                          setActiveFilter(null);
                        }}
                        className="mt-4 px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition-colors"
                      >
                        Clear Filters
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Sidebar - News */}
          <div className='hidden lg:block lg:w-[30%]'>
            <div className='bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 max-h-[calc(100vh-8rem)] overflow-y-auto sticky top-24 shadow-lg hide-scrollbar'>
              <News />
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideDown {
          animation: slideDown 0.2s ease-out;
        }
        .hide-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .hide-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .hide-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(156, 163, 175, 0.4);
          border-radius: 10px;
        }
        .hide-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(107, 114, 128, 0.6);
        }
        .dark .hide-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(75, 85, 99, 0.4);
        }
        .dark .hide-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(107, 114, 128, 0.6);
        }
      `}</style>
    </div>
  )
}

export default Freelancer
