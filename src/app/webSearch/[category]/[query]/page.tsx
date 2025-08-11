"use client";
import { Header } from '@/Component/Header';
import Loader from '@/Component/loader';
import { Freelancer } from '@/Component/subComponents/client';
import { JobPostPayload1 } from '@/Component/subComponents/Freelancer';
import JobCards from '@/Component/subComponents/JobCards';
import { getWebSearchData } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';
import { Badge } from "@/components/ui/badge"; // Fixed import
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import React from 'react';

const WebPage: React.FC = () => {
  const { category, query } = useParams();

  const decodedCategory =
    typeof category === "string" ? decodeURIComponent(category) : category;
  const decodedQuery =
    typeof query === "string" ? decodeURIComponent(query) : query;

  const { data, error, isLoading, isError } = useQuery({
    queryKey: ['webSearchData', decodedCategory, decodedQuery],
    queryFn: () => {
      if (!decodedCategory || !decodedQuery) {
        throw new Error('Category and query are required');
      }
      return getWebSearchData(decodedQuery, decodedCategory);
    },
    enabled: !!decodedCategory && !!decodedQuery
  });


console.log(data)

  if (isLoading) {
    return (
      <div className="w-screen h-screen flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (isError) {
    return <div className="text-red-500">Error: {String(error)}</div>;
  }

  return (
    <>
      <Header />

      {decodedCategory === "Jobs" && (
        <div className="container mx-auto flex flex-col gap-4">
          <h2 className="font-bold text-2xl">
            Result for {decodedQuery}
          </h2>

          {data?.length > 0 ? (
            data.map((item: JobPostPayload1) => (
              <JobCards key={item._id} {...item} />
            ))
          ) : (
            <div className="font-bold">No data found</div>
          )}
        </div>
      )}

      {decodedCategory === "Freelancer" && (
        <div className="container mx-auto flex flex-col gap-4">
           <h2 className="font-bold text-2xl">
            Result for {decodedQuery}
          </h2>
          <div className="space-y-6 pb-4">
    {data.length>0 ? data?.map((val: Freelancer, idx: number) =>
              val.profileVisibility ? (
                <div
                  key={idx}
                  className=" bg-background  overflow-x-auto hide-scrollbar rounded-xl p-6 shadow-2xl border border-gray-100 dark:border-gray-700 flex items-center gap-6"
                >
                  {/* Profile Picture */}
                  <div className="relative w-20 h-20 rounded-full overflow-hidden flex-shrink-0 border-2 border-gray-200 dark:border-gray-700 shadow">
                    <Image
                      src={val.profilePicture || ''}
                      alt={val.name}
                      fill
                      className="object-cover"
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1 space-y-3">
                    {/* Name */}
                    <div>
                      <h3 className="text-xl font-semibold mb-1 text-gray-900 dark:text-white">
                        {val.name}
                      </h3>
                      <div className="mt-1">
                        <Badge variant="secondary">
                          {val.Proffession}
                        </Badge>
                      </div>
                    </div>

                    {/* Skills */}
                    <div className="space-y-2">
                      <div className="flex flex-wrap gap-2">
                        {val.Skills.slice(0, 3).map((skill, i) => (
                          <span
                            key={i}
                            className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 px-3 py-1.5 rounded-md font-medium"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {val.Experience} years experience
                      </p>
                    </div>

                    {/* Contact */}
                    <div className="pt-2">
                      <Link
                        href={`/profile/publicView/${val._id}-${val.role}`}
                        className="px-6 py-2.5 text-sm font-bold bg-gray-700 dark:bg-gray-200 text-background rounded-lg shadow hover:bg-gray-800 dark:hover:bg-gray-400 transition-all"
                      >
                        Contact
                      </Link>
                    </div>
                  </div>
                </div>
              ) : null
            ):
            
            <div className='font-bold'>No Data founded</div>
            }
          </div>
        </div>
      )}
    </>
  );
};

export default WebPage;
