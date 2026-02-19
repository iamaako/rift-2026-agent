# Frontend - RIFT 2026 Dashboard

React dashboard for monitoring the autonomous CI/CD healing agent.

## Quick Start

```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env

# Run development server
npm run dev
```

## Build for Production

```bash
npm run build
```

## Environment Variables

```env
VITE_API_URL=http://localhost:8000  # Local
VITE_API_URL=https://your-app.herokuapp.com  # Production
```

## Deployment

Deploy to Vercel - see [DEPLOYMENT.md](../DEPLOYMENT.md)
