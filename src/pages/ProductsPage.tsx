import { useState } from 'react';
import { Search, Filter } from 'lucide-react';
import { useProducts } from '../hooks/useProducts';
import ProductCard from '../components/ProductCard';

const ProductsPage = () => {
  const { products, loading } = useProducts();
  const [searchTerm, setSearchTerm] = useState('');
  const [priceFilter, setPriceFilter] = useState('all');
  const [stockFilter, setStockFilter] = useState('all');
  
  // Filter products based on search term and filters
  const filteredProducts = products.filter(product => {
    // Filter by search term
    const matchesSearch = 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Filter by price
    let matchesPrice = true;
    if (priceFilter === 'under50') {
      matchesPrice = product.price < 50;
    } else if (priceFilter === '50to100') {
      matchesPrice = product.price >= 50 && product.price <= 100;
    } else if (priceFilter === 'over100') {
      matchesPrice = product.price > 100;
    }
    
    // Filter by stock
    let matchesStock = true;
    if (stockFilter === 'inStock') {
      matchesStock = product.stock > 0;
    } else if (stockFilter === 'outOfStock') {
      matchesStock = product.stock === 0;
    }
    
    return matchesSearch && matchesPrice && matchesStock;
  });

  return (
    <div className="min-h-screen bg-bg-dark pt-24 pb-16">
      <div className="container-custom mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Contas Blox Fruit
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Escolha entre nossa variedade de contas premium com diferentes níveis e itens raros.
          </p>
        </div>
        
        {/* Search and Filters */}
        <div className="bg-bg-light p-4 rounded-lg mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Bar */}
            <div className="md:flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Buscar contas..."
                className="input pl-10 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Filter className="h-5 w-5 text-gray-400" />
                </div>
                <select
                  className="input pl-10 appearance-none pr-8"
                  value={priceFilter}
                  onChange={(e) => setPriceFilter(e.target.value)}
                >
                  <option value="all">Todos os preços</option>
                  <option value="under50">Menos de R$50</option>
                  <option value="50to100">R$50 a R$100</option>
                  <option value="over100">Mais de R$100</option>
                </select>
              </div>
              
              <div>
                <select
                  className="input appearance-none"
                  value={stockFilter}
                  onChange={(e) => setStockFilter(e.target.value)}
                >
                  <option value="all">Todos os produtos</option>
                  <option value="inStock">Em estoque</option>
                  <option value="outOfStock">Esgotados</option>
                </select>
              </div>
            </div>
          </div>
        </div>
        
        {/* Products Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-pulse-light text-primary text-xl">Carregando produtos...</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <p className="text-gray-400 text-lg">
                  Nenhum produto encontrado com os filtros atuais.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductsPage;