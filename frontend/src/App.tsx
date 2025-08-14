import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import LoginPage from './pages/LoginPage'
import SignUpPage from './pages/SignUpPage'
import AppPage from './pages/AppPage'
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
        </Routes>
      </div>
    </Router>
  )
}

export default App
