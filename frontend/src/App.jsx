import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import { 
  Menu, Plus, MessageSquare, Settings, User, Send, 
  Paperclip, FileText, Sparkles, BrainCircuit, CheckCircle2, AlertCircle
} from 'lucide-react';

function App() {
  const [file, setFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState({ state: 'idle', msg: '' });
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  // Auto-scroll to bottom of chat
  const messagesEndRef = useRef(null);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(() => { scrollToBottom(); }, [messages, isLoading]);

  // 1. Handle PDF Upload
  const handleFileUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    setUploadStatus({ state: 'loading', msg: 'Reading Document...' });
    const formData = new FormData();
    formData.append('file', file);

    try {
      await axios.post('http://127.0.0.1:8000/upload-doc', formData);
      setUploadStatus({ state: 'success', msg: 'Document learned successfully.' });
      setTimeout(() => setUploadStatus({ state: 'idle', msg: '' }), 3000);
    } catch (error) {
      setUploadStatus({ state: 'error', msg: 'Failed to read document.' });
    }
  };

  // 2. Handle Chat Messages
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { role: 'user', text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await axios.post('http://127.0.0.1:8000/chat', {
        question: userMessage.text
      });
      
      const aiMessage = { 
        role: 'ai', 
        text: response.data.answer,
        sources: response.data.sources_used
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error) {
      setMessages((prev) => [...prev, { role: 'ai', text: '❌ Connection error.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const suggestedPrompts = [
    "What is the policy on working hours?",
    "Summarize the main points of the document.",
    "Are there any penalties mentioned?",
    "Explain the leave policy."
  ];

  return (
    <div className="flex h-screen bg-[#F8FAFC] text-slate-800 font-sans overflow-hidden">
      
      {/* --- SIDEBAR --- */}
      <aside className={`${isSidebarOpen ? 'w-72' : 'w-0'} bg-slate-900 text-slate-300 transition-all duration-300 ease-in-out flex flex-col shrink-0 overflow-hidden relative shadow-2xl z-20`}>
        {/* Animated Gradient Top Border */}
        <div className="h-1 w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>
        
        <div className="p-4 flex items-center gap-3">
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-2 rounded-xl shadow-lg shadow-blue-500/30">
            <BrainCircuit className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">Copilot<span className="text-blue-400">.ai</span></h1>
        </div>

        {/* --- UPDATED: NEW CONVERSATION BUTTON NOW WORKS --- */}
        <button 
          onClick={() => {
            setMessages([]);
            setFile(null);
            setUploadStatus({ state: 'idle', msg: '' });
          }}
          className="mx-4 mt-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl p-3 flex items-center gap-2 transition-all group"
        >
          <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
          <span className="font-medium">New Conversation</span>
        </button>

        {/* Upload Section in Sidebar */}
        <div className="mx-4 mt-8 bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Knowledge Base</h2>
          <form onSubmit={handleFileUpload} className="flex flex-col gap-3">
            <label className="flex items-center gap-2 cursor-pointer group">
              <div className="bg-slate-700 group-hover:bg-blue-600 p-2 rounded-lg transition-colors">
                <FileText className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm truncate flex-1 group-hover:text-white transition-colors">
                {file ? file.name : "Select PDF Document"}
              </span>
              <input type="file" accept=".pdf" className="hidden" onChange={(e) => setFile(e.target.files[0])} />
            </label>
            <button 
              type="submit" 
              disabled={!file || uploadStatus.state === 'loading'}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium py-2 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Upload & Vectorize
            </button>
            
            {/* Upload Status Indicators */}
            {uploadStatus.state === 'loading' && <p className="text-xs text-blue-400 flex items-center gap-1 mt-1"><CheckCircle2 className="w-3 h-3 animate-spin"/> {uploadStatus.msg}</p>}
            {uploadStatus.state === 'success' && <p className="text-xs text-emerald-400 flex items-center gap-1 mt-1"><CheckCircle2 className="w-3 h-3"/> {uploadStatus.msg}</p>}
            {uploadStatus.state === 'error' && <p className="text-xs text-red-400 flex items-center gap-1 mt-1"><AlertCircle className="w-3 h-3"/> {uploadStatus.msg}</p>}
          </form>
        </div>

        <div className="flex-1 overflow-y-auto px-4 mt-8">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Recent Chats</h2>
          <div className="space-y-1">
            {['Policy Breakdown', 'Leave Rules Analysis'].map((chat, i) => (
              <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 cursor-pointer transition-colors text-sm">
                <MessageSquare className="w-4 h-4 text-slate-500" />
                <span className="truncate">{chat}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 border-t border-white/5 mt-auto">
          <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 cursor-pointer transition-colors">
            <div className="bg-gradient-to-tr from-purple-500 to-indigo-500 rounded-full p-1.5">
              <User className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-white">Amit Gavane</span>
              <span className="text-xs text-slate-500">Free Tier</span>
            </div>
            <Settings className="w-4 h-4 text-slate-500 ml-auto" />
          </div>
        </div>
      </aside>

      {/* --- MAIN CHAT AREA --- */}
      <main className="flex-1 flex flex-col relative min-w-0">
        
        {/* Floating Blurs for modern look */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-400/20 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-400/20 rounded-full blur-[120px] pointer-events-none"></div>

        {/* Mobile Header */}
        <header className="h-16 flex items-center px-4 border-b border-slate-200/50 bg-white/50 backdrop-blur-md z-10">
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 rounded-lg hover:bg-slate-100 text-slate-600 transition-colors">
            <Menu className="w-6 h-6" />
          </button>
          <span className="ml-4 font-semibold text-slate-800">Knowledge Copilot</span>
        </header>

        {/* Chat Canvas */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 z-10 scroll-smooth">
          <div className="max-w-4xl mx-auto w-full flex flex-col gap-6">
            
            {messages.length === 0 ? (
              /* HERO / EMPTY STATE */
              <div className="flex flex-col items-center justify-center mt-20 text-center animate-in fade-in zoom-in duration-700">
                <div className="bg-white p-4 rounded-3xl shadow-xl shadow-blue-500/10 mb-6 border border-slate-100">
                  <Sparkles className="w-12 h-12 text-blue-600" />
                </div>
                <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-900 to-slate-600 mb-4 tracking-tight">
                  How can I help you today?
                </h2>
                <p className="text-slate-500 max-w-lg text-lg mb-10">
                  Upload your enterprise documents in the sidebar, and I'll answer questions, extract data, and summarize policies instantly.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-2xl">
                  {suggestedPrompts.map((prompt, i) => (
                    <button 
                      key={i}
                      onClick={() => setInput(prompt)}
                      className="bg-white/80 backdrop-blur-sm border border-slate-200 p-4 rounded-2xl hover:border-blue-400 hover:shadow-lg hover:shadow-blue-500/5 transition-all text-left group"
                    >
                      <p className="text-slate-700 font-medium group-hover:text-blue-600 transition-colors">{prompt}</p>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              /* CHAT MESSAGES */
              messages.map((msg, index) => (
                <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-4 fade-in duration-300`}>
                  
                  {msg.role === 'ai' && (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shrink-0 mr-3 shadow-md mt-1">
                      <BrainCircuit className="w-4 h-4 text-white" />
                    </div>
                  )}

                  <div className={`max-w-[85%] sm:max-w-[75%] p-5 rounded-3xl shadow-sm leading-relaxed ${
                    msg.role === 'user' 
                      ? 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-br-sm shadow-blue-500/20' 
                      : 'bg-white text-slate-800 border border-slate-100 rounded-tl-sm shadow-slate-200/50'
                  }`}>
                    
                    {/* Markdown rendering for AI, standard text for user */}
                    {msg.role === 'user' ? (
                      <p className="whitespace-pre-wrap">{msg.text}</p>
                    ) : (
                      <div className="prose prose-slate max-w-none prose-p:leading-relaxed prose-pre:bg-slate-800 prose-pre:text-slate-100 prose-pre:rounded-xl">
                        <ReactMarkdown>{msg.text}</ReactMarkdown>
                      </div>
                    )}
                    
                    {/* AI Sources Box */}
                    {msg.sources && msg.sources.length > 0 && (
                      <div className="mt-5 pt-4 border-t border-slate-100">
                        <div className="flex items-center gap-1.5 mb-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                          <FileText className="w-3.5 h-3.5" />
                          <span>Sources Retrieved</span>
                        </div>
                        <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl hover:bg-slate-100 transition-colors cursor-default">
                          <p className="text-xs text-slate-500 italic line-clamp-2 hover:line-clamp-none transition-all">
                            "{msg.sources[0]}..."
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
            
            {/* Thinking Loader */}
            {isLoading && (
              <div className="flex justify-start animate-in fade-in duration-300">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shrink-0 mr-3 shadow-md">
                  <BrainCircuit className="w-4 h-4 text-white" />
                </div>
                <div className="bg-white border border-slate-100 p-5 rounded-3xl rounded-tl-sm shadow-sm flex items-center gap-1.5">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* --- STICKY INPUT AREA --- */}
        <div className="p-4 bg-gradient-to-t from-[#F8FAFC] via-[#F8FAFC]/95 to-transparent z-10 pt-10">
          <form onSubmit={handleSendMessage} className="max-w-4xl mx-auto relative group">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Message Knowledge Copilot..."
              className="w-full bg-white border border-slate-200 rounded-3xl pl-14 pr-16 py-4 shadow-lg shadow-slate-200/50 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-slate-800 placeholder-slate-400"
            />
            
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
              <Paperclip className="w-5 h-5 cursor-pointer hover:text-blue-600" />
            </div>

            <button 
              type="submit" 
              disabled={isLoading || !input.trim()}
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-blue-600 text-white p-2.5 rounded-full hover:bg-blue-700 hover:scale-105 transition-all disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed shadow-md shadow-blue-500/20"
            >
              <Send className="w-4 h-4 ml-0.5" />
            </button>
          </form>
          <p className="text-center text-[11px] text-slate-400 mt-3 font-medium">
            Knowledge Copilot can make mistakes. Consider verifying important information.
          </p>
        </div>

      </main>
    </div>
  );
}

export default App;