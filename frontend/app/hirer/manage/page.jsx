'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, PlusCircle, BellRing, MapPin } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import api from '../../../lib/api';
import { subscribeToPush } from '../../../lib/pushNotifications';
import GigStatusTracker from '../../../components/GigStatusTracker';

export default function ManageGigsPage() {
  const [gigs, setGigs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Polling every 15s to check gig status changes (Escrow -> Accepted)
  useEffect(() => {
    fetchMyGigs();
    const interval = setInterval(fetchMyGigs, 15000);
    return () => clearInterval(interval);
  }, []);

  const fetchMyGigs = async () => {
    try {
      const { data } = await api.get('/api/gigs/my-gigs');
      setGigs(data.data);
    } catch(err) {
      toast.error('Failed to load gigs');
    } finally {
      setLoading(false);
    }
  };

  const enablePush = async () => {
    try {
      await subscribeToPush();
      toast.success('Push notifications enabled!');
    } catch(err) {
      toast.error('Could not enable push');
    }
  };

  const handleComplete = async (gigId) => {
    try {
       await api.post(`/api/gigs/${gigId}/complete`);
       toast.success('Gig marked as completed. Payment released to worker!');
       fetchMyGigs();
    } catch(err) {
       toast.error(err.response?.data?.error || 'Failed to complete gig');
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><Loader2 className="animate-spin text-orange-500" size={48}/></div>;

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 font-inter">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold font-outfit text-slate-900">Manage Postings</h1>
            <p className="text-slate-600 mt-1 font-medium">Track escrows, payments, and worker status in real-time.</p>
          </div>
          <div className="flex gap-3">
             <button onClick={enablePush} className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl flex items-center gap-2 transition text-sm">
                <BellRing size={16}/> Enable Alerts
             </button>
             <Link href="/hirer/post" className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl flex items-center gap-2 transition shadow-md shadow-orange-500/20 text-sm">
                <PlusCircle size={16}/> New Gig
             </Link>
          </div>
        </div>

        {gigs.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-slate-200">
            <h3 className="text-xl font-bold font-outfit text-slate-900 mb-2">No active jobs</h3>
            <p className="text-slate-500 mb-6 font-medium">You haven't posted any jobs yet. Our AI will help you draft one.</p>
            <Link href="/hirer/post" className="inline-flex py-3 px-6 bg-slate-900 hover:bg-slate-800 transition text-white font-bold rounded-xl shadow-md">Create your first gig</Link>
          </div>
        ) : (
          <div className="space-y-6">
            {gigs.map(gig => (
              <div key={gig._id} className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm overflow-hidden">
                 <div className="flex justify-between items-start mb-6">
                   <div>
                     <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-widest rounded-md border ${
                          gig.status === 'open' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                          gig.status === 'completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                          gig.status === 'cancelled' ? 'bg-red-50 text-red-700 border-red-200' :
                          'bg-orange-50 text-orange-700 border-orange-200'
                        }`}>
                          {gig.status.replace('_', ' ')}
                        </span>
                        {gig.hireType && <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest border border-slate-200 px-2.5 py-1 rounded-md">{gig.hireType.replace('_', ' ')}</span>}
                     </div>
                     <h3 className="text-xl font-bold font-outfit text-slate-900">{gig.title}</h3>
                     <p className="text-xs font-bold text-slate-500 mt-1 flex items-center gap-1.5"><MapPin size={14}/> {gig.location?.address || 'Location Hidden'}</p>
                   </div>
                   
                   <div className="text-right">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Pay</p>
                     <p className="text-2xl font-black font-outfit text-slate-900">₹{gig.totalPay?.toLocaleString() || gig.monthlyRate?.toLocaleString()}</p>
                   </div>
                 </div>

                 {/* Tracker */}
                 <div className="pt-6 border-t border-slate-100">
                   <GigStatusTracker 
                      status={gig.status}
                      paymentStatus={gig.paymentStatus}
                      workerTimeoutAt={gig.workerTimeoutAt}
                      workerName={gig.hiredWorkerId?.name}
                      workerPhone={gig.hiredWorkerId?.phone}
                   />
                 </div>

                 {/* Action Buttons */}
                 <div className="mt-6 flex justify-end gap-3 pt-6 border-t border-slate-100">
                   {gig.status === 'open' && (
                      <Link href={`/hirer/matches/${gig._id}`} className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold rounded-xl shadow-md transition flex items-center gap-2">
                         View AI Matches
                      </Link>
                   )}
                   {(gig.status === 'in_progress' || gig.status === 'worker_accepted') && (
                      <button onClick={() => handleComplete(gig._id)} className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold rounded-xl shadow-md transition">
                        Mark Job Completed & Release Funds
                      </button>
                   )}
                 </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
