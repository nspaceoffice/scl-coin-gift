'use client';

import { useEffect, useState, useRef } from 'react';
import { MessageCircle, Send, User, Bot, Headphones, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

interface Message {
  id: string;
  sender_type: 'user' | 'admin';
  content: string;
  created_at: string;
}

export default function ContactPage() {
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check for saved conversation
    const savedConversationId = localStorage.getItem('conversationId');
    const savedUserName = localStorage.getItem('contactUserName');
    const savedUserEmail = localStorage.getItem('contactUserEmail');

    if (savedConversationId && savedUserName) {
      setConversationId(savedConversationId);
      setUserName(savedUserName);
      setUserEmail(savedUserEmail || '');
      fetchMessages(savedConversationId);
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (conversationId) {
      const interval = setInterval(() => {
        fetchMessages(conversationId);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [conversationId]);

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

  const startConversation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim()) return;

    setLoading(true);
    try {
      const response = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userName,
          userEmail,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setConversationId(data.id);
        localStorage.setItem('conversationId', data.id);
        localStorage.setItem('contactUserName', userName);
        localStorage.setItem('contactUserEmail', userEmail);
        fetchMessages(data.id);
      }
    } catch (error) {
      console.error('Conversation start error:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !conversationId || sending) return;

    setSending(true);
    const messageContent = newMessage;
    setNewMessage('');

    // Optimistic update
    const optimisticMessage: Message = {
      id: `temp-${Date.now()}`,
      sender_type: 'user',
      content: messageContent,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimisticMessage]);

    try {
      const response = await fetch(`/api/conversations/${conversationId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderType: 'user',
          content: messageContent,
        }),
      });

      if (response.ok) {
        fetchMessages(conversationId);
      }
    } catch (error) {
      console.error('Message send error:', error);
      setNewMessage(messageContent);
    } finally {
      setSending(false);
    }
  };

  const formatTime = (dateString: string) => {
    return format(new Date(dateString), 'HH:mm', { locale: ko });
  };

  // Start Form
  if (!conversationId) {
    return (
      <div className="min-h-screen bg-gradient-animated relative overflow-hidden">
        {/* Floating decorations */}
        <div className="absolute top-16 left-6 text-3xl animate-float opacity-60" style={{ animationDelay: '0s' }}>💬</div>
        <div className="absolute top-28 right-10 text-2xl animate-float opacity-60" style={{ animationDelay: '0.5s' }}>✨</div>
        <div className="absolute top-44 left-12 text-xl animate-float opacity-60" style={{ animationDelay: '1s' }}>📞</div>
        <div className="absolute top-36 right-20 text-2xl animate-float opacity-60" style={{ animationDelay: '1.5s' }}>🎧</div>

        <div className="px-4 py-8 max-w-lg mx-auto relative z-10">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-r from-[#4da6ff] to-[#0052cc] rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Headphones className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-2xl font-bold mb-2 bg-gradient-to-r from-[#4da6ff] to-[#0052cc] bg-clip-text text-transparent">
              문의하기
            </h1>
            <p className="text-gray-500">
              궁금한 점이 있으시면 문의해주세요 💬
            </p>
          </div>

          <form onSubmit={startConversation} className="space-y-5">
            <div className="card p-5">
              <div className="flex items-center gap-2 mb-4">
                <User className="w-5 h-5 text-[#4da6ff]" />
                <h2 className="font-bold text-lg">문의자 정보</h2>
              </div>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="이름 *"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="input-field"
                  required
                />
                <input
                  type="email"
                  placeholder="이메일 (선택)"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  className="input-field"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !userName.trim()}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                  <span>시작 중...</span>
                </>
              ) : (
                <>
                  <MessageCircle size={20} />
                  <span>문의 시작하기</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-8 card p-5">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-[#4da6ff] to-[#0052cc] rounded-full flex items-center justify-center flex-shrink-0">
                <Clock className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold mb-1">운영 시간</h3>
                <p className="text-sm text-gray-500">
                  평일 09:00 - 18:00 (주말/공휴일 휴무)
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  문의하신 내용은 순차적으로 답변드립니다.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Chat Interface
  return (
    <div className="flex flex-col h-[calc(100vh-56px-64px)] md:h-[calc(100vh-56px)] bg-gradient-animated">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-md border-b border-gray-100 px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-r from-[#4da6ff] to-[#0052cc] rounded-full flex items-center justify-center shadow-md">
            <Headphones className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="font-bold">스클코인 고객센터</p>
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              평일 09:00 - 18:00
            </p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-8">
            <span className="text-4xl mb-2 block">💬</span>
            <p className="text-gray-500 text-sm">
              문의 내용을 입력해주세요
            </p>
          </div>
        )}

        {messages.map((message) => {
          const isUser = message.sender_type === 'user';

          return (
            <div
              key={message.id}
              className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className="w-8 h-8 bg-gradient-to-r from-[#4da6ff] to-[#0052cc] rounded-full flex items-center justify-center mr-2 flex-shrink-0">
                  <Bot className="w-4 h-4 text-white" />
                </div>
              )}
              <div className={`max-w-[75%]`}>
                <div
                  className={`rounded-2xl px-4 py-3 ${
                    isUser
                      ? 'bg-gradient-to-r from-[#ff6b6b] to-[#ffa502] text-white rounded-br-sm shadow-md'
                      : 'bg-white rounded-bl-sm shadow-md'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>
                <p className={`text-xs text-gray-400 mt-1 ${isUser ? 'text-right' : ''}`}>
                  {formatTime(message.created_at)}
                </p>
              </div>
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
            placeholder="메시지를 입력하세요..."
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
