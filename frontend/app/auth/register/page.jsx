'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { register } from '../../../lib/api';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const [role, setRole] = useState('worker');
  const [form, setForm] = useState({ name: '', phone: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      return setError('Passwords do not match');
    }
    if (form.password.length < 6) {
      return setError('Password must be at least 6 characters');
    }

    setLoading(true);
    try {
      const { data } = await register({ ...form, role });
      localStorage.setItem('kaamsetu_token', data.token);
      localStorage.setItem('kaamsetu_user', JSON.stringify(data.user));
      router.push(role === 'hirer' ? '/hirer/post' : '/worker/profile');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-amber-50 px-4 py-8">
      {/* Decorative elements */}
      <div className="absolute top-10 right-20 w-72 h-72 bg-orange-200 rounded-full mix-blend-multiply filter blur-3xl opacity-25" />
      <div className="absolute bottom-10 left-20 w-72 h-72 bg-amber-200 rounded-full mix-blend-multiply filter blur-3xl opacity-25" />

      <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl shadow-orange-500/10 p-8 sm:p-10 w-full max-w-md border border-white/50">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="text-3xl font-extrabold">
            <span className="text-orange-600">Kaam</span><span className="text-gray-800">Setu</span>
          </Link>
          <p className="text-gray-500 mt-2">Create your account to get started</p>
        </div>

        {/* Role Toggle */}
        <div className="flex bg-gray-100 rounded-2xl p-1.5 mb-8">
          {[
            { key: 'worker', label: '👷 Worker', sublabel: 'Find work near you' },
            { key: 'hirer', label: '🏢 Hirer', sublabel: 'Find workers' },
          ].map((r) => (
            <button key={r.key} onClick={() => setRole(r.key)}
              className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
                role === r.key
                  ? 'bg-gradient-to-r from-orange-600 to-amber-500 text-white shadow-lg shadow-orange-500/25'
                  : 'text-gray-500 hover:text-gray-700'
              }`}>
              <div>{r.label}</div>
              <div className={`text-[10px] mt-0.5 ${role === r.key ? 'text-orange-100' : 'text-gray-400'}`}>{r.sublabel}</div>
            </button>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">Full Name</label>
            <input type="text" placeholder="Enter your name" required value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-4 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all bg-gray-50/50 hover:bg-white" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">Phone Number</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">+91</span>
              <input type="tel" placeholder="9876543210" required value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all bg-gray-50/50 hover:bg-white" />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">Email <span className="text-gray-400">(optional)</span></label>
            <input type="email" placeholder="you@example.com" value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full px-4 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all bg-gray-50/50 hover:bg-white" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">Password</label>
              <input type="password" placeholder="Min 6 chars" required value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full px-4 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all bg-gray-50/50 hover:bg-white" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 mb-1.5 block">Confirm</label>
              <input type="password" placeholder="Repeat" required value={form.confirmPassword}
                onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                className="w-full px-4 py-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all bg-gray-50/50 hover:bg-white" />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl border border-red-100 flex items-center gap-2">
              <span>⚠️</span> {error}
            </div>
          )}

          <button type="submit" disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-orange-600 to-amber-500 text-white rounded-xl font-semibold text-lg shadow-lg shadow-orange-500/25 hover:shadow-xl hover:shadow-orange-500/40 transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0">
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                Creating account...
              </span>
            ) : `Register as ${role === 'worker' ? 'Worker' : 'Hirer'}`}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-orange-600 font-semibold hover:text-orange-700 transition-colors">Sign in →</Link>
        </p>
      </div>
    </div>
  );
}
