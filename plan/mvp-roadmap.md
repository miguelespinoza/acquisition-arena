# MVP Roadmap - Acquisition Arena

## Current Status ✅
**Infrastructure Deployed & Working**
- ✅ Rails API backend deployed to Fly.io (`api-acquisition-arena.crafted.app`)
- ✅ React frontend deployed to Cloudflare Workers (`acquisition-arena.crafted.app`)
- ✅ PostgreSQL database configured and seeded
- ✅ Custom domains configured and working
- ✅ CORS configured for production
- ✅ Environment variables configured (frontend baked at build time)

## Next Steps - Critical MVP Features

### 1. Event Tracking & Observability 📊
**Priority: ✅ COMPLETED**
- **Tools**: PostHog (free tier - 1M events/month) + Rollbar for errors
- **Scope**: Both Rails backend and React frontend
- **Why**: Essential for 20-person pilot - need analytics and error tracking
- **Tasks**:
  - [x] Add PostHog gem to Rails backend and configure
  - [x] Set up PostHog in React frontend (posthog-js already installed)
  - [x] Track key events: signup, invite redemption, session start/end
  - [x] Add Rollbar gem for error monitoring
  - [x] Set up PostHog and Rollbar API keys in production secrets
  - [ ] Test event tracking and error reporting end-to-end

### 2. User Access Control System 🔐
**Priority: HIGH**
- **Goal**: Limit pilot access with simple invite code
- **Implementation**: Hard-coded invite code system (simplified for MVP)
- **Architecture**: Single invite code `"ACQ2025"` that unlimited users can redeem
- **Database**: Uses existing `users.invite_code` and `users.invite_code_redeemed` columns
- **Tasks**:
  - [x] Update `/api/user/validate_invite` endpoint with hard-coded validation
  - [ ] Frontend: Create invite code redemption UI modal
  - [ ] Integration: Show invite modal if user hasn't redeemed code
  - [ ] PostHog tracking: Track invite redemption events
  - [ ] Error handling: Invalid code feedback

### 3. AI Training Session Review 🤖
**Priority: HIGH**
**Status: ✅ IMPLEMENTED**
- **Goal**: Provide AI-generated feedback after each training session
- **Implementation Complete**:
  - [x] Database fields for feedback (score, text, grade)
  - [x] Conversation ID storage from ElevenLabs
  - [x] POST `/api/training_sessions/:id/conversation_ended` endpoint
  - [x] `TrainingSessionFeedbackJob` background job
  - [x] Solid Queue configuration for Fly.io
  - [x] Frontend feedback display with loading state
  - [x] Automatic grade calculation (A+, A, B+, etc.)
  - [x] Markdown-formatted feedback rendering
- **Next Steps**:
  - [x] Add OpenAI API key to production secrets
  - [ ] Test end-to-end feedback generation in production
  - [ ] Monitor job processing performance

### 4. Production API Keys Configuration 🔑
**Priority: HIGH**
- **Required Keys**:
  - `CLERK_SECRET_KEY` (for JWT validation)
  - `ELEVENLABS_API_KEY` (for voice conversations)
  - `OPENAI_API_KEY` (for AI feedback generation)
  - `POSTHOG_API_KEY` (for event tracking)
  - `ROLLBAR_ACCESS_TOKEN` (for error monitoring)
- **Tasks**:
  - [ ] Set Clerk production secret key: `fly secrets set CLERK_SECRET_KEY=sk_live_xxx --app acquisition-arena-prod`
  - [ ] Set ElevenLabs API key: `fly secrets set ELEVENLABS_API_KEY=sk_xxx --app acquisition-arena-prod`
  - [x] Set OpenAI API key: `fly secrets set OPENAI_API_KEY=sk_xxx --app acquisition-arena-prod`
  - [x] Set PostHog API key: `fly secrets set POSTHOG_API_KEY=phc_xxx --app acquisition-arena-prod`
  - [x] Set Rollbar token: `fly secrets set ROLLBAR_ACCESS_TOKEN=xxx --app acquisition-arena-prod`
  - [ ] Test authentication flow end-to-end
  - [ ] Test ElevenLabs conversation creation
  - [ ] Test AI feedback generation
  - [ ] Verify event tracking works in production

### 5. End-to-End User Flow Testing 🧪
**Priority: HIGH**
- **Critical Path**: Signup → Login → Redeem Invite Code → Start Session → Voice Conversation → End Session → Review Feedback
- **Tasks**:
  - [ ] Test complete signup flow with Clerk production
  - [ ] Test invite code redemption flow (ACQ2025)
  - [ ] Verify persona selection works
  - [ ] Test training session creation
  - [ ] Verify ElevenLabs agent creation and conversation startup
  - [ ] Test session completion and data persistence
  - [ ] Verify AI feedback generation works
  - [ ] Test feedback display and grading
  - [ ] Verify session limits are enforced (users get 50 sessions after redemption)
  - [ ] Test PostHog event tracking throughout flow

### 6. Basic Admin Monitoring 📊
**Priority: DEFERRED**
- **Goal**: Monitor pilot usage and user activity
- **Implementation**: Use PostHog dashboards instead of custom admin panel
- **Rationale**: PostHog provides better analytics than custom Rails admin dashboard
- **Optional Future Tasks**:
  - [ ] Create Rails rake task: `admin:stats` for CLI monitoring
  - [ ] PostHog dashboard setup for key metrics

### 7. Performance & Polish 🚀
**Priority: LOW**
- **Tasks**:
  - [ ] Frontend bundle optimization (currently 781KB - consider code splitting)
  - [ ] Add loading states for better UX
  - [ ] Error handling improvements (user-friendly error messages)
  - [ ] Basic SEO (meta tags, favicon)

## Launch Readiness Checklist

### Pre-Launch (Before Sharing Invite Code)
- [x] PostHog event tracking active and tested
- [x] Rollbar error monitoring configured
- [ ] All production API keys configured (missing Clerk & ElevenLabs)
- [ ] Invite code redemption system working (ACQ2025) - **MISSING FRONTEND UI**
- [ ] End-to-end user flow tested including invite redemption
- [ ] PostHog dashboard configured for pilot monitoring

### Launch Day
- [ ] Share single invite code (ACQ2025) with pilot users
- [ ] Monitor error rates in Rollbar
- [ ] Monitor user signups and session usage in PostHog
- [ ] Be available for immediate bug fixes

### Post-Launch (First Week)
- [ ] Daily error monitoring
- [ ] Collect user feedback
- [ ] Monitor session completion rates
- [ ] Track which personas are most popular
- [ ] Document any critical issues for post-pilot improvements

## Success Metrics for Pilot
- **Target**: 15+ users redeem invite code and complete at least 1 session
- **Target**: Average 5+ sessions per active user
- **Target**: <5 critical errors during pilot period
- **Target**: Positive user feedback on voice conversation quality
- **Target**: 80%+ of sessions receive AI feedback successfully
- **Target**: Average feedback score >70/100

## Resources & Dependencies
- **PostHog**: Free tier (1M events/month)
- **Rollbar**: Free tier (5,000 events/month)
- **Fly.io**: Current usage should stay within free allowances for pilot
- **Cloudflare**: Free tier sufficient for pilot traffic
- **ElevenLabs**: Monitor usage during pilot (cost per conversation)
- **Clerk**: Free tier sufficient for pilot users

---

*This roadmap focuses ruthlessly on the minimum features needed for a successful 20-person pilot test. Everything else is deferred until after pilot feedback.*