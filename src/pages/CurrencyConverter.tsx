import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { RefreshCw, LogOut, ShieldCheck } from 'lucide-react';
import { get } from '../utils/api';

// Interface for backend CurrencyType
interface CurrencyType {
  id: string;
  currency: string; // e.g., "USD", "EUR"
}

// Interface for client-side currency (with symbol and flag)
interface Currency {
  code: string;
  symbol: string;
  flag: string;
}

// Client-side mapping for symbols and flags
const currencyMetaData: Record<string, { symbol: string; flag: string }> = {
  EUR: { symbol: '€', flag: 'https://flagcdn.com/w40/eu.png' },
  USD: { symbol: '$', flag: 'https://flagcdn.com/w40/us.png' },
  BRL: { symbol: 'R$', flag: 'https://flagcdn.com/w40/br.png' },
  GBP: { symbol: '£', flag: 'https://flagcdn.com/w40/gb.png' },
  JPY: { symbol: '¥', flag: 'https://flagcdn.com/w40/jp.png' },
  CAD: { symbol: 'C$', flag: 'https://flagcdn.com/w40/ca.png' },
  AUD: { symbol: 'A$', flag: 'https://flagcdn.com/w40/au.png' },
  CHF: { symbol: 'Fr', flag: 'https://flagcdn.com/w40/ch.png' },
};

interface ConversionHistory {
  id: string;
  userId: string;
  fromCurrency: string;
  toCurrency: string;
  amount: string;
  result: number;
  timestamp: Date;
}

// Updated CurrencySelect component
const CurrencySelect: React.FC<{
  value: string;
  onChange: (value: string) => void;
  label: string;
  currencyTypes: CurrencyType[];
}> = ({ value, onChange, label, currencyTypes }) => {
  const [isOpen, setIsOpen] = useState(false);

  // Find the selected currency's metadata
  console.log(currencyTypes)
  const selectedCurrency = currencyTypes.find((c) => c.currency === value);
  const selectedMeta = selectedCurrency ? currencyMetaData[value] : null;

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <button
        type="button"
        className="w-full px-4 py-3 pl-12 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent text-left relative bg-white"
        onClick={() => setIsOpen(!isOpen)}
        style={{
          backgroundImage: `url(${selectedMeta?.flag})`,
          backgroundPosition: '8px center',
          backgroundRepeat: 'no-repeat',
          backgroundSize: '24px',
        }}
      >
        {selectedCurrency?.currency || 'Select'} - {selectedMeta?.symbol || ''}
      </button>
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
          {currencyTypes.map((currency) => {
            const meta = currencyMetaData[currency.currency] || {
              symbol: '',
              flag: '',
            };
            return (
              <button
                key={currency.id}
                type="button"
                className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center space-x-3"
                onClick={() => {
                  onChange(currency.currency);
                  setIsOpen(false);
                }}
              >
                <img
                  src={meta.flag || 'https://flagcdn.com/w40/xx.png'} // Fallback flag
                  alt={currency.currency}
                  className="w-6 h-4 object-cover"
                />
                <span>
                  {currency.currency} - {meta.symbol || ''}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

const CurrencyConverter = () => {
  const [amount, setAmount] = useState('1');
  const [fromCurrency, setFromCurrency] = useState('EUR');
  const [toCurrency, setToCurrency] = useState('USD');
  const [result, setResult] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [currencyTypes, setCurrencyTypes] = useState<CurrencyType[]>([]);
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getSymbol = (code: string) => {
    return currencyMetaData[code]?.symbol || '';
  };

  const convertCurrency = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `https://api.exchangerate-api.com/v4/latest/${fromCurrency}`
      );
      const data = await response.json();
      const rate = data.rates[toCurrency];
      const convertedResult = parseFloat(amount) * rate;
      setResult(convertedResult);

      const history: ConversionHistory = {
        id: Math.random().toString(36).substr(2, 9),
        userId: user?.email || 'anonymous',
        fromCurrency,
        toCurrency,
        amount,
        result: convertedResult,
        timestamp: new Date(),
      };

      const existingHistory = JSON.parse(localStorage.getItem('conversionHistory') || '[]');
      localStorage.setItem('conversionHistory', JSON.stringify([history, ...existingHistory]));
    } catch (error) {
      console.error('Error fetching exchange rate:', error);
    }
    setLoading(false);
  };

  // Fetch currency types
  useEffect(() => {
    const fetchCurrencyTypes = async () => {
      setFetchLoading(true);
      try {
        const data = await get<CurrencyType[]>('/currency/types');
        setCurrencyTypes(data);
        // Set default currencies if data is available
        /*if (data.length > 0) {
          setFromCurrency(data[0].name);
          setToCurrency(data[1]?.name || data[0].name);
        }*/
      } catch (error) {
        setFetchError(error.message || 'Failed to fetch currency types');
        console.error('Fetch currency types failed:', error);
      } finally {
        setFetchLoading(false);
      }
    };
    fetchCurrencyTypes();
  }, []);

  // Trigger conversion when inputs change
  useEffect(() => {
    if (fromCurrency && toCurrency && amount && currencyTypes.length > 0) {
      convertCurrency();
    }
  }, [fromCurrency, toCurrency, amount, currencyTypes]);

  // Handle click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.currency-select')) {
        setCurrencyTypes((prev) =>
          prev.map((c) => ({ ...c, isOpen: false }))
        );
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-500 to-blue-600 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          {user?.isAdmin && (
            <button
              onClick={() => navigate('/admin')}
              className="flex items-center gap-2 bg-white/10 text-white px-4 py-2 rounded-lg hover:bg-white/20 transition duration-200"
            >
              <ShieldCheck className="h-5 w-5" />
              Admin Dashboard
            </button>
          )}
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
            Currency Converter
          </h1>
          {fetchLoading && <p className="text-center">Loading currencies...</p>}
          {fetchError && <p className="text-center text-red-500">Error: {fetchError}</p>}
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
            </div>
            <div className="flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl font-bold text-gray-800 mb  mb-4">
                  {loading ? (
                    <RefreshCw className="h-16 w-16 animate-spin text-green-500 mx-auto" />
                  ) : (
                    <span>
                      {getSymbol(toCurrency)}
                      {result?.toFixed(2)}
                    </span>
                  )}
                </div>
                <p className="text-xl text-gray-600">
                  {getSymbol(fromCurrency)}
                  {amount} {fromCurrency} = {getSymbol(toCurrency)}
                  {result?.toFixed(2)} {toCurrency}
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