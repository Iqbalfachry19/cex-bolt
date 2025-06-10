"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  ArrowDownToLine, 
  Copy, 
  QrCode, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Loader2,
  ExternalLink,
  Info
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface DepositInfo {
  success: boolean;
  depositAddress?: string;
  qrCode?: string;
  memo?: string;
  network: string;
  minAmount: number;
  confirmations: number;
  estimatedTime: string;
  error?: string;
}

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedAsset?: string;
  onDepositSuccess?: (asset: string, amount: number) => void;
}

const SUPPORTED_ASSETS = [
  { symbol: 'BTC', name: 'Bitcoin', icon: '₿' },
  { symbol: 'ETH', name: 'Ethereum', icon: 'Ξ' },
  { symbol: 'USDT', name: 'Tether', icon: '₮' },
  { symbol: 'BNB', name: 'BNB', icon: 'B' },
  { symbol: 'SOL', name: 'Solana', icon: 'S' },
  { symbol: 'ADA', name: 'Cardano', icon: 'A' },
  { symbol: 'DOT', name: 'Polkadot', icon: '●' }
];

export function DepositModal({ isOpen, onClose, selectedAsset, onDepositSuccess }: DepositModalProps) {
  const [asset, setAsset] = useState(selectedAsset || '');
  const [amount, setAmount] = useState('');
  const [depositInfo, setDepositInfo] = useState<DepositInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'select' | 'address' | 'confirm'>('select');
  const [copied, setCopied] = useState<'address' | 'memo' | null>(null);

  useEffect(() => {
    if (selectedAsset) {
      setAsset(selectedAsset);
    }
  }, [selectedAsset]);

  useEffect(() => {
    if (asset && step === 'address') {
      generateDepositAddress();
    }
  }, [asset, step]);

  const generateDepositAddress = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/wallet/deposit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ asset }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate deposit address');
      }

      setDepositInfo(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async (text: string, type: 'address' | 'memo') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleProceed = () => {
    if (step === 'select' && asset) {
      setStep('address');
    } else if (step === 'address' && depositInfo) {
      setStep('confirm');
    }
  };

  const handleBack = () => {
    if (step === 'address') {
      setStep('select');
      setDepositInfo(null);
    } else if (step === 'confirm') {
      setStep('address');
    }
  };

  const handleClose = () => {
    setStep('select');
    setAsset(selectedAsset || '');
    setAmount('');
    setDepositInfo(null);
    setError(null);
    onClose();
  };

  const selectedAssetInfo = SUPPORTED_ASSETS.find(a => a.symbol === asset);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ArrowDownToLine className="h-5 w-5" />
            Deposit Cryptocurrency
          </DialogTitle>
          <DialogDescription>
            {step === 'select' && 'Select the cryptocurrency you want to deposit'}
            {step === 'address' && 'Send your cryptocurrency to the address below'}
            {step === 'confirm' && 'Confirm your deposit details'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Step 1: Asset Selection */}
          {step === 'select' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Select Asset</Label>
                <Select value={asset} onValueChange={setAsset}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose cryptocurrency" />
                  </SelectTrigger>
                  <SelectContent>
                    {SUPPORTED_ASSETS.map((assetInfo) => (
                      <SelectItem key={assetInfo.symbol} value={assetInfo.symbol}>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm">{assetInfo.icon}</span>
                          <span>{assetInfo.symbol}</span>
                          <span className="text-muted-foreground">- {assetInfo.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Amount (Optional)</Label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  You can specify the amount you plan to deposit for reference
                </p>
              </div>
            </div>
          )}

          {/* Step 2: Deposit Address */}
          {step === 'address' && (
            <div className="space-y-4">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin" />
                  <span className="ml-2">Generating deposit address...</span>
                </div>
              ) : error ? (
                <div className="p-4 bg-destructive/10 rounded-lg flex items-start gap-2">
                  <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-destructive">Error</p>
                    <p className="text-xs text-muted-foreground mt-1">{error}</p>
                  </div>
                </div>
              ) : depositInfo ? (
                <div className="space-y-4">
                  {/* Asset Info */}
                  <Card>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-lg">{selectedAssetInfo?.icon}</span>
                          <div>
                            <CardTitle className="text-lg">{asset}</CardTitle>
                            <CardDescription>{depositInfo.network}</CardDescription>
                          </div>
                        </div>
                        <Badge variant="outline">
                          {depositInfo.confirmations} confirmations
                        </Badge>
                      </div>
                    </CardHeader>
                  </Card>

                  {/* Deposit Address */}
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Deposit Address</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 p-3 bg-muted rounded-lg font-mono text-sm break-all">
                          {depositInfo.depositAddress}
                        </div>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleCopy(depositInfo.depositAddress!, 'address')}
                        >
                          {copied === 'address' ? (
                            <CheckCircle className="h-4 w-4 text-green-600" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>

                      {depositInfo.memo && (
                        <>
                          <Separator />
                          <div>
                            <Label className="text-sm font-medium">Memo/Tag</Label>
                            <div className="flex items-center gap-2 mt-1">
                              <div className="flex-1 p-3 bg-muted rounded-lg font-mono text-sm">
                                {depositInfo.memo}
                              </div>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handleCopy(depositInfo.memo!, 'memo')}
                              >
                                {copied === 'memo' ? (
                                  <CheckCircle className="h-4 w-4 text-green-600" />
                                ) : (
                                  <Copy className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </div>
                        </>
                      )}

                      {/* QR Code */}
                      <div className="flex justify-center pt-2">
                        <div className="p-4 bg-white rounded-lg border">
                          <img 
                            src={depositInfo.qrCode} 
                            alt="Deposit QR Code"
                            className="w-32 h-32"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Important Information */}
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="p-3 bg-muted rounded-lg">
                        <div className="text-muted-foreground">Min Amount</div>
                        <div className="font-medium">{depositInfo.minAmount} {asset}</div>
                      </div>
                      <div className="p-3 bg-muted rounded-lg">
                        <div className="text-muted-foreground">Est. Time</div>
                        <div className="font-medium">{depositInfo.estimatedTime}</div>
                      </div>
                    </div>

                    <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                      <div className="flex items-start gap-2">
                        <Info className="h-4 w-4 text-yellow-600 mt-0.5 shrink-0" />
                        <div className="text-xs">
                          <p className="font-medium text-yellow-800 dark:text-yellow-200">Important</p>
                          <ul className="text-yellow-700 dark:text-yellow-300 mt-1 space-y-1">
                            <li>• Only send {asset} to this address</li>
                            <li>• Minimum deposit: {depositInfo.minAmount} {asset}</li>
                            <li>• Requires {depositInfo.confirmations} network confirmations</li>
                            {depositInfo.memo && <li>• Don't forget to include the memo/tag</li>}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Confirmation */}
          {step === 'confirm' && depositInfo && (
            <div className="space-y-4">
              <div className="text-center py-6">
                <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold">Deposit Address Generated</h3>
                <p className="text-muted-foreground">
                  Your deposit will be credited after {depositInfo.confirmations} confirmations
                </p>
              </div>

              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Asset:</span>
                      <span className="font-medium">{asset}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Network:</span>
                      <span className="font-medium">{depositInfo.network}</span>
                    </div>
                    {amount && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Amount:</span>
                        <span className="font-medium">{amount} {asset}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Est. Time:</span>
                      <span className="font-medium">{depositInfo.estimatedTime}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="flex items-start gap-2">
                  <Clock className="h-4 w-4 text-blue-600 mt-0.5 shrink-0" />
                  <div className="text-xs">
                    <p className="font-medium text-blue-800 dark:text-blue-200">Next Steps</p>
                    <p className="text-blue-700 dark:text-blue-300 mt-1">
                      Send your {asset} to the provided address. Your deposit will appear in your wallet 
                      after network confirmation. You can track the status in your transaction history.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="flex gap-2">
          {step !== 'select' && (
            <Button variant="outline\" onClick={handleBack}>
              Back
            </Button>
          )}
          
          {step === 'select' && (
            <Button onClick={handleProceed} disabled={!asset}>
              Generate Address
            </Button>
          )}
          
          {step === 'address' && depositInfo && (
            <Button onClick={handleProceed}>
              Confirm
            </Button>
          )}
          
          {step === 'confirm' && (
            <Button onClick={handleClose}>
              Done
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}