'use client';

import { useEffect, useState, useRef } from 'react';
import { MessageCircle, Send, User, ChevronLeft, Circle } from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

interface Conversation {
  id: string;
  user_name: string;
  user_email?: string;
  status: 'open' | 'closed';
  last_message?: string;
  last_message_at?: string;
  created_at: string;
}

interface Message {
  id: string;
  sender_type: 'user' | 'admin';
  content: string;
  created_at: string;
}

export default function AdminInboxPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchConversations();
    const interval = setInterval(fetchConversations, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.id);
      const interval = setInterval(() => {
        fetchMessages(selectedConversation.id);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [selectedConversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchConversations = async () => {
    try {
      const response = await fetch('/api/conversations');
      const data = await response.json();
      if (response.ok) {
        setConversations(data);
      }
    } catch (error) {
      console.error('Conversations fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (convId: string) => {
    try {
      const response = await fetch(`/api/conversations/${convId}/messages`);
      const data = await response.json();
      if (response.ok) {
        setMessages(data);
      }
    } catch (error) {
      console.error('Messages fetch error:', error);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation || sending) return;

    setSending(true);
    const messageContent = newMessage;
    setNewMessage('');

    // Optimistic update
    const optimisticMessage: Message = {
      id: `temp-${Date.now()}`,
      sender_type: 'admin',
      content: messageContent,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimisticMessage]);

    try {
      const response = await fetch(`/api/conversations/${selectedConversation.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderType: 'admin',
          content: messageContent,
        }),
      });

      if (response.ok) {
        fetchMessages(selectedConversation.id);
        fetchConversations();
      }
    } catch (error) {
      console.error('Message send error:', error);
      setNewMessage(messageContent);
    } finally {
      setSending(false);
    }
  };

  const formatTime = (dateString: string) => {
    return format(new Date(dateString), 'MM.dd HH:mm', { locale: ko });
  };

  const formatMessageTime = (dateString: string) => {
    return format(new Date(dateString), 'HH:mm', { locale: ko });
  };

  // Conversation List View
  if (!selectedConversation) {
    return (
      <div className="px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">문의 인박스</h1>
          <p className="text-text-gray text-sm">
            고객 문의를 확인하고 답변하세요
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto" />
          </div>
        ) : conversations.length === 0 ? (
          <div className="card p-8 text-center">
            <MessageCircle className="w-12 h-12 text-text-light mx-auto mb-4" />
            <p className="text-text-gray">문의 내역이 없습니다</p>
          </div>
        ) : (
          <div className="space-y-2">
            {conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setSelectedConversation(conv)}
                className="w-full card p-4 text-left hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold">{conv.user_name}</span>
                      {conv.status === 'open' && (
                        <Circle className="w-2 h-2 fill-success text-success" />
                      )}
                    </div>
                    {conv.last_message && (
                      <p className="text-sm text-text-gray truncate">
                        {conv.last_message}
                      </p>
                    )}
                    {conv.last_message_at && (
                      <p className="text-xs text-text-light mt-1">
                        {formatTime(conv.last_message_at)}
                      </p>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Chat View
  return (
    <div className="flex flex-col h-[calc(100vh-56px)]">
      {/* Header */}
      <div className="bg-white border-b border-border px-4 py-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSelectedConversation(null)}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft size={24} />
          </button>
          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="font-semibold">{selectedConversation.user_name}</p>
            {selectedConversation.user_email && (
              <p className="text-xs text-text-gray">{selectedConversation.user_email}</p>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.length === 0 && (
          <div className="text-center py-8">
            <p className="text-text-gray text-sm">
              대화 내역이 없습니다
            </p>
          </div>
        )}

        {messages.map((message) => {
          const isAdmin = message.sender_type === 'admin';

          return (
            <div
              key={message.id}
              className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[80%]`}>
                <div
                  className={`rounded-2xl px-4 py-2 ${
                    isAdmin
                      ? 'bg-primary text-white rounded-br-sm'
                      : 'bg-white rounded-bl-sm'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>
                <p className={`text-xs text-text-light mt-1 ${isAdmin ? 'text-right' : ''}`}>
                  {formatMessageTime(message.created_at)}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={sendMessage} className="bg-white border-t border-border p-4">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="답변을 입력하세요..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="input-field flex-1"
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="btn-primary px-4"
          >
            <Send size={18} />
          </button>
        </div>
      </form>
    </div>
  );
}
