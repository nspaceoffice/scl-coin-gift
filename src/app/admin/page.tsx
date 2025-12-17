'use client';

import { useEffect, useState } from 'react';
import { ShoppingCart, Check, Clock, RefreshCcw, AlertCircle, Copy, Package, TrendingUp, Gift } from 'lucide-react';
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
  payment_id?: string;
  created_at: string;
  expires_at: string;
  registered_at?: string;
}

const statusConfig = {
  pending: { label: '결제 대기', icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-50', emoji: '⏳' },
  paid: { label: '등록 대기', icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50', emoji: '🎁' },
  registered: { label: '등록 완료', icon: Check, color: 'text-green-600', bg: 'bg-green-50', emoji: '✅' },
  refunded: { label: '환불됨', icon: RefreshCcw, color: 'text-gray-600', bg: 'bg-gray-50', emoji: '💰' },
  expired: { label: '만료됨', icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50', emoji: '⚠️' },
};

export default function AdminPage() {
  const [gifts, setGifts] = useState<GiftItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    fetchGifts();
  }, []);

  const fetchGifts = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/gifts?admin=true');
      const data = await response.json();
      if (response.ok) {
        setGifts(data);
      }
    } catch (error) {
      console.error('Gifts fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const copyCode = async (code: string) => {
    await navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('ko-KR').format(num);
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'yyyy.MM.dd HH:mm', { locale: ko });
  };

  const filteredGifts = gifts.filter((gift) => {
    if (filter === 'all') return true;
    return gift.status === filter;
  });

  const stats = {
    total: gifts.length,
    pending: gifts.filter((g) => g.status === 'pending').length,
    paid: gifts.filter((g) => g.status === 'paid').length,
    registered: gifts.filter((g) => g.status === 'registered').length,
    refunded: gifts.filter((g) => g.status === 'refunded').length,
  };

  const totalAmount = gifts
    .filter((g) => g.status === 'paid' || g.status === 'registered')
    .reduce((sum, g) => sum + g.amount, 0);

  return (
    <div className="min-h-screen bg-gradient-animated">
      <div className="px-4 py-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-gradient-to-r from-[#ff6b6b] to-[#ffa502] rounded-xl flex items-center justify-center shadow-md">
              <Package className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-[#ff6b6b] to-[#ffa502] bg-clip-text text-transparent">
                스클코인 구매 리스트
              </h1>
              <p className="text-gray-500 text-sm">
                모든 선물 내역을 관리하세요
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          <div className="card p-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <span className="text-lg">📦</span>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
            <p className="text-xs text-gray-500">전체</p>
          </div>
          <div className="card p-4 text-center border-l-4 border-blue-400">
            <div className="flex items-center justify-center gap-2 mb-1">
              <span className="text-lg">🎁</span>
              <p className="text-2xl font-bold text-blue-600">{stats.paid}</p>
            </div>
            <p className="text-xs text-gray-500">등록대기</p>
          </div>
          <div className="card p-4 text-center border-l-4 border-green-400">
            <div className="flex items-center justify-center gap-2 mb-1">
              <span className="text-lg">✅</span>
              <p className="text-2xl font-bold text-green-600">{stats.registered}</p>
            </div>
            <p className="text-xs text-gray-500">등록완료</p>
          </div>
          <div className="card p-4 text-center border-l-4 border-gray-400">
            <div className="flex items-center justify-center gap-2 mb-1">
              <span className="text-lg">💰</span>
              <p className="text-2xl font-bold text-gray-600">{stats.refunded}</p>
            </div>
            <p className="text-xs text-gray-500">환불</p>
          </div>
          <div className="card p-4 text-center col-span-2 md:col-span-1 bg-gradient-to-r from-[#fff0f0] to-[#fff9e6]">
            <div className="flex items-center justify-center gap-2 mb-1">
              <TrendingUp className="w-5 h-5 text-[#ff6b6b]" />
              <p className="text-xl font-bold text-[#ff6b6b]">{formatNumber(totalAmount)}원</p>
            </div>
            <p className="text-xs text-gray-500">총 거래액</p>
          </div>
        </div>

        {/* Filter */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
          {[
            { key: 'all', label: '전체', emoji: '📦' },
            { key: 'pending', label: '결제대기', emoji: '⏳' },
            { key: 'paid', label: '등록대기', emoji: '🎁' },
            { key: 'registered', label: '등록완료', emoji: '✅' },
            { key: 'refunded', label: '환불', emoji: '💰' },
            { key: 'expired', label: '만료', emoji: '⚠️' },
          ].map((status) => (
            <button
              key={status.key}
              onClick={() => setFilter(status.key)}
              className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-all flex items-center gap-1 ${
                filter === status.key
                  ? 'bg-gradient-to-r from-[#ff6b6b] to-[#ffa502] text-white shadow-md'
                  : 'bg-white text-gray-600 hover:bg-gray-100 shadow-sm'
              }`}
            >
              <span>{status.emoji}</span>
              {status.label}
            </button>
          ))}
        </div>

        {/* List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="relative w-16 h-16 mx-auto mb-4">
              <div className="absolute inset-0 rounded-full border-4 border-[#ff6b6b]/20"></div>
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#ff6b6b] animate-spin"></div>
              <span className="absolute inset-0 flex items-center justify-center text-2xl">📦</span>
            </div>
            <p className="text-gray-500">데이터를 불러오는 중...</p>
          </div>
        ) : filteredGifts.length === 0 ? (
          <div className="card p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">📦</span>
            </div>
            <p className="text-gray-500 font-medium">구매 내역이 없습니다</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredGifts.map((gift) => {
              const status = statusConfig[gift.status];
              const StatusIcon = status.icon;

              return (
                <div key={gift.id} className="card p-4 relative overflow-hidden">
                  {/* Status ribbon */}
                  <div className={`absolute top-0 right-0 px-3 py-1 rounded-bl-xl ${status.bg}`}>
                    <span className={`flex items-center gap-1 text-xs font-medium ${status.color}`}>
                      {status.emoji} {status.label}
                    </span>
                  </div>

                  <div className="flex items-start justify-between mb-3 pt-4">
                    <div>
                      <p className="text-sm text-gray-500">
                        {gift.sender_name} → {gift.receiver_name}
                      </p>
                      <p className="text-xl font-bold bg-gradient-to-r from-[#ff6b6b] to-[#ffa502] bg-clip-text text-transparent">
                        {formatNumber(gift.amount)}원
                      </p>
                    </div>
                  </div>

                  {/* Code with copy button */}
                  <div className="flex items-center gap-2 bg-gray-50 rounded-xl p-3 mb-3">
                    <span className="font-mono text-sm flex-1 tracking-wider">{gift.code}</span>
                    <button
                      onClick={() => copyCode(gift.code)}
                      className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                        copiedCode === gift.code
                          ? 'bg-green-100 text-green-600'
                          : 'bg-white text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {copiedCode === gift.code ? (
                        <span className="flex items-center gap-1">
                          <Check size={14} />
                          복사됨
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          <Copy size={14} />
                          복사
                        </span>
                      )}
                    </button>
                  </div>

                  <div className="text-xs text-gray-500 space-y-1">
                    <p>📅 생성: {formatDate(gift.created_at)}</p>
                    {gift.registered_at && <p>✅ 등록: {formatDate(gift.registered_at)}</p>}
                    <p>⏰ 만료: {formatDate(gift.expires_at)}</p>
                  </div>

                  {/* API Connection Status */}
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">스클 API 연동</span>
                      {gift.status === 'registered' ? (
                        <span className="text-green-600 flex items-center gap-1 bg-green-50 px-2 py-1 rounded-full">
                          <Check size={12} />
                          연동 완료
                        </span>
                      ) : gift.status === 'paid' ? (
                        <span className="text-yellow-600 bg-yellow-50 px-2 py-1 rounded-full">대기 중</span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Refresh Button */}
        <button
          onClick={fetchGifts}
          className="fixed bottom-20 right-4 md:bottom-4 w-14 h-14 bg-gradient-to-r from-[#ff6b6b] to-[#ffa502] text-white rounded-full shadow-lg flex items-center justify-center hover:shadow-xl transition-all"
        >
          <RefreshCcw size={22} />
        </button>
      </div>
    </div>
  );
}
