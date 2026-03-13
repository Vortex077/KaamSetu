'use client';

export default function WorkerGigsPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800">Find Gigs Nearby</h1>
        <p className="text-gray-500 mt-1">Browse available gigs near your location.</p>
        {/* TODO: Gig list with map and filters */}
        <div className="mt-6 bg-white rounded-xl shadow-md p-6 border">
          <p className="text-gray-400 text-center">Nearby gigs will appear here</p>
        </div>
      </div>
    </div>
  );
}
