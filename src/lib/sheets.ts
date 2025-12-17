/**
 * Google Sheets API 클라이언트
 * Google Apps Script로 배포된 웹 앱과 통신합니다.
 */

const GOOGLE_SCRIPT_URL = process.env.GOOGLE_SCRIPT_URL || '';

interface SheetResponse<T = unknown> {
  error?: string;
  [key: string]: T | string | undefined;
}

async function fetchSheet<T>(action: string, params: Record<string, string> = {}): Promise<T> {
  const url = new URL(GOOGLE_SCRIPT_URL);
  url.searchParams.set('action', action);

  Object.entries(params).forEach(([key, value]) => {
    if (value) url.searchParams.set(key, value);
  });

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    throw new Error(`Sheet API error: ${response.status}`);
  }

  return response.json();
}

async function postSheet<T>(action: string, data: Record<string, unknown> = {}): Promise<T> {
  const response = await fetch(GOOGLE_SCRIPT_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, ...data }),
  });

  if (!response.ok) {
    throw new Error(`Sheet API error: ${response.status}`);
  }

  return response.json();
}

// ===== Gift 관련 함수 =====

export interface Gift {
  id: string;
  code: string;
  amount: number;
  senderName: string;
  senderPhone?: string;
  senderEmail?: string;
  receiverName: string;
  receiverPhone?: string;
  receiverEmail?: string;
  message?: string;
  status: 'pending' | 'paid' | 'registered' | 'refunded' | 'expired';
  paymentId?: string;
  thankYouMessage?: string;
  createdAt: string;
  expiresAt: string;
  registeredAt?: string;
}

export async function getGifts(params: {
  admin?: boolean;
  phone?: string;
  email?: string;
  userId?: string;
}): Promise<Gift[]> {
  return fetchSheet<Gift[]>('getGifts', {
    admin: params.admin ? 'true' : '',
    phone: params.phone || '',
    email: params.email || '',
  });
}

export async function getGift(id: string): Promise<Gift | { error: string }> {
  return fetchSheet<Gift | { error: string }>('getGift', { id });
}

export async function createGift(data: {
  amount: number;
  senderName: string;
  senderPhone?: string;
  senderEmail?: string;
  receiverName: string;
  receiverPhone?: string;
  receiverEmail?: string;
  message?: string;
}): Promise<{ id: string; code: string; amount: number; senderName: string; receiverName: string; expiresAt: string }> {
  return postSheet('createGift', data);
}

export async function updateGift(data: {
  id: string;
  status?: string;
  thankYouMessage?: string;
  registeredAt?: string;
  paymentId?: string;
}): Promise<Gift | { error: string }> {
  return postSheet('updateGift', data);
}

export async function registerGift(code: string): Promise<{
  success?: boolean;
  message?: string;
  error?: string;
  gift?: { id: string; amount: number; senderName: string };
}> {
  return postSheet('registerGift', { code });
}

// ===== Payment 관련 함수 =====

export async function createPayment(data: {
  giftId: string;
  amount: number;
  method?: string;
}): Promise<{ id: string; giftId: string; amount: number; status: string }> {
  return postSheet('createPayment', data);
}

export async function completePayment(paymentId: string): Promise<{ success?: boolean; message?: string; error?: string }> {
  return postSheet('completePayment', { paymentId });
}

// ===== Cash 관련 함수 =====

export interface CashItem {
  id: string;
  amount: number;
  type: 'purchase' | 'refund' | 'gift_received';
  description: string;
  createdAt: string;
}

export async function getCash(params: {
  phone?: string;
  email?: string;
}): Promise<{ history: CashItem[]; totalCash: number }> {
  return fetchSheet<{ history: CashItem[]; totalCash: number }>('getCash', {
    phone: params.phone || '',
    email: params.email || '',
  });
}

// ===== Conversation 관련 함수 =====

export interface Conversation {
  id: string;
  userName: string;
  userEmail?: string;
  status: 'open' | 'closed';
  lastMessage?: string;
  lastMessageAt?: string;
  createdAt: string;
}

export async function getConversations(): Promise<Conversation[]> {
  return fetchSheet<Conversation[]>('getConversations');
}

export async function createConversation(data: {
  userName: string;
  userEmail?: string;
}): Promise<Conversation> {
  return postSheet('createConversation', data);
}

// ===== Message 관련 함수 =====

export interface Message {
  id: string;
  conversationId: string;
  senderType: 'user' | 'admin';
  content: string;
  createdAt: string;
}

export async function getMessages(conversationId: string): Promise<Message[]> {
  return fetchSheet<Message[]>('getMessages', { conversationId });
}

export async function sendMessage(data: {
  conversationId: string;
  senderType: 'user' | 'admin';
  content: string;
}): Promise<Message> {
  return postSheet('sendMessage', data);
}
