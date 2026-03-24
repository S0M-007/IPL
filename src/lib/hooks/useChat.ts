'use client';

import { useState, useEffect, useCallback } from 'react';
import { onValue, push, query, limitToLast } from 'firebase/database';
import { chatRef } from '../firebase/db';
import type { ChatMessage } from '../../types/chat';

interface UseChatReturn {
  messages: ChatMessage[];
  sendMessage: (text: string, senderName: string, senderTeamId: string | null) => Promise<void>;
}

export function useChat(roomCode: string, senderId?: string): UseChatReturn {
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  useEffect(() => {
    if (!roomCode) return;

    const chatQuery = query(chatRef(roomCode), limitToLast(100));

    const unsubscribe = onValue(chatQuery, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val() as Record<string, Omit<ChatMessage, 'id'>>;
        const parsed: ChatMessage[] = Object.entries(data).map(([id, msg]) => ({
          id,
          ...msg,
        }));
        parsed.sort((a, b) => a.timestamp - b.timestamp);
        setMessages(parsed);
      } else {
        setMessages([]);
      }
    });

    return () => unsubscribe();
  }, [roomCode]);

  const sendMessage = useCallback(
    async (text: string, senderName: string, senderTeamId: string | null) => {
      const message: Omit<ChatMessage, 'id'> = {
        senderId: senderId ?? '',
        senderName,
        senderTeamId,
        text,
        type: 'message',
        timestamp: Date.now(),
      };
      await push(chatRef(roomCode), message);
    },
    [roomCode, senderId],
  );

  return { messages, sendMessage };
}
