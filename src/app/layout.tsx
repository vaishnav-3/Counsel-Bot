import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { SessionProvider } from '@/components/SessionProvider';
import { TRPCProvider } from '@/trpc/provider';
import { ThemeProvider } from '@/components/ThemeProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'AI Career Counselor',
  description: 'Get personalized career guidance from AI',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SessionProvider>
          <ThemeProvider>
            <TRPCProvider>{children}</TRPCProvider>
          </ThemeProvider>
        </SessionProvider>
      </body>
    </html>
  );
}