"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ProofData } from '@/lib/zkp/prover';
import { verifyAgeProof } from '@/lib/zkp/verifier';
import { AlertCircle, Check, ShieldCheck, Loader2, Send } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface AgeVerifierProps {
  proof: ProofData | null;
  minAge: number;
}

export function AgeVerifier({ proof, minAge }: AgeVerifierProps) {
  const [isVerifying, setIsVerifying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [verificationResult, setVerificationResult] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleVerify = async () => {
    if (!proof) {
      setError("No proof to verify");
      return;
    }

    setIsVerifying(true);
    setProgress(0);
    setError(null);
    setVerificationResult(null);

    // Simulate progress updates
    const interval = setInterval(() => {
      setProgress((prev) => {
        const increment = Math.floor(Math.random() * 10) + 1;
        const newProgress = prev + increment;
        return newProgress > 95 ? 95 : newProgress;
      });
    }, 200);

    try {
      // Verify the proof
      const result = await verifyAgeProof(proof);
      
      // Complete progress
      clearInterval(interval);
      setProgress(100);
      
      // Short delay before completing to show 100% progress
      setTimeout(() => {
        setVerificationResult(result);
        setIsVerifying(false);
      }, 500);
    } catch (err) {
      clearInterval(interval);
      setError(err instanceof Error ? err.message : "Unknown error occurred");
      setIsVerifying(false);
    }
  };

  return (
    <Card className="border">
      <CardHeader className="space-y-1">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-primary" />
          <CardTitle className="text-xl">Age Verification</CardTitle>
        </div>
        <CardDescription>
          Verify zero-knowledge proof to confirm age {minAge}+
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {!proof ? (
            <div className="bg-muted p-4 rounded-md text-center">
              <p className="text-sm text-muted-foreground">
                No proof available to verify. Generate a proof first.
              </p>
            </div>
          ) : (
            <>
              <div className="bg-muted p-3 rounded-md">
                <p className="text-xs text-muted-foreground">Verification Request</p>
                <p className="text-sm font-medium">Age verification ({minAge}+ years)</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Zero-knowledge proof received
                </p>
              </div>

              {isVerifying && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-primary animate-pulse" />
                    <span className="text-sm">Verifying proof...</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              )}

              {error && (
                <div className="bg-destructive/10 p-3 rounded-md flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-destructive">Error verifying proof</p>
                    <p className="text-xs text-muted-foreground mt-1">{error}</p>
                  </div>
                </div>
              )}
              
              {verificationResult !== null && (
                <div className={cn(
                  "p-3 rounded-md flex items-start gap-2",
                  verificationResult ? "bg-primary/10" : "bg-destructive/10"
                )}>
                  {verificationResult ? (
                    <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                  )}
                  <div>
                    <p className="text-sm font-medium">
                      {verificationResult 
                        ? "Verification successful" 
                        : "Verification failed"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {verificationResult 
                        ? `The person is ${minAge}+ years old` 
                        : `The person is not ${minAge}+ years old`}
                    </p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleVerify}
          disabled={!proof || isVerifying || verificationResult !== null}
          className="w-full"
        >
          {isVerifying ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Verifying Proof
            </>
          ) : verificationResult !== null ? (
            verificationResult ? (
              <>
                <Check className="mr-2 h-4 w-4" />
                Age Verified
              </>
            ) : (
              <>
                <AlertCircle className="mr-2 h-4 w-4" />
                Age Not Verified
              </>
            )
          ) : (
            <>
              <Send className="mr-2 h-4 w-4" />
              Verify Age
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}