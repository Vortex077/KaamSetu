'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { login } from '../../../lib/api';
import { saveToken } from '../../../lib/auth';
import Link from 'next/link';
import { Loader2, Bot } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../../lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '', role: 'worker' });
  const [loading, setLoading] = useState(false);
  
  // OTP Verification State
  const [showOtp, setShowOtp] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [tempUser, setTempUser] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await login(form);
      const user = data.user;
      
      // If user is web-based but email is NOT verified yet, throw them to the OTP screen!
      if (!user.isEmailVerified && form.role !== 'worker' || (!user.isEmailVerified && form.role === 'worker' && user.workerSegment !== 'daily_gig')) {
         setTempUser(data);
         await api.post('/api/auth/send-otp', { email: user.email, role: form.role, phone: user.phone || 'Pending' });
         setShowOtp(true);
         return toast.success('Please verify your email to continue.');
      }

      // Fully Verified — Let them in.
      saveToken(data.token);
      localStorage.setItem('kaamsetu_user', JSON.stringify(data.user));
      toast.success('Welcome back!');
      
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

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (otpCode.length !== 6) return toast.error('OTP must be 6 digits');

    setVerifying(true);
    try {
       await api.post('/api/auth/verify-otp', {
         email: form.email,
         role: form.role,
         otp: otpCode
       });
       
       saveToken(tempUser.token);
       const verifiedUser = { ...tempUser.user, isEmailVerified: true };
       localStorage.setItem('kaamsetu_user', JSON.stringify(verifiedUser));

       toast.success('Email verified successfully!');
       if (verifiedUser.role === 'hirer') {
          router.push('/hirer/manage');
       } else {
          router.push('/worker/jobs');
       }
       
    } catch (err) {
       toast.error(err.response?.data?.error || 'Invalid OTP');
    } finally {
       setVerifying(false);
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

      {/* OTP Modal Overlay */}
      {showOtp && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in flex-col">
           <form onSubmit={handleVerifyOtp} className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl relative border border-slate-100 animate-in zoom-in-95">
             <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
             </div>
             <h3 className="text-2xl font-black font-outfit text-center text-slate-900 mb-2">Verify Email</h3>
             <p className="text-slate-500 text-sm text-center mb-6 leading-relaxed">
               We sent a 6-digit code to <strong className="text-slate-700">{form.email}</strong>
             </p>
             <input 
               type="text" 
               maxLength={6}
               autoFocus
               value={otpCode}
               onChange={e => setOtpCode(e.target.value.replace(/[^0-9]/g, ''))}
               placeholder="000000"
               className="w-full text-center text-3xl tracking-[0.5em] font-black font-outfit px-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-orange-500 outline-none text-slate-900 mb-6"
             />
             <button disabled={verifying || otpCode.length < 6} type="submit" className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold shadow-md transition disabled:opacity-50 flex items-center justify-center">
                {verifying ? <Loader2 size={20} className="animate-spin" /> : 'VERIFY SECURELY'}
             </button>
           </form>
           
           <p className="mt-6 text-white text-sm font-semibold opacity-80 z-50">Please check your spam folder as well</p>
        </div>
      )}
    </div>
  );
}
