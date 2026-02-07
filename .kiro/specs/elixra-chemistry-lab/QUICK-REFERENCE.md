# ELIXRA Quick Reference Guide

**Last Updated**: February 8, 2026

---

## 🚀 Quick Start

### Running the Project

**Frontend:**
```bash
cd build-o-thon
npm install
npm run dev
# Open http://localhost:3000
```

**Backend:**
```bash
cd build-o-thon/backend
pip install -r requirements.txt
python main.py
# Server runs on http://localhost:8000
```

### Environment Setup

**Frontend (.env.local):**
```
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000
```

**Backend (.env):**
```
GEMINI_API_KEY=your-gemini-api-key
OLLAMA_BASE_URL=http://localhost:11434
```

---

## 📊 Project Status at a Glance

| Component | Status | Completion |
|-----------|--------|-----------|
| Backend API | ✅ | 100% |
| Frontend Structure | ✅ | 100% |
| Molecule Builder | ⚠️ | 70% |
| Reaction Analysis | ✅ | 100% |
| Avatar Teacher | ✅ | 100% |
| Equipment System | ✅ | 100% |
| Spectroscopy | ⚠️ | 30% |
| Experiment Saving | ⚠️ | 50% |
| Quiz System | ❌ | 0% |
| Collaboration | ❌ | 0% |
| **Overall** | **⚠️** | **~60%** |

---

## 🎯 Top Priority Tasks

### This Week
1. **Complete Molecule Builder** - Finalize drag-and-drop and validation
2. **Integrate ORD Processor** - Connect `backend/ord_processor.py`
3. **Implement Experiment Persistence** - Complete MongoDB integration
4. **Add Progress Tracking** - Create user dashboard

### Next Week
1. **Implement Quiz System** - Question generation and grading
2. **Add Collaboration** - Real-time sync with WebSocket
3. **Complete Spectroscopy** - Spectrum generation logic
4. **Integrate RAG Pipeline** - Connect knowledge base

---

## 🔧 Key Files to Know

### Backend
- `backend/main.py` - Main FastAPI server (1200+ lines)
- `backend/ord_processor.py` - ORD processing (not integrated)
- `backend/rag_pipeline.py` - RAG pipeline (not integrated)
- `backend/.env` - Configuration

### Frontend
- `app/lab/page.tsx` - Main lab interface (1000+ lines)
- `components/LabTable.tsx` - Lab workspace
- `components/ReactionPanel.tsx` - Reaction analysis
- `components/EquipmentPanel.tsx` - Equipment controls
- `components/StreamingChat.tsx` - Chat interface

### Configuration
- `.env.local` - Frontend environment
- `backend/.env` - Backend environment
- `tsconfig.json` - TypeScript config
- `next.config.js` - Next.js config

---

## 📡 API Endpoints

### Chat
```
POST /chat
Body: { message, context, chemicals, equipment, history }
Response: Streaming JSON (token-by-token)
```

### Reaction Analysis
```
POST /analyze-reaction
Body: { chemicals, equipment }
Response: Streaming JSON (token-by-token)
```

### Molecule Analysis
```
POST /analyze-molecule
Body: { atoms, bonds }
Response: JSON with name, formula, properties, safety
```

### WebSocket
```
WS /ws
Send: { message, chemicals, history }
Receive: Streaming tokens
```

### Health Check
```
GET /health
Response: { status, ollama, gemini, models }
```

---

## 🧪 Testing

### Run Tests
```bash
npm test                    # Frontend tests
npm run test:e2e           # E2E tests
python -m pytest backend/  # Backend tests
```

### Property-Based Tests
```bash
npm run test:pbt           # Property-based tests
```

---

## 🐛 Common Issues & Solutions

### Issue: Gemini API Error
**Solution**: Check API key in `.env`, fallback to Ollama works

### Issue: Ollama Not Responding
**Solution**: Ensure Ollama is running on localhost:11434

### Issue: 3D Rendering Slow
**Solution**: Check browser hardware acceleration, reduce polygon count

### Issue: Chat Not Streaming
**Solution**: Check WebSocket connection, verify CORS settings

### Issue: Experiments Not Saving
**Solution**: Check MongoDB connection, verify database schema

---

## 📚 Documentation Map

| Document | Purpose | Lines |
|----------|---------|-------|
| requirements.md | User stories & acceptance criteria | 300+ |
| design.md | Architecture & design patterns | 400+ |
| tasks.md | Implementation task list | 350+ |
| status-report.md | Current project state | 200+ |
| IMPLEMENTATION-SUMMARY.md | What's working & what's not | 300+ |
| QUICK-REFERENCE.md | This file | 200+ |

---

## 🎓 Key Concepts

### Molecule Builder
- Atoms: Chemical elements with position and charge
- Bonds: Connections between atoms (single/double/triple)
- Formula: Calculated from atom counts
- Validation: Checks chemical feasibility

### Equipment System
- 8 types: Burner, hot plate, stirrer, centrifuge, balance, pH meter, thermometer, timer
- Attachment: Equipment attaches to test tubes
- Effects: Temperature, pH, weight calculations
- State: Persists during experiment

### AI Integration
- Gemini 2.5 Flash: Primary AI for analysis
- Ollama: Fallback for offline mode
- Streaming: Token-by-token response display
- Context: Equipment and chemicals affect analysis

### State Management
- LabContext: Lab state (molecules, reactions, equipment)
- AuthContext: User authentication
- ThemeContext: Dark/light mode

---

## 🚀 Deployment Checklist

### Before Deployment
- [ ] All tests passing
- [ ] No console errors
- [ ] Environment variables set
- [ ] API keys configured
- [ ] Database connected
- [ ] CORS configured
- [ ] SSL certificate ready

### Frontend Deployment (Vercel)
```bash
git push origin main
# Vercel auto-deploys
```

### Backend Deployment (Docker)
```bash
docker build -t elixra-backend .
docker run -p 8000:8000 elixra-backend
```

---

## 📊 Performance Targets

| Metric | Target | Status |
|--------|--------|--------|
| Chat response | <1s | ✅ |
| Reaction analysis | <2s | ✅ |
| 3D rendering | 60 FPS | ⚠️ |
| Page load | <2s | ⚠️ |
| Bundle size | <500 kB | ⚠️ |
| Lighthouse score | 95+ | ⚠️ |

---

## 🔐 Security Checklist

- [x] HTTPS in production
- [x] CORS configured
- [x] API keys in environment
- [x] Input validation
- [ ] Rate limiting
- [ ] Request signing
- [ ] Database encryption

---

## 📞 Quick Help

### Frontend Issues
1. Check `app/lab/page.tsx` for main logic
2. Check `components/` for component issues
3. Check `lib/` for utility functions
4. Check `contexts/` for state issues

### Backend Issues
1. Check `backend/main.py` for API logic
2. Check `.env` for configuration
3. Check logs for error messages
4. Test endpoints with curl or Postman

### Database Issues
1. Check MongoDB connection string
2. Verify database exists
3. Check collection schemas
4. Review MongoDB logs

---

## 🎯 Next Steps

1. **Read** the requirements.md for user stories
2. **Review** the design.md for architecture
3. **Check** the tasks.md for what to work on
4. **Read** the status-report.md for current state
5. **Use** this quick reference for quick lookups

---

## 📝 Notes

- Project is in MVP phase (~60% complete)
- Core features are working
- Enhancements are in progress
- Production deployment ready for backend
- Frontend needs final polish

---

## 🎉 Good Luck!

ELIXRA is a well-architected project with great potential. Focus on completing the molecule builder and integrating the advanced features. The foundation is solid!
