import { NextRequest, NextResponse } from 'next/server';
import * as sheets from '@/lib/sheets';

// Register a gift code (receiver claims the gift)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code } = body;

    if (!code) {
      return NextResponse.json(
        { error: '코인 코드를 입력해주세요.' },
        { status: 400 }
      );
    }

    const result = await sheets.registerGift(code);

    if (result.error) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Gift registration error:', error);
    return NextResponse.json(
      { error: '코인 등록 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
