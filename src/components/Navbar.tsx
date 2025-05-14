import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingBag, User, Menu, X, LogOut } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useCart } from '../hooks/useCart';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, logout } = useAuth();
  const { getCartItemsCount } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Detect scroll to change navbar appearance
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Close mobile menu when changing route
  useEffect(() => {
    setIsOpen(false);
  }, [location]);
  
  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav 
      className={`fixed w-full z-50 transition-all duration-300 ${
        scrolled || isOpen ? 'bg-bg-dark shadow-lg' : 'bg-transparent'
      }`}
    >
      <div className="container-custom mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <ShoppingBag className="h-8 w-8 text-primary mr-2" />
            <span className="text-white font-bold text-xl">The Buxx</span>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-white hover:text-primary transition-colors">
              Início
            </Link>
            <Link to="/produtos" className="text-white hover:text-primary transition-colors">
              Produtos
            </Link>
            {user?.isAdmin && (
              <Link to="/admin" className="text-white hover:text-primary transition-colors">
                Painel Admin
              </Link>
            )}
          </div>
          
          {/* User Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/carrinho" className="relative text-white hover:text-primary transition-colors">
              <ShoppingBag className="h-6 w-6" />
              {getCartItemsCount() > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {getCartItemsCount()}
                </span>
              )}
            </Link>
            
            {user ? (
              <div className="relative group">
                <button className="flex items-center text-white hover:text-primary transition-colors">
                  <User className="h-6 w-6 mr-1" />
                  <span className="text-sm">{user.name.split(' ')[0]}</span>
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-bg-light rounded-md shadow-lg overflow-hidden z-50 scale-0 group-hover:scale-100 origin-top-right transition-transform duration-200">
                  {user.isAdmin && (
                    <Link to="/admin" className="block px-4 py-2 text-white hover:bg-primary transition-colors">
                      Painel Admin
                    </Link>
                  )}
                  <button 
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-white hover:bg-primary transition-colors flex items-center"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sair
                  </button>
                </div>
              </div>
            ) : (
              <Link to="/login" className="btn btn-primary">
                Entrar
              </Link>
            )}
          </div>
          
          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <Link to="/carrinho" className="relative text-white mr-4">
              <ShoppingBag className="h-6 w-6" />
              {getCartItemsCount() > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {getCartItemsCount()}
                </span>
              )}
            </Link>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-white focus:outline-none"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu */}
      <div 
        className={`md:hidden bg-bg-dark absolute w-full left-0 transition-all duration-300 overflow-hidden ${
          isOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="container-custom mx-auto px-4 py-2">
          <div className="flex flex-col space-y-3 pb-4">
            <Link to="/" className="text-white hover:text-primary py-2 transition-colors">
              Início
            </Link>
            <Link to="/produtos" className="text-white hover:text-primary py-2 transition-colors">
              Produtos
            </Link>
            {user?.isAdmin && (
              <Link to="/admin" className="text-white hover:text-primary py-2 transition-colors">
                Painel Admin
              </Link>
            )}
            <div className="border-t border-gray-700 my-2"></div>
            {user ? (
              <>
                <div className="flex items-center text-white py-2">
                  <User className="h-5 w-5 mr-2" />
                  <span>{user.name}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center text-white hover:text-primary py-2 transition-colors"
                >
                  <LogOut className="h-5 w-5 mr-2" />
                  Sair
                </button>
              </>
            ) : (
              <Link to="/login" className="btn btn-primary w-full">
                Entrar
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;