"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Shield, 
  AlertTriangle, 
  Calculator,
  BarChart3,
  Settings,
  Zap,
  DollarSign
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Position {
  id: string;
  symbol: string;
  side: 'long' | 'short';
  size: number;
  entryPrice: number;
  markPrice: number;
  leverage: number;
  margin: number;
  pnl: number;
  pnlPercentage: number;
  liquidationPrice: number;
  marginRatio: number;
  timestamp: Date;
}

interface FuturesOrder {
  id: string;
  symbol: string;
  side: 'buy' | 'sell';
  type: 'market' | 'limit' | 'stop' | 'take_profit';
  size: number;
  price?: number;
  stopPrice?: number;
  status: 'pending' | 'filled' | 'cancelled';
  timestamp: Date;
}

const mockPositions: Position[] = [
  {
    id: '1',
    symbol: 'BTCUSDT',
    side: 'long',
    size: 0.5,
    entryPrice: 42000,
    markPrice: 43250,
    leverage: 10,
    margin: 2100,
    pnl: 625,
    pnlPercentage: 29.76,
    liquidationPrice: 38100,
    marginRatio: 15.2,
    timestamp: new Date()
  },
  {
    id: '2',
    symbol: 'ETHUSDT',
    side: 'short',
    size: 2,
    entryPrice: 2300,
    markPrice: 2250,
    leverage: 5,
    margin: 920,
    pnl: 100,
    pnlPercentage: 10.87,
    liquidationPrice: 2530,
    marginRatio: 22.8,
    timestamp: new Date()
  }
];

const mockOrders: FuturesOrder[] = [
  {
    id: '1',
    symbol: 'BTCUSDT',
    side: 'buy',
    type: 'limit',
    size: 0.1,
    price: 42500,
    status: 'pending',
    timestamp: new Date()
  }
];

const mockPriceData = Array.from({ length: 50 }, (_, i) => ({
  time: i,
  price: 43000 + Math.sin(i * 0.1) * 500 + Math.random() * 200
}));

export default function FuturesPage() {
  const [selectedSymbol, setSelectedSymbol] = useState('BTCUSDT');
  const [orderSide, setOrderSide] = useState<'buy' | 'sell'>('buy');
  const [orderType, setOrderType] = useState<'market' | 'limit' | 'stop'>('limit');
  const [orderSize, setOrderSize] = useState('');
  const [orderPrice, setOrderPrice] = useState('');
  const [leverage, setLeverage] = useState([10]);
  const [reduceOnly, setReduceOnly] = useState(false);
  const [postOnly, setPostOnly] = useState(false);
  const [positions, setPositions] = useState<Position[]>(mockPositions);
  const [orders, setOrders] = useState<FuturesOrder[]>(mockOrders);
  const [accountBalance, setAccountBalance] = useState(10000);
  const [totalPnl, setTotalPnl] = useState(725);

  const currentPrice = 43250;
  const priceChange24h = 2.5;

  const calculateMargin = () => {
    if (!orderSize || !orderPrice) return 0;
    return (parseFloat(orderSize) * parseFloat(orderPrice)) / leverage[0];
  };

  const calculateLiquidationPrice = (side: 'buy' | 'sell') => {
    if (!orderSize || !orderPrice) return 0;
    const margin = calculateMargin();
    const maintenanceMargin = margin * 0.05; // 5% maintenance margin
    
    if (side === 'buy') {
      return parseFloat(orderPrice) - ((margin - maintenanceMargin) / parseFloat(orderSize));
    } else {
      return parseFloat(orderPrice) + ((margin - maintenanceMargin) / parseFloat(orderSize));
    }
  };

  const placeOrder = () => {
    const newOrder: FuturesOrder = {
      id: Date.now().toString(),
      symbol: selectedSymbol,
      side: orderSide,
      type: orderType,
      size: parseFloat(orderSize),
      price: orderType !== 'market' ? parseFloat(orderPrice) : undefined,
      status: 'pending',
      timestamp: new Date()
    };

    setOrders(prev => [newOrder, ...prev]);
    
    // Reset form
    setOrderSize('');
    setOrderPrice('');
  };

  const closePosition = (positionId: string) => {
    setPositions(prev => prev.filter(p => p.id !== positionId));
  };

  const cancelOrder = (orderId: string) => {
    setOrders(prev => prev.filter(o => o.id !== orderId));
  };

  return (
    <div className="container py-8 max-w-7xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <Zap className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Futures Trading</h1>
          <p className="text-muted-foreground">Trade perpetual futures with up to 100x leverage</p>
        </div>
      </div>

      {/* Account Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Account Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${accountBalance.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Available margin</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total PnL</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={cn(
              "text-2xl font-bold",
              totalPnl >= 0 ? "text-green-600" : "text-red-600"
            )}>
              {totalPnl >= 0 ? '+' : ''}${totalPnl.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Unrealized P&L</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Positions</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{positions.length}</div>
            <p className="text-xs text-muted-foreground">Active positions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Margin Ratio</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">18.5%</div>
            <p className="text-xs text-muted-foreground">Average across positions</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Trading Chart */}
        <div className="lg:col-span-3 space-y-6">
          {/* Price Header */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <h2 className="text-2xl font-bold">{selectedSymbol}</h2>
                  <div className="text-2xl font-bold">${currentPrice.toLocaleString()}</div>
                  <div className={cn(
                    "flex items-center gap-1",
                    priceChange24h >= 0 ? "text-green-600" : "text-red-600"
                  )}>
                    {priceChange24h >= 0 ? (
                      <TrendingUp className="h-4 w-4" />
                    ) : (
                      <TrendingDown className="h-4 w-4" />
                    )}
                    <span>{priceChange24h >= 0 ? '+' : ''}{priceChange24h}%</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Select value={selectedSymbol} onValueChange={setSelectedSymbol}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BTCUSDT">BTC/USDT</SelectItem>
                      <SelectItem value="ETHUSDT">ETH/USDT</SelectItem>
                      <SelectItem value="BNBUSDT">BNB/USDT</SelectItem>
                      <SelectItem value="SOLUSDT">SOL/USDT</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Price Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Price Chart
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={mockPriceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis domain={['dataMin - 100', 'dataMax + 100']} />
                  <Tooltip formatter={(value) => [`$${value}`, 'Price']} />
                  <Line 
                    type="monotone" 
                    dataKey="price" 
                    stroke="#8884d8" 
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Positions and Orders */}
          <Tabs defaultValue="positions" className="space-y-4">
            <TabsList>
              <TabsTrigger value="positions">Positions</TabsTrigger>
              <TabsTrigger value="orders">Open Orders</TabsTrigger>
              <TabsTrigger value="history">Trade History</TabsTrigger>
            </TabsList>

            <TabsContent value="positions">
              <Card>
                <CardHeader>
                  <CardTitle>Open Positions</CardTitle>
                  <CardDescription>Your current futures positions</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Symbol</TableHead>
                        <TableHead>Side</TableHead>
                        <TableHead>Size</TableHead>
                        <TableHead>Entry Price</TableHead>
                        <TableHead>Mark Price</TableHead>
                        <TableHead>PnL</TableHead>
                        <TableHead>Margin Ratio</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {positions.map((position) => (
                        <TableRow key={position.id}>
                          <TableCell className="font-medium">{position.symbol}</TableCell>
                          <TableCell>
                            <Badge variant={position.side === 'long' ? 'default' : 'secondary'}>
                              {position.side.toUpperCase()}
                            </Badge>
                          </TableCell>
                          <TableCell>{position.size}</TableCell>
                          <TableCell>${position.entryPrice.toLocaleString()}</TableCell>
                          <TableCell>${position.markPrice.toLocaleString()}</TableCell>
                          <TableCell>
                            <div className={cn(
                              "flex flex-col",
                              position.pnl >= 0 ? "text-green-600" : "text-red-600"
                            )}>
                              <span>{position.pnl >= 0 ? '+' : ''}${position.pnl}</span>
                              <span className="text-xs">({position.pnlPercentage.toFixed(2)}%)</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Progress value={position.marginRatio} className="w-16 h-2" />
                              <span className="text-xs">{position.marginRatio}%</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => closePosition(position.id)}
                            >
                              Close
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="orders">
              <Card>
                <CardHeader>
                  <CardTitle>Open Orders</CardTitle>
                  <CardDescription>Your pending futures orders</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Symbol</TableHead>
                        <TableHead>Side</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Size</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell className="font-medium">{order.symbol}</TableCell>
                          <TableCell>
                            <Badge variant={order.side === 'buy' ? 'default' : 'secondary'}>
                              {order.side.toUpperCase()}
                            </Badge>
                          </TableCell>
                          <TableCell>{order.type.toUpperCase()}</TableCell>
                          <TableCell>{order.size}</TableCell>
                          <TableCell>{order.price ? `$${order.price}` : 'Market'}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{order.status}</Badge>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => cancelOrder(order.id)}
                            >
                              Cancel
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="history">
              <Card>
                <CardHeader>
                  <CardTitle>Trade History</CardTitle>
                  <CardDescription>Your completed futures trades</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-center py-8">No trade history available</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Trading Panel */}
        <div className="space-y-6">
          {/* Order Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Place Order
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Order Side */}
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant={orderSide === 'buy' ? 'default' : 'outline'}
                  onClick={() => setOrderSide('buy')}
                  className={orderSide === 'buy' ? 'bg-green-600 hover:bg-green-700' : ''}
                >
                  Long
                </Button>
                <Button
                  variant={orderSide === 'sell' ? 'default' : 'outline'}
                  onClick={() => setOrderSide('sell')}
                  className={orderSide === 'sell' ? 'bg-red-600 hover:bg-red-700' : ''}
                >
                  Short
                </Button>
              </div>

              {/* Order Type */}
              <div className="space-y-2">
                <Label>Order Type</Label>
                <Select value={orderType} onValueChange={(value: any) => setOrderType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="market">Market</SelectItem>
                    <SelectItem value="limit">Limit</SelectItem>
                    <SelectItem value="stop">Stop</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Leverage */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Leverage</Label>
                  <span className="text-sm font-medium">{leverage[0]}x</span>
                </div>
                <Slider
                  value={leverage}
                  onValueChange={setLeverage}
                  max={100}
                  min={1}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>1x</span>
                  <span>25x</span>
                  <span>50x</span>
                  <span>100x</span>
                </div>
              </div>

              {/* Size */}
              <div className="space-y-2">
                <Label>Size</Label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={orderSize}
                  onChange={(e) => setOrderSize(e.target.value)}
                />
              </div>

              {/* Price (for limit orders) */}
              {orderType !== 'market' && (
                <div className="space-y-2">
                  <Label>Price</Label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={orderPrice}
                    onChange={(e) => setOrderPrice(e.target.value)}
                  />
                </div>
              )}

              {/* Advanced Options */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="reduce-only">Reduce Only</Label>
                  <Switch
                    id="reduce-only"
                    checked={reduceOnly}
                    onCheckedChange={setReduceOnly}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="post-only">Post Only</Label>
                  <Switch
                    id="post-only"
                    checked={postOnly}
                    onCheckedChange={setPostOnly}
                  />
                </div>
              </div>

              {/* Order Summary */}
              {orderSize && orderPrice && (
                <div className="space-y-2 p-3 bg-muted rounded-lg">
                  <div className="flex justify-between text-sm">
                    <span>Margin Required:</span>
                    <span>${calculateMargin().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Liquidation Price:</span>
                    <span>${calculateLiquidationPrice(orderSide).toFixed(2)}</span>
                  </div>
                </div>
              )}

              {/* Place Order Button */}
              <Button
                onClick={placeOrder}
                disabled={!orderSize || (orderType !== 'market' && !orderPrice)}
                className="w-full"
              >
                Place {orderSide === 'buy' ? 'Long' : 'Short'} Order
              </Button>
            </CardContent>
          </Card>

          {/* Risk Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Risk Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Account Balance:</span>
                  <span>${accountBalance.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Used Margin:</span>
                  <span>${(accountBalance * 0.15).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Available Margin:</span>
                  <span>${(accountBalance * 0.85).toFixed(2)}</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Margin Usage</Label>
                <Progress value={15} className="w-full" />
                <p className="text-xs text-muted-foreground">15% of total balance</p>
              </div>

              <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5" />
                  <div className="text-xs">
                    <p className="font-medium text-yellow-800 dark:text-yellow-200">Risk Warning</p>
                    <p className="text-yellow-700 dark:text-yellow-300">
                      Futures trading involves high risk. Only trade with funds you can afford to lose.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                Close All Positions
              </Button>
              <Button variant="outline" className="w-full justify-start">
                Cancel All Orders
              </Button>
              <Button variant="outline" className="w-full justify-start">
                Set Stop Loss
              </Button>
              <Button variant="outline" className="w-full justify-start">
                Set Take Profit
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}