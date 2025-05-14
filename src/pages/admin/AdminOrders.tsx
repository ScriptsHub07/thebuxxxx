import { useState } from 'react';
import { 
  Search, 
  ShoppingBag, 
  ChevronDown, 
  ChevronUp, 
  CheckCircle, 
  Clock,
  AlertTriangle,
  Mail
} from 'lucide-react';
import { useAdmin } from '../../hooks/useAdmin';
import { Order } from '../../types';

const AdminOrders = () => {
  const { orders, updateOrderStatus } = useAdmin();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);
  
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
  
  // Filter orders
  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesStatus = true;
    if (statusFilter === 'pending') {
      matchesStatus = order.paymentStatus === 'pending' || order.deliveryStatus === 'pending';
    } else if (statusFilter === 'completed') {
      matchesStatus = order.paymentStatus === 'paid' && order.deliveryStatus === 'delivered';
    } else if (statusFilter === 'failed') {
      matchesStatus = order.paymentStatus === 'failed';
    }
    
    return matchesSearch && matchesStatus;
  });
  
  // Sort orders by date (newest first)
  const sortedOrders = [...filteredOrders].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
  
  // Toggle order details
  const toggleOrderDetails = (orderId: string) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };
  
  // Update order status
  const handleUpdateStatus = (
    orderId: string, 
    field: 'paymentStatus' | 'deliveryStatus', 
    status: 'pending' | 'paid' | 'failed' | 'delivered'
  ) => {
    if (field === 'paymentStatus') {
      updateOrderStatus(orderId, status as any);
    } else {
      updateOrderStatus(orderId, undefined, status as any);
    }
  };
  
  // Get status badge color
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'paid':
      case 'delivered':
        return 'bg-green-500 bg-opacity-10 text-green-500';
      case 'pending':
        return 'bg-yellow-500 bg-opacity-10 text-yellow-500';
      case 'failed':
        return 'bg-red-500 bg-opacity-10 text-red-500';
      default:
        return 'bg-gray-500 bg-opacity-10 text-gray-500';
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Gerenciar Pedidos</h1>
      
      {/* Search & Filter */}
      <div className="bg-bg-light p-4 rounded-lg mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative md:flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Buscar por ID ou email..."
              className="input pl-10 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div>
            <select
              className="input appearance-none"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">Todos os pedidos</option>
              <option value="pending">Pendentes</option>
              <option value="completed">Concluídos</option>
              <option value="failed">Falhos</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Orders List */}
      {sortedOrders.length === 0 ? (
        <div className="bg-bg-light rounded-lg p-8 text-center">
          <ShoppingBag className="h-16 w-16 text-gray-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">
            Nenhum pedido encontrado
          </h2>
          <p className="text-gray-400">
            {searchTerm || statusFilter !== 'all'
              ? 'Tente usar filtros diferentes.'
              : 'Ainda não há pedidos registrados.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedOrders.map(order => (
            <div 
              key={order.id} 
              className="bg-bg-light rounded-lg overflow-hidden"
            >
              {/* Order Header */}
              <div 
                className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center cursor-pointer"
                onClick={() => toggleOrderDetails(order.id)}
              >
                <div>
                  <div className="flex items-center">
                    <h3 className="text-white font-medium">
                      Pedido #{order.id.slice(0, 8).toUpperCase()}
                    </h3>
                    {expandedOrder === order.id ? (
                      <ChevronUp className="h-5 w-5 text-gray-400 ml-2" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-400 ml-2" />
                    )}
                  </div>
                  <div className="text-sm text-gray-400 mt-1">
                    {formatDate(order.createdAt)}
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 mt-2 sm:mt-0">
                  <div className="text-primary font-semibold">
                    {formatPrice(order.total)}
                  </div>
                  
                  <div className={`px-2 py-1 rounded-full text-xs ${
                    getStatusBadgeClass(order.paymentStatus)
                  }`}>
                    {order.paymentStatus === 'paid' ? 'Pago' : 
                     order.paymentStatus === 'failed' ? 'Falhou' : 'Pendente'}
                  </div>
                  
                  <div className={`px-2 py-1 rounded-full text-xs ${
                    getStatusBadgeClass(order.deliveryStatus)
                  }`}>
                    {order.deliveryStatus === 'delivered' ? 'Entregue' : 'Pendente'}
                  </div>
                </div>
              </div>
              
              {/* Order Details */}
              {expandedOrder === order.id && (
                <div className="px-4 pb-4 border-t border-gray-700 pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <h4 className="text-gray-400 text-sm mb-1">Email</h4>
                      <div className="flex items-center text-white">
                        <Mail className="h-4 w-4 text-primary mr-2" />
                        {order.email}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-gray-400 text-sm mb-1">Data do Pedido</h4>
                      <p className="text-white">{formatDate(order.createdAt)}</p>
                    </div>
                  </div>
                  
                  <h4 className="text-white font-medium mb-3">Itens do Pedido</h4>
                  <div className="bg-bg-dark rounded-lg p-3 mb-4">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex justify-between items-center mb-2 last:mb-0">
                        <div className="text-white">
                          {item.productName} <span className="text-gray-400">x{item.quantity}</span>
                        </div>
                        <div className="text-primary font-medium">
                          {formatPrice(item.price * item.quantity)}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex justify-between mb-4">
                    <h4 className="text-white font-medium">Total</h4>
                    <div className="text-primary font-semibold">
                      {formatPrice(order.total)}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Payment Status */}
                    <div>
                      <h4 className="text-white font-medium mb-2">Status do Pagamento</h4>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleUpdateStatus(order.id, 'paymentStatus', 'pending')}
                          className={`btn py-1 px-3 flex items-center text-sm ${
                            order.paymentStatus === 'pending'
                              ? 'bg-yellow-500 bg-opacity-10 text-yellow-500 border border-yellow-500'
                              : 'btn-dark'
                          }`}
                        >
                          <Clock className="h-4 w-4 mr-1" />
                          Pendente
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(order.id, 'paymentStatus', 'paid')}
                          className={`btn py-1 px-3 flex items-center text-sm ${
                            order.paymentStatus === 'paid'
                              ? 'bg-green-500 bg-opacity-10 text-green-500 border border-green-500'
                              : 'btn-dark'
                          }`}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Pago
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(order.id, 'paymentStatus', 'failed')}
                          className={`btn py-1 px-3 flex items-center text-sm ${
                            order.paymentStatus === 'failed'
                              ? 'bg-red-500 bg-opacity-10 text-red-500 border border-red-500'
                              : 'btn-dark'
                          }`}
                        >
                          <AlertTriangle className="h-4 w-4 mr-1" />
                          Falhou
                        </button>
                      </div>
                    </div>
                    
                    {/* Delivery Status */}
                    <div>
                      <h4 className="text-white font-medium mb-2">Status da Entrega</h4>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleUpdateStatus(order.id, 'deliveryStatus', 'pending')}
                          className={`btn py-1 px-3 flex items-center text-sm ${
                            order.deliveryStatus === 'pending'
                              ? 'bg-yellow-500 bg-opacity-10 text-yellow-500 border border-yellow-500'
                              : 'btn-dark'
                          }`}
                        >
                          <Clock className="h-4 w-4 mr-1" />
                          Pendente
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(order.id, 'deliveryStatus', 'delivered')}
                          className={`btn py-1 px-3 flex items-center text-sm ${
                            order.deliveryStatus === 'delivered'
                              ? 'bg-green-500 bg-opacity-10 text-green-500 border border-green-500'
                              : 'btn-dark'
                          }`}
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Entregue
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminOrders;