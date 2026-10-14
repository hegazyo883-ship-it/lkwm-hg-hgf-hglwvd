import { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, Trash2, Bot, User } from 'lucide-react';
import { generateResponse } from '@/lib/gemini';
import { getChatHistory, setChatHistory, clearChatHistory } from '@/lib/storage';
import type { ChatMessage } from '@/lib/types';

export function AIChat() {
  const [messages, setMessages] = useState<ChatMessage[]>(() => getChatHistory());
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg: ChatMessage = {
      role: 'user',
      content: input.trim(),
      timestamp: Date.now(),
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    const response = await generateResponse(userMsg.content, newMessages);

    const modelMsg: ChatMessage = {
      role: 'model',
      content: response,
      timestamp: Date.now(),
    };

    const updated = [...newMessages, modelMsg];
    setMessages(updated);
    setChatHistory(updated);
    setLoading(false);
  };

  const handleClear = () => {
    setMessages([]);
    clearChatHistory();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-7rem)] lg:h-[calc(100vh-3rem)]">
      {/* Fixed header */}
      <div className="flex items-center justify-between gap-3 p-4 rounded-2xl bg-gradient-to-l from-violet-600 via-purple-600 to-indigo-600 shadow-lg mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">المستشار الدوادي الذكي</h2>
            <p className="text-xs text-violet-100">
              مدعوم بتقنيات جيميناي العالمية | مطور بواسطة المهندس عمر حجازي (Omar Hegazy)
            </p>
          </div>
        </div>
        {messages.length > 0 && (
          <button
            onClick={handleClear}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition-all"
          >
            <Trash2 className="w-4 h-4" />
            <span className="hidden sm:inline">مسح المحادثة</span>
          </button>
        )}
      </div>

      {/* Messages area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-4 p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700"
      >
        {messages.length === 0 && !loading && (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center mb-4 shadow-lg shadow-violet-500/20">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-bold text-slate-700 dark:text-slate-200 mb-2">
              ابدأ محادثة مع المستشار الذكي
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mb-6">
              اسأل أي سؤال عن منهج الثانوية العامة في اللغة العربية والفيزياء والكيمياء والأحياء والإنجليزي
            </p>
            <div className="flex flex-wrap gap-2 justify-center max-w-lg">
              {[
                'اشرح لي قوانين نيوتن للحركة',
                'ما هو الفرق بين الموجات الطولية والمستعرضة؟',
                'اشرح المنصوبات في النحو',
                'كيف أكتب مقال بالإنجليزي؟',
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => setInput(suggestion)}
                  className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-sm text-slate-600 dark:text-slate-300 transition-all"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
          >
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                msg.role === 'user'
                  ? 'bg-blue-500'
                  : 'bg-gradient-to-br from-violet-500 to-indigo-500'
              }`}
            >
              {msg.role === 'user' ? (
                <User className="w-5 h-5 text-white" />
              ) : (
                <Bot className="w-5 h-5 text-white" />
              )}
            </div>
            <div
              className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                msg.role === 'user'
                  ? 'bg-blue-500 text-white rounded-tr-sm'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-100 rounded-tl-sm'
              }`}
            >
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-3 flex-row">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center shrink-0">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div className="bg-slate-100 dark:bg-slate-700 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 rounded-full bg-violet-400 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        )}
      </div>

      {/* Input area */}
      <div className="mt-4 flex gap-2">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="اكتب سؤالك هنا..."
          rows={1}
          className="flex-1 px-4 py-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
          style={{ maxHeight: '120px' }}
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || loading}
          className="px-4 py-3 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-500 text-white font-medium text-sm shadow-lg shadow-violet-500/20 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 active:scale-95 transition-all"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
