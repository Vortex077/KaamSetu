import { useEffect, useState } from 'react';
import { Clock, CheckCircle2, Phone } from 'lucide-react';

export default function GigStatusTracker({ status, paymentStatus, workerTimeoutAt, workerPhone, workerName, workerEmail }) {
  const [timeLeft, setTimeLeft] = useState('');
  const [isUrgent, setIsUrgent] = useState(false);

  const steps = [
    { id: 'open', label: 'Matching' },
    { id: 'payment_held', label: 'Escrow Locked' },
    { id: 'worker_accepted', label: 'Accepted' },
    { id: 'in_progress', label: 'Working' },
    { id: 'completed', label: 'Completed' },
  ];

  const getStepIndex = (s) => steps.findIndex(x => x.id === s);
  const currentIndex = getStepIndex(status);

  useEffect(() => {
    if (status !== 'payment_held' || !workerTimeoutAt) return;

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const end = new Date(workerTimeoutAt).getTime();
      const diff = end - now;

      if (diff <= 0) {
        setTimeLeft('Timeout');
        setIsUrgent(true);
        clearInterval(timer);
      } else {
        const mins = Math.floor(diff / 60000);
        const secs = Math.floor((diff % 60000) / 1000);
        setTimeLeft(`${mins}:${secs < 10 ? '0' : ''}${secs}`);
        setIsUrgent(mins < 30);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [status, workerTimeoutAt]);

  return (
    <div className="w-full">
      {/* Progress Bar */}
      <div className="relative flex justify-between items-center mb-6 px-4">
        <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-1.5 bg-slate-200 rounded-full z-0"></div>
        <div 
          className="absolute left-6 top-1/2 -translate-y-1/2 h-1.5 bg-emerald-500 rounded-full z-0 transition-all duration-700 ease-out"
          style={{ width: `calc(${Math.max(0, (currentIndex / (steps.length - 1)) * 100)}% - 24px)` }}
        ></div>
        
        {steps.map((step, idx) => {
          const isCompleted = idx < currentIndex;
          const isActive = idx === currentIndex;
          const isCancelled = status === 'cancelled';
          
          let circleBg = 'bg-white border-slate-300 text-slate-300';
          if (isCompleted) circleBg = 'bg-emerald-500 border-emerald-500 text-white';
          if (isActive) circleBg = isCancelled ? 'bg-red-500 border-red-500 text-white shadow-md' : 'bg-orange-500 border-orange-500 text-white shadow-md shadow-orange-500/20';

          return (
            <div key={step.id} className="relative z-10 flex flex-col items-center group">
              <div className={`w-8 h-8 rounded-full border-[3px] flex items-center justify-center transition-all duration-300 ${circleBg}`}>
                {isCompleted ? <CheckCircle2 size={16} className="text-white"/> : <span className="text-xs font-black">{idx + 1}</span>}
              </div>
              <span className={`absolute top-10 text-[10px] font-black tracking-wide text-center w-20 transform -translate-x-1/2 left-1/2 uppercase ${isActive ? (isCancelled ? 'text-red-600' : 'text-orange-600') : isCompleted ? 'text-emerald-700' : 'text-slate-400'}`}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Contextual UI Box */}
      <div className="mt-14 bg-slate-50 border border-slate-200 rounded-2xl p-5 shadow-sm">
        {status === 'payment_held' && (
          <div className="flex items-center justify-between">
            <div>
              <p className="font-black font-outfit text-slate-900 tracking-wide text-sm">Awaiting Worker Acceptance via Telegram</p>
              <p className="text-xs font-semibold text-slate-500 mt-0.5">Funds are held securely in KaamSetu Escrow.</p>
            </div>
            <div className={`flex items-center gap-1.5 font-mono font-black text-lg bg-white px-3 py-1.5 rounded-lg border shadow-sm ${isUrgent ? 'text-red-500 border-red-200' : 'text-slate-700 border-slate-200'}`}>
              <Clock size={16} className={isUrgent ? 'animate-pulse' : ''} /> {timeLeft}
            </div>
          </div>
        )}
        
        {(status === 'worker_accepted' || status === 'in_progress') && (workerPhone || workerEmail) && (
          <div className="flex flex-col sm:flex-row gap-4">
            {workerPhone && (
              <div className="flex items-center gap-4 text-slate-700 bg-white p-3 rounded-xl border border-slate-100 shadow-sm inline-flex">
                <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0"><Phone size={20}/></div>
                <div>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Worker Phone</p>
                   <a href={`tel:+91${workerPhone}`} className="text-lg font-black font-outfit text-slate-900 hover:text-emerald-600 transition-colors">+91 {workerPhone}</a>
                </div>
              </div>
            )}
            {workerEmail && (
              <div className="flex items-center gap-4 text-slate-700 bg-white p-3 rounded-xl border border-slate-100 shadow-sm inline-flex">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 shrink-0">@</div>
                <div>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Worker Email</p>
                   <a href={`mailto:${workerEmail}`} className="text-lg font-black font-outfit text-slate-900 hover:text-blue-600 transition-colors break-all">{workerEmail}</a>
                </div>
              </div>
            )}
          </div>
        )}

        {status === 'completed' && paymentStatus === 'released' && (
          <div className="flex items-center gap-2 text-emerald-600 font-extrabold tracking-wide text-sm">
            <CheckCircle2 size={24} className="fill-emerald-100"/> Escrow Payment Released Successfully
          </div>
        )}

        {status === 'cancelled' && paymentStatus === 'refunded' && (
          <div className="flex items-center gap-2 text-red-600 font-extrabold tracking-wide text-sm">
            KaamSetu Escrow Refund Initiated (Gig Cancelled)
          </div>
        )}

        {status === 'open' && (
          <div className="text-slate-500 font-bold text-sm flex items-center gap-2">
            Match process running. Check AI matches to select a worker.
          </div>
        )}
      </div>
    </div>
  );
}
