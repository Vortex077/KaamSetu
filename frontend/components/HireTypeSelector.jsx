import { Briefcase, CalendarClock, Zap } from 'lucide-react';

export default function HireTypeSelector({ value, onChange }) {
  const options = [
    { id: 'daily_gig', label: 'Daily Gig', desc: '1-7 days', icon: Zap },
    { id: 'part_time', label: 'Part-Time', desc: 'Specific days/week', icon: CalendarClock },
    { id: 'full_time', label: 'Full-Time', desc: 'Monthly salary', icon: Briefcase },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {options.map((opt) => {
        const Icon = opt.icon;
        const selected = value === opt.id;
        return (
          <button
            key={opt.id}
            type="button"
            onClick={() => onChange(opt.id)}
            className={`p-4 rounded-2xl border-2 text-left transition-all ${
              selected ? 'border-orange-500 bg-orange-50 shadow-sm' : 'border-slate-200 hover:border-orange-200 bg-white'
            }`}
          >
            <Icon size={24} className={`mb-3 ${selected ? 'text-orange-600' : 'text-slate-400'}`} />
            <h4 className={`font-semibold ${selected ? 'text-slate-900' : 'text-slate-700'}`}>{opt.label}</h4>
            <p className={`text-xs mt-1 ${selected ? 'text-orange-700' : 'text-slate-500'}`}>{opt.desc}</p>
          </button>
        );
      })}
    </div>
  );
}
