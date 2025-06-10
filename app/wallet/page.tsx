"use client";

import { CexWallet } from '@/components/CexWallet';
import { DepositModal } from '@/components/DepositModal';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wallet, ArrowDownToLine, ArrowUpFromLine, Clock, Plus } from 'lucide-react';
import { useState } from 'react';

export default function WalletPage() {
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<string>('');

  const handleDepositClick = (asset?: string) => {
    if (asset) {
      setSelectedAsset(asset);
    }
    setIsDepositModalOpen(true);
  };

  const handleDepositSuccess = (asset: string, amount: number) => {
    console.log(`Deposit successful: ${amount} ${asset}`);
    // Here you would typically refresh the wallet data or show a success message
  };

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
            <CexWallet onDepositClick={handleDepositClick} />
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
                Add cryptocurrency to your exchange wallet
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  Choose a cryptocurrency to deposit and get your unique deposit address.
                </p>
                
                <Button onClick={() => handleDepositClick()} className="w-full sm:w-auto">
                  <Plus className="h-4 w-4 mr-2" />
                  Start Deposit
                </Button>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
                  {[
                    { symbol: 'BTC', name: 'Bitcoin', icon: '₿' },
                    { symbol: 'ETH', name: 'Ethereum', icon: 'Ξ' },
                    { symbol: 'USDT', name: 'Tether', icon: '₮' },
                    { symbol: 'BNB', name: 'BNB', icon: 'B' },
                    { symbol: 'SOL', name: 'Solana', icon: 'S' },
                    { symbol: 'ADA', name: 'Cardano', icon: 'A' }
                  ].map((asset) => (
                    <Card key={asset.symbol} className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                              <span className="font-mono text-lg">{asset.icon}</span>
                            </div>
                            <div>
                              <div className="font-medium">{asset.symbol}</div>
                              <div className="text-sm text-muted-foreground">{asset.name}</div>
                            </div>
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDepositClick(asset.symbol)}
                          >
                            Deposit
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
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
              <p className="text-muted-foreground">Transaction history coming soon</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <DepositModal
        isOpen={isDepositModalOpen}
        onClose={() => {
          setIsDepositModalOpen(false);
          setSelectedAsset('');
        }}
        selectedAsset={selectedAsset}
        onDepositSuccess={handleDepositSuccess}
      />
    </div>
  );
}