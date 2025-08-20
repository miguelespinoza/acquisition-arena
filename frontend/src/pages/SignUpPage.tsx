import { SignUp } from '@clerk/clerk-react'

export default function SignUpPage() {

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Create Account</h1>
          <p className="text-gray-600 mt-2">Sign up to get started</p>
        </div>
        
        <SignUp
          routing="hash"
          signInUrl="/login"
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