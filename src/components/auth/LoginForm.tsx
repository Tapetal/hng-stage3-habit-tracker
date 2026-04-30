'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { logIn } from '@/lib/auth';

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState<string | null>(null);
  const [loading, setLoading]   = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const result = logIn(email.trim(), password);

    if (result.success) {
      router.replace('/dashboard');
    } else {
      setError(result.error);
    }
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      {error && (
        <div
          role="alert"
          className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3"
        >
          {error}
        </div>
      )}

      <div>
        <label
          htmlFor="auth-login-email"
          className="block text-sm font-medium text-slate-700 mb-1.5"
        >
          Email address
        </label>
        <input
          id="auth-login-email"
          data-testid="auth-login-email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          placeholder="you@example.com"
        />
      </div>

      <div>
        <label
          htmlFor="auth-login-password"
          className="block text-sm font-medium text-slate-700 mb-1.5"
        >
          Password
        </label>
        <input
          id="auth-login-password"
          data-testid="auth-login-password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={e => setPassword(e.target.value)}
          className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
          placeholder="••••••••"
        />
      </div>

      <button
        type="submit"
        data-testid="auth-login-submit"
        disabled={loading}
        className="w-full bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white font-semibold py-2.5 px-4 rounded-lg text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2"
      >
        {loading ? 'Signing in…' : 'Sign in'}
      </button>
    </form>
  );
}
