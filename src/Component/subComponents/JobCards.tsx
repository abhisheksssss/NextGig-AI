"use client"
import React, { useEffect, useRef, useState } from 'react'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import Link from 'next/link';
import { 
  Briefcase, Clock,
  ExternalLink, CheckCircle, XCircle, Eye,
  ArrowRight, Sparkles
} from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { updateViewData } from '@/lib/api';
import { Ifreelancer, useUser } from '@/context/user';
import toast from 'react-hot-toast';

type JobCardProps = {
  _id: string;
  clientId: string;
  createdAt: string;
  description: string;
  skills: string[];
  title: string;
  status: boolean;
};

const JobCards: React.FC<JobCardProps> = ({ _id, createdAt, description, skills, title, status }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
   const {user}=useUser();

   const startTimeRef=useRef<number|null>(null);

const mutation = useMutation({
  // 👇 mutation function now accepts ONE object
  mutationFn: ({ freelancerId, jobId, duration }: { freelancerId: string; jobId: string; duration: number }) =>
    updateViewData(freelancerId, jobId, duration),
  onError:()=>{
    toast.error("No founded");
  }
});



useEffect(()=>{
if(isModalOpen){
  startTimeRef.current=Date.now();

}else if(startTimeRef.current){
  //modal closed calculated duration
 const durationInMs = Date.now() - startTimeRef.current;

     mutation.mutate({
      freelancerId: (user as Ifreelancer)._id,
      jobId: _id,
      duration: durationInMs,
    });

    startTimeRef.current = null;
}
},[_id, isModalOpen, mutation, user])


  const formatDate = (date: string) => {
    const now = new Date();
    const posted = new Date(date);
    const diffTime = Math.abs(now.getTime() - posted.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return posted.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <>
      <div className='group bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800/80 transition-all duration-300 rounded-2xl p-6 border border-gray-200 dark:border-gray-800 hover:border-green-500 dark:hover:border-green-700 hover:shadow-xl hover:shadow-green-500/10 dark:hover:shadow-green-900/10 space-y-4'>
        {/* Header Section */}
        <div className='flex justify-between items-start gap-4'>
          <div className='flex-1 space-y-2'>
            <div className='flex items-start gap-3'>
              <div className='w-12 h-12 bg-gradient-to-br from-green-600 to-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform'>
                <Briefcase className='w-6 h-6 text-white' />
              </div>
              <div className='flex-1 min-w-0'>
                <h2 className='text-xl font-bold text-gray-900 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors line-clamp-2'>
                  {title}
                </h2>
                <div className='flex items-center gap-2 mt-1.5 text-sm text-gray-500 dark:text-gray-400'>
                  <Clock className='w-4 h-4' />
                  <span>{formatDate(createdAt)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Status Badge */}
          {status ? (
            <div className='flex items-center gap-1.5 px-3 py-1.5 bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-800/50 rounded-full'>
              <CheckCircle className='w-4 h-4 text-green-600 dark:text-green-500' />
              <span className='text-xs font-semibold text-green-700 dark:text-green-400'>Active</span>
            </div>
          ) : (
            <div className='flex items-center gap-1.5 px-3 py-1.5 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-800/50 rounded-full'>
              <XCircle className='w-4 h-4 text-red-600 dark:text-red-500' />
              <span className='text-xs font-semibold text-red-700 dark:text-red-400'>Closed</span>
            </div>
          )}
        </div>

        {/* Description Section */}
        <div className='space-y-2'>
          <p className='text-sm text-gray-700 dark:text-gray-300 line-clamp-3 leading-relaxed'>
            {description}
          </p>
        </div>

        {/* Skills Section */}
        <div className='pt-3 border-t border-gray-200 dark:border-gray-800'>
          <div className='flex flex-wrap gap-2'>
            {skills.slice(0, 6).map((skill, index) => (
              <span
                key={index}
                className='px-3 py-1.5 text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors'
              >
                {skill.trim()}
              </span>
            ))}
            {skills.length > 6 && (
              <span className='px-3 py-1.5 text-xs font-semibold bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg border border-green-300 dark:border-green-800/50'>
                +{skills.length - 6} more
              </span>
            )}
          </div>
        </div>

        {/* Footer Section */}
        <div className='pt-4 flex flex-col sm:flex-row gap-3'>
          <button 
            onClick={() => setIsModalOpen(true)}
            className='flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-semibold rounded-xl transition-all border border-gray-200 dark:border-gray-700 group/btn'
          >
            <Eye className='w-4 h-4' />
            View Details
            <ArrowRight className='w-4 h-4 group-hover/btn:translate-x-1 transition-transform' />
          </button>
          {/* <Link 
            href={`/apply/${_id}`}
            className='flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl hover:scale-105'
          >

            <Sparkles className='w-4 h-4' />
            Apply Now
          </Link> */}
        </div>
      </div>

      {/* Enhanced Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[900px] bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white rounded-2xl mx-4">
          <DialogHeader>
            <div className='flex items-start gap-4 mb-4'>
              <div className='w-14 h-14 bg-gradient-to-br from-green-600 to-emerald-600 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg'>
                <Briefcase className='w-7 h-7 text-white' />
              </div>
              <div className='flex-1'>
                <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {title}
                </DialogTitle>
                <div className="flex flex-wrap items-center gap-3 text-sm">
                  <span className='flex items-center gap-1.5 text-gray-600 dark:text-gray-400'>
                    <Clock className='w-4 h-4' />
                    {formatDate(createdAt)}
                  </span>
                  {status ? (
                    <span className="flex items-center gap-1.5 px-3 py-1 bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-800/50 rounded-full">
                      <CheckCircle className="h-3.5 w-3.5 text-green-600 dark:text-green-500" />
                      <span className='text-xs font-semibold text-green-700 dark:text-green-400'>Active</span>
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 px-3 py-1 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-800/50 rounded-full">
                      <XCircle className="h-3.5 w-3.5 text-red-600 dark:text-red-500" />
                      <span className='text-xs font-semibold text-red-700 dark:text-red-400'>Closed</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-6 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
            {/* Description */}
            <div className='bg-gray-50 dark:bg-gray-800/50 rounded-xl p-5 border border-gray-200 dark:border-gray-700/50'>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <ExternalLink className='w-5 h-5 text-green-600 dark:text-green-500' />
                Job Description
              </h3>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">{description}</p>
            </div>

            {/* Skills */}
            <div className='bg-gray-50 dark:bg-gray-800/50 rounded-xl p-5 border border-gray-200 dark:border-gray-700/50'>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <Sparkles className='w-5 h-5 text-green-600 dark:text-green-500' />
                Required Skills ({skills.length})
              </h3>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill, index) => (
                  <span
                    key={index}
                    className="px-4 py-2 text-sm font-medium bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                  >
                    {skill.trim()}
                  </span>
                ))}
              </div>
            </div>

            {/* Additional Info */}
           
          </div>

          <DialogFooter className="mt-6 flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="flex-1 px-6 py-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-white font-semibold rounded-xl transition-all border border-gray-200 dark:border-gray-700"
            >
              Close
            </button>
            <Link
              href={`/apply/${_id}`}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold rounded-xl transition-all shadow-lg hover:shadow-xl hover:scale-105"
            >
              <Sparkles className='w-5 h-5' />
              Apply Now
            </Link>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(156, 163, 175, 0.4);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(107, 114, 128, 0.6);
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(75, 85, 99, 0.4);
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(107, 114, 128, 0.6);
        }
      `}</style>
    </>
  );
};

export default JobCards;
