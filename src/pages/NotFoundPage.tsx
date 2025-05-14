import { Link } from 'react-router-dom';
import { Home, AlertTriangle } from 'lucide-react';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-bg-dark flex flex-col items-center justify-center p-4">
      <AlertTriangle className="h-20 w-20 text-primary mb-6" />
      <h1 className="text-4xl font-bold text-white mb-4">404</h1>
      <p className="text-xl text-white mb-2">Página não encontrada</p>
      <p className="text-gray-400 text-center max-w-md mb-8">
        A página que você está procurando não existe ou foi removida.
      </p>
      <Link 
        to="/" 
        className="btn btn-primary flex items-center"
      >
        <Home className="h-5 w-5 mr-2" />
        Voltar para Início
      </Link>
    </div>
  );
};

export default NotFoundPage;