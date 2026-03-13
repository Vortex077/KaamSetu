import { AlertTriangle, ShieldX } from 'lucide-react';

export default function FraudWarningBanner({ riskLevel, reason, suggestedMinPay, flaggedIssues }) {
  if (riskLevel === 'low' || !riskLevel) return null;

  const isHigh = riskLevel === 'high';
  
  return (
    <div className={`mt-6 p-4 rounded-xl border-l-4 ${isHigh ? 'bg-red-50 border-red-500' : 'bg-amber-50 border-amber-500'}`}>
      <div className="flex gap-3">
        <div className={`shrink-0 ${isHigh ? 'text-red-500' : 'text-amber-500'}`}>
          {isHigh ? <ShieldX size={24}/> : <AlertTriangle size={24}/>}
        </div>
        <div>
          <h4 className={`font-bold ${isHigh ? 'text-red-800' : 'text-amber-800'}`}>
            {isHigh ? 'Gig Posting Blocked (High Risk)' : 'Review Required (Medium Risk)'}
          </h4>
          <p className={`text-sm mt-1 ${isHigh ? 'text-red-700' : 'text-amber-700'}`}>{reason}</p>
          
          {suggestedMinPay && (
             <div className={`mt-3 inline-block px-3 py-1 bg-white rounded-lg text-sm font-semibold shadow-sm border ${isHigh ? 'border-red-100' : 'border-amber-100'}`}>
                Suggested Minimum Pay: ₹{suggestedMinPay}
             </div>
          )}
          
          {flaggedIssues?.length > 0 && (
            <ul className={`mt-3 space-y-1 text-sm list-disc pl-4 ${isHigh ? 'text-red-700' : 'text-amber-700'}`}>
              {flaggedIssues.map((issue, idx) => <li key={idx}>{issue}</li>)}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
