import { Loader } from 'lucide-react';

export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="flex flex-col items-center gap-6 p-8">
        {/* Animated Spinner */}
        <div className="relative w-20 h-20">
          <div className="absolute inset-0 rounded-full border-4 border-gray-200"></div>
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary-500 border-r-primary-500 animate-spin"></div>
          
          {/* Center Icon */}
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader className="w-10 h-10 text-primary-600 animate-pulse" />
          </div>
        </div>

        {/* Loading Text */}
        <div className="text-center">
          <p className="text-xl font-bold text-gray-900">Loading...</p>
          <p className="text-sm text-gray-600 mt-2">Please wait a moment</p>
        </div>

        {/* Progress Indicator */}
        <div className="w-48 h-1 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-primary-400 to-primary-600 rounded-full animate-pulse" style={{ width: '65%' }}></div>
        </div>
      </div>
    </div>
  );
}
