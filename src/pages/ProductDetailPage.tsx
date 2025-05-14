import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShoppingBag, ChevronLeft, Check, AlertTriangle } from 'lucide-react';
import { useProducts } from '../hooks/useProducts';
import { useCart } from '../hooks/useCart';
import { Product } from '../types';

const ProductDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { products } = useProducts();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (id && products.length > 0) {
      const foundProduct = products.find(p => p.id === id);
      if (foundProduct) {
        setProduct(foundProduct);
      } else {
        navigate('/produtos', { replace: true });
      }
      setLoading(false);
    }
  }, [id, products, navigate]);
  
  const handleQuantityChange = (value: number) => {
    if (product) {
      const newQuantity = Math.max(1, Math.min(value, product.stock));
      setQuantity(newQuantity);
    }
  };
  
  const handleAddToCart = () => {
    if (product && product.stock > 0) {
      addToCart(product.id, quantity);
    }
  };
  
  // Format price to BRL
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse-light text-primary text-xl">Carregando produto...</div>
      </div>
    );
  }
  
  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <AlertTriangle className="h-16 w-16 text-primary mb-4" />
        <h1 className="text-2xl font-bold text-white mb-4">Produto não encontrado</h1>
        <button
          onClick={() => navigate('/produtos')}
          className="btn btn-primary"
        >
          Ver Outros Produtos
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-dark pt-24 pb-16">
      <div className="container-custom mx-auto px-4">
        {/* Back Button */}
        <button
          onClick={() => navigate('/produtos')}
          className="flex items-center text-gray-400 hover:text-primary transition-colors mb-8"
        >
          <ChevronLeft className="h-5 w-5 mr-1" />
          Voltar para Produtos
        </button>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Product Image */}
          <div className="bg-bg-light rounded-lg overflow-hidden">
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-full object-cover max-h-[400px]"
            />
          </div>
          
          {/* Product Details */}
          <div className="bg-bg-light rounded-lg p-6">
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-4">
              {product.name}
            </h1>
            
            {/* Price */}
            <div className="mb-6">
              <span className="text-3xl font-bold text-primary">
                {formatPrice(product.price)}
              </span>
            </div>
            
            {/* Stock Status */}
            <div className="mb-6">
              {product.stock > 0 ? (
                <div className="flex items-center text-green-500">
                  <Check className="h-5 w-5 mr-2" />
                  <span>Em estoque - {product.stock} {product.stock === 1 ? 'disponível' : 'disponíveis'}</span>
                </div>
              ) : (
                <div className="flex items-center text-red-500">
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  <span>Esgotado</span>
                </div>
              )}
            </div>
            
            {/* Description */}
            <div className="mb-6">
              <h3 className="text-white font-semibold mb-2">Descrição</h3>
              <p className="text-gray-400">
                {product.description}
              </p>
            </div>
            
            {/* Features */}
            <div className="mb-8">
              <h3 className="text-white font-semibold mb-2">Características</h3>
              <ul className="space-y-2">
                {product.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <Check className="h-5 w-5 text-primary mr-2 mt-0.5 shrink-0" />
                    <span className="text-gray-400">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Add to Cart */}
            <div className="flex flex-col sm:flex-row gap-4">
              {product.stock > 0 && (
                <div className="flex items-center border border-gray-700 rounded-md overflow-hidden">
                  <button
                    className="px-3 py-2 bg-bg-dark text-white hover:bg-gray-700 transition-colors"
                    onClick={() => handleQuantityChange(quantity - 1)}
                    disabled={quantity <= 1}
                  >
                    -
                  </button>
                  <span className="px-4 py-2 text-white text-center w-12">
                    {quantity}
                  </span>
                  <button
                    className="px-3 py-2 bg-bg-dark text-white hover:bg-gray-700 transition-colors"
                    onClick={() => handleQuantityChange(quantity + 1)}
                    disabled={quantity >= product.stock}
                  >
                    +
                  </button>
                </div>
              )}
              
              <button
                onClick={handleAddToCart}
                disabled={product.stock <= 0}
                className={`btn flex-1 flex items-center justify-center ${
                  product.stock > 0 
                    ? 'btn-primary' 
                    : 'bg-gray-700 cursor-not-allowed text-gray-400'
                }`}
              >
                <ShoppingBag className="h-5 w-5 mr-2" />
                {product.stock > 0 ? 'Adicionar ao Carrinho' : 'Indisponível'}
              </button>
            </div>
          </div>
        </div>
        
        {/* Additional Information */}
        <div className="bg-bg-light rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-white mb-4">
            Informações Importantes
          </h2>
          <div className="space-y-4 text-gray-400">
            <p>
              Todas as nossas contas são verificadas e garantidas. Após a compra, você receberá os dados de acesso por email.
            </p>
            <p>
              <strong className="text-white">Importante:</strong> Recomendamos que você altere a senha da conta após recebê-la para garantir segurança.
            </p>
            <p>
              Em caso de problemas ou dúvidas, entre em contato com nosso suporte através do email contato@thebuxx.com.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;