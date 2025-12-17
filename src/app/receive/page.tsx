'use client';

import { useState } from 'react';
import { Gift, Check, AlertCircle, Sparkles } from 'lucide-react';

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
    <div className="px-4 py-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Gift className="w-8 h-8 text-primary rotate-180" />
        </div>
        <h1 className="text-2xl font-bold mb-2">선물 받기</h1>
        <p className="text-text-gray text-sm">
          받은 코인 코드를 입력하여 등록하세요
        </p>
      </div>

      {/* Success State */}
      {result?.success && result.gift && (
        <div className="card p-6 mb-6 text-center">
          <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-success" />
          </div>
          <h2 className="text-xl font-bold mb-2">코인이 등록되었습니다!</h2>
          <p className="text-3xl font-bold text-primary mb-2">
            {formatNumber(result.gift.amount)}원
          </p>
          <p className="text-text-gray text-sm">
            {result.gift.senderName}님이 보낸 선물
          </p>

          <div className="mt-6 p-4 bg-primary/5 rounded-lg">
            <p className="text-sm text-text-gray mb-2">
              스페이스클라우드에서 코인을 사용하세요!
            </p>
            <a
              href="https://www.spacecloud.kr"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary inline-flex items-center gap-2 px-6"
            >
              스클 바로가기
            </a>
          </div>
        </div>
      )}

      {/* Input Form */}
      {!result?.success && (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="card p-6">
            <h2 className="font-semibold mb-4 text-center">코인 코드 입력</h2>
            <input
              type="text"
              placeholder="XXXX-XXXX-XXXX"
              value={code}
              onChange={handleCodeChange}
              className="input-field text-center text-xl font-mono tracking-wider"
              maxLength={14}
            />
            <p className="text-xs text-text-gray text-center mt-2">
              코인 코드 12자리를 입력하세요
            </p>

            {result && !result.success && (
              <div className="mt-4 p-3 bg-red-50 rounded-lg flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-error flex-shrink-0" />
                <p className="text-sm text-error">{result.message}</p>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || code.replace(/-/g, '').length < 12}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                <span>등록 중...</span>
              </>
            ) : (
              <>
                <Check size={18} />
                <span>코인 등록하기</span>
              </>
            )}
          </button>
        </form>
      )}

      {/* Info Box */}
      <div className="mt-8 space-y-4">
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-semibold mb-2 text-sm">코인 코드란?</h3>
          <p className="text-sm text-text-gray">
            선물받은 스클코인을 등록할 수 있는 12자리 코드입니다.
            선물을 보낸 분께 코드를 받아 입력해주세요.
          </p>
        </div>

        <div className="bg-yellow-50 rounded-lg p-4">
          <h3 className="font-semibold mb-2 text-sm text-yellow-800">주의사항</h3>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• 코인 코드는 1회만 사용 가능합니다</li>
            <li>• 발급 후 30일 이내에 등록해야 합니다</li>
            <li>• 기한 내 미등록 시 자동 환불됩니다</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
