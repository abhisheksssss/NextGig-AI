"use client"
import Loader from '@/Component/loader';
import { useUser } from '@/context/user';
import { fetchContactDetails } from '@/lib/api';
import { useQuery } from '@tanstack/react-query'
import Image from 'next/image';
import { useParams } from 'next/navigation';
import React from 'react'

const CreatedContact = () => {
  const {user}=useUser()
  const params = useParams(); 
  const slug = params.slug as string;

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['contactDetails', slug],
    queryFn: ({ queryKey }) => {
      const projectId = queryKey[1] as string;
      return fetchContactDetails(projectId);
    },
    enabled: !!slug, // Only run query if slug exists
  });


  if (isLoading) {
    return (
      <div className='flex items-center justify-center w-screen h-screen'>
        <Loader/>
      </div>
    )
  }

if(!user || user.onBoarding===false ){
return(<div className='flex items-center justify-center w-screen h-screen'>
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-2">Unauthozie Access</h2>
        </div>
 </div>)
}

if(user){
  if(user.role==="Freelancer"){
    if(user._id!==data. freelancerId._id){
   return(  <div className='flex items-center justify-center w-screen h-screen'>
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-2">Unauthozie Access</h2>
        </div>
 </div>)
    }
  }else if(user.role==="Client"){
    if(user._id!==data.clientId._id){
    return(  <div className='flex items-center justify-center w-screen h-screen'>
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-2">Unauthozie Access</h2>
        </div>
      </div>)
    }
  }
}


  if (isError) {
    return (
      <div className='flex items-center justify-center w-screen h-screen'>
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-2">Error Loading Contract</h2>
          <p className="text-gray-600">{error?.message || 'Something went wrong'}</p>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className='flex items-center justify-center w-screen h-screen'>
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-600 mb-2">No Contract Found</h2>
          <p className="text-gray-500">The contract data could not be loaded.</p>
        </div>
      </div>
    )
  }

  // Destructure the contract data
  const { 
    clientId: client, 
    freelancerId: freelancer, 
    jobId: job, 
    amount, 
    status, 
    paymentIntentId, 
    isReleased,
    createdAt,
    _id: contractId
  } = data;

  return (
  <>


  <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Project Contract</h1>
                <p className="text-sm text-gray-500 mt-1">Contract ID: {contractId}</p>
              </div>
              <div className="flex items-center space-x-3">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  status === 'completed' ? 'bg-green-100 text-green-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {status?.toUpperCase()}
                </span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  isReleased ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {isReleased ? 'RELEASED' : 'IN ESCROW'}
                </span>
              </div>
            </div>
          </div>
          
          {/* Contract Amount */}
          <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="text-center">
              <p className="text-sm font-medium text-gray-600">Contract Value</p>
              <p className="text-4xl font-bold text-indigo-600 mt-1">${amount?.toLocaleString()}</p>
              <p className="text-xs text-gray-500 mt-1">Payment ID: {paymentIntentId}</p>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Client Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
                Client Information
              </h2>
            </div>
            <div className="p-6">
              <div className="flex items-start space-x-4">
                <Image 
                  src={client?.profilePicture || '/default-avatar.png'} 
                  alt={client?.name || 'Client'}
                  width={50}
                  height={50}
                  className=" rounded-full object-cover border-2 border-gray-200"
                />
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900">{client?.name}</h3>
                  <p className="text-sm text-gray-600">{client?.company}</p>
                  <p className="text-sm text-gray-500">{client?.location}</p>
                  
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center text-sm">
                      <span className="font-medium text-gray-700 w-24">Email:</span>
                      <span className="text-gray-600">{client?.email}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <span className="font-medium text-gray-700 w-24">Phone:</span>
                      <span className="text-gray-600">{client?.contactdetails?.phone}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <span className="font-medium text-gray-700 w-24">Prefers:</span>
                      <span className="text-gray-600">{client?.ContactPreference}</span>
                    </div>
                  </div>

                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Fields of Interest</h4>
                    <div className="flex flex-wrap gap-2">
                      {client?.Field?.map((field, index:number) => (
                        <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-md">
                          {field.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="text-sm font-medium text-gray-700 mb-2">About</h4>
                <p className="text-sm text-gray-600 leading-relaxed">{client?.Bio}</p>
              </div>
            </div>
          </div>

          {/* Freelancer Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                Freelancer Information
              </h2>
            </div>
            <div className="p-6">
              <div className="flex items-start space-x-4">
                <Image
                  src={freelancer?.profilePicture || '/default-avatar.png'} 
                  alt={freelancer?.name || 'Freelancer'}
                  width={50}
                  height={50}
                  className=" rounded-full object-cover border-2 border-gray-200"
                />
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900">{freelancer?.name}</h3>
                  <p className="text-sm text-gray-600">{freelancer?.Proffession}</p>
                  <p className="text-sm text-gray-500">{freelancer?.location}</p>
                  
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center text-sm">
                      <span className="font-medium text-gray-700 w-24">Email:</span>
                      <span className="text-gray-600">{freelancer?.email}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <span className="font-medium text-gray-700 w-24">Phone:</span>
                      <span className="text-gray-600">{freelancer?.contactdetails?.phone}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <span className="font-medium text-gray-700 w-24">Prefers:</span>
                      <span className="text-gray-600">{freelancer?.ContactPreference}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <span className="font-medium text-gray-700 w-24">Rate:</span>
                      <span className="text-gray-600">${freelancer?.HourlyRate}/hour</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <span className="font-medium text-gray-700 w-24">Experience:</span>
                      <span className="text-gray-600">{freelancer?.Experience} years</span>
                    </div>
                  </div>

                  <div className="mt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Languages</h4>
                    <div className="flex flex-wrap gap-2">
                      {freelancer?.languages?.map((lang, index:number) => (
                        <span key={index} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-md">
                          {lang}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h4 className="text-sm font-medium text-gray-700 mb-2">About</h4>
                <p className="text-sm text-gray-600 leading-relaxed">{freelancer?.Bio}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Job Details */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
              Project Details
            </h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{job?.title}</h3>
                <p className="text-gray-600 leading-relaxed mb-6">{job?.description}</p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-700 mb-1">Project Budget</h4>
                    <p className="text-lg font-semibold text-gray-900">${job?.budget?.toLocaleString()}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-700 mb-1">Created</h4>
                    <p className="text-lg font-semibold text-gray-900">
                      {job?.createdAt ? new Date(job.createdAt).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Required Skills</h4>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {job?.skills?.map((skill, index:number) => (
                    <span key={index} className="inline-block px-3 py-1 bg-purple-100 text-purple-800 text-xs rounded-full mr-2 mb-2">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Freelancer Skills Match */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <div className="w-2 h-2 bg-orange-500 rounded-full mr-2"></div>
              Freelancer Skills
            </h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Technical Skills</h4>
                <div className="space-y-2">
                  {freelancer?.Skills?.map((skill, index:number) => {
                    const isRequired = job?.skills?.includes(skill);
                    return (
                      <span 
                        key={index} 
                        className={`inline-block px-3 py-1 text-xs rounded-full mr-2 mb-2 ${
                          isRequired 
                            ? 'bg-green-100 text-green-800 border border-green-300' 
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {skill}
                        {isRequired && ' ✓'}
                      </span>
                    );
                  })}
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Portfolio & Resume</h4>
                <div className="space-y-3">
               
                  {freelancer?.resumePdf && (
                    <a 
                      href={freelancer.resumePdf}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                    >
                      <span className="text-sm text-blue-600">📄 View Resume (PDF)</span>
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contract Actions */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Contract Actions</h2>
          </div>
          <div className="p-6">
            <div className="flex flex-wrap gap-4">
      
    { user?.role==="Client" &&   <button className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                Release Payment
              </button>}

        {   user?.role==="Client" &&     <button className="px-6 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors">
                Request Revision
              </button>}
              <button className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                Download Contract
              </button>
            </div>
          </div>
        </div>

        {/* Contract Timeline */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Timeline</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Contract Created</p>
                  <p className="text-xs text-gray-500">
                    {createdAt ? new Date(createdAt).toLocaleString() : 'N/A'}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">Payment in Escrow</p>
                  <p className="text-xs text-gray-500">Awaiting project completion</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Payment Release</p>
                  <p className="text-xs text-gray-400">Pending completion</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </>
    
  )
}

export default CreatedContact
