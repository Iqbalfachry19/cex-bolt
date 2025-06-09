"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Wallet, 
  ArrowDownToLine, 
  ArrowUpFromLine, 
  Copy, 
  QrCode, 
  Eye, 
  EyeOff,
  Plus,
  Minus,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Send,
  Download
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface WalletBalance {
  id: string;
  asset: string;
  name: string;
  balance: number;
  availableBalance: number;
  lockedBalance: number;
  usdValue: number;
  price: number;
  change24h: number;
  changePercentage24h: number;
}

interface Transaction {
  id: string;
  type: 'deposit' | 'withdrawal' | 'trade' | 'transfer';
  asset: string;
  amount: number;
  status: 'completed' | 'pending' | 'failed';
  timestamp: Date;
  txHash?: string;
  fee?: number;
}

const mockBalances: WalletBalance[] = [
  {
    id: '1',
    asset: 'BTC',
    name: 'Bitcoin',
    balance: 0.5,
    availableBalance: 0.45,
    lockedBalance: 0.05,
    usdValue: 21625.25,
    price: 43250.50,
    change24h: 1087.50,
    changePercentage24h: 2.58
  },
  {
    id: '2',
    asset: 'ETH',
    name: 'Ethereum',
    balance: 5.2,
    availableBalance: 5.2,
    lockedBalance: 0,
    usdValue: 11703.90,
    price: 2250.75,
    change24h: -56.25,
    changePercentage24h: -2.44
  },
  {
    id: '3',
    asset: 'USDT',
    name: 'Tether',
    balance: 2500,
    availableBalance: 2500,
    lockedBalance: 0,
    usdValue: 2500,
    price: 1.00,
    change24h: 0,
    changePercentage24h: 0
  },
  {
    id: '4',
    asset: 'BNB',
    name: 'Binance Coin',
    balance: 10,
    availableBalance: 8.5,
    lockedBalance: 1.5,
    usdValue: 3202.50,
    price: 320.25,
    change24h: 2.56,
    changePercentage24h: 0.81
  }
];

const mockTransactions: Transaction[] = [
  {
    id: '1',
    type: 'deposit',
    asset: 'BTC',
    amount: 0.1,
    status: 'completed',
    timestamp: new Date('2024-12-01T10:30:00'),
    txHash: '0x1234...abcd',
    fee: 0.0001
  },
  {
    id: '2',
    type: 'withdrawal',
    asset: 'ETH',
    amount: 1.5,
    status: 'pending',
    timestamp: new Date('2024-12-01T09:15:00'),
    fee: 0.005
  },
  {
    id: '3',
    type: 'trade',
    asset: 'USDT',
    amount: 1000,
    status: 'completed',
    timestamp: new Date('2024-11-30T16:45:00'),
    fee: 1.0
  }
];

export function CexWallet() {
  const [balances, setBalances] = useState<WalletBalance[]>(mockBalances);
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions);
  const [showBalances, setShowBalances] = useState(true);
  const [selectedAsset, setSelectedAsset] = useState<string>('');
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawAddress, setWithdrawAddress] = useState('');
  const [isDepositDialogOpen, setIsDepositDialogOpen] = useState(false);
  const [isWithdrawDialogOpen, setIsWithdrawDialogOpen] = useState(false);

  const totalBalance = balances.reduce((sum, balance) => sum + balance.usdValue, 0);
  const totalChange24h = balances.reduce((sum, balance) => sum + balance.change24h, 0);
  const totalChangePercentage = totalBalance > 0 ? (totalChange24h / (totalBalance - totalChange24h)) * 100 : 0;

  const formatCurrency = (amount: number) => {
    return showBalances ? `$${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '****';
  };

  const formatCrypto = (amount: number, decimals: number = 6) => {
    return showBalances ? amount.toFixed(decimals) : '****';
  };

  const formatPercentage = (percentage: number) => {
    const sign = percentage >= 0 ? '+' : '';
    return `${sign}${percentage.toFixed(2)}%`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600';
      case 'pending': return 'text-yellow-600';
      case 'failed': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'deposit': return <ArrowDownToLine className="h-4 w-4" />;
      case 'withdrawal': return <ArrowUpFromLine className="h-4 w-4" />;
      case 'trade': return <RefreshCw className="h-4 w-4" />;
      case 'transfer': return <Send className="h-4 w-4" />;
      default: return <Wallet className="h-4 w-4" />;
    }
  };

  const handleDeposit = () => {
    // Mock deposit functionality
    console.log(`Depositing ${depositAmount} ${selectedAsset}`);
    setDepositAmount('');
    setIsDepositDialogOpen(false);
  };

  const handleWithdraw = () => {
    // Mock withdrawal functionality
    console.log(`Withdrawing ${withdrawAmount} ${selectedAsset} to ${withdrawAddress}`);
    setWithdrawAmount('');
    setWithdrawAddress('');
    setIsWithdrawDialogOpen(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="space-y-6">
      {/* Wallet Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowBalances(!showBalances)}
              className="h-4 w-4"
            >
              {showBalances ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            </Button>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalBalance)}</div>
            <div className={cn(
              "text-xs flex items-center",
              totalChangePercentage >= 0 ? "text-green-600" : "text-red-600"
            )}>
              {totalChangePercentage >= 0 ? (
                <TrendingUp className="h-3 w-3 mr-1" />
              ) : (
                <TrendingDown className="h-3 w-3 mr-1" />
              )}
              {formatPercentage(totalChangePercentage)} (24h)
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(balances.reduce((sum, b) => sum + (b.availableBalance * b.price), 0))}
            </div>
            <p className="text-xs text-muted-foreground">Ready for trading</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Locked Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(balances.reduce((sum, b) => sum + (b.lockedBalance * b.price), 0))}
            </div>
            <p className="text-xs text-muted-foreground">In orders & staking</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="balances" className="space-y-4">
        <TabsList>
          <TabsTrigger value="balances">Balances</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="addresses">Addresses</TabsTrigger>
        </TabsList>

        <TabsContent value="balances">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Asset Balances</CardTitle>
                  <CardDescription>Your cryptocurrency holdings</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Dialog open={isDepositDialogOpen} onOpenChange={setIsDepositDialogOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <ArrowDownToLine className="h-4 w-4 mr-2" />
                        Deposit
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Deposit Funds</DialogTitle>
                        <DialogDescription>
                          Add cryptocurrency to your wallet
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>Asset</Label>
                          <Select value={selectedAsset} onValueChange={setSelectedAsset}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select asset" />
                            </SelectTrigger>
                            <SelectContent>
                              {balances.map((balance) => (
                                <SelectItem key={balance.id} value={balance.asset}>
                                  {balance.asset} - {balance.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Amount</Label>
                          <Input
                            type="number"
                            placeholder="0.00"
                            value={depositAmount}
                            onChange={(e) => setDepositAmount(e.target.value)}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDepositDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={handleDeposit} disabled={!selectedAsset || !depositAmount}>
                          Generate Address
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  <Dialog open={isWithdrawDialogOpen} onOpenChange={setIsWithdrawDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline">
                        <ArrowUpFromLine className="h-4 w-4 mr-2" />
                        Withdraw
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Withdraw Funds</DialogTitle>
                        <DialogDescription>
                          Send cryptocurrency to external wallet
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>Asset</Label>
                          <Select value={selectedAsset} onValueChange={setSelectedAsset}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select asset" />
                            </SelectTrigger>
                            <SelectContent>
                              {balances.map((balance) => (
                                <SelectItem key={balance.id} value={balance.asset}>
                                  {balance.asset} - Available: {formatCrypto(balance.availableBalance)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Withdrawal Address</Label>
                          <Input
                            placeholder="Enter wallet address"
                            value={withdrawAddress}
                            onChange={(e) => setWithdrawAddress(e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Amount</Label>
                          <Input
                            type="number"
                            placeholder="0.00"
                            value={withdrawAmount}
                            onChange={(e) => setWithdrawAmount(e.target.value)}
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsWithdrawDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button 
                          onClick={handleWithdraw} 
                          disabled={!selectedAsset || !withdrawAmount || !withdrawAddress}
                        >
                          Withdraw
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Asset</TableHead>
                    <TableHead>Total Balance</TableHead>
                    <TableHead>Available</TableHead>
                    <TableHead>Locked</TableHead>
                    <TableHead>USD Value</TableHead>
                    <TableHead>24h Change</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {balances.map((balance) => (
                    <TableRow key={balance.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                            <span className="text-xs font-medium">{balance.asset.slice(0, 2)}</span>
                          </div>
                          <div>
                            <div className="font-medium">{balance.asset}</div>
                            <div className="text-xs text-muted-foreground">{balance.name}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{formatCrypto(balance.balance)}</div>
                        <div className="text-xs text-muted-foreground">${balance.price.toFixed(2)}</div>
                      </TableCell>
                      <TableCell>{formatCrypto(balance.availableBalance)}</TableCell>
                      <TableCell>{formatCrypto(balance.lockedBalance)}</TableCell>
                      <TableCell className="font-medium">{formatCurrency(balance.usdValue)}</TableCell>
                      <TableCell>
                        <div className={cn(
                          "flex items-center gap-1",
                          balance.changePercentage24h >= 0 ? "text-green-600" : "text-red-600"
                        )}>
                          {balance.changePercentage24h >= 0 ? (
                            <TrendingUp className="h-3 w-3" />
                          ) : (
                            <TrendingDown className="h-3 w-3" />
                          )}
                          {formatPercentage(balance.changePercentage24h)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedAsset(balance.asset);
                              setIsDepositDialogOpen(true);
                            }}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedAsset(balance.asset);
                              setIsWithdrawDialogOpen(true);
                            }}
                            disabled={balance.availableBalance === 0}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>Your recent wallet activity</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Asset</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>TX Hash</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((tx) => (
                    <TableRow key={tx.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getTypeIcon(tx.type)}
                          <span className="capitalize">{tx.type}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{tx.asset}</TableCell>
                      <TableCell>
                        <div className="font-medium">{formatCrypto(tx.amount)}</div>
                        {tx.fee && (
                          <div className="text-xs text-muted-foreground">
                            Fee: {formatCrypto(tx.fee)}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getStatusColor(tx.status)}>
                          {tx.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{tx.timestamp.toLocaleDateString()}</TableCell>
                      <TableCell>
                        {tx.txHash ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(tx.txHash!)}
                          >
                            <Copy className="h-3 w-3 mr-1" />
                            {tx.txHash.slice(0, 8)}...
                          </Button>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="addresses">
          <Card>
            <CardHeader>
              <CardTitle>Deposit Addresses</CardTitle>
              <CardDescription>Your wallet addresses for receiving funds</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {balances.map((balance) => (
                  <div key={balance.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-xs font-medium">{balance.asset.slice(0, 2)}</span>
                      </div>
                      <div>
                        <div className="font-medium">{balance.asset}</div>
                        <div className="text-xs text-muted-foreground font-mono">
                          {balance.asset === 'BTC' ? '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa' :
                           balance.asset === 'ETH' ? '0x742d35Cc6634C0532925a3b8D4C0C8b3C2b5d2e1' :
                           balance.asset === 'USDT' ? '0x742d35Cc6634C0532925a3b8D4C0C8b3C2b5d2e1' :
                           'bnb1grpf0955h0ykzq3ar5nmum7y6gdfl6lxfn46h2'}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <QrCode className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => copyToClipboard(
                          balance.asset === 'BTC' ? '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa' :
                          balance.asset === 'ETH' ? '0x742d35Cc6634C0532925a3b8D4C0C8b3C2b5d2e1' :
                          balance.asset === 'USDT' ? '0x742d35Cc6634C0532925a3b8D4C0C8b3C2b5d2e1' :
                          'bnb1grpf0955h0ykzq3ar5nmum7y6gdfl6lxfn46h2'
                        )}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}