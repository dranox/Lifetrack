import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/ui/Navbar";
import { ChatBubbleWrapper } from "@/components/chat/ChatBubbleWrapper";

const inter = Inter({
  subsets: ["latin", "vietnamese"],
});

export const metadata: Metadata = {
  title: "Lifetrack",
  description: "Ứng dụng quản lý chi tiêu và lịch trình cá nhân thông minh",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className={`${inter.className} antialiased bg-gray-50 dark:bg-gray-900`}>
        <Navbar />
        <main className="md:ml-64 min-h-screen pb-20 md:pb-0">
          {children}
        </main>
        <ChatBubbleWrapper />
      </body>
    </html>
  );
}
