'use client';

import { useState } from 'react';
import { History, Gift, Check, Clock, RefreshCcw, AlertCircle, Send, Search } from 'lucide-react';
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
  pending: { label: '결제 대기', icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-50' },
  paid: { label: '등록 대기', icon: Gift, color: 'text-blue-600', bg: 'bg-blue-50' },
  registered: { label: '등록 완료', icon: Check, color: 'text-green-600', bg: 'bg-green-50' },
  refunded: { label: '환불됨', icon: RefreshCcw, color: 'text-gray-600', bg: 'bg-gray-100' },
  expired: { label: '만료됨', icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50' },
};

export default function HistoryPage() {
  const [gifts, setGifts] = useState<GiftItem[]>([]);
  const [loading, setLoading] = useState(false);
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
    <div className="min-h-screen bg-[#F8F9FA]">
      {/* Header */}
      <div className="bg-white border-b border-[#F0F0F0]">
        <div className="max-w-lg mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold text-[#1a1a1a] mb-2">선물한 내역</h1>
          <p className="text-[#666] text-sm">내가 보낸 스클코인 선물을 확인하세요</p>
        </div>
      </div>

      <div className="px-4 py-6 max-w-lg mx-auto">
        {/* Search Form */}
        <form onSubmit={handleSearch} className="mb-6">
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-3">
              <Search className="w-5 h-5 text-[#FF4747]" />
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
            <div className="spinner mx-auto mb-4" />
            <p className="text-[#666]">내역을 불러오는 중...</p>
          </div>
        ) : searched && gifts.length === 0 ? (
          <div className="card p-8 text-center">
            <Gift className="w-12 h-12 text-[#ccc] mx-auto mb-4" />
            <p className="text-[#666] font-medium">선물 내역이 없습니다</p>
            <p className="text-sm text-[#999] mt-2">첫 번째 선물을 보내보세요!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {gifts.map((gift) => {
              const status = statusConfig[gift.status];
              const daysRemaining = getDaysRemaining(gift.expires_at);

              return (
                <div key={gift.id} className="card p-5">
                  {/* Status */}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-[#666] text-sm mb-1">받는 분</p>
                      <p className="font-bold text-lg">{gift.receiver_name}님께</p>
                      <p className="text-2xl font-bold text-[#FF4747]">
                        {formatNumber(gift.amount)}원
                      </p>
                    </div>
                    <span className={`text-xs font-medium ${status.color} ${status.bg} px-2 py-1 rounded`}>
                      {status.label}
                    </span>
                  </div>

                  {/* Code */}
                  <div className="bg-[#F8F9FA] rounded-lg p-3 mb-3">
                    <p className="text-xs text-[#999] mb-1">코인 코드</p>
                    <p className="font-mono font-medium tracking-wider">{gift.code}</p>
                  </div>

                  {/* Info */}
                  <div className="text-sm text-[#666] space-y-1 mb-3">
                    <p>{formatDate(gift.created_at)}</p>
                    {gift.status === 'paid' && (
                      <p className="text-blue-600 font-medium">등록 대기 중 (D-{daysRemaining})</p>
                    )}
                  </div>

                  {/* Spacecloud API Status Placeholder */}
                  {gift.status === 'paid' && (
                    <div className="bg-[#F8F9FA] rounded-lg p-3 mb-3 border border-dashed border-[#E5E5E5]">
                      <p className="text-xs text-[#999] mb-1">코인 사용 상태</p>
                      <p className="text-sm text-[#666]">Spacecloud API 연동 예정</p>
                    </div>
                  )}

                  {/* Message */}
                  {gift.message && (
                    <div className="bg-[#F8F9FA] rounded-lg p-4 mb-3">
                      <p className="text-sm text-[#999] mb-1">보낸 메시지</p>
                      <p className="text-sm">&ldquo;{gift.message}&rdquo;</p>
                    </div>
                  )}

                  {/* Thank You Button */}
                  {gift.status === 'registered' && !gift.thank_you_message && (
                    <button
                      onClick={() => setSelectedGift(gift)}
                      className="w-full flex items-center justify-center gap-2 py-3 text-sm font-medium text-[#FF4747] bg-[#FFF5F5] rounded-lg hover:bg-[#FFE5E5] transition-colors"
                    >
                      <Send size={16} />
                      땡큐레터 보내기
                    </button>
                  )}

                  {/* Thank You Message */}
                  {gift.thank_you_message && (
                    <div className="bg-green-50 rounded-lg p-4">
                      <p className="text-xs text-green-700 mb-1">받은 땡큐레터</p>
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
            <div className="bg-white rounded-2xl p-6 w-full max-w-md">
              <div className="text-center mb-4">
                <h3 className="text-xl font-bold">땡큐레터 보내기</h3>
                <p className="text-sm text-[#666] mt-1">
                  {selectedGift.sender_name}님께 감사의 메시지를 보내세요
                </p>
              </div>
              <textarea
                placeholder="감사 메시지를 입력하세요"
                value={thankYouMessage}
                onChange={(e) => setThankYouMessage(e.target.value)}
                rows={4}
                className="w-full border border-[#E5E5E5] rounded-xl p-4 text-sm resize-none focus:outline-none focus:border-[#FF4747] transition-colors mb-4"
              />
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setSelectedGift(null);
                    setThankYouMessage('');
                  }}
                  className="flex-1 py-3 border border-[#E5E5E5] rounded-xl text-sm font-medium hover:bg-[#F8F9FA] transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={sendThankYouMessage}
                  disabled={!thankYouMessage.trim()}
                  className="flex-1 btn-primary"
                >
                  보내기
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
