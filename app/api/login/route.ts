import { NextRequest, NextResponse } from 'next/server';
import { verifyAgeProof } from '@/lib/zkp/verifier';
import { ProofData } from '@/lib/zkp/prover';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request body
    if (!body.email || !body.password || !body.proof) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Verify the age proof
    const proofData: ProofData = body.proof;
    const isValidAge = await verifyAgeProof(proofData);
    
    if (!isValidAge) {
      return NextResponse.json(
        { error: 'Age verification failed' },
        { status: 403 }
      );
    }
    
    // Here you would typically:
    // 1. Verify credentials against your database
    // 2. Generate a session token
    // 3. Set up any necessary cookies
    
    // For demo purposes, we'll just return a success response
    return NextResponse.json({
      success: true,
      message: 'Login successful',
      // Include any necessary session data
    });
    
  } catch (error) {
    console.error('Login error:', error);
    
    return NextResponse.json(
      { 
        error: 'Login failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}