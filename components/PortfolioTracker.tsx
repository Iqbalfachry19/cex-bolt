"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, Eye, EyeOff, Plus, Minus, BarChart3, PieChart as PieChartIcon } from 'lucide-react';
import { portfolioService, PortfolioSummary, TradeHistory, WatchlistItem } from '@/lib/portfolio/portfolioService';
import { cn } from '@/lib/utils';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export function PortfolioTracker() {
  const [portfolio, setPortfolio] = useState<PortfolioSummary | null>(null);
  const [tradeHistory, setTradeHistory] = useState<TradeHistory[]>([]);
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [performanceData, setPerformanceData] = useState<{ date: string; value: number }[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<'24h' | '7d' | '30d' | '1y'>('7d');
  const [showBalances, setShowBalances] = useState(true);

  useEffect(() => {
    // Initial data load
    setPortfolio(portfolioService.getPortfolioSummary());
    setTradeHistory(portfolioService.getTradeHistory());
    setWatchlist(portfolioService.getWatchlist());
    setPerformanceData(portfolioService.getPerformanceData(selectedPeriod));

    // Subscribe to updates
    const unsubscribePortfolio = portfolioService.subscribe(setPortfolio);
    const unsubscribeWatchlist = portfolioService.subscribeToWatchlist(setWatchlist);

    return () => {
      unsubscribePortfolio();
      unsubscribeWatchlist();
    };
  }, []);

  useEffect(() => {
    setPerformanceData(portfolioService.getPerformanceData(selectedPeriod));
  }, [selectedPeriod]);

  const formatCurrency = (amount: number) => {
    return showBalances ? `$${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '****';
  };

  const formatPercentage = (percentage: number) => {
    const sign = percentage >= 0 ? '+' : '';
    return `${sign}${percentage.toFixed(2)}%`;
  };

  const addToWatchlist = (symbol: string) => {
    portfolioService.addToWatchlist({
      symbol,
      name: symbol.replace('USDT', ''),
      currentPrice: Math.random() * 1000,
      change24h: (Math.random() - 0.5) * 20,
      changePercentage24h: (Math.random() - 0.5) * 10,
      volume24h: Math.random() * 1000000000,
      marketCap: Math.random() * 100000000000
    });
  };

  if (!portfolio) {
    return <div>Loading portfolio...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Portfolio Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Portfolio Value</CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowBalances(!showBalances)}
              className="h-4 w-4"
            >
              {showBalances ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            </Button>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(portfolio.totalValue)}</div>
            <div className={cn(
              "text-xs flex items-center",
              portfolio.dayChangePercentage >= 0 ? "text-green-600" : "text-red-600"
            )}>
              {portfolio.dayChangePercentage >= 0 ? (
                <TrendingUp className="h-3 w-3 mr-1" />
              ) : (
                <TrendingDown className="h-3 w-3 mr-1" />
              )}
              {formatPercentage(portfolio.dayChangePercentage)} today
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total P&L</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={cn(
              "text-2xl font-bold",
              portfolio.totalPnl >= 0 ? "text-green-600" : "text-red-600"
            )}>
              {showBalances ? (portfolio.totalPnl >= 0 ? '+' : '') + formatCurrency(portfolio.totalPnl).replace('$', '$') : '****'}
            </div>
            <div className={cn(
              "text-xs",
              portfolio.totalPnlPercentage >= 0 ? "text-green-600" : "text-red-600"
            )}>
              {formatPercentage(portfolio.totalPnlPercentage)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{portfolio.assets.length}</div>
            <p className="text-xs text-muted-foreground">Different cryptocurrencies</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Watchlist</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{watchlist.length}</div>
            <p className="text-xs text-muted-foreground">Tracked assets</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="assets">Assets</TabsTrigger>
          <TabsTrigger value="history">Trade History</TabsTrigger>
          <TabsTrigger value="watchlist">Watchlist</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Performance Chart */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Portfolio Performance
                  </CardTitle>
                  <CardDescription>Track your portfolio value over time</CardDescription>
                </div>
                <div className="flex gap-2">
                  {(['24h', '7d', '30d', '1y'] as const).map((period) => (
                    <Button
                      key={period}
                      variant={selectedPeriod === period ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSelectedPeriod(period)}
                    >
                      {period}
                    </Button>
                  ))}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(value) => [formatCurrency(value as number), 'Portfolio Value']} />
                  <Line type="monotone" dataKey="value" stroke="#8884d8" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Asset Allocation */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChartIcon className="h-5 w-5" />
                Asset Allocation
              </CardTitle>
              <CardDescription>Distribution of your portfolio</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={portfolio.assets}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ symbol, allocation }) => `${symbol} ${allocation.toFixed(1)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="allocation"
                    >
                      {portfolio.assets.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${(value as number).toFixed(2)}%`, 'Allocation']} />
                  </PieChart>
                </ResponsiveContainer>
                
                <div className="space-y-2">
                  {portfolio.assets.map((asset, index) => (
                    <div key={asset.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="text-sm font-medium">{asset.symbol}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium">{asset.allocation.toFixed(1)}%</div>
                        <div className="text-xs text-muted-foreground">{formatCurrency(asset.totalValue)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assets">
          <Card>
            <CardHeader>
              <CardTitle>Your Assets</CardTitle>
              <CardDescription>Current holdings and performance</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Asset</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Avg Price</TableHead>
                    <TableHead>Current Price</TableHead>
                    <TableHead>Total Value</TableHead>
                    <TableHead>P&L</TableHead>
                    <TableHead>Allocation</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {portfolio.assets.map((asset) => (
                    <TableRow key={asset.id}>
                      <TableCell className="font-medium">{asset.symbol}</TableCell>
                      <TableCell>{asset.amount.toFixed(6)}</TableCell>
                      <TableCell>${asset.averagePrice.toFixed(2)}</TableCell>
                      <TableCell>${asset.currentPrice.toFixed(2)}</TableCell>
                      <TableCell>{formatCurrency(asset.totalValue)}</TableCell>
                      <TableCell>
                        <div className={cn(
                          "flex items-center gap-1",
                          asset.pnl >= 0 ? "text-green-600" : "text-red-600"
                        )}>
                          {asset.pnl >= 0 ? (
                            <TrendingUp className="h-3 w-3" />
                          ) : (
                            <TrendingDown className="h-3 w-3" />
                          )}
                          <span>{showBalances ? formatCurrency(Math.abs(asset.pnl)) : '****'}</span>
                          <span className="text-xs">({formatPercentage(asset.pnlPercentage)})</span>
                        </div>
                      </TableCell>
                      <TableCell>{asset.allocation.toFixed(1)}%</TableCell>
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
              <CardDescription>Your recent trading activity</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Pair</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tradeHistory.slice(0, 10).map((trade) => (
                    <TableRow key={trade.id}>
                      <TableCell>{trade.timestamp.toLocaleDateString()}</TableCell>
                      <TableCell className="font-medium">{trade.symbol}</TableCell>
                      <TableCell>
                        <Badge variant={trade.type === 'buy' ? 'default' : 'secondary'}>
                          {trade.type.toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>{trade.amount.toFixed(6)}</TableCell>
                      <TableCell>${trade.price.toFixed(2)}</TableCell>
                      <TableCell>{formatCurrency(trade.total)}</TableCell>
                      <TableCell>
                        <Badge variant={trade.status === 'completed' ? 'default' : 'secondary'}>
                          {trade.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="watchlist">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Watchlist</CardTitle>
                  <CardDescription>Assets you're tracking</CardDescription>
                </div>
                <Button onClick={() => addToWatchlist('DOT/USDT')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Asset
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Asset</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>24h Change</TableHead>
                    <TableHead>Volume</TableHead>
                    <TableHead>Market Cap</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {watchlist.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.symbol}</TableCell>
                      <TableCell>${item.currentPrice.toFixed(2)}</TableCell>
                      <TableCell>
                        <div className={cn(
                          "flex items-center gap-1",
                          item.changePercentage24h >= 0 ? "text-green-600" : "text-red-600"
                        )}>
                          {item.changePercentage24h >= 0 ? (
                            <TrendingUp className="h-3 w-3" />
                          ) : (
                            <TrendingDown className="h-3 w-3" />
                          )}
                          {formatPercentage(item.changePercentage24h)}
                        </div>
                      </TableCell>
                      <TableCell>${(item.volume24h / 1000000).toFixed(1)}M</TableCell>
                      <TableCell>${(item.marketCap / 1000000000).toFixed(1)}B</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => portfolioService.removeFromWatchlist(item.symbol)}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}