# Acquisition Arena Deployment Makefile

.PHONY: help deploy

# Default target
help:
	@echo "Acquisition Arena Deployment Commands:"
	@echo ""
	@echo "  make deploy    - Deploy both frontend and backend via GitHub Actions"
	@echo ""

# Deploy everything via GitHub Actions
deploy:
	@echo "🚀 Triggering deployment via GitHub Actions..."
	gh workflow run deploy.yml --ref master
	@echo "✅ Deployment triggered! Check GitHub Actions for progress."
	@echo "🔗 View workflow: gh run list --workflow=deploy.yml"