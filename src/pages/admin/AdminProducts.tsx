import { useState } from 'react';
import { 
  Plus, 
  Search, 
  Package, 
  Edit, 
  Trash2, 
  X, 
  Save
} from 'lucide-react';
import { useProducts } from '../../hooks/useProducts';
import { Product } from '../../types';

const AdminProducts = () => {
  const { products, addProduct, updateProduct, deleteProduct } = useProducts();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [estoqueText, setEstoqueText] = useState('');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [estoqueMessage, setEstoqueMessage] = useState('');

  const [newProduct, setNewProduct] = useState<Omit<Product, 'id' | 'createdAt'>>({
    name: '',
    description: '',
    price: 0,
    features: [''],
    imageUrl: '',
    stock: 0
  });

  const [editProduct, setEditProduct] = useState<Partial<Product>>({});

  const formatPrice = (price: number) => new Intl.NumberFormat('pt-BR', {
    style: 'currency', currency: 'BRL'
  }).format(price);

  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddFormChange = (field: string, value: any) => {
    setNewProduct(prev => ({ ...prev, [field]: value }));
  };

  const handleEditFormChange = (field: string, value: any) => {
    setEditProduct(prev => ({ ...prev, [field]: value }));
  };

  const handleAddProduct = () => {
    if (!newProduct.name || !newProduct.description || newProduct.price <= 0 || !newProduct.imageUrl) {
      alert('Preencha todos os campos obrigatórios.');
      return;
    }
    const filteredFeatures = newProduct.features.filter(f => f.trim() !== '');
    addProduct({ ...newProduct, features: filteredFeatures.length ? filteredFeatures : ['Conta padrão'] });
    setNewProduct({ name: '', description: '', price: 0, features: [''], imageUrl: '', stock: 0 });
    setShowAddForm(false);
  };

  const handleSaveEdit = () => {
    if (!editingProductId) return;
    if (!editProduct.name || !editProduct.description || !editProduct.price || !editProduct.imageUrl) {
      alert('Preencha todos os campos obrigatórios.');
      return;
    }
    const filteredFeatures = (editProduct.features || []).filter(f => f.trim() !== '');
    updateProduct(editingProductId, { ...editProduct, features: filteredFeatures.length ? filteredFeatures : ['Conta padrão'] });
    setEditingProductId(null);
    setEditProduct({});
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white">Gerenciar Produtos</h1>
        <button onClick={() => setShowAddForm(!showAddForm)} className="btn btn-primary">
          <Plus className="h-5 w-5 mr-2" /> Adicionar Produto
        </button>
      </div>

      {showAddForm && (
        <div className="bg-bg-light rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">Novo Produto</h2>
          <input type="text" className="input mb-2" placeholder="Nome" value={newProduct.name} onChange={(e) => handleAddFormChange('name', e.target.value)} />
          <textarea className="input mb-2" placeholder="Descrição" value={newProduct.description} onChange={(e) => handleAddFormChange('description', e.target.value)} />
          <input type="number" className="input mb-2" placeholder="Preço" value={newProduct.price} onChange={(e) => handleAddFormChange('price', parseFloat(e.target.value) || 0)} />
          <input type="text" className="input mb-2" placeholder="URL da Imagem" value={newProduct.imageUrl} onChange={(e) => handleAddFormChange('imageUrl', e.target.value)} />
          <input type="number" className="input mb-2" placeholder="Estoque" value={newProduct.stock} onChange={(e) => handleAddFormChange('stock', parseInt(e.target.value) || 0)} />
          <button className="btn btn-primary mt-2" onClick={handleAddProduct}><Save className="h-5 w-5 mr-2" />Salvar</button>
        </div>
      )}

      <div className="mb-6">
        <input type="text" className="input w-full" placeholder="Buscar produtos..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
      </div>

      <div className="grid gap-4">
        {filteredProducts.map(product => (
          <div key={product.id} className="bg-bg-light rounded-lg p-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-white">{product.name}</h3>
                <p className="text-gray-400">{formatPrice(product.price)}</p>
                <p className="text-sm text-gray-500">Estoque: {product.stock}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setEditingProductId(product.id)}><Edit /></button>
                <button onClick={() => setSelectedProductId(product.id)}><Plus /></button>
                <button onClick={() => deleteProduct(product.id)}><Trash2 /></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedProductId && (
        <div className="bg-bg-light mt-6 p-4 rounded-lg">
          <h2 className="text-lg font-semibold text-white mb-2">Adicionar contas para o produto</h2>
          <textarea
            className="w-full p-2 border rounded mb-2"
            rows={5}
            placeholder="email1:senha1"
            value={estoqueText}
            onChange={(e) => setEstoqueText(e.target.value)}
          />
          <div className="flex gap-2">
            <button
              className="btn btn-primary"
              onClick={async () => {
                const contas = estoqueText.split('\n').map(l => l.trim()).filter(Boolean);
                const res = await fetch(`http://localhost:3000/admin/estoque/${selectedProductId}`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ contas })
                });
                const data = await res.json();
                if (res.ok) {
                  setEstoqueMessage(`✅ ${data.adicionadas} contas adicionadas`);
                  setEstoqueText('');
                } else {
                  setEstoqueMessage(`❌ Erro: ${data.error}`);
                }
              }}
            >
              Enviar Estoque
            </button>
            <button className="btn btn-dark" onClick={() => setSelectedProductId(null)}>Cancelar</button>
          </div>
          {estoqueMessage && <p className="mt-2 text-white">{estoqueMessage}</p>}
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
