import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { get } from '../utils/api';
import toast from 'react-hot-toast';

interface ConversionHistory {
  id: string;
  userId: string;
  currencyOrigin: string;
  valueOrigin: number;
  currencyDestiny: string;
  valueDestiny: number;
  taxConversion: number;
  dateOperation: string;
}

const ITEMS_PER_PAGE = 10;

const AdminDashboard = () => {
  const [history, setHistory] = useState<ConversionHistory[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const { logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    findAllHistoricMoviment() 
  }, []);

  const findAllHistoricMoviment = async () =>{
      try{
        const response = await get<ConversionHistory[]>('/currency/historic') 
        console.log(response)
        setHistory(response)
      }catch(error){
        toast.error("Failed to load historic moviment.")
      } 
  }

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const filteredHistory = history.filter(item =>
    item.userId.toLowerCase().includes(searchTerm.toLowerCase())  
  );

  const totalPages = Math.ceil(filteredHistory.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedHistory = filteredHistory.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <button
            onClick={() => navigate('/converter')}
            className="flex items-center gap-2 bg-white/10 text-white px-4 py-2 rounded-lg hover:bg-white/20 transition duration-200"
          >
            <ChevronLeft className="h-5 w-5" />
            Tela de Conversão
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-white/10 text-white px-4 py-2 rounded-lg hover:bg-white/20 transition duration-200"
          >
            <LogOut className="h-5 w-5" />
            Desconectar
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-2xl p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-8">Histórico de Conversão</h1>

          <div className="mb-6 relative">
            <input
              type="text"
              placeholder="Search by user or currency..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 pl-12 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <Search className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transação ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuario ID</th> 
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Moeda Origem</th> 
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor Origem</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Moeda Destino</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor Destino</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Taxa Conversão</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Data Operação</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedHistory.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.userId}</td> 
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">              
                      {<img  src={`/assets/flags/${item.currencyOrigin}.png`}
                             alt={item.currencyOrigin}
                             className="w-6 h-4 object-cover" />}{item.currencyOrigin}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.valueOrigin.toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {<img  src={`/assets/flags/${item.currencyDestiny}.png`}
                             alt={item.currencyDestiny}
                             className="w-6 h-4 object-cover" />}{item.currencyDestiny}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.valueDestiny.toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.taxConversion}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{new Date(item.dateOperation).toLocaleString()}</td>                     
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex justify-between items-center mt-6">
              <button
                onClick={() => setCurrentPage(page => Math.max(1, page - 1))}
                disabled={currentPage === 1}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                <ChevronLeft className="h-5 w-5" />
                Previous
              </button>
              <span className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(page => Math.min(totalPages, page + 1))}
                disabled={currentPage === totalPages}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;