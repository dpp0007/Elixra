# 🧪 Elixra - The AI-Powered Chemistry Lab

<div align="center">
  <img src="public/Assets/Main Logo.svg" alt="Elixra Logo" width="200" />
  <br />
  <h3>Immersive Chemistry Education Platform</h3>
  
  [![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
  [![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
  [![Gemini AI](https://img.shields.io/badge/AI-Gemini%202.0-blue?style=for-the-badge&logo=google)](https://deepmind.google/technologies/gemini/)
  [![MongoDB](https://img.shields.io/badge/MongoDB-Database-47A248?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.2-3178C6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
  [![Three.js](https://img.shields.io/badge/Three.js-3D-black?style=for-the-badge&logo=three.js)](https://threejs.org/)
</div>

---

## 📑 Table of Contents
- [Overview](#-overview)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Project Structure](#-project-structure)
- [Installation & Setup](#-installation--setup)
- [Configuration](#-configuration)
- [Scripts & Commands](#-scripts--commands)
- [API Documentation](#-api-documentation)
- [Core Modules](#-core-modules)
- [Avatar Voice Configuration](#-avatar-voice-configuration)
- [Development Workflow](#-development-workflow)
- [Troubleshooting](#-troubleshooting)
- [AWS Services Migration](#-aws-services-migration)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🔭 Overview

**Elixra** is a next-generation educational platform that bridges the gap between theoretical chemistry and practical application. By leveraging **Google's Gemini 2.0 Flash AI**, 3D visualization technologies, voice interaction, and gamified learning paths, Elixra provides students with a safe, interactive, and intelligent environment to master complex chemical concepts.

### Value Proposition
- **Safe Experimentation**: Perform dangerous or costly reactions in a risk-free virtual environment with realistic physics simulation.
- **Personalized AI Tutoring**: **ERA (Elixra Reactive Assistant)** provides real-time, context-aware guidance with voice interaction and avatar animation.
- **Visual Learning**: Interact with 3D molecular structures, spectroscopy data, and simulated lab equipment to build intuitive understanding.
- **Collaborative Learning**: Real-time collaboration features for group experiments and peer learning.
- **Gamified Progress**: Achievements, challenges, and progress tracking to maintain engagement.

---

## 🚀 Key Features

| Feature | Description |
|:---:|:---|
| <img src="public/Assets/Cards/Virtual Lab.svg" width="50" /> <br> **Virtual Lab** | Interactive workbench with realistic equipment physics, chemical reaction simulations, and drag-and-drop interface. |
| <img src="public/Assets/Cards/Ai Teacher.svg" width="50" /> <br> **AI Tutor (ERA)** | Intelligent assistant with streaming chat, voice interaction, avatar animation, and context-aware explanations. |
| <img src="public/Assets/Cards/Quize.svg" width="50" /> <br> **Adaptive Quizzes** | Dynamic question generation (MCQ, Reactions, Explanations) with detailed performance analysis and difficulty scaling. |
| <img src="public/Assets/Cards/Molecule.svg" width="50" /> <br> **3D Molecules** | Interactive 3D viewer for atomic structures, bonding visualization, molecular geometry, and template library. |
| <img src="public/Assets/Cards/Collabrate.svg" width="50" /> <br> **Collaboration** | Real-time collaborative features for group experiments, shared workspaces, and peer learning. |
| 🔬 **Spectroscopy** | NMR, IR, and Mass Spectrometry analysis tools with interactive visualization and interpretation guidance. |
| 🎤 **Voice Interaction** | Voice commands, avatar voice synthesis with customizable voices, and speech-to-text transcription. |
| 🏆 **Gamification** | Achievement system, challenges, leaderboards, and progress tracking to maintain engagement. |
| 📓 **Notebook** | Experiment documentation, note-taking, and PDF export for lab reports. |
| ⚠️ **Safety System** | Chemical safety guidelines, hazard warnings, and best practices for each experiment. |

---

## 🏗 Architecture

Elixra follows a modern **Service-Oriented Architecture (SOA)** with real-time streaming capabilities:

```mermaid
graph TD
    Client[Next.js Client<br/>React + Three.js] -->|HTTP/REST| API[FastAPI Backend<br/>Python + Async]
    Client -->|WebSocket| WS[Real-time Streaming<br/>NDJSON Format]
    API -->|Prompting| AI[Google Gemini 2.0<br/>LLM]
    API -->|Auth/Data| DB[(MongoDB<br/>User Data)]
    Client -->|3D Rendering| Three[Three.js/Fiber<br/>3D Graphics]
    Client -->|Voice| Voice[Web Speech API<br/>TTS/STT]
    Client -->|Auth| OAuth[Google OAuth<br/>Authentication]
```

### Technology Stack

**Frontend:**
- **Framework**: Next.js 14 (App Router) with React 18.2
- **Language**: TypeScript 5.2
- **3D Graphics**: Three.js 0.169, React Three Fiber 8.17, React Three Drei 9.113
- **Styling**: Tailwind CSS 3.3, Framer Motion 10.16
- **State**: React Context + Hooks
- **Auth**: NextAuth 4.24 with MongoDB adapter
- **Testing**: Vitest 4.0, Testing Library

**Backend:**
- **Framework**: FastAPI 0.115 with Uvicorn 0.30
- **Language**: Python 3.10+
- **AI/LLM**: Google Generative AI (Gemini 2.0 Flash)
- **Real-time**: WebSockets 13.1 with streaming
- **Validation**: Pydantic 2.9
- **Async**: Python async/await

**Database & Services:**
- **Database**: MongoDB 6.0 (user data, progress, experiments)
- **Authentication**: Google OAuth 2.0
- **Voice**: Agora SDK (TTS/ASR)
- **Deployment**: Elixra.in (production)

---

## 📂 Project Structure

```bash
build-o-thon/
├── 📁 app/                          # Next.js App Router
│   ├── 📁 api/                      # Serverless API routes
│   │   ├── analytics/               # User analytics
│   │   ├── auth/                    # Authentication endpoints
│   │   ├── challenges/              # Challenge management
│   │   ├── collaboration/           # Real-time collaboration
│   │   ├── experiments/             # Experiment data
│   │   ├── gamification/            # Achievements & rewards
│   │   ├── inventory/               # Equipment inventory
│   │   ├── marketplace/             # Content marketplace
│   │   ├── molecules/               # Molecule generation
│   │   ├── notebook/                # Experiment notes
│   │   ├── quiz/                    # Quiz generation
│   │   ├── reactions/               # Reaction analysis
│   │   ├── safety/                  # Safety guidelines
│   │   ├── spectroscopy/            # Spectroscopy analysis
│   │   ├── user/                    # User management
│   │   └── voice/                   # Voice synthesis
│   ├── 📁 lab/                      # Virtual lab page
│   ├── 📁 quiz/                     # Quiz module
│   ├── 📁 molecules/                # Molecule viewer
│   ├── 📁 spectroscopy/             # Spectroscopy tools
│   ├── 📁 experiments/              # Experiment templates
│   ├── 📁 equipment/                # Equipment catalog
│   ├── 📁 avatar/                   # AI tutor interface
│   ├── 📁 collaborate/              # Collaboration features
│   ├── 📁 auth/                     # Auth pages
│   ├── layout.tsx                   # Root layout
│   └── page.tsx                     # Home page
│
├── 📁 components/                   # Reusable React components
│   ├── StreamingChat.tsx            # Real-time chat with AI
│   ├── AvatarTeacher.tsx            # Avatar animation & lip-sync
│   ├── VoiceChatTeacher.tsx         # Voice interaction
│   ├── VoiceCommandSystem.tsx       # Voice commands
│   ├── EnhancedMolecule3DViewer.tsx # 3D molecule viewer
│   ├── SpectrumGraph.tsx            # Spectroscopy visualization
│   ├── PeriodicTable.tsx            # Interactive periodic table
│   ├── LabTable.tsx                 # Virtual lab workbench
│   ├── 📁 equipment-effects/        # Lab equipment effects
│   ├── 📁 collaborative/            # Collaboration components
│   └── ...
│
├── 📁 lib/                          # Utility functions
│   ├── bondingLogic.ts              # Chemical bonding calculations
│   ├── chemicalValidation.ts        # Molecular validation
│   ├── spectrumHandlers.ts          # Spectroscopy processing
│   ├── geometryGenerator.ts         # 3D geometry generation
│   ├── molecularTemplates.ts        # Molecule templates
│   ├── periodicTable.ts             # Periodic table data
│   ├── ph-calculator.ts             # pH calculations
│   ├── pdfExport.ts                 # PDF report generation
│   ├── mongodb.ts                   # Database connection
│   ├── auth.ts                      # Auth utilities
│   ├── achievements.ts              # Gamification logic
│   └── curriculum.ts                # Learning curriculum
│
├── 📁 types/                        # TypeScript definitions
│   ├── chemistry.ts                 # Chemistry domain types
│   ├── molecule.ts                  # Molecule structure types
│   ├── spectroscopy.ts              # Spectroscopy types
│   ├── features.ts                  # Feature types
│   └── next-auth.d.ts               # NextAuth extensions
│
├── 📁 contexts/                     # React Context providers
├── 📁 hooks/                        # Custom React hooks
├── 📁 public/                       # Static assets
│   └── 📁 Assets/                   # SVGs, icons, images
│
├── 📁 backend/                      # FastAPI Python backend
│   ├── main.py                      # FastAPI app & endpoints
│   ├── requirements.txt             # Python dependencies
│   ├── setup.ps1                    # Windows setup script
│   ├── start.ps1                    # Windows startup script
│   └── .env                         # Backend environment config
│
├── 📁 .kiro/                        # Kiro IDE configuration
│   └── 📁 specs/                    # Project specifications
│       └── 📁 aws-services-replacement/
│           ├── README.md            # Spec overview
│           ├── INTEGRATION_SUMMARY.md
│           ├── CODEBASE_ANALYSIS.md
│           ├── requirements.md
│           ├── design.md
│           └── tasks.md
│
├── package.json                     # Node.js dependencies
├── tsconfig.json                    # TypeScript config
├── next.config.js                   # Next.js config
├── tailwind.config.js               # Tailwind config
├── postcss.config.js                # PostCSS config
├── vitest.config.ts                 # Vitest config
├── .eslintrc.json                   # ESLint config
├── .env.example                     # Environment template
└── README.md                         # This file
```

---

## ⚙ Installation & Setup

### Prerequisites
- **Node.js** (v18+)
- **Python** (v3.10+)
- **MongoDB** (Local or Atlas)
- **Google Cloud API Key** (for Gemini)
- **Agora App ID & Certificate** (for voice features)

### 1. Clone the Repository
```bash
git clone https://github.com/dpp0007/build-o-thon.git
cd build-o-thon
```

### 2. Frontend Setup
```bash
# Install Node dependencies
npm install

# Create .env.local file with required variables (see Configuration section)
cp .env.example .env.local

# Start Development Server
npm run dev
# > Ready on http://localhost:3000
```

### 3. Backend Setup
```bash
cd backend

# Option A: Windows PowerShell
.\setup.ps1          # Creates virtual environment and installs dependencies
.\start.ps1          # Starts FastAPI server

# Option B: Manual setup (all platforms)
python -m venv venv
# Windows: venv\Scripts\activate
# Mac/Linux: source venv/bin/activate

pip install -r requirements.txt
python main.py
# > Chemistry Avatar API Starting...
# > Backend URL: http://localhost:8000
```

### 4. Verify Installation
- Frontend: Open http://localhost:3000 in your browser
- Backend API Docs: Open http://localhost:8000/docs
- Backend Health: Open http://localhost:8000/health

---

## 🔧 Configuration

Create a `.env.local` file in the root directory for frontend configuration:

| Variable | Description | Required |
|:---|:---|:---:|
| `NEXT_PUBLIC_BACKEND_URL` | Backend API URL (e.g., http://localhost:8000) | ✅ |
| `GEMINI_API_KEY` | Google Gemini API Key | ✅ |
| `MONGODB_URI` | MongoDB connection string | ✅ |
| `NEXTAUTH_SECRET` | Secret key for session encryption | ✅ |
| `NEXTAUTH_URL` | Base URL (e.g., http://localhost:3000) | ✅ |
| `GOOGLE_CLIENT_ID` | Google OAuth Client ID | ✅ |
| `GOOGLE_CLIENT_SECRET` | Google OAuth Client Secret | ✅ |
| `AGORA_APP_ID` | Agora SDK App ID | ✅ |
| `AGORA_CERTIFICATE` | Agora SDK Certificate | ✅ |
| `NODE_ENV` | Environment (development/production) | ❌ |

Create a `backend/.env` file for backend configuration:

| Variable | Description | Default |
|:---|:---|:---|
| `GEMINI_API_KEY` | Google Gemini API Key | Required |
| `MONGODB_URI` | MongoDB connection string | Required |
| `BACKEND_URL` | Backend URL | http://localhost:8000 |
| `FRONTEND_URL` | Frontend URL for CORS | http://localhost:3000 |
| `AGORA_APP_ID` | Agora App ID | Required |
| `AGORA_CERTIFICATE` | Agora Certificate | Required |

### Environment Setup Example

**.env.local (Frontend)**
```bash
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
GEMINI_API_KEY=your_gemini_api_key_here
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/elixra
NEXTAUTH_SECRET=your_secret_key_here
NEXTAUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
AGORA_APP_ID=your_agora_app_id
AGORA_CERTIFICATE=your_agora_certificate
NODE_ENV=development
```

**backend/.env (Backend)**
```bash
GEMINI_API_KEY=your_gemini_api_key_here
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/elixra
BACKEND_URL=http://localhost:8000
FRONTEND_URL=http://localhost:3000
AGORA_APP_ID=your_agora_app_id
AGORA_CERTIFICATE=your_agora_certificate
```

---

## 📜 Scripts & Commands

### Frontend Scripts

```bash
npm run dev      # Start development server (http://localhost:3000)
npm run build    # Create optimized production build
npm run start    # Start production server
npm run lint     # Run ESLint checks
```

### Backend Scripts

**Windows PowerShell:**
```bash
cd backend
.\setup.ps1      # Create venv and install dependencies
.\start.ps1      # Start FastAPI server
```

**Manual (All Platforms):**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Mac/Linux
# or
venv\Scripts\activate     # Windows

pip install -r requirements.txt
python main.py
```

### Testing & Validation

```bash
# Frontend linting
npm run lint

# Frontend type checking
npx tsc --noEmit

# Frontend tests (if configured)
npx vitest

# Backend API documentation
# Open http://localhost:8000/docs (Swagger UI)
# Open http://localhost:8000/redoc (ReDoc)
```

---

## 📡 API Documentation

The backend exposes comprehensive endpoints for all features. Full Swagger documentation available at `http://localhost:8000/docs`.

### Key Endpoints

**Chat & AI Tutor:**
- `POST /chat` - Streaming chat with AI tutor
- `POST /analyze-reaction` - Chemical reaction analysis
- `POST /analyze-molecule` - Molecular structure analysis
- `POST /generate-molecule` - AI-generated molecule creation
- `WebSocket /ws` - Real-time WebSocket communication

**Quiz & Learning:**
- `POST /quiz/generate` - Dynamic quiz generation
- `POST /quiz/generate-mcq` - Multiple choice questions
- `POST /quiz/generate-reaction` - Reaction-based questions
- `POST /quiz/generate-explanation` - Explanation questions

**Spectroscopy:**
- `POST /spectroscopy/analyze` - Spectroscopy data analysis
- `POST /spectroscopy/interpret` - Spectrum interpretation

**Voice & Audio:**
- `POST /synthesize` - Text-to-speech synthesis (Polly - planned)
- `WebSocket /transcribe` - Speech-to-text transcription (Transcribe - planned)

**User & Progress:**
- `GET /user/profile` - User profile data
- `GET /user/progress` - Learning progress
- `POST /user/achievements` - Achievement tracking

### Example Requests

**Quiz Generation:**
```json
POST /quiz/generate
{
  "difficulty": "medium",
  "num_questions": 5,
  "question_types": ["mcq", "explanation"],
  "include_timer": true
}
```

**AI Chat:**
```json
POST /chat
{
  "message": "Explain covalent bonding",
  "context": "User is looking at a Carbon atom",
  "history": []
}
```

---

## 🧪 Core Modules

### Virtual Lab (`app/lab/`)
Interactive chemistry workbench with:
- Drag-and-drop equipment placement
- Real-time reaction simulation
- Physics-based interactions
- Safety warnings and guidelines

### Quiz System (`app/quiz/`)
Adaptive learning with:
- Dynamic question generation via Gemini AI
- Multiple question types (MCQ, Reactions, Explanations)
- Performance tracking and analytics
- Difficulty scaling based on user performance

### Molecule Viewer (`app/molecules/`)
3D molecular visualization featuring:
- Interactive 3D structure viewer (Three.js)
- Bonding logic and validation
- Molecular templates library
- Periodic table integration

### Spectroscopy (`app/spectroscopy/`)
Advanced analysis tools for:
- NMR spectrum interpretation
- IR spectrum analysis
- Mass spectrometry data
- Interactive visualization with tooltips

### Collaboration (`app/collaborate/`)
Real-time features including:
- Shared experiment workspaces
- Live chat and annotations
- Synchronized state management
- Peer learning support

---

## 🎤 Avatar Voice Configuration

### Available Voice Options

The avatar uses the **Web Speech API** with platform-specific voices:

**Windows:**
- Microsoft Zira (Female) - Default, natural
- Microsoft David (Male) - Professional
- Microsoft Hazel (Female) - Warm, engaging
- Microsoft Aria (Female) - Modern

**macOS:**
- Samantha (Female) - Default
- Victoria (Female) - British accent
- Moira (Female) - Irish accent
- Alex (Male) - Professional

### Customizing Avatar Voice

**Option 1: Browser Settings (Easiest)**
1. Chrome/Edge: Settings → Advanced → Accessibility → Text-to-speech
2. Select your preferred voice
3. Avatar will use this voice automatically

**Option 2: Code Modification**

Edit `components/StreamingChat.tsx`:

```typescript
const voices = synthRef.current.getVoices()
const selectedVoice = voices.find(voice => 
  voice.name.includes('Zira')  // Change to: David, Hazel, Aria
)

if (selectedVoice) {
  utterance.voice = selectedVoice
  utterance.rate = 1.1        // Speed: 0.1-2.0
  utterance.pitch = 1.0       // Pitch: 0.0-2.0
  utterance.volume = 1.0      // Volume: 0.0-1.0
}
```

**Option 3: Add Voice Selection UI**

Create a dropdown selector in the chat interface to let users choose voices dynamically.

### Voice Properties

```typescript
utterance.rate = 1.1        // Speed (0.1 slow to 2.0 fast)
utterance.pitch = 1.0       // Pitch (0.0 low to 2.0 high)
utterance.volume = 1.0      // Volume (0.0 silent to 1.0 loud)
```

---

## 🔄 Development Workflow

### Git Workflow
- **main** — Stable production branch
- **feature branches** — e.g., `feature/spectroscopy`, `feature/lab-equipment`

### Development Process
1. Create a feature branch from `main`
2. Implement changes with proper TypeScript types
3. Run `npm run lint` to check code quality
4. Run `npm run build` to verify production build
5. Open a Pull Request with clear description
6. Code review and merge to `main`

### Code Standards
- **Frontend**: ESLint rules, functional components, React Hooks
- **Backend**: Type hints (Pydantic), PEP 8 compliance, async/await patterns

---

## 🧰 Troubleshooting

### Frontend Issues

**ChunkLoadError or outdated client files:**
```bash
# Stop dev server, clear cache, restart
rm -rf .next
npm run dev
```

**ESLint warnings:**
- `@next/next/no-img-element`: Use `next/image` for optimized loading
- `react-hooks/exhaustive-deps`: Include all dependencies in useEffect

**TypeScript errors:**
- Check type definitions in `types/` directory
- Ensure all imports are properly typed

### Backend Issues

**ModuleNotFoundError:**
```bash
# Reinstall dependencies
pip install -r requirements.txt
```

**Connection errors:**
- Verify MongoDB URI in `.env`
- Check Gemini API key validity
- Ensure backend is running on port 8000

**CORS errors:**
- Verify `FRONTEND_URL` in backend `.env`
- Check CORS configuration in `main.py`

### Voice Issues

**No voice playing:**
```javascript
console.log(window.speechSynthesis.getVoices())
```

**Voice sounds robotic:**
- Reduce rate to 0.9-1.0
- Adjust pitch to 0.9-1.1
- Try different voice options

---

## ☁️ AWS Services Migration

Elixra is planning to migrate from Google Gemini and Agora SDK to AWS services for enhanced scalability and cost optimization.

### Planned AWS Integration

**Amazon Bedrock** (replaces Gemini):
- Claude 3 Sonnet for LLM tasks
- Same streaming/JSON patterns
- Minimal code changes required

**Amazon Polly** (replaces Agora TTS):
- Neural voices for avatar synthesis
- Real-time audio streaming
- Phoneme data for lip-sync

**Amazon Transcribe** (replaces Agora STT):
- Streaming speech-to-text
- Chemistry vocabulary support
- Real-time transcription

### Migration Timeline
- **Phase 1-2**: AWS setup and Bedrock integration (Weeks 1-4)
- **Phase 3-4**: Polly and Transcribe integration (Weeks 5-8)
- **Phase 5-8**: Testing, optimization, and deployment (Weeks 9-16)

For detailed migration information, see `.kiro/specs/aws-services-replacement/`:
- `INTEGRATION_SUMMARY.md` - Quick reference
- `design.md` - Architecture and implementation
- `tasks.md` - Detailed implementation tasks

---

## 🤝 Contributing

We welcome contributions to Elixra! Please follow these guidelines:

1. **Fork** the repository
2. Create a **Feature Branch** (`git checkout -b feature/YourFeature`)
3. **Commit** your changes (`git commit -m 'Add YourFeature'`)
4. **Push** to the branch (`git push origin feature/YourFeature`)
5. Open a **Pull Request** with clear description

### Contribution Areas
- New experiment templates
- Enhanced 3D visualizations
- Additional spectroscopy tools
- Improved AI tutor responses
- Performance optimizations
- Documentation improvements

---

## 📄 License

This project is licensed under the **MIT License**. See the `LICENSE` file for details.

---

## 📞 Support & Resources

### Documentation
- [Next.js Documentation](https://nextjs.org/docs)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Three.js Documentation](https://threejs.org/docs/)
- [MongoDB Documentation](https://docs.mongodb.com/)

### Chemistry Resources
- [IUPAC Nomenclature](https://www.iupac.org/)
- [Chemical Reaction Types](https://www.britannica.com/science/chemical-reaction)
- [Spectroscopy Guide](https://www.chem.ucla.edu/~bacher/General/Spectroscopy/)

### AWS Services (Planned)
- [Amazon Bedrock](https://docs.aws.amazon.com/bedrock/)
- [Amazon Polly](https://docs.aws.amazon.com/polly/)
- [Amazon Transcribe](https://docs.aws.amazon.com/transcribe/)

---

<div align="center">
  <sub>Built with ❤️ for the Future of Science Education</sub>
  <br />
  <sub>Elixra © 2024 - Making Chemistry Education Immersive & Interactive</sub>
</div>
