'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white text-gray-900">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 text-gray-900">
      <div className="max-w-md w-full space-y-8 text-center bg-white p-10 shadow rounded-lg border border-gray-100">
        <div>
          <h1 className="text-4xl font-extrabold text-indigo-600 mb-2">SyncMind</h1>
          <h2 className="text-2xl font-bold text-gray-900">
            Welcome to SyncMind
          </h2>
          <p className="mt-4 text-gray-600 text-lg">
            Synchronize your mind with your tasks. The ultimate tool for mental clarity and productivity.
          </p>
        </div>

        {user ? (
          <div className="flex flex-col space-y-4 mt-8">
            <p className="text-gray-700">You are logged in as <span className="font-semibold">{user.name}</span></p>
            <Link
              href="/dashboard"
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
            >
              Go to Dashboard
            </Link>
          </div>
        ) : (
          <div className="flex flex-col space-y-4 mt-8">
            <Link
              href="/login"
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="w-full flex justify-center py-3 px-4 border border-indigo-600 rounded-md shadow-sm text-sm font-medium text-indigo-600 bg-white hover:bg-indigo-50 transition-colors"
            >
              Create an Account
            </Link>
          </div>
        )}
        
        <div className="pt-6 border-t border-gray-100 text-sm text-gray-500">
          Built for modern workflows.
        </div>
      </div>
    </div>
  );
}
