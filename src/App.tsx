import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  ShoppingCart, 
  Sparkles, 
  Loader2, 
  PackageSearch
} from 'lucide-react';

const App = () => {
  const [messages, setMessages] = useState([
    { id: 1, text: "Welcome to the future of shopping. I'm your AI Shopping Concierge. What can I find for you today?", isUser: false }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isShoppingMode, setIsShoppingMode] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (e: React.FormEvent) => {
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
      if (data.toolTriggered) setIsShoppingMode(true);
      
      setMessages(prev => [...prev, { 
        id: Date.now() + 1, 
        text: data.content, 
        isUser: false, 
        isTool: data.toolTriggered 
      }]);
    } catch (err) {
      setMessages(prev => [...prev, { id: Date.now() + 1, text: "System offline. Please check connectivity.", isUser: false }]);
    } finally {
      setIsLoading(false);
      setTimeout(() => setIsShoppingMode(false), 8000);
    }
  };

  return (
    <div className="flex flex-col h-screen w-full bg-[#020617] text-slate-200 font-sans overflow-hidden relative">
      
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none" />

      {/* Header */}
      <header className="w-full flex-shrink-0 z-50 backdrop-blur-md border-b border-white/5 bg-slate-950/50 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3 group">
            <div className="p-2 bg-orange-500 rounded-xl shadow-[0_0_20px_rgba(249,115,22,0.4)] transition-transform">
              <ShoppingCart className="text-white w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">
              AMZN<span className="text-orange-500">AI</span>
            </h1>
          </div>

          <div className={`flex items-center space-x-2 px-4 py-1.5 rounded-full border transition-all duration-500 ${
            isShoppingMode ? 'border-orange-500 bg-orange-500/10' : 'border-white/10 bg-white/5'
          }`}>
            <div className={`w-2 h-2 rounded-full ${isShoppingMode ? 'bg-orange-500 animate-pulse' : 'bg-slate-500'}`} />
            <span className={`text-[10px] font-bold uppercase tracking-widest ${isShoppingMode ? 'text-orange-500' : 'text-slate-400'}`}>
              {isShoppingMode ? 'Shopping Mode Active' : 'Assistant Idle'}
            </span>
          </div>
        </div>
      </header>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto w-full max-w-4xl mx-auto px-6 py-8 space-y-6 scrollbar-hide">
        <AnimatePresence>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[85%] px-5 py-3.5 rounded-2xl border ${
                msg.isUser 
                  ? 'bg-orange-600 border-orange-500 text-white shadow-lg' 
                  : 'bg-white/5 border-white/10 text-slate-200'
              }`}>
                {msg.isTool && (
                  <div className="flex items-center space-x-2 text-orange-400 text-[10px] font-black uppercase mb-1">
                    <Sparkles size={12} />
                    <span>Playwright Automation</span>
                  </div>
                )}
                <p className="text-sm leading-relaxed">{msg.text}</p>
              </div>
            </motion.div>
          ))}
          {isLoading && (
            <div className="flex justify-start items-center space-x-2 text-slate-500 text-xs ml-2">
              <Loader2 className="animate-spin w-3 h-3" />
              <span>Thinking...</span>
            </div>
          )}
        </AnimatePresence>
        <div ref={chatEndRef} className="h-4 w-full" />
      </div>

      {/* Input Area */}
      <div className="w-full max-w-4xl mx-auto p-6 flex-shrink-0">
        <form 
          onSubmit={handleSend}
          className="relative flex items-center p-1.5 bg-slate-900 border border-white/10 rounded-full shadow-2xl"
        >
          <div className="ml-4 text-slate-500">
            <PackageSearch size={20} className={isLoading ? 'animate-bounce text-orange-500' : ''} />
          </div>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Find me an iPhone 16..."
            className="flex-1 bg-transparent px-4 py-3 outline-none text-sm text-slate-100 placeholder:text-slate-600"
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="bg-orange-500 hover:bg-orange-600 disabled:bg-slate-800 text-white p-3.5 rounded-full transition-all flex items-center justify-center"
          >
            {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : <Send size={18} />}
          </button>
        </form>
      </div>
    </div>
  );
};

export default App;
