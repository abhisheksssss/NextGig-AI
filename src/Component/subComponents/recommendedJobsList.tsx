"use client";

import { Sparkles, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import JobCards from "./JobCards";
import { forYouData } from "@/lib/api";

interface RecommendedJob {
  _id: string;
  title: string;
  description: string;
  skills: string[];
  budget: number;
  clientId: string;
  status: boolean;
  createdAt: string;
  matchScore?: number;
}

export default function RecommendedJobsList() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['recommended-jobs'],
    queryFn: async () => {
      const response = await forYouData();
      console.log("THis is the data",response);
      return response;
    },
    staleTime: 1000 * 60 * 5,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-2" />
          <p className="text-sm text-gray-600 dark:text-gray-400">Loading recommended jobs...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-12 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800">
        <p className="text-red-600 dark:text-red-400">Error loading recommended jobs</p>
      </div>
    );
  }

  const jobs = data || [];

  if (jobs.length === 0) {
    return (
      <div className="text-center py-12 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800">
        <Sparkles className="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <p className="text-gray-600 dark:text-gray-400">No recommended jobs available</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {jobs.map((job: RecommendedJob, index: number) => (
        <div key={job._id} className="relative">
          {/* Top match badge for first 3 */}
          {index < 3 && (
            <div className="absolute -top-2 -left-2 z-10 w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
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
            {job.matchScore !== undefined && (
              <div className="absolute top-0 right-3 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-semibold rounded-full flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                {Math.round(job.matchScore)}% match
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
