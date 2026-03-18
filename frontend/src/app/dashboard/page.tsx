'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardPage() {
    const { user, loading, logout } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white text-gray-900">
                Loading...
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white text-gray-900">
                Redirecting...
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900">
            <nav className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <span className="text-xl font-bold text-gray-900">SyncMind Dashboard</span>
                        </div>
                        <div className="flex items-center space-x-4">
                            <span className="text-gray-700">Welcome, {user.name}</span>
                            <button
                                onClick={logout}
                                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 py-6 sm:px-0">
                    <div className="bg-white shadow rounded-lg p-10 border border-gray-100 flex items-center justify-center min-h-[400px]">
                        <div className="text-center">
                            <h2 className="text-3xl font-extrabold text-gray-900 mb-4">
                                Hello, {user.name}!
                            </h2>
                            <p className="text-xl text-gray-600">
                                You are logged in with <span className="font-semibold text-gray-900">{user.email}</span>
                            </p>
                            
                            {!user.email_verified_at ? (
                                <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-md">
                                    <p className="text-amber-700 font-medium">
                                        Your email is not verified. Please check your inbox for a verification link.
                                    </p>
                                </div>
                            ) : (
                                <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded-md">
                                    <p className="text-green-700 font-medium">
                                        ✓ Your account is verified and fully active.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
