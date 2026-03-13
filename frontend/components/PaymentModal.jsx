import { X, ShieldCheck } from 'lucide-react';
import { useState } from 'react';

export default function PaymentModal({ worker, gig, onConfirm, onClose }) {
  const [loading, setLoading] = useState(false);

  // Calculate Pay
  let basePay = 0;
  let breakdownLabel = '';
  
  if (gig.hireType === 'daily_gig') {
    basePay = gig.payPerDay * gig.duration;
    breakdownLabel = `₹${gig.payPerDay}/day × ${gig.duration} days`;
  } else if (gig.hireType === 'part_time') {
    basePay = gig.payPerDay * gig.daysPerWeek; // Weekly advance
    breakdownLabel = `₹${gig.payPerDay}/day × ${gig.daysPerWeek} days/week`;
  } else {
    basePay = gig.monthlyRate;
    breakdownLabel = `1st Month Advance`;
  }

  const platformFee = Math.round(basePay * 0.08); // 8% fee
  const total = basePay + platformFee;

  const handleConfirm = async () => {
    setLoading(true);
    await onConfirm(worker._id);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-lg overflow-hidden animate-in slide-in-from-bottom-8 font-inter">
        {/* Header */}
        <div className="bg-slate-900 px-6 py-5 flex justify-between items-center text-white">
          <h3 className="text-xl font-bold font-outfit">Secure Escrow Payment</h3>
          <button onClick={onClose} disabled={loading} className="p-2 hover:bg-white/10 rounded-full transition disabled:opacity-50"><X size={20}/></button>
        </div>

        {/* Content */}
        <div className="p-8">
          <div className="flex items-center gap-4 border-b border-slate-100 pb-6 mb-6">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-2xl font-bold text-slate-800 shadow-sm border border-slate-200">
              {worker.name.charAt(0)}
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Hiring Worker</p>
              <h4 className="text-2xl font-black text-slate-900 font-outfit">{worker.name}</h4>
              <p className="text-sm font-medium text-slate-500 mt-1">{gig.title}</p>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 mb-8">
            <h5 className="font-bold text-slate-900 mb-4 flex items-center gap-2"><ShieldCheck className="text-emerald-500 fill-emerald-100" size={20}/> Payment Breakdown</h5>
            <div className="space-y-3 text-sm font-semibold text-slate-600">
              <div className="flex justify-between">
                <span>Worker Pay ({breakdownLabel})</span>
                <span className="text-slate-900">₹{basePay.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span>KaamSetu Trust Fee (8%)</span>
                <span className="text-slate-900">₹{platformFee.toLocaleString('en-IN')}</span>
              </div>
              <div className="h-px bg-slate-200 my-4"></div>
              <div className="flex justify-between font-black text-xl text-slate-900">
                <span>Total Escrow Lock</span>
                <span className="text-orange-600">₹{total.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          <button 
            onClick={handleConfirm} 
            disabled={loading}
            className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-lg transition shadow-lg flex justify-center items-center gap-2 disabled:opacity-50 disabled:bg-slate-800"
          >
            {loading ? <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg> : 'Confirm Payment & Notify Worker'}
          </button>
          
          <p className="text-center text-xs font-medium text-slate-500 mt-5 max-w-sm mx-auto leading-relaxed">
            Funds are held securely by KaamSetu Escrow. They are only released to the worker when you mark the job as completed.
          </p>
        </div>
      </div>
    </div>
  );
}
