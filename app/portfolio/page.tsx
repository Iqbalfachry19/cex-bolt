"use client";

import { PortfolioTracker } from '@/components/PortfolioTracker';
import { TrendingUp } from 'lucide-react';

export default function PortfolioPage() {
  return (
    <div className="container py-8 max-w-7xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <TrendingUp className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Portfolio</h1>
          <p className="text-muted-foreground">Track your investments and performance</p>
        </div>
      </div>

      <PortfolioTracker />
    </div>
  );
}