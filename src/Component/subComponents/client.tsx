import { Badge } from '@/components/ui/badge'
import { getApplicants, getFreelancer } from '@/lib/api'
import { useQuery } from '@tanstack/react-query'
import { Menu, X } from 'lucide-react'
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
  role:string;
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


const Client = () => {
  const [openSideBar, setOpenSideBar] = React.useState(false)
  const [isAnimating, setIsAnimating] = React.useState(false)

  const {data, isLoading, isError, error} = useQuery<Freelancer[]>({
    queryKey: ['clients'],
    queryFn: getFreelancer
  })
  const {data:applicants} = useQuery({
    queryKey: ['fetchJobData'],
    queryFn: getApplicants
  })





  const handleOpenSidebar = () => {
    setOpenSideBar(true)
    // Small delay to ensure DOM is ready, then start animation
    setTimeout(() => {
      setIsAnimating(true)
    }, 10)
  }

  const handleCloseSidebar = () => {
    setIsAnimating(false)
    // Delay the actual close to allow animation to complete
    setTimeout(() => {
      setOpenSideBar(false)
    }, 300) // Match the transition duration
  }

  if (isLoading) return <div>Loading...</div>
  if (isError) return <div>Error: {error.message}</div>

  return (
    <div className="w-full min-h-screen bg-background transition-colors duration-300 overflow-x-hidden">
      <div className="max-w-[1400px] mx-auto px-4 md:px-8 pt-30 sm:pt-22">
        <div className="flex flex-col md:flex-row gap-8 h-[calc(100vh-120px)]">
          {/* Left column - Scrollable Recommended Freelancers */}
          <div className="w-full md:w-2/3 flex flex-col bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800 p-8">
           <div className='flex items-center justify-between'>
            <h2 className="text-3xl font-bold mb-8 text-gray-800 dark:text-white tracking-tight flex-shrink-0">Recommended Freelancers</h2>
            <Menu className='md:hidden mb-8 cursor-pointer hover:scale-110 transition-transform duration-200' onClick={handleOpenSidebar}/>
            </div> 
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-4">
              <div className="space-y-6 pb-4">
                {data?.map((val: Freelancer, idx: number) => (
                  val.profileVisibility && (
                    <div key={idx} className="bg-white dark:bg-gray-800 overflow-x-auto hide-scrollbar rounded-xl p-6 shadow border border-gray-100 dark:border-gray-700 flex items-center gap-6">
                      {/* Profile Picture - Left Center */}
                      <div className="relative w-20 h-20 rounded-full overflow-hidden flex-shrink-0 border-2 border-gray-200 dark:border-gray-700 shadow">
                        <Image
                          src={val.profilePicture || ''}
                          alt={val.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      {/* Content - Right side */}
                      <div className="flex-1 space-y-3">
                        {/* Name and Professions */}
                        <div>
                          <h3 className="text-xl font-semibold mb-1 text-gray-900 dark:text-white">{val.name}</h3>
                          <div className="flex flex-wrap gap-2">
                            <div className="mt-1">
                              <Badge variant="secondary" className="text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 px-3 py-1 rounded">
                                {val.Proffession}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        {/* Skills and Experience */}
                        <div className="space-y-2">
                          <div className="flex flex-wrap gap-2">
                            {val.Skills.slice(0, 3).map((skill: string, i: number) => (
                              <span key={i} className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 px-3 py-1.5 rounded-md font-medium">
                                {skill}
                              </span>
                            ))}
                          </div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{val.Experience} years experience</p>
                        </div>
                        {/* Contact Button */}
                        <div className="pt-2">
                          <Link href={`/profile/publicView/${val._id}-${val.role}`} className="px-6 py-2.5 text-sm font-bold bg-gray-700 dark:bg-gray-200 text-background rounded-lg shadow hover:bg-gray-800 dark:hover:bg-gray-400 transition-all">
                            Contact
                          </Link>
                        </div>
                      </div>
                    </div>
                  )
                ))}
              </div>
            </div>
          </div>

          {/* Right column - Sticky section */}
          <div className="w-full hidden md:block md:w-1/3 space-y-8">
            {/* Post Job Button */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-800">
              <Link href="/postJob" className="w-full importantAnimation flex items-center justify-center px-6 py-4 text-lg font-medium bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-all">
                Post a Job
              </Link>
            </div>

{/* Recent Applicants Box */}

<div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-800">
  <h3 className="text-xl font-bold mb-6 text-gray-800 dark:text-white">Recent Applicants</h3>
  <div className="space-y-5 overflow-y-auto max-h-[400px]">
    {Array.isArray(applicants) && applicants.every(job => job.applicants.length === 0) ? (
      <div className="text-center text-gray-500 dark:text-gray-400">
        No applicants found.
      </div>
    ) : (
      Array.isArray(applicants) &&
      applicants.map((job, i:number) => (
        job.applicants.length > 0 && (
          <div
            key={i}
            className="pb-4 border-2 p-5 rounded-xl border-gray-100 dark:border-gray-700"
          >
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
              Job Title: <span className="font-medium">{job.title}</span>
            </p>
            {job.applicants.slice(0,2).map((applicant:Applicant, idx:number) => (
              <div key={idx} className="flex items-center cursor-pointer gap-4 mb-3">
                <div className="w-12 h-12 bg-gray-200  dark:bg-gray-700 rounded-full">
                  <Image
                    src={applicant.profilePicture}
                    alt={applicant.name}
                    width={50}
                    height={50}
                    className='rounded-full object-cover'
                  />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    {applicant.name}
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {applicant.email}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Applied 2h ago
                  </p>
                </div>
              </div>
            ))}
          </div>
        )
      ))
    )}
  </div>
</div>

            {/* Top Rated Freelancers Box */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-800">
              <h3 className="text-xl font-bold mb-6 text-gray-800 dark:text-white">Top Rated Freelancers</h3>
              <div className="space-y-5">
                {[1, 2, 3].map((_, i) => (
                  <div key={i} className="flex items-center gap-4 pb-4 border-b last:border-0 border-gray-100 dark:border-gray-700">
                    <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center text-2xl shadow">
                      ⭐
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">Freelancer {i + 1}</h4>
                      <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-300">
                        <span>5.0</span>
                        <span className="text-yellow-500">★★★★★</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

  





          </div>
        </div>
      </div>

      {/* Sidebar Modal */}
      {openSideBar && (
        <>
          {/* Backdrop with smooth fade-in and fade-out */}
          <div
            className={`fixed inset-0 z-30 bg-black/40 backdrop-blur-sm transition-all duration-300 ease-in-out ${
              isAnimating ? 'opacity-100' : 'opacity-0'
            }`}
            onClick={handleCloseSidebar}
          />

          {/* Sidebar with smooth slide-in from right */}
          <div
            className={`fixed top-0 right-0 z-40 h-full w-[85%] sm:w-[70%] md:w-1/3 bg-white dark:bg-gray-50 shadow-2xl transform transition-all duration-300 ease-in-out ${
              isAnimating ? 'translate-x-0' : 'translate-x-full'
            }`}
          >
            {/* Sidebar Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Menu</h2>
              <button
                onClick={handleCloseSidebar}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
              >
                <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>

            {/* Sidebar Content */}
            <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-80px)]">
              {/* Post Job Button */}
              <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-800">
                <Link
                  href="/postJob"
                  className="w-full importantAnimation flex items-center justify-center px-6 py-4 text-lg font-medium bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
                  onClick={handleCloseSidebar}
                >
                  Post a Job
                </Link>
              </div>


{/* Recent applicants */}

<div className="bg-white dark:bg-gray-900 rounded-2xl p-8 shadow-lg border border-gray-200 dark:border-gray-800">
  <h3 className="text-xl font-bold mb-6 text-gray-800 dark:text-white">Recent Applicants</h3>
  <div className="space-y-5 overflow-y-auto max-h-[400px]">
    {Array.isArray(applicants) && applicants.every(job => job.applicants.length === 0) ? (
      <div className="text-center text-gray-500 dark:text-gray-400">
        No applicants found.
      </div>
    ) : (
      Array.isArray(applicants) &&
      applicants.map((job, i:number) => (
        job.applicants.length > 0 && (
          <div
            key={i}
            className="pb-4 border-2 p-5 rounded-xl border-gray-100 dark:border-gray-700"
          >
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
              Job Title: <span className="font-medium">{job.title}</span>
            </p>
            {job.applicants.slice(0,2).map((applicant:Applicant, idx:number) => (
              <div key={idx} className="flex items-center cursor-pointer gap-4 mb-3">
                <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full">
                  <Image
                    src={applicant.profilePicture}
                    alt={applicant.name}
                    width={50}
                    height={50}
                    className='rounded-full object-cover'
                  />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">
                    {applicant.name}
                  </h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {applicant.email}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Applied 2h ago
                  </p>
                </div>
              </div>
            ))}
          </div>
        )
      ))
    )}
  </div>
</div>




              {/* Top Rated Freelancers Box */}
              <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-lg border border-gray-200 dark:border-gray-800">
                <h3 className="text-xl font-bold mb-6 text-gray-800 dark:text-white">Top Rated Freelancers</h3>
                <div className="space-y-4">
                  {[1, 2, 3].map((_, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-4 pb-4 border-b last:border-0 border-gray-100 dark:border-gray-700"
                    >
                      <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center text-2xl shadow">
                        ⭐
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-white">Freelancer {i + 1}</h4>
                        <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-300">
                          <span>5.0</span>
                          <span className="text-yellow-500">★★★★★</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Applicants Box */}

            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default Client