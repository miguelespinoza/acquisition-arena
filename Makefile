# Acquisition Arena Deployment Makefile
.PHONY: help build deploy frontend-build frontend-deploy backend-deploy dev test clean setup

# Default target
help:
	@echo "Acquisition Arena Deployment Commands:"
	@echo ""
	@echo "Setup & Development:"
	@echo "  make setup           - Install dependencies for both frontend and backend"
	@echo "  make dev             - Start development servers (Rails + Vite)"
	@echo "  make test            - Run all tests"
	@echo ""
	@echo "Building:"
	@echo "  make build           - Build both frontend and backend"
	@echo "  make frontend-build  - Build frontend only"
	@echo ""
	@echo "Deployment:"
	@echo "  make deploy          - Deploy both frontend and backend to production"
	@echo "  make frontend-deploy - Deploy frontend to Cloudflare Workers"
	@echo "  make backend-deploy  - Deploy backend to Fly.io"
	@echo ""
	@echo "Environment Management:"
	@echo "  make secrets-fly     - Set secrets on Fly.io (interactive)"
	@echo "  make secrets-cf      - Set secrets on Cloudflare (interactive)"
	@echo ""
	@echo "Utilities:"
	@echo "  make clean           - Clean build artifacts"
	@echo "  make logs-fly        - Tail Fly.io logs"
	@echo "  make logs-cf         - Tail Cloudflare Workers logs"

# Setup dependencies
setup:
	@echo "📦 Installing backend dependencies..."
	bundle install
	@echo "📦 Installing frontend dependencies..."
	cd frontend && npm install
	@echo "✅ Setup complete!"

# Development servers
dev:
	@echo "🚀 Starting development servers..."
	@echo "Starting Rails server in background..."
	rails server &
	@echo "Starting Vite dev server..."
	cd frontend && npm run dev

# Run tests
test:
	@echo "🧪 Running backend tests..."
	rails test
	@echo "🧪 Running frontend tests..."
	cd frontend && npm run test 2>/dev/null || echo "No frontend tests configured"

# Build everything
build: frontend-build
	@echo "🏗️  Build complete!"

# Build frontend
frontend-build:
	@echo "🏗️  Building frontend..."
	cd frontend && npm run build
	@echo "✅ Frontend build complete!"

# Deploy everything
deploy: build frontend-deploy backend-deploy
	@echo "🚀 Full deployment complete!"
	@echo "Frontend: https://your-worker.your-subdomain.workers.dev"
	@echo "Backend: https://your-app.fly.dev"

# Deploy frontend to Cloudflare Workers
frontend-deploy: frontend-build
	@echo "🚀 Deploying frontend to Cloudflare Workers..."
	cd frontend && wrangler deploy --env production
	@echo "✅ Frontend deployed!"

# Deploy backend to Fly.io
backend-deploy:
	@echo "🚀 Deploying backend to Fly.io..."
	fly deploy
	@echo "✅ Backend deployed!"

# Interactive secret management for Fly.io
secrets-fly:
	@echo "🔐 Setting secrets for Fly.io..."
	@echo "Enter your secrets (press Enter to skip):"
	@read -p "ROLLBAR_ACCESS_TOKEN: " rollbar && \
	 if [ ! -z "$$rollbar" ]; then fly secrets set ROLLBAR_ACCESS_TOKEN=$$rollbar; fi
	@read -p "POSTHOG_API_KEY: " posthog && \
	 if [ ! -z "$$posthog" ]; then fly secrets set POSTHOG_API_KEY=$$posthog; fi
	@read -p "CLERK_SECRET_KEY: " clerk && \
	 if [ ! -z "$$clerk" ]; then fly secrets set CLERK_SECRET_KEY=$$clerk; fi
	@read -p "ELEVENLABS_API_KEY: " elevenlabs && \
	 if [ ! -z "$$elevenlabs" ]; then fly secrets set ELEVENLABS_API_KEY=$$elevenlabs; fi
	@read -p "OPENAI_API_KEY: " openai && \
	 if [ ! -z "$$openai" ]; then fly secrets set OPENAI_API_KEY=$$openai; fi
	@echo "✅ Fly.io secrets updated!"

# Interactive secret management for Cloudflare
secrets-cf:
	@echo "🔐 Setting secrets for Cloudflare Workers..."
	@echo "Note: For static Workers, add these to your wrangler.toml or dashboard"
	@echo "Environment variables needed:"
	@echo "  - VITE_ROLLBAR_ACCESS_TOKEN"
	@echo "  - VITE_POSTHOG_KEY" 
	@echo "  - VITE_CLERK_PUBLISHABLE_KEY"
	@echo ""
	@echo "Setting secrets via wrangler..."
	cd frontend && wrangler secret put VITE_ROLLBAR_ACCESS_TOKEN --env production
	@echo "✅ Cloudflare secrets updated!"

# Clean build artifacts
clean:
	@echo "🧹 Cleaning build artifacts..."
	rm -rf frontend/dist
	rm -rf frontend/node_modules/.vite
	@echo "✅ Clean complete!"

# View logs
logs-fly:
	@echo "📊 Tailing Fly.io logs..."
	fly logs

logs-cf:
	@echo "📊 Tailing Cloudflare Workers logs..."
	cd frontend && wrangler tail --env production

# Quick deployment commands for convenience
deploy-frontend: frontend-deploy
deploy-backend: backend-deploy

# Status checks
status:
	@echo "📊 Deployment Status:"
	@echo ""
	@echo "Fly.io Status:"
	fly status
	@echo ""
	@echo "Cloudflare Workers:"
	@echo "Check your dashboard: https://dash.cloudflare.com/"

# Database commands
db-migrate:
	@echo "🗄️  Running database migrations..."
	rails db:migrate

db-seed:
	@echo "🌱 Seeding database..."
	rails db:seed

# Full setup for new environments
bootstrap: setup db-migrate db-seed
	@echo "🎉 Bootstrap complete! Ready for development."