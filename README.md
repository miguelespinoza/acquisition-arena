# Acquisition Roleplay Trainer

A web-based tool for land investors to practice acquisition calls with conversational AI. It simulates seller conversations, injects realistic objections, and provides feedback to help users gain confidence before speaking with real sellers.

## Product Overview

### Core Features
- **Voice-based Roleplay**: Two-way audio conversation between the user and an AI "seller"
- **Custom Seller Personas**: Adjustable property details, seller motivation, and objection patterns
- **Authentication & User Management**: Clerk-powered login/signup for secure access
- **Session Management**: Usage tracking and limits for free-tier users
- **Optional Post-Call Feedback**: AI-generated performance grading

### Target Users
- Land investors learning acquisition calls
- Community members seeking practice tools

## Tech Stack

### Monorepo Structure
This is a monorepo containing both the Rails API backend and React frontend.

### Frontend (`/frontend`)
- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite 7.x
- **Styling**: Tailwind CSS 4.x
- **Auth**: Clerk React SDK
- **Voice**: ElevenLabs React SDK
- **HTTP Client**: Axios
- **Routing**: React Router DOM
- **UI Components**: Custom components with class-variance-authority
- **Analytics**: PostHog

### Backend (Rails API)
- **Framework**: Ruby on Rails 8.0 (API mode)
- **Database**: PostgreSQL with pg gem
- **Server**: Puma
- **Auth**: Clerk Ruby SDK with JWT
- **Serialization**: Blueprinter with OJ JSON
- **CORS**: Rack-CORS configured
- **Background Jobs**: Solid Queue
- **Caching**: Solid Cache
- **Cable**: Solid Cable

### Development & Deployment
- **Containerization**: Docker with Dockerfile
- **Deployment**: Kamal for deployment orchestration
- **Environment**: dotenv-rails for local development
- **Code Quality**: RuboCop Rails Omakase, Brakeman security analysis

## Development Setup

### Prerequisites
- Ruby 3.x
- Node.js 18+
- PostgreSQL
- Docker (for deployment)

### Root Project Setup

1. Install backend dependencies:
```bash
bundle install
```

2. Set up database:
```bash
rails db:create
rails db:migrate
rails db:seed
```

3. Configure environment variables (create `.env` in root):
```bash
# Rails backend environment variables
CLERK_SECRET_KEY=your_clerk_secret_key
ELEVENLABS_API_KEY=your_elevenlabs_api_key
GROK_API_KEY=your_grok_api_key
DATABASE_URL=your_postgres_connection_string
```

4. Start the Rails server:
```bash
rails server
# Server runs on http://localhost:3000
```

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables (create `.env` in `/frontend`):
```bash
# React frontend environment variables
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
```

4. Start development server:
```bash
npm run dev
# Frontend runs on http://localhost:5173
```

## Repository Structure

```
acquisition-arena/
├── app/                    # Rails API backend
│   ├── controllers/api/    # API controllers
│   ├── models/            # Data models (User, Persona, Parcel, TrainingSession)
│   └── blueprints/        # JSON serializers
├── frontend/              # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   └── lib/           # Utilities and API client
│   └── dist/              # Built frontend assets
├── config/                # Rails configuration
├── db/                    # Database migrations and schema
└── test/                  # Rails tests
```

## Deployment

### Using Kamal (Current Setup)

This project uses Kamal for deployment orchestration with Docker containers.

1. Configure deployment settings in `config/deploy.yml`
2. Set up your deployment secrets in `.kamal/secrets`
3. Deploy the application:
```bash
bin/kamal setup    # First time deployment
bin/kamal deploy   # Subsequent deployments
```

### Kamal Aliases
```bash
bin/kamal console  # Access Rails console
bin/kamal shell    # Access container shell  
bin/kamal logs     # View application logs
bin/kamal dbc      # Access database console
```

### Frontend Build & Deployment

The frontend is built separately and can be deployed to static hosting:

1. Build the frontend:
```bash
cd frontend
npm run build
```

2. Deploy the `dist/` folder to your static hosting provider (Cloudflare Pages, Netlify, etc.)

### Environment Variables

Create `.env` in root for backend variables and `.env` in `/frontend` for frontend variables. See development setup above for required variables.

## Development Commands

```bash
# Backend
rails server           # Start Rails API (http://localhost:3000)
rails console          # Rails console
rails db:migrate       # Run migrations
rails test             # Run tests

# Frontend  
cd frontend
npm run dev            # Start React app (http://localhost:5173)
npm run build          # Build for production
npm run lint           # Lint code

# Deployment
bin/kamal setup        # First-time deployment
bin/kamal deploy       # Deploy updates
```

## License

[Add your license information here]
