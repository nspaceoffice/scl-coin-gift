'use client';

import { useEffect, useState } from 'react';
import { ShoppingCart, Check, Clock, RefreshCcw, AlertCircle, Copy, ExternalLink } from 'lucide-react';
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
  pending: { label: '결제 대기', icon: Clock, color: 'text-yellow-600', bg: 'bg-yellow-50' },
  paid: { label: '등록 대기', icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50' },
  registered: { label: '등록 완료', icon: Check, color: 'text-green-600', bg: 'bg-green-50' },
  refunded: { label: '환불됨', icon: RefreshCcw, color: 'text-gray-600', bg: 'bg-gray-50' },
  expired: { label: '만료됨', icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50' },
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

  return (
    <div className="px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">스클코인 구매 리스트</h1>
        <p className="text-text-gray text-sm">
          모든 선물 내역을 관리하세요
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-2 mb-6">
        <div className="card p-3 text-center">
          <p className="text-2xl font-bold">{stats.total}</p>
          <p className="text-xs text-text-gray">전체</p>
        </div>
        <div className="card p-3 text-center">
          <p className="text-2xl font-bold text-blue-600">{stats.paid}</p>
          <p className="text-xs text-text-gray">등록대기</p>
        </div>
        <div className="card p-3 text-center">
          <p className="text-2xl font-bold text-green-600">{stats.registered}</p>
          <p className="text-xs text-text-gray">등록완료</p>
        </div>
        <div className="card p-3 text-center">
          <p className="text-2xl font-bold text-gray-600">{stats.refunded}</p>
          <p className="text-xs text-text-gray">환불</p>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
        {['all', 'pending', 'paid', 'registered', 'refunded', 'expired'].map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-colors ${
              filter === status
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-text-gray hover:bg-gray-200'
            }`}
          >
            {status === 'all' ? '전체' : statusConfig[status as keyof typeof statusConfig]?.label}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto" />
        </div>
      ) : filteredGifts.length === 0 ? (
        <div className="card p-8 text-center">
          <ShoppingCart className="w-12 h-12 text-text-light mx-auto mb-4" />
          <p className="text-text-gray">구매 내역이 없습니다</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredGifts.map((gift) => {
            const status = statusConfig[gift.status];
            const StatusIcon = status.icon;

            return (
              <div key={gift.id} className="card p-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-sm text-text-gray">
                      {gift.sender_name} → {gift.receiver_name}
                    </p>
                    <p className="text-lg font-bold text-primary">
                      {formatNumber(gift.amount)}원
                    </p>
                  </div>
                  <span className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${status.bg} ${status.color}`}>
                    <StatusIcon size={12} />
                    {status.label}
                  </span>
                </div>

                {/* Code with copy button */}
                <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-2 mb-3">
                  <span className="font-mono text-sm flex-1">{gift.code}</span>
                  <button
                    onClick={() => copyCode(gift.code)}
                    className="p-1 hover:bg-gray-200 rounded transition-colors"
                    title="코드 복사"
                  >
                    {copiedCode === gift.code ? (
                      <Check size={16} className="text-success" />
                    ) : (
                      <Copy size={16} className="text-text-gray" />
                    )}
                  </button>
                </div>

                <div className="text-xs text-text-gray space-y-1">
                  <p>생성: {formatDate(gift.created_at)}</p>
                  {gift.registered_at && <p>등록: {formatDate(gift.registered_at)}</p>}
                  <p>만료: {formatDate(gift.expires_at)}</p>
                </div>

                {/* API Connection Status */}
                <div className="mt-3 pt-3 border-t border-border">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-text-gray">스클 API 연동</span>
                    {gift.status === 'registered' ? (
                      <span className="text-success flex items-center gap-1">
                        <Check size={12} />
                        연동 완료
                      </span>
                    ) : gift.status === 'paid' ? (
                      <span className="text-yellow-600">대기 중</span>
                    ) : (
                      <span className="text-text-light">-</span>
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
        className="fixed bottom-20 right-4 md:bottom-4 w-12 h-12 bg-primary text-white rounded-full shadow-lg flex items-center justify-center hover:bg-primary-hover transition-colors"
      >
        <RefreshCcw size={20} />
      </button>
    </div>
  );
}
