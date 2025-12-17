import { NextRequest, NextResponse } from 'next/server';
import * as sheets from '@/lib/sheets';

// Get cash history for a user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const phone = searchParams.get('phone');

    if (!email && !phone) {
      return NextResponse.json(
        { error: '사용자 정보를 입력해주세요.' },
        { status: 400 }
      );
    }

    const result = await sheets.getCash({
      phone: phone || undefined,
      email: email || undefined,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Cash history error:', error);
    return NextResponse.json(
      { error: '캐시 내역 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
