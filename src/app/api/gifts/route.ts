import { NextRequest, NextResponse } from 'next/server';
import * as sheets from '@/lib/sheets';

// Create a new gift
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      amount,
      senderName,
      senderPhone,
      senderEmail,
      receiverName,
      receiverPhone,
      receiverEmail,
      message,
    } = body;

    if (!amount || !senderName || !receiverName) {
      return NextResponse.json(
        { error: '필수 항목을 입력해주세요.' },
        { status: 400 }
      );
    }

    const result = await sheets.createGift({
      amount,
      senderName,
      senderPhone,
      senderEmail,
      receiverName,
      receiverPhone,
      receiverEmail,
      message,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Gift creation error:', error);
    return NextResponse.json(
      { error: '선물 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// Get gifts list (for sender or admin)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const email = searchParams.get('email');
    const phone = searchParams.get('phone');
    const isAdmin = searchParams.get('admin') === 'true';

    if (!isAdmin && !userId && !email && !phone) {
      return NextResponse.json(
        { error: '조회 조건을 입력해주세요.' },
        { status: 400 }
      );
    }

    const gifts = await sheets.getGifts({
      admin: isAdmin,
      phone: phone || undefined,
      email: email || undefined,
      userId: userId || undefined,
    });

    return NextResponse.json(gifts);
  } catch (error) {
    console.error('Gift list error:', error);
    return NextResponse.json(
      { error: '선물 목록 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
