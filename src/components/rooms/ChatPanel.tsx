'use client';

import { useEffect, useRef, useState } from 'react';
import { ref, onValue, query, limitToLast } from 'firebase/database';
import { db } from '@/lib/firebase/client';
import { chatPath } from '@/lib/firebase/db-paths';
import { getIdToken } from '@/lib/firebase/auth-service';
import { useAuth } from '@/components/providers/AuthProvider';
import { Send } from 'lucide-react';
import type { ChatMessage } from '@/lib/types';

interface ChatPanelProps {
  roomCode: string;
}

export function ChatPanel({ roomCode }: ChatPanelProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const chatRef = query(ref(db, chatPath(roomCode)), limitToLast(100));
    const unsub = onValue(chatRef, (snap) => {
      if (!snap.exists()) {
        setMessages([]);
        return;
      }
      const data = snap.val() as Record<string, ChatMessage>;
      setMessages(Object.values(data).sort((a, b) => a.timestamp - b.timestamp));
    });
    return unsub;
  }, [roomCode]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages.length]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || sending) return;

    try {
      setSending(true);
      setSendError(false);
      const token = await getIdToken();
      if (!token) return;

      const res = await fetch(`/api/rooms/${roomCode}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ text: trimmed }),
      });
      if (res.ok) {
        setText('');
      } else {
        setSendError(true);
      }
    } catch {
      setSendError(true);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-2 p-3 min-h-0">
        {messages.map((msg) => (
          <div key={msg.id} className={msg.type === 'system' ? 'text-center' : ''}>
            {msg.type === 'system' ? (
              <p className="text-xs text-gray-500 italic">{msg.text}</p>
            ) : (
              <div>
                <span className={`text-xs font-medium ${msg.userId === user?.uid ? 'text-indigo-400' : 'text-gray-400'}`}>
                  {msg.displayName}
                </span>
                <p className="text-sm text-gray-200">{msg.text}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      <form onSubmit={handleSend} className="p-3 border-t border-gray-800">
        {sendError && (
          <p className="text-red-400 text-xs mb-1">Failed to send. Try again.</p>
        )}
        <div className="flex gap-2">
          <input
            type="text"
            value={text}
            onChange={(e) => { setText(e.target.value); setSendError(false); }}
            placeholder="Type a message..."
            maxLength={500}
            className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          <button
            type="submit"
            disabled={!text.trim() || sending}
            className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg disabled:opacity-50 transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
}
