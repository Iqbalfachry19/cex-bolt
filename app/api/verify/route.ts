import { NextRequest, NextResponse } from 'next/server';
import { verifyAgeProof } from '@/lib/zkp/verifier';
import { ProofData } from '@/lib/zkp/prover';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate the request body
    if (!body.proof || !body.publicSignals) {
      return NextResponse.json(
        { error: 'Invalid request body. Proof data is required.' },
        { status: 400 }
      );
    }
    
    const proofData: ProofData = {
      proof: body.proof,
      publicSignals: body.publicSignals
    };
    
    // Verify the zero-knowledge proof
    const isValid = await verifyAgeProof(proofData);
    
    return NextResponse.json({ 
      verified: isValid,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error verifying proof:', error);
    
    return NextResponse.json(
      { 
        error: 'Error verifying proof',
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}