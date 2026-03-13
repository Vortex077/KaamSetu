'use client';

export default function WhatsAppDemo() {
  return (
    <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
      <div className="text-4xl mb-3">📱</div>
      <h3 className="text-lg font-semibold text-green-800">WhatsApp Registration</h3>
      <p className="text-sm text-green-600 mt-2">
        Workers can register by sending a voice note in Hindi on WhatsApp.
        No app download needed!
      </p>
      <div className="mt-4 bg-white rounded-lg p-3 text-left text-sm text-gray-600 border">
        <p className="font-medium text-green-700">🎤 "Mera naam Suresh hai, main electrician hoon, Karol Bagh mein rehta hoon..."</p>
        <p className="mt-2 text-xs text-gray-400">AI extracts: Name, Skills, Location, Experience</p>
      </div>
    </div>
  );
}
