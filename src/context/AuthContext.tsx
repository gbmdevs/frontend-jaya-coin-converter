import React, { createContext, useContext, useState, ReactNode } from 'react';
import { post } from "../utils/api";

interface User {
    email: string;
    isAdmin: boolean;
 }
 
interface LoginResponse {
    token: string;
}


interface AuthContextType {
    isAuthenticated: boolean;
    user: User | null;
    login: (email: string, password: string) => void;
    signup: (email: string, password: string) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    console.log(context)
    if (!context) {
      throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(true);
    const [user, setUser] = useState<User | null>(null);
   
  
    const login = async (email: string, password: string) => { 
        try{
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


  const signup = (email: string, password: string) => {
    // In a real app, you would create an account in the backend
    setIsAuthenticated(true);
    setUser({
      email,
      isAdmin: false
    });
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};