import { SignIn, useAuth } from '@clerk/clerk-react'
import { Navigate } from 'react-router-dom'

export default function LoginPage() {
  const { isSignedIn } = useAuth()

  if (isSignedIn) {
    return <Navigate to="/" replace />
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Welcome Back</h1>
          <p className="text-gray-600 mt-2">Sign in to your account</p>
        </div>
        
        <SignIn 
          path="/login"
          routing="path"
          signUpUrl="/signup"
          redirectUrl="/"
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "shadow-lg"
            }
          }}
        />
        
      </div>
    </div>
  )
}