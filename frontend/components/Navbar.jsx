'use client';

export default function Navbar() {
  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
        <a href="/" className="text-2xl font-bold text-orange-600">
          Kaam<span className="text-gray-800">Setu</span>
        </a>
        <div className="flex gap-4 items-center">
          <a href="/auth/login" className="text-gray-600 hover:text-orange-600">Login</a>
          <a href="/auth/register" className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700">
            Register
          </a>
        </div>
      </div>
    </nav>
  );
}
