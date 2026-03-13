'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { login } from '../../../lib/api';
import { saveToken } from '../../../lib/auth';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '', role: 'worker' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await login(form);
      saveToken(data.token);
      localStorage.setItem('kaamsetu_user', JSON.stringify(data.user));
      toast.success('Welcome back!');
      
      const user = data.user;
      if (user.role === 'hirer') {
        router.push('/hirer/manage');
      } else {
        if (user.workerSegment === 'daily_gig') {
          router.push('/worker/profile');
        } else {
          router.push('/worker/jobs');
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 font-inter">
      <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8 sm:p-10 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="text-3xl font-extrabold font-outfit">
            <span className="text-orange-500">Kaam</span><span className="text-slate-900">Setu</span>
          </Link>
          <p className="text-slate-500 mt-2">Welcome back! Sign in to continue</p>
        </div>

        {/* Role Toggle */}
        <div className="flex bg-slate-100 rounded-2xl p-1.5 mb-8">
          {[
            { key: 'worker', label: '👷 Worker', sublabel: 'Find gigs' },
            { key: 'hirer', label: '🏢 Hirer', sublabel: 'Manage jobs' },
          ].map((r) => (
            <button key={r.key} onClick={() => setForm({ ...form, role: r.key })} type="button"
              className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
                form.role === r.key
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'text-slate-500 hover:text-slate-700'
              }`}>
              <div>{r.label}</div>
              <div className={`text-[10px] mt-0.5 ${form.role === r.key ? 'text-slate-300' : 'text-slate-400'}`}>{r.sublabel}</div>
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-sm font-medium text-slate-700 mb-1.5 block">Email Address</label>
            <div className="relative">
              <input type="email" placeholder="you@example.com" required value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all bg-slate-50 text-slate-900 hover:bg-white" />
            </div>
          </div>
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-sm font-medium text-slate-700 block">Password</label>
            </div>
            <input type="password" placeholder="••••••••" required value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all bg-slate-50 text-slate-900 hover:bg-white" />
          </div>

          <button type="submit" disabled={loading}
            className="w-full py-4 bg-orange-600 hover:bg-orange-500 text-white rounded-xl font-semibold text-lg shadow-lg shadow-orange-500/25 transition-all duration-300 disabled:opacity-50 flex items-center justify-center mt-2">
            {loading ? (
              <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
            ) : 'Sign In'}
          </button>
        </form>

        {form.role === 'worker' && (
          <div className="mt-6 bg-orange-50 border border-orange-100 rounded-lg p-3 text-center text-xs text-orange-800">
            <strong>Daily Wage Workers:</strong> Registration and jobs are handled via our Telegram bot. <a href="https://t.me/kaamsetu_bot" target="_blank" className="font-bold underline ml-1">Open Telegram</a>
          </div>
        )}

        <p className="text-center text-sm text-slate-500 mt-6">
          Don&apos;t have an account?{' '}
          <Link href={`/auth/register?role=${form.role}`} className="text-orange-600 font-semibold hover:text-orange-500 transition-colors">Create one →</Link>
        </p>
      </div>
    </div>
  );
}
