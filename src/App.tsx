import  React  from 'react' 
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext'; 
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import CurrencyConverter from './pages/CurrencyConverter';
function App() {

  return ( 
     <AuthProvider>
        <Router>
           <Routes>
               <Route path="/login" element={<Login />} />
               <Route path="/converter"
                 element={
                   <ProtectedRoute>
                       <CurrencyConverter />
                  </ProtectedRoute>
                }
              />
               <Route path="/" element={<Navigate to="/login" replace />} />
           </Routes>
        </Router>
    </AuthProvider>
  )
}

export default App
