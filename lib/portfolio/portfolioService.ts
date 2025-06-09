export interface PortfolioAsset {
  id: string;
  symbol: string;
  name: string;
  amount: number;
  averagePrice: number;
  currentPrice: number;
  totalValue: number;
  pnl: number;
  pnlPercentage: number;
  allocation: number;
  lastUpdated: Date;
}

export interface PortfolioSummary {
  totalValue: number;
  totalPnl: number;
  totalPnlPercentage: number;
  dayChange: number;
  dayChangePercentage: number;
  assets: PortfolioAsset[];
}

export interface TradeHistory {
  id: string;
  symbol: string;
  type: 'buy' | 'sell';
  amount: number;
  price: number;
  total: number;
  fee: number;
  timestamp: Date;
  status: 'completed' | 'pending' | 'cancelled';
}

export interface WatchlistItem {
  id: string;
  symbol: string;
  name: string;
  currentPrice: number;
  change24h: number;
  changePercentage24h: number;
  volume24h: number;
  marketCap: number;
  addedAt: Date;
}

class PortfolioService {
  private portfolio: PortfolioAsset[] = [];
  private tradeHistory: TradeHistory[] = [];
  private watchlist: WatchlistItem[] = [];
  private listeners: ((portfolio: PortfolioSummary) => void)[] = [];
  private watchlistListeners: ((watchlist: WatchlistItem[]) => void)[] = [];

  constructor() {
    this.loadFromStorage();
    this.initializeMockData();
  }

  // Portfolio Management
  getPortfolioSummary(): PortfolioSummary {
    const totalValue = this.portfolio.reduce((sum, asset) => sum + asset.totalValue, 0);
    const totalPnl = this.portfolio.reduce((sum, asset) => sum + asset.pnl, 0);
    const totalPnlPercentage = totalValue > 0 ? (totalPnl / (totalValue - totalPnl)) * 100 : 0;

    // Calculate allocations
    const assetsWithAllocation = this.portfolio.map(asset => ({
      ...asset,
      allocation: totalValue > 0 ? (asset.totalValue / totalValue) * 100 : 0
    }));

    return {
      totalValue,
      totalPnl,
      totalPnlPercentage,
      dayChange: totalPnl * 0.1, // Mock day change
      dayChangePercentage: totalPnlPercentage * 0.1,
      assets: assetsWithAllocation
    };
  }

  updateAssetPrice(symbol: string, newPrice: number): void {
    const asset = this.portfolio.find(a => a.symbol === symbol);
    if (asset) {
      asset.currentPrice = newPrice;
      asset.totalValue = asset.amount * newPrice;
      asset.pnl = asset.totalValue - (asset.amount * asset.averagePrice);
      asset.pnlPercentage = asset.averagePrice > 0 ? (asset.pnl / (asset.amount * asset.averagePrice)) * 100 : 0;
      asset.lastUpdated = new Date();
      
      this.saveToStorage();
      this.notifyListeners();
    }
  }

  addTrade(trade: Omit<TradeHistory, 'id' | 'timestamp' | 'status'>): void {
    const newTrade: TradeHistory = {
      ...trade,
      id: crypto.randomUUID(),
      timestamp: new Date(),
      status: 'completed'
    };

    this.tradeHistory.unshift(newTrade);
    this.updatePortfolioFromTrade(newTrade);
    this.saveToStorage();
    this.notifyListeners();
  }

  private updatePortfolioFromTrade(trade: TradeHistory): void {
    let asset = this.portfolio.find(a => a.symbol === trade.symbol);

    if (!asset) {
      asset = {
        id: crypto.randomUUID(),
        symbol: trade.symbol,
        name: trade.symbol.replace('USDT', ''),
        amount: 0,
        averagePrice: 0,
        currentPrice: trade.price,
        totalValue: 0,
        pnl: 0,
        pnlPercentage: 0,
        allocation: 0,
        lastUpdated: new Date()
      };
      this.portfolio.push(asset);
    }

    if (trade.type === 'buy') {
      const totalCost = (asset.amount * asset.averagePrice) + (trade.amount * trade.price);
      asset.amount += trade.amount;
      asset.averagePrice = asset.amount > 0 ? totalCost / asset.amount : trade.price;
    } else {
      asset.amount -= trade.amount;
      if (asset.amount <= 0) {
        this.portfolio = this.portfolio.filter(a => a.id !== asset!.id);
        return;
      }
    }

    asset.currentPrice = trade.price;
    asset.totalValue = asset.amount * asset.currentPrice;
    asset.pnl = asset.totalValue - (asset.amount * asset.averagePrice);
    asset.pnlPercentage = asset.averagePrice > 0 ? (asset.pnl / (asset.amount * asset.averagePrice)) * 100 : 0;
    asset.lastUpdated = new Date();
  }

  getTradeHistory(): TradeHistory[] {
    return this.tradeHistory;
  }

  // Watchlist Management
  addToWatchlist(item: Omit<WatchlistItem, 'id' | 'addedAt'>): void {
    const exists = this.watchlist.find(w => w.symbol === item.symbol);
    if (exists) return;

    const newItem: WatchlistItem = {
      ...item,
      id: crypto.randomUUID(),
      addedAt: new Date()
    };

    this.watchlist.push(newItem);
    this.saveToStorage();
    this.notifyWatchlistListeners();
  }

  removeFromWatchlist(symbol: string): void {
    this.watchlist = this.watchlist.filter(w => w.symbol !== symbol);
    this.saveToStorage();
    this.notifyWatchlistListeners();
  }

  getWatchlist(): WatchlistItem[] {
    return this.watchlist;
  }

  updateWatchlistPrices(marketData: { symbol: string; price: number; change24h: number; volume24h: number }[]): void {
    this.watchlist.forEach(item => {
      const market = marketData.find(m => m.symbol === item.symbol);
      if (market) {
        item.currentPrice = market.price;
        item.change24h = market.change24h;
        item.changePercentage24h = (market.change24h / (market.price - market.change24h)) * 100;
        item.volume24h = market.volume24h;
      }
    });

    this.saveToStorage();
    this.notifyWatchlistListeners();
  }

  // Performance Analytics
  getPerformanceData(period: '24h' | '7d' | '30d' | '1y'): { date: string; value: number }[] {
    // Mock performance data
    const days = period === '24h' ? 1 : period === '7d' ? 7 : period === '30d' ? 30 : 365;
    const data = [];
    const currentValue = this.getPortfolioSummary().totalValue;

    for (let i = days; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const variation = (Math.random() - 0.5) * 0.1; // ±5% variation
      const value = currentValue * (1 + variation * (i / days));
      
      data.push({
        date: date.toISOString().split('T')[0],
        value: Math.round(value * 100) / 100
      });
    }

    return data;
  }

  // Subscription methods
  subscribe(listener: (portfolio: PortfolioSummary) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  subscribeToWatchlist(listener: (watchlist: WatchlistItem[]) => void): () => void {
    this.watchlistListeners.push(listener);
    return () => {
      this.watchlistListeners = this.watchlistListeners.filter(l => l !== listener);
    };
  }

  private notifyListeners(): void {
    const summary = this.getPortfolioSummary();
    this.listeners.forEach(listener => listener(summary));
  }

  private notifyWatchlistListeners(): void {
    this.watchlistListeners.forEach(listener => listener(this.watchlist));
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem('cex_portfolio', JSON.stringify(this.portfolio));
      localStorage.setItem('cex_trade_history', JSON.stringify(this.tradeHistory));
      localStorage.setItem('cex_watchlist', JSON.stringify(this.watchlist));
    } catch (error) {
      console.error('Failed to save portfolio data:', error);
    }
  }

  private loadFromStorage(): void {
    try {
      const portfolio = localStorage.getItem('cex_portfolio');
      const tradeHistory = localStorage.getItem('cex_trade_history');
      const watchlist = localStorage.getItem('cex_watchlist');

      if (portfolio) {
        this.portfolio = JSON.parse(portfolio).map((asset: any) => ({
          ...asset,
          lastUpdated: new Date(asset.lastUpdated)
        }));
      }

      if (tradeHistory) {
        this.tradeHistory = JSON.parse(tradeHistory).map((trade: any) => ({
          ...trade,
          timestamp: new Date(trade.timestamp)
        }));
      }

      if (watchlist) {
        this.watchlist = JSON.parse(watchlist).map((item: any) => ({
          ...item,
          addedAt: new Date(item.addedAt)
        }));
      }
    } catch (error) {
      console.error('Failed to load portfolio data:', error);
    }
  }

  private initializeMockData(): void {
    if (this.portfolio.length === 0) {
      // Add some mock portfolio data
      this.portfolio = [
        {
          id: '1',
          symbol: 'BTC/USDT',
          name: 'Bitcoin',
          amount: 0.5,
          averagePrice: 42000,
          currentPrice: 43250.50,
          totalValue: 21625.25,
          pnl: 625.25,
          pnlPercentage: 2.97,
          allocation: 0,
          lastUpdated: new Date()
        },
        {
          id: '2',
          symbol: 'ETH/USDT',
          name: 'Ethereum',
          amount: 5,
          averagePrice: 2300,
          currentPrice: 2250.75,
          totalValue: 11253.75,
          pnl: -246.25,
          pnlPercentage: -2.14,
          allocation: 0,
          lastUpdated: new Date()
        }
      ];
    }

    if (this.watchlist.length === 0) {
      this.watchlist = [
        {
          id: '1',
          symbol: 'SOL/USDT',
          name: 'Solana',
          currentPrice: 98.50,
          change24h: 5.12,
          changePercentage24h: 5.48,
          volume24h: 320000000,
          marketCap: 42000000000,
          addedAt: new Date()
        },
        {
          id: '2',
          symbol: 'ADA/USDT',
          name: 'Cardano',
          currentPrice: 0.55,
          change24h: -0.003,
          changePercentage24h: -0.54,
          volume24h: 150000000,
          marketCap: 19000000000,
          addedAt: new Date()
        }
      ];
    }
  }
}

export const portfolioService = new PortfolioService();