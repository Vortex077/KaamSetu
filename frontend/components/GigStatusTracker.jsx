'use client';

const STATUSES = [
  { key: 'open', label: 'Open', icon: '📋' },
  { key: 'payment_pending', label: 'Payment Pending', icon: '💳' },
  { key: 'payment_held', label: 'Payment Held', icon: '🔒' },
  { key: 'worker_accepted', label: 'Worker Accepted', icon: '✅' },
  { key: 'in_progress', label: 'In Progress', icon: '🔨' },
  { key: 'completed', label: 'Completed', icon: '🎉' },
];

export default function GigStatusTracker({ currentStatus }) {
  const currentIndex = STATUSES.findIndex((s) => s.key === currentStatus);

  return (
    <div className="flex items-center gap-1 overflow-x-auto py-2">
      {STATUSES.map((status, i) => (
        <div key={status.key} className="flex items-center">
          <div className={`flex flex-col items-center min-w-[70px] ${
            i <= currentIndex ? 'text-orange-600' : 'text-gray-300'
          }`}>
            <span className="text-xl">{status.icon}</span>
            <span className="text-[10px] mt-1 text-center leading-tight">{status.label}</span>
          </div>
          {i < STATUSES.length - 1 && (
            <div className={`w-6 h-0.5 ${i < currentIndex ? 'bg-orange-600' : 'bg-gray-200'}`} />
          )}
        </div>
      ))}
    </div>
  );
}
