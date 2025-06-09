export interface StakingPool {
  id: string;
  asset: string;
  apy: number;
  type: 'fixed' | 'flexible';
  minAmount: number;
  maxCapacity: number;
  totalStaked: number;
  lockPeriod?: number;
  isActive: boolean;
}

export interface StakingPosition {
  id: string;
  poolId: string;
  asset: string;
  amount: number;
  apy: number;
  type: 'fixed' | 'flexible';
  status: 'active' | 'pending' | 'completed' | 'unstaking';
  startDate: Date;
  endDate?: Date;
  pendingRewards: number;
  totalRewards: number;
}

export interface StakingReward {
  id: string;
  positionId: string;
  asset: string;
  amount: number;
  value: number;
  timestamp: Date;
  type: 'daily' | 'compound' | 'final';
}

class StakingService {
  private pools: StakingPool[] = [
    {
      id: '1',
      asset: 'ETH',
      apy: 5.2,
      type: 'flexible',
      minAmount: 0.1,
      maxCapacity: 10000,
      totalStaked: 7500,
      isActive: true
    },
    {
      id: '2',
      asset: 'BTC',
      apy: 4.8,
      type: 'fixed',
      minAmount: 0.01,
      maxCapacity: 500,
      totalStaked: 350,
      lockPeriod: 90,
      isActive: true
    },
    {
      id: '3',
      asset: 'USDC',
      apy: 8.5,
      type: 'flexible',
      minAmount: 100,
      maxCapacity: 1000000,
      totalStaked: 750000,
      isActive: true
    },
    {
      id: '4',
      asset: 'SOL',
      apy: 6.7,
      type: 'fixed',
      minAmount: 1,
      maxCapacity: 50000,
      totalStaked: 32000,
      lockPeriod: 180,
      isActive: true
    }
  ];

  private positions: StakingPosition[] = [
    {
      id: '1',
      poolId: '1',
      asset: 'ETH',
      amount: 2.5,
      apy: 5.2,
      type: 'flexible',
      status: 'active',
      startDate: new Date('2024-01-15'),
      pendingRewards: 0.0234,
      totalRewards: 0.156
    },
    {
      id: '2',
      poolId: '3',
      asset: 'USDC',
      amount: 5000,
      apy: 8.5,
      type: 'flexible',
      status: 'active',
      startDate: new Date('2024-02-01'),
      pendingRewards: 12.45,
      totalRewards: 89.32
    }
  ];

  private rewards: StakingReward[] = [
    {
      id: '1',
      positionId: '1',
      asset: 'ETH',
      amount: 0.0045,
      value: 11.25,
      timestamp: new Date('2024-12-01'),
      type: 'daily'
    },
    {
      id: '2',
      positionId: '2',
      asset: 'USDC',
      amount: 2.34,
      value: 2.34,
      timestamp: new Date('2024-12-01'),
      type: 'daily'
    },
    {
      id: '3',
      positionId: '1',
      asset: 'ETH',
      amount: 0.0043,
      value: 10.75,
      timestamp: new Date('2024-11-30'),
      type: 'daily'
    }
  ];

  private subscribers: {
    pools: ((pools: StakingPool[]) => void)[];
    positions: ((positions: StakingPosition[]) => void)[];
    rewards: ((rewards: StakingReward[]) => void)[];
  } = {
    pools: [],
    positions: [],
    rewards: []
  };

  getStakingPools(): StakingPool[] {
    return [...this.pools];
  }

  getUserPositions(): StakingPosition[] {
    return [...this.positions];
  }

  getUserRewards(): StakingReward[] {
    return [...this.rewards];
  }

  getRewardsHistory(): { date: string; rewards: number }[] {
    // Generate mock rewards history for the last 30 days
    const history = [];
    const now = new Date();
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      
      const dailyRewards = Math.random() * 20 + 5; // Random rewards between 5-25
      history.push({
        date: date.toISOString().split('T')[0],
        rewards: dailyRewards
      });
    }
    
    return history;
  }

  async stake(poolId: string, amount: number, duration?: number): Promise<void> {
    const pool = this.pools.find(p => p.id === poolId);
    if (!pool) {
      throw new Error('Pool not found');
    }

    if (amount < pool.minAmount) {
      throw new Error(`Minimum stake amount is ${pool.minAmount} ${pool.asset}`);
    }

    if (pool.totalStaked + amount > pool.maxCapacity) {
      throw new Error('Pool capacity exceeded');
    }

    // Create new position
    const newPosition: StakingPosition = {
      id: Date.now().toString(),
      poolId: pool.id,
      asset: pool.asset,
      amount,
      apy: pool.apy,
      type: pool.type,
      status: 'active',
      startDate: new Date(),
      endDate: duration ? new Date(Date.now() + duration * 24 * 60 * 60 * 1000) : undefined,
      pendingRewards: 0,
      totalRewards: 0
    };

    this.positions.push(newPosition);
    
    // Update pool total staked
    pool.totalStaked += amount;

    // Notify subscribers
    this.notifySubscribers();
  }

  async unstake(positionId: string, amount: number): Promise<void> {
    const position = this.positions.find(p => p.id === positionId);
    if (!position) {
      throw new Error('Position not found');
    }

    if (amount > position.amount) {
      throw new Error('Insufficient staked amount');
    }

    if (position.type === 'fixed' && position.endDate && position.endDate > new Date()) {
      // Apply early unstaking penalty (mock)
      console.warn('Early unstaking penalty applied');
    }

    // Update position
    position.amount -= amount;
    position.status = position.amount === 0 ? 'completed' : 'active';

    // Update pool total staked
    const pool = this.pools.find(p => p.id === position.poolId);
    if (pool) {
      pool.totalStaked -= amount;
    }

    // Remove position if fully unstaked
    if (position.amount === 0) {
      const index = this.positions.findIndex(p => p.id === positionId);
      if (index > -1) {
        this.positions.splice(index, 1);
      }
    }

    // Notify subscribers
    this.notifySubscribers();
  }

  async claimRewards(positionId: string): Promise<void> {
    const position = this.positions.find(p => p.id === positionId);
    if (!position) {
      throw new Error('Position not found');
    }

    if (position.pendingRewards === 0) {
      throw new Error('No rewards to claim');
    }

    // Create reward record
    const reward: StakingReward = {
      id: Date.now().toString(),
      positionId: position.id,
      asset: position.asset,
      amount: position.pendingRewards,
      value: position.pendingRewards * 2500, // Mock price
      timestamp: new Date(),
      type: 'daily'
    };

    this.rewards.unshift(reward);
    
    // Update position
    position.totalRewards += position.pendingRewards;
    position.pendingRewards = 0;

    // Notify subscribers
    this.notifySubscribers();
  }

  subscribeToPools(callback: (pools: StakingPool[]) => void): () => void {
    this.subscribers.pools.push(callback);
    return () => {
      const index = this.subscribers.pools.indexOf(callback);
      if (index > -1) {
        this.subscribers.pools.splice(index, 1);
      }
    };
  }

  subscribeToPositions(callback: (positions: StakingPosition[]) => void): () => void {
    this.subscribers.positions.push(callback);
    return () => {
      const index = this.subscribers.positions.indexOf(callback);
      if (index > -1) {
        this.subscribers.positions.splice(index, 1);
      }
    };
  }

  subscribeToRewards(callback: (rewards: StakingReward[]) => void): () => void {
    this.subscribers.rewards.push(callback);
    return () => {
      const index = this.subscribers.rewards.indexOf(callback);
      if (index > -1) {
        this.subscribers.rewards.splice(index, 1);
      }
    };
  }

  private notifySubscribers(): void {
    this.subscribers.pools.forEach(callback => callback([...this.pools]));
    this.subscribers.positions.forEach(callback => callback([...this.positions]));
    this.subscribers.rewards.forEach(callback => callback([...this.rewards]));
  }
}

export const stakingService = new StakingService();