'use client';
import { useState, useEffect } from 'react';
import { Loader2, CheckCircle2, Clock, XCircle, MapPin, IndianRupee, Briefcase, FileText } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import api from '../../../lib/api';

export default function ApplicationsPage() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  // Poll for updates to application status (hirer accepted/rejected)
  useEffect(() => {
    fetchApplications();
    const inv = setInterval(fetchApplications, 15000);
    return () => clearInterval(inv);
  }, []);

  const fetchApplications = async () => {
    try {
      const { data } = await api.get('/api/applications/my');
      setApplications(data.data);
    } catch(err) {
      toast.error('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 font-inter"><Loader2 className="animate-spin text-orange-500 mb-4" size={48}/><h3 className="font-extrabold text-slate-400 tracking-widest uppercase text-sm">Loading applications</h3></div>;

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 font-inter">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-black font-outfit text-slate-900 leading-tight">My Applications</h1>
          <p className="text-slate-500 mt-2 font-bold tracking-wide">Track the real-time status of your part-time and full-time job applications.</p>
        </div>

        {applications.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 text-center border border-slate-200 shadow-sm relative overflow-hidden group hover:shadow-md transition">
            <div className="absolute top-0 right-0 w-64 h-64 bg-orange-100 rounded-full blur-3xl opacity-0 group-hover:opacity-40 -translate-y-1/2 translate-x-1/2 transition-opacity"></div>
            <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-6 border border-slate-100 relative z-10">
              <FileText size={32} className="text-slate-300"/>
            </div>
            <h3 className="text-2xl font-black font-outfit text-slate-900 mb-2 relative z-10">No active applications</h3>
            <p className="text-slate-500 mb-8 font-medium relative z-10 shadow-sm px-4">Head over to the job board to find your next opportunity.</p>
            <Link href="/worker/jobs" className="inline-flex py-4 px-10 bg-slate-900 hover:bg-slate-800 transition text-white font-black uppercase tracking-widest text-sm rounded-xl shadow-md relative z-10 border-b-4 border-slate-950 hover:border-b-0 hover:translate-y-1 duration-150">Start Applying</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map(app => {
              const gig = app.gigId;
              if (!gig) return null;
              
              const isAccepted = app.status === 'accepted';
              const isRejected = app.status === 'rejected';
              const isPending = app.status === 'pending';

              let statusColor = 'bg-slate-50 text-slate-500 border-slate-200';
              let StatusIcon = Clock;
              
              if (isAccepted) { statusColor = 'bg-emerald-50 text-emerald-700 border-emerald-300 shadow-sm shadow-emerald-500/10'; StatusIcon = CheckCircle2; }
              if (isRejected) { statusColor = 'bg-red-50 text-red-700 border-red-200'; StatusIcon = XCircle; }

              return (
                <div key={app._id} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row gap-6 items-start md:items-center relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-slate-200 group-hover:bg-orange-400 transition-colors"></div>
                  <div className="flex-1 pl-4">
                    <div className="flex gap-2 items-center mb-1.5">
                      <span className="text-[10px] font-black bg-orange-100 text-orange-700 px-2 py-0.5 rounded shadow-[0_1px_1px_rgba(0,0,0,0.05)] uppercase tracking-widest leading-none">{gig.hireType?.replace('_', ' ')}</span>
                      {gig.hirerId?.businessName && <span className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1"><Briefcase size={12}/> {gig.hirerId.businessName}</span>}
                    </div>
                    <h3 className="text-xl font-black font-outfit text-slate-900">{gig.title}</h3>
                    <div className="flex flex-wrap gap-3 mt-3">
                      <span className="text-xs font-black text-slate-600 flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 uppercase tracking-wider"><IndianRupee size={16} className="text-slate-400"/> {gig.payPerDay ? `₹${gig.payPerDay}/day` : `₹${gig.monthlyRate}/month`}</span>
                      <span className="text-xs font-black text-slate-600 flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 uppercase tracking-wider"><MapPin size={16} className="text-slate-400"/> {gig.location?.address || 'Location Hidden'}</span>
                    </div>
                  </div>
                  
                  <div className={`px-6 py-4 rounded-2xl flex flex-col items-center justify-center gap-1.5 border-[3px] min-w-[200px] ${statusColor}`}>
                    <StatusIcon size={24} className={isPending ? 'animate-pulse' : ''} />
                    <span className="font-black uppercase tracking-widest text-[11px] leading-tight text-center">{
                      isAccepted ? 'Hirer Accepted' : 
                      isRejected ? 'Application Declined' :
                      'In Review Stage'
                    }</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
