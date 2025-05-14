import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Trash2, ChevronLeft, ShoppingCart } from 'lucide-react';
import { useCart } from '../hooks/useCart';
import { useProducts } from '../hooks/useProducts';
import { useAuth } from '../hooks/useAuth';

const CartPage = () => {
  const { cartItems, updateQuantity, removeFromCart, getCartTotal } = useCart();
  const { products } = useProducts();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Format price to BRL
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };
  
  // Check if cart is empty
  const isEmpty = cartItems.length === 0;
  
  // Get cart products with details
  const cartProducts = cartItems.map(item => {
    const product = products.find(p => p.id === item.productId);
    return {
      ...item,
      product
    };
  });
  
  // Handle quantity change
  const handleQuantityChange = (productId: string, newQuantity: number) => {
    updateQuantity(productId, newQuantity);
  };
  
  // Handle remove from cart
  const handleRemove = (productId: string) => {
    removeFromCart(productId);
  };
  
  // Handle proceed to checkout
  const handleCheckout = () => {
    if (user) {
      navigate('/checkout');
    } else {
      navigate('/login', { state: { from: '/checkout' } });
    }
  };

  return (
    <div className="min-h-screen bg-bg-dark pt-24 pb-16">
      <div className="container-custom mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Carrinho</h1>
          <Link 
            to="/produtos" 
            className="flex items-center text-gray-400 hover:text-primary transition-colors"
          >
            <ChevronLeft className="h-5 w-5 mr-1" />
            Continuar Comprando
          </Link>
        </div>
        
        {isEmpty ? (
          <div className="bg-bg-light rounded-lg p-6 text-center">
            <ShoppingCart className="h-16 w-16 mx-auto text-gray-500 mb-4" />
            <h2 className="text-xl font-semibold text-white mb-3">Seu carrinho está vazio</h2>
            <p className="text-gray-400 mb-6">
              Parece que você ainda não adicionou nenhum produto ao seu carrinho.
            </p>
            <Link to="/produtos" className="btn btn-primary">
              Ver Produtos
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-bg-light rounded-lg overflow-hidden">
                <div className="hidden sm:grid grid-cols-6 gap-4 p-4 border-b border-gray-700 text-white font-semibold">
                  <div className="col-span-3">Produto</div>
                  <div className="text-center">Preço</div>
                  <div className="text-center">Quantidade</div>
                  <div className="text-right">Subtotal</div>
                </div>
                
                <div className="divide-y divide-gray-700">
                  {cartProducts.map(({productId, quantity, product}) => {
                    if (!product) return null;
                    
                    return (
                      <div key={productId} className="p-4">
                        <div className="sm:grid sm:grid-cols-6 gap-4 flex flex-col">
                          {/* Product */}
                          <div className="col-span-3 flex items-center mb-4 sm:mb-0">
                            <img 
                              src={product.imageUrl} 
                              alt={product.name} 
                              className="w-16 h-16 object-cover rounded-md mr-4"
                            />
                            <div>
                              <h3 className="text-white font-medium">{product.name}</h3>
                              <button
                                onClick={() => handleRemove(productId)}
                                className="text-gray-400 hover:text-red-500 transition-colors flex items-center mt-1 text-sm"
                              >
                                <Trash2 className="h-4 w-4 mr-1" />
                                Remover
                              </button>
                            </div>
                          </div>
                          
                          {/* Price */}
                          <div className="text-white sm:text-center flex justify-between items-center mb-3 sm:mb-0">
                            <span className="sm:hidden">Preço:</span>
                            {formatPrice(product.price)}
                          </div>
                          
                          {/* Quantity */}
                          <div className="sm:text-center flex justify-between items-center mb-3 sm:mb-0">
                            <span className="sm:hidden">Quantidade:</span>
                            <div className="flex items-center border border-gray-700 rounded-md overflow-hidden">
                              <button
                                className="px-2 py-1 bg-bg-dark text-white hover:bg-gray-700 transition-colors"
                                onClick={() => handleQuantityChange(productId, quantity - 1)}
                                disabled={quantity <= 1}
                              >
                                -
                              </button>
                              <span className="px-3 py-1 text-white text-center w-8">
                                {quantity}
                              </span>
                              <button
                                className="px-2 py-1 bg-bg-dark text-white hover:bg-gray-700 transition-colors"
                                onClick={() => handleQuantityChange(productId, quantity + 1)}
                                disabled={quantity >= product.stock}
                              >
                                +
                              </button>
                            </div>
                          </div>
                          
                          {/* Subtotal */}
                          <div className="text-primary font-bold sm:text-right flex justify-between items-center">
                            <span className="sm:hidden">Subtotal:</span>
                            {formatPrice(product.price * quantity)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            
            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-bg-light rounded-lg p-4">
                <h2 className="text-xl font-semibold text-white mb-4 pb-3 border-b border-gray-700">
                  Resumo do Pedido
                </h2>
                
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-gray-400">
                    <span>Subtotal</span>
                    <span className="text-white">{formatPrice(getCartTotal())}</span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>Taxa de processamento</span>
                    <span className="text-white">Grátis</span>
                  </div>
                  <div className="pt-3 border-t border-gray-700 flex justify-between font-semibold text-lg">
                    <span className="text-white">Total</span>
                    <span className="text-primary">{formatPrice(getCartTotal())}</span>
                  </div>
                </div>
                
                <button
                  onClick={handleCheckout}
                  className="btn btn-primary w-full flex items-center justify-center"
                >
                  <ShoppingBag className="h-5 w-5 mr-2" />
                  {user ? 'Finalizar Compra' : 'Entrar para Finalizar'}
                </button>
                
                <div className="mt-4 text-center text-sm text-gray-400">
                  Os dados de acesso serão enviados para seu email após a confirmação do pagamento.
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartPage;