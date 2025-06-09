"use client";

import { CexWallet } from '@/components/CexWallet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Wallet, ArrowDownToLine, ArrowUpFromLine, Clock } from 'lucide-react';

export default function WalletPage() {
  return (
    <div className="container py-8 max-w-7xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <Wallet className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Wallet</h1>
          <p className="text-muted-foreground">Manage your crypto assets</p>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-8">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="deposit">Deposit</TabsTrigger>
          <TabsTrigger value="withdraw">Withdraw</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid gap-6">
            <CexWallet />
          </div>
        </TabsContent>

        <TabsContent value="deposit">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <ArrowDownToLine className="h-5 w-5 text-primary" />
                <CardTitle>Deposit Funds</CardTitle>
              </div>
              <CardDescription>
                Add funds to your exchange wallet
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Deposit form will be implemented here */}
              <p className="text-muted-foreground">Deposit functionality coming soon</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="withdraw">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <ArrowUpFromLine className="h-5 w-5 text-primary" />
                <CardTitle>Withdraw Funds</CardTitle>
              </div>
              <CardDescription>
                Withdraw your funds to external wallets
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Withdrawal form will be implemented here */}
              <p className="text-muted-foreground">Withdrawal functionality coming soon</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                <CardTitle>Transaction History</CardTitle>
              </div>
              <CardDescription>
                View your past transactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Transaction history will be implemented here */}
              <p className="text-muted-foreground">Transaction history coming soon</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}