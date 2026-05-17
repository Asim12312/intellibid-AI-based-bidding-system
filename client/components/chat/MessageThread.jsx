"use client";

import { useState, useRef, useEffect } from 'react';
import { useMessagesStore } from '@/store/messagesStore';
import MessageBubble from './MessageBubble';
import { Send, Loader2 } from 'lucide-react';

export default function MessageThread() {
    const { activeConversationId, threads, messages, loading, sendMessage } = useMessagesStore();
    const [input, setInput] = useState('');
    const [sending, setSending] = useState(false);
    const bottomRef = useRef(null);

    const thread = threads.find(t => t._id === activeConversationId);
    const threadMessages = messages[activeConversationId] || [];

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [threadMessages]);

    if (!thread) return null;

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim() || sending) return;

        setSending(true);
        await sendMessage(activeConversationId, input);
        setInput('');
        setSending(false);
    };

    return (
        <div className="flex-1 flex flex-col h-full bg-[var(--background)]">
            {/* Header */}
            <div className="p-4 border-b-[3px] border-[var(--ink)] bg-white flex items-center gap-3">
                <h3 className="font-display font-black text-lg">
                    {thread.type === 'system' ? 'System Notifications' : `${thread.otherParticipant?.firstName} ${thread.otherParticipant?.lastName}`}
                </h3>
                {thread.auctionRef && (
                    <span className="text-xs font-bold px-2 py-1 bg-[var(--acid)] border-[2px] border-[var(--ink)] rounded-full">
                        Auction: {thread.auctionRef.title}
                    </span>
                )}
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
                {loading ? (
                    <div className="flex items-center justify-center h-full">
                        <Loader2 className="animate-spin" size={32} />
                    </div>
                ) : threadMessages.length === 0 ? (
                    <div className="text-center opacity-50 mt-10 text-sm font-medium">
                        No messages yet. Send a message to start the conversation!
                    </div>
                ) : (
                    threadMessages.map(msg => (
                        <MessageBubble key={msg._id} message={msg} isSystem={thread.type === 'system'} />
                    ))
                )}
                <div ref={bottomRef} />
            </div>

            {/* Input Area */}
            {thread.type !== 'system' && (
                <div className="p-4 bg-white border-t-[3px] border-[var(--ink)]">
                    <form onSubmit={handleSend} className="flex gap-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Type your message..."
                            className="flex-1 bg-[var(--background)] border-[3px] border-[var(--ink)] rounded-xl px-4 py-3 font-medium outline-none focus:shadow-[4px_4px_0_0_var(--hotpink)] focus:-translate-y-1 transition-all"
                        />
                        <button
                            type="submit"
                            disabled={!input.trim() || sending}
                            className="bg-[var(--electric)] text-white px-6 py-3 rounded-xl border-[3px] border-[var(--ink)] font-black uppercase tracking-widest shadow-[4px_4px_0_0_var(--ink)] hover:translate-y-[-2px] hover:shadow-[6px_6px_0_0_var(--ink)] transition-all disabled:opacity-50 flex items-center gap-2"
                        >
                            {sending ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
}
