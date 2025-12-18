'use client';

import { useState } from 'react';
import { Wallet, ArrowDownLeft, ArrowUpRight, RefreshCcw, Search, Coins } from 'lucide-react';
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
  purchase: { label: '구매', icon: ArrowUpRight, color: 'text-blue-600', bg: 'bg-blue-50' },
  refund: { label: '환불', icon: RefreshCcw, color: 'text-green-600', bg: 'bg-green-50' },
  gift_received: { label: '선물받음', icon: ArrowDownLeft, color: 'text-[#FF4747]', bg: 'bg-[#FFF5F5]' },
};

export default function CashPage() {
  const [cashHistory, setCashHistory] = useState<CashItem[]>([]);
  const [totalCash, setTotalCash] = useState(0);
  const [loading, setLoading] = useState(false);
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
    <div className="min-h-screen bg-[#F8F9FA]">
      {/* Header */}
      <div className="bg-white border-b border-[#F0F0F0]">
        <div className="max-w-lg mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold text-[#1a1a1a] mb-2">나의 캐시</h1>
          <p className="text-[#666] text-sm">구매한 캐시와 환불된 캐시를 확인하세요</p>
        </div>
      </div>

      <div className="px-4 py-6 max-w-lg mx-auto">
        {/* Search Form */}
        <form onSubmit={handleSearch} className="mb-6">
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-3">
              <Search className="w-5 h-5 text-[#FF4747]" />
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
              <button type="submit" className="btn-primary px-6">
                조회
              </button>
            </div>
          </div>
        </form>

        {/* Balance Card */}
        {searched && (
          <div className="card p-6 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-[#FF4747] rounded-full flex items-center justify-center">
                <Coins className="w-7 h-7 text-white" />
              </div>
              <div>
                <p className="text-sm text-[#666]">보유 캐시</p>
                <p className="text-3xl font-bold text-[#1a1a1a]">
                  {formatNumber(totalCash)}원
                </p>
              </div>
            </div>
            <p className="text-sm text-[#999] mt-4 bg-[#F8F9FA] rounded-lg p-3">
              스페이스클라우드에서 사용 가능합니다
            </p>
          </div>
        )}

        {/* Cash History */}
        {loading ? (
          <div className="text-center py-12">
            <div className="spinner mx-auto mb-4" />
            <p className="text-[#666]">캐시 정보를 불러오는 중...</p>
          </div>
        ) : searched && cashHistory.length === 0 ? (
          <div className="card p-8 text-center">
            <Wallet className="w-12 h-12 text-[#ccc] mx-auto mb-4" />
            <p className="text-[#666] font-medium">캐시 내역이 없습니다</p>
            <p className="text-sm text-[#999] mt-2">선물이 30일 내 미등록되면 캐시로 환불됩니다</p>
          </div>
        ) : searched && (
          <div className="space-y-3">
            <h2 className="font-bold text-base mb-4">캐시 내역</h2>
            {cashHistory.map((item) => {
              const config = typeConfig[item.type];
              const Icon = config.icon;

              return (
                <div key={item.id} className="card p-4 flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full ${config.bg} flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${config.color}`} />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{item.description || config.label}</p>
                    <p className="text-xs text-[#999]">{formatDate(item.created_at)}</p>
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
        <div className="mt-8 info-box">
          <h3 className="font-semibold mb-3">캐시 안내</h3>
          <ul className="text-sm text-[#666] space-y-2">
            <li>• 선물한 코인이 30일 내 등록되지 않으면 캐시로 자동 환불됩니다</li>
            <li>• 캐시는 스페이스클라우드에서 사용할 수 있습니다</li>
            <li>• 캐시 사용 관련 문의는 고객센터로 연락해주세요</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
