"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { generateAgeProof, AgeProofInput, ProofData } from '@/lib/zkp/prover';
import { DateInfo } from '@/lib/ocr/dateExtractor';
import { AlertCircle, Check, Lock, Shield, Loader2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface AgeProverProps {
  birthDate: DateInfo | null;
  minAge: number;
  onProofGenerated: (proof: ProofData) => void;
}

export function AgeProver({ birthDate, minAge, onProofGenerated }: AgeProverProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [proof, setProof] = useState<ProofData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const getCurrentDate = (): DateInfo => {
    const now = new Date();
    return {
      year: now.getFullYear(),
      month: now.getMonth() + 1, // JavaScript months are 0-based
      day: now.getDate()
    };
  };

  const handleGenerateProof = async () => {
    if (!birthDate) {
      setError("Birth date is required to generate a proof");
      return;
    }

    setIsGenerating(true);
    setProgress(0);
    setError(null);

    // Simulate progress updates
    const interval = setInterval(() => {
      setProgress((prev) => {
        const increment = Math.floor(Math.random() * 10) + 1;
        const newProgress = prev + increment;
        return newProgress > 95 ? 95 : newProgress;
      });
    }, 300);

    try {
      const proofInput: AgeProofInput = {
        birthDate,
        currentDate: getCurrentDate(),
        minAge
      };

      const generatedProof = await generateAgeProof(proofInput);
      
      // Complete progress
      clearInterval(interval);
      setProgress(100);
      
      // Short delay before completing to show 100% progress
      setTimeout(() => {
        if (generatedProof) {
          setProof(generatedProof);
          onProofGenerated(generatedProof);
        } else {
          setError("Failed to generate proof");
        }
        setIsGenerating(false);
      }, 500);
    } catch (err) {
      clearInterval(interval);
      setError(err instanceof Error ? err.message : "Unknown error occurred");
      setIsGenerating(false);
    }
  };

  // Calculate actual age for display (only on client)
  const calculateAge = (): number | null => {
    if (!birthDate) return null;
    
    const current = getCurrentDate();
    let age = current.year - birthDate.year;
    
    // Adjust age if birthday hasn't occurred yet this year
    if (current.month < birthDate.month || 
        (current.month === birthDate.month && current.day < birthDate.day)) {
      age--;
    }
    
    return age;
  };

  const age = calculateAge();
  const isOldEnough = age !== null && age >= minAge;

  return (
    <Card className="border relative">
      <CardHeader className="space-y-1">
        <div className="flex items-center gap-2">
          <Lock className="h-4 w-4 text-primary" />
          <CardTitle className="text-xl">Age Verification</CardTitle>
        </div>
        <CardDescription>
          Generate a zero-knowledge proof that you're at least {minAge} years old
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!birthDate ? (
          <div className="bg-muted p-4 rounded-md text-center">
            <p className="text-sm text-muted-foreground">
              Please scan your ID document first to extract your birth date
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-muted p-3 rounded-md">
                <p className="text-xs text-muted-foreground">Birth Date</p>
                <p className="text-sm font-medium">
                  {birthDate.month}/{birthDate.day}/{birthDate.year}
                </p>
              </div>
              <div className="bg-muted p-3 rounded-md">
                <p className="text-xs text-muted-foreground">Required Age</p>
                <p className="text-sm font-medium">{minAge}+</p>
              </div>
            </div>

            {age !== null && (
              <div className={cn(
                "p-3 rounded-md flex items-start gap-2",
                isOldEnough ? "bg-primary/10" : "bg-destructive/10"
              )}>
                {isOldEnough ? (
                  <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                )}
                <div>
                  <p className="text-sm font-medium">
                    {isOldEnough 
                      ? "You meet the age requirement" 
                      : "You do not meet the age requirement"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {isOldEnough 
                      ? `You can generate a zero-knowledge proof that you are ${minAge}+ years old` 
                      : `You must be at least ${minAge} years old`}
                  </p>
                </div>
              </div>
            )}

            {isGenerating && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-primary animate-pulse" />
                  <span className="text-sm">Generating proof...</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            )}

            {error && (
              <div className="bg-destructive/10 p-3 rounded-md flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-destructive">Error generating proof</p>
                  <p className="text-xs text-muted-foreground mt-1">{error}</p>
                </div>
              </div>
            )}
            
            {proof && (
              <div className="bg-primary/10 p-3 rounded-md flex items-start gap-2">
                <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium">Proof successfully generated</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Your personal data remains private. Only the verification result will be shared.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleGenerateProof}
          disabled={!birthDate || isGenerating || !isOldEnough || !!proof}
          className="w-full"
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating Proof
            </>
          ) : proof ? (
            <>
              <Check className="mr-2 h-4 w-4" />
              Proof Generated
            </>
          ) : (
            <>
              <Shield className="mr-2 h-4 w-4" />
              Generate Zero-Knowledge Proof
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}