'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { register } from '../../../lib/api';
import { saveToken } from '../../../lib/auth';
import Link from 'next/link';
import { Bot, MapPin, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../../lib/api';

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center font-inter text-slate-500">Loading form...</div>}>
      <RegisterContent />
    </Suspense>
  );
}

function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const initialRole = searchParams.get('role') === 'worker' ? 'worker' : 'hirer';
  const initialSegment = searchParams.get('segment') || 'part_time';

  const [role, setRole] = useState(initialRole);
  const [segment, setSegment] = useState(initialSegment);
  const [form, setForm] = useState({ 
    name: '', phone: '', email: '', password: '', confirmPassword: '',
    businessName: '', businessType: 'shop'
  });
  const [loading, setLoading] = useState(false);
  
  // OTP Flow State
  const [showOtp, setShowOtp] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [tempUser, setTempUser] = useState(null);
  const [verifying, setVerifying] = useState(false);

  // Sync role from URL
  useEffect(() => {
    if (searchParams.get('role')) setRole(searchParams.get('role'));
    if (searchParams.get('segment')) setSegment(searchParams.get('segment'));
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      return toast.error('Passwords do not match');
    }
    if (form.password.length < 6) {
      return toast.error('Password must be at least 6 characters');
    }

    setLoading(true);
    try {
      const payload = { ...form, role };
      if (role === 'worker') {
        payload.workerSegment = segment;
      }
      
      const { data } = await register(payload);
      
      // Save temp user context
      setTempUser(data);
      
      // If daily worker, no OTP needed as they use Telegram
      if (role === 'worker' && segment === 'daily_gig') {
         saveToken(data.token);
         localStorage.setItem('kaamsetu_user', JSON.stringify(data.user));
         toast.success('Registration successful! Please use Telegram now.');
         return router.push('/worker/profile');
      }

      // Automatically trigger OTP send
      await api.post('/api/auth/send-otp', { email: form.email, role, phone: form.phone || 'Pending' });
      setShowOtp(true);
      toast.success('Check your email for the verification code!');

    } catch (err) {
      toast.error(err.response?.data?.error || 'Registration failed');
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
         role,
         otp: otpCode
       });
       
       // Verification passed!
       saveToken(tempUser.token);
       const verifiedUser = { ...tempUser.user, isEmailVerified: true };
       localStorage.setItem('kaamsetu_user', JSON.stringify(verifiedUser));

       toast.success('Email verified successfully!');
       router.push(role === 'hirer' ? '/hirer/post' : '/worker/profile');
       
    } catch (err) {
       toast.error(err.response?.data?.error || 'Invalid OTP');
    } finally {
       setVerifying(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-12 font-inter">
      <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8 sm:p-10 w-full max-w-lg">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="text-3xl font-extrabold font-outfit">
            <span className="text-orange-500">Kaam</span><span className="text-slate-900">Setu</span>
          </Link>
          <p className="text-slate-500 mt-2">Create your account to get started</p>
        </div>

        {/* Role Toggle */}
        <div className="flex bg-slate-100 rounded-2xl p-1.5 mb-8">
          {[
            { key: 'worker', label: '👷 Worker', sublabel: 'Find work' },
            { key: 'hirer', label: '🏢 Hirer', sublabel: 'Post jobs' },
          ].map((r) => (
            <button key={r.key} onClick={() => setRole(r.key)} type="button"
              className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all duration-300 ${
                role === r.key
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'text-slate-500 hover:text-slate-700'
              }`}>
              <div>{r.label}</div>
              <div className={`text-[10px] mt-0.5 ${role === r.key ? 'text-slate-300' : 'text-slate-400'}`}>{r.sublabel}</div>
            </button>
          ))}
        </div>

        {/* Worker Segment Selector */}
        {role === 'worker' && (
          <div className="mb-8 space-y-3">
            <label className="text-sm font-semibold text-slate-700 block">What type of work are you looking for?</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { id: 'daily_gig', label: 'Daily Wage' },
                { id: 'part_time', label: 'Part-Time' },
                { id: 'full_time', label: 'Full-Time' }
              ].map(seg => (
                <button
                  key={seg.id}
                  type="button"
                  onClick={() => setSegment(seg.id)}
                  className={`py-2 px-3 rounded-lg border-2 text-sm font-medium transition ${
                    segment === seg.id ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  {seg.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* TELEGRAM REDIRECT FOR DAILY WAGE */}
        {role === 'worker' && segment === 'daily_gig' ? (
          <div className="bg-orange-50 border border-orange-200 rounded-2xl p-6 text-center">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 text-orange-500 shadow-sm border border-orange-100">
              <Bot size={32} />
            </div>
            <h3 className="text-xl font-bold font-outfit text-slate-900 mb-2">Use our Telegram Bot</h3>
            <p className="text-slate-600 mb-6 text-sm leading-relaxed">
              We made it incredibly easy for daily wage workers. No passwords to remember, no forms to fill. Just call our voice bot and speak in Hindi!
            </p>
            <a 
              href="https://t.me/kaamsetu_bot" 
              target="_blank" 
              rel="noreferrer"
              className="w-full inline-block py-4 rounded-xl bg-[#3390EC] hover:bg-[#2A82DA] text-white font-semibold shadow-md transition"
            >
              Open Telegram Bot
            </a>
          </div>
        ) : (
          /* STANDARD REGISTRATION FORM */
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {role === 'hirer' && (
              <>
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1.5 block">Business Name</label>
                  <input type="text" placeholder="e.g. Sharma Electronics" required value={form.businessName}
                    onChange={(e) => setForm({ ...form, businessName: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all bg-slate-50 text-slate-900 hover:bg-white" />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700 mb-1.5 block">Business Type</label>
                  <select 
                    value={form.businessType} 
                    onChange={(e) => setForm({ ...form, businessType: e.target.value })}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all bg-slate-50 text-slate-900 hover:bg-white"
                  >
                    <option value="shop">Local Shop</option>
                    <option value="restaurant">Restaurant / Cafe</option>
                    <option value="household">Household</option>
                    <option value="factory">Factory / Warehouse</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </>
            )}

            <div>
              <label className="text-sm font-medium text-slate-700 mb-1.5 block">Full Name</label>
              <input type="text" placeholder="Enter your name" required value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all bg-slate-50 text-slate-900 hover:bg-white" />
            </div>
            
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1.5 block">Email Address</label>
              <input type="email" placeholder="you@example.com" required value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all bg-slate-50 text-slate-900 hover:bg-white" />
            </div>
            
            <div>
              <label className="text-sm font-medium text-slate-700 mb-1.5 block">Phone Number <span className="text-slate-400 font-normal">(optional)</span></label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">+91</span>
                <input type="tel" placeholder="9876543210" value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all bg-slate-50 text-slate-900 hover:bg-white" />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1.5 block">Password</label>
                <input type="password" placeholder="Min 6 chars" required value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all bg-slate-50 text-slate-900 hover:bg-white" />
              </div>
              <div>
                <label className="text-sm font-medium text-slate-700 mb-1.5 block">Confirm</label>
                <input type="password" placeholder="Repeat" required value={form.confirmPassword}
                  onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all bg-slate-50 text-slate-900 hover:bg-white" />
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-4 mt-4 bg-orange-600 hover:bg-orange-500 text-white rounded-xl font-semibold text-lg shadow-lg shadow-orange-500/25 transition-all duration-300 disabled:opacity-50 flex items-center justify-center">
              {loading ? (
                <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
              ) : `Register as ${role === 'worker' ? 'Worker' : 'Hirer'}`}
            </button>
          </form>
        )}

        <p className="text-center text-sm text-slate-500 mt-8">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-orange-600 font-semibold hover:text-orange-500 transition-colors">Sign in →</Link>
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
