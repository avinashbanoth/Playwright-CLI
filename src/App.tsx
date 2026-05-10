import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  ShoppingCart, 
  Sparkles, 
  Search, 
  Loader2, 
  ExternalLink,
  Github,
  Moon,
  PackageSearch
} from 'lucide-react';

const COLORS = {
  amazon: '#ff9900',
  midnight: '#0f172a',
  glass: 'rgba(255, 255, 255, 0.03)',
  border: 'rgba(255, 255, 255, 0.1)'
};

const App = () => {
  const [messages, setMessages] = useState([
    { id: 1, text: "Welcome to the future of shopping. I'm your AI Shopping Concierge. What can I find for you today?", isUser: false }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isShoppingMode, setIsShoppingMode] = useState(false);
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input;
    setInput("");
    setMessages(prev => [...prev, { id: Date.now(), text: userMessage, isUser: true }]);
    setIsLoading(true);

    try {
      const response = await fetch('/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage })
      });
      
      const data = await response.json();
      setIsShoppingMode(data.toolTriggered);
      
      setMessages(prev => [...prev, { 
        id: Date.now() + 1, 
        text: data.content, 
        isUser: false, 
        isTool: data.toolTriggered 
      }]);
    } catch (err) {
      setMessages(prev => [...prev, { id: Date.now() + 1, text: "System offline. Please check connectivity.", isUser: false, isError: true }]);
    } finally {
      setIsLoading(false);
      // Reset shopping mode glow after 10 seconds
      if (isShoppingMode) setTimeout(() => setIsShoppingMode(false), 10000);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 font-sans selection:bg-orange-500/30 overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-500/10 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full" />

      {/* Glass Header */}
      <header className="fixed top-0 w-full z-50 backdrop-blur-md border-b border-white/5 bg-slate-950/50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-3 group cursor-pointer">
            <div className="p-2 bg-orange-500 rounded-xl shadow-[0_0_20px_rgba(249,115,22,0.4)] group-hover:scale-110 transition-transform">
              <ShoppingCart className="text-white w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">
              AMZN<span className="text-orange-500 underline decoration-2 underline-offset-4">AI</span>
            </h1>
          </div>

          <div className="flex items-center space-x-6">
            <div className={`flex items-center space-x-2 px-4 py-1.5 rounded-full border transition-all duration-500 ${
              isShoppingMode ? 'border-orange-500 bg-orange-500/10 shadow-[0_0_15px_rgba(249,115,22,0.2)]' : 'border-white/10 bg-white/5'
            }`}>
              <div className={`w-2 h-2 rounded-full ${isShoppingMode ? 'bg-orange-500 animate-pulse' : 'bg-slate-500'}`} />
              <span className={`text-xs font-medium uppercase tracking-widest ${isShoppingMode ? 'text-orange-500' : 'text-slate-400'}`}>
                {isShoppingMode ? 'Shopping Mode Active' : 'Idle'}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Chat Layout */}
      <main className="max-w-4xl mx-auto pt-32 pb-40 px-6 h-screen flex flex-col relative z-10">
        <div className="flex-1 overflow-y-auto pr-2 space-y-8 no-scrollbar">
          <AnimatePresence>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`relative group max-w-[85%] px-6 py-4 rounded-3xl backdrop-blur-sm border transition-all ${
                  msg.isUser 
                    ? 'bg-orange-500 border-orange-400 text-white shadow-[0_10px_30px_rgba(249,115,22,0.2)]' 
                    : 'bg-white/5 border-white/10 text-slate-200'
                }`}>
                  {msg.isTool && (
                    <div className="flex items-center space-x-2 text-orange-400 text-xs font-bold uppercase tracking-tighter mb-2">
                      <Sparkles size={14} />
                      <span>Playwright Automation Triggered</span>
                    </div>
                  )}
                  <p className="leading-relaxed text-[15px]">{msg.text}</p>
                  
                  {/* Subtle timestamp or indicator */}
                  <div className={`absolute -bottom-6 opacity-0 group-hover:opacity-40 transition-opacity text-[10px] uppercase tracking-widest ${msg.isUser ? 'right-2' : 'left-2'}`}>
                    {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </motion.div>
            ))}
            {isLoading && (
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                className="flex justify-start items-center space-x-3 text-slate-500 italic text-sm ml-4"
              >
                <Loader2 className="animate-spin w-4 h-4" />
                <span>Syncing with Llama 3.3...</span>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={chatEndRef} />
        </div>

        {/* Input Dock */}
        <div className="absolute bottom-10 left-6 right-6">
          <form 
            onSubmit={handleSend}
            className="relative flex items-center p-2 bg-slate-900/80 border border-white/10 rounded-[2rem] backdrop-blur-xl shadow-2xl"
          >
            <div className="ml-4 text-slate-500">
              <PackageSearch className={isLoading ? 'animate-bounce text-orange-500' : ''} />
            </div>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Tell me what you're looking for..."
              className="w-full bg-transparent px-6 py-4 outline-none text-slate-100 placeholder:text-slate-600"
            />
            <button
              disabled={isLoading || !input.trim()}
              className="bg-orange-500 hover:bg-orange-600 disabled:bg-slate-800 text-white p-4 rounded-full transition-all active:scale-95 shadow-lg flex items-center justify-center"
            >
              {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : <Send className="w-5 h-5" />}
            </button>
          </form>
          <div className="mt-4 text-center">
             <p className="text-[10px] text-slate-600 uppercase tracking-[0.2em]">
               Enterprise Grade Automation Suite
             </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
