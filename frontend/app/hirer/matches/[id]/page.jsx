'use client';
import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { SearchCheck, ArrowLeft, Loader2, Sparkles } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import api from '../../../../lib/api';
import WorkerCard from '../../../../components/WorkerCard';
import PaymentModal from '../../../../components/PaymentModal';

export default function MatchesDashboard({ params }) {
  const unwrappedParams = use(params);
  const gigId = unwrappedParams.id;
  const router = useRouter();
  
  const [data, setData] = useState(null); 
  const [loading, setLoading] = useState(true);
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [hiringFlow, setHiringFlow] = useState({ active: false, status: 'idle' });

  useEffect(() => {
    fetchMatches();
  }, [gigId]);

  const fetchMatches = async () => {
    try {
      const res = await api.get(`/api/gigs/${gigId}/matches`);
      setData(res.data.data);
    } catch (err) {
      toast.error('Failed to load matches');
    } finally {
      setLoading(false);
    }
  };

  const handleHire = (worker) => {
    setSelectedWorker(worker);
  };

  const confirmPayment = async (workerId) => {
    try {
      setHiringFlow({ active: true, status: 'loading' });
      await api.post(`/api/gigs/${gigId}/hire/${workerId}`, { paymentConfirmed: true });
      toast.success('Worker is notified and you will get further details of worker when worker accepts the job within 2 hours.', { duration: 6000 });
      router.push('/hirer/manage');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to hire worker');
      setHiringFlow({ active: false, status: 'idle' });
      setSelectedWorker(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center font-inter">
        <Loader2 className="animate-spin text-orange-500 mb-4" size={48} />
        <h2 className="text-2xl font-black text-slate-800 font-outfit animate-pulse">KaamSetu AI is scanning 500M+ profiles...</h2>
      </div>
    );
  }

  if (!data?.gig || !data?.matches) return <div className="p-8 text-center text-red-500 font-bold">Error loading match dashboard</div>;

  const { gig, matches, matchTimeMs } = data;

  return (
    <div className="min-h-screen bg-slate-50 pb-20 font-inter">
      {/* Top Bar */}
      <div className="bg-slate-900 text-white pt-8 pb-32 px-4 shadow-md relative">
        <div className="absolute inset-0 bg-orange-900/10"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <Link href="/hirer/manage" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition mb-6 text-sm font-bold tracking-wide uppercase">
            <ArrowLeft size={16} /> Dashboard
          </Link>
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <p className="text-orange-400 text-xs font-black uppercase tracking-widest mb-2 flex items-center gap-1.5"><Sparkles size={14}/> Top AI Matches Ready</p>
              <h1 className="text-3xl md:text-5xl font-black font-outfit text-white leading-tight">{gig.title}</h1>
            </div>
            
            <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-4 py-2.5 rounded-xl backdrop-blur-sm self-start md:self-auto shadow-sm">
              <SearchCheck size={18} />
              <span className="font-extrabold tracking-wide text-sm">MATCHED IN {matchTimeMs}MS</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto px-4 -mt-20 relative z-20">
        {matches.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center shadow-xl border border-slate-100">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
              <span className="text-3xl grayscale opacity-50">🏜️</span>
            </div>
            <h3 className="text-2xl font-black text-slate-900 font-outfit mb-2">No active workers found nearby</h3>
            <p className="text-slate-500 font-medium tracking-wide text-sm">Try expanding your search radius or increasing the daily rate to attract more workers.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {matches.map(({ worker, matchScore, distanceKm, matchedSkills }) => (
              <WorkerCard 
                key={worker._id}
                worker={worker}
                matchScore={matchScore}
                matchedSkills={matchedSkills}
                distanceKm={distanceKm}
                onHire={handleHire}
              />
            ))}
          </div>
        )}
      </div>

      {selectedWorker && (
        <PaymentModal 
          worker={selectedWorker} 
          gig={gig} 
          onConfirm={confirmPayment}
          onClose={() => !hiringFlow.active && setSelectedWorker(null)}
        />
      )}
    </div>
  );
}
