import { Link } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';
import { useCart } from '../hooks/useCart';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const { addToCart } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addToCart(product.id);
  };

  // Format price to BRL
  const formattedPrice = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(product.price);

  return (
    <Link to={`/produto/${product.id}`} className="block">
      <div className="card card-hover flex flex-col h-full">
        {/* Product Image */}
        <div className="relative h-48 overflow-hidden">
          <img 
            src={product.imageUrl} 
            alt={product.name} 
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
          />
          {product.stock <= 0 && (
            <div className="absolute inset-0 bg-bg-dark bg-opacity-80 flex items-center justify-center">
              <span className="bg-gray-800 text-white px-3 py-1 rounded-full text-sm font-medium">
                Esgotado
              </span>
            </div>
          )}
        </div>
        
        {/* Product Info */}
        <div className="p-4 flex-1 flex flex-col">
          <h3 className="text-white font-semibold text-lg mb-2 line-clamp-2">
            {product.name}
          </h3>
          
          <div className="flex-1">
            <p className="text-gray-400 text-sm line-clamp-2 mb-3">
              {product.description}
            </p>
            
            {/* Features Preview */}
            <div className="mb-4">
              <div className="flex flex-wrap gap-2">
                {product.features.slice(0, 2).map((feature, index) => (
                  <span 
                    key={index} 
                    className="bg-bg-dark px-2 py-1 rounded-full text-xs text-gray-400"
                  >
                    {feature}
                  </span>
                ))}
                {product.features.length > 2 && (
                  <span className="bg-bg-dark px-2 py-1 rounded-full text-xs text-gray-400">
                    +{product.features.length - 2}
                  </span>
                )}
              </div>
            </div>
          </div>
          
          {/* Price and Cart */}
          <div className="mt-auto">
            <div className="flex items-center justify-between">
              <span className="text-white font-bold text-xl">
                {formattedPrice}
              </span>
              
              <button 
                onClick={handleAddToCart}
                disabled={product.stock <= 0}
                className={`p-2 rounded-full transition-all ${
                  product.stock <= 0 
                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed' 
                    : 'bg-primary text-white hover:bg-primary-dark'
                }`}
              >
                <ShoppingBag className="h-5 w-5" />
              </button>
            </div>
            
            {/* Stock Indicator */}
            <div className="mt-2 text-xs text-gray-400">
              {product.stock > 0 ? (
                <span>Estoque: {product.stock} {product.stock === 1 ? 'conta' : 'contas'}</span>
              ) : (
                <span className="text-red-500">Sem estoque</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;