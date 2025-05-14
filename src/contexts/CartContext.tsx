import { createContext, useState, useEffect, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'react-toastify';
import { CartItem, Order, OrderItem } from '../types';
import { useAuth } from '../hooks/useAuth';
import { useProducts } from '../hooks/useProducts';

interface CartContextProps {
  cartItems: CartItem[];
  addToCart: (productId: string, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartItemsCount: () => number;
  checkout: (email: string) => Promise<string | null>;
}

export const CartContext = createContext<CartContextProps>({
  cartItems: [],
  addToCart: () => {},
  removeFromCart: () => {},
  updateQuantity: () => {},
  clearCart: () => {},
  getCartTotal: () => 0,
  getCartItemsCount: () => 0,
  checkout: async () => null,
});

interface CartProviderProps {
  children: ReactNode;
}

export function CartProvider({ children }: CartProviderProps) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const { user } = useAuth();
  const { products, updateProductStock } = useProducts();

  // Load cart from localStorage on initial render
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCartItems(JSON.parse(savedCart));
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  }, [cartItems]);

  // Add product to cart
  const addToCart = (productId: string, quantity: number = 1) => {
    const product = products.find(p => p.id === productId);
    
    if (!product) {
      toast.error('Produto não encontrado');
      return;
    }
    
    if (product.stock < quantity) {
      toast.error('Quantidade indisponível em estoque');
      return;
    }
    
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.productId === productId);
      
      if (existingItem) {
        // If total quantity would exceed stock, limit it
        const newQuantity = existingItem.quantity + quantity;
        const finalQuantity = newQuantity <= product.stock ? newQuantity : product.stock;
        
        if (finalQuantity === product.stock) {
          toast.info('Quantidade máxima em estoque atingida');
        }
        
        return prevItems.map(item => 
          item.productId === productId 
            ? { ...item, quantity: finalQuantity } 
            : item
        );
      } else {
        toast.success('Produto adicionado ao carrinho');
        return [...prevItems, { productId, quantity }];
      }
    });
  };

  // Remove product from cart
  const removeFromCart = (productId: string) => {
    setCartItems(prevItems => prevItems.filter(item => item.productId !== productId));
    toast.info('Produto removido do carrinho');
  };

  // Update quantity for a product in cart
  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity < 1) {
      removeFromCart(productId);
      return;
    }
    
    const product = products.find(p => p.id === productId);
    if (product && quantity > product.stock) {
      toast.error('Quantidade indisponível em estoque');
      quantity = product.stock;
    }
    
    setCartItems(prevItems =>
      prevItems.map(item =>
        item.productId === productId ? { ...item, quantity } : item
      )
    );
  };

  // Clear cart
  const clearCart = () => {
    setCartItems([]);
  };

  // Calculate cart total
  const getCartTotal = () => {
    return cartItems.reduce((total, item) => {
      const product = products.find(p => p.id === item.productId);
      return total + (product ? product.price * item.quantity : 0);
    }, 0);
  };

  // Get total number of items in cart
  const getCartItemsCount = () => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  };

  // Checkout process
  const checkout = async (email: string): Promise<string | null> => {
    if (!user) {
      toast.error('Você precisa estar logado para finalizar a compra');
      return null;
    }
    
    if (cartItems.length === 0) {
      toast.error('Seu carrinho está vazio');
      return null;
    }
    
    try {
      // Check if all products are in stock
      for (const item of cartItems) {
        const product = products.find(p => p.id === item.productId);
        if (!product || product.stock < item.quantity) {
          toast.error(`Produto "${product?.name || 'desconhecido'}" não tem estoque suficiente`);
          return null;
        }
      }
      
      // Create order items
      const orderItems: OrderItem[] = cartItems.map(item => {
        const product = products.find(p => p.id === item.productId)!;
        return {
          productId: item.productId,
          productName: product.name,
          quantity: item.quantity,
          price: product.price
        };
      });
      
      // Create new order
      const orderId = uuidv4();
      const newOrder: Order = {
        id: orderId,
        userId: user.id,
        items: orderItems,
        total: getCartTotal(),
        paymentStatus: 'pending', // Will be updated after payment
        deliveryStatus: 'pending',
        createdAt: new Date().toISOString(),
        email
      };
      
      // Save order
      const orders = JSON.parse(localStorage.getItem('orders') || '[]');
      orders.push(newOrder);
      localStorage.setItem('orders', JSON.stringify(orders));
      
      // Update product stock
      cartItems.forEach(item => {
        updateProductStock(item.productId, -item.quantity);
      });
      
      // Clear cart
      clearCart();
      
      return orderId;
    } catch (error) {
      console.error('Erro ao finalizar compra:', error);
      toast.error('Ocorreu um erro ao finalizar a compra');
      return null;
    }
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        getCartItemsCount,
        checkout
      }}
    >
      {children}
    </CartContext.Provider>
  );
}