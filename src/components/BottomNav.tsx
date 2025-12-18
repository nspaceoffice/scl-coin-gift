'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Gift, History, Wallet, MessageCircle } from 'lucide-react';

export default function BottomNav() {
  const pathname = usePathname();

  // Hide on admin pages
  if (pathname.startsWith('/admin')) {
    return null;
  }

  const navItems = [
    { href: '/', icon: Gift, label: '선물하기' },
    { href: '/history', icon: History, label: '내역' },
    { href: '/receive', icon: Gift, label: '받기', rotate: true },
    { href: '/cash', icon: Wallet, label: '캐시' },
    { href: '/contact', icon: MessageCircle, label: '문의' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#F0F0F0] md:hidden z-50 safe-area-bottom">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
                isActive
                  ? 'text-[#FF4747]'
                  : 'text-[#999] hover:text-[#666]'
              }`}
            >
              <Icon size={20} className={item.rotate ? 'rotate-180' : ''} />
              <span className="text-[10px] font-medium">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
