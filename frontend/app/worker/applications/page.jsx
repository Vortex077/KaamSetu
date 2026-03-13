'use client';

export default function WorkerApplicationsPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800">My Applications</h1>
        <p className="text-gray-500 mt-1">Track your gig applications and statuses.</p>
        {/* TODO: Applications list with status badges */}
        <div className="mt-6 bg-white rounded-xl shadow-md p-6 border">
          <p className="text-gray-400 text-center">Your applications will appear here</p>
        </div>
      </div>
    </div>
  );
}
