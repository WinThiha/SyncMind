import LoginForm from '@/components/auth/LoginForm';
import Link from 'next/link';

export default function LoginPage() {
    return (
        <div className="min-h-screen bg-background flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
                <div className="w-16 h-16 bg-brand-primary rounded-2xl flex items-center justify-center text-white font-bold text-2xl mx-auto mb-6 shadow-lg shadow-brand-primary/20">
                  S
                </div>
                <h1 className="text-4xl font-black tracking-tight text-foreground mb-2">SyncMind</h1>
                <p className="text-foreground/40 font-medium">Welcome back! Please enter your details.</p>
            </div>

            <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-md">
                <LoginForm />
                
                <p className="mt-8 text-center text-sm font-medium text-foreground/40">
                    Don't have an account?{' '}
                    <Link href="/register" className="font-bold text-brand-primary hover:text-brand-secondary transition-colors underline decoration-brand-primary/20 underline-offset-4">
                        Register here
                    </Link>
                </p>
            </div>
        </div>
    );
}
