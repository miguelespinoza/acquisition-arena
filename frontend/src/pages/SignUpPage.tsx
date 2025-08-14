import { SignUp, useAuth } from '@clerk/clerk-react'
import { Navigate, Link } from 'react-router-dom'

export default function SignUpPage() {
  const { isSignedIn } = useAuth()

  if (isSignedIn) {
    return <Navigate to="/" replace />
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Create Account</h1>
          <p className="text-gray-600 mt-2">Sign up to get started</p>
        </div>
        
        <SignUp 
          path="/signup"
          routing="path"
          signInUrl="/login"
          redirectUrl="/"
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "shadow-lg"
            }
          }}
        />
        
        <div className="text-center text-sm">
          <span className="text-gray-600">Already have an account? </span>
          <Link to="/login" className="text-blue-600 hover:text-blue-800 font-medium">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  )
}