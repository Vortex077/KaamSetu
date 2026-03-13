'use client';
import { useState, useEffect } from 'react';
import { Loader2, CheckCircle2, User, MapPin, Inbox } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../../lib/api';

export default function ReceivedApplicationsPage() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const { data } = await api.get('/api/applications/received');
      setApplications(data.data);
    } catch(err) {
      toast.error('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (appId) => {
    try {
      await api.post(`/api/applications/${appId}/accept`);
      toast.success('Candidate accepted! Worker notified via Push & Telegram.');
      fetchApplications();
    } catch(err) {
      toast.error('Failed to accept application');
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><Loader2 className="animate-spin text-orange-500" size={48}/></div>;

  const pendingApps = applications.filter(a => a.status === 'applied' || a.status === 'pending');
  const pastApps = applications.filter(a => a.status !== 'applied' && a.status !== 'pending');

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 font-inter">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl lg:text-5xl font-black font-outfit text-slate-900">Received Applications</h1>
          <p className="text-slate-600 mt-2 font-bold tracking-wide">Review pipeline candidates for your Part-Time and Full-Time job postings.</p>
        </div>

        {applications.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 text-center border border-slate-200 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-slate-100 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2"></div>
            <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-6 border border-slate-100 relative z-10">
              <Inbox size={32} className="text-slate-300"/>
            </div>
            <h3 className="text-2xl font-black font-outfit text-slate-900 mb-2 relative z-10">No applications yet</h3>
            <p className="text-slate-500 mb-6 font-medium relative z-10 px-4">When Segment B & C workers apply manually to your jobs on the Web, they will appear right here.</p>
          </div>
        ) : (
          <div className="space-y-12">
            {/* Pending List */}
            <section>
              <h2 className="text-xl font-black font-outfit text-slate-900 mb-6 border-b-2 border-slate-200 pb-3 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center text-sm">{pendingApps.length}</span> Needs Review
              </h2>
              {pendingApps.length === 0 ? (
                 <p className="text-slate-500 text-sm font-bold bg-white p-6 rounded-2xl border border-slate-100 text-center shadow-sm">Inbox Zero! You are all caught up.</p>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {pendingApps.map(app => (
                    <div key={app._id} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col items-start hover:shadow-lg transition-shadow relative overflow-hidden group">
                       <div className="absolute top-0 left-0 w-1.5 h-full bg-orange-200 group-hover:bg-orange-500 transition-colors"></div>
                       <div className="flex gap-4 items-center mb-4 border-b border-slate-100 pb-4 w-full pl-2">
                         <div className="w-14 h-14 rounded-full bg-gradient-to-br from-slate-800 to-slate-900 text-white flex items-center justify-center text-xl font-bold shrink-0 shadow-md">
                           {app.workerId?.name?.charAt(0) || 'W'}
                         </div>
                         <div>
                           <h3 className="text-xl font-black font-outfit text-slate-900 leading-tight">{app.workerId?.name}</h3>
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Applied for / <span>{app.gigId?.title}</span></p>
                         </div>
                       </div>
                       
                       <div className="flex-1 w-full space-y-4 pl-2">
                         {app.coverNote && (
                           <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-100/50 relative">
                             <span className="absolute -top-2 left-4 bg-white px-2 py-0.5 text-[10px] uppercase tracking-widest font-black text-amber-600 rounded-md border border-amber-100 shadow-sm">Intro Note</span>
                             <p className="text-sm text-slate-700 italic font-medium leading-relaxed mt-1">&quot;{app.coverNote}&quot;</p>
                           </div>
                         )}

                         <div className="flex flex-wrap gap-2 pt-2">
                           {app.workerId?.skills?.map((skill, idx) => (
                             <span key={idx} className="bg-slate-50 border border-slate-200 text-slate-600 px-3 py-1.5 rounded-lg text-[11px] font-black tracking-widest uppercase shadow-sm">{skill}</span>
                           ))}
                         </div>
                       </div>
                       
                       {app.workerId?.portfolioPhotos && app.workerId.portfolioPhotos.length > 0 && (
                         <div className="w-full mt-5 bg-slate-50 border border-slate-200 rounded-xl p-4">
                           <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 mb-2.5 flex items-center gap-1.5">
                             <span className="text-orange-500 text-sm">📸</span> Previous Work ({app.workerId.portfolioPhotos.length})
                           </h4>
                           <div className="flex gap-3 overflow-x-auto pb-2 snap-x hide-scrollbar">
                             {app.workerId.portfolioPhotos.map((photo, i) => (
                               <div key={i} className="min-w-[80px] h-[80px] rounded-lg overflow-hidden shrink-0 snap-start border border-slate-300 shadow-sm relative group cursor-pointer">
                                 <img src={photo} alt="Past Work" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                 <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <User size={16} className="text-white"/>
                                 </div>
                               </div>
                             ))}
                           </div>
                         </div>
                       )}
                       
                       <div className="w-full mt-6 pt-5 border-t border-slate-100">
                         <button onClick={() => handleAccept(app._id)} className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-black tracking-widest uppercase rounded-xl transition shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2">
                            <CheckCircle2 size={20}/> Accept Candidate & Hire
                         </button>
                       </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Past Decisions Log */}
            {pastApps.length > 0 && (
              <section>
                <h2 className="text-xl font-black font-outfit text-slate-400 mb-6 border-b-2 border-slate-200 pb-3">Past Decisions Log</h2>
                <div className="space-y-3 opacity-80 hover:opacity-100 transition-opacity">
                  {pastApps.map(app => (
                    <div key={app._id} className="bg-slate-100 border border-slate-200 rounded-2xl p-5 flex items-center justify-between group">
                       <div>
                         <p className="font-bold text-slate-900">{app.workerId?.name}</p>
                         <p className="text-xs text-slate-500 font-semibold tracking-wide uppercase mt-1">{app.gigId?.title}</p>
                       </div>
                       <span className={`px-4 py-1.5 text-[10px] font-black rounded-lg uppercase tracking-widest shadow-sm ${app.status === 'hired' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-red-100 text-red-700 border border-red-200'}`}>
                         {app.status}
                       </span>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
