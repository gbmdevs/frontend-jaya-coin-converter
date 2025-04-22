import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { RefreshCw, LogOut, ShieldCheck } from 'lucide-react';
import { get, postData } from '../utils/api';
 

interface Currency {
  code: string;
  symbol: string;
  flag: string;
}

interface CurrencyType {
  id: string;
  currency: string;  
  country: string;
  symbol: string;
}

const currencies: Currency[] = [
  { code: 'EUR', symbol: '€', flag: 'https://flagcdn.com/w40/eu.png' },
  { code: 'USD', symbol: '$', flag: 'https://flagcdn.com/w40/us.png' },
  { code: 'BRL', symbol: 'R$', flag: 'https://flagcdn.com/w40/br.png' },
  { code: 'GBP', symbol: '£', flag: 'https://flagcdn.com/w40/gb.png' },
  { code: 'JPY', symbol: '¥', flag: 'https://flagcdn.com/w40/jp.png' },
  { code: 'CAD', symbol: 'C$', flag: 'https://flagcdn.com/w40/ca.png' },
  { code: 'AUD', symbol: 'A$', flag: 'https://flagcdn.com/w40/au.png' },
  { code: 'CHF', symbol: 'Fr', flag: 'https://flagcdn.com/w40/ch.png' },
];

interface ConversionSearch {
  transcationId: string; 
  valueOrigin: number;
  valueDestiny: number;
}

const CurrencySelect: React.FC<{
  value: string;
  onChange: (value: string) => void;
  label: string;
  currencyTypes: CurrencyType[];
}> = ({ value, onChange, label, currencyTypes  }) => {
  const [isOpen, setIsOpen] = useState(false); 
  const selectedCurrency = currencyTypes.find(c => c.currency === value);

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <button
        type="button"
        className="w-full px-4 py-3 pl-12 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent text-left relative bg-white"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          backgroundImage: `url(/assets/flags/${selectedCurrency?.currency}.png)`,
          backgroundPosition: '8px center',
          backgroundRepeat: 'no-repeat',
          backgroundSize: '24px'
        }}
      >
        {selectedCurrency?.currency} -  {selectedCurrency?.symbol} 
      </button>
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
          {currencyTypes.map((currency) => (
            <button
              key={currency.currency}
              type="button"
              className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center space-x-3"
              onClick={() => {
                onChange(currency.currency);
                setIsOpen(false);
              }}
            >
              {<img
                src={`/assets/flags/${currency.currency}.png`}
                alt={currency.currency}
                className="w-6 h-4 object-cover"
              />}
              <span>{currency.currency} - {currency.symbol}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const CurrencyConverter = () => {
  const [amount, setAmount] = useState('1');
  const [fromCurrency, setFromCurrency] = useState('EUR');
  const [toCurrency, setToCurrency] = useState('USD'); 
  const [loading, setLoading] = useState(false); 
  const [currencyTypes, setCurrencyTypes] = useState<CurrencyType[]>([]);
  const [currentConversion,setCurrentConversion] = useState<ConversionSearch>();
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getSymbol = (code: string) => {
    return currencies.find(c => c.code === code)?.symbol || '';
  };

  const convertCurrency = async () => {
    setLoading(true);
    try {
      const convertResponse = await postData<ConversionSearch>('/currency/search',{
        currencyOrigin: fromCurrency,
        currencyDestiny: toCurrency,
        amount: amount
      });
    
      const conversion: ConversionSearch = {
        transcationId: convertResponse.transcationId,
        valueOrigin: convertResponse.valueOrigin,
        valueDestiny: convertResponse.valueDestiny
      }

      setCurrentConversion(conversion) 
    } catch (error) {
      console.error('Error fetching exchange rate:', error);
    }
    setLoading(false);
  };

  useEffect(() => { 
  }, [fromCurrency, toCurrency, amount]);

  useEffect(() => {
    const fetchCurrencyTypes = async () => { 
      try {
        const data = await get<CurrencyType[]>('/currency/types');
        console.log("Retorno API"+data)
        setCurrencyTypes(data); 
        if(data.length > 0){
          setFromCurrency(data[0].currency);
        }
      } catch (error) {
        console.error('Fetch currency types failed:', error);
      } finally { 
      }
    };
    fetchCurrencyTypes();
  }, []);
 
  useEffect(() => {
    const handleClickOutside = () => {
      const selects = document.querySelectorAll('.currency-select');
      selects.forEach(select => select.classList.remove('open'));
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-500 to-blue-600 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">          
            <button
              onClick={() => navigate('/admin')}
              className="flex items-center gap-2 bg-white/10 text-white px-4 py-2 rounded-lg hover:bg-white/20 transition duration-200"
            >
              <ShieldCheck className="h-5 w-5" />
              Admin Dashboard
            </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-white/10 text-white px-4 py-2 rounded-lg hover:bg-white/20 transition duration-200"
          >
            <LogOut className="h-5 w-5" />
            Logout
          </button>
        </div>
        <div className="bg-white rounded-xl shadow-2xl p-8">
          <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
            Currency Converter - Jaya
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
                <div className="relative">
                  <span className="absolute left-4 top-3 text-gray-500">
                    {getSymbol(fromCurrency)}
                  </span>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-4 py-3 pl-8 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    min="0"
                    step="any"
                  />
                </div>
              </div>
              <CurrencySelect
                value={fromCurrency}
                onChange={setFromCurrency}
                label="From"
                currencyTypes={currencyTypes}
              />
              <CurrencySelect
                value={toCurrency}
                onChange={setToCurrency}
                label="To"
                currencyTypes={currencyTypes}
              />
              <button
                onClick={convertCurrency}
                className="w-full bg-green-500 text-white py-3 rounded-lg font-semibold hover:bg-green-600 transition duration-200 flex items-center justify-center gap-2"
                disabled={loading}
              >
                {loading ? (
                  <RefreshCw className="h-5 w-5 animate-spin" />
                ) : (
                  'Converter'
                )}
              </button>
            </div>

            <div className="flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl font-bold text-gray-800 mb-4">
                  {loading ? (
                    <RefreshCw className="h-16 w-16 animate-spin text-green-500 mx-auto" />
                  ) : (
                    <span>
                       {getSymbol(toCurrency)} {currentConversion?.valueDestiny.toFixed(2)}
                    </span>
                  )}
                </div>
                <p className="text-xl text-gray-600">
                   {getSymbol(fromCurrency)} {currentConversion?.valueOrigin} = {getSymbol(toCurrency)} {currentConversion?.valueDestiny.toFixed(2)} 
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CurrencyConverter;