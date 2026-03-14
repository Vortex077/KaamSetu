'use client';
import Link from "next/link";
import { ArrowRight, CheckCircle2, Bot, Zap, ShieldCheck } from "lucide-react";
import TelegramDemo from "../components/TelegramDemo";

export default function LandingPage() {
  return (
    <div className="bg-slate-50 min-h-screen font-inter">
      {/* HERO SECTION */}
      <section className="relative pt-20 pb-32 overflow-hidden bg-slate-900 text-white">
        <div className="absolute inset-0 z-0">
          {/* <img 
            src="/hero-image.jpg" 
            alt="" 
            className="w-full h-full object-cover opacity-30 mix-blend-overlay"
            onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1596422846543-75c6af282bb2?q=80&w=2000&auto=format&fit=crop"; }}
          /> */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 relative z-10 text-center mt-12">
          <h1 className="text-5xl md:text-7xl font-extrabold font-outfit tracking-tight mb-6">
            Bridging <span className="text-orange-500">Skills</span><br />
            With Opportunities
          </h1>
          <p className="text-lg md:text-2xl text-slate-300 max-w-3xl mx-auto mb-10">
            India's first AI-powered hyperlocal platform connecting 50 Crore informal workers to businesses—instantly, securely, and fairly.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <Link href="/auth/register?role=worker" className="px-8 py-4 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-semibold text-lg transition shadow-lg shadow-orange-500/30 flex items-center gap-2 w-full sm:w-auto justify-center">
              Register as Worker <ArrowRight size={20} />
            </Link>
            <Link href="/hirer/post" className="px-8 py-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-semibold text-lg transition flex items-center gap-2 w-full sm:w-auto justify-center">
              Post a Job <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </section>

      {/* STATS STRIP */}
      <section className="bg-orange-600 py-8 text-white">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-orange-400">
          <div className="pt-4 md:pt-0">
            <div className="text-4xl font-bold font-outfit">500M+</div>
            <div className="text-orange-100 mt-1 font-medium">Informal Workers</div>
          </div>
          <div className="pt-4 md:pt-0">
            <div className="text-4xl font-bold font-outfit">0</div>
            <div className="text-orange-100 mt-1 font-medium">Digital Platforms Before Today</div>
          </div>
          <div className="pt-4 md:pt-0">
            <div className="text-4xl font-bold font-outfit">&lt; 50ms</div>
            <div className="text-orange-100 mt-1 font-medium">AI Match Speed</div>
          </div>
        </div>
      </section>

      {/* SEGMENTS EXPLAINED */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold font-outfit text-slate-900 mb-4">Empowering Every Indian</h2>
            <p className="text-xl text-slate-600">Tailored experiences for whatever way you work.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Daily Wage */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8 hover:shadow-xl transition-shadow relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-1 bg-orange-500 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform"></div>
              <div className="w-14 h-14 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600 mb-6">
                <Bot size={28} />
              </div>
              <h3 className="text-2xl font-bold font-outfit text-slate-900 mb-3">Daily Wage Workers</h3>
              <p className="text-slate-600 mb-6 font-medium">For laborers, plumbers, and daily earners. Zero literacy required.</p>
              <ul className="space-y-3 text-slate-600">
                <li className="flex gap-2 items-start"><CheckCircle2 className="text-emerald-500 mt-0.5 shrink-0" size={18} /> Call our Telegram Bot.</li>
                <li className="flex gap-2 items-start"><CheckCircle2 className="text-emerald-500 mt-0.5 shrink-0" size={18} /> Speak your name and skills in Hindi.</li>
                <li className="flex gap-2 items-start"><CheckCircle2 className="text-emerald-500 mt-0.5 shrink-0" size={18} /> Receive job alerts automatically.</li>
              </ul>
              <a href="https://t.me/kaamsetu_bot" target="_blank" rel="noreferrer" className="mt-8 block w-full py-3 bg-slate-900 text-white text-center rounded-lg font-medium hover:bg-slate-800 transition">Open Telegram Bot</a>
            </div>

            {/* Part Time */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8 hover:shadow-xl transition-shadow relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-1 bg-blue-500 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform"></div>
              <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 mb-6">
                <ShieldCheck size={28} />
              </div>
              <h3 className="text-2xl font-bold font-outfit text-slate-900 mb-3">Student & Part-Time</h3>
              <p className="text-slate-600 mb-6 font-medium">For students and those looking for gig work on weekends.</p>
              <ul className="space-y-3 text-slate-600">
                <li className="flex gap-2 items-start"><CheckCircle2 className="text-emerald-500 mt-0.5 shrink-0" size={18} /> Register on the web app.</li>
                <li className="flex gap-2 items-start"><CheckCircle2 className="text-emerald-500 mt-0.5 shrink-0" size={18} /> Set specific availability days.</li>
                <li className="flex gap-2 items-start"><CheckCircle2 className="text-emerald-500 mt-0.5 shrink-0" size={18} /> Get push notifications for shifts.</li>
              </ul>
              <Link href="/auth/register?role=worker&segment=part_time" className="mt-8 block w-full py-3 border-2 border-slate-200 text-slate-700 text-center rounded-lg font-medium hover:border-slate-300 hover:bg-slate-100 transition">Register as Student</Link>
            </div>

            {/* Full Time */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8 hover:shadow-xl transition-shadow relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform"></div>
              <div className="w-14 h-14 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-600 mb-6">
                <Zap size={28} />
              </div>
              <h3 className="text-2xl font-bold font-outfit text-slate-900 mb-3">Full-Time Seekers</h3>
              <p className="text-slate-600 mb-6 font-medium">For educated professionals looking for stable, long-term employment.</p>
              <ul className="space-y-3 text-slate-600">
                <li className="flex gap-2 items-start"><CheckCircle2 className="text-emerald-500 mt-0.5 shrink-0" size={18} /> Create a rich digital profile.</li>
                <li className="flex gap-2 items-start"><CheckCircle2 className="text-emerald-500 mt-0.5 shrink-0" size={18} /> Browse filtered job boards.</li>
                <li className="flex gap-2 items-start"><CheckCircle2 className="text-emerald-500 mt-0.5 shrink-0" size={18} /> Apply instantly with a cover note.</li>
              </ul>
              <Link href="/auth/register?role=worker&segment=full_time" className="mt-8 block w-full py-3 border-2 border-slate-200 text-slate-700 text-center rounded-lg font-medium hover:border-slate-300 hover:bg-slate-100 transition">Register Full-Time</Link>
            </div>
          </div>
        </div>
      </section>

      {/* TELEGRAM DEMO & HOW HIRERS WORK */}
      <section className="py-24 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-block px-4 py-1.5 bg-orange-100 text-orange-700 font-semibold rounded-full mb-6">For Daily Workers</div>
            <h2 className="text-3xl md:text-5xl font-bold font-outfit text-slate-900 mb-6">Zero Literacy Required. Voice-First AI Onboarding.</h2>
            <p className="text-lg text-slate-600 mb-8 leading-relaxed">
              We bypass the digital divide entirely. Segment A workers interact with KaamSetu entirely through a Telegram Voice Bot powered by Gemini Whisper. They just speak, and we build their profile.
            </p>
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xl shrink-0">1</div>
                <div>
                  <h4 className="text-xl font-bold text-slate-900">Send a Voice Note</h4>
                  <p className="text-slate-600">"Mera naam Suresh hai, main 5 saal se electrician hoon aur Karol Bagh mein rehta hoon."</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xl shrink-0">2</div>
                <div>
                  <h4 className="text-xl font-bold text-slate-900">AI Transcription & Structuring</h4>
                  <p className="text-slate-600">Gemini translates the Hindi voice note, extracts skills (Electrician), and geocodes the location.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-full bg-orange-500 text-white flex items-center justify-center font-bold text-xl shrink-0">3</div>
                <div>
                  <h4 className="text-xl font-bold text-slate-900">Get Hired Instantly</h4>
                  <p className="text-slate-600">When a match occurs, the bot pings them. "Aapko ₹800 ka kaam mila hai. Accept karein?"</p>
                </div>
              </div>
            </div>
          </div>
          <div className="relative">
            {/* Soft background glow */}
            <div className="absolute inset-0 bg-blue-500 blur-3xl opacity-20 transform -rotate-6 rounded-full"></div>
            <TelegramDemo />
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-6">
             <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-orange-500">
               <path d="M22 20V8h-2L6.42 13.78A2 2 0 0 1 5 14H2v6h2v-4h4v4h2v-4h6v4h2v-4h4v4Z"/>
               <path d="M10 16v-4"/>
               <path d="M14 16v-4"/>
             </svg>
             <span className="text-2xl font-extrabold tracking-tight font-outfit text-white">
               <span className="text-orange-500">Kaam</span>Setu
             </span>
          </div>
          <p className="mb-6 max-w-md mx-auto">Built for HackIndia EIT 2026. Empowering India's informal workforce.</p>
          <div className="text-sm">
            © KaamSetu. Bridging Skills with Opportunities.
          </div>
        </div>
      </footer>
    </div>
  );
}
