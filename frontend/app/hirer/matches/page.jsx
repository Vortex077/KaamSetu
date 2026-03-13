'use client';

export default function HirerMatchesPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800">Worker Matches</h1>
        <p className="text-gray-500 mt-1">AI-ranked worker matches for your gigs.</p>
        {/* TODO: Match results with scores and hire buttons */}
        <div className="mt-6 bg-white rounded-xl shadow-md p-6 border">
          <p className="text-gray-400 text-center">Worker matches will appear here</p>
        </div>
      </div>
    </div>
  );
}
