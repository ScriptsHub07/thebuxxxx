import { createContext, useState, useEffect, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Product } from '../types';

interface ProductContextProps {
  products: Product[];
  loading: boolean;
  error: string | null;
  addProduct: (product: Omit<Product, 'id' | 'createdAt'>) => string;
  updateProduct: (id: string, product: Partial<Omit<Product, 'id' | 'createdAt'>>) => boolean;
  deleteProduct: (id: string) => boolean;
  updateProductStock: (id: string, quantityChange: number) => boolean;
}

export const ProductContext = createContext<ProductContextProps>({
  products: [],
  loading: false,
  error: null,
  addProduct: () => '',
  updateProduct: () => false,
  deleteProduct: () => false,
  updateProductStock: () => false,
});

interface ProductProviderProps {
  children: ReactNode;
}

// Sample product data
const sampleProducts: Product[] = [
  {
    id: uuidv4(),
    name: 'Conta Blox Fruit - Iniciante',
    description: 'Conta ideal para jogadores que estão começando no Blox Fruit. Inclui personagem nível 50 e frutas básicas.',
    price: 19.90,
    features: ['Nível 50', '2 Frutas Básicas', 'Beli: 10.000', 'Fragmentos: 500'],
    imageUrl: 'https://images.pexels.com/photos/3165335/pexels-photo-3165335.jpeg',
    stock: 5,
    createdAt: new Date().toISOString(),
  },
  {
    id: uuidv4(),
    name: 'Conta Blox Fruit - Intermediário',
    description: 'Perfeita para jogadores que já conhecem o jogo. Conta com personagem nível 250 e diversas frutas de nível médio.',
    price: 49.90,
    features: ['Nível 250', '5 Frutas Médias', 'Beli: 100.000', 'Fragmentos: 5.000', 'Raid Boss Desbloqueado'],
    imageUrl: 'https://images.pexels.com/photos/2240571/pexels-photo-2240571.jpeg',
    stock: 3,
    createdAt: new Date().toISOString(),
  },
  {
    id: uuidv4(),
    name: 'Conta Blox Fruit - Avançado',
    description: 'Conta premium para jogadores experientes. Personagem nível 800+ com frutas raras e muitos itens especiais.',
    price: 99.90,
    features: ['Nível 800+', '3 Frutas Lendárias', 'Beli: 500.000', 'Fragmentos: 25.000', 'Todas Ilhas Desbloqueadas', 'Equipamentos Raros'],
    imageUrl: 'https://images.pexels.com/photos/5082567/pexels-photo-5082567.jpeg',
    stock: 2,
    createdAt: new Date().toISOString(),
  },
  {
    id: uuidv4(),
    name: 'Conta Blox Fruit - Premium',
    description: 'Nossa melhor conta, com tudo desbloqueado e personagem de alto nível. Ideal para quem quer dominar o jogo imediatamente.',
    price: 199.90,
    features: ['Nível 1500+', 'Todas as Frutas', 'Beli: 2.000.000', 'Fragmentos: 100.000', 'Todos Itens Raros', 'Todos Passes Desbloqueados'],
    imageUrl: 'https://images.pexels.com/photos/7360366/pexels-photo-7360366.jpeg',
    stock: 1,
    createdAt: new Date().toISOString(),
  }
];

export function ProductProvider({ children }: ProductProviderProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize products from localStorage or use sample data
  useEffect(() => {
    try {
      const storedProducts = localStorage.getItem('products');
      
      if (storedProducts) {
        setProducts(JSON.parse(storedProducts));
      } else {
        // Initialize with sample data if no products exist
        setProducts(sampleProducts);
        localStorage.setItem('products', JSON.stringify(sampleProducts));
      }
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
      setError('Falha ao carregar produtos. Recarregue a página.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Save products to localStorage whenever they change
  useEffect(() => {
    if (!loading && products.length > 0) {
      localStorage.setItem('products', JSON.stringify(products));
    }
  }, [products, loading]);

  // Add a new product
  const addProduct = (product: Omit<Product, 'id' | 'createdAt'>): string => {
    const newProduct: Product = {
      ...product,
      id: uuidv4(),
      createdAt: new Date().toISOString(),
    };
    
    setProducts(prevProducts => [...prevProducts, newProduct]);
    return newProduct.id;
  };

  // Update an existing product
  const updateProduct = (id: string, productUpdate: Partial<Omit<Product, 'id' | 'createdAt'>>): boolean => {
    const productExists = products.some(p => p.id === id);
    
    if (!productExists) {
      return false;
    }
    
    setProducts(prevProducts =>
      prevProducts.map(product =>
        product.id === id ? { ...product, ...productUpdate } : product
      )
    );
    
    return true;
  };

  // Delete a product
  const deleteProduct = (id: string): boolean => {
    const productExists = products.some(p => p.id === id);
    
    if (!productExists) {
      return false;
    }
    
    setProducts(prevProducts => prevProducts.filter(product => product.id !== id));
    return true;
  };

  // Update product stock (can be positive or negative change)
  const updateProductStock = (id: string, quantityChange: number): boolean => {
    const product = products.find(p => p.id === id);
    
    if (!product) {
      return false;
    }
    
    const newStock = product.stock + quantityChange;
    
    if (newStock < 0) {
      return false;
    }
    
    return updateProduct(id, { stock: newStock });
  };

  return (
    <ProductContext.Provider
      value={{
        products,
        loading,
        error,
        addProduct,
        updateProduct,
        deleteProduct,
        updateProductStock
      }}
    >
      {children}
    </ProductContext.Provider>
  );
}