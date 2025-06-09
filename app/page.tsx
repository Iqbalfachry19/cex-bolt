"use client";

import { useState } from 'react';
import { IdScanner } from '@/components/IdScanner';
import { AgeProver } from '@/components/AgeProver';
import { AgeVerifier } from '@/components/AgeVerifier';
import { CexLogin } from '@/components/CexLogin';
import { DateInfo } from '@/lib/ocr/dateExtractor';
import { ProofData } from '@/lib/zkp/prover';
import { ThemeSwitcher } from '@/components/ThemeSwitcher';
import { InfoModal } from '@/components/InfoModal';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Shield, Lock, Eye } from 'lucide-react';

export default function Home() {
  const [birthDate, setBirthDate] = useState<DateInfo | null>(null);
  const [proof, setProof] = useState<ProofData | null>(null);
  const [minAge] = useState<number>(18); // Set minimum age requirement

  const handleDateExtracted = (dateInfo: DateInfo) => {
    setBirthDate(dateInfo);
    setProof(null); // Reset proof when new date is extracted
  };

  const handleProofGenerated = (proofData: ProofData) => {
    setProof(proofData);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            <h1 className="text-lg font-semibold">CEX Age Verification</h1>
          </div>
          <div className="flex items-center gap-2">
            <InfoModal />
            <ThemeSwitcher />
          </div>
        </div>
      </header>

      <main className="container py-8 max-w-4xl mx-auto">
        {/* Hero section */}
        <section className="mb-12 text-center">
          <div className="inline-flex items-center justify-center p-1 px-3 mb-3 text-sm font-medium rounded-full bg-primary/10 text-primary">
            <Lock className="h-3.5 w-3.5 mr-1" />
            Privacy-Preserving Technology
          </div>
          <h1 className="text-4xl font-bold mb-3">Secure Exchange Access with Age Verification</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Verify your age without revealing personal information to access the exchange
          </p>
        </section>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="p-6 bg-card rounded-lg shadow-sm border">
            <div className="rounded-full w-10 h-10 flex items-center justify-center bg-primary/10 mb-4">
              <Eye className="h-5 w-5 text-primary" />
            </div>
            <h3 className="text-lg font-medium mb-2">Scan Your ID</h3>
            <p className="text-muted-foreground text-sm">
              Securely scan your ID document. The data never leaves your device.
            </p>
          </div>
          
          <div className="p-6 bg-card rounded-lg shadow-sm border">
            <div className="rounded-full w-10 h-10 flex items-center justify-center bg-primary/10 mb-4">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <h3 className="text-lg font-medium mb-2">Generate Proof</h3>
            <p className="text-muted-foreground text-sm">
              Create a cryptographic proof that you're above the required age.
            </p>
          </div>
          
          <div className="p-6 bg-card rounded-lg shadow-sm border">
            <div className="rounded-full w-10 h-10 flex items-center justify-center bg-primary/10 mb-4">
              <Lock className="h-5 w-5 text-primary" />
            </div>
            <h3 className="text-lg font-medium mb-2">Access Exchange</h3>
            <p className="text-muted-foreground text-sm">
              Login securely with your verified age proof.
            </p>
          </div>
        </div>

        <Separator className="my-8" />

        {/* Main application */}
        <Tabs defaultValue="verify" className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto md:grid-cols-2 mb-8">
            <TabsTrigger value="verify">Age Verification</TabsTrigger>
            <TabsTrigger value="login">Exchange Login</TabsTrigger>
          </TabsList>
          
          <TabsContent value="verify" className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h2 className="text-xl font-semibold mb-4">Step 1: Scan Your ID</h2>
                <IdScanner onDateExtracted={handleDateExtracted} />
              </div>
              
              <div>
                <h2 className="text-xl font-semibold mb-4">Step 2: Generate ZK Proof</h2>
                <AgeProver 
                  birthDate={birthDate} 
                  minAge={minAge} 
                  onProofGenerated={handleProofGenerated}
                />
              </div>
            </div>
            
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-center text-muted-foreground">
                <Lock className="h-4 w-4 inline-block mr-1" />
                Your personal data never leaves your device. Only the zero-knowledge proof is shared.
              </p>
            </div>
          </TabsContent>
          
          <TabsContent value="login">
            <div className="max-w-md mx-auto">
              <CexLogin proof={proof} minAge={minAge} />
              
              <div className="mt-6 p-4 bg-muted rounded-lg">
                <p className="text-sm text-center text-muted-foreground">
                  <Shield className="h-4 w-4 inline-block mr-1" />
                  Login securely with your age verification proof
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
      
      <footer className="border-t mt-16">
        <div className="container py-6">
          <p className="text-sm text-center text-muted-foreground">
            Secure Exchange Access with Zero-Knowledge Age Verification
          </p>
        </div>
      </footer>
    </div>
  );
}