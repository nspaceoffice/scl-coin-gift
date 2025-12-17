export interface User {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  createdAt: string;
}

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
  registeredAt?: string;
  refundedAt?: string;
  thankYouMessage?: string;
  createdAt: string;
  expiresAt: string;
}

export interface Payment {
  id: string;
  giftId: string;
  amount: number;
  method: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  tossPaymentKey?: string;
  createdAt: string;
}

export interface Cash {
  id: string;
  userId: string;
  amount: number;
  type: 'purchase' | 'refund' | 'gift_received';
  description: string;
  relatedGiftId?: string;
  createdAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderType: 'user' | 'admin';
  content: string;
  createdAt: string;
  readAt?: string;
}

export interface Conversation {
  id: string;
  userId: string;
  userName: string;
  userEmail?: string;
  status: 'open' | 'closed';
  lastMessage?: string;
  lastMessageAt?: string;
  createdAt: string;
}

export type AmountOption = {
  value: number;
  label: string;
};

export const AMOUNT_OPTIONS: AmountOption[] = [
  { value: 10000, label: '1만원' },
  { value: 30000, label: '3만원' },
  { value: 50000, label: '5만원' },
  { value: 100000, label: '10만원' },
  { value: 1000000, label: '100만원' },
];
