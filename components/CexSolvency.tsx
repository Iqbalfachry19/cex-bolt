"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Wallet, LineChart, Loader2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface SolvencyData {
  totalAssets: number;
  totalLiabilities: number;
  proofOfReserves: number;
  lastUpdated: string;
}

export function CexSolvency() {
  const [isLoading, setIsLoading] = useState(false);
  const [solvencyData, setSolvencyData] = useState<SolvencyData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchSolvencyProof = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/solvency/proof');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch solvency proof');
      }

      setSolvencyData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          <CardTitle>Proof of Solvency</CardTitle>
        </div>
        <CardDescription>
          Verify our reserves and financial health using zero-knowledge proofs
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {solvencyData ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-muted p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Wallet className="h-4 w-4 text-primary" />
                    <h4 className="text-sm font-medium">Total Assets</h4>
                  </div>
                  <p className="text-2xl font-bold">${solvencyData.totalAssets.toLocaleString()}</p>
                </div>
                
                <div className="bg-muted p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <LineChart className="h-4 w-4 text-primary" />
                    <h4 className="text-sm font-medium">Total Liabilities</h4>
                  </div>
                  <p className="text-2xl font-bold">${solvencyData.totalLiabilities.toLocaleString()}</p>
                </div>
                
                <div className="bg-primary/10 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="h-4 w-4 text-primary" />
                    <h4 className="text-sm font-medium">Proof of Reserves</h4>
                  </div>
                  <p className="text-2xl font-bold">${solvencyData.proofOfReserves.toLocaleString()}</p>
                </div>
              </div>

              <div className="text-sm text-muted-foreground text-center">
                Last updated: {new Date(solvencyData.lastUpdated).toLocaleString()}
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                Click verify to check our proof of solvency
              </p>
            </div>
          )}

          {error && (
            <div className="p-4 bg-destructive/10 rounded-lg">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={fetchSolvencyProof}
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Verifying Solvency...
            </>
          ) : (
            <>
              <Shield className="mr-2 h-4 w-4" />
              Verify Solvency
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}