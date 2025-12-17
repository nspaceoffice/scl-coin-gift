'use client';

import { useState } from 'react';
import { Gift, Check, AlertCircle, Sparkles, PartyPopper } from 'lucide-react';

export default function ReceivePage() {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    gift?: {
      amount: number;
      senderName: string;
    };
  } | null>(null);

  const formatCode = (value: string) => {
    // Remove non-alphanumeric characters
    const cleaned = value.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
    // Add dashes every 4 characters
    const formatted = cleaned.match(/.{1,4}/g)?.join('-') || cleaned;
    return formatted.slice(0, 14); // Max 12 chars + 2 dashes
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCode(formatCode(e.target.value));
    setResult(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!code || code.replace(/-/g, '').length < 12) {
      setResult({
        success: false,
        message: '올바른 코인 코드를 입력해주세요.',
      });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/gifts/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });

      const data = await response.json();

      if (response.ok) {
        setResult({
          success: true,
          message: data.message,
          gift: data.gift,
        });
        setCode('');
      } else {
        setResult({
          success: false,
          message: data.error,
        });
      }
    } catch (error) {
      console.error('Registration error:', error);
      setResult({
        success: false,
        message: '코인 등록 중 오류가 발생했습니다.',
      });
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('ko-KR').format(num);
  };

  return (
    <div className="min-h-screen bg-gradient-animated relative overflow-hidden">
      {/* Floating decorations */}
      <div className="absolute top-16 left-6 text-3xl animate-float" style={{ animationDelay: '0s' }}>🎀</div>
      <div className="absolute top-28 right-10 text-2xl animate-float" style={{ animationDelay: '0.5s' }}>✨</div>
      <div className="absolute top-44 left-12 text-xl animate-float" style={{ animationDelay: '1s' }}>🎁</div>
      <div className="absolute top-36 right-20 text-2xl animate-float" style={{ animationDelay: '1.5s' }}>💕</div>

      <div className="px-4 py-8 max-w-lg mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-[#ff6b6b] to-[#ee5a5a] rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Gift className="w-10 h-10 text-white rotate-180" />
          </div>
          <h1 className="text-2xl font-bold mb-2 bg-gradient-to-r from-[#ff6b6b] to-[#ffa502] bg-clip-text text-transparent">
            선물 받기
          </h1>
          <p className="text-gray-500">
            받은 코인 코드를 입력하여 등록하세요 🎀
          </p>
        </div>

        {/* Success State */}
        {result?.success && result.gift && (
          <div className="card p-6 mb-6 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#2ed573] to-[#7bed9f]"></div>

            {/* Celebration decorations */}
            <div className="absolute top-4 left-4 text-xl animate-bounce-soft">🎉</div>
            <div className="absolute top-4 right-4 text-xl animate-bounce-soft" style={{ animationDelay: '0.2s' }}>🎊</div>

            <div className="relative inline-block mb-4">
              <div className="w-20 h-20 bg-gradient-to-r from-[#2ed573] to-[#7bed9f] rounded-full flex items-center justify-center mx-auto shadow-lg animate-pulse-glow">
                <PartyPopper className="w-10 h-10 text-white" />
              </div>
            </div>

            <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-[#2ed573] to-[#20bf6b] bg-clip-text text-transparent">
              코인이 등록되었습니다!
            </h2>
            <p className="text-4xl font-bold bg-gradient-to-r from-[#ff6b6b] to-[#ffa502] bg-clip-text text-transparent mb-2">
              {formatNumber(result.gift.amount)}원
            </p>
            <p className="text-gray-500">
              {result.gift.senderName}님이 보낸 선물 💝
            </p>

            <div className="mt-6 p-4 bg-gradient-to-r from-[#fff0f0] to-[#fff9e6] rounded-2xl">
              <p className="text-sm text-gray-600 mb-3">
                스페이스클라우드에서 코인을 사용하세요!
              </p>
              <a
                href="https://www.spacecloud.kr"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary inline-flex items-center gap-2 px-6"
              >
                🚀 스클 바로가기
              </a>
            </div>
          </div>
        )}

        {/* Input Form */}
        {!result?.success && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="card p-6">
              <div className="text-center mb-4">
                <span className="inline-flex items-center gap-2 bg-[#fff0f0] px-4 py-2 rounded-full">
                  <Sparkles className="w-4 h-4 text-[#ff6b6b]" />
                  <span className="text-sm font-medium text-[#ff6b6b]">코인 코드 입력</span>
                </span>
              </div>
              <input
                type="text"
                placeholder="XXXX-XXXX-XXXX"
                value={code}
                onChange={handleCodeChange}
                className="input-field text-center text-2xl font-mono tracking-widest"
                maxLength={14}
              />
              <p className="text-xs text-gray-400 text-center mt-3">
                코인 코드 12자리를 입력하세요
              </p>

              {result && !result.success && (
                <div className="mt-4 p-4 bg-red-50 rounded-xl flex items-start gap-3">
                  <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <AlertCircle className="w-5 h-5 text-red-500" />
                  </div>
                  <div>
                    <p className="font-medium text-red-600">등록 실패</p>
                    <p className="text-sm text-red-500">{result.message}</p>
                  </div>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || code.replace(/-/g, '').length < 12}
              className="btn-primary w-full flex items-center justify-center gap-2 text-lg"
            >
              {loading ? (
                <>
                  <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                  <span>등록 중...</span>
                </>
              ) : (
                <>
                  <Check size={20} />
                  <span>코인 등록하기</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* Info Boxes */}
        <div className="mt-8 space-y-4">
          <div className="card p-5">
            <div className="flex items-start gap-3">
              <span className="text-2xl">💡</span>
              <div>
                <h3 className="font-semibold mb-1">코인 코드란?</h3>
                <p className="text-sm text-gray-500">
                  선물받은 스클코인을 등록할 수 있는 12자리 코드입니다.
                  선물을 보낸 분께 코드를 받아 입력해주세요.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-[#fff9e6] to-[#fff5f5] rounded-2xl p-5">
            <div className="flex items-start gap-3">
              <span className="text-2xl">⚠️</span>
              <div>
                <h3 className="font-semibold mb-2 text-yellow-800">주의사항</h3>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• 코인 코드는 1회만 사용 가능합니다</li>
                  <li>• 발급 후 30일 이내에 등록해야 합니다</li>
                  <li>• 기한 내 미등록 시 자동 환불됩니다</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
