import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import LoginPage from './pages/LoginPage'
import SignUpPage from './pages/SignUpPage'
import AppPage from './pages/AppPage'
import CreateSessionPage from './pages/CreateSessionPage'
import SessionPage from './pages/SessionPage'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/login/*" element={<LoginPage />} />
          <Route path="/signup/*" element={<SignUpPage />} />
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <AppPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/create-session" 
            element={
              <ProtectedRoute>
                <CreateSessionPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/session/:id" 
            element={
              <ProtectedRoute>
                <SessionPage />
              </ProtectedRoute>
            } 
          />
        </Routes>
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
      </div>
    </Router>
  )
}

export default App
