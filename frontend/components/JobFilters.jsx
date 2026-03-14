export default function JobFilters({ filters, setFilters, applyFilters }) {
  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6 sticky top-24">
      <h3 className="text-xl font-bold font-outfit text-slate-900 border-b border-slate-100 pb-3">Job Filters</h3>
      
      <div>
        <label className="text-sm font-bold text-slate-700 block mb-2">Job Type</label>
        <select 
           value={filters.hireType || ''} 
           onChange={e => setFilters({...filters, hireType: e.target.value})} 
           className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-orange-500 font-medium text-slate-900" 
        >
           <option value="">Any</option>
           <option value="part_time">Part-Time</option>
           <option value="full_time">Full-Time</option>
        </select>
      </div>

      <div>
        <label className="text-sm font-bold text-slate-700 block mb-3">Maximum Distance</label>
        <input 
           type="range" min="1" max="50" 
           value={filters.maxDist} 
           onChange={e => setFilters({...filters, maxDist: e.target.value})} 
           className="w-full accent-orange-600 appearance-none h-2 bg-slate-100 rounded-full" 
        />
        <div className="flex justify-between items-center mt-2">
           <span className="text-xs font-bold text-slate-400">1km</span>
           <span className="text-xs font-bold bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">{filters.maxDist} km away</span>
           <span className="text-xs font-bold text-slate-400">50km</span>
        </div>
      </div>
      
      <div>
        <label className="text-sm font-bold text-slate-700 block mb-2">Minimum Pay (₹)</label>
        <input 
           type="number" placeholder="800" 
           value={filters.minPay} 
           onChange={e => setFilters({...filters, minPay: e.target.value})} 
           className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-orange-500 font-medium text-slate-900" 
        />
      </div>
      
      <div>
        <label className="text-sm font-bold text-slate-700 block mb-2">Skill Keyword</label>
        <input 
           type="text" placeholder="e.g. Sales, Delivery" 
           value={filters.skill} 
           onChange={e => setFilters({...filters, skill: e.target.value})} 
           className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-orange-500 font-medium text-slate-900" 
        />
      </div>

      <button onClick={applyFilters} className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-black uppercase tracking-wider text-sm rounded-xl shadow-md mt-4 transition-all">
        Update Results
      </button>
    </div>
  );
}
