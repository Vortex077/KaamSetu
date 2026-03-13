'use client';

export default function MatchScore({ score, breakdown }) {
  return (
    <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg p-3 border border-orange-200">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">Match Score</span>
        <span className="text-2xl font-bold text-orange-600">{score || 0}%</span>
      </div>
      {breakdown && (
        <div className="grid grid-cols-2 gap-1 text-xs text-gray-500">
          <span>Skills: {breakdown.skills}/40</span>
          <span>Distance: {breakdown.distance}/30</span>
          <span>Rating: {breakdown.rating}/20</span>
          <span>Availability: {breakdown.availability}/10</span>
        </div>
      )}
    </div>
  );
}
