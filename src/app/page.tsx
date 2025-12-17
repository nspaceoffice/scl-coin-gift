'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Gift, ChevronRight, Sparkles, Heart, PartyPopper } from 'lucide-react';
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
    <div className="min-h-screen bg-gradient-animated">
      {/* Hero Section */}
      <div className="relative overflow-hidden pt-8 pb-12 px-4">
        {/* Floating decorations */}
        <div className="absolute top-10 left-8 text-4xl animate-float" style={{ animationDelay: '0s' }}>🎁</div>
        <div className="absolute top-20 right-10 text-3xl animate-float" style={{ animationDelay: '0.5s' }}>🎉</div>
        <div className="absolute top-32 left-16 text-2xl animate-float" style={{ animationDelay: '1s' }}>💝</div>
        <div className="absolute top-16 right-24 text-2xl animate-float" style={{ animationDelay: '1.5s' }}>✨</div>

        <div className="text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full mb-4 shadow-sm">
            <Sparkles className="w-4 h-4 text-yellow-500" />
            <span className="text-sm font-medium text-gray-700">스페이스클라우드</span>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold mb-3 bg-gradient-to-r from-[#ff6b6b] to-[#ffa502] bg-clip-text text-transparent">
            마음을 전하는 선물
          </h1>
          <p className="text-gray-600 text-base md:text-lg">
            소중한 사람에게 스클코인을 선물하세요 💕
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="px-4 pb-8 space-y-5 max-w-lg mx-auto">
        {/* Amount Selection */}
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#ff6b6b] to-[#ffa502] flex items-center justify-center">
              <Gift className="w-4 h-4 text-white" />
            </div>
            <h2 className="font-bold text-lg">얼마를 선물할까요?</h2>
          </div>

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
              className={`input-field pr-12 ${isCustom ? 'border-[#ff6b6b]' : ''}`}
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-medium">
              원
            </span>
          </div>
          {errors.amount && (
            <p className="text-[#ff4757] text-sm mt-2 flex items-center gap-1">
              <span>⚠️</span> {errors.amount}
            </p>
          )}
        </div>

        {/* Sender Info */}
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#845ef7] to-[#5c7cfa] flex items-center justify-center">
              <Heart className="w-4 h-4 text-white" />
            </div>
            <h2 className="font-bold text-lg">보내는 분</h2>
          </div>
          <div className="space-y-3">
            <div>
              <input
                type="text"
                placeholder="이름을 입력해주세요"
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                className="input-field"
              />
              {errors.senderName && (
                <p className="text-[#ff4757] text-sm mt-2 flex items-center gap-1">
                  <span>⚠️</span> {errors.senderName}
                </p>
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
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#ff6b6b] to-[#ee5a5a] flex items-center justify-center">
              <PartyPopper className="w-4 h-4 text-white" />
            </div>
            <h2 className="font-bold text-lg">받는 분</h2>
          </div>
          <div className="space-y-3">
            <div>
              <input
                type="text"
                placeholder="이름을 입력해주세요"
                value={receiverName}
                onChange={(e) => setReceiverName(e.target.value)}
                className="input-field"
              />
              {errors.receiverName && (
                <p className="text-[#ff4757] text-sm mt-2 flex items-center gap-1">
                  <span>⚠️</span> {errors.receiverName}
                </p>
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
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">💌</span>
            <h2 className="font-bold text-lg">마음을 담은 메시지</h2>
            <span className="text-sm text-gray-400">(선택)</span>
          </div>
          <textarea
            placeholder="선물과 함께 전할 메시지를 입력하세요"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            className="w-full border-2 border-[#eee] rounded-2xl p-4 text-sm resize-none focus:outline-none focus:border-[#ff6b6b] focus:ring-4 focus:ring-[#fff0f0] transition-all"
          />
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            className="btn-primary w-full flex items-center justify-center gap-2 text-lg"
          >
            <Gift className="w-5 h-5" />
            <span>
              {amount || customAmount
                ? `${formatNumber(amount || parseInt(customAmount, 10) || 0)}원 선물하기`
                : '선물하기'}
            </span>
            <ChevronRight className="w-5 h-5" />
          </button>
          <p className="text-center text-sm text-gray-400 mt-3">
            🔒 안전한 결제 시스템으로 보호됩니다
          </p>
        </div>
      </form>
    </div>
  );
}
