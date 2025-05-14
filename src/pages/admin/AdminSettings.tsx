import { useState, useEffect } from 'react';
import { Save, CreditCard, RefreshCw } from 'lucide-react';
import { useAdmin } from '../../hooks/useAdmin';

const AdminSettings = () => {
  const { efiBankSettings, updateEfiBankSettings } = useAdmin();
  const [settings, setSettings] = useState(efiBankSettings);
  const [isSaved, setIsSaved] = useState(false);
  
  // Update local state when settings change
  useEffect(() => {
    setSettings(efiBankSettings);
  }, [efiBankSettings]);
  
  // Handle settings change
  const handleChange = (field: string, value: string | boolean) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
    setIsSaved(false);
  };
  
  // Handle save settings
  const handleSave = () => {
    updateEfiBankSettings(settings);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };
  
  // Generate random API key for testing
  const generateRandomApiKey = () => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const length = 32;
    let result = '';
    
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      result += characters.charAt(randomIndex);
    }
    
    handleChange('apiKey', result);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Configurações</h1>
      
      <div className="bg-bg-light rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
          <CreditCard className="h-5 w-5 text-primary mr-2" />
          Configurações do EFI Bank
        </h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-white font-medium mb-1">
              ID do Comerciante (Merchant ID)
            </label>
            <input
              type="text"
              className="input"
              value={settings.merchantId}
              onChange={(e) => handleChange('merchantId', e.target.value)}
              placeholder="Seu ID de comerciante EFI Bank"
            />
            <p className="text-gray-400 text-sm mt-1">
              Encontre seu Merchant ID no painel do EFI Bank.
            </p>
          </div>
          
          <div>
            <label className="block text-white font-medium mb-1">
              Chave API (API Key)
            </label>
            <div className="flex">
              <input
                type="password"
                className="input rounded-r-none flex-1"
                value={settings.apiKey}
                onChange={(e) => handleChange('apiKey', e.target.value)}
                placeholder="Sua chave API do EFI Bank"
              />
              <button
                onClick={generateRandomApiKey}
                className="btn bg-bg-dark text-white hover:bg-gray-700 rounded-l-none px-3"
                title="Gerar chave aleatória (apenas para testes)"
              >
                <RefreshCw className="h-5 w-5" />
              </button>
            </div>
            <p className="text-gray-400 text-sm mt-1">
              Esta chave é usada para autenticar suas requisições ao EFI Bank.
            </p>
          </div>
          
          <div>
            <label className="block text-white font-medium mb-1">
              URL de Callback
            </label>
            <input
              type="text"
              className="input"
              value={settings.callbackUrl}
              onChange={(e) => handleChange('callbackUrl', e.target.value)}
              placeholder="URL para receber notificações de pagamento"
            />
            <p className="text-gray-400 text-sm mt-1">
              O EFI Bank enviará atualizações de pagamento para esta URL.
            </p>
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="enabled"
              className="h-4 w-4 rounded border-gray-700 bg-bg-dark text-primary focus:ring-primary"
              checked={settings.enabled}
              onChange={(e) => handleChange('enabled', e.target.checked)}
            />
            <label htmlFor="enabled" className="ml-2 text-white">
              Habilitar integração com EFI Bank
            </label>
          </div>
          
          <div className="bg-bg-dark p-4 rounded-lg mt-4">
            <h3 className="text-white font-medium mb-2">Informações Importantes</h3>
            <ul className="text-gray-400 text-sm space-y-2">
              <li>• Em ambiente de produção, configure seu Merchant ID e API Key reais.</li>
              <li>• A URL de callback deve ser acessível publicamente pelo EFI Bank.</li>
              <li>• Para testes, você pode usar o ambiente sandbox do EFI Bank.</li>
              <li>• Habilite a integração apenas quando estiver pronto para processar pagamentos reais.</li>
            </ul>
          </div>
          
          <div className="flex justify-end pt-4">
            <button
              onClick={handleSave}
              className="btn btn-primary flex items-center"
            >
              <Save className="h-5 w-5 mr-2" />
              {isSaved ? 'Configurações Salvas!' : 'Salvar Configurações'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;