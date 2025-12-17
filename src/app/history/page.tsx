'use client';

import { useEffect, useState } from 'react';
import { History, Gift, Check, Clock, RefreshCcw, AlertCircle, Send, ChevronRight, Sparkles, Search } from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

interface GiftItem {
  id: string;
  code: string;
  amount: number;
  sender_name: string;
  sender_phone: string;
  receiver_name: string;
  receiver_phone: string;
  message?: string;
  status: 'pending' | 'paid' | 'registered' | 'refunded' | 'expired';
  thank_you_message?: string;
  created_at: string;
  expires_at: string;
  registered_at?: string;
}

const statusConfig = {
  pending: { label: '결제 대기', icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-50', emoji: '⏳' },
  paid: { label: '등록 대기', icon: Gift, color: 'text-blue-600', bg: 'bg-blue-50', emoji: '🎁' },
  registered: { label: '등록 완료', icon: Check, color: 'text-green-600', bg: 'bg-green-50', emoji: '✅' },
  refunded: { label: '환불됨', icon: RefreshCcw, color: 'text-gray-600', bg: 'bg-gray-50', emoji: '💰' },
  expired: { label: '만료됨', icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50', emoji: '⚠️' },
};

export default function HistoryPage() {
  const [gifts, setGifts] = useState<GiftItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchPhone, setSearchPhone] = useState('');
  const [searched, setSearched] = useState(false);
  const [selectedGift, setSelectedGift] = useState<GiftItem | null>(null);
  const [thankYouMessage, setThankYouMessage] = useState('');

  const fetchGifts = async (phone: string) => {
    if (!phone) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/gifts?phone=${encodeURIComponent(phone)}`);
      const data = await response.json();

      if (response.ok) {
        setGifts(data);
        setSearched(true);
      }
    } catch (error) {
      console.error('Gift fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchGifts(searchPhone);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('ko-KR').format(num);
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'yyyy.MM.dd HH:mm', { locale: ko });
  };

  const getDaysRemaining = (expiresAt: string) => {
    const now = new Date();
    const expires = new Date(expiresAt);
    const diff = Math.ceil((expires.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, diff);
  };

  const sendThankYouMessage = async () => {
    if (!selectedGift || !thankYouMessage.trim()) return;

    try {
      const response = await fetch(`/api/gifts/${selectedGift.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ thankYouMessage }),
      });

      if (response.ok) {
        alert('땡큐레터가 전송되었습니다!');
        setSelectedGift(null);
        setThankYouMessage('');
        fetchGifts(searchPhone);
      }
    } catch (error) {
      console.error('Thank you message error:', error);
      alert('전송 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-animated">
      {/* Floating decorations */}
      <div className="absolute top-20 left-4 text-2xl animate-float opacity-50" style={{ animationDelay: '0s' }}>📋</div>
      <div className="absolute top-32 right-8 text-xl animate-float opacity-50" style={{ animationDelay: '0.5s' }}>🎁</div>
      <div className="absolute top-48 left-12 text-lg animate-float opacity-50" style={{ animationDelay: '1s' }}>💝</div>

      <div className="px-4 py-8 max-w-lg mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-[#845ef7] to-[#5c7cfa] rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <History className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold mb-2 bg-gradient-to-r from-[#845ef7] to-[#5c7cfa] bg-clip-text text-transparent">
            선물한 내역
          </h1>
          <p className="text-gray-500">
            내가 보낸 스클코인 선물을 확인하세요 💕
          </p>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="mb-6">
          <div className="card p-4">
            <div className="flex items-center gap-2 mb-3">
              <Search className="w-5 h-5 text-[#845ef7]" />
              <span className="font-semibold">내역 조회</span>
            </div>
            <div className="flex gap-2">
              <input
                type="tel"
                placeholder="연락처를 입력하세요"
                value={searchPhone}
                onChange={(e) => setSearchPhone(e.target.value)}
                className="input-field flex-1"
              />
              <button type="submit" className="btn-primary px-6">
                조회
              </button>
            </div>
          </div>
        </form>

        {/* Results */}
        {loading ? (
          <div className="text-center py-12">
            <div className="relative w-16 h-16 mx-auto mb-4">
              <div className="absolute inset-0 rounded-full border-4 border-[#845ef7]/20"></div>
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#845ef7] animate-spin"></div>
              <span className="absolute inset-0 flex items-center justify-center text-2xl">📋</span>
            </div>
            <p className="text-gray-500">내역을 불러오는 중...</p>
          </div>
        ) : searched && gifts.length === 0 ? (
          <div className="card p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🎁</span>
            </div>
            <p className="text-gray-500 font-medium">선물 내역이 없습니다</p>
            <p className="text-sm text-gray-400 mt-2">
              첫 번째 선물을 보내보세요!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {gifts.map((gift) => {
              const status = statusConfig[gift.status];
              const StatusIcon = status.icon;
              const daysRemaining = getDaysRemaining(gift.expires_at);

              return (
                <div key={gift.id} className="card p-5 relative overflow-hidden">
                  {/* Status ribbon */}
                  <div className={`absolute top-0 right-0 px-3 py-1 rounded-bl-xl ${status.bg}`}>
                    <span className={`flex items-center gap-1 text-xs font-medium ${status.color}`}>
                      {status.emoji} {status.label}
                    </span>
                  </div>

                  <div className="mb-4 pt-4">
                    <p className="text-gray-500 text-sm mb-1">받는 분</p>
                    <p className="font-bold text-lg">{gift.receiver_name}님께</p>
                    <p className="text-2xl font-bold bg-gradient-to-r from-[#ff6b6b] to-[#ffa502] bg-clip-text text-transparent">
                      {formatNumber(gift.amount)}원
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-3 mb-3">
                    <p className="text-xs text-gray-500 mb-1">코인 코드</p>
                    <p className="font-mono font-medium tracking-wider">{gift.code}</p>
                  </div>

                  <div className="text-sm text-gray-500 space-y-1 mb-3">
                    <p>📅 {formatDate(gift.created_at)}</p>
                    {gift.status === 'paid' && (
                      <p className="text-blue-600 font-medium">⏰ 등록 대기 중 (D-{daysRemaining})</p>
                    )}
                  </div>

                  {gift.message && (
                    <div className="bg-gradient-to-r from-[#fff0f0] to-[#fff9e6] rounded-xl p-4 mb-3">
                      <p className="text-sm text-gray-500 mb-1">💌 보낸 메시지</p>
                      <p className="text-sm">&ldquo;{gift.message}&rdquo;</p>
                    </div>
                  )}

                  {gift.status === 'registered' && !gift.thank_you_message && (
                    <button
                      onClick={() => setSelectedGift(gift)}
                      className="w-full flex items-center justify-center gap-2 py-3 text-sm font-medium text-[#ff6b6b] bg-[#fff0f0] rounded-xl hover:bg-[#ffe5e5] transition-colors"
                    >
                      <Send size={16} />
                      💕 땡큐레터 보내기
                    </button>
                  )}

                  {gift.thank_you_message && (
                    <div className="bg-gradient-to-r from-[#d4edda] to-[#c3e6cb] rounded-xl p-4">
                      <p className="text-xs text-green-700 mb-1">✨ 받은 땡큐레터</p>
                      <p className="text-sm text-green-800">&ldquo;{gift.thank_you_message}&rdquo;</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Thank You Modal */}
        {selectedGift && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl">
              <div className="text-center mb-4">
                <span className="text-4xl mb-2 block">💕</span>
                <h3 className="text-xl font-bold">땡큐레터 보내기</h3>
                <p className="text-sm text-gray-500 mt-1">
                  {selectedGift.sender_name}님께 감사의 메시지를 보내세요
                </p>
              </div>
              <textarea
                placeholder="감사 메시지를 입력하세요"
                value={thankYouMessage}
                onChange={(e) => setThankYouMessage(e.target.value)}
                rows={4}
                className="w-full border-2 border-gray-200 rounded-xl p-4 text-sm resize-none focus:outline-none focus:border-[#ff6b6b] focus:ring-4 focus:ring-[#fff0f0] transition-all mb-4"
              />
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setSelectedGift(null);
                    setThankYouMessage('');
                  }}
                  className="flex-1 py-3 border-2 border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={sendThankYouMessage}
                  disabled={!thankYouMessage.trim()}
                  className="flex-1 btn-primary"
                >
                  💌 보내기
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
