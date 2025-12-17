import { NextRequest, NextResponse } from 'next/server';
import * as sheets from '@/lib/sheets';

// Get single gift by ID or code
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const gift = await sheets.getGift(id);

    if ('error' in gift) {
      return NextResponse.json(
        { error: gift.error },
        { status: 404 }
      );
    }

    return NextResponse.json(gift);
  } catch (error) {
    console.error('Gift fetch error:', error);
    return NextResponse.json(
      { error: '선물 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// Update gift (status, thank you message, etc.)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, thankYouMessage, registeredAt } = body;

    const result = await sheets.updateGift({
      id,
      status,
      thankYouMessage,
      registeredAt,
    });

    if ('error' in result) {
      return NextResponse.json(
        { error: result.error },
        { status: 404 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Gift update error:', error);
    return NextResponse.json(
      { error: '선물 업데이트 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
