import { useState, useEffect } from 'react';
import { X, Star, MapPin, Loader2, CheckCircle2 } from 'lucide-react';
import api from '../lib/api';

export default function WorkerProfileModal({ workerId, onClose, onHire }) {
  const [worker, setWorker] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!workerId) return;
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/api/workers/${workerId}`);
        if (res.data.success) {
          setWorker(res.data.data);
        } else {
          setError(res.data.error || 'Failed to open profile');
        }
      } catch (err) {
        setError('Server error loading profile');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [workerId]);

  if (!workerId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm sm:items-center sm:p-0">
      <div 
        className="fixed inset-0 transition-opacity" 
        onClick={onClose}
      />
      
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header Ribbon */}
        <div className="bg-slate-900 p-6 flex items-start justify-between shrink-0">
          <div className="flex items-center gap-4 text-white">
            <div className="w-16 h-16 rounded-full bg-orange-600 flex items-center justify-center text-2xl font-black shadow-lg">
              {worker?.name ? worker.name.substring(0,2).toUpperCase() : '??'}
            </div>
            <div>
              <h2 className="text-2xl font-black font-outfit m-0 leading-tight">
                {worker?.name || 'Loading...'}
              </h2>
              {worker?.rating > 0 ? (
                <div className="flex items-center gap-1.5 mt-1">
                  <Star size={16} className="text-yellow-400 fill-yellow-400" />
                  <span className="font-bold">{worker.rating.toFixed(1)}</span>
                  <span className="text-slate-400 text-sm">({worker.totalJobs} jobs)</span>
                </div>
              ) : (
                <span className="text-sm font-bold text-slate-400 bg-slate-800 px-2.5 py-1 rounded-md mt-1 inline-block">New Worker</span>
              )}
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-full transition-colors focus:outline-none"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto font-inter bg-slate-50 flex-1">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-4 text-slate-400">
              <Loader2 className="animate-spin text-orange-500" size={40} />
              <p className="font-bold text-sm">Loading complete profile...</p>
            </div>
          ) : error ? (
            <div className="py-20 text-center text-red-500 font-bold">{error}</div>
          ) : (
            <div className="space-y-8">
              
              {/* About & Skills */}
              <div>
                <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-3">Verified Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {worker.skills?.map((skill, i) => (
                    <span key={i} className="bg-white border border-slate-200 text-slate-700 px-4 py-1.5 rounded-full text-sm font-bold capitalize shadow-sm">
                      {skill}
                    </span>
                  ))}
                  {worker.skills?.length === 0 && <span className="text-slate-400 text-sm font-medium">No specific skills listed.</span>}
                </div>
              </div>

              {/* Portfolio */}
              {worker.portfolioPhotos && worker.portfolioPhotos.length > 0 && (
                <div>
                  <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <span className="text-xl">📸</span> Portfolio Photos
                  </h3>
                  <div className="flex gap-3 overflow-x-auto pb-4 snap-x hide-scrollbar rounded-xl">
                    {worker.portfolioPhotos.map((img, idx) => (
                      <div key={idx} className="min-w-[160px] h-[160px] rounded-2xl overflow-hidden shrink-0 snap-start border-2 border-slate-200 shadow-sm relative group cursor-pointer bg-white">
                        <img src={img} alt="Work example" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                           <span className="text-white font-bold font-outfit tracking-wide shadow-sm">View Work</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Reviews */}
              <div>
                <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <span className="text-yellow-500 text-xl">★</span> Hirer Reviews
                </h3>
                
                {worker.reviews && worker.reviews.length > 0 ? (
                  <div className="space-y-3">
                    {/* Sort newest first, take top 5 */}
                    {[...worker.reviews].sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5).map((review, i) => (
                      <div key={i} className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-1">
                             {[...Array(5)].map((_, idx) => (
                               <Star 
                                 key={idx} 
                                 size={14} 
                                 className={idx < review.rating ? "text-yellow-400 fill-yellow-400" : "text-slate-200 fill-slate-50"} 
                               />
                             ))}
                          </div>
                          <span className="text-[10px] uppercase font-black tracking-widest text-slate-400">
                             {new Date(review.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        {review.feedback && (
                          <p className="text-slate-700 font-medium text-sm leading-relaxed my-2">"{review.feedback}"</p>
                        )}
                        <p className="text-xs font-bold text-slate-500 flex items-center gap-1.5 mt-2">
                          — {review.hirerId?.name || 'Verified Hirer'} 
                          {review.hirerId?.businessType && <span className="bg-slate-100 px-1.5 py-0.5 rounded text-[10px] uppercase tracking-wider">{review.hirerId.businessType}</span>}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white border border-slate-200 border-dashed rounded-2xl p-6 text-center">
                    <p className="text-slate-500 font-medium text-sm">No reviews yet. Be the first to hire and review {worker?.name.split(' ')[0]}!</p>
                  </div>
                )}
              </div>

            </div>
          )}
        </div>

        {/* Footer Actions */}
        {!loading && !error && worker && (
          <div className="p-4 bg-white border-t border-slate-100 flex gap-3 shrink-0">
             <button 
               onClick={onClose}
               className="px-6 py-3.5 rounded-xl font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition flex-1 text-sm tracking-wide"
             >
               Go Back
             </button>
             <button 
               onClick={() => {
                 onClose();
                 onHire(worker);
               }}
               className="px-6 py-3.5 rounded-xl font-extrabold bg-orange-600 hover:bg-orange-500 text-white shadow-md hover:shadow-lg hover:shadow-orange-500/20 transition flex-2 w-2/3 text-sm tracking-wide flex items-center justify-center gap-2"
             >
               <CheckCircle2 size={18} />
               HIRE WORKER
             </button>
          </div>
        )}
      </div>
    </div>
  );
}
