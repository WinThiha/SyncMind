'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import api from '@/lib/axios';
import { useAuth } from '@/context/AuthContext';

function VerifyEmailContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { refreshUser } = useAuth();
    const verifyUrl = searchParams.get('verify_url');
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('Verifying your email...');

    useEffect(() => {
        if (!verifyUrl) {
            setStatus('error');
            setMessage('Invalid verification link.');
            return;
        }

        const verify = async () => {
            try {
                const response = await api.get(verifyUrl);
                
                // Refresh user state to reflect verified status
                await refreshUser();
                
                setStatus('success');
                setMessage(response.data.message || 'Email verified successfully!');
                
                // Redirect to dashboard after success
                setTimeout(() => {
                    router.push('/dashboard');
                }, 3000);
            } catch (error: any) {
                setStatus('error');
                setMessage(error.response?.data?.message || 'Email verification failed. The link may have expired.');
            }
        };

        verify();
    }, [verifyUrl, router, refreshUser]);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 text-center">
                    <h2 className="text-2xl font-bold mb-4 text-gray-900">Email Verification</h2>
                    
                    <div className={`p-4 rounded-md ${
                        status === 'loading' ? 'bg-blue-50 text-blue-700' :
                        status === 'success' ? 'bg-green-50 text-green-700' :
                        'bg-red-50 text-red-700'
                    }`}>
                        {message}
                    </div>

                    {status === 'success' && (
                        <p className="mt-4 text-sm text-gray-600">
                            Redirecting you to dashboard...
                        </p>
                    )}

                    {status === 'error' && (
                        <div className="mt-6 flex flex-col space-y-4">
                            <button
                                onClick={() => router.push('/dashboard')}
                                className="inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                            >
                                Go to Dashboard
                            </button>
                            <button
                                onClick={() => router.push('/')}
                                className="text-sm text-indigo-600 hover:text-indigo-500"
                            >
                                Back to Home
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function VerifyEmailPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 text-center text-gray-500">Loading...</div>}>
            <VerifyEmailContent />
        </Suspense>
    );
}
