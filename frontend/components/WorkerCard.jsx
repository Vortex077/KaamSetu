import { useState, useEffect } from 'react';
import { Star, MapPin, SearchCheck } from 'lucide-react';
import AadhaarBadge from './AadhaarBadge';

// Animated Counter Hook
function useCounter(end, duration = 1000) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let startTime = null;
    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }, [end, duration]);
  return count;
}

export default function WorkerCard({ worker, matchScore, matchedSkills, distanceKm, onHire }) {
  const score = useCounter(matchScore);
  
  const isHigh = matchScore > 75;
  const isMed = matchScore > 50 && matchScore <= 75;
  const scoreColor = isHigh ? 'text-emerald-600 bg-emerald-50 border-emerald-200' : isMed ? 'text-amber-600 bg-amber-50 border-amber-200' : 'text-red-600 bg-red-50 border-red-200';

  const initials = worker.name.split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase();

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-lg transition-all relative overflow-hidden group">
      {/* Top Section */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-slate-800 text-white flex items-center justify-center text-xl font-bold shadow-sm">
            {initials}
          </div>
          <div>
            <h3 className="text-lg font-bold font-outfit text-slate-900">{worker.name}</h3>
            <div className="flex items-center gap-1.5 mt-1">
              <Star size={14} className="text-amber-500 fill-amber-500" />
              <span className="text-sm font-bold text-slate-700">{worker.rating ? worker.rating.toFixed(1) : 'New'}</span>
              <span className="text-xs font-semibold text-slate-400">({worker.totalJobs || 0} jobs)</span>
            </div>
          </div>
        </div>
        
        {/* Animated Score Badge */}
        <div className={`flex flex-col items-center justify-center p-2 rounded-2xl border-2 ${scoreColor} min-w-[75px] shadow-sm transform group-hover:scale-105 transition-transform`}>
          <SearchCheck size={18} className="mb-1 opacity-80" />
          <span className="text-2xl font-black">{score}%</span>
          <span className="text-[10px] uppercase tracking-wider font-extrabold opacity-75">Match</span>
        </div>
      </div>

      <AadhaarBadge isVerified={worker.isVerified} />

      {/* Details */}
      <div className="mt-5 space-y-3">
        {distanceKm !== undefined && (
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-600 bg-slate-50 px-3 py-2 rounded-xl inline-flex w-full border border-slate-100">
            <MapPin size={16} className="text-slate-400" /> {distanceKm.toFixed(1)} km away from gig location
          </div>
        )}
        
        {worker.skills?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {worker.skills.map((skill, idx) => {
              const searchStr = typeof skill === 'string' ? skill : skill.name || '';
              const isMatched = Array.isArray(matchedSkills) && matchedSkills.some(mSkill => searchStr.toLowerCase().includes(mSkill.toLowerCase()));
              return (
                <span key={idx} className={`px-3 py-1 text-xs font-bold tracking-wide rounded-full border ${isMatched ? 'bg-emerald-50 border-emerald-200 text-emerald-700 shadow-sm' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
                  {searchStr.toUpperCase()}
                </span>
              );
            })}
          </div>
        )}
      </div>

      <button onClick={() => onHire(worker)} className="w-full mt-6 py-3.5 bg-orange-600 hover:bg-orange-500 text-white font-extrabold rounded-xl shadow-md hover:shadow-lg hover:shadow-orange-500/25 transition-all text-sm tracking-wide">
        HIRE & LOCK ESCROW
      </button>
    </div>
  );
}
