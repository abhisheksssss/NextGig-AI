"use client";

import { X, TrendingUp, Sparkles, ChevronRight, Brain } from "lucide-react";

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectFilter: (filter: 'trending' | 'recommended' | null) => void;
}

export default function FilterModal({ isOpen, onClose, onSelectFilter }: FilterModalProps) {
  if (!isOpen) return null;

  return (
    <div className="absolute top-full left-0 right-0 mt-2 z-50 animate-slideDown">
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Filter Jobs</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>
           

        {/* Filter Options */}
        <div className="p-4 space-y-3">
          {/* Trending Jobs */}

 <button
  onClick={() => {
    onSelectFilter(null);
    onClose();
  }}
  className="w-full group relative overflow-hidden rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-5 hover:border-gray-400 dark:hover:border-gray-600 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
>
  <div className="flex items-center gap-4">
      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shadow-lg">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
    <div className="flex-1 text-left">
      <h4 className="font-bold text-gray-900 dark:text-white">
        Recomaded Jobs
      </h4>
      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
        Based on you profile 
      </p>
    </div>
    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300 group-hover:translate-x-1 transition-all" />
  </div>
</button>



          <button
            onClick={() => {
              onSelectFilter('trending');
              onClose();
            }}
            className="w-full group relative overflow-hidden rounded-xl border-2 border-orange-200 dark:border-orange-900/30 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20 p-5 hover:border-orange-400 dark:hover:border-orange-600 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-lg">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 text-left">
                <h4 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  Trending Jobs
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Most popular jobs with high engagement
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-orange-600 group-hover:translate-x-1 transition-all" />
            </div>
          </button>

          {/* Recommended Jobs */}
          <button
            onClick={() => {
              onSelectFilter('recommended');
              onClose();
            }}
            className="w-full group relative overflow-hidden rounded-xl border-2 border-blue-200 dark:border-blue-900/30 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 p-5 hover:border-blue-400 dark:hover:border-blue-600 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
          >
            <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shadow-lg">
  <Brain className="w-6 h-6 text-white" />
</div>
              <div className="flex-1 text-left">
                <h4 className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  For You
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Personalized based on your activity
                </p>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
            </div>
          </button>

          {/* All Jobs */}
    
        </div>
      </div>
    </div>
  );
}
