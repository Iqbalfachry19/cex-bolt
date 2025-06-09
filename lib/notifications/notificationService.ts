export interface NotificationData {
  id: string;
  title: string;
  message: string;
  type: 'price_alert' | 'trade_executed' | 'deposit' | 'withdrawal' | 'system' | 'security';
  timestamp: Date;
  read: boolean;
  data?: any;
}

export interface PriceAlert {
  id: string;
  symbol: string;
  condition: 'above' | 'below';
  targetPrice: number;
  currentPrice: number;
  active: boolean;
  createdAt: Date;
}

class NotificationService {
  private notifications: NotificationData[] = [];
  private priceAlerts: PriceAlert[] = [];
  private listeners: ((notifications: NotificationData[]) => void)[] = [];
  private alertListeners: ((alerts: PriceAlert[]) => void)[] = [];

  constructor() {
    this.requestPermission();
    this.loadFromStorage();
  }

  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }

    return false;
  }

  addNotification(notification: Omit<NotificationData, 'id' | 'timestamp' | 'read'>): void {
    const newNotification: NotificationData = {
      ...notification,
      id: crypto.randomUUID(),
      timestamp: new Date(),
      read: false,
    };

    this.notifications.unshift(newNotification);
    this.saveToStorage();
    this.notifyListeners();

    // Show browser notification
    this.showBrowserNotification(newNotification);
  }

  private async showBrowserNotification(notification: NotificationData): Promise<void> {
    const hasPermission = await this.requestPermission();
    if (!hasPermission) return;

    const browserNotification = new Notification(notification.title, {
      body: notification.message,
      icon: '/favicon.ico',
      tag: notification.id,
      requireInteraction: notification.type === 'security',
    });

    browserNotification.onclick = () => {
      window.focus();
      this.markAsRead(notification.id);
      browserNotification.close();
    };

    // Auto close after 5 seconds for non-critical notifications
    if (notification.type !== 'security') {
      setTimeout(() => browserNotification.close(), 5000);
    }
  }

  markAsRead(id: string): void {
    const notification = this.notifications.find(n => n.id === id);
    if (notification) {
      notification.read = true;
      this.saveToStorage();
      this.notifyListeners();
    }
  }

  markAllAsRead(): void {
    this.notifications.forEach(n => n.read = true);
    this.saveToStorage();
    this.notifyListeners();
  }

  deleteNotification(id: string): void {
    this.notifications = this.notifications.filter(n => n.id !== id);
    this.saveToStorage();
    this.notifyListeners();
  }

  clearAll(): void {
    this.notifications = [];
    this.saveToStorage();
    this.notifyListeners();
  }

  getNotifications(): NotificationData[] {
    return this.notifications;
  }

  getUnreadCount(): number {
    return this.notifications.filter(n => !n.read).length;
  }

  // Price Alert Methods
  addPriceAlert(alert: Omit<PriceAlert, 'id' | 'createdAt'>): void {
    const newAlert: PriceAlert = {
      ...alert,
      id: crypto.randomUUID(),
      createdAt: new Date(),
    };

    this.priceAlerts.push(newAlert);
    this.saveToStorage();
    this.notifyAlertListeners();
  }

  removePriceAlert(id: string): void {
    this.priceAlerts = this.priceAlerts.filter(a => a.id !== id);
    this.saveToStorage();
    this.notifyAlertListeners();
  }

  updatePriceAlert(id: string, updates: Partial<PriceAlert>): void {
    const alert = this.priceAlerts.find(a => a.id === id);
    if (alert) {
      Object.assign(alert, updates);
      this.saveToStorage();
      this.notifyAlertListeners();
    }
  }

  getPriceAlerts(): PriceAlert[] {
    return this.priceAlerts;
  }

  checkPriceAlerts(marketData: { symbol: string; price: number }[]): void {
    this.priceAlerts.forEach(alert => {
      if (!alert.active) return;

      const market = marketData.find(m => m.symbol === alert.symbol);
      if (!market) return;

      const triggered = 
        (alert.condition === 'above' && market.price >= alert.targetPrice) ||
        (alert.condition === 'below' && market.price <= alert.targetPrice);

      if (triggered) {
        this.addNotification({
          title: 'Price Alert Triggered',
          message: `${alert.symbol} is now ${alert.condition} $${alert.targetPrice}. Current price: $${market.price}`,
          type: 'price_alert',
          data: { alert, currentPrice: market.price }
        });

        // Deactivate the alert
        this.updatePriceAlert(alert.id, { active: false });
      }
    });
  }

  // Subscription methods
  subscribe(listener: (notifications: NotificationData[]) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  subscribeToAlerts(listener: (alerts: PriceAlert[]) => void): () => void {
    this.alertListeners.push(listener);
    return () => {
      this.alertListeners = this.alertListeners.filter(l => l !== listener);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.notifications));
  }

  private notifyAlertListeners(): void {
    this.alertListeners.forEach(listener => listener(this.priceAlerts));
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem('cex_notifications', JSON.stringify(this.notifications));
      localStorage.setItem('cex_price_alerts', JSON.stringify(this.priceAlerts));
    } catch (error) {
      console.error('Failed to save notifications to storage:', error);
    }
  }

  private loadFromStorage(): void {
    try {
      const notifications = localStorage.getItem('cex_notifications');
      const alerts = localStorage.getItem('cex_price_alerts');

      if (notifications) {
        this.notifications = JSON.parse(notifications).map((n: any) => ({
          ...n,
          timestamp: new Date(n.timestamp)
        }));
      }

      if (alerts) {
        this.priceAlerts = JSON.parse(alerts).map((a: any) => ({
          ...a,
          createdAt: new Date(a.createdAt)
        }));
      }
    } catch (error) {
      console.error('Failed to load notifications from storage:', error);
    }
  }
}

export const notificationService = new NotificationService();