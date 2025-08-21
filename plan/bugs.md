# Bugs

## High Priority

### 1. Double Email Verification on Signup
- **Issue**: When a user signs up, the page re-renders causing the email verification code to be sent twice
- **Location**: Clerk SignUp component routing configuration in `@frontend/src/pages/SignUpPage.tsx`
- **Root Cause**: Using `routing="path"` caused React Router to interfere with Clerk's internal routing, triggering component re-renders during email verification flow
- **Fix**: Changed SignUp component to use `routing="hash"` and removed `path="/signup"` prop to let Clerk handle its own internal routing without React Router interference
- **Impact**: Users receive duplicate verification emails, potential confusion
- **Status**: ✅ Fixed

### 2. Backend Crash on Session End
- **Issue**: When "End session" button is pressed in `@frontend/src/pages/SessionPage.tsx`, there's a crash in the backend because `session_duration_in_seconds` is receiving a non-number value
- **Root Cause**: Early session termination prevented ElevenLabs from generating proper transcript/duration data, causing validation errors when trying to save invalid duration values
- **Solution**: Removed the "End Session" button entirely. Sessions now only end naturally when conversations conclude or timeout, ensuring proper transcript generation and feedback
- **Location**: 
  - Frontend: `@frontend/src/pages/SessionPage.tsx` - Removed early termination functionality
  - Backend: `TrainingSessionFeedbackJob` validation error resolved by eliminating the early end scenario
- **Impact**: Users can no longer terminate sessions early, but this ensures every session provides value through feedback
- **Status**: ✅ Fixed

## Medium Priority

### 3. Persona Characteristics Display Issue  
- **Issue**: PersonaCards showing characteristics as "[object Object]" instead of actual values
- **Location**: 
  - `@frontend/src/pages/CreateSessionPage.tsx` line 171-178
  - `@frontend/src/pages/SessionPage.tsx` line 424-431
- **Fix**: Added type checking to display key name for objects instead of `String(value)`
- **Status**: ✅ Fixed

### 4. Session Duration Showing as N/A
- **Issue**: DashboardSessionCard showing Duration as "N/A" instead of actual session duration
- **Root Cause**: Field name mismatch between backend (`session_duration_in_seconds`) and frontend (`sessionDuration`)
- **Location**: 
  - `@frontend/src/types/training-session.ts` line 11
  - `@frontend/src/components/DashboardSessionCard.tsx` line 86
- **Fix**: Updated frontend type and component to use `sessionDurationInSeconds` to match backend field name
- **Status**: ✅ Fixed

## Low Priority

---

*This file tracks bugs discovered during development and testing of the Acquisition Arena MVP.*