import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Bot,
  Mic,
  MicOff,
  Globe,
  Image as ImageIcon,
  BookOpen,
  Send,
  Loader2,
  RefreshCw,
  ExternalLink,
  Volume2,
  Layers,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
}

export const AICapabilitiesPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'chat' | 'live' | 'search' | 'image' | 'science'>('chat');

  // --- 1. MULTI-TURN CHAT STATE ---
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'model',
      content: "Hello! I am your CareerPilot AI counselor. I can guide your tech roadmap, simulate mock interviews, or evaluate ATS resume alignment. How can I assist you today?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatRole, setChatRole] = useState<'coach' | 'interviewer' | 'ats_expert'>('coach');
  const [chatComplexity, setChatComplexity] = useState<'fast' | 'general'>('general');
  const [chatLoading, setChatLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, chatLoading]);

  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || chatLoading) return;

    const userText = chatInput.trim();
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const nextHistory = [...messages, userMsg];
    setMessages(nextHistory);
    setChatInput('');
    setChatLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: nextHistory.map(m => ({ role: m.role, content: m.content })),
          complexity: chatComplexity,
          role: chatRole
        })
      });

      const data = await res.json();
      const replyMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: data.reply || data.error || 'No response generated.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, replyMsg]);
    } catch (err: any) {
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'model',
          content: 'CareerPilot AI is temporarily unable to generate an AI response. Please try again later.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  // --- 2. LIVE API VOICE STATE (gemini-3.8-live) ---
  const [isLiveActive, setIsLiveActive] = useState(false);
  const [liveStatus, setLiveStatus] = useState<string>('Ready to connect to gemini-3.8-live');
  const wsRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioQueueRef = useRef<string[]>([]);
  const isPlayingAudioRef = useRef(false);

  const startLiveConversation = async () => {
    try {
      setLiveStatus('Requesting microphone permissions...');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/api/live-ws`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      const inputAudioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const outputAudioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      audioContextRef.current = outputAudioCtx;

      ws.onopen = () => {
        setIsLiveActive(true);
        setLiveStatus('Live API session active. Speak to your AI Career Coach.');

        const source = inputAudioCtx.createMediaStreamSource(stream);
        const processor = inputAudioCtx.createScriptProcessor(4096, 1, 1);
        source.connect(processor);
        processor.connect(inputAudioCtx.destination);

        processor.onaudioprocess = (e) => {
          if (ws.readyState === WebSocket.OPEN) {
            const inputData = e.inputBuffer.getChannelData(0);
            // Convert float32 to 16-bit PCM
            const pcm16 = new Int16Array(inputData.length);
            for (let i = 0; i < inputData.length; i++) {
              const s = Math.max(-1, Math.min(1, inputData[i]));
              pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
            }
            // Base64 encode
            let binary = '';
            const bytes = new Uint8Array(pcm16.buffer);
            for (let i = 0; i < bytes.byteLength; i++) {
              binary += String.fromCharCode(bytes[i]);
            }
            const base64 = btoa(binary);
            ws.send(JSON.stringify({ audio: base64 }));
          }
        };
      };

      ws.onmessage = async (evt) => {
        try {
          const msg = JSON.parse(evt.data);
          if (msg.error) {
            setLiveStatus(`Error: ${msg.error}`);
            return;
          }
          if (msg.audio) {
            audioQueueRef.current.push(msg.audio);
            playAudioQueue(outputAudioCtx);
          }
          if (msg.interrupted) {
            audioQueueRef.current = [];
            isPlayingAudioRef.current = false;
          }
        } catch (e) {
          console.error(e);
        }
      };

      ws.onerror = () => {
        setLiveStatus('WebSocket encountered a network error.');
        setIsLiveActive(false);
      };

      ws.onclose = () => {
        setIsLiveActive(false);
        setLiveStatus('Live conversation ended.');
      };
    } catch (err: any) {
      setLiveStatus('Microphone or connection failed: ' + err.message);
      setIsLiveActive(false);
    }
  };

  const playAudioQueue = async (ctx: AudioContext) => {
    if (isPlayingAudioRef.current || audioQueueRef.current.length === 0) return;
    isPlayingAudioRef.current = true;

    const base64 = audioQueueRef.current.shift()!;
    try {
      const binary = atob(base64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
      const pcm16 = new Int16Array(bytes.buffer);
      const float32 = new Float32Array(pcm16.length);
      for (let i = 0; i < pcm16.length; i++) float32[i] = pcm16[i] / 32768.0;

      const audioBuffer = ctx.createBuffer(1, float32.length, 24000);
      audioBuffer.copyToChannel(float32, 0);

      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(ctx.destination);
      source.onended = () => {
        isPlayingAudioRef.current = false;
        playAudioQueue(ctx);
      };
      source.start();
    } catch (e) {
      isPlayingAudioRef.current = false;
    }
  };

  const stopLiveConversation = () => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setIsLiveActive(false);
    setLiveStatus('Live audio conversation disconnected.');
  };

  // --- 3. GOOGLE SEARCH GROUNDING (gemini-3.5-flash with googleSearch) ---
  const [searchQuery, setSearchQuery] = useState('2026 AI Engineer compensation and most in-demand skills');
  const [searchResult, setSearchResult] = useState<{ text?: string; groundingChunks?: any[]; webSearchQueries?: string[] } | null>(null);
  const [searchLoading, setSearchLoading] = useState(false);

  const handleRunSearch = async () => {
    if (!searchQuery.trim() || searchLoading) return;
    setSearchLoading(true);
    try {
      const res = await fetch('/api/ai/search-grounding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: searchQuery })
      });
      const data = await res.json();
      setSearchResult(data);
    } catch (err: any) {
      setSearchResult({ text: 'CareerPilot AI is temporarily unable to generate an AI response. Please try again later.' });
    } finally {
      setSearchLoading(false);
    }
  };

  // --- 4. IMAGE STUDIO (gemini-nano-banana-2.1) ---
  const [imagePrompt, setImagePrompt] = useState('A sleek minimalist holographic badge for Senior AI System Architect, deep purple and violet accents on pure dark glass');
  const [imageMode, setImageMode] = useState<'create' | 'edit'>('create');
  const [baseImage, setBaseImage] = useState<string | null>(null);
  const [aspectRatio, setAspectRatio] = useState<'1:1' | '16:9' | '4:3' | '9:16'>('1:1');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(false);
  const [imageText, setImageText] = useState('');

  const handleImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setBaseImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleGenerateImage = async () => {
    if (!imagePrompt.trim() || imageLoading) return;
    setImageLoading(true);
    setGeneratedImage(null);
    setImageText('');

    try {
      const res = await fetch('/api/ai/image-studio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: imagePrompt,
          baseImage,
          mode: imageMode,
          aspectRatio,
          imageSize: '1K'
        })
      });
      const data = await res.json();
      if (data.imageUrl) {
        setGeneratedImage(data.imageUrl);
      }
      if (data.text) {
        setImageText(data.text);
      }
      if (data.error) {
        setImageText('Error: ' + data.error);
      }
    } catch (err: any) {
      setImageText('Failed: ' + err.message);
    } finally {
      setImageLoading(false);
    }
  };

  // --- 5. SCIENCE SKILLS: RESEARCH & PAPERS (Europe PMC / PubMed) ---
  const [scienceTerm, setScienceTerm] = useState('AlphaFold protein design computational biology');
  const [sciencePapers, setSciencePapers] = useState<any[]>([]);
  const [scienceLoading, setScienceLoading] = useState(false);

  const handleQueryScience = async () => {
    if (!scienceTerm.trim() || scienceLoading) return;
    setScienceLoading(true);
    try {
      const res = await fetch('/api/ai/science-literature', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ term: scienceTerm })
      });
      const data = await res.json();
      setSciencePapers(data.papers || []);
    } catch (err: any) {
      console.error(err);
    } finally {
      setScienceLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch for science tab preview
    handleQueryScience();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Hero Header */}
      <div className="bg-gradient-to-br from-[#370D48] via-[#580F69] to-[#240D2F] text-white p-6 sm:p-8 rounded-3xl shadow-xl border border-[#D2B9E0]/30 relative overflow-hidden">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-[#D2B9E0] text-xs font-bold uppercase tracking-wider mb-4 border border-white/15">
            <Sparkles className="w-3.5 h-3.5 text-[#D2B9E0]" />
            Next-Gen Multi-Modal AI Engine
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight mb-3">
            CareerPilot AI Intelligence Hub
          </h1>
          <p className="text-[#F7F5F8]/90 text-sm sm:text-base leading-relaxed">
            Harnessing real-time Live voice, multi-turn reasoning, Google Search grounding, image generation with <code>gemini-nano-banana-2.1</code>, and scientific research intelligence.
          </p>
        </div>
      </div>

      {/* Tabs Selector */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-[#580F69]/10 rounded-2xl border border-[#580F69]/20">
        <button
          onClick={() => setActiveTab('chat')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all ${
            activeTab === 'chat'
              ? 'bg-[#580F69] text-white shadow-md'
              : 'text-[#370D48] hover:bg-white/60'
          }`}
        >
          <Bot className="w-4 h-4" />
          <span>Multi-Turn Chat</span>
        </button>

        <button
          onClick={() => setActiveTab('live')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all ${
            activeTab === 'live'
              ? 'bg-[#580F69] text-white shadow-md'
              : 'text-[#370D48] hover:bg-white/60'
          }`}
        >
          <Mic className="w-4 h-4" />
          <span>Live Voice (gemini-3.8-live)</span>
        </button>

        <button
          onClick={() => setActiveTab('search')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all ${
            activeTab === 'search'
              ? 'bg-[#580F69] text-white shadow-md'
              : 'text-[#370D48] hover:bg-white/60'
          }`}
        >
          <Globe className="w-4 h-4" />
          <span>Search Grounding</span>
        </button>

        <button
          onClick={() => setActiveTab('image')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all ${
            activeTab === 'image'
              ? 'bg-[#580F69] text-white shadow-md'
              : 'text-[#370D48] hover:bg-white/60'
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          <span>Image Studio (Nano Banana)</span>
        </button>

        <button
          onClick={() => setActiveTab('science')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all ${
            activeTab === 'science'
              ? 'bg-[#580F69] text-white shadow-md'
              : 'text-[#370D48] hover:bg-white/60'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Science Literature</span>
        </button>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 1. MULTI-TURN CHAT INTERFACE */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'chat' && (
        <div className="bg-white rounded-3xl border border-[#D2B9E0] shadow-sm overflow-hidden flex flex-col h-[650px]">
          {/* Chat Controls Bar */}
          <div className="p-4 bg-[#F7F5F8] border-b border-[#D2B9E0] flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#370D48]/70">Coach Role:</span>
              <div className="flex gap-1.5">
                {(['coach', 'interviewer', 'ats_expert'] as const).map(r => (
                  <button
                    key={r}
                    onClick={() => setChatRole(r)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold capitalize transition-all ${
                      chatRole === r
                        ? 'bg-[#580F69] text-white'
                        : 'bg-white text-[#370D48] border border-[#D2B9E0] hover:bg-gray-50'
                    }`}
                  >
                    {r.replace('_', ' ')}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#370D48]/70">Model Tier:</span>
              <div className="flex gap-1.5">
                {(['general', 'fast'] as const).map(tier => (
                  <button
                    key={tier}
                    onClick={() => setChatComplexity(tier)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold capitalize transition-all ${
                      chatComplexity === tier
                        ? 'bg-[#370D48] text-white'
                        : 'bg-white text-[#370D48] border border-[#D2B9E0] hover:bg-gray-50'
                    }`}
                    title={
                      tier === 'general'
                        ? 'gemini-3.8-flash (Standard & In-Depth)'
                        : 'gemini-3.1-flash-lite (Fast & Responsive)'
                    }
                  >
                    {tier === 'general' ? 'Gemini 3.8 Flash' : 'Gemini 3.1 Flash Lite'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-[85%] ${
                  msg.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-black ${
                    msg.role === 'user'
                      ? 'bg-[#370D48] text-white'
                      : 'bg-[#580F69] text-white'
                  }`}
                >
                  {msg.role === 'user' ? 'You' : 'AI'}
                </div>
                <div
                  className={`p-4 rounded-2xl text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-[#580F69] text-white rounded-tr-none'
                      : 'bg-[#F7F5F8] text-[#240D2F] border border-[#D2B9E0] rounded-tl-none whitespace-pre-wrap'
                  }`}
                >
                  <p>{msg.content}</p>
                  <span
                    className={`block text-[10px] mt-2 font-medium opacity-70 ${
                      msg.role === 'user' ? 'text-right' : 'text-left'
                    }`}
                  >
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            ))}
            {chatLoading && (
              <div className="flex items-center gap-3 text-xs text-[#580F69] font-bold">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>CareerPilot AI is thinking...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Form */}
          <form onSubmit={handleSendChat} className="p-4 bg-white border-t border-[#D2B9E0] flex gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              placeholder="Ask a career question, request interview prep, or paste resume points..."
              className="flex-1 px-4 py-3 rounded-xl border border-[#D2B9E0] focus:ring-2 focus:ring-[#580F69] focus:outline-none text-sm"
              disabled={chatLoading}
            />
            <button
              type="submit"
              disabled={!chatInput.trim() || chatLoading}
              className="px-5 py-3 rounded-xl bg-[#580F69] text-white font-bold hover:bg-[#370D48] transition-all disabled:opacity-50 flex items-center gap-2 text-sm"
            >
              <Send className="w-4 h-4" />
              <span>Send</span>
            </button>
          </form>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 2. LIVE VOICE CONVERSATIONS (gemini-3.8-live) */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'live' && (
        <div className="bg-white rounded-3xl border border-[#D2B9E0] shadow-sm p-6 sm:p-8 space-y-6">
          <div className="max-w-2xl">
            <h2 className="text-xl font-bold text-[#370D48] flex items-center gap-2">
              <Mic className="w-5 h-5 text-[#580F69]" />
              Real-Time Voice Career Coach (gemini-3.8-live)
            </h2>
            <p className="text-sm text-[#240D2F]/75 mt-1">
              Engage in an interactive, low-latency spoken conversation with Gemini Live API. Practice behavioral questions or explore roadmap advice out loud.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-[#F7F5F8] border border-[#D2B9E0] flex flex-col items-center justify-center text-center space-y-4">
            <div
              className={`w-24 h-24 rounded-full flex items-center justify-center transition-all ${
                isLiveActive
                  ? 'bg-[#580F69] text-white shadow-xl shadow-[#580F69]/30 animate-pulse'
                  : 'bg-white text-[#580F69] border-2 border-[#580F69]/30'
              }`}
            >
              {isLiveActive ? <Volume2 className="w-10 h-10" /> : <Mic className="w-10 h-10" />}
            </div>

            <div>
              <p className="font-bold text-[#370D48] text-base">{liveStatus}</p>
              <p className="text-xs text-[#240D2F]/60 mt-1">
                Audio streaming: 16kHz PCM Mic Input → 24kHz PCM Model Voice Output
              </p>
            </div>

            <div className="flex gap-3">
              {!isLiveActive ? (
                <button
                  onClick={startLiveConversation}
                  className="px-6 py-3 rounded-xl bg-[#580F69] text-white font-bold hover:bg-[#370D48] shadow-md transition-all flex items-center gap-2"
                >
                  <Mic className="w-4 h-4" />
                  <span>Start Voice Session</span>
                </button>
              ) : (
                <button
                  onClick={stopLiveConversation}
                  className="px-6 py-3 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 shadow-md transition-all flex items-center gap-2"
                >
                  <MicOff className="w-4 h-4" />
                  <span>Disconnect</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 3. GOOGLE SEARCH GROUNDING */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'search' && (
        <div className="bg-white rounded-3xl border border-[#D2B9E0] shadow-sm p-6 sm:p-8 space-y-6">
          <div className="max-w-2xl">
            <h2 className="text-xl font-bold text-[#370D48] flex items-center gap-2">
              <Globe className="w-5 h-5 text-[#580F69]" />
              Real-Time Market Intel & Search Grounding (gemini-3.5-flash)
            </h2>
            <p className="text-sm text-[#240D2F]/75 mt-1">
              Extract real-time hiring trends, tech salary bands, and market conditions grounded in Google Search.
            </p>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="e.g. 2026 Machine Learning Engineer salary ranges San Francisco and London"
              className="flex-1 px-4 py-3 rounded-xl border border-[#D2B9E0] focus:ring-2 focus:ring-[#580F69] focus:outline-none text-sm"
            />
            <button
              onClick={handleRunSearch}
              disabled={searchLoading}
              className="px-6 py-3 rounded-xl bg-[#580F69] text-white font-bold hover:bg-[#370D48] transition-all disabled:opacity-50 flex items-center gap-2 text-sm shrink-0"
            >
              {searchLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Globe className="w-4 h-4" />}
              <span>Search Grounded Intel</span>
            </button>
          </div>

          {searchResult && (
            <div className="space-y-4">
              <div className="p-6 rounded-2xl bg-[#F7F5F8] border border-[#D2B9E0] text-sm leading-relaxed whitespace-pre-wrap text-[#240D2F]">
                {searchResult.text}
              </div>

              {searchResult.groundingChunks && searchResult.groundingChunks.length > 0 && (
                <div className="p-4 rounded-2xl bg-white border border-[#D2B9E0]">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#580F69] mb-3">
                    Verified Google Search Citations
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {searchResult.groundingChunks.map((chunk: any, i: number) => {
                      const web = chunk.web;
                      if (!web) return null;
                      return (
                        <a
                          key={i}
                          href={web.uri}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between p-2.5 rounded-xl border border-[#D2B9E0]/60 hover:bg-[#F7F5F8] text-xs font-semibold text-[#370D48] transition-all"
                        >
                          <span className="truncate pr-2">{web.title || web.uri}</span>
                          <ExternalLink className="w-3.5 h-3.5 shrink-0 text-[#580F69]" />
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 4. IMAGE STUDIO (gemini-nano-banana-2.1) */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'image' && (
        <div className="bg-white rounded-3xl border border-[#D2B9E0] shadow-sm p-6 sm:p-8 space-y-6">
          <div className="max-w-2xl">
            <h2 className="text-xl font-bold text-[#370D48] flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-[#580F69]" />
              Portfolio & Badge Studio (gemini-nano-banana-2.1)
            </h2>
            <p className="text-sm text-[#240D2F]/75 mt-1">
              Create and edit professional career badges, architecture diagrams, or portfolio visuals using high-fidelity <code>gemini-nano-banana-2.1</code>.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex gap-2">
                <button
                  onClick={() => setImageMode('create')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    imageMode === 'create'
                      ? 'bg-[#580F69] text-white'
                      : 'bg-[#F7F5F8] text-[#370D48] border border-[#D2B9E0]'
                  }`}
                >
                  Create New Image
                </button>
                <button
                  onClick={() => setImageMode('edit')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    imageMode === 'edit'
                      ? 'bg-[#580F69] text-white'
                      : 'bg-[#F7F5F8] text-[#370D48] border border-[#D2B9E0]'
                  }`}
                >
                  Edit Existing Image
                </button>
              </div>

              {imageMode === 'edit' && (
                <div>
                  <label className="block text-xs font-bold text-[#370D48] mb-1">Upload Base Image:</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageFile}
                    className="text-xs file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#580F69] file:text-white hover:file:bg-[#370D48]"
                  />
                  {baseImage && (
                    <img src={baseImage} alt="Base" className="mt-2 w-24 h-24 object-cover rounded-xl border border-[#D2B9E0]" />
                  )}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-[#370D48] mb-1">Aspect Ratio:</label>
                <div className="flex gap-2">
                  {(['1:1', '16:9', '4:3', '9:16'] as const).map(ratio => (
                    <button
                      key={ratio}
                      onClick={() => setAspectRatio(ratio)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                        aspectRatio === ratio
                          ? 'bg-[#370D48] text-white'
                          : 'bg-[#F7F5F8] text-[#370D48] border border-[#D2B9E0]'
                      }`}
                    >
                      {ratio}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#370D48] mb-1">Prompt:</label>
                <textarea
                  rows={4}
                  value={imagePrompt}
                  onChange={e => setImagePrompt(e.target.value)}
                  placeholder="Describe your desired career badge or portfolio asset..."
                  className="w-full px-4 py-3 rounded-xl border border-[#D2B9E0] focus:ring-2 focus:ring-[#580F69] focus:outline-none text-sm"
                />
              </div>

              <button
                onClick={handleGenerateImage}
                disabled={imageLoading || !imagePrompt.trim()}
                className="w-full py-3.5 rounded-xl bg-[#580F69] text-white font-bold hover:bg-[#370D48] transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
              >
                {imageLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                <span>Generate with gemini-nano-banana-2.1</span>
              </button>
            </div>

            {/* Image Preview Canvas */}
            <div className="p-4 rounded-2xl bg-[#F7F5F8] border border-[#D2B9E0] flex flex-col items-center justify-center min-h-[300px]">
              {generatedImage ? (
                <div className="space-y-3 w-full text-center">
                  <img
                    src={generatedImage}
                    alt="Generated Asset"
                    className="max-h-[360px] mx-auto rounded-2xl shadow-lg border border-[#D2B9E0] object-contain"
                  />
                  <a
                    href={generatedImage}
                    download="careerpilot-asset.png"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#370D48] text-white text-xs font-bold hover:bg-[#580F69] transition-all"
                  >
                    Download Image
                  </a>
                </div>
              ) : (
                <div className="text-center text-[#240D2F]/50 space-y-2">
                  <ImageIcon className="w-12 h-12 mx-auto text-[#D2B9E0]" />
                  <p className="text-xs font-medium">Generated asset will display here</p>
                  {imageText && <p className="text-xs text-red-500 font-bold">{imageText}</p>}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 5. SCIENCE SKILLS & LITERATURE */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'science' && (
        <div className="bg-white rounded-3xl border border-[#D2B9E0] shadow-sm p-6 sm:p-8 space-y-6">
          <div className="max-w-2xl">
            <h2 className="text-xl font-bold text-[#370D48] flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[#580F69]" />
              Science & Bioinformatics Career Literature (Europe PMC & PubMed)
            </h2>
            <p className="text-sm text-[#240D2F]/75 mt-1">
              Explore scientific publications, computational biology breakthroughs, and protein engineering literature to bolster advanced STEM careers.
            </p>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={scienceTerm}
              onChange={e => setScienceTerm(e.target.value)}
              placeholder="e.g. AlphaFold, CRISPR Cas9, Genomic Variant Effect Predictor"
              className="flex-1 px-4 py-3 rounded-xl border border-[#D2B9E0] focus:ring-2 focus:ring-[#580F69] focus:outline-none text-sm"
            />
            <button
              onClick={handleQueryScience}
              disabled={scienceLoading}
              className="px-6 py-3 rounded-xl bg-[#580F69] text-white font-bold hover:bg-[#370D48] transition-all disabled:opacity-50 flex items-center gap-2 text-sm shrink-0"
            >
              {scienceLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <BookOpen className="w-4 h-4" />}
              <span>Query Literature</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sciencePapers.map((paper, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-[#F7F5F8] border border-[#D2B9E0] hover:border-[#580F69] transition-all space-y-2 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-[11px] font-bold text-[#580F69] mb-1">
                    <span>{paper.journal || 'Scientific Journal'}</span>
                    <span>{paper.year}</span>
                  </div>
                  <h3 className="font-bold text-sm text-[#370D48] line-clamp-2">
                    {paper.title}
                  </h3>
                  <p className="text-xs text-[#240D2F]/70 line-clamp-3 mt-1.5 leading-relaxed">
                    {paper.abstract}
                  </p>
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-[#D2B9E0]/50 text-xs">
                  <span className="text-[11px] text-[#370D48]/70 truncate max-w-[200px]">
                    {paper.authors}
                  </span>
                  {paper.doi && (
                    <a
                      href={paper.doi}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 font-bold text-[#580F69] hover:underline shrink-0"
                    >
                      <span>Read Paper</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
