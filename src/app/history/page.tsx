'use client';

import { useEffect, useState } from 'react';
import { History, Gift, Check, Clock, RefreshCcw, AlertCircle, Send, ChevronRight } from 'lucide-react';
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
  refunded: { label: '환불됨', icon: RefreshCcw, color: 'text-gray-600', bg: 'bg-gray-50' },
  expired: { label: '만료됨', icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50' },
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
    <div className="px-4 py-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <History className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-2xl font-bold mb-2">선물한 내역</h1>
        <p className="text-text-gray text-sm">
          내가 보낸 스클코인 선물을 확인하세요
        </p>
      </div>

      {/* Search Form */}
      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex gap-2">
          <input
            type="tel"
            placeholder="연락처로 조회"
            value={searchPhone}
            onChange={(e) => setSearchPhone(e.target.value)}
            className="input-field flex-1"
          />
          <button type="submit" className="btn-primary px-6">
            조회
          </button>
        </div>
      </form>

      {/* Results */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto" />
        </div>
      ) : searched && gifts.length === 0 ? (
        <div className="card p-8 text-center">
          <Gift className="w-12 h-12 text-text-light mx-auto mb-4" />
          <p className="text-text-gray">선물 내역이 없습니다</p>
        </div>
      ) : (
        <div className="space-y-3">
          {gifts.map((gift) => {
            const status = statusConfig[gift.status];
            const StatusIcon = status.icon;
            const daysRemaining = getDaysRemaining(gift.expires_at);

            return (
              <div key={gift.id} className="card p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold">{gift.receiver_name}님께</p>
                    <p className="text-lg font-bold text-primary">
                      {formatNumber(gift.amount)}원
                    </p>
                  </div>
                  <span className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${status.bg} ${status.color}`}>
                    <StatusIcon size={12} />
                    {status.label}
                  </span>
                </div>

                <div className="text-sm text-text-gray space-y-1 mb-3">
                  <p>코드: <span className="font-mono">{gift.code}</span></p>
                  <p>{formatDate(gift.created_at)}</p>
                  {gift.status === 'paid' && (
                    <p className="text-blue-600">등록 대기 중 (D-{daysRemaining})</p>
                  )}
                </div>

                {gift.message && (
                  <div className="bg-gray-50 rounded-lg p-3 mb-3 text-sm">
                    &ldquo;{gift.message}&rdquo;
                  </div>
                )}

                {gift.status === 'registered' && !gift.thank_you_message && (
                  <button
                    onClick={() => setSelectedGift(gift)}
                    className="w-full flex items-center justify-center gap-2 py-2 text-sm text-primary border border-primary rounded-lg hover:bg-primary/5 transition-colors"
                  >
                    <Send size={16} />
                    땡큐레터 보내기
                  </button>
                )}

                {gift.thank_you_message && (
                  <div className="bg-primary/5 rounded-lg p-3 text-sm">
                    <p className="text-xs text-primary mb-1">받은 땡큐레터</p>
                    <p>&ldquo;{gift.thank_you_message}&rdquo;</p>
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
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">땡큐레터 보내기</h3>
            <p className="text-sm text-text-gray mb-4">
              {selectedGift.sender_name}님께 감사의 메시지를 보내세요
            </p>
            <textarea
              placeholder="감사 메시지를 입력하세요"
              value={thankYouMessage}
              onChange={(e) => setThankYouMessage(e.target.value)}
              rows={4}
              className="w-full border border-border rounded-lg p-3 text-sm resize-none focus:outline-none focus:border-primary mb-4"
            />
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setSelectedGift(null);
                  setThankYouMessage('');
                }}
                className="flex-1 py-3 border border-border rounded-lg text-sm font-medium"
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
  );
}
