import { Bot, Mic, CheckCircle2, User, Clock } from "lucide-react";

export default function TelegramDemo() {
  return (
    <div className="w-full max-w-sm mx-auto bg-[#E5E5E5] rounded-[2rem] shadow-2xl overflow-hidden border-8 border-slate-800 relative">
      {/* Phone Header */}
      <div className="bg-slate-800 text-white px-6 py-4 flex items-center gap-4 shadow-md z-10 relative">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shrink-0">
          <Bot size={24} className="text-white" />
        </div>
        <div>
          <h4 className="font-bold text-base leading-tight">KaamSetu Bot</h4>
          <p className="text-blue-200 text-xs">bot</p>
        </div>
      </div>

      {/* Chat Area */}
      <div className="p-4 space-y-4 h-[420px] overflow-y-auto bg-[url('https://web.telegram.org/a/chat-bg-pattern-light.png')] bg-cover relative">
        <div className="absolute inset-0 bg-white/70"></div>
        
        {/* Date bubble */}
        <div className="flex justify-center relative z-10">
          <div className="bg-black/10 text-slate-600 text-[11px] px-3 py-1 rounded-full font-medium">Today</div>
        </div>

        {/* Message from Bot */}
        <div className="flex gap-2 relative z-10">
          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center shrink-0 mt-auto">
             <Bot size={18} className="text-white" />
          </div>
          <div className="bg-white rounded-2xl rounded-bl-sm p-3 shadow-sm max-w-[80%] border border-slate-100">
            <div className="text-slate-800 text-sm whitespace-pre-wrap leading-relaxed">
              🙏 <strong>KaamSetu mein swagat hai!</strong><br/><br/>
              Kaam dhundhne ke liye apna <strong>voice note</strong> bhejein Hindi mein.<br/><br/>
              Bolein: apna naam, kaam (skills), sheher, aur roz ki fees<br/><br/>
              <span className="italic text-slate-600">_Misal: "Mera naam Ramesh hai, main plumber hoon, Faridabad mein rehta hoon, 600 rupaye roz leta hoon"_</span>
            </div>
            <p className="text-slate-400 text-[10px] text-right mt-1">10:00 AM</p>
          </div>
        </div>

        {/* Voice Note from User */}
        <div className="flex justify-end relative z-10">
          <div className="bg-[#E3FDBB] rounded-2xl rounded-br-sm p-2 shadow-sm max-w-[75%] border border-[#c4e98f]">
            <div className="flex items-center gap-3 w-48">
              <button className="w-10 h-10 rounded-full bg-[#3390EC] flex items-center justify-center text-white shrink-0">
                <svg width="14" height="16" viewBox="0 0 14 16" fill="currentColor">
                  <path d="M0 0h3v16H0zM11 0h3v16h-3z"/>
                </svg>
              </button>
              <div className="flex-1">
                {/* Visualizer bars */}
                <div className="flex items-end gap-0.5 h-6 w-full">
                  {[...Array(15)].map((_, i) => (
                    <div key={i} className="w-1 bg-[#4E935B] rounded-full" style={{ height: `${Math.max(20, Math.abs(Math.sin(i * 0.8)) * 100)}%` }}></div>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between mt-1 px-1">
              <span className="text-[#4E935B] text-[11px] font-medium">0:08</span>
              <span className="text-[#4E935B] text-[10px] flex items-center"><CheckCircle2 size={12} className="mr-1"/> 10:02 AM</span>
            </div>
          </div>
        </div>

        {/* Translation processing */}
        <div className="flex gap-2 relative z-10">
          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center shrink-0 mt-auto">
             <Bot size={18} className="text-white" />
          </div>
          <div className="bg-white rounded-2xl rounded-bl-sm p-3 shadow-sm max-w-[80%] border border-slate-100">
             <p className="text-slate-800 text-sm italic">"Mera naam Ramesh hai, main plumber hoon, Faridabad mein rehta hoon, 600 rupaye roz leta hoon."</p>
             <div className="h-px bg-slate-200 my-2"></div>
             <div className="text-slate-800 text-sm whitespace-pre-wrap leading-relaxed">
               ✅ <strong>Profile ban gaya!</strong><br/><br/>
               👤 Ramesh<br/>
               🔧 Skills: Plumber<br/>
               📍 Faridabad<br/>
               💰 ₹600/din<br/><br/>
               Confirm karne ke liye <strong>1</strong> bhejein<br/>
               Cancel karne ke liye <strong>2</strong> bhejein
             </div>
             <p className="text-slate-400 text-[10px] text-right mt-2">10:02 AM</p>
          </div>
        </div>

      </div>

      {/* Input Area */}
      <div className="bg-white px-4 py-3 flex items-center gap-3 relative z-10 border-t border-slate-200">
        <div className="flex-1 bg-slate-100 rounded-full px-4 py-2 text-slate-400 text-sm">Message...</div>
        <button className="w-10 h-10 rounded-full bg-[#3390EC] text-white flex items-center justify-center shrink-0 shadow-sm hover:bg-blue-600 transition">
          <Mic size={20} />
        </button>
      </div>
    </div>
  );
}
