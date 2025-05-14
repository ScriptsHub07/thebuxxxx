// User Types
export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  isAdmin: boolean;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  isAdmin: boolean;
}

// Product Types
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  features: string[];
  imageUrl: string;
  stock: number;
  createdAt: string;
}

// Cart Types
export interface CartItem {
  productId: string;
  quantity: number;
}

// Order Types
export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  total: number;
  paymentStatus: 'pending' | 'paid' | 'failed';
  deliveryStatus: 'pending' | 'delivered';
  createdAt: string;
  email: string;
  paymentId?: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}

// EFI Bank Settings
export interface EfiBankSettings {
  merchantId: string;
  apiKey: string;
  callbackUrl: string;
  enabled: boolean;
}