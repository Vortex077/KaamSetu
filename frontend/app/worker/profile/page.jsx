'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getWorkerProfile, updateWorkerProfile } from '../../../lib/api';

const SKILL_OPTIONS = [
  'electrician', 'plumbing', 'painting', 'carpentry', 'masonry',
  'cooking', 'cleaning', 'serving', 'housekeeping', 'laundry',
  'delivery', 'driving', 'loading', 'gardening', 'security',
  'tailoring', 'welding', 'construction', 'data entry', 'tutoring',
];

const DAY_OPTIONS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

export default function WorkerProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [searchingLocation, setSearchingLocation] = useState(false);
  const [locationQuery, setLocationQuery] = useState('');
  const [locationResults, setLocationResults] = useState([]);

  const [form, setForm] = useState({
    name: '',
    skills: [],
    dailyRate: '',
    experience: '',
    whatsappNumber: '',
    availability: { days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'], isAvailable: true },
    location: { type: 'Point', coordinates: [0, 0], city: '', address: '' },
  });

  // Load existing profile
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const { data } = await getWorkerProfile();
        const w = data.data;
        setForm({
          name: w.name || '',
          skills: w.skills || [],
          dailyRate: w.dailyRate || '',
          experience: w.experience || '',
          whatsappNumber: w.whatsappNumber || '',
          availability: w.availability || { days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'], isAvailable: true },
          location: w.location || { type: 'Point', coordinates: [0, 0], city: '', address: '' },
        });
        if (w.location?.address) setLocationQuery(w.location.address);
      } catch {
        // New profile — form defaults are fine
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, []);

  // Geocode search (via backend proxy)
  const searchLocation = async () => {
    if (!locationQuery.trim()) return;
    setSearchingLocation(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const res = await fetch(`${apiUrl}/api/geocode?q=${encodeURIComponent(locationQuery)}`);
      const json = await res.json();
      if (json.success) setLocationResults(json.data);
    } catch {
      // silently fail
    } finally {
      setSearchingLocation(false);
    }
  };

  const selectLocation = (loc) => {
    setForm({
      ...form,
      location: { type: 'Point', coordinates: [loc.lon, loc.lat], city: loc.city, address: loc.displayName },
    });
    setLocationQuery(loc.displayName);
    setLocationResults([]);
  };

  const useGPS = () => {
    if (!navigator.geolocation) return;
    setSearchingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
          const res = await fetch(`${apiUrl}/api/geocode?lat=${latitude}&lon=${longitude}`);
          const json = await res.json();
          if (json.success && json.data.length > 0) {
            const loc = json.data[0];
            setForm({
              ...form,
              location: { type: 'Point', coordinates: [longitude, latitude], city: loc.city, address: loc.displayName },
            });
            setLocationQuery(loc.displayName);
          } else {
            setForm({
              ...form,
              location: { type: 'Point', coordinates: [longitude, latitude], city: '', address: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}` },
            });
          }
        } catch {
          setForm({
            ...form,
            location: { type: 'Point', coordinates: [longitude, latitude], city: '', address: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}` },
          });
        } finally {
          setSearchingLocation(false);
        }
      },
      () => setSearchingLocation(false),
      { enableHighAccuracy: true }
    );
  };

  const toggleSkill = (skill) => {
    setForm((prev) => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter((s) => s !== skill)
        : [...prev.skills, skill],
    }));
  };

  const toggleDay = (day) => {
    setForm((prev) => ({
      ...prev,
      availability: {
        ...prev.availability,
        days: prev.availability.days.includes(day)
          ? prev.availability.days.filter((d) => d !== day)
          : [...prev.availability.days, day],
      },
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    setSaved(false);
    try {
      await updateWorkerProfile({
        ...form,
        dailyRate: Number(form.dailyRate),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-amber-50">
        <div className="flex items-center gap-3 text-orange-600">
          <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
          Loading profile...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              My <span className="text-orange-600">Profile</span>
            </h1>
            <p className="text-gray-500 mt-1">Set up your profile to get matched with the best gigs</p>
          </div>
          <a href="/worker/gigs" className="text-orange-600 hover:text-orange-700 font-medium text-sm">
            Browse Gigs →
          </a>
        </div>

        <form onSubmit={handleSave} className="space-y-6">
          {/* Basic Info Card */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg shadow-orange-500/5 p-6 border border-white/50">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-5">
              <span className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center text-orange-600 text-sm">👤</span>
              Basic Information
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Full Name</label>
                <input type="text" value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all bg-gray-50/50 hover:bg-white"
                  placeholder="Your full name" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">WhatsApp Number</label>
                <input type="tel" value={form.whatsappNumber}
                  onChange={(e) => setForm({ ...form, whatsappNumber: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all bg-gray-50/50 hover:bg-white"
                  placeholder="9876543210" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Daily Rate (₹)</label>
                <input type="number" value={form.dailyRate}
                  onChange={(e) => setForm({ ...form, dailyRate: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all bg-gray-50/50 hover:bg-white"
                  placeholder="500" min="0" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1.5 block">Experience</label>
                <input type="text" value={form.experience}
                  onChange={(e) => setForm({ ...form, experience: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all bg-gray-50/50 hover:bg-white"
                  placeholder="e.g. 3 years painting" />
              </div>
            </div>
          </div>

          {/* Skills Card */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg shadow-orange-500/5 p-6 border border-white/50">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-2">
              <span className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center text-amber-600 text-sm">🛠️</span>
              Skills
            </h2>
            <p className="text-sm text-gray-500 mb-4">Select all that apply — more skills means more gig matches</p>
            <div className="flex flex-wrap gap-2">
              {SKILL_OPTIONS.map((skill) => (
                <button key={skill} type="button" onClick={() => toggleSkill(skill)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border ${
                    form.skills.includes(skill)
                      ? 'bg-orange-600 text-white border-orange-600 shadow-md shadow-orange-500/20'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-orange-300 hover:text-orange-600'
                  }`}>
                  {skill}
                </button>
              ))}
            </div>
            {form.skills.length > 0 && (
              <p className="text-xs text-orange-600 mt-3 font-medium">
                ✓ {form.skills.length} skill{form.skills.length > 1 ? 's' : ''} selected
              </p>
            )}
          </div>

          {/* Location Card */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg shadow-orange-500/5 p-6 border border-white/50">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-4">
              <span className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center text-green-600 text-sm">📍</span>
              Location
            </h2>
            <div className="space-y-3">
              <div className="flex gap-2">
                <input type="text" value={locationQuery}
                  onChange={(e) => setLocationQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), searchLocation())}
                  className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all bg-gray-50/50 hover:bg-white"
                  placeholder="Search address or area..." />
                <button type="button" onClick={searchLocation} disabled={searchingLocation}
                  className="px-4 py-3 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition-colors disabled:opacity-50 font-medium text-sm">
                  {searchingLocation ? '...' : '🔍'}
                </button>
                <button type="button" onClick={useGPS} disabled={searchingLocation}
                  className="px-4 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50 font-medium text-sm"
                  title="Use GPS location">
                  📱
                </button>
              </div>

              {/* Location results dropdown */}
              {locationResults.length > 0 && (
                <div className="bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden">
                  {locationResults.map((loc, i) => (
                    <button key={i} type="button" onClick={() => selectLocation(loc)}
                      className="w-full text-left px-4 py-3 hover:bg-orange-50 transition-colors border-b border-gray-100 last:border-b-0">
                      <p className="text-sm text-gray-800 font-medium truncate">{loc.displayName}</p>
                      {loc.city && <p className="text-xs text-gray-500 mt-0.5">{loc.city}</p>}
                    </button>
                  ))}
                </div>
              )}

              {/* Current location display */}
              {form.location.address && (
                <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3">
                  <p className="text-sm text-green-800 font-medium">📍 {form.location.address}</p>
                  {form.location.city && <p className="text-xs text-green-600 mt-0.5">{form.location.city}</p>}
                </div>
              )}
            </div>
          </div>

          {/* Availability Card */}
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg shadow-orange-500/5 p-6 border border-white/50">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-4">
              <span className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 text-sm">📅</span>
              Availability
            </h2>
            <div className="flex items-center gap-3 mb-4">
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={form.availability.isAvailable}
                  onChange={(e) => setForm({ ...form, availability: { ...form.availability, isAvailable: e.target.checked } })}
                  className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:ring-2 peer-focus:ring-orange-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
              </label>
              <span className="text-sm text-gray-700 font-medium">
                {form.availability.isAvailable ? '✅ Available for work' : '⏸️ Not available right now'}
              </span>
            </div>
            <div className="grid grid-cols-7 gap-2">
              {DAY_OPTIONS.map((day) => (
                <button key={day} type="button" onClick={() => toggleDay(day)}
                  className={`py-2.5 rounded-xl text-xs font-medium capitalize transition-all duration-200 ${
                    form.availability.days.includes(day)
                      ? 'bg-orange-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}>
                  {day.slice(0, 3)}
                </button>
              ))}
            </div>
          </div>

          {/* Error / Success */}
          {error && (
            <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl border border-red-100 flex items-center gap-2">
              <span>⚠️</span> {error}
            </div>
          )}
          {saved && (
            <div className="bg-green-50 text-green-700 text-sm px-4 py-3 rounded-xl border border-green-200 flex items-center gap-2">
              <span>✅</span> Profile saved successfully!
            </div>
          )}

          {/* Save Button */}
          <button type="submit" disabled={saving}
            className="w-full py-4 bg-gradient-to-r from-orange-600 to-amber-500 text-white rounded-2xl font-semibold text-lg shadow-lg shadow-orange-500/25 hover:shadow-xl hover:shadow-orange-500/40 transition-all duration-300 transform hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0">
            {saving ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                Saving...
              </span>
            ) : '💾 Save Profile'}
          </button>
        </form>
      </div>
    </div>
  );
}
