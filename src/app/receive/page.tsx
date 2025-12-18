'use client';

import { useState } from 'react';
import { Gift, Check, Copy, Clock, Search, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

interface ReceivedGift {
  id: string;
  code: string;
  amount: number;
  sender_name: string;
  message?: string;
  status: 'pending' | 'paid' | 'registered' | 'refunded' | 'expired';
  created_at: string;
  expires_at: string;
}

const statusConfig = {
  pending: { label: '결제 대기', color: 'text-yellow-600', bg: 'bg-yellow-50' },
  paid: { label: '사용 가능', color: 'text-blue-600', bg: 'bg-blue-50' },
  registered: { label: '사용 완료', color: 'text-green-600', bg: 'bg-green-50' },
  refunded: { label: '환불됨', color: 'text-gray-600', bg: 'bg-gray-100' },
  expired: { label: '만료됨', color: 'text-red-600', bg: 'bg-red-50' },
};

export default function ReceivePage() {
  const [searchValue, setSearchValue] = useState('');
  const [searchType, setSearchType] = useState<'phone' | 'email'>('phone');
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [gifts, setGifts] = useState<ReceivedGift[]>([]);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const fetchReceivedGifts = async () => {
    if (!searchValue.trim()) return;

    setLoading(true);
    try {
      const param = searchType === 'phone' ? 'phone' : 'email';
      const response = await fetch(`/api/gifts/received?${param}=${encodeURIComponent(searchValue)}`);
      const data = await response.json();

      if (response.ok) {
        setGifts(data);
        setSearched(true);
      }
    } catch (error) {
      console.error('Received gifts fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchReceivedGifts();
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
    return format(new Date(dateString), 'yyyy.MM.dd', { locale: ko });
  };

  const getDaysRemaining = (expiresAt: string) => {
    const now = new Date();
    const expires = new Date(expiresAt);
    const diff = Math.ceil((expires.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, diff);
  };

  const availableGifts = gifts.filter(g => g.status === 'paid');
  const usedGifts = gifts.filter(g => g.status === 'registered');
  const otherGifts = gifts.filter(g => !['paid', 'registered'].includes(g.status));

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      {/* Header */}
      <div className="bg-white border-b border-[#F0F0F0]">
        <div className="max-w-lg mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold text-[#1a1a1a] mb-2">받은 선물</h1>
          <p className="text-[#666] text-sm">나에게 도착한 스클코인 선물을 확인하세요</p>
        </div>
      </div>

      <div className="px-4 py-6 max-w-lg mx-auto">
        {/* Search Form */}
        <form onSubmit={handleSearch} className="mb-6">
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-4">
              <Search className="w-5 h-5 text-[#FF4747]" />
              <span className="font-semibold">내 선물 조회</span>
            </div>

            {/* Search Type Toggle */}
            <div className="flex gap-2 mb-3">
              <button
                type="button"
                onClick={() => setSearchType('phone')}
                className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  searchType === 'phone'
                    ? 'bg-[#FF4747] text-white'
                    : 'bg-[#F8F9FA] text-[#666]'
                }`}
              >
                연락처
              </button>
              <button
                type="button"
                onClick={() => setSearchType('email')}
                className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  searchType === 'email'
                    ? 'bg-[#FF4747] text-white'
                    : 'bg-[#F8F9FA] text-[#666]'
                }`}
              >
                이메일
              </button>
            </div>

            <div className="flex gap-2">
              <input
                type={searchType === 'email' ? 'email' : 'tel'}
                placeholder={searchType === 'phone' ? '연락처를 입력하세요' : '이메일을 입력하세요'}
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
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
            <p className="text-[#666]">선물을 찾고 있어요...</p>
          </div>
        ) : searched && gifts.length === 0 ? (
          <div className="card p-8 text-center">
            <Gift className="w-12 h-12 text-[#ccc] mx-auto mb-4" />
            <p className="text-[#666] font-medium">받은 선물이 없습니다</p>
            <p className="text-sm text-[#999] mt-2">선물이 도착하면 여기에 표시됩니다</p>
          </div>
        ) : searched && (
          <div className="space-y-6">
            {/* Available Gifts */}
            {availableGifts.length > 0 && (
              <div>
                <h2 className="font-bold text-base mb-3 flex items-center gap-2">
                  사용 가능한 선물
                  <span className="bg-[#FF4747] text-white text-xs px-2 py-0.5 rounded-full">
                    {availableGifts.length}
                  </span>
                </h2>
                <div className="space-y-3">
                  {availableGifts.map((gift) => {
                    const daysRemaining = getDaysRemaining(gift.expires_at);
                    return (
                      <div key={gift.id} className="card p-5">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <p className="text-sm text-[#666]">{gift.sender_name}님이 보낸 선물</p>
                            <p className="text-2xl font-bold text-[#FF4747]">
                              {formatNumber(gift.amount)}원
                            </p>
                          </div>
                          <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">
                            사용 가능
                          </span>
                        </div>

                        {gift.message && (
                          <div className="bg-[#F8F9FA] rounded-lg p-3 mb-4">
                            <p className="text-xs text-[#999] mb-1">메시지</p>
                            <p className="text-sm">&ldquo;{gift.message}&rdquo;</p>
                          </div>
                        )}

                        <div className="bg-[#F8F9FA] rounded-lg p-4 mb-3">
                          <p className="text-xs text-[#999] mb-2">코인 코드</p>
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-lg font-bold tracking-wider">
                              {gift.code}
                            </span>
                            <button
                              onClick={() => copyCode(gift.code)}
                              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                                copiedCode === gift.code
                                  ? 'bg-green-100 text-green-600'
                                  : 'bg-white text-[#666] hover:bg-[#F0F0F0] border border-[#E5E5E5]'
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
                        </div>

                        <div className="flex items-center gap-1 text-sm mb-4">
                          <Clock size={14} className="text-[#999]" />
                          <span className={daysRemaining <= 7 ? 'text-red-500 font-medium' : 'text-[#666]'}>
                            {daysRemaining}일 후 만료 ({formatDate(gift.expires_at)})
                          </span>
                        </div>

                        <a
                          href="https://www.spacecloud.kr"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-full btn-primary flex items-center justify-center gap-2"
                        >
                          <ExternalLink size={16} />
                          스클에서 코드 사용하기
                        </a>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Used Gifts */}
            {usedGifts.length > 0 && (
              <div>
                <h2 className="font-bold text-base mb-3 text-[#666]">
                  사용 완료
                  <span className="ml-2 bg-green-100 text-green-600 text-xs px-2 py-0.5 rounded-full">
                    {usedGifts.length}
                  </span>
                </h2>
                <div className="space-y-3">
                  {usedGifts.map((gift) => (
                    <div key={gift.id} className="card p-4 opacity-70">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm text-[#666]">{gift.sender_name}님이 보낸 선물</p>
                          <p className="text-xl font-bold text-[#666]">{formatNumber(gift.amount)}원</p>
                        </div>
                        <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded">
                          사용 완료
                        </span>
                      </div>
                      <p className="text-xs text-[#999] mt-2">코드: {gift.code}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Other Status */}
            {otherGifts.length > 0 && (
              <div>
                <h2 className="font-bold text-base mb-3 text-[#666]">기타</h2>
                <div className="space-y-3">
                  {otherGifts.map((gift) => {
                    const status = statusConfig[gift.status];
                    return (
                      <div key={gift.id} className="card p-4 opacity-60">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-sm text-[#666]">{gift.sender_name}님</p>
                            <p className="text-xl font-bold text-[#666]">{formatNumber(gift.amount)}원</p>
                          </div>
                          <span className={`text-xs font-medium ${status.color} ${status.bg} px-2 py-1 rounded`}>
                            {status.label}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Info Box */}
        <div className="mt-8 info-box">
          <h3 className="font-semibold mb-3">코인 코드 사용 방법</h3>
          <ol className="text-sm text-[#666] space-y-2 list-decimal list-inside">
            <li>코인 코드를 복사하세요</li>
            <li>스페이스클라우드 앱/웹에 접속하세요</li>
            <li>마이페이지 &gt; 코인 등록에서 코드를 입력하세요</li>
            <li>등록된 코인으로 공간을 예약하세요!</li>
          </ol>
          <p className="text-xs text-[#999] mt-4 bg-yellow-50 rounded-lg p-3">
            만료일 전에 코드를 사용해주세요. 미사용 시 자동 환불됩니다.
          </p>
        </div>
      </div>
    </div>
  );
}
