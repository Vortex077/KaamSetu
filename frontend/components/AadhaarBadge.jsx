import { CheckCircle2, Clock } from 'lucide-react';

export default function AadhaarBadge({ isVerified }) {
  if (isVerified) {
    return (
      <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full border border-emerald-100" title="UIDAI DigiLocker integration complete">
        <CheckCircle2 size={14} /> Aadhaar Verified
      </div>
    );
  }
  return (
    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-500 text-xs font-bold rounded-full border border-slate-200" title="UIDAI DigiLocker integration pending">
      <Clock size={14} /> Verification Pending
    </div>
  );
}
