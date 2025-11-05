// components/Jobs.tsx
'use client';

import { useUser } from '@/context/user';
import { getOtherPlatFormData } from '@/lib/api';
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { TrendingUp, ExternalLink, Search, AlertCircle, Briefcase, MapPin, Building2, Clock, Zap, BookmarkPlus, Loader, ChevronDown } from 'lucide-react';
import Image from 'next/image';
import React, { useEffect, useState } from 'react'

interface Job {
  job_id: string;
  job_title: string;
  employer_name: string;
  employer_logo: string;
  job_employment_type: string;
  job_posted_at: string | null;
  job_location: string;
  job_country: string;
  job_apply_link: string;
}

interface JobResponse {
  jobs: Job[];
}

const Jobs = () => {
  const { googleQuery } = useUser();
  const jobQuery = googleQuery;
  const queryClient = useQueryClient();
  const [savedJobs, setSavedJobs] = useState<string[]>([]);
  const [allJobs, setAllJobs] = useState<Job[]>([]);
  const [displayedCount, setDisplayedCount] = useState(10);

  const [query, setQuery] = useState('developer jobs');
  const [country, setCountry] = useState('IN');
  const [page, setPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  useEffect(() => {
    if (jobQuery) {
      setQuery(jobQuery);
      setPage(1);
      setAllJobs([]);
      setDisplayedCount(10);
      queryClient.invalidateQueries({ queryKey: ["JobSearch"] })
    }
  }, [jobQuery, queryClient])

  const { data, isLoading, isError, error, isFetching } = useQuery<JobResponse>({
    queryKey: ["JobSearch", query, country, page],
    queryFn: () => getOtherPlatFormData(query, page),
    staleTime: 1000 * 60 * 5,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    retry: 1,
    enabled: !!query,
  });

  // Accumulate jobs from paginated results and deduplicate
  useEffect(() => {
    if (data?.jobs && data.jobs.length > 0) {
      if (page === 1) {
        setAllJobs(data.jobs);
      } else {
        // Deduplicate by job_id and combine with existing jobs
        const newJobs = data.jobs.filter(
          newJob => !allJobs.some(existingJob => existingJob.job_id === newJob.job_id)
        );
        setAllJobs(prev => [...prev, ...newJobs]);
      }
    }
  }, [data, page]);

  const toggleSaveJob = (jobId: string) => {
    setSavedJobs(prev => 
      prev.includes(jobId) 
        ? prev.filter(id => id !== jobId)
        : [...prev, jobId]
    );
  };

  const handleSeeMore = () => {
    // If we need more data, fetch next page
    if (displayedCount >= allJobs.length && allJobs.length > 0) {
      setIsLoadingMore(true);
      setPage(prev => prev + 1);
    } else {
      // Just show more from current data
      setDisplayedCount(prev => prev + 10);
    }
  };

  // Stop loading indicator when data is fetched
  useEffect(() => {
    if (!isFetching && isLoadingMore) {
      setIsLoadingMore(false);
      setDisplayedCount(prev => prev + 10);
    }
  }, [isFetching, isLoadingMore]);

  const getTimeColor = (timeAgo: string | null | undefined): string => {
    if (!timeAgo) {
      return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300';
    }
    
    const lowerTimeAgo = timeAgo.toLowerCase();
    
    if (lowerTimeAgo.includes('hour')) {
      return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300';
    }
    
    if (lowerTimeAgo.includes('day')) {
      return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300';
    }
    
    return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300';
  };

  const displayedJobs = allJobs.slice(0, displayedCount);
  const hasMoreJobs = displayedCount < allJobs.length || (allJobs.length > 0 && displayedCount >= allJobs.length && allJobs.length % 10 === 0);

  if (isLoading && page === 1) return (
    <div className="flex flex-col items-center justify-center p-12">
      <div className="relative">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-300 dark:border-gray-700 border-t-blue-500"></div>
        <Search className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 text-blue-500" />
      </div>
      <p className="mt-4 text-sm text-gray-600 dark:text-gray-400 font-medium">Searching for jobs...</p>
    </div>
  );

  if (isError) return (
    <div className="m-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="font-semibold text-red-900 dark:text-red-300 text-sm mb-1">Error Loading Jobs</h3>
          <p className="text-xs text-red-700 dark:text-red-400">
            {error instanceof Error ? error.message : 'Failed to load jobs'}
          </p>
        </div>
      </div>
    </div>
  );

  if (displayedJobs.length === 0 && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12">
        <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
          <Briefcase className="w-8 h-8 text-gray-500 dark:text-gray-400" />
        </div>
        <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2">No Jobs Found</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">Try adjusting your search</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className='p-4 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 sticky top-0 z-10'>
        <div className="flex items-center justify-between mb-3">
          <div className="flex-1">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
              Jobs for you
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {query} • {country}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs font-semibold text-blue-600 dark:text-blue-400">
              {allJobs.length} found
            </p>
          </div>
        </div>
      </div>

      {/* Jobs List */}
      <div className="flex-1 overflow-y-auto">
        <div className="divide-y divide-gray-200 dark:divide-gray-800">
          {displayedJobs.map((job: Job, index: number) => (
            <div
              key={`${job.job_id}-${index}`}
              className="p-4 hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors duration-200 cursor-pointer"
            >
              {/* Job Row */}
              <div className="flex gap-4">
                {/* Company Logo */}
                <div className="relative w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg flex-shrink-0 overflow-hidden">
                  <Image 
                    src={job.employer_logo || 'https://via.placeholder.com/150'} 
                    alt={job.employer_name}
                    fill
                    className="object-cover"
                    sizes="48px"
                    priority={false}
                    onError={(e) => {
                      const img = e.target as HTMLImageElement;
                      img.src = 'https://via.placeholder.com/150';
                      img.style.display = 'block';
                    }}
                  />
                </div>

                {/* Job Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate mb-1">
                    {job.job_title || 'Job Title'}
                  </h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400 truncate mb-2">
                    {job.employer_name || 'Company Name'}
                  </p>
                  
                  {/* Job Tags */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs text-gray-700 dark:text-gray-300">
                      <MapPin className="w-3 h-3" />
                      <span>{job.job_location || 'Location'}</span>
                    </div>
                    
                    <div className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs text-gray-700 dark:text-gray-300">
                      <Briefcase className="w-3 h-3" />
                      <span>{job.job_employment_type?.replace('–', '') || 'Type'}</span>
                    </div>

                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${getTimeColor(job.job_posted_at)}`}>
                      <Clock className="w-3 h-3" />
                      {job.job_posted_at || 'Recent'}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {/* <button
                    onClick={() => toggleSaveJob(job.job_id)}
                    className={`p-2 rounded-lg transition-colors ${
                      savedJobs.includes(job.job_id)
                        ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                    title={savedJobs.includes(job.job_id) ? 'Saved' : 'Save'}
                  >
                    <BookmarkPlus className="w-4 h-4" />
                  </button> */}

                  <a
                    href={job.job_apply_link || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-colors"
                    onClick={(e) => {
                      if (!job.job_apply_link) {
                        e.preventDefault();
                      }
                    }}
                  >
                    <span>Apply</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* See More Button */}
        {(displayedCount < allJobs.length || (allJobs.length >= 10 && displayedCount >= allJobs.length)) && (
          <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800">
            <button
              onClick={handleSeeMore}
              disabled={isLoadingMore || isFetching}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoadingMore || isFetching ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  <span>Loading jobs...</span>
                </>
              ) : (
                <>
                  <span>See More Relevant Jobs</span>
                  <ChevronDown className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        )}

        {/* End Message */}
        {displayedCount >= allJobs.length && allJobs.length > 0 && (
          <div className="p-6 text-center border-t border-gray-200 dark:border-gray-800">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              You've viewed all {allJobs.length} jobs
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Jobs;
