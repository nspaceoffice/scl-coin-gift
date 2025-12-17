import { NextRequest, NextResponse } from 'next/server';
import * as sheets from '@/lib/sheets';

// Get messages for a conversation
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const messages = await sheets.getMessages(id);

    return NextResponse.json(messages);
  } catch (error) {
    console.error('Messages fetch error:', error);
    return NextResponse.json(
      { error: '메시지 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// Send a message
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: conversationId } = await params;
    const body = await request.json();
    const { senderType, content } = body;

    if (!content || !senderType) {
      return NextResponse.json(
        { error: '메시지 내용을 입력해주세요.' },
        { status: 400 }
      );
    }

    const message = await sheets.sendMessage({
      conversationId,
      senderType,
      content,
    });

    return NextResponse.json(message);
  } catch (error) {
    console.error('Message send error:', error);
    return NextResponse.json(
      { error: '메시지 전송 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
