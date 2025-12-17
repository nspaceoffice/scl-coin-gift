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
    message,
    setAmount,
    setCustomAmount,
    setSenderName,
    setSenderPhone,
    setReceiverName,
    setReceiverPhone,
    setMessage,
  } = useGiftFormStore();

  const [isCustom, setIsCustom] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

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
          message,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      router.push(`/payment/${data.id}`);
    } catch (error) {
      console.error('Gift creation error:', error);
      alert('선물 생성 중 오류가 발생했습니다.');
    }
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('ko-KR').format(num);
  };

  return (
    <div className="px-4 py-6">
      {/* Hero Section */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Gift className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-2xl font-bold mb-2">스클코인 선물하기</h1>
        <p className="text-text-gray text-sm">
          소중한 사람에게 스클코인을 선물하세요
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Amount Selection */}
        <div className="card p-4">
          <h2 className="font-semibold mb-3">선물할 금액</h2>
          <div className="grid grid-cols-3 gap-2 mb-3">
            {AMOUNT_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleAmountSelect(option.value)}
                className={`py-3 px-2 rounded-lg text-sm font-medium transition-colors ${
                  amount === option.value && !isCustom
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-foreground hover:bg-gray-200'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>

          <div className="relative">
            <input
              type="text"
              placeholder="직접 입력 (1,000원 이상)"
              value={customAmount ? formatNumber(parseInt(customAmount, 10)) : ''}
              onChange={handleCustomAmountChange}
              className={`input-field pr-8 ${isCustom ? 'border-primary' : ''}`}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-text-gray text-sm">
              원
            </span>
          </div>
          {errors.amount && (
            <p className="text-error text-xs mt-1">{errors.amount}</p>
          )}
        </div>

        {/* Sender Info */}
        <div className="card p-4">
          <h2 className="font-semibold mb-3">보내는 분</h2>
          <div className="space-y-3">
            <div>
              <input
                type="text"
                placeholder="이름 *"
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                className="input-field"
              />
              {errors.senderName && (
                <p className="text-error text-xs mt-1">{errors.senderName}</p>
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
        <div className="card p-4">
          <h2 className="font-semibold mb-3">받는 분</h2>
          <div className="space-y-3">
            <div>
              <input
                type="text"
                placeholder="이름 *"
                value={receiverName}
                onChange={(e) => setReceiverName(e.target.value)}
                className="input-field"
              />
              {errors.receiverName && (
                <p className="text-error text-xs mt-1">{errors.receiverName}</p>
              )}
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
        <div className="card p-4">
          <h2 className="font-semibold mb-3">메시지 (선택)</h2>
          <textarea
            placeholder="선물과 함께 전할 메시지를 입력하세요"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            className="w-full border border-border rounded-lg p-3 text-sm resize-none focus:outline-none focus:border-primary"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          <span>
            {amount || customAmount
              ? `${formatNumber(amount || parseInt(customAmount, 10) || 0)}원 결제하기`
              : '결제하기'}
          </span>
          <ChevronRight size={18} />
        </button>
      </form>
    </div>
  );
}
