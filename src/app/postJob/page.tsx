'use client'
import GetBack from '@/Component/subComponents/getBack'
import React, { useState } from 'react'
import { useUser } from '@/context/user';
import { useMutation } from '@tanstack/react-query';
import { createPost } from '@/lib/api';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export interface JobFormData {
  title: string;
  description: string;
  skills: string;
  budget: number;
}

export interface JobPostPayload {
  title: string;
  description: string;
  skills: string[];
  budget: number;
  clientId: string;
  status: string;
}

interface PostResponse {
  message: string;
  data: JobPostPayload;
}

const PostaJob = () => {
  const { user } = useUser();
  const router = useRouter();

  const [formData, setFormData] = useState<JobFormData>({
    title: '',
    description: '',
    skills: '',
    budget: 0
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
      if (name === 'budget') {
        return { ...prev, budget: parseFloat(value) || 0 };
      }
      return { ...prev, [name]: value };
    });
  };

  const mutation = useMutation<PostResponse, Error, JobPostPayload>({
    mutationFn: createPost
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const payload: JobPostPayload = {
        title: formData.title,
        description: formData.description,
        skills: formData.skills.split(',').map(s => s.trim()).filter(Boolean),
        budget: formData.budget,
        clientId: user?._id || '',
        status: 'open',
      };
      const data = await mutation.mutateAsync(payload);
      toast.success(data.message);
      router.push("/");
    } catch (err) {
      setError('An error occurred while posting the job');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- SUCCESS PAGE ---
  if (success) {
    return (
      <div className="w-full max-w-3xl mx-auto p-8 bg-white dark:bg-gray-800 rounded-2xl shadow-xl text-center">
        <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-3">Job Posted Successfully!</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-8">Your job listing is now visible to freelancers.</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => setSuccess(false)}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-all shadow-lg hover:shadow-indigo-500/40 flex-1 max-w-xs"
          >
            Post Another Job
          </button>
          <button
            onClick={() => window.location.href = '/jobs'}
            className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-all flex-1 max-w-xs"
          >
            View Jobs
          </button>
        </div>
      </div>
    );
  }

  // --- FORM DESIGN ---
  return (
    <div className="w-full">
      <GetBack />

      {user?.role === "Client" ? (
        <div className="relative w-full mt-6">
          <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-blue-400/10 to-purple-500/10 dark:from-indigo-900/20 dark:to-purple-900/20 blur-2xl"></div>

          <div className="relative w-full bg-white/70 dark:bg-gray-900/60 backdrop-blur-xl shadow-2xl rounded-2xl p-10 border border-gray-200 dark:border-gray-700">
            <div className="mb-8 text-center">
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 dark:text-white">
                🚀 Post a New Job
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Find the perfect freelancer for your project
              </p>
              <div className="w-24 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 mx-auto mt-4 rounded-full"></div>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 dark:border-red-400 rounded-lg flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500 dark:text-red-400 mr-3" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <p className="text-red-700 dark:text-red-300 font-medium">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Job Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Job Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  placeholder="e.g. Full-Stack Developer Needed for AI Web App"
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 dark:text-white transition-all shadow-sm"
                />
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Job Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows={6}
                  placeholder="Describe your project requirements, deliverables, and skills you expect..."
                  className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 dark:text-white transition-all shadow-sm"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Minimum 100 characters recommended</p>
              </div>

              {/* Skills + Budget */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="skills" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Required Skills <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="skills"
                    name="skills"
                    value={formData.skills}
                    onChange={handleChange}
                    required
                    placeholder="React, Node.js, MongoDB, etc."
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 dark:text-white transition-all shadow-sm"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Separate skills with commas</p>
                </div>

                <div>
                  <label htmlFor="budget" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Budget ($) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-gray-500 dark:text-gray-400">$</span>
                    <input
                      type="number"
                      id="budget"
                      name="budget"
                      value={formData.budget || ''}
                      onChange={handleChange}
                      required
                      min="0"
                      step="0.01"
                      placeholder="500.00"
                      className="w-full pl-7 pr-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 dark:text-white transition-all shadow-sm"
                    />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Enter 0 for negotiable</p>
                </div>
              </div>

              {/* Submit */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full py-3 text-lg font-semibold rounded-xl transition-all shadow-md bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 flex items-center justify-center ${
                    isSubmitting ? 'opacity-80 cursor-not-allowed' : ''
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Posting Job...
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Post Job Now
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : (
        <div className="w-full bg-white dark:bg-gray-800 shadow-xl rounded-2xl p-10 text-center mt-6">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20 mb-5">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Access Restricted</h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6">Only clients can post jobs. If you believe this is an error, please contact support.</p>
          <button
            onClick={() => window.location.href = '/'}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors inline-flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Return to Home
          </button>
        </div>
      )}
    </div>
  );
};

export default PostaJob;
