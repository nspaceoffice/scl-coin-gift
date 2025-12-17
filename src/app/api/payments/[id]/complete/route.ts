import { NextRequest, NextResponse } from 'next/server';
import * as sheets from '@/lib/sheets';

// Complete a payment
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const result = await sheets.completePayment(id);

    if (result.error) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Payment completion error:', error);
    return NextResponse.json(
      { error: '결제 완료 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
