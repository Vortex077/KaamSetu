'use client';

export default function WorkerCard({ worker }) {
  return (
    <div className="bg-white rounded-xl shadow-md p-4 border hover:shadow-lg transition-shadow">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-lg">
          {worker?.name?.charAt(0) || 'W'}
        </div>
        <div>
          <h3 className="font-semibold text-gray-800">{worker?.name || 'Worker'}</h3>
          <p className="text-sm text-gray-500">{worker?.skills?.join(', ') || 'No skills listed'}</p>
        </div>
      </div>
      <div className="mt-3 flex justify-between text-sm text-gray-600">
        <span>₹{worker?.dailyRate || 0}/day</span>
        <span>⭐ {worker?.rating || 0}</span>
      </div>
    </div>
  );
}
