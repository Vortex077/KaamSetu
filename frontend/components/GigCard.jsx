'use client';

export default function GigCard({ gig }) {
  return (
    <div className="bg-white rounded-xl shadow-md p-4 border hover:shadow-lg transition-shadow">
      <h3 className="font-semibold text-gray-800 text-lg">{gig?.title || 'Gig'}</h3>
      <p className="text-sm text-gray-500 mt-1 line-clamp-2">{gig?.description || ''}</p>
      <div className="flex flex-wrap gap-2 mt-2">
        {(gig?.skillsRequired || []).map((skill, i) => (
          <span key={i} className="bg-orange-100 text-orange-700 text-xs px-2 py-1 rounded-full">
            {skill}
          </span>
        ))}
      </div>
      <div className="mt-3 flex justify-between text-sm text-gray-600">
        <span>₹{gig?.payPerDay || 0}/day × {gig?.duration || 0} days</span>
        <span className="capitalize text-orange-600 font-medium">{gig?.status || 'open'}</span>
      </div>
    </div>
  );
}
