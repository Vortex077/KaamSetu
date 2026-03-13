'use client';
import { useState, useEffect } from 'react';
import { Loader2, SlidersHorizontal } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../../lib/api';
import JobFilters from '../../../components/JobFilters';
import GigCard from '../../../components/GigCard';
import { getMyLocation, geocodeAddress } from '../../../lib/location';

export default function BrowseJobsPage() {
  const [gigs, setGigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ maxDist: 10, minPay: '', skill: '', lat: '', lng: '' });
  const [appliedJobs, setAppliedJobs] = useState(new Set());

  useEffect(() => {
    initLocationAndFetch();
  }, []);

  const initLocationAndFetch = async () => {
    try {
       const user = JSON.parse(localStorage.getItem('kaamsetu_user'));
       let useLat = '';
       let useLng = '';

       if (user?.location?.coordinates) {
          useLng = user.location.coordinates[0];
          useLat = user.location.coordinates[1];
       } else {
          try {
            const pos = await getMyLocation();
            useLat = pos.lat;
            useLng = pos.lng;
          } catch(e) {}
       }

       const newFilters = { ...filters, lat: useLat, lng: useLng };
       setFilters(newFilters);
       fetchGigs(newFilters);
    } catch(err) {
      fetchGigs(filters);
    }
  };

  const fetchGigs = async (activeFilters = filters) => {
    setLoading(true);
    try {
       const params = new URLSearchParams();
       if (activeFilters.lat) { params.append('lat', activeFilters.lat); params.append('lng', activeFilters.lng); params.append('maxDist', activeFilters.maxDist); }
       if (activeFilters.minPay) params.append('minPay', activeFilters.minPay);
       if (activeFilters.skill) params.append('skill', activeFilters.skill);

       const { data } = await api.get(`/api/gigs/browse?${params.toString()}`);
       
       // Filter out daily_gig because they use telegram
       setGigs(data.data.filter(g => g.hireType !== 'daily_gig'));
       
       // Map already applied jobs explicitly
       try {
         const appsRes = await api.get('/api/applications/my-applications');
         const appliedIds = appsRes.data.data.map(app => app.gigId._id || app.gigId);
         setAppliedJobs(new Set(appliedIds));
       } catch(e) {}
    } catch(err) {
       toast.error('Failed to load active jobs for your area');
    } finally {
       setLoading(false);
    }
  };

  const handleApply = async (gig) => {
    try {
       await api.post('/api/applications', { gigId: gig._id, coverNote: 'I am highly interested in this role and match the required skills.' });
       setAppliedJobs(prev => new Set(prev).add(gig._id));
       toast.success('Successfully applied! The hirer has been notified.');
    } catch(err) {
       toast.error(err.response?.data?.error || 'Failed to submit application.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 font-inter">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 bg-white border border-slate-200 p-8 rounded-3xl shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-100 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2"></div>
          <h1 className="text-3xl lg:text-5xl font-black font-outfit text-slate-900 leading-tight relative z-10">Job Board</h1>
          <p className="text-slate-500 mt-2 font-bold tracking-wide relative z-10">Find part-time and full-time opportunities dynamically generated for your skills in your neighborhood.</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          <div className="w-full lg:w-80 shrink-0">
             <JobFilters filters={filters} setFilters={setFilters} applyFilters={() => fetchGigs()} />
          </div>

          <div className="flex-1 w-full">
             {loading ? (
                <div className="flex flex-col items-center justify-center py-32 bg-white rounded-3xl border border-slate-200 shadow-sm"><Loader2 className="animate-spin text-orange-500 mb-4" size={48}/> <span className="font-extrabold tracking-widest text-slate-400 uppercase text-sm mt-4">Scanning AI Matches...</span></div>
             ) : gigs.length === 0 ? (
                <div className="bg-white rounded-3xl p-16 text-center shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                  <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-6 border-2 border-slate-100">
                    <SlidersHorizontal size={32} className="text-slate-300"/>
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 mb-2 font-outfit">No jobs match your criteria</h3>
                  <p className="text-slate-500 font-medium tracking-wide">Try adjusting your filters, clearing keywords, or expanding the search radius on the left sidebar.</p>
                </div>
             ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {gigs.map(gig => (
                    <GigCard key={gig._id} gig={gig} onApply={handleApply} applied={appliedJobs.has(gig._id)} />
                  ))}
                </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
}
