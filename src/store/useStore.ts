import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UserState {
  userId: string | null;
  userName: string | null;
  userEmail: string | null;
  userPhone: string | null;
  isAdmin: boolean;
  setUser: (user: { id: string; name: string; email?: string; phone?: string; isAdmin?: boolean }) => void;
  clearUser: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      userId: null,
      userName: null,
      userEmail: null,
      userPhone: null,
      isAdmin: false,
      setUser: (user) => set({
        userId: user.id,
        userName: user.name,
        userEmail: user.email || null,
        userPhone: user.phone || null,
        isAdmin: user.isAdmin || false,
      }),
      clearUser: () => set({
        userId: null,
        userName: null,
        userEmail: null,
        userPhone: null,
        isAdmin: false,
      }),
    }),
    {
      name: 'user-storage',
    }
  )
);

interface GiftFormState {
  amount: number | null;
  customAmount: string;
  senderName: string;
  senderPhone: string;
  senderEmail: string;
  receiverName: string;
  receiverPhone: string;
  receiverEmail: string;
  message: string;
  setAmount: (amount: number | null) => void;
  setCustomAmount: (amount: string) => void;
  setSenderName: (name: string) => void;
  setSenderPhone: (phone: string) => void;
  setSenderEmail: (email: string) => void;
  setReceiverName: (name: string) => void;
  setReceiverPhone: (phone: string) => void;
  setReceiverEmail: (email: string) => void;
  setMessage: (message: string) => void;
  reset: () => void;
}

const initialGiftFormState = {
  amount: null,
  customAmount: '',
  senderName: '',
  senderPhone: '',
  senderEmail: '',
  receiverName: '',
  receiverPhone: '',
  receiverEmail: '',
  message: '',
};

export const useGiftFormStore = create<GiftFormState>((set) => ({
  ...initialGiftFormState,
  setAmount: (amount) => set({ amount }),
  setCustomAmount: (customAmount) => set({ customAmount }),
  setSenderName: (senderName) => set({ senderName }),
  setSenderPhone: (senderPhone) => set({ senderPhone }),
  setSenderEmail: (senderEmail) => set({ senderEmail }),
  setReceiverName: (receiverName) => set({ receiverName }),
  setReceiverPhone: (receiverPhone) => set({ receiverPhone }),
  setReceiverEmail: (receiverEmail) => set({ receiverEmail }),
  setMessage: (message) => set({ message }),
  reset: () => set(initialGiftFormState),
}));
