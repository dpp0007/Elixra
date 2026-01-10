# 🧪 ELIXRA - Virtual Chemistry Lab with AI Avatar Teacher

> An interactive, AI-powered virtual chemistry laboratory with 3D molecule visualization, AI-powered reaction analysis, and an intelligent avatar teacher.

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-green?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com/)
[![Gemini](https://img.shields.io/badge/Gemini-2.5%20Flash-blue?style=flat-square&logo=google)](https://ai.google.dev/)
[![License](https://img.shields.io/badge/License-MIT-purple?style=flat-square)](LICENSE)

## 🎯 Overview

ELIXRA is a comprehensive virtual chemistry laboratory platform combining interactive 3D visualization, AI-powered reaction analysis, and an intelligent avatar teacher. Perfect for students and educators exploring chemistry safely and interactively.

### Key Features

- **🎨 3D Molecule Visualization** - Interactive drag-and-drop molecule builder with real-time bonding
- **🤖 AI Reaction Analysis** - Google Gemini 2.5 Flash (primary) with Ollama fallback
- **🎭 Avatar Teacher** - ERA (ELIXRA Reaction Avatar) with chemistry explanations
- **📊 Spectroscopy Tools** - UV-Vis, IR, and NMR spectrum analysis
- **🧪 Lab Equipment** - Bunsen burner, hot plate, stirrer, centrifuge, balance, pH meter, thermometer, timer
- **📱 Responsive Design** - Desktop, tablet, and mobile support
- **🔐 Authentication** - NextAuth.js with secure session management
- **⚡ Fast Backend** - FastAPI with streaming responses
- **🔄 Automatic Fallback** - Seamless Gemini → Ollama fallback on errors

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Python 3.8+
- Ollama (for offline mode)
- Google Gemini API key (for online mode)

### Installation

```bash
# Clone repository
git clone https://github.com/yourusername/elixra.git
cd elixra/build-o-thon

# Install frontend dependencies
npm install

# Create environment file
cp .env.example .env.local

# Update .env.local with your API keys
```

### Run Frontend Only

```bash
npm run dev
# Open http://localhost:3000
```

### Run Full Stack (Frontend + Backend)

#### 1. Start Ollama (for chat)

```bash
ollama serve
# In another terminal:
ollama pull llama3.2:3b-instruct-q4_K_M
```

#### 2. Start Backend

```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate

pip install -r requirements.txt
python main_simple.py
```

#### 3. Start Frontend

```bash
npm run dev
# Open http://localhost:3000
```

## 🔧 Configuration

### Environment Variables

Create `.env.local`:

```env
# Frontend
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000

# Database (optional)
MONGODB_URI=mongodb+srv://your-connection-string

# AI - Choose one:
# Option 1: Online with Gemini
GEMINI_API_KEY=your-gemini-api-key

# Option 2: Offline with Ollama (no key needed)
# Just run: ollama serve

# Authentication
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-change-in-production
```

### Backend Configuration

Backend uses `.env` file in `backend/` directory:

```env
GEMINI_API_KEY=your-gemini-api-key
```

## 🎮 Features

### 3D Molecule Builder
- Drag-and-drop atoms
- Create single, double, triple bonds
- Real-time 3D visualization
- Bond angle calculations

### Reaction Analysis
- **Primary**: Google Gemini 2.5 Flash (fast, accurate)
- **Fallback**: Ollama (offline, reliable)
- JSON response with reaction details
- Automatic fallback on errors

### Avatar Teacher (ERA)
- Chemistry explanations
- Real-time streaming responses
- Conversation history context
- Equipment-aware guidance

### Spectroscopy Tools
- UV-Vis spectrum analysis
- IR spectrum with functional groups
- NMR multiplicity visualization
- Spectrum comparison

### Lab Equipment
- Bunsen Burner (0-1000°C)
- Hot Plate (25-300°C)
- Magnetic Stirrer (0-1500 RPM)
- Centrifuge (0-5000 RPM)
- Analytical Balance (0.0001g precision)
- pH Meter (0-14 range)
- Thermometer (-50°C to 300°C)
- Lab Timer (countdown/countup)

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **3D Graphics**: Three.js + React Three Fiber
- **Animations**: Framer Motion
- **State**: React Context + Hooks

### Backend
- **Runtime**: Python 3.8+
- **Framework**: FastAPI
- **AI (Primary)**: Google Gemini 2.5 Flash
- **AI (Fallback)**: Ollama + Llama 3.2
- **Server**: Uvicorn
- **Async**: asyncio + httpx

## 📁 Project Structure

```
build-o-thon/
├── app/                          # Next.js pages
│   ├── page.tsx                  # Landing page
│   ├── lab/                      # Lab interface
│   ├── molecules/                # 3D molecule viewer
│   ├── spectroscopy/             # Spectroscopy tools
│   └── api/                      # API routes
├── components/                   # React components
│   ├── Molecule3DViewer.tsx      # 3D molecule visualization
│   ├── SpectrumGraph.tsx         # Spectrum visualization
│   ├── BondExplanation.tsx       # AI bond explanations
│   └── ...
├── lib/                          # Utilities
│   ├── bondingLogic.ts           # Bond calculations
│   ├── spectrumData.ts           # Spectrum datasets
│   ├── aiBondReasoning.ts        # AI reasoning
│   └── spectrumHandlers.ts       # Spectrum analysis
├── types/                        # TypeScript types
├── backend/                      # Python FastAPI
│   ├── main_simple.py            # Main backend
│   ├── requirements.txt          # Python dependencies
│   └── .env                      # Backend config
├── public/                       # Static assets
├── .env.example                  # Environment template
├── .env.local                    # Local config (git ignored)
├── package.json                  # Frontend dependencies
├── tsconfig.json                 # TypeScript config
├── tailwind.config.js            # Tailwind config
└── README.md                     # This file
```

## 🔄 API Endpoints

### Chat (Ollama)
```
POST /chat
Content-Type: application/json

{
  "message": "What is NaCl?",
  "chemicals": ["NaCl"],
  "history": []
}
```

### Reaction Analysis (Gemini + Fallback)
```
POST /analyze-reaction
Content-Type: application/json

{
  "chemicals": ["NaCl", "AgNO3"],
  "equipment": ["Beaker"]
}
```

### WebSocket (Real-time Chat)
```
WS ws://localhost:8000/ws
```

### Health Check
```
GET /health
```

Response:
```json
{
  "status": "healthy",
  "ollama": "connected",
  "gemini": "connected",
  "models": ["llama3.2:3b-instruct-q4_K_M"]
}
```

## 🚀 Deployment

### Vercel (Frontend)
```bash
npm run build
vercel deploy
```

### Docker (Backend)
```bash
cd backend
docker build -t elixra-backend .
docker run -p 8000:8000 elixra-backend
```

## 📊 Performance

- **Frontend**: Lighthouse 98/100
- **Backend**: 500-800ms response time
- **Gemini**: 1-2s with automatic Ollama fallback
- **Bundle Size**: 365 kB (First Load JS)

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style
- Use TypeScript (strict mode)
- Use functional components with hooks
- Use Tailwind CSS for styling
- Write clean, self-documenting code
- Add comments for complex logic

## 🐛 Troubleshooting

### Ollama Connection Issues
```bash
# Check if Ollama is running
ollama list

# Start Ollama
ollama serve
```

### Backend Not Starting
```bash
# Check Python version (need 3.8+)
python --version

# Install dependencies
pip install -r requirements.txt

# Start backend
python main_simple.py
```

### Frontend Build Issues
```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
npm install

# Start dev server
npm run dev
```

## 🔒 Security & Privacy

- End-to-end encryption for sensitive data
- Secure password hashing (bcrypt)
- JWT token authentication
- HTTPS only in production
- No data selling (ever)
- API keys stored in environment variables

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/elixra/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/elixra/discussions)

## 📜 License

MIT License - See [LICENSE](LICENSE) file for details

## 🙏 Acknowledgments

- Google Gemini for AI capabilities
- Ollama for offline AI
- Next.js team for the amazing framework
- Three.js for 3D graphics
- Tailwind CSS for styling utilities
- FastAPI for the backend framework

---

**Made with ❤️ by the ELIXRA Team**
