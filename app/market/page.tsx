"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { LineChart, TrendingUp, TrendingDown } from 'lucide-react';
import { useState } from 'react';

// Mock market data
const marketData = [
  { pair: 'BTC/USDT', price: '43250.50', change: '+2.5', volume: '1.2B' },
  { pair: 'ETH/USDT', price: '2250.75', change: '-1.2', volume: '850M' },
  { pair: 'BNB/USDT', price: '320.25', change: '+0.8', volume: '450M' },
  { pair: 'SOL/USDT', price: '98.50', change: '+5.2', volume: '320M' },
  { pair: 'ADA/USDT', price: '0.55', change: '-0.5', volume: '150M' },
];

export default function MarketPage() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredMarket = marketData.filter(item =>
    item.pair.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container py-8 max-w-7xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <LineChart className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Market Overview</h1>
          <p className="text-muted-foreground">Real-time cryptocurrency market data</p>
        </div>
      </div>

      {/* Market Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>24h Volume</CardTitle>
            <CardDescription>Total trading volume</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">$2.97B</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Active Pairs</CardTitle>
            <CardDescription>Trading pairs available</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">50+</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Market Cap</CardTitle>
            <CardDescription>Total market capitalization</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">$1.2T</p>
          </CardContent>
        </Card>
      </div>

      {/* Market Table */}
      <Card>
        <CardHeader>
          <CardTitle>Market Pairs</CardTitle>
          <CardDescription>Live price updates and trading information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pair</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>24h Change</TableHead>
                  <TableHead className="text-right">Volume</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMarket.map((item) => (
                  <TableRow key={item.pair}>
                    <TableCell className="font-medium">{item.pair}</TableCell>
                    <TableCell>${item.price}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {parseFloat(item.change) > 0 ? (
                          <TrendingUp className="h-4 w-4 text-green-500" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-red-500" />
                        )}
                        <span className={parseFloat(item.change) > 0 ? 'text-green-500' : 'text-red-500'}>
                          {item.change}%
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">${item.volume}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}