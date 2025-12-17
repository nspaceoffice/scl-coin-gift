'use client';

import { useEffect, useState, useRef } from 'react';
import { MessageCircle, Send, User, ChevronLeft, Circle, Inbox, Bot } from 'lucide-react';
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
      <div className="min-h-screen bg-gradient-animated">
        <div className="px-4 py-6 max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-gradient-to-r from-[#4da6ff] to-[#0052cc] rounded-xl flex items-center justify-center shadow-md">
                <Inbox className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-[#4da6ff] to-[#0052cc] bg-clip-text text-transparent">
                  문의 인박스
                </h1>
                <p className="text-gray-500 text-sm">
                  고객 문의를 확인하고 답변하세요
                </p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="card p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <span className="text-lg">💬</span>
                <p className="text-2xl font-bold">{conversations.length}</p>
              </div>
              <p className="text-xs text-gray-500">전체 문의</p>
            </div>
            <div className="card p-4 text-center border-l-4 border-green-400">
              <div className="flex items-center justify-center gap-2 mb-1">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                <p className="text-2xl font-bold text-green-600">
                  {conversations.filter((c) => c.status === 'open').length}
                </p>
              </div>
              <p className="text-xs text-gray-500">진행중</p>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="relative w-16 h-16 mx-auto mb-4">
                <div className="absolute inset-0 rounded-full border-4 border-[#4da6ff]/20"></div>
                <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#4da6ff] animate-spin"></div>
                <span className="absolute inset-0 flex items-center justify-center text-2xl">💬</span>
              </div>
              <p className="text-gray-500">문의를 불러오는 중...</p>
            </div>
          ) : conversations.length === 0 ? (
            <div className="card p-8 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">💬</span>
              </div>
              <p className="text-gray-500 font-medium">문의 내역이 없습니다</p>
            </div>
          ) : (
            <div className="space-y-3">
              {conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => setSelectedConversation(conv)}
                  className="w-full card p-4 text-left hover:shadow-lg transition-all"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-[#ff6b6b] to-[#ffa502] rounded-full flex items-center justify-center flex-shrink-0 shadow-md">
                      <User className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold">{conv.user_name}</span>
                        {conv.status === 'open' && (
                          <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
                            진행중
                          </span>
                        )}
                      </div>
                      {conv.last_message && (
                        <p className="text-sm text-gray-500 truncate">
                          {conv.last_message}
                        </p>
                      )}
                      {conv.last_message_at && (
                        <p className="text-xs text-gray-400 mt-1">
                          {formatTime(conv.last_message_at)}
                        </p>
                      )}
                    </div>
                    <div className="text-gray-400">
                      <MessageCircle size={20} />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Chat View
  return (
    <div className="flex flex-col h-[calc(100vh-56px)] bg-gradient-animated">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-md border-b border-gray-100 px-4 py-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSelectedConversation(null)}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <ChevronLeft size={24} />
          </button>
          <div className="w-10 h-10 bg-gradient-to-r from-[#ff6b6b] to-[#ffa502] rounded-full flex items-center justify-center shadow-md">
            <User className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-bold">{selectedConversation.user_name}</p>
            {selectedConversation.user_email && (
              <p className="text-xs text-gray-500">{selectedConversation.user_email}</p>
            )}
          </div>
          {selectedConversation.status === 'open' && (
            <span className="ml-auto flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
              진행중
            </span>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-8">
            <span className="text-4xl mb-2 block">💬</span>
            <p className="text-gray-500 text-sm">
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
              {!isAdmin && (
                <div className="w-8 h-8 bg-gradient-to-r from-[#ff6b6b] to-[#ffa502] rounded-full flex items-center justify-center mr-2 flex-shrink-0">
                  <User className="w-4 h-4 text-white" />
                </div>
              )}
              <div className={`max-w-[75%]`}>
                <div
                  className={`rounded-2xl px-4 py-3 ${
                    isAdmin
                      ? 'bg-gradient-to-r from-[#4da6ff] to-[#0052cc] text-white rounded-br-sm shadow-md'
                      : 'bg-white rounded-bl-sm shadow-md'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>
                <p className={`text-xs text-gray-400 mt-1 ${isAdmin ? 'text-right' : ''}`}>
                  {formatMessageTime(message.created_at)}
                </p>
              </div>
              {isAdmin && (
                <div className="w-8 h-8 bg-gradient-to-r from-[#4da6ff] to-[#0052cc] rounded-full flex items-center justify-center ml-2 flex-shrink-0">
                  <Bot className="w-4 h-4 text-white" />
                </div>
              )}
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={sendMessage} className="bg-white/90 backdrop-blur-md border-t border-gray-100 p-4">
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
            className="btn-primary px-4 flex items-center justify-center"
          >
            <Send size={18} />
          </button>
        </div>
      </form>
    </div>
  );
}
