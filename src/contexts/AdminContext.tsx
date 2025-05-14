import { createContext, useState, useEffect, ReactNode } from 'react';
import { EfiBankSettings, Order } from '../types';

interface AdminContextProps {
  orders: Order[];
  efiBankSettings: EfiBankSettings;
  updateEfiBankSettings: (settings: Partial<EfiBankSettings>) => void;
  updateOrderStatus: (orderId: string, paymentStatus?: 'pending' | 'paid' | 'failed', deliveryStatus?: 'pending' | 'delivered') => boolean;
  getOrderById: (orderId: string) => Order | null;
  getDashboardStats: () => {
    totalOrders: number;
    pendingOrders: number;
    completedOrders: number;
    totalRevenue: number;
    lowStockProducts: number;
  };
}

export const AdminContext = createContext<AdminContextProps>({
  orders: [],
  efiBankSettings: {
    merchantId: '',
    apiKey: '',
    callbackUrl: '',
    enabled: false
  },
  updateEfiBankSettings: () => {},
  updateOrderStatus: () => false,
  getOrderById: () => null,
  getDashboardStats: () => ({
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    totalRevenue: 0,
    lowStockProducts: 0
  })
});

interface AdminProviderProps {
  children: ReactNode;
}

export function AdminProvider({ children }: AdminProviderProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [efiBankSettings, setEfiBankSettings] = useState<EfiBankSettings>({
    merchantId: '',
    apiKey: '',
    callbackUrl: window.location.origin + '/api/efibank/callback',
    enabled: false
  });

  // Load orders and settings from localStorage
  useEffect(() => {
    try {
      const storedOrders = localStorage.getItem('orders');
      if (storedOrders) {
        setOrders(JSON.parse(storedOrders));
      }
      
      const storedSettings = localStorage.getItem('efiBankSettings');
      if (storedSettings) {
        setEfiBankSettings(JSON.parse(storedSettings));
      } else {
        // Initialize default settings
        localStorage.setItem('efiBankSettings', JSON.stringify(efiBankSettings));
      }
    } catch (error) {
      console.error('Erro ao carregar dados administrativos:', error);
    }
  }, []);

  // Save settings to localStorage when they change
  useEffect(() => {
    localStorage.setItem('efiBankSettings', JSON.stringify(efiBankSettings));
  }, [efiBankSettings]);

  // Update EFI Bank settings
  const updateEfiBankSettings = (settings: Partial<EfiBankSettings>) => {
    setEfiBankSettings(prev => ({
      ...prev,
      ...settings
    }));
  };

  // Update order status
  const updateOrderStatus = (
    orderId: string, 
    paymentStatus?: 'pending' | 'paid' | 'failed', 
    deliveryStatus?: 'pending' | 'delivered'
  ): boolean => {
    const orderExists = orders.some(o => o.id === orderId);
    
    if (!orderExists) {
      return false;
    }
    
    const updatedOrders = orders.map(order => {
      if (order.id === orderId) {
        return {
          ...order,
          ...(paymentStatus && { paymentStatus }),
          ...(deliveryStatus && { deliveryStatus })
        };
      }
      return order;
    });
    
    setOrders(updatedOrders);
    localStorage.setItem('orders', JSON.stringify(updatedOrders));
    return true;
  };

  // Get order by ID
  const getOrderById = (orderId: string): Order | null => {
    return orders.find(order => order.id === orderId) || null;
  };

  // Get dashboard statistics
  const getDashboardStats = () => {
    // Load products to check stock
    const products = JSON.parse(localStorage.getItem('products') || '[]');
    const lowStockProducts = products.filter((p: any) => p.stock <= 2).length;
    
    // Calculate order stats
    const totalOrders = orders.length;
    const pendingOrders = orders.filter(o => 
      o.paymentStatus === 'pending' || o.deliveryStatus === 'pending'
    ).length;
    const completedOrders = orders.filter(o => 
      o.paymentStatus === 'paid' && o.deliveryStatus === 'delivered'
    ).length;
    
    // Calculate revenue (only from paid orders)
    const totalRevenue = orders
      .filter(o => o.paymentStatus === 'paid')
      .reduce((total, order) => total + order.total, 0);
    
    return {
      totalOrders,
      pendingOrders,
      completedOrders,
      totalRevenue,
      lowStockProducts
    };
  };

  return (
    <AdminContext.Provider
      value={{
        orders,
        efiBankSettings,
        updateEfiBankSettings,
        updateOrderStatus,
        getOrderById,
        getDashboardStats
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}