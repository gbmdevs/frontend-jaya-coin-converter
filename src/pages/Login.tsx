import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => { 
        e.preventDefault(); 
        await login(email,password);
        navigate("/converter")
      };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl p-8 w-full max-w-md">
            <div className="flex items-center justify-center mb-8">
              <LogIn className="h-12 w-12 text-blue-500" />
            </div>
            <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">Conversor JAYA Dev</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Digite seu email"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Senha</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Digite sua senha"
                  required
                />
              </div>
              <button
                type="submit"
                className="w-full bg-blue-500 text-white py-3 rounded-lg font-semibold hover:bg-blue-600 transition duration-200"
              >
                Acessar
              </button>
            </form>
            <p className="text-center mt-6 text-gray-600">
              Não possui conta? {' '}
              <Link to="/signup" className="text-blue-500 hover:text-blue-600 font-semibold">
                Cadastre-se
              </Link>
            </p>
          </div>
        </div>
      );
    };

export default Login;