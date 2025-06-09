import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { Button } from '@/components/ui/button';
import { Shield, Home, Wallet, LineChart, TrendingUp, Bell } from 'lucide-react';
import Link from 'next/link';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'SecureCEX - Cryptocurrency Exchange',
  description: 'Secure cryptocurrency exchange with zero-knowledge proofs',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {/* Navigation Header */}
          <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 items-center justify-between">
              <div className="flex items-center gap-6">
                <Link href="/" className="flex items-center gap-2">
                  <Shield className="h-6 w-6 text-primary" />
                  <span className="text-lg font-semibold">SecureCEX</span>
                </Link>
                
                <nav className="hidden md:flex items-center gap-4">
                  <Link href="/home">
                    <Button variant="ghost" size="sm" className="gap-2">
                      <Home className="h-4 w-4" />
                      Home
                    </Button>
                  </Link>
                  <Link href="/portfolio">
                    <Button variant="ghost" size="sm" className="gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Portfolio
                    </Button>
                  </Link>
                  <Link href="/wallet">
                    <Button variant="ghost" size="sm" className="gap-2">
                      <Wallet className="h-4 w-4" />
                      Wallet
                    </Button>
                  </Link>
                  <Link href="/market">
                    <Button variant="ghost" size="sm" className="gap-2">
                      <LineChart className="h-4 w-4" />
                      Market
                    </Button>
                  </Link>
                  <Link href="/trade">
                    <Button variant="ghost" size="sm" className="gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Trade
                    </Button>
                  </Link>
                  <Link href="/notifications">
                    <Button variant="ghost" size="sm" className="gap-2">
                      <Bell className="h-4 w-4" />
                      Alerts
                    </Button>
                  </Link>
                </nav>
              </div>
            </div>
          </header>

          <main>{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}