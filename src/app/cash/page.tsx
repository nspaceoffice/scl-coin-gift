'use client';

import { useEffect, useState } from 'react';
import { Wallet, ArrowDownLeft, ArrowUpRight, RefreshCcw } from 'lucide-react';
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
  purchase: { label: '구매', icon: ArrowUpRight, color: 'text-blue-600' },
  refund: { label: '환불', icon: RefreshCcw, color: 'text-green-600' },
  gift_received: { label: '선물받음', icon: ArrowDownLeft, color: 'text-primary' },
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
    <div className="px-4 py-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Wallet className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-2xl font-bold mb-2">나의 캐시</h1>
        <p className="text-text-gray text-sm">
          구매한 캐시와 환불된 캐시를 확인하세요
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

      {/* Balance Card */}
      {searched && (
        <div className="card p-6 mb-6 text-center bg-gradient-to-br from-primary to-primary-hover text-white">
          <p className="text-sm opacity-90 mb-1">보유 캐시</p>
          <p className="text-3xl font-bold">{formatNumber(totalCash)}원</p>
        </div>
      )}

      {/* Cash History */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto" />
        </div>
      ) : searched && cashHistory.length === 0 ? (
        <div className="card p-8 text-center">
          <Wallet className="w-12 h-12 text-text-light mx-auto mb-4" />
          <p className="text-text-gray">캐시 내역이 없습니다</p>
          <p className="text-sm text-text-light mt-2">
            선물이 30일 내 미등록되면 캐시로 환불됩니다
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          <h2 className="font-semibold text-sm text-text-gray mb-3">캐시 내역</h2>
          {cashHistory.map((item) => {
            const config = typeConfig[item.type];
            const Icon = config.icon;

            return (
              <div key={item.id} className="card p-4 flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center ${config.color}`}>
                  <Icon size={20} />
                </div>
                <div className="flex-1">
                  <p className="font-medium">{item.description || config.label}</p>
                  <p className="text-xs text-text-gray">{formatDate(item.created_at)}</p>
                </div>
                <p className={`font-bold ${item.amount > 0 ? 'text-success' : 'text-error'}`}>
                  {item.amount > 0 ? '+' : ''}{formatNumber(item.amount)}원
                </p>
              </div>
            );
          })}
        </div>
      )}

      {/* Info Box */}
      <div className="mt-8 bg-gray-50 rounded-lg p-4">
        <h3 className="font-semibold mb-2 text-sm">캐시 안내</h3>
        <ul className="text-sm text-text-gray space-y-1">
          <li>• 선물한 코인이 30일 내 등록되지 않으면 캐시로 자동 환불됩니다</li>
          <li>• 캐시는 스페이스클라우드에서 사용할 수 있습니다</li>
          <li>• 캐시 사용 관련 문의는 고객센터로 연락해주세요</li>
        </ul>
      </div>
    </div>
  );
}
