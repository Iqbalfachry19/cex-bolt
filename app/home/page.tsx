"use client";

import { CexSolvency } from '@/components/CexSolvency';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, TrendingUp, Wallet2, LineChart } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="container py-8 max-w-7xl mx-auto">
      {/* Hero Section */}
      <section className="text-center mb-16">
        <h1 className="text-4xl font-bold mb-4">Welcome to SecureCEX</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Trade with confidence on our secure and transparent exchange platform
        </p>
      </section>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        <Link href="/wallet" className="block">
          <Card className="h-full hover:shadow-lg transition-shadow">
            <CardHeader>
              <Wallet2 className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Secure Wallet</CardTitle>
              <CardDescription>
                Manage your crypto assets with our secure wallet system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Multi-currency support</li>
                <li>• Instant deposits and withdrawals</li>
                <li>• Enhanced security features</li>
              </ul>
            </CardContent>
          </Card>
        </Link>

        <Link href="/market" className="block">
          <Card className="h-full hover:shadow-lg transition-shadow">
            <CardHeader>
              <LineChart className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Market Overview</CardTitle>
              <CardDescription>
                Stay updated with real-time market data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Real-time price updates</li>
                <li>• Market trends analysis</li>
                <li>• Trading pair information</li>
              </ul>
            </CardContent>
          </Card>
        </Link>

        <Link href="/trade" className="block">
          <Card className="h-full hover:shadow-lg transition-shadow">
            <CardHeader>
              <TrendingUp className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Advanced Trading</CardTitle>
              <CardDescription>
                Execute trades with professional tools
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Advanced order types</li>
                <li>• Professional charting</li>
                <li>• Real-time order book</li>
              </ul>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Solvency Proof Section */}
      <section className="mb-16">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-4">Proof of Solvency</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Verify our reserves in real-time with zero-knowledge proofs
          </p>
        </div>
        <CexSolvency />
      </section>

      {/* Security Features */}
      <section className="bg-card rounded-lg p-8 border">
        <div className="flex items-center gap-3 mb-6">
          <Shield className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold">Security Features</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <h3 className="font-semibold mb-2">Zero-Knowledge Proofs</h3>
            <p className="text-sm text-muted-foreground">
              Verify transactions and balances without compromising privacy
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Advanced Encryption</h3>
            <p className="text-sm text-muted-foreground">
              Industry-standard encryption for all transactions and data
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Regular Audits</h3>
            <p className="text-sm text-muted-foreground">
              Transparent security audits and compliance checks
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}