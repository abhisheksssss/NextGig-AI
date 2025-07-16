import { useQuery } from '@tanstack/react-query'
import React from 'react'

const News = () => {
  const query = '("job openings" OR "hiring now" OR "job news")';
  const GOOGLE_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_SEARCH_KEY;
  const SEARCH_ENGINE_ID = process.env.NEXT_PUBLIC_GOOGLE_CX;

  console.log('This is google api key', GOOGLE_API_KEY);
  console.log('This is google engine id', SEARCH_ENGINE_ID);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["GoogleSearch"],
    queryFn: async () => {
      if (!GOOGLE_API_KEY || !SEARCH_ENGINE_ID) {
        throw new Error('Missing API key or Search Engine ID');
      }

      try {
        const url = `https://www.googleapis.com/customsearch/v1?q=${encodeURIComponent(query)}&cx=${SEARCH_ENGINE_ID}&key=${GOOGLE_API_KEY}`;
        console.log('Request URL:', url); // Debug log
        
        const res = await fetch(url);
        
        if (!res.ok) {
          const errorText = await res.text();
          console.error('API Response:', errorText); // Debug log
          throw new Error(`API Error: ${res.status} ${res.statusText}`);
        }

        const data = await res.json();
        if (data.error) {
          console.error('API Error Response:', data.error); // Debug log
          throw new Error(data.error.message || 'Google API Error');
        }

        return data;
      } catch (err) {
        console.error('Google Search Error:', err);
        throw err;
      }
    },
    staleTime: 1000 * 60 * 5,        // 5 minutes "fresh"
    refetchOnMount: false,            // don't refetch on remount
    refetchOnWindowFocus: false,      // ignore tab focus
    refetchOnReconnect: false,
  });

  if (isLoading) return (
    <div className="flex items-center justify-center p-4">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  );

  if (isError) return (
    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
      <p className="text-red-600">Error: {(error as Error).message}</p>
    </div>
  );

  if (!data?.items?.length) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-yellow-600">No results found</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className=''>
        <h2 className="text-lg font-bold">Job Realted News</h2>
      </div>
      {data.items.map((item:any , index: number) => (
        <div key={index} className="bg-background text-foreground border-2 dark:shadow-white dark:shadow shadow-xl rounded-lg p-4 hover:shadow-lg transition-shadow">
          <h3 className="text-lg font-semibold mb-2">
            <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              {item.title}
            </a>
          </h3>
          <p className="text-sm text-gray-600">{item.snippet}</p>
          <div className="mt-2 text-xs text-gray-500">{item.displayLink}</div>
        </div>
      ))}
    </div>
  );
}

export default News



