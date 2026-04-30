import Link from 'next/link';
import SignupForm from '@/components/auth/SignupForm';

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <span className="text-4xl">🎯</span>
          <h1 className="mt-3 text-2xl font-bold text-slate-800">Create account</h1>
          <p className="mt-1 text-sm text-slate-500">Start tracking your habits today</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <SignupForm />
        </div>

        <p className="text-center text-sm text-slate-500 mt-5">
          Already have an account?{' '}
          <Link href="/login" className="text-brand-600 hover:text-brand-700 font-medium focus:outline-none focus:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
