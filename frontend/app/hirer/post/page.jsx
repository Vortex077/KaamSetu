'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, Sparkles, Send, Zap } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../../lib/api';
import { getMyLocation, geocodeAddress } from '../../../lib/location';
import HireTypeSelector from '../../../components/HireTypeSelector';
import FraudWarningBanner from '../../../components/FraudWarningBanner';

export default function PostGigPage() {
  const router = useRouter();
  
  // Core Selection
  const [hireType, setHireType] = useState('daily_gig'); // daily_gig, part_time, full_time
  
  // Raw Input for AI
  const [rawDescription, setRawDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Fraud Data
  const [fraudData, setFraudData] = useState(null);

  // Parsed Output Fields
  const [form, setForm] = useState({
    title: '',
    description: '',
    skillsRequired: [],
    payPerDay: '',
    duration: '',
    daysPerWeek: '',
    monthlyRate: '',
    location: null,
  });

  // Location State
  const [manualAddress, setManualAddress] = useState('');
  const [locating, setLocating] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // --- Location Handlers ---
  const handleGetLocation = async () => {
    setLocating(true);
    try {
      const pos = await getMyLocation(); 
      setForm({ ...form, location: { type: 'Point', coordinates: [pos.lng, pos.lat], address: 'GPS Location', city: 'Detected City' } });
      toast.success('Location detected!');
    } catch (err) {
      toast.error('Could not get GPS. Please type your address.');
    } finally {
      setLocating(false);
    }
  };

  const handleManualLocation = async () => {
    if (!manualAddress) return toast.error('Enter an address first');
    setLocating(true);
    try {
      const geo = await geocodeAddress(manualAddress);
      setForm({ ...form, location: { type: 'Point', coordinates: [geo.lng, geo.lat], address: geo.displayName, city: geo.displayName.split(',')[0]} });
      toast.success('Location locked in map database!');
    } catch (err) {
      toast.error('Could not find that address on the map.');
    } finally {
      setLocating(false);
    }
  };

  // --- AI Generation ---
  const handleGenerate = async () => {
    if (!rawDescription) return toast.error('Please describe the job first');
    
    // Check required pay fields before generating so AI can validate them against guidelines
    const payload = {
      description: rawDescription,
      hireType,
      payPerDay: form.payPerDay ? Number(form.payPerDay) : undefined,
      duration: form.duration ? Number(form.duration) : undefined,
      daysPerWeek: form.daysPerWeek ? Number(form.daysPerWeek) : undefined,
      monthlyRate: form.monthlyRate ? Number(form.monthlyRate) : undefined,
    };

    setIsGenerating(true);
    setFraudData(null);
    try {
      const { data } = await api.post('/api/gigs/generate', payload);
      const res = data.data; 
      
      setForm(prev => ({
         ...prev,
         title: res.title,
         description: res.description,
         skillsRequired: res.skillsRequired || [],
      }));

      if (res.fraudCheck) {
        setFraudData(res.fraudCheck);
      }
      toast.success('Generated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'AI generation failed');
    } finally {
      setIsGenerating(false);
    }
  };

  // --- Form Submission ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.location) return toast.error('Please set the gig location using GPS or Search');
    
    setSubmitting(true);
    try {
      const payload = {
        title: form.title,
        description: form.description,
        skillsRequired: form.skillsRequired,
        location: form.location,
        hireType,
        payPerDay: form.payPerDay ? Number(form.payPerDay) : undefined,
        duration: form.duration ? Number(form.duration) : undefined,
        daysPerWeek: form.daysPerWeek ? Number(form.daysPerWeek) : undefined,
        monthlyRate: form.monthlyRate ? Number(form.monthlyRate) : undefined,
      };

      const { data } = await api.post('/api/gigs', payload);
      toast.success('Gig posted!');
      
      const gigId = data.data._id || data.data.gig._id;
      if (hireType === 'daily_gig') {
        router.push(`/hirer/matches/${gigId}`);
      } else {
        router.push('/hirer/manage');
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to post gig');
    } finally {
      setSubmitting(false);
    }
  };

  const isHighRisk = fraudData?.riskLevel === 'high';

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 font-inter">
      <div className="max-w-3xl mx-auto border border-slate-200 bg-slate-50 p-6 rounded-3xl shadow-sm">
        <h1 className="text-3xl font-extrabold font-outfit text-slate-900 mb-2">Post a New Gig</h1>
        <p className="text-slate-600 mb-8 border-b border-slate-200 pb-4">Let our AI structure your job posting and find the perfect match.</p>

        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Step 1: Hire Type */}
          <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="text-xl font-bold font-outfit text-slate-900 mb-4">1. What type of hire?</h2>
            <HireTypeSelector value={hireType} onChange={setHireType} />
            
            <div className="mt-6 grid grid-cols-2 gap-4 border-t border-slate-100 pt-6">
              {hireType !== 'full_time' && (
                <div>
                  <label className="text-sm font-semibold text-slate-700 block mb-1">Pay per Day (₹)</label>
                  <input type="number" required value={form.payPerDay} onChange={e => setForm({...form, payPerDay: e.target.value})} className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none text-slate-900" min="100" />
                </div>
              )}
              {hireType === 'daily_gig' && (
                <div>
                  <label className="text-sm font-semibold text-slate-700 block mb-1">Duration (Days)</label>
                  <input type="number" required value={form.duration} onChange={e => setForm({...form, duration: e.target.value})} className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none text-slate-900" min="1" max="14" />
                </div>
              )}
              {hireType === 'part_time' && (
                <div>
                  <label className="text-sm font-semibold text-slate-700 block mb-1">Days per Week</label>
                  <input type="number" required value={form.daysPerWeek} onChange={e => setForm({...form, daysPerWeek: e.target.value})} className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none text-slate-900" min="1" max="6" />
                </div>
              )}
              {hireType === 'full_time' && (
                <div>
                  <label className="text-sm font-semibold text-slate-700 block mb-1">Monthly Salary (₹)</label>
                  <input type="number" required value={form.monthlyRate} onChange={e => setForm({...form, monthlyRate: e.target.value})} className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none text-slate-900" min="5000" />
                </div>
              )}
            </div>
          </section>

          {/* Step 2: Description & AI */}
          <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex justify-between items-center mb-4">
               <h2 className="text-xl font-bold font-outfit text-slate-900">2. Describe the Job</h2>
            </div>
            <textarea 
              rows="4" 
              placeholder="e.g. Need an electrician to fix shop wiring and install MCB. Bring own tools..."
              className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none resize-none mb-4"
              value={rawDescription}
              onChange={e => setRawDescription(e.target.value)}
            />
            <button 
              type="button" 
              onClick={handleGenerate} 
              disabled={isGenerating || !rawDescription}
              className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isGenerating ? <Zap className="animate-pulse" /> : <Sparkles size={20} />}
              {isGenerating ? 'AI is drafting...' : 'Generate with Gemini AI'}
            </button>

            <FraudWarningBanner {...fraudData} />

            {/* Generated Outputs */}
            {form.title && (
              <div className="mt-8 space-y-4 animate-in fade-in slide-in-from-top-4 border-t border-slate-100 pt-6">
                <div className="bg-orange-50 px-3 py-1.5 text-orange-700 text-xs font-bold rounded-full inline-block mb-2 shadow-sm border border-orange-100"><Sparkles size={12} className="inline mr-1" /> AI Generated Details:</div>
                <div>
                  <label className="text-sm font-semibold text-slate-700 block mb-1">Gig Title</label>
                  <input type="text" value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none font-medium bg-orange-50/30 text-slate-900" />
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700 block mb-1">Refined Description</label>
                  <textarea rows="3" value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none resize-none bg-orange-50/30 text-slate-900" />
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700 block mb-1">Skills Needed (AI Extracted)</label>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {form.skillsRequired.map((skill, idx) => (
                      <span key={idx} className="bg-slate-800 border border-slate-900 px-3 py-1 rounded-full text-xs font-semibold text-white tracking-wide">{skill.toUpperCase()}</span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* Step 3: Location */}
          <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="text-xl font-bold font-outfit text-slate-900 mb-4">3. Where is the gig?</h2>
            
            {form.location ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3">
                <MapPin className="text-emerald-500" />
                <div>
                  <p className="font-bold text-emerald-900">Location Locked</p>
                  <p className="text-sm text-emerald-700">{form.location.address}</p>
                </div>
                <button type="button" onClick={() => setForm({...form, location: null})} className="ml-auto text-sm font-bold text-emerald-600 hover:text-emerald-800 bg-white px-3 py-1 rounded-lg border border-emerald-200 shadow-sm">Change</button>
              </div>
            ) : (
              <div className="space-y-4">
                <button type="button" onClick={handleGetLocation} disabled={locating} className="w-full py-4 bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold rounded-xl flex items-center justify-center gap-2 transition shadow-sm border border-slate-200">
                  <MapPin size={18}/> {locating ? 'Detecting GPS...' : 'Use My Current Location'}
                </button>
                <div className="flex items-center gap-4 text-slate-400 text-sm font-medium">
                  <div className="h-px bg-slate-200 flex-1"></div>
                  OR
                  <div className="h-px bg-slate-200 flex-1"></div>
                </div>
                <div className="flex gap-2">
                  <input type="text" placeholder="Enter landmark or address manually" value={manualAddress} autoFocus={false} onChange={e => setManualAddress(e.target.value)} className="flex-1 px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none text-slate-900" />
                  <button type="button" onClick={handleManualLocation} disabled={locating} className="px-6 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl transition shadow-md">Find</button>
                </div>
              </div>
            )}
          </section>

          {/* Post Button */}
          <button 
             type="submit" 
             disabled={submitting || isHighRisk || !form.title || !form.location}
             className="w-full py-5 bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white rounded-2xl font-bold text-xl shadow-xl shadow-orange-500/30 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:grayscale"
          >
             {submitting ? 'Posting Gig...' : 'Post Gig Securely'} <Send size={20} />
          </button>

        </form>
      </div>
    </div>
  );
}
