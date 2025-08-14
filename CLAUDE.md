# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Architecture Overview

This is a monorepo containing a voice-based roleplay trainer for land investors practicing acquisition calls:

### Backend (Rails 8 API)
- **Authentication**: Clerk-based JWT authentication with automatic user creation
- **Core Models**: User (with session limits), Persona (AI seller personalities), Parcel (property details), TrainingSession (conversation records)  
- **API Serialization**: Uses Blueprinter for JSON responses with OJ for performance
- **Modern Rails Stack**: Solid Queue/Cache/Cable, API-only mode with CORS configured
- **ElevenLabs Integration**: Generates session tokens for voice conversations (placeholder implementation in place)

### Frontend (React + TypeScript)
- **Framework**: React 19 with Vite, TypeScript, Tailwind CSS 4
- **Auth Flow**: Clerk React SDK with protected routes and JWT tokens
- **API Communication**: Axios-based service with typed interfaces
- **Voice Integration**: ElevenLabs React SDK for WebRTC voice conversations

### Key Architectural Patterns
- **Authentication Flow**: JWT tokens from Clerk frontend → Rails backend validates via Clerk SDK → auto-creates User records
- **Session Management**: Users have limited sessions, TrainingSession tracks conversation state (pending → active → completed)
- **Voice Integration**: Frontend requests ElevenLabs tokens from Rails → establishes WebRTC connection → AI persona responds based on system prompts built from Persona + Parcel data

## Essential Commands

### Backend Development
```bash
rails server                    # Start API server (localhost:3000)
rails console                   # Interactive console
rails db:migrate                # Run pending migrations
rails db:seed                   # Populate with sample data
rails test                      # Run all tests
rails test test/models/user_test.rb  # Run single test file
bundle exec brakeman            # Security analysis
bundle exec rubocop             # Code style check
```

### Frontend Development
```bash
cd frontend
npm run dev                     # Start React app (localhost:5173)
npm run build                   # Production build
npm run lint                    # ESLint check
npm run preview                 # Preview production build
```

### Deployment
```bash
bin/kamal setup                 # Initial deployment setup
bin/kamal deploy               # Deploy application
bin/kamal console              # Access Rails console on server
bin/kamal logs                 # View application logs
```

## Development Notes

### Environment Configuration
- Backend: `.env` in root with `CLERK_SECRET_KEY`, `ELEVENLABS_API_KEY`, `DATABASE_URL`
- Frontend: `.env` in `/frontend` with `VITE_CLERK_PUBLISHABLE_KEY`

### Authentication Implementation
- All API endpoints require authentication via `ApplicationController`
- The `Secured` concern handles Clerk JWT verification and automatic User creation
- Frontend uses Clerk's `useAuth()` hook and passes tokens to API calls

### ElevenLabs Integration Status
- Current implementation generates placeholder tokens in `ElevenlabsController`
- System prompts are built dynamically from Persona characteristics and Parcel details
- Ready for actual ElevenLabs API integration (see TODO comments)

### Database Schema Key Points
- Users are created automatically on first API request using Clerk user ID
- TrainingSession status flow: `pending` → `active` → `completed`/`failed`
- Personas and Parcels store JSON characteristics/features for AI prompt generation