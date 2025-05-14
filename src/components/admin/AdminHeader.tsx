import { useAuth } from '../../hooks/useAuth';

const AdminHeader = () => {
  const { user } = useAuth();
  
  return (
    <header className="bg-bg-light py-4 px-6 border-b border-gray-700">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold text-white">Painel Administrativo</h1>
        
        <div className="flex items-center">
          <div className="text-white">
            <span className="text-gray-400 mr-2">Olá,</span>
            <span className="font-medium">{user?.name}</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;