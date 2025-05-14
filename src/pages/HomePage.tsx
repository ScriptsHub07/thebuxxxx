import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Package, CreditCard, Mail, Shield } from 'lucide-react';
import { useProducts } from '../hooks/useProducts';
import ProductCard from '../components/ProductCard';

const HomePage = () => {
  const { products } = useProducts();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  
  useEffect(() => {
    // Simulate featured products (take up to 4 products)
    setFeaturedProducts(products.slice(0, 4));
  }, [products]);

  return (
    <div>
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-bg-dark">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-black opacity-70"></div>
          <img 
            alt="Background" 
            className="w-full h-full object-cover"
          />
        </div>
        
        <div className="container-custom mx-auto px-4 z-10 pt-24">
          <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Contas <span className="text-primary">Blox Fruit</span> Premium
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl">
              Adquira contas Blox Fruit de alta qualidade com frutas raras, níveis avançados e itens exclusivos.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/produtos" className="btn btn-primary text-lg px-8 py-3">
                Ver Produtos
              </Link>
              <Link to="/cadastro" className="btn btn-outline text-lg px-8 py-3">
                Criar Conta
              </Link>
            </div>
          </div>
        </div>
        
        <div className="absolute bottom-10 left-0 right-0 flex justify-center animate-bounce">
          <ArrowRight className="h-8 w-8 text-white transform rotate-90" />
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-20 bg-bg-light">
        <div className="container-custom mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-white mb-4">Por que escolher a The Buxx?</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Oferecemos as melhores contas Blox Fruit com segurança, rapidez e garantia para sua diversão.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Feature 1 */}
            <div className="bg-bg-card p-6 rounded-lg">
              <div className="bg-primary bg-opacity-10 p-3 rounded-full w-14 h-14 flex items-center justify-center mb-5">
                <Package className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-white text-lg font-semibold mb-3">Contas Premium</h3>
              <p className="text-gray-400">
                Contas Blox Fruit com frutas raras, níveis altos e itens exclusivos.
              </p>
            </div>
            
            {/* Feature 2 */}
            <div className="bg-bg-card p-6 rounded-lg">
              <div className="bg-primary bg-opacity-10 p-3 rounded-full w-14 h-14 flex items-center justify-center mb-5">
                <CreditCard className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-white text-lg font-semibold mb-3">Pagamento Seguro</h3>
              <p className="text-gray-400">
                Transações protegidas com EFI Bank para sua segurança.
              </p>
            </div>
            
            {/* Feature 3 */}
            <div className="bg-bg-card p-6 rounded-lg">
              <div className="bg-primary bg-opacity-10 p-3 rounded-full w-14 h-14 flex items-center justify-center mb-5">
                <Mail className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-white text-lg font-semibold mb-3">Entrega Imediata</h3>
              <p className="text-gray-400">
                Receba os dados da sua conta instantaneamente por email após o pagamento.
              </p>
            </div>
            
            {/* Feature 4 */}
            <div className="bg-bg-card p-6 rounded-lg">
              <div className="bg-primary bg-opacity-10 p-3 rounded-full w-14 h-14 flex items-center justify-center mb-5">
                <Shield className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-white text-lg font-semibold mb-3">Garantia Total</h3>
              <p className="text-gray-400">
                Garantimos a entrega e funcionamento de todos os produtos vendidos.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Featured Products */}
      <section className="py-20 bg-bg-dark">
        <div className="container-custom mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl font-bold text-white mb-4">Contas em Destaque</h2>
              <p className="text-gray-400 max-w-2xl">
                Confira nossas contas mais populares com os melhores itens e preços.
              </p>
            </div>
            <Link 
              to="/produtos" 
              className="mt-6 md:mt-0 btn btn-outline flex items-center"
            >
              Ver Todos
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-20 bg-primary">
        <div className="container-custom mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Pronto para elevar seu jogo?
          </h2>
          <p className="text-white text-opacity-90 max-w-2xl mx-auto mb-8">
            Adquira agora mesmo uma conta Blox Fruit premium e desfrute de todos os recursos exclusivos que oferecemos.
          </p>
          <Link 
            to="/produtos" 
            className="btn bg-white text-primary hover:bg-gray-100 text-lg px-8 py-3 inline-flex items-center"
          >
            Comprar Agora
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;