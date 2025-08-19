import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useEffect } from 'react'
import LoginPage from './pages/LoginPage'
import SignUpPage from './pages/SignUpPage'
import HomePage from './pages/HomePage'
import CreateSessionPage from './pages/CreateSessionPage'
import SessionPage from './pages/SessionPage'
import ProtectedRoute from './components/ProtectedRoute'
import PrototypeHome001 from './prototypes/prototype-001/PrototypeHome001'
import { useLoggerUser, initializePostHog } from './lib/logger'

function App() {
  const isDevelopment = import.meta.env.MODE === 'development'
  
  // Initialize PostHog and set up global user tracking
  useEffect(() => {
    initializePostHog()
  }, [])
  
  // This hook will automatically identify users when they log in/out
  useLoggerUser()

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/login/*" element={<LoginPage />} />
          <Route path="/signup/*" element={<SignUpPage />} />
          <Route 
            path="/" 
            element={<HomePage />} 
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
          
          {isDevelopment && (
            <Route 
              path="/prototype-001" 
              element={
                <ProtectedRoute>
                  <PrototypeHome001 />
                </ProtectedRoute>
              } 
            />
          )}
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
