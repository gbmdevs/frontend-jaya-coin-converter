import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext'; 
import { Toaster } from 'react-hot-toast';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Signup from './pages/Signup';
import AdminDashboard from './pages/AdminDashboard';
import CurrencyConverter from './pages/CurrencyConverter';
function App() {

  return ( 
     <AuthProvider>
        <Router>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
          }}
        />
           <Routes>
               <Route path="/login"  element={<Login />} />
               <Route path="/signup" element={<Signup />} />
               <Route path="/admin"  element={<AdminDashboard />} />
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
