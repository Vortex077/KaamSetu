'use client';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { LogOut } from 'lucide-react';
import { clearToken, getUser } from '../lib/auth';

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setUser(getUser());
  }, [pathname]);

  if (!mounted) return null;

  const handleLogout = () => {
    clearToken();
    setUser(null);
    router.push('/auth/login');
  };

  // Hide Navbar completely on auth pages for a cleaner look
  const isAuthPage = pathname.startsWith('/auth');
  if (isAuthPage) return null;

  return (
    <nav className="bg-slate-900 border-b border-white/10 text-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link href="/" className="flex items-center gap-2">
             <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-orange-500">
               <path d="M22 20V8h-2L6.42 13.78A2 2 0 0 1 5 14H2v6h2v-4h4v4h2v-4h6v4h2v-4h4v4Z"/>
               <path d="M10 16v-4"/>
               <path d="M14 16v-4"/>
             </svg>
             <span className="text-xl font-extrabold tracking-tight font-outfit">
               <span className="text-orange-500">Kaam</span>Setu
             </span>
          </Link>

          <div className="flex items-center gap-1 sm:gap-4 md:gap-6 overflow-x-auto no-scrollbar">
            {!user ? (
              <>
                <Link href="/auth/login" className="text-sm font-medium text-slate-300 hover:text-white transition whitespace-nowrap">Login</Link>
                <Link href="/auth/register" className="text-sm font-medium bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white px-4 py-2 rounded-lg transition shadow-md shadow-orange-500/20 whitespace-nowrap">Register</Link>
              </>
            ) : (
              <>
                {user.role === 'worker' && user.workerSegment === 'daily_gig' && (
                  <>
                    <Link href="/worker/profile" className="text-sm font-medium text-slate-300 hover:text-orange-400 transition whitespace-nowrap">Profile</Link>
                    <Link href="/worker/applications" className="text-sm font-medium text-slate-300 hover:text-orange-400 transition whitespace-nowrap">My Gigs</Link>
                  </>
                )}
                {user.role === 'worker' && user.workerSegment !== 'daily_gig' && (
                  <>
                    <Link href="/worker/profile" className="text-sm font-medium text-slate-300 hover:text-orange-400 transition whitespace-nowrap hidden sm:block">Profile</Link>
                    <Link href="/worker/jobs" className="text-sm font-medium text-slate-300 hover:text-orange-400 transition whitespace-nowrap">Browse Jobs</Link>
                    <Link href="/worker/applications" className="text-sm font-medium text-slate-300 hover:text-orange-400 transition whitespace-nowrap">Applications</Link>
                  </>
                )}
                {user.role === 'hirer' && (
                  <>
                    <Link href="/hirer/post" className="text-sm font-medium text-slate-300 hover:text-orange-400 transition whitespace-nowrap">Post a Job</Link>
                    <Link href="/hirer/manage" className="text-sm font-medium text-slate-300 hover:text-orange-400 transition whitespace-nowrap">Manage Gigs</Link>
                    <Link href="/hirer/applications" className="text-sm font-medium text-slate-300 hover:text-orange-400 transition whitespace-nowrap hidden sm:block">Applications</Link>
                  </>
                )}
                <button onClick={handleLogout} className="flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-red-400 transition ml-2 sm:ml-4 whitespace-nowrap">
                  <LogOut size={16} /> <span className="hidden md:inline">Logout</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
