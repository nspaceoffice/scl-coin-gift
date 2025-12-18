'use client';

import { useEffect, useState, useRef } from 'react';
import { MessageCircle, Send, Plus, ChevronLeft, Clock, CheckCircle, Circle, X } from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

interface Message {
  id: string;
  sender_type: 'user' | 'admin';
  content: string;
  created_at: string;
}

interface Conversation {
  id: string;
  user_name: string;
  user_email?: string;
  status: 'open' | 'answered' | 'closed';
  created_at: string;
  updated_at: string;
  last_message?: string;
  message_count: number;
}

export default function ContactPage() {
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showNewForm, setShowNewForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [initialMessage, setInitialMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load saved user info and conversations
  useEffect(() => {
    const savedUserName = localStorage.getItem('contactUserName');
    const savedUserEmail = localStorage.getItem('contactUserEmail');

    if (savedUserName) {
      setUserName(savedUserName);
      setUserEmail(savedUserEmail || '');
      fetchConversations(savedUserName, savedUserEmail || '');
    } else {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Poll for new messages when viewing a conversation
  useEffect(() => {
    if (selectedConversation) {
      const interval = setInterval(() => {
        fetchMessages(selectedConversation.id);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [selectedConversation]);

  const fetchConversations = async (name: string, email: string) => {
    try {
      const params = new URLSearchParams();
      if (name) params.append('userName', name);
      if (email) params.append('userEmail', email);

      const response = await fetch(`/api/conversations?${params.toString()}`);
      const data = await response.json();

      if (response.ok && Array.isArray(data)) {
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

  const startConversation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim() || !initialMessage.trim()) return;

    setCreating(true);
    try {
      // Create conversation
      const response = await fetch('/api/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userName, userEmail }),
      });

      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('contactUserName', userName);
        localStorage.setItem('contactUserEmail', userEmail);

        // Send initial message
        await fetch(`/api/conversations/${data.id}/messages`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            senderType: 'user',
            content: initialMessage,
          }),
        });

        // Refresh and select
        await fetchConversations(userName, userEmail);
        const newConv: Conversation = {
          ...data,
          last_message: initialMessage,
          message_count: 1,
        };
        setSelectedConversation(newConv);
        await fetchMessages(data.id);
        setShowNewForm(false);
        setInitialMessage('');
      }
    } catch (error) {
      console.error('Conversation start error:', error);
    } finally {
      setCreating(false);
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
      sender_type: 'user',
      content: messageContent,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimisticMessage]);

    try {
      const response = await fetch(`/api/conversations/${selectedConversation.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderType: 'user',
          content: messageContent,
        }),
      });

      if (response.ok) {
        fetchMessages(selectedConversation.id);
        fetchConversations(userName, userEmail);
      }
    } catch (error) {
      console.error('Message send error:', error);
      setNewMessage(messageContent);
    } finally {
      setSending(false);
    }
  };

  const openConversation = async (conv: Conversation) => {
    setSelectedConversation(conv);
    await fetchMessages(conv.id);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    if (isToday) {
      return format(date, 'HH:mm', { locale: ko });
    }
    return format(date, 'MM.dd', { locale: ko });
  };

  const formatFullDate = (dateString: string) => {
    return format(new Date(dateString), 'yyyy.MM.dd HH:mm', { locale: ko });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'answered':
        return (
          <span className="flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded">
            <CheckCircle size={12} />
            답변완료
          </span>
        );
      case 'closed':
        return (
          <span className="flex items-center gap-1 text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">
            완료
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">
            <Circle size={12} />
            대기중
          </span>
        );
    }
  };

  // First time user - show registration form
  if (!userName && !loading) {
    return (
      <div className="min-h-screen bg-[#F8F9FA]">
        <div className="bg-white border-b border-[#F0F0F0]">
          <div className="max-w-lg mx-auto px-4 py-8 text-center">
            <h1 className="text-2xl font-bold text-[#1a1a1a] mb-2">문의하기</h1>
            <p className="text-[#666] text-sm">궁금한 점이 있으시면 문의해주세요</p>
          </div>
        </div>

        <div className="px-4 py-6 max-w-lg mx-auto">
          <form onSubmit={startConversation} className="space-y-4">
            <div className="card p-5">
              <h2 className="font-bold text-base mb-4">문의자 정보</h2>
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
                  placeholder="이메일 (답변 알림 수신)"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  className="input-field"
                />
              </div>
            </div>

            <div className="card p-5">
              <h2 className="font-bold text-base mb-4">문의 내용</h2>
              <textarea
                placeholder="문의하실 내용을 입력해주세요 *"
                value={initialMessage}
                onChange={(e) => setInitialMessage(e.target.value)}
                rows={5}
                className="w-full border border-[#E5E5E5] rounded-xl p-4 text-sm resize-none focus:outline-none focus:border-[#FF4747] transition-colors"
                required
              />
            </div>

            <button
              type="submit"
              disabled={creating || !userName.trim() || !initialMessage.trim()}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {creating ? (
                <div className="spinner" />
              ) : (
                <>
                  <Send size={18} />
                  <span>문의 등록하기</span>
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

  // Viewing a specific conversation
  if (selectedConversation) {
    return (
      <div className="flex flex-col h-[calc(100vh-56px-64px)] md:h-[calc(100vh-56px)] bg-[#F8F9FA]">
        {/* Header */}
        <div className="bg-white border-b border-[#F0F0F0] px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSelectedConversation(null)}
              className="p-2 -ml-2 hover:bg-[#F8F9FA] rounded-lg transition-colors"
            >
              <ChevronLeft size={20} className="text-[#666]" />
            </button>
            <div className="flex-1">
              <p className="font-bold text-sm">문의 #{selectedConversation.id.slice(-6).toUpperCase()}</p>
              <p className="text-xs text-[#666]">{formatFullDate(selectedConversation.created_at)}</p>
            </div>
            {getStatusBadge(selectedConversation.status)}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => {
            const isUser = message.sender_type === 'user';

            return (
              <div key={message.id} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                <div className="max-w-[80%]">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-medium ${isUser ? 'text-[#FF4747]' : 'text-[#666]'}`}>
                      {isUser ? userName : '고객센터'}
                    </span>
                    <span className="text-xs text-[#999]">{formatFullDate(message.created_at)}</span>
                  </div>
                  <div
                    className={`rounded-xl px-4 py-3 ${
                      isUser
                        ? 'bg-[#FF4747] text-white'
                        : 'bg-white border border-[#F0F0F0]'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>
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
              placeholder="추가 문의사항을 입력하세요..."
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

  // Inbox view - list of conversations
  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      {/* Header */}
      <div className="bg-white border-b border-[#F0F0F0]">
        <div className="max-w-lg mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-[#1a1a1a]">문의 내역</h1>
              <p className="text-[#666] text-sm mt-1">{userName}님의 문의 목록</p>
            </div>
            <button
              onClick={() => setShowNewForm(true)}
              className="btn-primary px-4 py-2 h-auto flex items-center gap-2"
            >
              <Plus size={18} />
              <span className="text-sm">새 문의</span>
            </button>
          </div>
        </div>
      </div>

      <div className="px-4 py-4 max-w-lg mx-auto">
        {loading ? (
          <div className="text-center py-12">
            <div className="spinner mx-auto mb-4" />
            <p className="text-[#666]">문의 내역을 불러오는 중...</p>
          </div>
        ) : conversations.length === 0 ? (
          <div className="card p-8 text-center">
            <MessageCircle className="w-12 h-12 text-[#ccc] mx-auto mb-4" />
            <p className="text-[#666] font-medium">문의 내역이 없습니다</p>
            <p className="text-sm text-[#999] mt-2">새 문의를 등록해주세요</p>
            <button
              onClick={() => setShowNewForm(true)}
              className="btn-primary mt-4 px-6"
            >
              문의하기
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {conversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => openConversation(conv)}
                className="card p-4 w-full text-left hover:border-[#FF4747] transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">#{conv.id.slice(-6).toUpperCase()}</span>
                      {getStatusBadge(conv.status)}
                    </div>
                    <p className="text-sm text-[#1a1a1a] line-clamp-2">
                      {conv.last_message || '메시지 없음'}
                    </p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-[#999]">
                      <span>{formatDate(conv.updated_at || conv.created_at)}</span>
                      <span>메시지 {conv.message_count || 0}개</span>
                    </div>
                  </div>
                  <ChevronLeft size={18} className="text-[#ccc] rotate-180 flex-shrink-0 mt-1" />
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Info */}
        <div className="mt-6 info-box">
          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-[#FF4747] flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold mb-1">운영 시간</h3>
              <p className="text-sm text-[#666]">평일 09:00 - 18:00 (주말/공휴일 휴무)</p>
            </div>
          </div>
        </div>
      </div>

      {/* New Inquiry Modal */}
      {showNewForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-[#F0F0F0] px-5 py-4 flex items-center justify-between">
              <h2 className="font-bold text-lg">새 문의 등록</h2>
              <button
                onClick={() => setShowNewForm(false)}
                className="p-2 hover:bg-[#F8F9FA] rounded-lg transition-colors"
              >
                <X size={20} className="text-[#666]" />
              </button>
            </div>

            <form onSubmit={startConversation} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#1a1a1a] mb-2">문의 내용 *</label>
                <textarea
                  placeholder="문의하실 내용을 자세히 입력해주세요"
                  value={initialMessage}
                  onChange={(e) => setInitialMessage(e.target.value)}
                  rows={6}
                  className="w-full border border-[#E5E5E5] rounded-xl p-4 text-sm resize-none focus:outline-none focus:border-[#FF4747] transition-colors"
                  required
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowNewForm(false)}
                  className="flex-1 py-3 border border-[#E5E5E5] rounded-xl text-sm font-medium hover:bg-[#F8F9FA] transition-colors"
                >
                  취소
                </button>
                <button
                  type="submit"
                  disabled={creating || !initialMessage.trim()}
                  className="flex-1 btn-primary"
                >
                  {creating ? <div className="spinner" /> : '등록'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
