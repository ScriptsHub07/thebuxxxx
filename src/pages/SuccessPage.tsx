import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, ArrowRight, Home, Package } from 'lucide-react';
import { useAdmin } from '../hooks/useAdmin';
import { Order } from '../types';

const SuccessPage = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { getOrderById, updateOrderStatus } = useAdmin();
  const [order, setOrder] = useState<Order | null>(null);
  
  useEffect(() => {
    if (!orderId) {
      navigate('/');
      return;
    }
    
    const orderData = getOrderById(orderId);
    if (!orderData) {
      navigate('/');
      return;
    }
    
    setOrder(orderData);
    
    // Simulate payment confirmation and delivery
    const simulatePayment = async () => {
      // Wait 2 seconds to simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mark order as paid
      updateOrderStatus(orderId, 'paid');
      
      // Wait 1 more second to simulate delivery
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mark order as delivered
      updateOrderStatus(orderId, undefined, 'delivered');
      
      // Update local order state
      setOrder(prev => {
        if (!prev) return null;
        return {
          ...prev,
          paymentStatus: 'paid',
          deliveryStatus: 'delivered'
        };
      });
    };
    
    simulatePayment();
  }, [orderId, navigate, getOrderById, updateOrderStatus]);
  
  // Format price to BRL
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse-light text-primary text-xl">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-dark pt-24 pb-16">
      <div className="container-custom mx-auto px-4">
        <div className="mb-8">
          <div className="flex items-center text-gray-400 mb-4">
            <span>Carrinho</span>
            <ArrowRight className="h-4 w-4 mx-2" />
            <span>Pagamento</span>
            <ArrowRight className="h-4 w-4 mx-2" />
            <span className="text-primary font-medium">Confirmação</span>
          </div>
          
          <div className="text-center mb-8">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-white mb-2">Pedido Confirmado!</h1>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Seu pedido foi processado com sucesso. Os dados de acesso foram enviados para o email cadastrado.
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Details */}
          <div className="lg:col-span-2">
            <div className="bg-bg-light rounded-lg p-6">
              <h2 className="text-xl font-semibold text-white mb-4 pb-2 border-b border-gray-700">
                Detalhes do Pedido
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <h3 className="text-gray-400 text-sm mb-1">Número do Pedido</h3>
                  <p className="text-white font-medium">{order.id.slice(0, 8).toUpperCase()}</p>
                </div>
                <div>
                  <h3 className="text-gray-400 text-sm mb-1">Data</h3>
                  <p className="text-white font-medium">{formatDate(order.createdAt)}</p>
                </div>
                <div>
                  <h3 className="text-gray-400 text-sm mb-1">Status do Pagamento</h3>
                  <div className={`inline-flex items-center px-2 py-1 rounded-full text-sm ${
                    order.paymentStatus === 'paid' 
                      ? 'bg-green-500 bg-opacity-10 text-green-500' 
                      : order.paymentStatus === 'failed'
                        ? 'bg-red-500 bg-opacity-10 text-red-500'
                        : 'bg-yellow-500 bg-opacity-10 text-yellow-500'
                  }`}>
                    {order.paymentStatus === 'paid' 
                      ? 'Pago' 
                      : order.paymentStatus === 'failed'
                        ? 'Falhou'
                        : 'Pendente'}
                  </div>
                </div>
                <div>
                  <h3 className="text-gray-400 text-sm mb-1">Email de Entrega</h3>
                  <p className="text-white font-medium">{order.email}</p>
                </div>
              </div>
              
              <h3 className="text-lg font-semibold text-white mb-3">
                Itens do Pedido
              </h3>
              
              <div className="bg-bg-dark rounded-lg overflow-hidden mb-6">
                <div className="divide-y divide-gray-700">
                  {order.items.map((item, index) => (
                    <div key={index} className="p-4 flex items-center">
                      <div className="bg-bg-light w-10 h-10 rounded-full flex items-center justify-center mr-4">
                        <Package className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <h4 className="text-white font-medium">{item.productName}</h4>
                          <span className="text-primary font-semibold">
                            {formatPrice(item.price * item.quantity)}
                          </span>
                        </div>
                        <div className="flex justify-between text-gray-400 text-sm">
                          <span>Quantidade: {item.quantity}</span>
                          <span>Preço unitário: {formatPrice(item.price)}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="bg-bg-dark rounded-lg p-4 mb-6">
                <div className="flex items-start">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 ${
                    order.deliveryStatus === 'delivered' 
                      ? 'bg-green-500 bg-opacity-10' 
                      : 'bg-yellow-500 bg-opacity-10'
                  }`}>
                    <CheckCircle className={`h-5 w-5 ${
                      order.deliveryStatus === 'delivered' 
                        ? 'text-green-500' 
                        : 'text-yellow-500'
                    }`} />
                  </div>
                  <div>
                    <h4 className="text-white font-medium">
                      {order.deliveryStatus === 'delivered'
                        ? 'Entrega Realizada' 
                        : 'Entrega Pendente'}
                    </h4>
                    <p className="text-gray-400 text-sm">
                      {order.deliveryStatus === 'delivered'
                        ? 'Os dados de acesso foram enviados para seu email.' 
                        : 'Os dados de acesso serão enviados para seu email em breve.'}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/" className="btn btn-outline flex-1 flex items-center justify-center">
                  <Home className="h-5 w-5 mr-2" />
                  Voltar para Início
                </Link>
                <Link to="/produtos" className="btn btn-primary flex-1 flex items-center justify-center">
                  <Package className="h-5 w-5 mr-2" />
                  Continuar Comprando
                </Link>
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
                  <span className="text-white">{formatPrice(order.total)}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Taxa de processamento</span>
                  <span className="text-white">Grátis</span>
                </div>
                <div className="pt-3 border-t border-gray-700 flex justify-between font-semibold text-lg">
                  <span className="text-white">Total</span>
                  <span className="text-primary">{formatPrice(order.total)}</span>
                </div>
              </div>
              
              <div className="bg-primary bg-opacity-10 rounded-lg p-4 border border-primary">
                <h3 className="text-white font-semibold mb-2">Importante</h3>
                <p className="text-gray-200 text-sm">
                  Os dados de acesso foram enviados para o email {order.email}. Se não encontrar o email, verifique sua pasta de spam ou lixo eletrônico.
                </p>
                <p className="text-gray-200 text-sm mt-2">
                  Recomendamos alterar a senha da conta assim que recebê-la para garantir sua segurança.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuccessPage;