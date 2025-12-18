'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Gift, History, Wallet, MessageCircle, Settings } from 'lucide-react';

export default function Header() {
  const pathname = usePathname();

  const isAdmin = pathname.startsWith('/admin');

  if (isAdmin) {
    return (
      <header className="bg-white border-b border-[#F0F0F0] sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/admin" className="font-bold text-lg text-[#FF4747]">
            스클코인 관리자
          </Link>
          <nav className="flex items-center gap-4">
            <Link
              href="/admin"
              className={`text-sm font-medium transition-colors ${pathname === '/admin' ? 'text-[#FF4747]' : 'text-[#666] hover:text-[#1a1a1a]'}`}
            >
              구매 리스트
            </Link>
            <Link
              href="/admin/inbox"
              className={`text-sm font-medium transition-colors ${pathname === '/admin/inbox' ? 'text-[#FF4747]' : 'text-[#666] hover:text-[#1a1a1a]'}`}
            >
              문의 인박스
            </Link>
            <Link href="/" className="text-sm text-[#666] hover:text-[#1a1a1a] transition-colors">
              유저 화면
            </Link>
          </nav>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-white border-b border-[#F0F0F0] sticky top-0 z-50">
      <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="font-bold text-lg text-[#FF4747]">
            스클코인
          </span>
        </Link>
        <nav className="hidden md:flex items-center gap-1">
          <Link
            href="/"
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${pathname === '/' ? 'text-[#FF4747] bg-[#FFF5F5]' : 'text-[#666] hover:text-[#1a1a1a] hover:bg-[#F8F9FA]'}`}
          >
            선물하기
          </Link>
          <Link
            href="/history"
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${pathname === '/history' ? 'text-[#FF4747] bg-[#FFF5F5]' : 'text-[#666] hover:text-[#1a1a1a] hover:bg-[#F8F9FA]'}`}
          >
            선물 내역
          </Link>
          <Link
            href="/receive"
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${pathname === '/receive' ? 'text-[#FF4747] bg-[#FFF5F5]' : 'text-[#666] hover:text-[#1a1a1a] hover:bg-[#F8F9FA]'}`}
          >
            선물 받기
          </Link>
          <Link
            href="/cash"
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${pathname === '/cash' ? 'text-[#FF4747] bg-[#FFF5F5]' : 'text-[#666] hover:text-[#1a1a1a] hover:bg-[#F8F9FA]'}`}
          >
            나의 캐시
          </Link>
          <Link
            href="/contact"
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${pathname === '/contact' ? 'text-[#FF4747] bg-[#FFF5F5]' : 'text-[#666] hover:text-[#1a1a1a] hover:bg-[#F8F9FA]'}`}
          >
            문의하기
          </Link>
          <Link
            href="/admin"
            className={`p-2 rounded-lg transition-colors ${pathname.startsWith('/admin') ? 'text-[#FF4747] bg-[#FFF5F5]' : 'text-[#999] hover:text-[#666] hover:bg-[#F8F9FA]'}`}
            title="관리자"
          >
            <Settings size={18} />
          </Link>
        </nav>
      </div>
    </header>
  );
}
