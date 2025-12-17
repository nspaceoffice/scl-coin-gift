'use client';

import { useEffect, useState } from 'react';
import { Wallet, ArrowDownLeft, ArrowUpRight, RefreshCcw, Search, TrendingUp, Coins } from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

interface CashItem {
  id: string;
  amount: number;
  type: 'purchase' | 'refund' | 'gift_received';
  description: string;
  created_at: string;
}

const typeConfig = {
  purchase: { label: '구매', icon: ArrowUpRight, color: 'text-blue-600', bg: 'bg-blue-50', emoji: '💳' },
  refund: { label: '환불', icon: RefreshCcw, color: 'text-green-600', bg: 'bg-green-50', emoji: '💰' },
  gift_received: { label: '선물받음', icon: ArrowDownLeft, color: 'text-[#ff6b6b]', bg: 'bg-[#fff0f0]', emoji: '🎁' },
};

export default function CashPage() {
  const [cashHistory, setCashHistory] = useState<CashItem[]>([]);
  const [totalCash, setTotalCash] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchPhone, setSearchPhone] = useState('');
  const [searched, setSearched] = useState(false);

  const fetchCash = async (phone: string) => {
    if (!phone) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/cash?phone=${encodeURIComponent(phone)}`);
      const data = await response.json();

      if (response.ok) {
        setCashHistory(data.history || []);
        setTotalCash(data.totalCash || 0);
        setSearched(true);
      }
    } catch (error) {
      console.error('Cash fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCash(searchPhone);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('ko-KR').format(num);
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'yyyy.MM.dd HH:mm', { locale: ko });
  };

  return (
    <div className="min-h-screen bg-gradient-animated relative overflow-hidden">
      {/* Floating decorations */}
      <div className="absolute top-16 left-6 text-3xl animate-float opacity-60" style={{ animationDelay: '0s' }}>💰</div>
      <div className="absolute top-28 right-10 text-2xl animate-float opacity-60" style={{ animationDelay: '0.5s' }}>✨</div>
      <div className="absolute top-44 left-12 text-xl animate-float opacity-60" style={{ animationDelay: '1s' }}>💵</div>
      <div className="absolute top-36 right-20 text-2xl animate-float opacity-60" style={{ animationDelay: '1.5s' }}>🪙</div>

      <div className="px-4 py-8 max-w-lg mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-[#ffd43b] to-[#fab005] rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Wallet className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold mb-2 bg-gradient-to-r from-[#ffd43b] to-[#fab005] bg-clip-text text-transparent">
            나의 캐시
          </h1>
          <p className="text-gray-500">
            구매한 캐시와 환불된 캐시를 확인하세요 💰
          </p>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="mb-6">
          <div className="card p-4">
            <div className="flex items-center gap-2 mb-3">
              <Search className="w-5 h-5 text-[#fab005]" />
              <span className="font-semibold">캐시 조회</span>
            </div>
            <div className="flex gap-2">
              <input
                type="tel"
                placeholder="연락처를 입력하세요"
                value={searchPhone}
                onChange={(e) => setSearchPhone(e.target.value)}
                className="input-field flex-1"
              />
              <button type="submit" className="btn-secondary px-6">
                조회
              </button>
            </div>
          </div>
        </form>

        {/* Balance Card */}
        {searched && (
          <div className="card p-6 mb-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#ffd43b] to-[#fab005]"></div>
            <div className="absolute top-4 right-4 text-3xl animate-bounce-soft">💰</div>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-r from-[#ffd43b] to-[#fab005] rounded-full flex items-center justify-center">
                <Coins className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-500">보유 캐시</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-[#ffd43b] to-[#fab005] bg-clip-text text-transparent">
                  {formatNumber(totalCash)}원
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 rounded-xl p-3">
              <TrendingUp className="w-4 h-4" />
              <span>스페이스클라우드에서 사용 가능합니다</span>
            </div>
          </div>
        )}

        {/* Cash History */}
        {loading ? (
          <div className="text-center py-12">
            <div className="relative w-16 h-16 mx-auto mb-4">
              <div className="absolute inset-0 rounded-full border-4 border-[#ffd43b]/20"></div>
              <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#ffd43b] animate-spin"></div>
              <span className="absolute inset-0 flex items-center justify-center text-2xl">💰</span>
            </div>
            <p className="text-gray-500">캐시 정보를 불러오는 중...</p>
          </div>
        ) : searched && cashHistory.length === 0 ? (
          <div className="card p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">💳</span>
            </div>
            <p className="text-gray-500 font-medium">캐시 내역이 없습니다</p>
            <p className="text-sm text-gray-400 mt-2">
              선물이 30일 내 미등록되면 캐시로 환불됩니다
            </p>
          </div>
        ) : searched && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xl">📋</span>
              <h2 className="font-bold text-lg">캐시 내역</h2>
            </div>
            {cashHistory.map((item) => {
              const config = typeConfig[item.type];
              const Icon = config.icon;

              return (
                <div key={item.id} className="card p-4 flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full ${config.bg} flex items-center justify-center`}>
                    <span className="text-xl">{config.emoji}</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{item.description || config.label}</p>
                    <p className="text-xs text-gray-500">{formatDate(item.created_at)}</p>
                  </div>
                  <p className={`font-bold text-lg ${item.amount > 0 ? 'text-green-600' : 'text-red-500'}`}>
                    {item.amount > 0 ? '+' : ''}{formatNumber(item.amount)}원
                  </p>
                </div>
              );
            })}
          </div>
        )}

        {/* Info Box */}
        <div className="mt-8 bg-gradient-to-r from-[#fff9e6] to-[#f0fff4] rounded-2xl p-5">
          <div className="flex items-start gap-3">
            <span className="text-2xl">💡</span>
            <div>
              <h3 className="font-semibold mb-2">캐시 안내</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• 선물한 코인이 30일 내 등록되지 않으면 캐시로 자동 환불됩니다</li>
                <li>• 캐시는 스페이스클라우드에서 사용할 수 있습니다</li>
                <li>• 캐시 사용 관련 문의는 고객센터로 연락해주세요</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
