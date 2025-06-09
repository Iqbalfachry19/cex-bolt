"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { HelpCircle, Shield, Lock, Key } from "lucide-react";

export function InfoModal() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <HelpCircle className="h-5 w-5" />
          <span className="sr-only">Information</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>How Zero-Knowledge Age Verification Works</DialogTitle>
          <DialogDescription>
            Understanding the privacy-preserving technology behind this application
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-primary shrink-0 mt-1" />
            <div>
              <h4 className="text-sm font-medium">Zero-Knowledge Proofs</h4>
              <p className="text-sm text-muted-foreground">
                Zero-knowledge proofs allow one party to prove to another that a statement is true,
                without revealing any information beyond the validity of the statement itself.
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <Lock className="h-5 w-5 text-primary shrink-0 mt-1" />
            <div>
              <h4 className="text-sm font-medium">Privacy Preservation</h4>
              <p className="text-sm text-muted-foreground">
                When you scan your ID, your birthdate is extracted and processed entirely on your device.
                Only a mathematical proof that you're over the required age is generated - never exposing your actual birthdate.
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-3">
            <Key className="h-5 w-5 text-primary shrink-0 mt-1" />
            <div>
              <h4 className="text-sm font-medium">Technical Implementation</h4>
              <p className="text-sm text-muted-foreground">
                This app uses snarkjs and circom to create cryptographic proofs that can be verified 
                without revealing your personal information. The OCR processing using Tesseract.js happens 
                entirely in your browser, and no personal data is transmitted over the network.
              </p>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline">Learn More</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}