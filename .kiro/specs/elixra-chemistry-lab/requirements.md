# ELIXRA - Requirements Document

## 1. Project Vision

ELIXRA is a virtual chemistry laboratory platform that enables students and educators to safely explore chemistry through interactive 3D visualization, AI-powered reaction analysis, and intelligent tutoring. The platform combines cutting-edge AI (Google Gemini) with offline capabilities (Ollama) to provide reliable, fast chemistry education.

---

## 2. User Stories & Acceptance Criteria

### 2.1 User Story: Interactive Molecule Building
**As a** chemistry student  
**I want to** build molecules by dragging atoms and creating bonds  
**So that** I can understand molecular structure and bonding

**Acceptance Criteria:**
- [ ] User can drag atoms from the chemical shelf onto the canvas
- [ ] User can create single, double, and triple bonds between atoms
- [ ] 3D visualization updates in real-time as bonds are created
- [ ] Bond angles are calculated and displayed correctly
- [ ] User can delete atoms and bonds
- [ ] Molecular formula is automatically calculated and displayed
- [ ] System validates chemical feasibility of bonds

---

### 2.2 User Story: AI-Powered Reaction Analysis
**As a** chemistry student  
**I want to** analyze chemical reactions using AI  
**So that** I can understand reaction mechanisms and products

**Acceptance Criteria:**
- [ ] User can input 2+ chemicals for reaction analysis
- [ ] System uses Gemini API for fast, accurate analysis
- [ ] Automatic fallback to Ollama if Gemini fails
- [ ] Response includes: products, balanced equation, reaction type, observations
- [ ] Analysis completes in <2 seconds
- [ ] Error handling is graceful with user-friendly messages
- [ ] Streaming response shows real-time token generation

---

### 2.3 User Story: Avatar Teacher Guidance
**As a** chemistry student  
**I want to** ask ERA (avatar teacher) chemistry questions  
**So that** I can learn concepts interactively

**Acceptance Criteria:**
- [ ] User can type questions in chat interface
- [ ] ERA responds with clear, concise explanations
- [ ] Responses use bullet points (2-3 max)
- [ ] Chat history is maintained in conversation
- [ ] ERA considers lab context (equipment, chemicals used)
- [ ] Responses stream in real-time
- [ ] System handles connection errors gracefully

---

### 2.4 User Story: Virtual Lab Equipment
**As a** chemistry student  
**I want to** use virtual lab equipment (burner, hot plate, etc.)  
**So that** I can simulate real lab procedures safely

**Acceptance Criteria:**
- [ ] 8 equipment types available: Bunsen burner, hot plate, stirrer, centrifuge, balance, pH meter, thermometer, timer
- [ ] Each equipment has realistic controls and ranges
- [ ] Equipment effects are visualized in real-time
- [ ] Temperature changes affect reaction rates
- [ ] User can combine equipment for complex procedures
- [ ] Equipment state persists during experiment

---

### 2.5 User Story: Spectroscopy Analysis
**As a** chemistry student  
**I want to** analyze UV-Vis, IR, and NMR spectra  
**So that** I can identify compounds and understand spectroscopic principles

**Acceptance Criteria:**
- [ ] Three spectrum types available: UV-Vis, IR, NMR
- [ ] Spectra are generated based on molecular structure
- [ ] User can compare spectra side-by-side
- [ ] Functional groups are highlighted in IR spectra
- [ ] NMR multiplicity is correctly displayed
- [ ] Spectrum explanations are provided by AI

---

### 2.6 User Story: Experiment Saving & History
**As a** chemistry student  
**I want to** save experiments and view my history  
**So that** I can track my progress and revisit past work

**Acceptance Criteria:**
- [ ] User can save experiments with custom names
- [ ] Experiments include: molecules, reactions, equipment used, results
- [ ] User can load previous experiments
- [ ] Experiment history shows date, time, and summary
- [ ] User can delete experiments
- [ ] Experiments are stored in database

---

### 2.7 User Story: User Authentication
**As a** student or educator  
**I want to** create an account and log in securely  
**So that** my progress and experiments are saved

**Acceptance Criteria:**
- [ ] User can register with email and password
- [ ] User can log in with credentials
- [ ] Passwords are securely hashed (bcrypt)
- [ ] Session tokens are JWT-based
- [ ] User can reset password via email
- [ ] Authentication persists across sessions

---

### 2.8 User Story: Quiz & Assessment
**As a** educator  
**I want to** create and assign quizzes  
**So that** I can assess student understanding

**Acceptance Criteria:**
- [ ] Educator can create quizzes with multiple question types
- [ ] Question types: multiple choice, short answer, reaction prediction
- [ ] Students can take quizzes with time limits
- [ ] System auto-grades multiple choice questions
- [ ] AI grades short answer and reaction prediction questions
- [ ] Results are tracked and displayed

---

### 2.9 User Story: Collaboration
**As a** student  
**I want to** collaborate with peers on experiments  
**So that** I can learn through teamwork

**Acceptance Criteria:**
- [ ] User can create a shared lab session
- [ ] Multiple users can join the same session
- [ ] Changes are synchronized in real-time
- [ ] Chat is available for collaboration
- [ ] Session can be saved as shared experiment

---

### 2.10 User Story: Mobile Responsiveness
**As a** student  
**I want to** use ELIXRA on my phone or tablet  
**So that** I can learn chemistry anywhere

**Acceptance Criteria:**
- [ ] UI is responsive on 320px+ screens
- [ ] Touch controls work for molecule building
- [ ] 3D visualization performs well on mobile
- [ ] All features are accessible on mobile
- [ ] Performance is optimized for mobile devices

---

## 3. Functional Requirements

### 3.1 Molecule Builder
- Drag-and-drop atom placement
- Bond creation (single, double, triple)
- Real-time 3D visualization
- Bond angle calculations
- Molecular formula calculation
- Chemical feasibility validation
- Undo/redo functionality

### 3.2 Reaction Analysis
- Input validation (2+ chemicals required)
- Gemini API integration (primary)
- Ollama fallback (secondary)
- JSON response parsing
- Error handling and logging
- Response streaming
- Timeout handling (15s max)

### 3.3 Avatar Teacher
- Chat interface
- Message history management
- Context awareness (equipment, chemicals)
- Streaming responses
- Error recovery
- Rate limiting

### 3.4 Lab Equipment
- 8 equipment types with realistic controls
- Temperature/speed ranges
- Visual effects
- State persistence
- Equipment combination logic

### 3.5 Spectroscopy
- UV-Vis spectrum generation
- IR spectrum with functional groups
- NMR spectrum with multiplicity
- Spectrum comparison
- AI explanations

### 3.6 Data Persistence
- Experiment saving/loading
- User progress tracking
- Chat history
- Quiz results
- Database integration (MongoDB)

---

## 4. Non-Functional Requirements

### 4.1 Performance
- Chat response: <1s
- Reaction analysis: <2s
- 3D rendering: 60 FPS
- Page load: <2s
- Bundle size: <500 kB

### 4.2 Reliability
- 99.9% uptime
- Graceful error handling
- Automatic fallback mechanisms
- Data backup and recovery
- Error logging and monitoring

### 4.3 Security
- HTTPS only in production
- JWT authentication
- Secure password hashing (bcrypt)
- CORS configuration
- API rate limiting
- Input validation

### 4.4 Scalability
- Support 1000+ concurrent users
- Database indexing for fast queries
- Caching layer for frequent requests
- Load balancing ready
- Horizontal scaling support

### 4.5 Accessibility
- WCAG 2.1 AA compliance
- Keyboard navigation
- Screen reader support
- Color contrast ratios
- Alt text for images

---

## 5. Technical Constraints

### 5.1 Frontend
- Next.js 14+ (App Router)
- TypeScript (strict mode)
- React 18+
- Tailwind CSS
- Three.js for 3D

### 5.2 Backend
- Python 3.8+
- FastAPI
- Ollama (llama3.2:3b-instruct-q4_K_M)
- Google Gemini 2.5 Flash API
- MongoDB

### 5.3 Deployment
- Vercel (frontend)
- Docker (backend)
- MongoDB Atlas (database)
- Environment-based configuration

---

## 6. Out of Scope (Future Phases)

- VR/AR support
- Multi-language support
- Advanced molecular dynamics simulation
- Quantum chemistry calculations
- Integration with real lab equipment
- Mobile native apps

---

## 7. Success Criteria

- [ ] All 10 user stories implemented
- [ ] 95+ Lighthouse score
- [ ] <1s response time for chat
- [ ] <2s response time for reactions
- [ ] 100% test coverage for critical paths
- [ ] Mobile responsive (320px+)
- [ ] Offline mode working
- [ ] User authentication secure
- [ ] 99.9% uptime
- [ ] User satisfaction >4.5/5

---

## 8. Assumptions

1. Users have modern browsers (Chrome, Firefox, Safari, Edge)
2. Backend server is always available (with fallback to Ollama)
3. MongoDB is configured and accessible
4. Gemini API key is valid and has sufficient quota
5. Ollama is running for offline mode
6. Users have basic chemistry knowledge (high school level)

---

## 9. Dependencies

### External Services
- Google Gemini API (reaction analysis)
- Ollama (offline chat)
- MongoDB Atlas (database)
- NextAuth.js (authentication)

### Libraries
- Three.js (3D visualization)
- Framer Motion (animations)
- React Three Fiber (3D in React)
- FastAPI (backend framework)
- httpx (async HTTP client)

---

## 10. Glossary

- **ERA**: ELIXRA Reaction Avatar - the AI teacher
- **Gemini**: Google's AI model for reaction analysis
- **Ollama**: Open-source LLM framework for offline AI
- **ORD**: Open Reaction Database format
- **RAG**: Retrieval-Augmented Generation for knowledge base
- **PBT**: Property-Based Testing for correctness verification

