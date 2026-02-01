# ELIXRA - Quick Start Guide

## 🎯 Project at a Glance

**ELIXRA** = Virtual Chemistry Lab with AI Avatar Teacher

- 🧪 Interactive 3D molecule builder
- 🤖 AI-powered reaction analysis (Gemini + Ollama)
- 🎭 Avatar teacher (ERA) with streaming chat
- 📊 Spectroscopy tools (UV-Vis, IR, NMR)
- 🧬 Virtual lab equipment (8 types)
- 📱 Mobile responsive
- 🔐 User authentication

---

## 📊 Current Status

| What | Status | Notes |
|------|--------|-------|
| Backend | ✅ Ready | FastAPI running, Gemini + Ollama working |
| Frontend | ✅ Ready | Next.js 14 structure complete |
| Database | ✅ Ready | MongoDB configured |
| Molecule Builder | ⚠️ Partial | UI done, logic needs work |
| Reaction Analysis | ✅ Done | Working with fallback |
| Avatar Teacher | ✅ Done | Streaming chat functional |
| Experiments | ⚠️ Partial | Need save/load implementation |
| Quiz System | ❌ Todo | Not started |
| Collaboration | ❌ Todo | Not started |

---

## 🚀 What to Build Next (Priority Order)

### Week 1-2: Core Features
1. **Complete Molecule Builder** (Task 1)
   - Drag-and-drop atoms ✅ UI exists
   - Create bonds ⚠️ Logic needed
   - Real-time 3D ⚠️ Needs update
   - Formula calculation ⚠️ Needs property tests

2. **Enhance Reactions** (Task 2)
   - Integrate ORD processor
   - Better error handling
   - Add caching

3. **Save Experiments** (Task 3)
   - Create data model
   - Build endpoints
   - Create UI

4. **Track Progress** (Task 4)
   - User analytics
   - Dashboard

### Week 3-4: Enhancement
5. **Quiz System** (Task 5)
6. **Collaboration** (Task 6)
7. **Spectroscopy** (Task 7)
8. **RAG Pipeline** (Task 8)

### Week 5+: Polish
9. **Mobile Optimization** (Task 9)
10. **Performance** (Task 10)
11. **Testing** (Task 11)
12. **Deployment** (Task 12)

---

## 📁 Key Files

### Frontend
```
app/
├── lab/              # Main lab interface
├── molecules/        # Molecule builder
├── spectroscopy/     # Spectrum tools
├── equipment/        # Equipment controls
├── avatar/           # Chat with ERA
├── quiz/             # Quiz system
├── collaborate/      # Shared sessions
└── auth/             # Login/register

components/
├── Molecule3DViewer.tsx      # 3D visualization
├── StreamingChat.tsx         # Chat interface
├── ReactionPanel.tsx         # Reaction analysis
├── EquipmentPanel.tsx        # Equipment controls
├── SpectrumGraph.tsx         # Spectrum display
└── ... (30+ components)
```

### Backend
```
backend/
├── main_simple.py       # ✅ Main API (complete)
├── main.py              # Alternative
├── ord_processor.py     # ⚠️ Not integrated
├── rag_pipeline.py      # ⚠️ Not integrated
└── requirements.txt     # Dependencies
```

### Database
```
MongoDB Collections:
- users              # User accounts
- experiments        # Saved experiments
- quizzes           # Quiz definitions
- results           # Quiz results
- reactions         # Reaction history
```

---

## 🔧 API Endpoints

### Chat (Ollama)
```
POST /chat
{
  "message": "What is NaCl?",
  "chemicals": ["NaCl"],
  "history": []
}
```

### Reaction Analysis (Gemini + Fallback)
```
POST /analyze-reaction
{
  "chemicals": ["NaCl", "AgNO3"],
  "equipment": ["Beaker"]
}
```

### WebSocket (Real-time)
```
WS ws://localhost:8000/ws
```

### Health Check
```
GET /health
```

---

## 🧪 Testing Strategy

### Unit Tests
- Component rendering
- Utility functions
- Data transformations

### Integration Tests
- API endpoints
- Database operations
- WebSocket communication

### Property-Based Tests
- Molecule formula correctness
- Reaction consistency
- Bond angle validity
- Equipment state transitions

### E2E Tests
- User registration
- Molecule building
- Reaction analysis
- Experiment saving

---

## 📊 Success Metrics

- [ ] All Phase 1 tasks done
- [ ] 80%+ test coverage
- [ ] 95+ Lighthouse score
- [ ] <1s chat response
- [ ] <2s reaction analysis
- [ ] Mobile responsive
- [ ] Zero critical bugs

---

## 🎯 Task Breakdown

### Task 1: Molecule Builder (Week 1)
- [ ] Drag-and-drop atoms
- [ ] Create bonds (single/double/triple)
- [ ] Real-time 3D updates
- [ ] Formula calculation
- [ ] Validation
- [ ] Undo/redo

**Subtasks**: 6 items, ~20 hours

### Task 2: Reaction Analysis (Week 1)
- [ ] Integrate ORD processor
- [ ] Improve response parsing
- [ ] Add caching
- [ ] Track history
- [ ] Property-based tests

**Subtasks**: 5 items, ~15 hours

### Task 3: Experiment Saving (Week 2)
- [ ] Data model
- [ ] Save endpoint
- [ ] Load endpoint
- [ ] History UI
- [ ] Delete functionality

**Subtasks**: 5 items, ~15 hours

### Task 4: Progress Tracking (Week 2)
- [ ] Data model
- [ ] Tracking logic
- [ ] Dashboard
- [ ] API endpoints

**Subtasks**: 4 items, ~12 hours

---

## 🔑 Key Decisions Made

1. **AI Strategy**: Gemini (primary) + Ollama (fallback)
   - Fast, accurate reactions with offline backup
   
2. **Frontend**: Next.js 14 + TypeScript
   - Modern, performant, great DX
   
3. **3D Graphics**: Three.js + React Three Fiber
   - Powerful, flexible, React-friendly
   
4. **Database**: MongoDB
   - Flexible schema, easy scaling
   
5. **Testing**: Property-based + Unit + Integration + E2E
   - Comprehensive correctness verification

---

## 🚨 Known Issues

1. **ORD Processor**: Exists but not integrated
2. **RAG Pipeline**: Exists but not connected
3. **Molecule Builder**: UI done, logic incomplete
4. **Collaboration**: Directory exists, not implemented
5. **Quiz System**: Directory exists, not implemented

---

## 💡 Pro Tips

1. **Start with Task 1** - Molecule builder is foundational
2. **Use Property-Based Tests** - Catch edge cases automatically
3. **Test Early** - Don't wait until the end
4. **Monitor Performance** - Use Lighthouse regularly
5. **Keep Mobile in Mind** - Test on real devices

---

## 📞 Quick Reference

### Environment Variables
```
GEMINI_API_KEY=your-key
MONGODB_URI=your-connection
NEXTAUTH_SECRET=your-secret
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
```

### Start Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
python main_simple.py
```

### Start Frontend
```bash
npm install
npm run dev
# Open http://localhost:3000
```

### Start Ollama
```bash
ollama serve
# In another terminal:
ollama pull llama3.2:3b-instruct-q4_K_M
```

---

## 🎓 Learning Resources

- **Next.js**: https://nextjs.org/docs
- **FastAPI**: https://fastapi.tiangolo.com/
- **Three.js**: https://threejs.org/docs/
- **MongoDB**: https://docs.mongodb.com/
- **Gemini API**: https://ai.google.dev/docs
- **Ollama**: https://ollama.ai/

---

## ✅ Checklist for Next Steps

- [ ] Read `requirements.md` for user stories
- [ ] Review `design.md` for architecture
- [ ] Check `tasks.md` for detailed breakdown
- [ ] Start Task 1 (Molecule Builder)
- [ ] Set up testing framework
- [ ] Configure CI/CD
- [ ] Deploy to staging
- [ ] Get user feedback
- [ ] Iterate and improve

---

## 🎉 You're Ready!

The spec is complete. All requirements are clear. All tasks are defined. All success criteria are measurable.

**Next action**: Pick Task 1 and start building! 🚀

