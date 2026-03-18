'use client';

import { useGoogleLogin } from '@react-oauth/google';
import api from '@/lib/axios';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function GoogleLoginButton() {
    const { refreshUser } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const login = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            setLoading(true);
            setError('');
            try {
                await api.get('/sanctum/csrf-cookie');

                const response = await api.post('/api/auth/google/callback', {
                    token: tokenResponse.access_token,
                });

                await refreshUser();
                router.push('/dashboard');
            } catch (err: any) {
                if (err.response?.status === 404) {
                    // User not found - redirect to register with social data
                    const socialUser = err.response.data.social_user;
                    const params = new URLSearchParams({
                        social_email: socialUser.email,
                        social_name: socialUser.name,
                        social_id: socialUser.provider_id,
                        social_provider: socialUser.provider_name,
                    });
                    router.push(`/register?${params.toString()}`);
                } else {
                    console.error('Google login failed:', err);
                    setError(err.response?.data?.message || 'Google login failed. Please try again.');
                }
            } finally {
                setLoading(false);
            }
        },
        onError: (errorResponse) => {
            console.error('Google Login Error:', errorResponse);
            setError('Google Login failed. Please try again.');
        },
    });

    return (
        <div className="w-full">
            <button
                type="button"
                onClick={() => login()}
                disabled={loading}
                className="w-full flex items-center justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-100 transition-colors"
            >
                {loading ? (
                    'Connecting...'
                ) : (
                    <>
                        <svg className="w-5 h-5 mr-2" viewBox="0 0 48 48">
                            <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z" />
                            <path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z" />
                            <path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z" />
                            <path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z" />
                        </svg>
                        Continue with Google
                    </>
                )}
            </button>
            {error && <p className="mt-2 text-xs text-red-600 text-center">{error}</p>}
        </div>
    );
}
