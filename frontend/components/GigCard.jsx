import { MapPin, Briefcase, IndianRupee, Clock, CheckCircle2 } from 'lucide-react';
import { useState } from 'react';

export default function GigCard({ gig, onApply, applied }) {
  const isDaily = gig.hireType === 'daily_gig';
  const isPartTime = gig.hireType === 'part_time';
  
  let payText = '';
  if (isDaily) payText = `₹${gig.payPerDay || 0}/day for ${gig.duration || 1} days`;
  else if (isPartTime) payText = `₹${gig.payPerDay || 0}/day for ${gig.daysPerWeek || 1} days/wk`;
  else payText = `₹${gig.monthlyRate || 0}/month`;

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-lg transition-all flex flex-col h-full group">
      <div className="flex justify-between items-start mb-4">
        <div>
          <span className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-widest rounded-md mb-3 inline-block shadow-sm ${isPartTime ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-orange-50 text-orange-700 border border-orange-200'}`}>
            {gig.hireType?.replace('_', ' ')}
          </span>
          <h3 className="text-xl font-bold font-outfit text-slate-900 leading-tight group-hover:text-orange-600 transition-colors">{gig.title}</h3>
          {gig.hirerId?.businessName && (
            <p className="text-xs font-black text-slate-400 mt-1.5 uppercase tracking-widest flex items-center gap-1.5"><Briefcase size={14} className="text-slate-300"/> {gig.hirerId.businessName}</p>
          )}
        </div>
      </div>
      
      <p className="text-sm text-slate-600 mb-6 line-clamp-3 leading-relaxed flex-1 font-medium">
        {gig.description}
      </p>
      
      <div className="space-y-3 mb-6 bg-slate-50 p-4 rounded-2xl border border-slate-100">
        <div className="flex items-center gap-2.5 text-sm font-black text-slate-800">
          <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0"><IndianRupee size={16}/></div>
          {payText}
        </div>
        <div className="flex items-center gap-2.5 text-xs font-bold text-slate-500 tracking-wide uppercase">
          <div className="w-8 h-8 rounded-full bg-white border border-slate-200 shadow-sm flex items-center justify-center text-slate-400 shrink-0"><MapPin size={14}/></div>
          {gig.location?.address || 'Location Hidden'}
        </div>
      </div>

      <button 
        onClick={() => !applied && onApply(gig)} 
        disabled={applied}
        className={`w-full py-4 rounded-xl font-black uppercase tracking-widest text-sm transition-all flex items-center justify-center gap-2 shadow-sm ${
          applied 
            ? 'bg-emerald-50 text-emerald-600 border border-emerald-200 shadow-none' 
            : 'bg-slate-900 hover:bg-orange-600 text-white hover:shadow-orange-500/30'
        }`}
      >
        {applied ? <><CheckCircle2 size={18}/> Successfully Applied</> : 'Quick Apply Now'}
      </button>
    </div>
  );
}
