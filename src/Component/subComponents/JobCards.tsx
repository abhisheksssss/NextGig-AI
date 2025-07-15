"use client"
import React, { useState } from 'react'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import Link from 'next/link';

type JobCardProps = {
  _id:string;
  clientId: string;
  createdAt: string;
  description: string;
  skills: string[];
  title: string;
  status: boolean;
};

const JobCards: React.FC<JobCardProps> = ({ _id,createdAt, description, skills, title, status }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className='bg-background relative hover:bg-accent/10 transition-all duration-300 rounded-xl p-6 shadow-lg dark:shadow-white dark:shadow-sm border border-accent/20 space-y-4'>
        {/* Header Section */}
        <div className='space-y-2'>
          <div className='flex justify-between items-start'>
            <h2 className='text-xl font-semibold text-foreground line-clamp-2'>
              {title}
            </h2>
            <span className='text-xs text-muted-foreground whitespace-nowrap ml-4'>
              Posted At {new Date(createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Description Section */}
        <div className='space-y-3'>
          <p className='text-sm text-foreground/80 line-clamp-3'>
            {description}
          </p>
        </div>

        {/* Skills Section */}
        <div className='pt-4 border-t border-accent/10'>
          <div className='flex flex-wrap gap-2'>
            {skills.slice(0, 7).map((skill, index) => (
              <span
                key={index}
                className='px-3 py-1 text-xs font-medium bg-accent text-foreground rounded-full'
              >
                {skill.trim()}
              </span>
            ))}
          </div>
        </div>

        {/* Footer Section */}
        <div className='pt-4 flex justify-between items-center'>
          {status === true ? (
            <div className='flex items-center space-x-2'>
              <span className='inline-block h-2 w-2 bg-green-500 rounded-full'></span>
              <span className='text-sm text-muted-foreground'>Active</span>
            </div>
          ) : (
            <div className='flex items-center space-x-2'>
              <span className='inline-block h-2 w-2 bg-red-500 rounded-full'></span>
              <span className='text-sm text-muted-foreground'>Not Active</span>
            </div>
          )}
          <button 
            onClick={() => setIsModalOpen(true)}
            className='px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors'
          >
            View Details
          </button>
        </div>
      </div>

      {/* Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[1000px] rounded-xl mx-5">
          <DialogHeader>
        <DialogTitle className="text-2xl font-semibold">{title}</DialogTitle>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
          <span>Posted on {new Date(createdAt).toLocaleDateString()}</span>
          {status ? (
            <span className="flex items-center gap-1">
          <span className="h-2 w-2 bg-green-500 rounded-full inline-block"></span>
          Active
            </span>
          ) : (
            <span className="flex items-center gap-1">
          <span className="h-2 w-2 bg-red-500 rounded-full inline-block"></span>
          Not Active
            </span>
          )}
        </div>
          </DialogHeader>

          <div className="mt-4 space-y-4 sm:h-full  max-h-[400px] overflow-y-auto">
        <div>
          <h3 className="text-lg font-semibold mb-1">Description</h3>
          <p className="text-foreground/80">{description}</p>
        </div>
        <div>
          <h3 className="text-lg font-semibold mb-1">Required Skills</h3>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill, index) => (
          <span
            key={index}
            className="px-3 py-1 text-sm font-medium bg-accent text-foreground rounded-full"
          >
            {skill.trim()}
          </span>
            ))}
          </div>
        </div>
          </div>

          <DialogFooter className="mt-6 flex gap-2">
        <button
          type="button"
          onClick={() => setIsModalOpen(false)}
          className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
        >
          Close
        </button>
        <button
          type="button"
          onClick={() => {
            // Add your apply logic here
            console.log('Applied for job:', title);
          }}
          className="px-4 py-2 text-sm font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
      <Link href={`/apply/${_id}`}>
      Apply Now
      </Link>    
        </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default JobCards;