import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

interface DepositRequest {
  asset: string;
  amount: number;
  network?: string;
}

interface DepositResponse {
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

// Mock deposit addresses for different assets
const DEPOSIT_ADDRESSES = {
  BTC: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
  ETH: '0x742d35Cc6634C0532925a3b8D4C0C8b3C2b5d2e1',
  USDT: '0x742d35Cc6634C0532925a3b8D4C0C8b3C2b5d2e1',
  BNB: 'bnb1grpf0955h0ykzq3ar5nmum7y6gdfl6lxfn46h2',
  SOL: '9WzDXwBbmkg8ZTbNMqUxvQRAyrZzDsGYdLVL9zYtAWWM',
  ADA: 'addr1qx2fxv2umyhttkxyxp8x0dlpdt3k6cwng5pxj3jhsydzer3jcu5d8ps7zex2k2xt3uqxgjqnnj83ws8lhrn648jjxtwq2ytjqp',
  DOT: '15oF4uVJwmo4TdGW7VfQxNLavjCXviqxT9S1MgbjMNHr6Sp5'
};

const NETWORK_CONFIG = {
  BTC: { network: 'Bitcoin', minAmount: 0.0001, confirmations: 3, estimatedTime: '30-60 minutes' },
  ETH: { network: 'Ethereum', minAmount: 0.01, confirmations: 12, estimatedTime: '5-15 minutes' },
  USDT: { network: 'Ethereum (ERC-20)', minAmount: 10, confirmations: 12, estimatedTime: '5-15 minutes' },
  BNB: { network: 'BNB Smart Chain', minAmount: 0.01, confirmations: 15, estimatedTime: '3-5 minutes' },
  SOL: { network: 'Solana', minAmount: 0.01, confirmations: 1, estimatedTime: '1-2 minutes' },
  ADA: { network: 'Cardano', minAmount: 1, confirmations: 15, estimatedTime: '10-20 minutes' },
  DOT: { network: 'Polkadot', minAmount: 0.1, confirmations: 1, estimatedTime: '6-12 minutes' }
};

export async function POST(request: NextRequest) {
  try {
    const body: DepositRequest = await request.json();
    
    if (!body.asset) {
      return NextResponse.json(
        { success: false, error: 'Asset is required' },
        { status: 400 }
      );
    }

    const asset = body.asset.toUpperCase();
    const config = NETWORK_CONFIG[asset as keyof typeof NETWORK_CONFIG];
    
    if (!config) {
      return NextResponse.json(
        { success: false, error: 'Unsupported asset' },
        { status: 400 }
      );
    }

    const depositAddress = DEPOSIT_ADDRESSES[asset as keyof typeof DEPOSIT_ADDRESSES];
    
    if (!depositAddress) {
      return NextResponse.json(
        { success: false, error: 'Deposit address not available' },
        { status: 500 }
      );
    }

    // Generate QR code URL (using a QR code service)
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${depositAddress}`;

    const response: DepositResponse = {
      success: true,
      depositAddress,
      qrCode: qrCodeUrl,
      network: config.network,
      minAmount: config.minAmount,
      confirmations: config.confirmations,
      estimatedTime: config.estimatedTime,
      memo: asset === 'BNB' ? '12345678' : undefined // Some networks require memo
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Deposit error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to generate deposit address',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const asset = searchParams.get('asset')?.toUpperCase();

    if (!asset) {
      return NextResponse.json(
        { success: false, error: 'Asset parameter is required' },
        { status: 400 }
      );
    }

    const config = NETWORK_CONFIG[asset as keyof typeof NETWORK_CONFIG];
    
    if (!config) {
      return NextResponse.json(
        { success: false, error: 'Unsupported asset' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      asset,
      ...config
    });
  } catch (error) {
    console.error('Get deposit info error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get deposit information' },
      { status: 500 }
    );
  }
}