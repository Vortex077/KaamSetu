'use client';
import { useState, useEffect } from 'react';
import { User, MapPin, BellRing, Save, Loader2, IndianRupee } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../../lib/api';
import { subscribeToPush } from '../../../lib/pushNotifications';
import { getMyLocation, geocodeAddress } from '../../../lib/location';

export default function WorkerProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState(null);
  
  const [form, setForm] = useState({
    skills: '',
    dailyRate: '',
    monthlyRate: '',
    availableDays: [],
    location: null,
    portfolioPhotos: []
  });

  const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const localUser = JSON.parse(localStorage.getItem('kaamsetu_user'));
      if(localUser) {
         setUser(localUser);
         setForm({
            skills: localUser.skills ? localUser.skills.join(', ') : '',
            dailyRate: localUser.jobPreferences?.dailyRate || '',
            monthlyRate: localUser.jobPreferences?.monthlyRate || '',
            availableDays: localUser.jobPreferences?.availableDays || [],
            location: localUser.location || null,
            portfolioPhotos: localUser.portfolioPhotos || []
         });
      }
    } catch(err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDaySelect = (day) => {
    setForm(prev => {
      if (prev.availableDays.includes(day)) {
         return { ...prev, availableDays: prev.availableDays.filter(d => d !== day) };
      }
      return { ...prev, availableDays: [...prev.availableDays, day] };
    });
  };

  const handleLocation = async () => {
    try {
      const pos = await getMyLocation();
      const geo = await geocodeAddress(`${pos.lat}, ${pos.lng}`);
      setForm({ ...form, location: { type: 'Point', coordinates: [pos.lng, pos.lat], address: geo.displayName || 'GPS Location' } });
      toast.success('Location Updated Locally');
    } catch(err) {
      toast.error('Could not get GPS coordinates');
    }
  };

  const enablePush = async () => {
    try {
      await subscribeToPush();
      toast.success('Alerts enabled! You will be notified instantly when jobs match.');
    } catch(err) {
      toast.error('Failed to enable notifications');
    }
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      return toast.error("Image must be smaller than 2MB");
    }

    const reader = new FileReader();
    reader.onloadend = () => {
       setForm(prev => ({
         ...prev,
         portfolioPhotos: [...prev.portfolioPhotos, reader.result]
       }));
    };
    reader.readAsDataURL(file);
  };

  const removePhoto = (index) => {
    setForm(prev => ({
      ...prev,
      portfolioPhotos: prev.portfolioPhotos.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updatedUser = {
         name: user.name,
         phone: user.phone,
         skills: form.skills.split(',').map(s => s.trim()).filter(Boolean),
         jobPreferences: {
            dailyRate: form.dailyRate ? Number(form.dailyRate) : undefined,
            monthlyRate: form.monthlyRate ? Number(form.monthlyRate) : undefined,
            availableDays: form.availableDays
         },
         location: form.location,
         portfolioPhotos: form.portfolioPhotos
      };
      
      const { data } = await api.put('/api/workers/profile', updatedUser);
      
      localStorage.setItem('kaamsetu_user', JSON.stringify(data.data));
      setUser(updatedUser);
      toast.success('Profile preferences saved!');
    } catch (err) {
      toast.error('Failed to save profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !user) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><Loader2 className="animate-spin text-orange-500" size={48}/></div>;

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 font-inter">
      <div className="max-w-3xl mx-auto">
        
        {/* Header */}
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row items-center gap-6 mb-8 text-center md:text-left relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-100 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2"></div>
          <div className="w-24 h-24 rounded-full bg-slate-900 text-white flex items-center justify-center text-3xl font-bold shadow-lg shadow-slate-900/20 z-10 shrink-0">
            {user.name?.charAt(0)}
          </div>
          <div className="flex-1 z-10">
             <div className="inline-block px-3 py-1 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-[10px] font-black uppercase tracking-widest rounded-md mb-3 shadow-sm">
               {user.workerSegment?.replace('_', ' ')}
             </div>
             <h1 className="text-3xl font-black font-outfit text-slate-900">{user.name}</h1>
             <p className="text-slate-500 font-bold mt-1 tracking-wide">{user.phone}</p>
          </div>
          <button onClick={enablePush} className="px-5 py-3 bg-slate-100 text-slate-700 border border-slate-200 rounded-xl font-bold hover:bg-slate-200 transition shadow-sm flex items-center gap-2 text-sm z-10">
            <BellRing size={18} className="text-orange-500"/> Enable Push Alerts
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm space-y-8 relative overflow-hidden">
          
          {/* Location */}
          <section className="relative z-10">
            <h3 className="text-lg font-black font-outfit text-slate-900 mb-4 flex items-center gap-2"><MapPin size={22} className="text-orange-500"/> Working Location</h3>
            {form.location ? (
               <div className="flex justify-between items-center p-4 bg-emerald-50 rounded-xl border border-emerald-100 shadow-sm">
                 <span className="font-bold text-emerald-900 text-sm truncate max-w-sm flex items-center gap-2"><MapPin size={16}/> {form.location.address}</span>
                 <button type="button" onClick={handleLocation} className="text-xs font-black text-emerald-700 hover:text-emerald-900 uppercase tracking-widest bg-white px-3 py-1.5 rounded-lg shadow-sm border border-emerald-200">Update GPS</button>
               </div>
            ) : (
               <button type="button" onClick={handleLocation} className="w-full py-4 bg-slate-50 border-2 border-dashed border-slate-300 hover:border-slate-400 hover:bg-slate-100 text-slate-600 font-bold rounded-xl transition flex items-center justify-center gap-2">
                 <MapPin size={18}/> Detect My GPS Location
               </button>
            )}
          </section>

          {/* Skills */}
          <section className="relative z-10">
            <h3 className="text-lg font-black font-outfit text-slate-900 mb-4 flex items-center gap-2"><User size={22} className="text-orange-500"/> Core Skills</h3>
            <input type="text" value={form.skills} onChange={e => setForm({...form, skills: e.target.value})} placeholder="e.g. Graphic Design, Next.js, Accounting" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none font-medium text-slate-900" />
            <p className="text-xs text-slate-500 mt-2 font-semibold">Separate multiple skills with commas. Our AI matches jobs based on these keywords.</p>
          </section>

          {/* Preferences */}
          <section className="border-t border-slate-100 pt-8 relative z-10">
            <h3 className="text-lg font-black font-outfit text-slate-900 mb-4 flex items-center gap-2"><IndianRupee size={22} className="text-orange-500"/> Expected Pay & Availability</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
               {(user.workerSegment === 'part_time' || user.workerSegment === 'daily_gig') && (
                 <div>
                   <label className="text-sm font-bold text-slate-700 block mb-2">Expected Daily Rate (₹)</label>
                   <input type="number" value={form.dailyRate} onChange={e => setForm({...form, dailyRate: e.target.value})} placeholder="800" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none font-medium text-lg text-slate-900" />
                 </div>
               )}
               {user.workerSegment === 'full_time' && (
                 <div>
                   <label className="text-sm font-bold text-slate-700 block mb-2">Expected Monthly Salary (₹)</label>
                   <input type="number" value={form.monthlyRate} onChange={e => setForm({...form, monthlyRate: e.target.value})} placeholder="25000" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none font-medium text-lg text-slate-900" />
                 </div>
               )}
            </div>

             {user.workerSegment === 'part_time' && (
              <div className="mt-8">
                 <label className="text-sm font-bold text-slate-700 block mb-3">Available Working Days</label>
                 <div className="flex flex-wrap gap-2">
                   {weekDays.map(day => (
                     <button type="button" key={day} onClick={() => handleDaySelect(day)} className={`px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider border-2 transition-all ${form.availableDays.includes(day) ? 'bg-orange-50 text-orange-700 border-orange-500 shadow-sm shadow-orange-500/10' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'}`}>
                       {day}
                     </button>
                   ))}
                 </div>
              </div>
            )}
          </section>

          {/* Portfolio Photos Upload */}
          <section className="border-t border-slate-100 pt-8 relative z-10">
            <h3 className="text-lg font-black font-outfit text-slate-900 mb-4 flex items-center gap-2">
              <span className="text-orange-500">📸</span> Previous Work Photos
            </h3>
            <p className="text-sm text-slate-500 mb-4 font-medium">Upload photos of your past jobs to build trust with Hirers. (Max 2MB each)</p>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
              {form.portfolioPhotos.map((photo, i) => (
                <div key={i} className="relative aspect-square rounded-2xl border border-slate-200 shadow-sm overflow-hidden group">
                   <img src={photo} alt="Work" className="w-full h-full object-cover" />
                   <button 
                     type="button" 
                     onClick={() => removePhoto(i)}
                     className="absolute top-2 right-2 w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition shadow-md"
                   >
                     ✕
                   </button>
                </div>
              ))}
              
              <label className="aspect-square rounded-2xl border-2 border-dashed border-slate-300 hover:border-orange-500 hover:bg-orange-50 transition flex flex-col items-center justify-center cursor-pointer text-slate-500 hover:text-orange-600">
                <span className="text-3xl mb-1">+</span>
                <span className="text-xs font-bold uppercase tracking-wider">Add Photo</span>
                <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
              </label>
            </div>
          </section>

          {/* Submit */}
          <div className="pt-4 relative z-10">
             <button type="submit" disabled={saving} className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white text-lg font-black tracking-wide rounded-xl shadow-lg transition flex justify-center items-center gap-2">
               {saving ? 'Saving...' : 'SAVE MY PREFERENCES' } <Save size={20}/>
             </button>
          </div>

        </form>
      </div>
    </div>
  );
}
