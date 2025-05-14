import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingBag, 
  Settings, 
  LogOut 
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const AdminSidebar = () => {
  const location = useLocation();
  const { logout } = useAuth();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const menuItems = [
    {
      path: '/admin/dashboard',
      name: 'Dashboard',
      icon: <LayoutDashboard className="h-5 w-5" />
    },
    {
      path: '/admin/produtos',
      name: 'Produtos',
      icon: <Package className="h-5 w-5" />
    },
    {
      path: '/admin/pedidos',
      name: 'Pedidos',
      icon: <ShoppingBag className="h-5 w-5" />
    },
    {
      path: '/admin/configuracoes',
      name: 'Configurações',
      icon: <Settings className="h-5 w-5" />
    }
  ];

  return (
    <div className="bg-bg-light w-64 h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <Link to="/" className="flex items-center">
          <ShoppingBag className="h-8 w-8 text-primary mr-2" />
          <span className="text-white font-bold text-xl">The Buxx</span>
        </Link>
        <div className="mt-2 text-gray-400 text-sm">Painel Administrativo</div>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 py-6 px-4">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`flex items-center px-3 py-2 rounded-md transition-colors ${
                  isActive(item.path)
                    ? 'bg-primary text-white'
                    : 'text-gray-400 hover:bg-bg-dark hover:text-white'
                }`}
              >
                {item.icon}
                <span className="ml-3">{item.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      
      {/* Footer */}
      <div className="p-4 border-t border-gray-700">
        <Link to="/" className="flex items-center px-3 py-2 text-gray-400 hover:text-primary transition-colors">
          <ShoppingBag className="h-5 w-5" />
          <span className="ml-3">Ver Loja</span>
        </Link>
        <button
          onClick={logout}
          className="w-full flex items-center px-3 py-2 text-gray-400 hover:text-red-500 transition-colors"
        >
          <LogOut className="h-5 w-5" />
          <span className="ml-3">Sair</span>
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;