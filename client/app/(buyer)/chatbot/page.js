"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Bot, Sparkles, ArrowUpRight } from "lucide-react";

const INITIAL_MESSAGES = [
  { who: "bot", text: "Yo! I'm IntelliBot 🤖 — your AI auction companion. Ask me anything. Try: 'Show me vintage cameras ending today' or 'Auto-bid on the Walkman up to $1,200'." },
];

const quickReplies = [
  "Find me vintage cameras under $1,000",
  "What am I currently winning?",
  "Auto-bid on the Walkman up to $1,200",
  "What's ending in the next 2 hours?",
];

const BOT_RESPONSES = {
  "vintage": "🎯 Found **6 vintage camera lots** ending today under $1,000. Top pick: **Polaroid SX-70 at $420** — est. value $550. Want me to watch it?",
  "winning": "✅ You're currently **winning 2 lots**: Air Jordan 1 at $12,400 and Rolex Submariner at $8,750. You're outbid on the Polaroid SX-70. Want me to raise that bid?",
  "auto-bid": "⚡ Auto-bid armed for the **Sony Walkman TPS-L2** up to **$1,200**. I'll bid in $25 increments. You'll be notified if you're outbid beyond your cap.",
  "ending": "⏱ **4 lots end in the next 2 hours**: Fender Stratocaster '78 (22 min), Polaroid SX-70 (1h 2m), Neo Pop Print (47 min), Supreme Box Logo (15 min). Want bid suggestions?",
  "default": "🤔 Got it. Let me check the auction index... I found some matches. Want me to apply a filter or auto-track any of these?",
};

function getBotResponse(text) {
  const t = text.toLowerCase();
  if (t.includes("camera") || t.includes("vintage")) return BOT_RESPONSES["vintage"];
  if (t.includes("winning") || t.includes("win")) return BOT_RESPONSES["winning"];
  if (t.includes("auto-bid") || t.includes("walkman")) return BOT_RESPONSES["auto-bid"];
  if (t.includes("ending") || t.includes("2 hour")) return BOT_RESPONSES["ending"];
  return BOT_RESPONSES["default"];
}

export default function ChatbotPage() {
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, typing]);

  const send = (text) => {
    const msg = text || input.trim();
    if (!msg) return;
    setInput("");
    setMessages((m) => [...m, { who: "user", text: msg }]);
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMessages((m) => [...m, { who: "bot", text: getBotResponse(msg) }]);
    }, 1200 + Math.random() * 600);
  };

  return (
    <main className="mx-auto flex h-[calc(100vh-0px)] max-w-5xl flex-col px-6 py-10 md:px-10">
      {/* Header */}
      <header className="mb-6 shrink-0">
        <div className="flex items-end justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border-[3px] border-[var(--ink)] bg-[var(--acid)] px-4 py-1 font-display text-xs font-black uppercase shadow-[3px_3px_0_0_var(--ink)]">
              <span className="h-2 w-2 animate-pulse rounded-full bg-[var(--ink)]" /> Agent Online
            </div>
            <h1 className="font-display text-4xl font-black tracking-tighter md:text-6xl">
              Chat <span className="text-stroke">Agent.</span>
            </h1>
          </div>
          <div className="hidden flex-col items-end gap-1 text-right md:flex">
            <div className="font-display text-sm font-black uppercase">IntelliBot</div>
            <div className="text-xs font-bold text-[var(--ink)]/60">v3.4 · GPT-4o Turbo</div>
          </div>
        </div>
      </header>

      {/* Chat window */}
      <div className="brutal-lg flex flex-1 flex-col overflow-hidden">
        {/* Title bar */}
        <div className="flex shrink-0 items-center gap-4 border-b-[4px] border-[var(--ink)] bg-[var(--ink)] px-6 py-4">
          <div className="flex gap-2">
            <span className="h-3 w-3 rounded-full bg-[var(--hotpink)]" />
            <span className="h-3 w-3 rounded-full bg-[var(--acid)]" />
            <span className="h-3 w-3 rounded-full bg-[var(--electric)]" />
          </div>
          <div className="flex items-center gap-2 font-display text-xs font-black uppercase text-white">
            <Bot className="h-4 w-4 text-[var(--acid)]" />
            intellibid · agent · v3.4
          </div>
        </div>

        {/* Messages */}
        <div className="flex flex-1 flex-col gap-5 overflow-y-auto bg-[var(--background)] p-6">
          {messages.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${m.who === "bot" ? "justify-start" : "justify-end"}`}
            >
              {m.who === "bot" && (
                <div className="mr-3 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border-[3px] border-[var(--ink)] bg-[var(--ink)] text-white">
                  🤖
                </div>
              )}
              <div
                className={`max-w-[78%] rounded-3xl border-[3px] border-[var(--ink)] px-5 py-4 font-medium shadow-[4px_4px_0_0_var(--ink)] ${
                  m.who === "bot" ? "bg-[var(--acid)] text-[var(--ink)]" : "bg-[var(--electric)] text-white"
                }`}
              >
                {m.text}
              </div>
            </motion.div>
          ))}

          {typing && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
              <div className="mr-3 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border-[3px] border-[var(--ink)] bg-[var(--ink)] text-white">
                🤖
              </div>
              <div className="flex items-center gap-2 rounded-3xl border-[3px] border-[var(--ink)] bg-[var(--acid)] px-5 py-4 shadow-[4px_4px_0_0_var(--ink)]">
                <span className="h-2 w-2 animate-bounce rounded-full bg-[var(--ink)] [animation-delay:0ms]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-[var(--ink)] [animation-delay:150ms]" />
                <span className="h-2 w-2 animate-bounce rounded-full bg-[var(--ink)] [animation-delay:300ms]" />
              </div>
            </motion.div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Quick replies */}
        {messages.length <= 2 && (
          <div className="shrink-0 flex flex-wrap gap-2 border-t-[3px] border-[var(--ink)] bg-white p-4">
            {quickReplies.map((q) => (
              <button
                key={q}
                onClick={() => send(q)}
                className="rounded-full border-[2px] border-[var(--ink)] bg-[var(--background)] px-4 py-2 font-display text-xs font-black uppercase shadow-[2px_2px_0_0_var(--ink)] transition-all hover:-translate-y-0.5 hover:bg-[var(--acid)]"
              >
                {q}
              </button>
            ))}
          </div>
        )}

        {/* Input bar */}
        <div className="shrink-0 flex items-center gap-4 border-t-[4px] border-[var(--ink)] bg-white p-4">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            className="flex-1 rounded-2xl border-[3px] border-[var(--ink)] bg-[var(--background)] px-6 py-4 font-display text-base font-bold focus:bg-white focus:outline-none focus:ring-4 focus:ring-[var(--electric)]/30"
            placeholder="Ask the agent anything…"
          />
          <button
            onClick={() => send()}
            disabled={!input.trim()}
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border-[3px] border-[var(--ink)] bg-[var(--ink)] text-white shadow-[4px_4px_0_0_var(--electric)] transition-all hover:-translate-y-1 disabled:opacity-40 disabled:cursor-not-allowed active:translate-y-0 active:shadow-none"
          >
            <Send className="h-6 w-6" />
          </button>
        </div>
      </div>
    </main>
  );
}
