'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Gift, History, Wallet, MessageCircle, Settings } from 'lucide-react';

export default function Header() {
  const pathname = usePathname();

  const isAdmin = pathname.startsWith('/admin');

  if (isAdmin) {
    return (
      <header className="bg-white border-b border-border sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/admin" className="font-bold text-lg text-primary">
            스클코인 관리자
          </Link>
          <nav className="flex items-center gap-4">
            <Link
              href="/admin"
              className={`text-sm ${pathname === '/admin' ? 'text-primary font-semibold' : 'text-text-gray'}`}
            >
              구매 리스트
            </Link>
            <Link
              href="/admin/inbox"
              className={`text-sm ${pathname === '/admin/inbox' ? 'text-primary font-semibold' : 'text-text-gray'}`}
            >
              문의 인박스
            </Link>
            <Link href="/" className="text-sm text-text-gray">
              유저 화면
            </Link>
          </nav>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-white border-b border-border sticky top-0 z-50">
      <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="font-bold text-lg text-primary">
          스클코인
        </Link>
        <nav className="flex items-center gap-1">
          <Link
            href="/"
            className={`p-2 rounded-lg ${pathname === '/' ? 'bg-primary/10 text-primary' : 'text-text-gray'}`}
            title="선물하기"
          >
            <Gift size={20} />
          </Link>
          <Link
            href="/history"
            className={`p-2 rounded-lg ${pathname === '/history' ? 'bg-primary/10 text-primary' : 'text-text-gray'}`}
            title="선물 내역"
          >
            <History size={20} />
          </Link>
          <Link
            href="/receive"
            className={`p-2 rounded-lg ${pathname === '/receive' ? 'bg-primary/10 text-primary' : 'text-text-gray'}`}
            title="선물 받기"
          >
            <Gift size={20} className="rotate-180" />
          </Link>
          <Link
            href="/cash"
            className={`p-2 rounded-lg ${pathname === '/cash' ? 'bg-primary/10 text-primary' : 'text-text-gray'}`}
            title="나의 캐시"
          >
            <Wallet size={20} />
          </Link>
          <Link
            href="/contact"
            className={`p-2 rounded-lg ${pathname === '/contact' ? 'bg-primary/10 text-primary' : 'text-text-gray'}`}
            title="문의하기"
          >
            <MessageCircle size={20} />
          </Link>
          <Link
            href="/admin"
            className={`p-2 rounded-lg ${pathname.startsWith('/admin') ? 'bg-primary/10 text-primary' : 'text-text-gray'}`}
            title="관리자"
          >
            <Settings size={20} />
          </Link>
        </nav>
      </div>
    </header>
  );
}
