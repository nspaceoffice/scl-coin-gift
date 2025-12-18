'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Gift, ChevronRight } from 'lucide-react';
import { AMOUNT_OPTIONS } from '@/types';
import { useGiftFormStore } from '@/store/useStore';

export default function GiftPage() {
  const router = useRouter();
  const {
    amount,
    customAmount,
    senderName,
    senderPhone,
    receiverName,
    receiverPhone,
    receiverEmail,
    message,
    setAmount,
    setCustomAmount,
    setSenderName,
    setSenderPhone,
    setReceiverName,
    setReceiverPhone,
    setReceiverEmail,
    setMessage,
  } = useGiftFormStore();

  const [isCustom, setIsCustom] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleAmountSelect = (value: number) => {
    setAmount(value);
    setIsCustom(false);
    setCustomAmount('');
  };

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    setCustomAmount(value);
    setAmount(value ? parseInt(value, 10) : null);
    setIsCustom(true);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    const finalAmount = amount || (customAmount ? parseInt(customAmount, 10) : 0);
    if (!finalAmount || finalAmount < 1000) {
      newErrors.amount = '최소 1,000원 이상 입력해주세요.';
    }

    if (!senderName.trim()) {
      newErrors.senderName = '보내는 분 이름을 입력해주세요.';
    }

    if (!receiverName.trim()) {
      newErrors.receiverName = '받는 분 이름을 입력해주세요.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    const finalAmount = amount || parseInt(customAmount, 10);
    setIsLoading(true);

    try {
      const response = await fetch('/api/gifts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: finalAmount,
          senderName,
          senderPhone,
          receiverName,
          receiverPhone,
          receiverEmail,
          message,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '선물 생성에 실패했습니다.');
      }

      if (!data.id) {
        throw new Error('선물 ID를 받지 못했습니다. Google Apps Script 배포를 확인해주세요.');
      }

      router.push(`/payment/${data.id}`);
    } catch (error) {
      console.error('Gift creation error:', error);
      alert(error instanceof Error ? error.message : '선물 생성 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('ko-KR').format(num);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      {/* Header */}
      <div className="bg-white border-b border-[#F0F0F0]">
        <div className="max-w-lg mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold text-[#1a1a1a] mb-2">
            스클코인 선물하기
          </h1>
          <p className="text-[#666] text-sm">
            소중한 사람에게 스클코인을 선물하세요
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="px-4 py-6 space-y-4 max-w-lg mx-auto">
        {/* Amount Selection */}
        <div className="card p-5">
          <h2 className="font-bold text-base mb-4 flex items-center gap-2">
            <Gift className="w-5 h-5 text-[#FF4747]" />
            선물 금액
          </h2>

          <div className="grid grid-cols-3 gap-2 mb-4">
            {AMOUNT_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleAmountSelect(option.value)}
                className={`amount-btn ${amount === option.value && !isCustom ? 'active' : ''}`}
              >
                {option.label}
              </button>
            ))}
          </div>

          <div className="relative">
            <input
              type="text"
              placeholder="직접 입력"
              value={customAmount ? formatNumber(parseInt(customAmount, 10)) : ''}
              onChange={handleCustomAmountChange}
              className={`input-field pr-12 ${isCustom ? 'border-[#FF4747]' : ''}`}
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#999] font-medium">
              원
            </span>
          </div>
          {errors.amount && (
            <p className="text-[#FF4747] text-sm mt-2">{errors.amount}</p>
          )}
        </div>

        {/* Sender Info */}
        <div className="card p-5">
          <h2 className="font-bold text-base mb-4">보내는 분</h2>
          <div className="space-y-3">
            <div>
              <input
                type="text"
                placeholder="이름"
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                className="input-field"
              />
              {errors.senderName && (
                <p className="text-[#FF4747] text-sm mt-2">{errors.senderName}</p>
              )}
            </div>
            <input
              type="tel"
              placeholder="연락처 (선택)"
              value={senderPhone}
              onChange={(e) => setSenderPhone(e.target.value)}
              className="input-field"
            />
          </div>
        </div>

        {/* Receiver Info */}
        <div className="card p-5">
          <h2 className="font-bold text-base mb-4">받는 분</h2>
          <div className="space-y-3">
            <div>
              <input
                type="text"
                placeholder="이름"
                value={receiverName}
                onChange={(e) => setReceiverName(e.target.value)}
                className="input-field"
              />
              {errors.receiverName && (
                <p className="text-[#FF4747] text-sm mt-2">{errors.receiverName}</p>
              )}
            </div>
            <div>
              <input
                type="email"
                placeholder="이메일 (선물 도착 알림 발송)"
                value={receiverEmail}
                onChange={(e) => setReceiverEmail(e.target.value)}
                className="input-field"
              />
              <p className="text-xs text-[#999] mt-1.5">
                결제 완료 시 받는 분께 알림이 발송됩니다
              </p>
            </div>
            <input
              type="tel"
              placeholder="연락처 (선택)"
              value={receiverPhone}
              onChange={(e) => setReceiverPhone(e.target.value)}
              className="input-field"
            />
          </div>
        </div>

        {/* Message */}
        <div className="card p-5">
          <h2 className="font-bold text-base mb-4">
            메시지 <span className="text-[#999] font-normal text-sm">(선택)</span>
          </h2>
          <textarea
            placeholder="선물과 함께 전할 메시지를 입력하세요"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            className="w-full border border-[#E5E5E5] rounded-xl p-4 text-sm resize-none focus:outline-none focus:border-[#FF4747] transition-colors"
          />
        </div>

        {/* Submit Button */}
        <div className="pt-2 pb-8">
          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <div className="spinner" />
            ) : (
              <>
                <span>선물하기</span>
                <ChevronRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
