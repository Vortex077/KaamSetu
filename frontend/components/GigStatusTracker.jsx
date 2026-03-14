import { useEffect, useState } from 'react';
import { Clock, CheckCircle2, Phone, Star } from 'lucide-react';
import toast from 'react-hot-toast';

export default function GigStatusTracker({ gigId, status, paymentStatus, workerTimeoutAt, workerPhone, workerName, workerEmail, workerReviewed }) {
  const [timeLeft, setTimeLeft] = useState('');
  const [isUrgent, setIsUrgent] = useState(false);
  
  // Review State
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isReviewed, setIsReviewed] = useState(workerReviewed || false);

  const handleSubmitReview = async () => {
    if (rating === 0) return toast.error('Please select a star rating');
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/gigs/${gigId}/review/worker`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ rating, feedback })
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Review submitted successfully!');
        setIsReviewed(true);
      } else {
        toast.error(data.error || 'Failed to submit review');
      }
    } catch (err) {
      toast.error('Server error');
    } finally {
      setIsSubmitting(false);
    }
  };

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
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 text-emerald-600 font-extrabold tracking-wide text-sm">
              <CheckCircle2 size={24} className="fill-emerald-100"/> Escrow Payment Released Successfully
            </div>
            
            {/* Review Section */}
            {isReviewed ? (
              <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl mt-2 flex items-center justify-between">
                <div>
                   <p className="font-outfit font-bold text-emerald-900">Review Submitted</p>
                   <p className="text-xs text-emerald-700 font-medium">Thank you for rating this worker!</p>
                </div>
                <Star size={24} className="text-yellow-400 fill-yellow-400" />
              </div>
            ) : (
              <div className="bg-white border p-5 rounded-xl mt-2 shadow-sm">
                <h4 className="font-outfit font-black text-slate-800 mb-1">Rate this Worker</h4>
                <p className="text-xs text-slate-500 font-medium mb-4">Your review helps other hirers make better decisions.</p>
                
                <div className="flex items-center gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button 
                      key={star}
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="p-1 transition-transform hover:scale-110 focus:outline-none"
                    >
                      <Star 
                        size={32} 
                        className={`transition-colors duration-200 ${(hoverRating || rating) >= star ? 'text-yellow-400 fill-yellow-400' : 'text-slate-200 fill-slate-50'}`} 
                      />
                    </button>
                  ))}
                  <span className="ml-3 font-outfit font-black text-slate-400">{rating > 0 ? `${rating}/5` : ''}</span>
                </div>
                
                <textarea 
                  className="w-full text-sm font-medium border border-slate-200 rounded-lg p-3 bg-slate-50 hover:bg-white focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all resize-none mb-3"
                  rows="3"
                  placeholder="Write a short review about their work (optional)..."
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                />
                
                <button 
                  onClick={handleSubmitReview}
                  disabled={isSubmitting || rating === 0}
                  className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-bold font-outfit py-2.5 px-6 rounded-lg transition-colors w-full sm:w-auto"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Review'}
                </button>
              </div>
            )}
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
