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
    { href: '/', icon: Gift, label: '선물하기', emoji: '🎁' },
    { href: '/history', icon: History, label: '내역', emoji: '📋' },
    { href: '/receive', icon: Gift, label: '받기', rotate: true, emoji: '🎀' },
    { href: '/cash', icon: Wallet, label: '캐시', emoji: '💰' },
    { href: '/contact', icon: MessageCircle, label: '문의', emoji: '💬' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-gray-100 md:hidden z-50 safe-area-bottom">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-all ${
                isActive
                  ? 'text-[#ff6b6b] bg-[#fff0f0]'
                  : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {isActive ? (
                <span className="text-xl">{item.emoji}</span>
              ) : (
                <Icon size={20} className={item.rotate ? 'rotate-180' : ''} />
              )}
              <span className={`text-[10px] font-medium ${isActive ? 'text-[#ff6b6b]' : ''}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
