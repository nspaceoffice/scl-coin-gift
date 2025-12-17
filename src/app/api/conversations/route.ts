import { NextRequest, NextResponse } from 'next/server';
import * as sheets from '@/lib/sheets';

// Create a new conversation or get existing one
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userName, userEmail } = body;

    if (!userName) {
      return NextResponse.json(
        { error: '이름을 입력해주세요.' },
        { status: 400 }
      );
    }

    const result = await sheets.createConversation({
      userName,
      userEmail,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Conversation creation error:', error);
    return NextResponse.json(
      { error: '대화 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

// Get conversations (for admin)
export async function GET() {
  try {
    const conversations = await sheets.getConversations();
    return NextResponse.json(conversations);
  } catch (error) {
    console.error('Conversations list error:', error);
    return NextResponse.json(
      { error: '대화 목록 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
