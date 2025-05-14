import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../hooks/useCart';
import { useProducts } from '../hooks/useProducts';

const CheckoutPage = () => {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [pixData, setPixData] = useState<any>(null);
  const [status, setStatus] = useState<'aguardando' | 'pago' | null>(null);

  const { cartItems, getCartTotal } = useCart();
  const { products } = useProducts();
  const navigate = useNavigate();

  const validateEmail = () => {
    if (!email) {
      setEmailError('O email é obrigatório');
      return false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError('Email inválido');
      return false;
    }
    setEmailError('');
    return true;
  };

  const handlePayment = async () => {
    if (!validateEmail()) return;
    setIsProcessing(true);

    const enrichedItems = cartItems.map((item) => {
      const product = products.find(p => p.id === item.productId);
      return {
        id: item.productId,
        nome: product?.name || 'Produto',
        preco: product?.price || 0,
        quantidade: item.quantity
      };
    });

    try {
      const response = await fetch('http://localhost:3000/create-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, items: enrichedItems })
      });

      if (!response.ok) {
        const errData = await response.json();
        alert(`Erro: ${errData.error} - ${errData.details || ''}`);
        setIsProcessing(false);
        return;
      }

      const data = await response.json();
      setPixData(data);
      setStatus('aguardando');

      const interval = setInterval(async () => {
        try {
          const res = await fetch(`http://localhost:3000/download/${data.id}`);
          if (res.status === 200) {
            clearInterval(interval);
            setStatus('pago');

            const blob = await res.blob();
            const contentDisposition = res.headers.get("Content-Disposition");
            let fileName = "arquivo.txt";

            if (contentDisposition) {
              const match = contentDisposition.match(/filename="?(.+?)"?$/);
              if (match && match[1]) {
                fileName = match[1];
              }
            }

            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);

            navigate('/');
          }
        } catch (err) {
          // pagamento ainda não confirmado
        }
      }, 5000);
    } catch (err) {
      console.error('Erro ao processar pagamento:', err);
      alert('Erro ao processar pagamento.');
    }

    setIsProcessing(false);
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);

  return (
    <div className="max-w-md mx-auto mt-10 p-4 border rounded">
      <h1 className="text-2xl font-bold mb-4">Finalizar Compra</h1>

      <div className="mb-4">
        <label className="block font-medium mb-1">E-mail</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 border rounded"
        />
        {emailError && <p className="text-red-500 text-sm mt-1">{emailError}</p>}
      </div>

      <div className="mb-4">
        <h2 className="font-semibold mb-2">Resumo</h2>
        {cartItems.map((item, index) => {
          const product = products.find(p => p.id === item.productId);
          return (
            <div key={index} className="flex justify-between">
              <span>{product?.name || 'Produto'}</span>
              <span>{formatPrice(product?.price || 0)}</span>
            </div>
          );
        })}
        <div className="flex justify-between font-bold mt-2">
          <span>Total</span>
          <span>{formatPrice(getCartTotal())}</span>
        </div>
      </div>

      {!pixData && (
        <button
          onClick={handlePayment}
          disabled={isProcessing}
          className="w-full py-2 px-4 bg-green-600 text-white rounded hover:bg-green-700"
        >
          {isProcessing ? 'Processando...' : 'Pagar com Pix'}
        </button>
      )}

      {pixData && (
        <div className="mt-6 text-center">
          <h2 className="text-lg font-semibold mb-2">Escaneie o QR Code ou copie o código:</h2>
          <img
            src={pixData.qr_image}
            alt="QR Code Pix"
            className="mx-auto mb-2 border rounded"
          />
          <p className="break-words bg-gray-100 p-2 rounded text-sm">
            {pixData.qr_code}
          </p>
          {status === 'aguardando' && <p className="mt-2 text-yellow-600">Aguardando pagamento...</p>}
          {status === 'pago' && <p className="mt-2 text-green-600 font-bold">Pagamento confirmado!</p>}
        </div>
      )}
    </div>
  );
};

export default CheckoutPage;