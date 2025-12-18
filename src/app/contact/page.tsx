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
      <div className="min-h-screen bg-[#F8F9FA]">
        {/* Header */}
        <div className="bg-white border-b border-[#F0F0F0]">
          <div className="max-w-lg mx-auto px-4 py-8 text-center">
            <h1 className="text-2xl font-bold text-[#1a1a1a] mb-2">문의하기</h1>
            <p className="text-[#666] text-sm">궁금한 점이 있으시면 문의해주세요</p>
          </div>
        </div>

        <div className="px-4 py-6 max-w-lg mx-auto">
          <form onSubmit={startConversation} className="space-y-4">
            <div className="card p-5">
              <div className="flex items-center gap-2 mb-4">
                <User className="w-5 h-5 text-[#FF4747]" />
                <h2 className="font-bold text-base">문의자 정보</h2>
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
                <div className="spinner" />
              ) : (
                <>
                  <MessageCircle size={20} />
                  <span>문의 시작하기</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 info-box">
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-[#FF4747] flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold mb-1">운영 시간</h3>
                <p className="text-sm text-[#666]">평일 09:00 - 18:00 (주말/공휴일 휴무)</p>
                <p className="text-sm text-[#666] mt-1">문의하신 내용은 순차적으로 답변드립니다.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Chat Interface
  return (
    <div className="flex flex-col h-[calc(100vh-56px-64px)] md:h-[calc(100vh-56px)] bg-[#F8F9FA]">
      {/* Header */}
      <div className="bg-white border-b border-[#F0F0F0] px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-[#FF4747] rounded-full flex items-center justify-center">
            <Headphones className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="font-bold">스클코인 고객센터</p>
            <p className="text-xs text-[#666] flex items-center gap-1">
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
            <MessageCircle className="w-12 h-12 text-[#ccc] mx-auto mb-4" />
            <p className="text-[#666] text-sm">문의 내용을 입력해주세요</p>
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
                <div className="w-8 h-8 bg-[#FF4747] rounded-full flex items-center justify-center mr-2 flex-shrink-0">
                  <Bot className="w-4 h-4 text-white" />
                </div>
              )}
              <div className="max-w-[75%]">
                <div
                  className={`rounded-2xl px-4 py-3 ${
                    isUser
                      ? 'bg-[#FF4747] text-white rounded-br-sm'
                      : 'bg-white rounded-bl-sm border border-[#F0F0F0]'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>
                <p className={`text-xs text-[#999] mt-1 ${isUser ? 'text-right' : ''}`}>
                  {formatTime(message.created_at)}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={sendMessage} className="bg-white border-t border-[#F0F0F0] p-4">
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
