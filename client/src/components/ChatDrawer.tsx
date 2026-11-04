import React, { useState, useRef, useEffect } from 'react';
import type { ChatMessage } from '../types';
import { MessageSquare, Send, ChevronUp, ChevronDown } from 'lucide-react';

interface ChatDrawerProps {
  messages: ChatMessage[];
  onSendMessage: (text?: string, emoji?: string) => void;
  currentPlayerId: string;
}

const QUICK_EMOJIS = ['🔥', '⚡', '🎉', '😭', '😱', '❓', '👑', '❤️'];

export const ChatDrawer: React.FC<ChatDrawerProps> = ({
  messages,
  onSendMessage,
  currentPlayerId
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [text, setText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    onSendMessage(text.trim());
    setText('');
  };

  return (
    <div className="fixed bottom-4 right-4 z-40 flex flex-col items-end">
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-2.5 text-xs font-bold text-white shadow-2xl border border-slate-700 hover:bg-slate-800 transition active:scale-95 cursor-pointer"
      >
        <MessageSquare className="h-4 w-4 text-amber-400" />
        <span>Room Chat</span>
        {messages.length > 0 && (
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[10px] font-black text-white">
            {messages.length > 99 ? '99+' : messages.length}
          </span>
        )}
        {isOpen ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronUp className="h-3.5 w-3.5" />}
      </button>

      {/* Expanded Chat Box */}
      {isOpen && (
        <div className="mt-2 flex h-80 w-80 sm:w-96 flex-col overflow-hidden rounded-3xl bg-slate-950/95 p-3 border border-slate-800 shadow-2xl backdrop-blur-xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-800/80 px-2 pb-2">
            <span className="text-xs font-bold text-slate-300">Trainer Chat</span>
            <span className="text-[10px] text-slate-500 font-mono">Live Sync</span>
          </div>

          {/* Quick Reaction Emojis */}
          <div className="flex justify-between gap-1 border-b border-slate-800/80 py-2 px-1">
            {QUICK_EMOJIS.map((em) => (
              <button
                key={em}
                onClick={() => onSendMessage(undefined, em)}
                className="rounded-lg p-1 text-base hover:scale-125 transition active:scale-95 cursor-pointer"
              >
                {em}
              </button>
            ))}
          </div>

          {/* Message Stream */}
          <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-2">
            {messages.length === 0 ? (
              <div className="flex h-full items-center justify-center text-xs text-slate-500">
                No chat messages yet. Say hi!
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col text-xs ${
                    msg.isSystem
                      ? 'items-center text-amber-400/90 italic text-[11px] my-1'
                      : msg.senderId === currentPlayerId
                      ? 'items-end'
                      : 'items-start'
                  }`}
                >
                  {!msg.isSystem && (
                    <span className="text-[10px] font-semibold text-slate-400 mb-0.5">
                      {msg.senderName}
                    </span>
                  )}
                  <div
                    className={`rounded-2xl px-3 py-1.5 max-w-[85%] ${
                      msg.isSystem
                        ? 'bg-amber-400/10 border border-amber-400/20 px-2 py-0.5'
                        : msg.senderId === currentPlayerId
                        ? 'bg-red-600 text-white shadow-sm'
                        : 'bg-slate-800 text-slate-200'
                    }`}
                  >
                    {msg.emoji ? (
                      <span className="text-xl">{msg.emoji}</span>
                    ) : (
                      <span>{msg.text}</span>
                    )}
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Bar */}
          <form onSubmit={handleSend} className="flex gap-1.5 pt-2 border-t border-slate-800/80">
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Send a message..."
              maxLength={80}
              className="flex-1 rounded-xl bg-slate-900 px-3 py-1.5 text-xs text-white placeholder-slate-500 border border-slate-700 focus:border-red-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={!text.trim()}
              className="rounded-xl bg-red-600 px-3 py-1.5 text-white hover:bg-red-500 disabled:opacity-40 transition cursor-pointer"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
