import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";

export const metadata: Metadata = {
  title: "스클코인 선물하기",
  description: "소중한 사람에게 스클코인을 선물하세요",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased pb-16 md:pb-0">
        <Header />
        <main className="max-w-4xl mx-auto">
          {children}
        </main>
        <BottomNav />
      </body>
    </html>
  );
}
