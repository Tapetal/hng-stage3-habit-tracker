import Link from 'next/link';
import LoginForm from '@/components/auth/LoginForm';

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <span className="text-4xl">🎯</span>
          <h1 className="mt-3 text-2xl font-bold text-slate-800">Welcome back</h1>
          <p className="mt-1 text-sm text-slate-500">Sign in to your account</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <LoginForm />
        </div>

        <p className="text-center text-sm text-slate-500 mt-5">
          Don&rsquo;t have an account?{' '}
          <Link href="/signup" className="text-brand-600 hover:text-brand-700 font-medium focus:outline-none focus:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
