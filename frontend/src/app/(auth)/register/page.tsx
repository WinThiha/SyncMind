import RegisterForm from '@/components/auth/RegisterForm';
import { AppLogo } from '@/components/ui/AppLogo';
import Link from 'next/link';

export default function RegisterPage() {
    return (
        <div className="min-h-screen bg-background flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-10">
                <AppLogo size="lg" />
                <p className="text-foreground/40 font-medium mt-3">Create your account to get started.</p>
            </div>

            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <RegisterForm />

                <p className="mt-8 text-center text-sm font-medium text-foreground/40">
                    Already have an account?{' '}
                    <Link href="/login" className="font-bold text-brand-primary hover:text-brand-secondary transition-colors underline decoration-brand-primary/20 underline-offset-4">
                        Log in here
                    </Link>
                </p>
            </div>
        </div>
    );
}
