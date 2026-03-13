import Navbar from "../components/Navbar";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-orange-600/10 to-amber-500/10" />
        <div className="relative max-w-7xl mx-auto px-4 py-20 sm:py-32">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-4 py-1.5 rounded-full text-sm font-medium mb-6 animate-pulse">
              <span>🚀</span> AI-Powered • HackIndia EIT 2026
            </div>
            <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight text-gray-900 leading-tight">
              Connecting <span className="bg-gradient-to-r from-orange-600 to-amber-500 bg-clip-text text-transparent">Workers</span> to{" "}
              <span className="bg-gradient-to-r from-orange-600 to-amber-500 bg-clip-text text-transparent">Opportunities</span>
            </h1>
            <p className="mt-6 text-xl sm:text-2xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              The <strong>Uber for daily wage workers</strong>. AI-matched gigs, voice registration in Hindi, instant payments — all hyperlocal.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <a href="/auth/register"
                className="group px-8 py-4 bg-gradient-to-r from-orange-600 to-amber-500 text-white text-lg font-semibold rounded-2xl shadow-lg shadow-orange-500/25 hover:shadow-xl hover:shadow-orange-500/40 transition-all duration-300 transform hover:-translate-y-1">
                Get Started Free
                <span className="ml-2 group-hover:translate-x-1 inline-block transition-transform">→</span>
              </a>
              <a href="#how-it-works"
                className="px-8 py-4 bg-white text-gray-700 text-lg font-semibold rounded-2xl border-2 border-gray-200 hover:border-orange-300 hover:text-orange-600 transition-all duration-300">
                How It Works
              </a>
            </div>
          </div>
        </div>
        {/* Decorative blobs */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-orange-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
        <div className="absolute top-40 right-10 w-72 h-72 bg-amber-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
      </section>

      {/* Stats Bar */}
      <section className="bg-white/80 backdrop-blur-sm border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: "50K+", label: "Workers Registered", icon: "👷" },
            { value: "10K+", label: "Gigs Completed", icon: "✅" },
            { value: "500+", label: "Cities Covered", icon: "🏙️" },
            { value: "< 2min", label: "Avg Match Time", icon: "⚡" },
          ].map((stat) => (
            <div key={stat.label} className="group">
              <div className="text-2xl mb-1">{stat.icon}</div>
              <div className="text-3xl font-extrabold text-gray-900 group-hover:text-orange-600 transition-colors">{stat.value}</div>
              <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900">How KaamSetu Works</h2>
            <p className="mt-3 text-lg text-gray-500">Three simple steps to connect workers and hirers</p>
          </div>
          <div className="grid md:grid-cols-3 gap-10">
            {[
              {
                step: "01",
                title: "Register in Seconds",
                desc: "Workers register via WhatsApp voice note in Hindi — or simply fill a form. Zero app download needed.",
                icon: "🎤",
                color: "from-orange-500 to-red-500",
              },
              {
                step: "02",
                title: "AI Matches Instantly",
                desc: "Our AI engine matches gigs to workers based on skills, distance, rating and availability — ranked by best fit.",
                icon: "🤖",
                color: "from-amber-500 to-orange-500",
              },
              {
                step: "03",
                title: "Work & Get Paid",
                desc: "Escrow payment protects both sides. Workers accept, work, and get paid — all tracked in real-time.",
                icon: "💰",
                color: "from-green-500 to-emerald-500",
              },
            ].map((item) => (
              <div key={item.step}
                className="relative bg-gradient-to-br from-gray-50 to-white rounded-3xl p-8 border border-gray-100 hover:shadow-xl hover:shadow-orange-500/10 transition-all duration-500 group">
                <div className={`absolute -top-5 left-8 w-10 h-10 rounded-xl bg-gradient-to-r ${item.color} flex items-center justify-center text-white text-sm font-bold shadow-lg`}>
                  {item.step}
                </div>
                <div className="text-4xl mt-4 mb-4 group-hover:scale-110 transition-transform duration-300">{item.icon}</div>
                <h3 className="text-xl font-bold text-gray-900">{item.title}</h3>
                <p className="mt-2 text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-gradient-to-b from-white to-orange-50/50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900">Why KaamSetu?</h2>
            <p className="mt-3 text-lg text-gray-500">Built for India's daily-wage workforce</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: "📱", title: "Zero App Download", desc: "Workers register via WhatsApp. No Play Store, no storage issues." },
              { icon: "🗣️", title: "Hindi Voice Registration", desc: "Send a voice note describing your skills — AI extracts everything." },
              { icon: "📍", title: "Hyperlocal Matching", desc: "Find workers within 2-15km using GPS-based geospatial matching." },
              { icon: "🛡️", title: "Escrow Payments", desc: "Money held safely until work is done. Trust built into the system." },
              { icon: "⭐", title: "Rating System", desc: "Both workers and hirers rated. Good work gets more gigs." },
              { icon: "🧠", title: "AI-Powered Everything", desc: "Match scoring, fraud detection, gig suggestions — all AI-driven." },
            ].map((feature) => (
              <div key={feature.title}
                className="bg-white rounded-2xl p-6 border border-gray-100 hover:border-orange-200 hover:shadow-lg transition-all duration-300 group cursor-default">
                <span className="text-3xl group-hover:scale-125 inline-block transition-transform duration-300">{feature.icon}</span>
                <h3 className="mt-3 text-lg font-bold text-gray-900">{feature.title}</h3>
                <p className="mt-1 text-gray-500 text-sm leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* For Workers & Hirers */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 grid lg:grid-cols-2 gap-12">
          {/* Workers */}
          <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-3xl p-10 border border-orange-100">
            <div className="text-3xl mb-4">👷</div>
            <h3 className="text-2xl font-bold text-gray-900">For Workers & Students</h3>
            <ul className="mt-6 space-y-4">
              {[
                "Register via WhatsApp voice note — in Hindi",
                "Get matched to nearby gigs automatically",
                "See pay, distance, and work details upfront",
                "Build your rating and get more opportunities",
                "Guaranteed payment through escrow system",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="mt-0.5 w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold">✓</span>
                  <span className="text-gray-700">{item}</span>
                </li>
              ))}
            </ul>
            <a href="/auth/register" className="mt-8 inline-block px-6 py-3 bg-orange-600 text-white rounded-xl font-semibold hover:bg-orange-700 transition-colors">
              Register as Worker →
            </a>
          </div>
          {/* Hirers */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl p-10 border border-blue-100">
            <div className="text-3xl mb-4">🏢</div>
            <h3 className="text-2xl font-bold text-gray-900">For Hirers</h3>
            <ul className="mt-6 space-y-4">
              {[
                "Post a gig in under 60 seconds",
                "AI ranks workers by skills, proximity & rating",
                "See worker profiles, ratings, and work history",
                "Secure escrow payment — pay only for completed work",
                "Contact revealed only after payment commitment",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="mt-0.5 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold">✓</span>
                  <span className="text-gray-700">{item}</span>
                </li>
              ))}
            </ul>
            <a href="/auth/register" className="mt-8 inline-block px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors">
              Post a Gig →
            </a>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="bg-gradient-to-r from-orange-600 to-amber-500 rounded-3xl p-12 sm:p-16 shadow-2xl shadow-orange-500/20">
            <h2 className="text-3xl sm:text-4xl font-bold text-white">Ready to start?</h2>
            <p className="mt-3 text-orange-100 text-lg max-w-xl mx-auto">
              Join thousands of workers and hirers already using KaamSetu.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <a href="/auth/register"
                className="px-8 py-4 bg-white text-orange-600 font-semibold rounded-2xl hover:bg-orange-50 transition-all shadow-lg">
                Create Account
              </a>
              <a href="/auth/login"
                className="px-8 py-4 bg-orange-700/30 text-white font-semibold rounded-2xl border border-white/30 hover:bg-orange-700/50 transition-all">
                Login
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div>
              <span className="text-2xl font-bold text-white">Kaam<span className="text-orange-500">Setu</span></span>
              <p className="text-sm mt-1">AI-powered hyperlocal job platform for India</p>
            </div>
            <div className="flex gap-8 text-sm">
              <a href="#how-it-works" className="hover:text-orange-400 transition-colors">How It Works</a>
              <a href="/auth/login" className="hover:text-orange-400 transition-colors">Login</a>
              <a href="/auth/register" className="hover:text-orange-400 transition-colors">Register</a>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-xs">
            © 2026 KaamSetu — Built for HackIndia EIT 2026
          </div>
        </div>
      </footer>
    </main>
  );
}
