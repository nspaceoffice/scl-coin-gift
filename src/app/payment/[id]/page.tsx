'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { CreditCard, Check, Copy, Gift, PartyPopper, Sparkles, Share2 } from 'lucide-react';
import { useGiftFormStore } from '@/store/useStore';

interface GiftData {
  id: string;
  code: string;
  amount: number;
  sender_name: string;
  receiver_name: string;
  message?: string;
  status: string;
}

export default function PaymentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { reset } = useGiftFormStore();

  const [gift, setGift] = useState<GiftData | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetchGift();
  }, [id]);

  const fetchGift = async () => {
    try {
      const response = await fetch(`/api/gifts/${id}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      setGift(data);
      if (data.status === 'paid') {
        setCompleted(true);
      }
    } catch (error) {
      console.error('Gift fetch error:', error);
      alert('선물 정보를 불러올 수 없습니다.');
      router.push('/');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!gift) return;

    setProcessing(true);

    try {
      const paymentResponse = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          giftId: gift.id,
          amount: gift.amount,
          method: 'toss',
        }),
      });

      const paymentData = await paymentResponse.json();

      if (!paymentResponse.ok) {
        throw new Error(paymentData.error);
      }

      await new Promise((resolve) => setTimeout(resolve, 1500));

      const completeResponse = await fetch(`/api/payments/${paymentData.id}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tossPaymentKey: `toss_demo_${Date.now()}`,
        }),
      });

      if (!completeResponse.ok) {
        throw new Error('결제 완료 처리 실패');
      }

      reset();
      setCompleted(true);
      await fetchGift();
    } catch (error) {
      console.error('Payment error:', error);
      alert('결제 중 오류가 발생했습니다.');
    } finally {
      setProcessing(false);
    }
  };

  const copyCode = async () => {
    if (!gift) return;
    await navigator.clipboard.writeText(gift.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareGift = async () => {
    if (!gift) return;

    const shareText = `🎁 ${gift.sender_name}님이 스클코인을 선물했어요!\n\n코인 코드: ${gift.code}\n금액: ${formatNumber(gift.amount)}원\n\n스클에서 코드를 입력하면 사용할 수 있어요!`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: '스클코인 선물',
          text: shareText,
        });
      } catch (e) {
        console.log('Share cancelled');
      }
    } else {
      await navigator.clipboard.writeText(shareText);
      alert('선물 정보가 복사되었습니다!');
    }
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('ko-KR').format(num);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-animated flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 rounded-full border-4 border-[#ff6b6b]/20"></div>
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-[#ff6b6b] animate-spin"></div>
            <span className="absolute inset-0 flex items-center justify-center text-2xl">🎁</span>
          </div>
          <p className="text-gray-500">선물 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (!gift) {
    return null;
  }

  // 결제 완료 화면
  if (completed) {
    return (
      <div className="min-h-screen bg-gradient-animated relative overflow-hidden">
        {/* Floating decorations */}
        <div className="absolute top-10 left-4 text-3xl animate-float" style={{ animationDelay: '0s' }}>🎉</div>
        <div className="absolute top-20 right-8 text-2xl animate-float" style={{ animationDelay: '0.3s' }}>✨</div>
        <div className="absolute top-40 left-10 text-2xl animate-float" style={{ animationDelay: '0.6s' }}>🎊</div>
        <div className="absolute top-32 right-16 text-3xl animate-float" style={{ animationDelay: '0.9s' }}>💝</div>

        <div className="px-4 py-8 max-w-lg mx-auto relative z-10">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="relative inline-block">
              <div className="w-24 h-24 bg-gradient-to-r from-[#2ed573] to-[#7bed9f] rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse-glow shadow-lg">
                <PartyPopper className="w-12 h-12 text-white" />
              </div>
              <span className="absolute -top-2 -right-2 text-3xl animate-bounce-soft">🎁</span>
            </div>
            <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-[#2ed573] to-[#20bf6b] bg-clip-text text-transparent">
              선물 완료!
            </h1>
            <p className="text-gray-600">
              {gift.receiver_name}님께 마음을 전했어요 💕
            </p>
          </div>

          {/* Gift Code Card */}
          <div className="card p-6 mb-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#ff6b6b] to-[#ffa502]"></div>

            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-2 bg-[#fff0f0] px-3 py-1 rounded-full mb-3">
                <Sparkles className="w-4 h-4 text-[#ff6b6b]" />
                <span className="text-sm font-medium text-[#ff6b6b]">코인 코드</span>
              </div>
              <div className="flex items-center justify-center gap-3">
                <span className="text-2xl md:text-3xl font-mono font-bold tracking-wider bg-gray-50 px-4 py-3 rounded-xl">
                  {gift.code}
                </span>
                <button
                  onClick={copyCode}
                  className={`p-3 rounded-xl transition-all ${copied ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                  title="복사"
                >
                  {copied ? <Check size={20} /> : <Copy size={20} />}
                </button>
              </div>
              {copied && (
                <p className="text-sm text-green-600 mt-2 animate-bounce-soft">복사되었습니다!</p>
              )}
            </div>

            <div className="border-t border-gray-100 pt-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-500">금액</span>
                <span className="text-xl font-bold text-[#ff6b6b]">{formatNumber(gift.amount)}원</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">보내는 분</span>
                <span className="font-medium">{gift.sender_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">받는 분</span>
                <span className="font-medium">{gift.receiver_name}</span>
              </div>
              {gift.message && (
                <div className="pt-3 border-t border-gray-100">
                  <p className="text-sm text-gray-500 mb-1">💌 메시지</p>
                  <p className="text-sm bg-gray-50 p-3 rounded-xl">&ldquo;{gift.message}&rdquo;</p>
                </div>
              )}
            </div>
          </div>

          {/* Share Button */}
          <button
            onClick={shareGift}
            className="w-full flex items-center justify-center gap-2 py-4 bg-white border-2 border-[#ff6b6b] text-[#ff6b6b] rounded-2xl font-semibold mb-4 hover:bg-[#fff0f0] transition-all"
          >
            <Share2 size={20} />
            <span>선물 정보 공유하기</span>
          </button>

          {/* Info Box */}
          <div className="bg-gradient-to-r from-[#fff0f0] to-[#fff9e6] rounded-2xl p-5 mb-6">
            <div className="flex items-start gap-3">
              <span className="text-2xl">💡</span>
              <div className="text-sm">
                <p className="font-semibold text-gray-800 mb-1">코인 코드를 받는 분께 전달해주세요!</p>
                <p className="text-gray-600">
                  받는 분이 스클에서 코드를 입력하면 코인이 등록됩니다.
                  30일 내 등록하지 않으면 캐시로 자동 환불돼요.
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={() => router.push('/history')}
              className="btn-primary w-full"
            >
              📋 선물 내역 보기
            </button>
            <button
              onClick={() => router.push('/')}
              className="btn-secondary w-full"
            >
              🎁 새 선물 보내기
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 결제 화면
  return (
    <div className="min-h-screen bg-gradient-animated">
      <div className="px-4 py-8 max-w-lg mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-[#4da6ff] to-[#0052cc] rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <CreditCard className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold mb-2">결제하기</h1>
          <p className="text-gray-500">안전하게 결제를 완료해주세요 🔒</p>
        </div>

        {/* Order Summary */}
        <div className="card p-5 mb-5">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl">🎁</span>
            <h2 className="font-bold text-lg">주문 정보</h2>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">상품</span>
              <span className="font-medium">스클코인 선물</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">보내는 분</span>
              <span>{gift.sender_name}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">받는 분</span>
              <span>{gift.receiver_name}</span>
            </div>
            <div className="border-t border-gray-100 pt-3 flex justify-between items-center">
              <span className="font-semibold">결제 금액</span>
              <span className="text-2xl font-bold bg-gradient-to-r from-[#ff6b6b] to-[#ffa502] bg-clip-text text-transparent">
                {formatNumber(gift.amount)}원
              </span>
            </div>
          </div>
        </div>

        {/* Payment Method */}
        <div className="card p-5 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl">💳</span>
            <h2 className="font-bold text-lg">결제 수단</h2>
          </div>
          <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-2xl border-2 border-blue-400">
            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center shadow-md">
              <span className="text-white font-bold">Toss</span>
            </div>
            <div>
              <p className="font-semibold">토스페이</p>
              <p className="text-sm text-gray-500">간편결제</p>
            </div>
            <div className="ml-auto">
              <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                <Check size={14} className="text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Pay Button */}
        <button
          onClick={handlePayment}
          disabled={processing}
          className="btn-primary w-full flex items-center justify-center gap-2 text-lg"
        >
          {processing ? (
            <>
              <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
              <span>결제 진행 중...</span>
            </>
          ) : (
            <>
              <Gift size={20} />
              <span>{formatNumber(gift.amount)}원 결제하기</span>
            </>
          )}
        </button>

        <p className="text-center text-sm text-gray-400 mt-4">
          결제 진행 시 이용약관에 동의하는 것으로 간주됩니다
        </p>
      </div>
    </div>
  );
}
