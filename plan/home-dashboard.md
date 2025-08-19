# Home Dashboard Implementation Plan

## Overview
Update the prototype home dashboard (PrototypeHome001) with proper session tracking, user personalization, and real API integration.

## Current State Analysis

### What's Working:
- **Frontend Hook**: `useElevenLabsConversation` already tracks session metrics including:
  - Start time and duration
  - Message count
  - User/AI speaking time
- **Backend**: `end_conversation` endpoint exists and accepts `elevenlabs_conversation_id`
- **Grading System**: `feedback_grade` is calculated from `feedback_score` in `TrainingSessionBlueprint`
- **Clerk Integration**: User's `firstName` is available via `useUser()` hook

### What's Missing:
1. **Session Duration**: Not persisted to database when conversation ends
2. **API Endpoint**: No endpoint to fetch completed training sessions
3. **User Name**: Not stored in Rails User model

## Implementation Tasks

### 1. Backend: Capture Session Duration
**File**: `app/controllers/api/training_sessions_controller.rb`
- Update `end_conversation` method to accept and store `session_duration`
- Duration is already tracked in frontend's `metrics.duration`

### 2. Backend: Add User Name Fields
**Migration**: Add first_name and last_name to users table
```ruby
add_column :users, :first_name, :string
add_column :users, :last_name, :string
```

**File**: `app/controllers/concerns/secured.rb`
- Update user creation/sync to pull name from Clerk JWT
- Store `first_name` and `last_name` on User record

### 3. Backend: Create Sessions Index Endpoint
**File**: `app/controllers/api/training_sessions_controller.rb`
- Modify existing `index` action to:
  - Filter by status (completed sessions only)
  - Order by created_at DESC
  - Include persona and parcel associations

### 4. Frontend: Update Session End Hook
**File**: `frontend/src/hooks/useElevenLabsConversation.ts`
- Pass `session_duration` when calling `end_conversation`:
  ```typescript
  await apiClient.post(`/training_sessions/${trainingSessionId}/end_conversation`, {
    elevenlabs_conversation_id: conversationIdRef.current,
    session_duration: Math.floor(metrics.duration / 1000) // Convert to seconds
  })
  ```

### 5. Frontend: Create API Service
**File**: `frontend/src/services/trainingSessionService.ts` (new)
- Create service to fetch completed training sessions
- Include proper typing with TrainingSession interface

### 6. Frontend: Update PrototypeHome001
**File**: `frontend/src/pages/PrototypeHome001.tsx` (rename from PrototypeHome.tsx)
- Replace mock data with real API call
- Update section title to "Training Sessions"
- Use user's actual first name from Clerk
- Add loading and error states

### 7. Frontend: Update Route
**File**: `frontend/src/App.tsx`
- Import `PrototypeHome001` instead of `PrototypeHome`
- Keep development-only guard

## API Response Structure
The existing `TrainingSessionBlueprint` already provides:
- All session fields including calculated `feedback_grade`
- Associated persona (with name, avatar_url, description)
- Associated parcel (with parcel_number, city, state)

## User Experience Improvements
1. **Personalized Greeting**: "Welcome back, [firstName]!"
2. **Real Statistics**: Calculate from actual completed sessions
3. **Session Cards**: Display real data with proper formatting
4. **Empty State**: Show helpful message when no sessions exist

## Security Considerations
- Keep prototype routes development-only
- Ensure users can only see their own sessions
- Validate session_duration to prevent manipulation

## Testing Plan
1. Complete a training session and verify duration is captured
2. Check that completed sessions appear in dashboard
3. Verify statistics calculations are accurate
4. Test empty state for new users
5. Confirm development-only route protection works