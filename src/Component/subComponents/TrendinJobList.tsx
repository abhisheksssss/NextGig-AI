"use client";

import { useEffect, useRef } from "react";
import { TrendingUp, Loader2 } from "lucide-react";
import { useInfiniteQuery } from "@tanstack/react-query";
import JobCards from "./JobCards";

interface TrendingJob {
  _id: string;
  title: string;
  description: string;
  skills: string[];
  budget: number;
  clientId: string;
  status: boolean;
  createdAt: string;
  applicantCount?: number;
  trendingScore?: number;
}

export default function TrendingJobsList() {
  const observerTarget = useRef<HTMLDivElement>(null);

  // Fetch trending jobs with infinite scroll
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery({
    queryKey: ['trending-jobs'],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await fetch(`/api/trending?page=${pageParam}&limit=10`);
      if (!response.ok) throw new Error('Failed to fetch trending jobs');
      return response.json();
    },
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.hasMore ? allPages.length + 1 : undefined;
    },
    initialPageParam: 1,
    staleTime: 1000 * 60 * 5,
  });

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Get all jobs from all pages
  const allJobs = data?.pages.flatMap(page => page.data) || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-orange-500 mx-auto mb-2" />
          <p className="text-sm text-gray-600 dark:text-gray-400">Loading trending jobs...</p>
        </div>
      </div>
    );
  }

  if (allJobs.length === 0) {
    return (
      <div className="text-center py-12 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800">
        <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-600 dark:text-gray-400">No trending jobs available</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {allJobs.map((job: TrendingJob, index: number) => (
        <div key={job._id} className="relative">
          {/* Trending Badge for top 3 */}
          {index < 3 && (
            <div className="absolute -top-2 -left-2 z-10 w-8 h-8 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-sm">#{index + 1}</span>
            </div>
          )}
          <div className="relative">
            <JobCards
              clientId={job.clientId}
              description={job.description}
              createdAt={job.createdAt}
              title={job.title}
              skills={job.skills}
              status={job.status}
              _id={job._id}
            />
            {/* Applicant count badge */}
            {job.applicantCount !== undefined && job.applicantCount > 0 && (
              <div className="absolute top-0 right-3  px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 text-xs font-semibold rounded-full flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                {job.applicantCount} applicants
              </div>
            )}
          </div>
        </div>
      ))}

      {/* Loading next page */}
      {isFetchingNextPage && (
        <div className="flex items-center justify-center py-8 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800">
          <Loader2 className="w-6 h-6 animate-spin text-orange-500 mr-2" />
          <span className="text-sm text-gray-600 dark:text-gray-400">Loading more jobs...</span>
        </div>
      )}

      {/* Intersection observer target */}
      {hasNextPage && <div ref={observerTarget} className="h-4" />}

      {/* End of results */}
      
    </div>
  );
}
