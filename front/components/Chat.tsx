'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { getMessages, getToken, getUser } from '@/lib/api';

interface Message {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  username: string;
}

interface ChatProps {
  tripId: string;
}

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:5000';

export default function Chat({ tripId }: ChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const currentUser = getUser();

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Load existing messages
  useEffect(() => {
    async function loadMessages() {
      try {
        const data = await getMessages(tripId);
        setMessages(data);
      } catch (err) {
        console.error('Failed to load messages:', err);
      } finally {
        setLoading(false);
      }
    }
    loadMessages();
  }, [tripId]);

  // Socket.io connection
  useEffect(() => {
    const token = getToken();
    if (!token) return;

    const socket = io(WS_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    socket.on('connect', () => {
      setConnected(true);
      socket.emit('join_trip_room', tripId);
    });

    socket.on('receive_message', (msg: Message) => {
      setMessages((prev) => [...prev, msg]);
    });

    socket.on('disconnect', () => {
      setConnected(false);
    });

    socket.on('connect_error', (err) => {
      console.error('Socket connection error:', err.message);
      setConnected(false);
    });

    socketRef.current = socket;

    return () => {
      socket.emit('leave_trip_room', tripId);
      socket.disconnect();
      socketRef.current = null;
    };
  }, [tripId]);

  // Auto-scroll on new message
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const sendMessage = () => {
    if (!input.trim() || !socketRef.current || !connected) return;

    socketRef.current.emit('send_message', {
      tripId,
      content: input.trim(),
    });

    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!currentUser) {
    return (
      <div className="bg-[#EAEFEF] rounded-2xl p-6 text-center">
        <p className="text-[#25343F]/60">Sign in to join the conversation</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-[#BFC9D1]/30 overflow-hidden shadow-sm">
      {/* Header */}
      <div className="px-4 py-3 bg-[#25343F] text-white flex items-center justify-between">
        <h3 className="font-semibold text-sm flex items-center gap-2">
          💬 Trip Chat
        </h3>
        <span className={`w-2 h-2 rounded-full ${connected ? 'bg-green-400' : 'bg-red-400'}`} />
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[200px] max-h-[400px] bg-[#EAEFEF]/30">
        {loading ? (
          <div className="text-center text-[#BFC9D1] py-8">Loading messages...</div>
        ) : messages.length === 0 ? (
          <div className="text-center text-[#BFC9D1] py-8">
            <span className="text-3xl block mb-2">🗨️</span>
            <p className="text-sm">No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isOwn = msg.user_id === currentUser.id;
            return (
              <div key={msg.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                    isOwn
                      ? 'bg-[#FF9B51] text-white rounded-br-md'
                      : 'bg-white text-[#25343F] border border-[#BFC9D1]/30 rounded-bl-md'
                  }`}
                >
                  {!isOwn && (
                    <p className="text-xs font-semibold text-[#FF9B51] mb-0.5">{msg.username}</p>
                  )}
                  <p className="text-sm leading-relaxed break-words">{msg.content}</p>
                  <p className={`text-[10px] mt-1 ${isOwn ? 'text-white/60' : 'text-[#BFC9D1]'}`}>
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-[#BFC9D1]/30 bg-white">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={connected ? 'Type a message...' : 'Connecting...'}
            disabled={!connected}
            className="flex-1 px-4 py-2.5 rounded-xl bg-[#EAEFEF] text-[#25343F] placeholder-[#BFC9D1] text-sm outline-none focus:ring-2 focus:ring-[#FF9B51]/30 transition-all disabled:opacity-50"
          />
          <button
            onClick={sendMessage}
            disabled={!connected || !input.trim()}
            className="px-4 py-2.5 bg-[#FF9B51] text-white rounded-xl font-semibold text-sm hover:bg-[#e8893f] transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
