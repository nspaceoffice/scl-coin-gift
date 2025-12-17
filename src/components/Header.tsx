'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Gift, History, Wallet, MessageCircle, Settings } from 'lucide-react';

export default function Header() {
  const pathname = usePathname();

  const isAdmin = pathname.startsWith('/admin');

  if (isAdmin) {
    return (
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/admin" className="font-bold text-lg bg-gradient-to-r from-[#ff6b6b] to-[#ffa502] bg-clip-text text-transparent">
            🎁 스클코인 관리자
          </Link>
          <nav className="flex items-center gap-4">
            <Link
              href="/admin"
              className={`text-sm font-medium transition-colors ${pathname === '/admin' ? 'text-[#ff6b6b]' : 'text-gray-500 hover:text-gray-700'}`}
            >
              구매 리스트
            </Link>
            <Link
              href="/admin/inbox"
              className={`text-sm font-medium transition-colors ${pathname === '/admin/inbox' ? 'text-[#ff6b6b]' : 'text-gray-500 hover:text-gray-700'}`}
            >
              문의 인박스
            </Link>
            <Link href="/" className="text-sm text-gray-500 hover:text-gray-700 transition-colors">
              유저 화면
            </Link>
          </nav>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl">🎁</span>
          <span className="font-bold text-lg bg-gradient-to-r from-[#ff6b6b] to-[#ffa502] bg-clip-text text-transparent">
            스클코인
          </span>
        </Link>
        <nav className="flex items-center gap-1">
          <Link
            href="/"
            className={`p-2.5 rounded-xl transition-all ${pathname === '/' ? 'bg-gradient-to-r from-[#ff6b6b] to-[#ffa502] text-white shadow-md' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}
            title="선물하기"
          >
            <Gift size={20} />
          </Link>
          <Link
            href="/history"
            className={`p-2.5 rounded-xl transition-all ${pathname === '/history' ? 'bg-gradient-to-r from-[#ff6b6b] to-[#ffa502] text-white shadow-md' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}
            title="선물 내역"
          >
            <History size={20} />
          </Link>
          <Link
            href="/receive"
            className={`p-2.5 rounded-xl transition-all ${pathname === '/receive' ? 'bg-gradient-to-r from-[#ff6b6b] to-[#ffa502] text-white shadow-md' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}
            title="선물 받기"
          >
            <Gift size={20} className="rotate-180" />
          </Link>
          <Link
            href="/cash"
            className={`p-2.5 rounded-xl transition-all ${pathname === '/cash' ? 'bg-gradient-to-r from-[#ff6b6b] to-[#ffa502] text-white shadow-md' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}
            title="나의 캐시"
          >
            <Wallet size={20} />
          </Link>
          <Link
            href="/contact"
            className={`p-2.5 rounded-xl transition-all ${pathname === '/contact' ? 'bg-gradient-to-r from-[#ff6b6b] to-[#ffa502] text-white shadow-md' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}
            title="문의하기"
          >
            <MessageCircle size={20} />
          </Link>
          <Link
            href="/admin"
            className={`p-2.5 rounded-xl transition-all ${pathname.startsWith('/admin') ? 'bg-gradient-to-r from-[#ff6b6b] to-[#ffa502] text-white shadow-md' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}
            title="관리자"
          >
            <Settings size={20} />
          </Link>
        </nav>
      </div>
    </header>
  );
}
