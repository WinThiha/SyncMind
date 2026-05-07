import LoginForm from '@/components/auth/LoginForm';
import { AppLogo } from '@/components/ui/AppLogo';
import Link from 'next/link';

export default function LoginPage() {
    return (
        <div className="min-h-screen bg-background flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-10">
                <AppLogo size="lg" />
                <p className="text-foreground/40 font-medium mt-3">Welcome back! Please enter your details.</p>
            </div>

            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <LoginForm />

                <p className="mt-8 text-center text-sm font-medium text-foreground/40">
                    Don&apos;t have an account?{' '}
                    <Link href="/register" className="font-bold text-brand-primary hover:text-brand-secondary transition-colors underline decoration-brand-primary/20 underline-offset-4">
                        Register here
                    </Link>
                </p>
            </div>
        </div>
    );
}
