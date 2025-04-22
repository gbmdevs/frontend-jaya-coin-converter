import React, { createContext, useContext, useState, ReactNode } from 'react';
import { post } from "../utils/api";
 
interface LoginResponse {
    token: string;
}

interface SignResponse {
  email: string;
  name: string;
}

interface AuthContextType {
    isAuthenticated: boolean; 
    login: (email: string, password: string) => void; 
    signup: (email: string, password: string,name: string) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
    const context = useContext(AuthContext); 
    if (!context) {
      throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(true); 
   
  
    const login = async (email: string, password: string) => { 
        try{
          console.log("entrou no context login")
        const response = await post<LoginResponse>("/auth/login", {
            email,
            password,
          }); 
        localStorage.setItem("token", response.token);
        setIsAuthenticated(true)
        }catch(error){
            console.log(error)
        }
    };

  const signup = async (email: string, password: string, name: string) => { 
    try{
      const response = await post<SignResponse>('auth/signup',{
        email: email,
        password: password,
        name: name
      })
      console.log(response)
      setIsAuthenticated(true)
    }catch(error){

    }
  };

  const logout = () => {
    localStorage.removeItem("token")
    setIsAuthenticated(false); 
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login,signup,logout }}>
      {children}
    </AuthContext.Provider>
  );
};