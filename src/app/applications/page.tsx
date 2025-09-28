"use client"
import Loader from '@/Component/loader';
import GetBack from '@/Component/subComponents/getBack';
import { Ifreelancer, useUser } from '@/context/user';
import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation';
import { timeAgo } from '@/utils/timeutils';

const ApplicationPages = () => {
  const { user, getUser } = useUser();
  const router = useRouter();

  console.log(user);

  useEffect(() => {
    getUser();
  }, []);

  if (!user) {
    return <div className='flex items-center justify-center w-screen h-screen'>
      <Loader></Loader>
    </div>
  }

  return (
    <div className='w-screen h-screen'>
      <div>
        <GetBack/>
      </div>
      <div className='border-2 rounded-xl container mx-auto max-h-[85%] h-[85%] mt-5 overflow-y-auto'>
        <h3 className='font-bold text-xl pl-5 pt-2'>You have applied for these Jobs</h3>
        {user.role === "Freelancer" ? (
          (user as Ifreelancer).appliedFor.length > 0 ? (
            (user as Ifreelancer).appliedFor.map((job, idx) => (
              <div
                key={idx}
                onClick={() => router.push(`apply/${job._id}`)}
                className="m-4 p-4 border-2 cursor-pointer shadow-xl rounded-2xl flex flex-col gap-2 dark:bg-gray-900"
              >
                <h2 className="font-bold text-lg">{job.title}</h2>
                <p className="line-clamp-3 mt-1 text-sm">{job.description}</p>
                <p className="text-sm dark:text-gray-400 mt-1">
                  Budget: {job.budget}$
                </p>
                <div className="flex gap-2 text-sm text-gray-400 mt-1">
                  {job.skills.slice(0, 5).map((skill, idx) => (
                    <div
                      key={idx}
                      className="border-2 rounded-xl p-1 px-2 dark:bg-gray-500 dark:text-black"
                    >
                      {skill}
                    </div>
                  ))}
                </div>
                <p className="dark:text-gray-200">Applied: {timeAgo(job.updatedAt)}</p>
              </div>
            ))
          ) : (
            <div className='flex items-center justify-center w-full h-[90%]'>
              <p>No data found</p>
            </div>
          )
        ) : (
          <div className="flex items-center justify-center w-screen h-screen">
            <p>You are not allowed to access this page</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default ApplicationPages
