import { NextRequest, NextResponse } from 'next/server';
import * as sheets from '@/lib/sheets';

// 받은 선물 목록 조회 (receiver 기준)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const receiverPhone = searchParams.get('phone');
    const receiverEmail = searchParams.get('email');

    if (!receiverPhone && !receiverEmail) {
      return NextResponse.json(
        { error: '연락처 또는 이메일을 입력해주세요.' },
        { status: 400 }
      );
    }

    const gifts = await sheets.getReceivedGifts({
      receiverPhone: receiverPhone || undefined,
      receiverEmail: receiverEmail || undefined,
    });

    return NextResponse.json(gifts);
  } catch (error) {
    console.error('Received gifts list error:', error);
    return NextResponse.json(
      { error: '받은 선물 목록 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
