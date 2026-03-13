'use client';

export default function HirerManagePage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800">Manage Gigs</h1>
        <p className="text-gray-500 mt-1">View and manage all your posted gigs.</p>
        {/* TODO: Gig list with status tracking and actions */}
        <div className="mt-6 bg-white rounded-xl shadow-md p-6 border">
          <p className="text-gray-400 text-center">Your gigs will appear here</p>
        </div>
      </div>
    </div>
  );
}
