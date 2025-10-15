import { useUser } from '@/context/user';
import { fetchGoogleData } from '@/lib/api';
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { TrendingUp, ExternalLink, Search, AlertCircle, Newspaper } from 'lucide-react';
import React, { useEffect, useState } from 'react'

const News = () => {
  const { googleQuery } = useUser();
  const queryClient = useQueryClient();

  const [query, setQuery] = useState('("job openings" OR "hiring now" OR "job news")')

  useEffect(() => {
    if (googleQuery) {
      setQuery(googleQuery);
      queryClient.invalidateQueries({ queryKey: ["GoogleSearch"] })
    }
  }, [googleQuery, query, queryClient])

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["GoogleSearch", query],
    queryFn: () => fetchGoogleData(query),
    staleTime: 1000 * 60 * 5,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  if (isLoading) return (
    <div className="flex flex-col items-center justify-center p-12">
      <div className="relative">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-300 dark:border-gray-700 border-t-blue-500"></div>
        <Search className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 text-blue-500" />
      </div>
      <p className="mt-4 text-sm text-gray-600 dark:text-gray-400 font-medium">Loading news...</p>
    </div>
  );

  if (isError) return (
    <div className="m-4 p-6 bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-800/50 rounded-xl">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-red-200 dark:bg-red-900/40 rounded-lg flex items-center justify-center flex-shrink-0">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-red-700 dark:text-red-400 mb-1">Error Loading News</h3>
          <p className="text-xs text-red-600 dark:text-red-300/80">{(error as Error).message}</p>
        </div>
      </div>
    </div>
  );

  if (!data?.items?.length) {
    return (
      <div className="m-4 p-8 bg-gray-100 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl text-center">
        <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
          <Newspaper className="w-8 h-8 text-gray-500 dark:text-gray-400" />
        </div>
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">No Results Found</h3>
        <p className="text-xs text-gray-600 dark:text-gray-400">Try adjusting your search query</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {/* Search Query Display */}
      <div className='p-6 border-b border-gray-200 dark:border-gray-800 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20'>
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <Search className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1">
              Search Results
            </h2>
            <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2">
              {query.replace(/[()"|]/g, '')}
            </p>
          </div>
        </div>
      </div>

      {/* News Items */}
      <div className="flex flex-col">
        {data.items.map((item: any, index: number) => (
          <a
            key={index}
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
            className="group p-5 border-b border-gray-200 dark:border-gray-800 hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-all duration-300 last:border-b-0"
          >
            {/* Article Header */}
            <div className="flex items-start gap-3 mb-3">
              <div className="w-8 h-8 bg-gray-100 dark:bg-gray-800 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/40 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors">
                <Newspaper className="w-4 h-4 text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 mb-1">
                  {item.title}
                </h3>
                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-500">
                  <span className="truncate">{item.displayLink}</span>
                  <ExternalLink className="w-3 h-3 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            </div>

            {/* Article Snippet */}
            <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-3 pl-11">
              {item.snippet}
            </p>

            {/* Read More Indicator */}
            <div className="flex items-center gap-2 mt-3 pl-11 opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-xs font-medium text-blue-600 dark:text-blue-400">Read more</span>
              <ExternalLink className="w-3 h-3 text-blue-600 dark:text-blue-400" />
            </div>
          </a>
        ))}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
        <div className="flex items-center justify-center gap-2 text-xs text-gray-600 dark:text-gray-500">
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Showing {data.items.length} results</span>
        </div>
      </div>
    </div>
  );
}

export default News
