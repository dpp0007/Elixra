# ELIXRA - Design Document

## 1. Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (Next.js 14)                   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Pages: Lab, Molecules, Spectroscopy, Equipment     │   │
│  │  Components: 3D Viewer, Chat, Reaction Panel        │   │
│  │  State: React Context + Hooks                       │   │
│  └──────────────────────────────────────────────────────┘   │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTP/WebSocket
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                  Backend (FastAPI)                          │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  /chat - Ollama chat endpoint                        │   │
│  │  /analyze-reaction - Gemini + Ollama fallback       │   │
│  │  /ws - WebSocket for real-time streaming            │   │
│  │  /health - Health check                             │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  AI Services:                                        │   │
│  │  - Gemini 2.5 Flash (primary)                       │   │
│  │  - Ollama llama3.2:3b (fallback)                    │   │
│  │  - ORD Processor (advanced reactions)               │   │
│  │  - RAG Pipeline (knowledge base)                    │   │
│  └──────────────────────────────────────────────────────┘   │
└────────────────────────┬────────────────────────────────────┘
                         │ MongoDB Driver
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                  MongoDB Atlas                              │
│  Collections: users, experiments, quizzes, results          │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Frontend Architecture

### 2.1 Page Structure

```
app/
├── page.tsx                    # Landing page
├── layout.tsx                  # Root layout
├── lab/                        # Main lab interface
│   └── page.tsx               # Lab workspace
├── molecules/                  # Molecule viewer
│   └── page.tsx               # Molecule builder
├── spectroscopy/              # Spectroscopy tools
│   └── page.tsx               # Spectrum analyzer
├── equipment/                 # Equipment controls
│   └── page.tsx               # Equipment panel
├── experiments/               # Experiment templates
│   └── page.tsx               # Experiment library
├── avatar/                    # Avatar teacher
│   └── page.tsx               # Chat interface
├── quiz/                      # Quiz system
│   └── page.tsx               # Quiz interface
├── collaborate/               # Collaboration
│   └── page.tsx               # Shared sessions
└── auth/                      # Authentication
    ├── login/page.tsx         # Login page
    ├── register/page.tsx      # Registration page
    └── reset/page.tsx         # Password reset
```

### 2.2 Component Hierarchy

```
App
├── Providers (Theme, Auth, Context)
├── ModernNavbar
├── ModernPageWrapper
│   ├── Page Content
│   │   ├── Molecule3DViewer
│   │   ├── SpectrumGraph
│   │   ├── EquipmentPanel
│   │   ├── StreamingChat
│   │   ├── ReactionPanel
│   │   └── ...
│   └── ConditionalFooter
└── TopLoadingBar
```

### 2.3 State Management

**React Context Structure:**
```
LabContext
├── molecules: Molecule[]
├── reactions: Reaction[]
├── equipment: Equipment[]
├── chatHistory: Message[]
├── selectedMolecule: Molecule | null
└── experimentState: ExperimentState

AuthContext
├── user: User | null
├── isAuthenticated: boolean
├── login: (email, password) => Promise
├── logout: () => void
└── register: (email, password) => Promise

ThemeContext
├── theme: 'light' | 'dark'
├── toggleTheme: () => void
└── colors: ColorScheme
```

---

## 3. Backend Architecture

### 3.1 API Endpoints

#### Chat Endpoint
```
POST /chat
Content-Type: application/json

Request:
{
  "message": "What is NaCl?",
  "context": "lab_session_1",
  "chemicals": ["NaCl"],
  "equipment": ["Beaker"],
  "history": [
    {"role": "user", "content": "..."},
    {"role": "assistant", "content": "..."}
  ]
}

Response: application/x-ndjson (streaming)
{"token": "N"}
{"token": "a"}
{"token": "C"}
...
```

#### Reaction Analysis Endpoint
```
POST /analyze-reaction
Content-Type: application/json

Request:
{
  "chemicals": ["NaCl", "AgNO3"],
  "equipment": ["Beaker", "Stirrer"]
}

Response: application/x-ndjson (streaming)
{"token": "{"}
{"token": "\""}
{"token": "c"}
...
```

#### WebSocket Endpoint
```
WS ws://localhost:8000/ws

Client → Server:
{
  "message": "What happens?",
  "chemicals": ["H2SO4", "H2O"],
  "history": []
}

Server → Client:
{"token": "T"}
{"token": "h"}
...
{"done": true}
```

#### Health Check
```
GET /health

Response:
{
  "status": "healthy",
  "ollama": "connected",
  "gemini": "connected",
  "models": ["llama3.2:3b-instruct-q4_K_M"]
}
```

### 3.2 AI Service Flow

```
User Input
    ↓
[Validate Input]
    ↓
[Route to Service]
    ├─→ Chat Query → Ollama (llama3.2:3b)
    │       ↓
    │   [Stream Response]
    │
    └─→ Reaction Analysis → Gemini 2.5 Flash
            ↓
        [Success?]
        ├─→ Yes → [Stream JSON Response]
        └─→ No → [Fallback to Ollama]
                    ↓
                [Stream JSON Response]
```

### 3.3 Error Handling Strategy

```
Error Type          | Handling
─────────────────────────────────────────────
Gemini API Error    | Log + Fallback to Ollama
Ollama Timeout      | Return error message
Invalid Input       | 400 Bad Request
Missing API Key     | Use Ollama only
Connection Error    | Retry + Fallback
JSON Parse Error    | Return raw response
```

---

## 4. Data Models

### 4.1 Frontend Models

```typescript
// Molecule
interface Molecule {
  id: string;
  name: string;
  atoms: Atom[];
  bonds: Bond[];
  formula: string;
  mass: number;
  created: Date;
}

interface Atom {
  id: string;
  element: string;
  position: Vector3;
  charge: number;
}

interface Bond {
  id: string;
  atom1: string;
  atom2: string;
  type: 'single' | 'double' | 'triple';
  angle: number;
}

// Reaction
interface Reaction {
  id: string;
  reactants: Molecule[];
  products: Molecule[];
  equation: string;
  type: string;
  observations: string[];
  temperature: number;
  timestamp: Date;
}

// Equipment
interface Equipment {
  id: string;
  type: 'burner' | 'hotplate' | 'stirrer' | 'centrifuge' | 'balance' | 'ph_meter' | 'thermometer' | 'timer';
  state: 'off' | 'on';
  value: number;
  min: number;
  max: number;
}

// Message
interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  tokens?: number;
}

// Experiment
interface Experiment {
  id: string;
  userId: string;
  name: string;
  molecules: Molecule[];
  reactions: Reaction[];
  equipment: Equipment[];
  notes: string;
  created: Date;
  updated: Date;
}
```

### 4.2 Database Models (MongoDB)

```javascript
// Users Collection
{
  _id: ObjectId,
  email: string,
  password: string (hashed),
  name: string,
  role: 'student' | 'educator',
  createdAt: Date,
  updatedAt: Date
}

// Experiments Collection
{
  _id: ObjectId,
  userId: ObjectId,
  name: string,
  molecules: Array,
  reactions: Array,
  equipment: Array,
  notes: string,
  createdAt: Date,
  updatedAt: Date
}

// Quiz Collection
{
  _id: ObjectId,
  creatorId: ObjectId,
  title: string,
  questions: Array,
  timeLimit: number,
  createdAt: Date
}

// Results Collection
{
  _id: ObjectId,
  userId: ObjectId,
  quizId: ObjectId,
  answers: Array,
  score: number,
  completedAt: Date
}
```

---

## 5. Component Design

### 5.1 Molecule3DViewer

**Purpose**: Display and interact with 3D molecules

**Props**:
```typescript
interface Molecule3DViewerProps {
  molecule: Molecule;
  onAtomClick?: (atom: Atom) => void;
  onBondCreate?: (atom1: string, atom2: string, type: BondType) => void;
  editable?: boolean;
  showLabels?: boolean;
}
```

**Features**:
- Three.js rendering
- Drag-and-drop atoms
- Bond visualization
- Rotation/zoom controls
- Real-time updates

### 5.2 StreamingChat

**Purpose**: Real-time chat with avatar teacher

**Props**:
```typescript
interface StreamingChatProps {
  onMessage: (message: string) => void;
  messages: Message[];
  isLoading?: boolean;
  context?: string;
}
```

**Features**:
- Message input
- Streaming response display
- Chat history
- Context awareness

### 5.3 ReactionPanel

**Purpose**: Analyze chemical reactions

**Props**:
```typescript
interface ReactionPanelProps {
  chemicals: string[];
  equipment?: string[];
  onAnalyze: (chemicals: string[]) => void;
  result?: ReactionResult;
  isLoading?: boolean;
}
```

**Features**:
- Chemical input
- Equipment selection
- Result display
- JSON parsing

### 5.4 EquipmentPanel

**Purpose**: Control virtual lab equipment

**Props**:
```typescript
interface EquipmentPanelProps {
  equipment: Equipment[];
  onEquipmentChange: (id: string, value: number) => void;
  onEquipmentToggle: (id: string) => void;
}
```

**Features**:
- Equipment controls
- Real-time visualization
- State management
- Effect simulation

---

## 6. API Integration

### 6.1 Chat Integration

```typescript
// Frontend
async function sendMessage(message: string, context?: string) {
  const response = await fetch('http://localhost:8000/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message,
      context,
      chemicals: [],
      history: chatHistory
    })
  });

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    
    const text = decoder.decode(value);
    const lines = text.split('\n');
    
    for (const line of lines) {
      if (line) {
        const data = JSON.parse(line);
        onToken(data.token);
      }
    }
  }
}
```

### 6.2 Reaction Analysis Integration

```typescript
// Frontend
async function analyzeReaction(chemicals: string[], equipment?: string[]) {
  const response = await fetch('http://localhost:8000/analyze-reaction', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chemicals, equipment })
  });

  let jsonResponse = '';
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    
    const text = decoder.decode(value);
    const lines = text.split('\n');
    
    for (const line of lines) {
      if (line) {
        const data = JSON.parse(line);
        jsonResponse += data.token;
      }
    }
  }
  
  return JSON.parse(jsonResponse);
}
```

---

## 7. Performance Optimization

### 7.1 Frontend Optimization
- Code splitting by route
- Image optimization (next/image)
- CSS-in-JS optimization
- Component memoization
- Lazy loading for 3D models
- Virtual scrolling for lists

### 7.2 Backend Optimization
- Response streaming (no buffering)
- Connection pooling
- Caching frequent queries
- Request validation early
- Timeout handling
- Async/await for concurrency

### 7.3 3D Rendering Optimization
- LOD (Level of Detail) for molecules
- Frustum culling
- Instancing for repeated atoms
- WebGL optimization
- Reduced draw calls

---

## 8. Security Design

### 8.1 Authentication Flow

```
User Input (email, password)
    ↓
[Hash password with bcrypt]
    ↓
[Store in MongoDB]
    ↓
[Generate JWT token]
    ↓
[Return token to client]
    ↓
[Store in secure cookie]
    ↓
[Include in API requests]
```

### 8.2 CORS Configuration

```python
# Backend
CORSMiddleware(
  allow_origins=["http://localhost:3000", "http://localhost:3001"],
  allow_credentials=True,
  allow_methods=["*"],
  allow_headers=["*"]
)
```

### 8.3 Input Validation

```python
# Backend
class ChatRequest(BaseModel):
  message: str  # Required, non-empty
  context: Optional[str] = None
  chemicals: Optional[List[str]] = None
  equipment: Optional[List[str]] = None
  history: Optional[List[MessageHistory]] = None
```

---

## 9. Testing Strategy

### 9.1 Unit Tests
- Component rendering
- Utility functions
- Data transformations
- API response parsing

### 9.2 Integration Tests
- Chat endpoint
- Reaction analysis endpoint
- WebSocket communication
- Database operations

### 9.3 E2E Tests
- User registration
- Molecule building
- Reaction analysis
- Experiment saving

### 9.4 Property-Based Tests
- Reaction analysis correctness
- Molecule formula calculation
- Bond angle validation
- Equipment state transitions

---

## 10. Deployment Architecture

### 10.1 Frontend Deployment (Vercel)
```
GitHub → Vercel → CDN → Users
```

### 10.2 Backend Deployment (Docker)
```
Docker Image → Container Registry → Cloud Run/EC2 → Users
```

### 10.3 Database Deployment (MongoDB Atlas)
```
MongoDB Atlas → Replica Set → Backup → Users
```

---

## 11. Monitoring & Logging

### 11.1 Frontend Monitoring
- Error tracking (Sentry)
- Performance monitoring (Web Vitals)
- User analytics (Google Analytics)
- Session recording (optional)

### 11.2 Backend Logging
```python
# Backend
import logging

logger = logging.getLogger(__name__)
logger.info(f"Analyzing: {chemicals_str}")
logger.error(f"Gemini error: {str(e)}")
```

### 11.3 Metrics
- API response time
- Error rate
- Uptime
- User engagement
- Feature usage

---

## 12. Correctness Properties

### 12.1 Molecule Formula Calculation
**Property**: For any valid molecule, the calculated formula matches the sum of atoms

```
Given: Molecule with atoms
When: Formula is calculated
Then: Formula = sum of all atoms with correct counts
```

### 12.2 Reaction Analysis Consistency
**Property**: Same chemicals always produce same reaction type

```
Given: Same set of chemicals
When: Analyzed multiple times
Then: Reaction type is always the same
```

### 12.3 Bond Angle Validity
**Property**: Bond angles are within valid chemical ranges

```
Given: Any bond created
When: Angle is calculated
Then: Angle is between 0° and 180°
```

### 12.4 Equipment State Transitions
**Property**: Equipment can only transition to valid states

```
Given: Equipment in state S
When: Transition to state S'
Then: S' is a valid next state for S
```

### 12.5 Chat History Ordering
**Property**: Chat messages maintain chronological order

```
Given: Multiple messages
When: Stored and retrieved
Then: Messages are in chronological order
```

