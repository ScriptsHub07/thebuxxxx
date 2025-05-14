import { useEffect, useState } from 'react';
import { 
  ShoppingBag, 
  CreditCard, 
  Package, 
  CheckCircle,
  Clock,
  AlertTriangle
} from 'lucide-react';
import { useAdmin } from '../../hooks/useAdmin';
import { useProducts } from '../../hooks/useProducts';

// ... imports mantidos

const AdminDashboard = () => {
  const { getDashboardStats, orders } = useAdmin();
  const { products } = useProducts();
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    totalRevenue: 0,
    lowStockProducts: 0
  });

  useEffect(() => {
    setStats(getDashboardStats());
  }, [getDashboardStats, orders, products]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

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

  const getRecentOrders = () => {
    return [...orders]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
  };

  const getLowStockProducts = () => {
    return products
      .filter(p => p.stock <= 2)
      .sort((a, b) => a.stock - b.stock)
      .slice(0, 5);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Dashboard</h1>

      {/* Cards de estatísticas - inalterados */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* ... Total Orders, Pending Orders, etc. ... */}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pedidos Recentes */}
        <div className="bg-bg-light rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Pedidos Recentes</h2>

          {orders.length === 0 ? (
            <div className="text-center py-6">
              <ShoppingBag className="h-10 w-10 text-gray-600 mx-auto mb-2" />
              <p className="text-gray-400">Nenhum pedido registrado</p>
            </div>
          ) : (
            <div className="space-y-4">
              {getRecentOrders().map(order => (
                <div key={order.id} className="bg-bg-dark rounded-lg p-3">
                  <div className="flex justify-between items-center mb-2">
                    <div className="text-white font-medium">
                      Pedido #{order.id.slice(0, 8).toUpperCase()}
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs ${
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

                  <div className="flex justify-between text-sm">
                    <div className="text-gray-400">
                      {formatDate(order.createdAt)}
                    </div>
                    <div className="text-primary font-medium">
                      {formatPrice(order.total)}
                    </div>
                  </div>

                  {/* Produtos do pedido com link de download */}
                  {order.products && order.products.length > 0 && (
                    <div className="mt-3 space-y-1">
                      {order.products.map(product => (
                        <div key={product.id} className="text-sm text-white">
                          <span>{product.name}</span>
                          {order.paymentStatus === 'paid' && product.fileUrl && (
                            <a
                              href={product.fileUrl}
                              download
                              className="ml-2 text-blue-400 underline text-xs"
                            >
                              Baixar arquivo
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Estoque Baixo - inalterado */}
        <div className="bg-bg-light rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">Produtos com Estoque Baixo</h2>
          {stats.lowStockProducts === 0 ? (
            <div className="text-center py-6">
              <Package className="h-10 w-10 text-gray-600 mx-auto mb-2" />
              <p className="text-gray-400">Todos os produtos estão com estoque adequado</p>
            </div>
          ) : (
            <div className="space-y-4">
              {getLowStockProducts().map(product => (
                <div key={product.id} className="bg-bg-dark rounded-lg p-3">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-bg-light rounded-md overflow-hidden mr-3">
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <div className="text-white font-medium truncate mr-2">
                          {product.name}
                        </div>
                        <div className={`px-2 py-1 rounded-full text-xs ${
                          product.stock === 0
                            ? 'bg-red-500 bg-opacity-10 text-red-500'
                            : 'bg-yellow-500 bg-opacity-10 text-yellow-500'
                        }`}>
                          {product.stock === 0 ? 'Esgotado' : `${product.stock} restantes`}
                        </div>
                      </div>
                      <div className="text-gray-400 text-sm">
                        {formatPrice(product.price)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
