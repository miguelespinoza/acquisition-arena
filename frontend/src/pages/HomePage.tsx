import { SignedIn, SignedOut } from '@clerk/clerk-react'
import AppPage from './AppPage'
import MarketingPage from './MarketingPage'

export default function HomePage() {
  return (
    <>
      <SignedOut>
        <MarketingPage />
      </SignedOut>
      <SignedIn>
        <AppPage />
      </SignedIn>
    </>
  )
}