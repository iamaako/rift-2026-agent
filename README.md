# RIFT 2026 - Autonomous CI/CD Healing Agent

![RIFT 2026](https://img.shields.io/badge/RIFT-2026-blue)
![Python](https://img.shields.io/badge/Python-3.11+-green)
![React](https://img.shields.io/badge/React-19-blue)
![Status](https://img.shields.io/badge/status-production--ready-green)

## 🚀 Overview

Autonomous DevOps Agent that automatically detects, fixes, and verifies code issues in GitHub repositories using AI. Built for RIFT 2026 Hackathon.

**Live Demo**: [Your Vercel URL]  
**Backend API**: [Your Heroku URL]  
**Video Demo**: [Your LinkedIn Video]

## ✨ Features

- 🤖 **AI-Powered Fixes** - Uses Gemini 2.0 Flash for intelligent code fixes
- 🔍 **Multi-Language Support** - Python, JavaScript, TypeScript, Java, Go, Rust
- 🔄 **Automatic Testing** - Runs pytest, Jest, npm test automatically
- 📊 **Real-Time Dashboard** - Live pipeline visualization and monitoring
- 🌿 **Git Integration** - Auto commits, branches, and creates PRs
- 🐳 **Production Ready** - Docker support, error handling, logging

## 🏗️ Architecture

```
┌─────────────────────────────────────────┐
│     React Dashboard (Vercel)            │
│  - Live Pipeline  - Fixes Table         │
│  - Terminal Logs  - CI/CD Timeline      │
└──────────────┬──────────────────────────┘
               │ REST API
┌──────────────┴──────────────────────────┐
│   FastAPI Backend (Heroku)              │
│  ┌────────────────────────────────┐    │
│  │   Agent Orchestrator           │    │
│  └─┬──┬──┬──┬──┬─────────────────┘    │
│    │  │  │  │  │                       │
│  Git│Scan│Fix│Test│State              │
│  Agent│ner│er│ er│Mgr                 │
└─────────────────────────────────────────┘
               │
┌──────────────┴──────────────────────────┐
│  GitHub API  │  Gemini AI  │  Tests     │
└─────────────────────────────────────────┘
```

## 🛠️ Tech Stack

**Backend**: Python 3.11, FastAPI, Gemini 2.0 Flash, asyncio  
**Frontend**: React 19, TypeScript, Vite, Tailwind CSS  
**DevOps**: Docker, Heroku, Vercel, GitHub Actions

## 📦 Installation

### Prerequisites

- Python 3.11+
- Node.js 18+
- Git
- Gemini API Key ([Get here](https://makersuite.google.com/app/apikey))

### Quick Start

**1. Clone Repository**
```bash
git clone https://github.com/your-username/rift-2026-agent.git
cd rift-2026-agent
```

**2. Backend Setup**
```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate

# Activate (Linux/Mac)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env and add your GEMINI_API_KEY
```

**3. Frontend Setup**
```bash
cd frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Default: VITE_API_URL=http://localhost:8000
```

**4. Run Locally**

Terminal 1 - Backend:
```bash
cd backend
python main.py
# Runs on http://localhost:8000
```

Terminal 2 - Frontend:
```bash
cd frontend
npm run dev
# Runs on http://localhost:5173
```

**5. Open Browser**
- Dashboard: http://localhost:5173
- API Docs: http://localhost:8000/docs

## 🎯 Usage

1. **Open Dashboard** at http://localhost:5173
2. **Enter Details**:
   - Repository URL: `https://github.com/user/repo`
   - Team Name: `RIFT ORGANISERS`
   - Team Leader: `Saiyam Kumar`
3. **Click "Run Agent"**
4. **Watch Live**:
   - Pipeline stages update in real-time
   - Logs stream live
   - Fixes are applied automatically
   - Tests run and verify
   - PR is created

## 🌐 Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions for:
- Backend → Heroku
- Frontend → Vercel

## 📋 Environment Variables

### Backend (.env)
```env
# Required
GEMINI_API_KEY=your_gemini_api_key_here

# Optional
GITHUB_TOKEN=your_github_token_here
PORT=8000
```

### Frontend (.env)
```env
# Local Development
VITE_API_URL=http://localhost:8000

# Production (set in Vercel)
VITE_API_URL=https://your-app.herokuapp.com
```

## 🎯 RIFT Requirements Compliance

### ✅ Dashboard Features
- [x] Repository URL input
- [x] Team name and leader inputs
- [x] Run Agent button with loading states
- [x] Run summary card with all details
- [x] Score breakdown panel
- [x] Fixes table (File | Bug Type | Line | Commit | Status)
- [x] CI/CD timeline with pass/fail badges
- [x] Real-time pipeline visualization
- [x] Live terminal logs

### ✅ Technical Requirements
- [x] Branch naming: `TEAM_NAME_LEADER_AI_Fix`
- [x] Commit prefix: `[AI-AGENT]`
- [x] Multi-agent architecture
- [x] Sandboxed execution
- [x] Automatic test detection and execution
- [x] Results.json generation
- [x] Production deployment

## 🐛 Supported Bug Types

- **LINTING** - Code style issues, unused variables
- **SYNTAX** - Missing semicolons, colons, brackets
- **TYPE_ERROR** - Type mismatches, property errors
- **IMPORT** - Module not found, import path issues
- **LOGIC** - Incorrect conditions, logic errors
- **SECURITY** - SQL injection, XSS vulnerabilities
- **PERFORMANCE** - Heavy computations, inefficient code
- **INDENTATION** - Indentation problems

## 📊 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check |
| `/api/analyze` | POST | Start agent analysis |
| `/api/status/{run_id}` | GET | Get run status |
| `/api/logs/{run_id}` | GET | Get execution logs |
| `/api/fixes/{run_id}` | GET | Get applied fixes |
| `/api/cicd-runs/{run_id}` | GET | Get CI/CD runs |
| `/api/results/{run_id}` | GET | Get complete results |

Full API documentation: http://localhost:8000/docs

## 🐳 Docker Support

**Backend**:
```bash
cd backend
docker build -t rift-backend .
docker run -p 8000:8000 -e GEMINI_API_KEY=your_key rift-backend
```

**Frontend**:
```bash
cd frontend
docker build -t rift-frontend .
docker run -p 5173:5173 rift-frontend
```

## 🔧 Troubleshooting

**Backend won't start**:
- Check if GEMINI_API_KEY is set in .env
- Verify Python version: `python --version` (need 3.11+)
- Reinstall dependencies: `pip install -r requirements.txt`

**Frontend can't connect**:
- Check if backend is running: `curl http://localhost:8000/health`
- Verify VITE_API_URL in .env
- Check browser console for CORS errors

**Agent fails to run**:
- Verify Gemini API key is valid
- Check repository URL is accessible
- Review backend logs for errors

## 📁 Project Structure

```
rift-2026-agent/
├── backend/
│   ├── agent/
│   │   ├── orchestrator.py      # Main coordinator
│   │   ├── git_agent.py         # Git operations
│   │   ├── scanner_agent.py     # Code scanning
│   │   ├── fixer_agent.py       # AI fixes
│   │   ├── test_agent.py        # Test execution
│   │   └── state_manager.py     # State management
│   ├── main.py                  # FastAPI app
│   ├── requirements.txt         # Dependencies
│   ├── Dockerfile              # Docker config
│   └── .env.example            # Environment template
│
├── frontend/
│   ├── components/
│   │   ├── Pipeline.tsx        # Pipeline visualization
│   │   ├── Terminal.tsx        # Log terminal
│   │   ├── FixTable.tsx        # Fixes table
│   │   ├── CICDHistory.tsx     # CI/CD timeline
│   │   ├── RunSummary.tsx      # Summary card
│   │   └── Metrics.tsx         # Stats cards
│   ├── App.tsx                 # Main application
│   ├── types.ts                # TypeScript types
│   └── package.json            # Dependencies
│
├── README.md                   # This file
├── DEPLOYMENT.md               # Deployment guide
└── LICENSE                     # MIT License
```

## 👥 Team

- **Team Name**: RIFT ORGANISERS
- **Team Leader**: Saiyam Kumar
- **Track**: AI/ML • DevOps Automation

## 📝 License

MIT License - see [LICENSE](LICENSE) file

## 🙏 Acknowledgments

Built for **RIFT 2026 Multi-city Hackathon**

- RIFT 2026 Organizing Team
- Google Gemini AI
- Open Source Community

---

**Made with ❤️ for RIFT 2026** | [@RIFT2026](https://linkedin.com/company/rift2026)
