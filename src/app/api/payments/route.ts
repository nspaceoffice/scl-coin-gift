import { NextRequest, NextResponse } from 'next/server';
import * as sheets from '@/lib/sheets';

// Create a payment for a gift
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { giftId, amount, method } = body;

    if (!giftId || !amount) {
      return NextResponse.json(
        { error: '필수 항목을 입력해주세요.' },
        { status: 400 }
      );
    }

    const result = await sheets.createPayment({
      giftId,
      amount,
      method,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Payment creation error:', error);
    return NextResponse.json(
      { error: '결제 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
