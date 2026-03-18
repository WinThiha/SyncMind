'use client';

import { useState, useEffect, Suspense } from 'react';
import api from '@/lib/axios';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import GoogleLoginButton from './GoogleLoginButton';

function RegisterFormContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { refreshUser } = useAuth();
    
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [errors, setErrors] = useState<Record<string, string[]>>({});
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    
    // Social registration state
    const [isSocial, setIsSocial] = useState(false);
    const [socialProvider, setSocialProvider] = useState('');
    const [socialId, setSocialId] = useState('');

    useEffect(() => {
        const socialEmail = searchParams.get('social_email');
        const socialName = searchParams.get('social_name');
        const provider = searchParams.get('social_provider');
        const id = searchParams.get('social_id');

        if (socialEmail) {
            setEmail(socialEmail);
            setName(socialName || '');
            setSocialProvider(provider || '');
            setSocialId(id || '');
            setIsSocial(true);
        }
    }, [searchParams]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrors({});
        setMessage('');

        try {
            await api.get('/sanctum/csrf-cookie');

            const payload: any = {
                name,
                email,
                password,
                password_confirmation: passwordConfirmation,
            };

            if (isSocial) {
                payload.social_provider = socialProvider;
                payload.social_id = socialId;
            }

            const response = await api.post('/api/auth/register', payload);

            await refreshUser();
            setMessage(response.data.message);
            router.push('/dashboard');

        } catch (error: any) {
            if (error.response?.status === 422) {
                setErrors(error.response.data.errors);
            } else {
                setMessage('An unexpected error occurred. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 max-w-md mx-auto p-6 bg-white shadow rounded-lg">
            <h2 className="text-2xl font-bold text-center text-gray-900">
                {isSocial ? 'Complete Your Registration' : 'Register Account'}
            </h2>

            {!isSocial && (
                <>
                    <GoogleLoginButton />
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white text-gray-500">Or continue with email</span>
                        </div>
                    </div>
                </>
            )}

            {isSocial && (
                <div className="p-3 bg-indigo-50 text-indigo-700 rounded text-sm">
                    You're almost there! We've pulled your details from Google. Just set a password to finish.
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                {message && (
                    <div className={`p-3 rounded ${message.includes('error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                        {message}
                    </div>
                )}

                <div>
                    <label className="block text-sm font-medium text-gray-700">Full Name</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 border p-2 text-gray-900"
                    />
                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name[0]}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Email Address</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        readOnly={isSocial}
                        disabled={isSocial}
                        required
                        className={`mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 text-gray-900 ${isSocial ? 'bg-gray-100 cursor-not-allowed' : 'focus:border-indigo-500 focus:ring-indigo-500'}`}
                    />
                    {isSocial && <p className="text-xs text-gray-500 mt-1">Email cannot be changed for social registration.</p>}
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email[0]}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 border p-2 text-gray-900"
                    />
                    {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password[0]}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
                    <input
                        type="password"
                        value={passwordConfirmation}
                        onChange={(e) => setPasswordConfirmation(e.target.value)}
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 border p-2 text-gray-900"
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400"
                >
                    {loading ? 'Processing...' : (isSocial ? 'Complete Registration' : 'Register')}
                </button>
                
                {isSocial && (
                    <button
                        type="button"
                        onClick={() => router.push('/register')}
                        className="w-full text-center text-sm text-gray-600 hover:text-gray-900 mt-2"
                    >
                        Cancel and use different email
                    </button>
                )}
            </form>
        </div>
    );
}

export default function RegisterForm() {
    return (
        <Suspense fallback={<div className="text-center p-6 bg-white shadow rounded-lg">Loading form...</div>}>
            <RegisterFormContent />
        </Suspense>
    );
}
