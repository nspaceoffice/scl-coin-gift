'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { CreditCard, Check, Copy, Gift } from 'lucide-react';
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
      // Create payment
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

      // Simulate Toss payment (in production, redirect to Toss)
      // For demo, we'll auto-complete after a delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Complete payment
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

      // Reset form and show success
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

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('ko-KR').format(num);
  };

  if (loading) {
    return (
      <div className="px-4 py-12 text-center">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto" />
        <p className="mt-4 text-text-gray">로딩 중...</p>
      </div>
    );
  }

  if (!gift) {
    return null;
  }

  if (completed) {
    return (
      <div className="px-4 py-6">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-success" />
          </div>
          <h1 className="text-2xl font-bold mb-2">결제 완료!</h1>
          <p className="text-text-gray text-sm">
            선물이 성공적으로 생성되었습니다
          </p>
        </div>

        <div className="card p-6 mb-6">
          <div className="text-center mb-6">
            <p className="text-sm text-text-gray mb-1">코인 코드</p>
            <div className="flex items-center justify-center gap-2">
              <span className="text-2xl font-mono font-bold tracking-wider">
                {gift.code}
              </span>
              <button
                onClick={copyCode}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="복사"
              >
                {copied ? (
                  <Check size={18} className="text-success" />
                ) : (
                  <Copy size={18} className="text-text-gray" />
                )}
              </button>
            </div>
          </div>

          <div className="border-t border-border pt-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-text-gray">금액</span>
              <span className="font-semibold">{formatNumber(gift.amount)}원</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text-gray">보내는 분</span>
              <span>{gift.sender_name}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text-gray">받는 분</span>
              <span>{gift.receiver_name}</span>
            </div>
            {gift.message && (
              <div className="pt-2 border-t border-border">
                <p className="text-sm text-text-gray mb-1">메시지</p>
                <p className="text-sm">{gift.message}</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-primary/5 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <Gift className="w-5 h-5 text-primary mt-0.5" />
            <div className="text-sm">
              <p className="font-medium mb-1">코인 코드를 받는 분께 전달해주세요</p>
              <p className="text-text-gray">
                받는 분이 스클에서 코드를 입력하면 코인이 등록됩니다.
                30일 내 등록하지 않으면 캐시로 자동 환불됩니다.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => router.push('/history')}
            className="btn-primary w-full"
          >
            선물 내역 보기
          </button>
          <button
            onClick={() => router.push('/')}
            className="btn-secondary w-full"
          >
            새 선물 보내기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <CreditCard className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-2xl font-bold mb-2">결제하기</h1>
        <p className="text-text-gray text-sm">
          토스페이로 간편하게 결제하세요
        </p>
      </div>

      {/* Order Summary */}
      <div className="card p-4 mb-6">
        <h2 className="font-semibold mb-4">주문 정보</h2>
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-text-gray">상품</span>
            <span>스클코인 선물</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-text-gray">보내는 분</span>
            <span>{gift.sender_name}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-text-gray">받는 분</span>
            <span>{gift.receiver_name}</span>
          </div>
          <div className="border-t border-border pt-3 flex justify-between">
            <span className="font-semibold">결제 금액</span>
            <span className="font-bold text-primary text-lg">
              {formatNumber(gift.amount)}원
            </span>
          </div>
        </div>
      </div>

      {/* Payment Method */}
      <div className="card p-4 mb-6">
        <h2 className="font-semibold mb-3">결제 수단</h2>
        <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border-2 border-blue-500">
          <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">Toss</span>
          </div>
          <div>
            <p className="font-medium">토스페이</p>
            <p className="text-xs text-text-gray">간편결제</p>
          </div>
        </div>
      </div>

      {/* Pay Button */}
      <button
        onClick={handlePayment}
        disabled={processing}
        className="btn-primary w-full flex items-center justify-center gap-2"
      >
        {processing ? (
          <>
            <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
            <span>결제 진행 중...</span>
          </>
        ) : (
          <span>{formatNumber(gift.amount)}원 결제하기</span>
        )}
      </button>

      <p className="text-xs text-text-gray text-center mt-4">
        결제 진행 시 이용약관에 동의하는 것으로 간주됩니다.
      </p>
    </div>
  );
}
