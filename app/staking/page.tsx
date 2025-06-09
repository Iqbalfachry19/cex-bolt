"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { 
  Coins, 
  TrendingUp, 
  Clock, 
  Shield, 
  Calculator,
  Plus,
  Minus,
  Calendar,
  Percent,
  DollarSign,
  Lock,
  Unlock,
  AlertCircle,
  CheckCircle,
  Info
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { stakingService, StakingPool, StakingPosition, StakingReward } from '@/lib/staking/stakingService';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export default function StakingPage() {
  const [pools, setPools] = useState<StakingPool[]>([]);
  const [positions, setPositions] = useState<StakingPosition[]>([]);
  const [rewards, setRewards] = useState<StakingReward[]>([]);
  const [selectedPool, setSelectedPool] = useState<StakingPool | null>(null);
  const [stakeAmount, setStakeAmount] = useState('');
  const [unstakeAmount, setUnstakeAmount] = useState('');
  const [selectedDuration, setSelectedDuration] = useState<number>(30);
  const [isStakeDialogOpen, setIsStakeDialogOpen] = useState(false);
  const [isUnstakeDialogOpen, setIsUnstakeDialogOpen] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<StakingPosition | null>(null);
  const [totalStaked, setTotalStaked] = useState(0);
  const [totalRewards, setTotalRewards] = useState(0);
  const [rewardsData, setRewardsData] = useState<{ date: string; rewards: number }[]>([]);

  useEffect(() => {
    // Load initial data
    setPools(stakingService.getStakingPools());
    setPositions(stakingService.getUserPositions());
    setRewards(stakingService.getUserRewards());
    setRewardsData(stakingService.getRewardsHistory());

    // Calculate totals
    const positions = stakingService.getUserPositions();
    const totalStakedAmount = positions.reduce((sum, pos) => sum + pos.amount, 0);
    const totalRewardsAmount = stakingService.getUserRewards().reduce((sum, reward) => sum + reward.amount, 0);
    
    setTotalStaked(totalStakedAmount);
    setTotalRewards(totalRewardsAmount);

    // Subscribe to updates
    const unsubscribePools = stakingService.subscribeToPools(setPools);
    const unsubscribePositions = stakingService.subscribeToPositions(setPositions);
    const unsubscribeRewards = stakingService.subscribeToRewards(setRewards);

    return () => {
      unsubscribePools();
      unsubscribePositions();
      unsubscribeRewards();
    };
  }, []);

  const handleStake = async () => {
    if (!selectedPool || !stakeAmount) return;

    try {
      await stakingService.stake(selectedPool.id, parseFloat(stakeAmount), selectedDuration);
      setStakeAmount('');
      setIsStakeDialogOpen(false);
      setSelectedPool(null);
    } catch (error) {
      console.error('Staking failed:', error);
    }
  };

  const handleUnstake = async () => {
    if (!selectedPosition || !unstakeAmount) return;

    try {
      await stakingService.unstake(selectedPosition.id, parseFloat(unstakeAmount));
      setUnstakeAmount('');
      setIsUnstakeDialogOpen(false);
      setSelectedPosition(null);
    } catch (error) {
      console.error('Unstaking failed:', error);
    }
  };

  const handleClaimRewards = async (positionId: string) => {
    try {
      await stakingService.claimRewards(positionId);
    } catch (error) {
      console.error('Claiming rewards failed:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return `$${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatPercentage = (percentage: number) => {
    return `${percentage.toFixed(2)}%`;
  };

  const calculateEstimatedRewards = (amount: number, apy: number, duration: number) => {
    return (amount * apy / 100 * duration / 365);
  };

  const getPoolTypeColor = (type: 'fixed' | 'flexible') => {
    return type === 'fixed' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600';
      case 'pending': return 'text-yellow-600';
      case 'completed': return 'text-blue-600';
      case 'unstaking': return 'text-orange-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="container py-8 max-w-7xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <Coins className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Staking</h1>
          <p className="text-muted-foreground">Earn rewards by staking your cryptocurrencies</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Staked</CardTitle>
            <Lock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalStaked)}</div>
            <p className="text-xs text-muted-foreground">Across all positions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Rewards</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(totalRewards)}</div>
            <p className="text-xs text-muted-foreground">Lifetime earnings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Positions</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{positions.filter(p => p.status === 'active').length}</div>
            <p className="text-xs text-muted-foreground">Currently earning</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Pools</CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pools.length}</div>
            <p className="text-xs text-muted-foreground">Staking opportunities</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="pools" className="space-y-6">
        <TabsList>
          <TabsTrigger value="pools">Staking Pools</TabsTrigger>
          <TabsTrigger value="positions">My Positions</TabsTrigger>
          <TabsTrigger value="rewards">Rewards History</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="pools">
          <Card>
            <CardHeader>
              <CardTitle>Available Staking Pools</CardTitle>
              <CardDescription>Choose from fixed or flexible staking options</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {pools.map((pool) => (
                  <Card key={pool.id} className="border-2 hover:border-primary/50 transition-colors">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                            <Coins className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{pool.asset}</CardTitle>
                            <Badge className={getPoolTypeColor(pool.type)}>
                              {pool.type.charAt(0).toUpperCase() + pool.type.slice(1)}
                            </Badge>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-green-600">
                            {formatPercentage(pool.apy)}
                          </div>
                          <div className="text-xs text-muted-foreground">APY</div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="text-muted-foreground">Min Amount</div>
                          <div className="font-medium">{pool.minAmount} {pool.asset}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Duration</div>
                          <div className="font-medium">
                            {pool.type === 'flexible' ? 'Flexible' : `${pool.lockPeriod} days`}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Pool Capacity</span>
                          <span>{((pool.totalStaked / pool.maxCapacity) * 100).toFixed(1)}%</span>
                        </div>
                        <Progress value={(pool.totalStaked / pool.maxCapacity) * 100} className="h-2" />
                        <div className="text-xs text-muted-foreground">
                          {formatCurrency(pool.totalStaked)} / {formatCurrency(pool.maxCapacity)}
                        </div>
                      </div>

                      <Button 
                        className="w-full" 
                        onClick={() => {
                          setSelectedPool(pool);
                          setIsStakeDialogOpen(true);
                        }}
                        disabled={pool.totalStaked >= pool.maxCapacity}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Stake {pool.asset}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="positions">
          <Card>
            <CardHeader>
              <CardTitle>My Staking Positions</CardTitle>
              <CardDescription>Manage your active and completed staking positions</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Asset</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>APY</TableHead>
                    <TableHead>Rewards</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>End Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {positions.map((position) => (
                    <TableRow key={position.id}>
                      <TableCell className="font-medium">{position.asset}</TableCell>
                      <TableCell>
                        <Badge className={getPoolTypeColor(position.type)}>
                          {position.type}
                        </Badge>
                      </TableCell>
                      <TableCell>{position.amount.toFixed(6)} {position.asset}</TableCell>
                      <TableCell>{formatPercentage(position.apy)}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium text-green-600">
                            {position.pendingRewards.toFixed(6)} {position.asset}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {formatCurrency(position.pendingRewards * 43250)} {/* Mock price */}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getStatusColor(position.status)}>
                          {position.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {position.endDate ? position.endDate.toLocaleDateString() : 'Flexible'}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {position.pendingRewards > 0 && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleClaimRewards(position.id)}
                            >
                              Claim
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedPosition(position);
                              setIsUnstakeDialogOpen(true);
                            }}
                            disabled={position.status !== 'active'}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rewards">
          <Card>
            <CardHeader>
              <CardTitle>Rewards History</CardTitle>
              <CardDescription>Track your staking rewards over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Rewards Chart */}
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={rewardsData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip formatter={(value) => [formatCurrency(value as number), 'Rewards']} />
                      <Line type="monotone" dataKey="rewards" stroke="#8884d8" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Recent Rewards */}
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Asset</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Value</TableHead>
                      <TableHead>Position</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rewards.slice(0, 10).map((reward) => (
                      <TableRow key={reward.id}>
                        <TableCell>{reward.timestamp.toLocaleDateString()}</TableCell>
                        <TableCell className="font-medium">{reward.asset}</TableCell>
                        <TableCell>{reward.amount.toFixed(6)} {reward.asset}</TableCell>
                        <TableCell>{formatCurrency(reward.value)}</TableCell>
                        <TableCell className="text-muted-foreground">{reward.positionId.slice(0, 8)}...</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-green-600">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Claimed
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Portfolio Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Staking Portfolio Distribution</CardTitle>
                <CardDescription>Breakdown of your staked assets</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={positions.map(p => ({ name: p.asset, value: p.amount }))}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {positions.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Performance Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
                <CardDescription>Your staking performance overview</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-muted rounded-lg">
                    <div className="text-sm text-muted-foreground">Average APY</div>
                    <div className="text-2xl font-bold text-green-600">
                      {formatPercentage(positions.reduce((sum, p) => sum + p.apy, 0) / positions.length || 0)}
                    </div>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <div className="text-sm text-muted-foreground">Total Positions</div>
                    <div className="text-2xl font-bold">{positions.length}</div>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <div className="text-sm text-muted-foreground">Monthly Rewards</div>
                    <div className="text-2xl font-bold text-green-600">
                      {formatCurrency(totalRewards * 0.3)} {/* Mock monthly */}
                    </div>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <div className="text-sm text-muted-foreground">ROI</div>
                    <div className="text-2xl font-bold text-green-600">
                      {formatPercentage((totalRewards / totalStaked) * 100 || 0)}
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Info className="h-4 w-4 text-yellow-600 mt-0.5" />
                    <div className="text-xs">
                      <p className="font-medium text-yellow-800 dark:text-yellow-200">Staking Tips</p>
                      <ul className="text-yellow-700 dark:text-yellow-300 mt-1 space-y-1">
                        <li>• Diversify across multiple assets</li>
                        <li>• Consider lock periods vs. flexibility</li>
                        <li>• Compound rewards for maximum returns</li>
                        <li>• Monitor pool capacity and APY changes</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Stake Dialog */}
      <Dialog open={isStakeDialogOpen} onOpenChange={setIsStakeDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Stake {selectedPool?.asset}</DialogTitle>
            <DialogDescription>
              Enter the amount you want to stake and select duration
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="stake-amount">Amount</Label>
              <Input
                id="stake-amount"
                type="number"
                placeholder="0.00"
                value={stakeAmount}
                onChange={(e) => setStakeAmount(e.target.value)}
              />
              <div className="text-xs text-muted-foreground">
                Min: {selectedPool?.minAmount} {selectedPool?.asset}
              </div>
            </div>

            {selectedPool?.type === 'fixed' && (
              <div className="space-y-2">
                <Label>Lock Period</Label>
                <Select value={selectedDuration.toString()} onValueChange={(value) => setSelectedDuration(parseInt(value))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 days - {formatPercentage(selectedPool?.apy || 0)}</SelectItem>
                    <SelectItem value="90">90 days - {formatPercentage((selectedPool?.apy || 0) * 1.2)}</SelectItem>
                    <SelectItem value="180">180 days - {formatPercentage((selectedPool?.apy || 0) * 1.5)}</SelectItem>
                    <SelectItem value="365">365 days - {formatPercentage((selectedPool?.apy || 0) * 2)}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {stakeAmount && selectedPool && (
              <div className="p-3 bg-muted rounded-lg space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Estimated Daily Rewards:</span>
                  <span className="font-medium">
                    {(calculateEstimatedRewards(parseFloat(stakeAmount), selectedPool.apy, 1)).toFixed(6)} {selectedPool.asset}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Estimated Total Rewards:</span>
                  <span className="font-medium text-green-600">
                    {(calculateEstimatedRewards(parseFloat(stakeAmount), selectedPool.apy, selectedDuration)).toFixed(6)} {selectedPool.asset}
                  </span>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsStakeDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleStake} disabled={!stakeAmount || parseFloat(stakeAmount) < (selectedPool?.minAmount || 0)}>
              Stake
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Unstake Dialog */}
      <Dialog open={isUnstakeDialogOpen} onOpenChange={setIsUnstakeDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Unstake {selectedPosition?.asset}</DialogTitle>
            <DialogDescription>
              Enter the amount you want to unstake
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="unstake-amount">Amount</Label>
              <Input
                id="unstake-amount"
                type="number"
                placeholder="0.00"
                value={unstakeAmount}
                onChange={(e) => setUnstakeAmount(e.target.value)}
              />
              <div className="text-xs text-muted-foreground">
                Available: {selectedPosition?.amount} {selectedPosition?.asset}
              </div>
            </div>

            {selectedPosition?.type === 'fixed' && selectedPosition.endDate && selectedPosition.endDate > new Date() && (
              <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
                  <div className="text-xs">
                    <p className="font-medium text-yellow-800 dark:text-yellow-200">Early Unstaking</p>
                    <p className="text-yellow-700 dark:text-yellow-300">
                      Unstaking before the lock period ends may result in penalty fees.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUnstakeDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUnstake} disabled={!unstakeAmount || parseFloat(unstakeAmount) > (selectedPosition?.amount || 0)}>
              Unstake
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}