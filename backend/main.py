"""
FastAPI Backend for Chemistry Teaching Avatar
Pure Gemini API implementation - no Ollama dependency
"""
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List, Optional
import google.generativeai as genai
import json
import asyncio
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = FastAPI(title="Chemistry Avatar API", version="1.0.0")

# Configure Gemini API
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY environment variable is required")

genai.configure(api_key=GEMINI_API_KEY)
GEMINI_MODEL = "gemini-2.5-flash"

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Models
class MessageHistory(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    message: str
    context: Optional[str] = None
    chemicals: Optional[List[str]] = None
    equipment: Optional[List[str]] = None
    history: Optional[List[MessageHistory]] = None

# Health check
@app.get("/")
async def root():
    return {
        "status": "online",
        "service": "Chemistry Teaching Avatar",
        "version": "1.0.0",
        "model": GEMINI_MODEL
    }

@app.get("/health")
async def health_check():
    """Check if Gemini API is available"""
    try:
        # Test API connection
        model = genai.GenerativeModel(GEMINI_MODEL)
        response = model.generate_content("test", stream=False)
        return {
            "status": "healthy",
            "gemini": "connected",
            "model": GEMINI_MODEL
        }
    except Exception as e:
        return {
            "status": "degraded",
            "gemini": "disconnected",
            "error": str(e)
        }

async def generate_stream(query: str, context: str = "", chemicals: List[str] = None, equipment: List[str] = None, history: List[dict] = None):
    """Generate streaming response from Gemini"""
    
    # Build system prompt - More detailed and educational
    system_prompt = """You are ERA, an expert chemistry teacher and tutor. Your role is to:
1. Answer chemistry questions thoroughly and accurately
2. Explain concepts clearly with examples when helpful
3. Be friendly, encouraging, and patient
4. Provide detailed explanations for complex topics
5. Use proper chemistry terminology
6. When asked about reactions, explain the mechanism, products, and conditions
7. For SN1, SN2, E1, E2 reactions: explain the mechanism, rate law, stereochemistry, and examples
8. For general chemistry: provide comprehensive but understandable explanations

Format your responses naturally - use paragraphs, bullet points, or whatever format best explains the concept.
Be thorough but concise. Aim for clarity over brevity."""

    # Build conversation context
    conversation_context = ""
    if history and len(history) > 2:
        conversation_context = "\n\nPrevious conversation context:\n"
        for msg in history[-6:]:
            role = "Student" if msg.get('role') == 'user' else "ERA"
            content = msg.get('content', '')
            conversation_context += f"{role}: {content}\n"

    # Build user prompt
    user_prompt = f"Student question: {query}"
    if context:
        user_prompt += f"\nLab context: {context}"
    if chemicals:
        user_prompt += f"\nChemicals involved: {', '.join(chemicals[:5])}"
    if conversation_context:
        user_prompt += conversation_context

    try:
        model = genai.GenerativeModel(GEMINI_MODEL)
        
        # Create streaming response with higher token limit for detailed answers
        response = model.generate_content(
            f"{system_prompt}\n\n{user_prompt}",
            stream=True,
            generation_config=genai.types.GenerationConfig(
                temperature=0.7,
                max_output_tokens=1000,
                top_p=0.9,
                top_k=40,
            )
        )
        
        # Stream tokens as they come
        for chunk in response:
            if chunk.text:
                # Send each chunk as a complete token
                yield json.dumps({"token": chunk.text}) + "\n"
        
    except Exception as e:
        error_msg = f"Error: {str(e)}"
        yield json.dumps({"token": error_msg, "error": True}) + "\n"

@app.post("/chat")
async def chat(request: ChatRequest):
    """HTTP endpoint for streaming chat"""
    history = [h.dict() if hasattr(h, 'dict') else h for h in (request.history or [])]
    return StreamingResponse(
        generate_stream(request.message, request.context, request.chemicals, request.equipment, history),
        media_type="application/x-ndjson"
    )

@app.post("/analyze-reaction")
async def analyze_reaction(request: ChatRequest):
    """Specialized endpoint for reaction analysis"""
    if not request.chemicals or len(request.chemicals) < 2:
        raise HTTPException(status_code=400, detail="At least 2 chemicals required")
    
    chemicals_str = ', '.join(request.chemicals[:2])
    
    # Build equipment context
    equipment_context = ""
    if request.equipment and len(request.equipment) > 0:
        equipment_list = ', '.join(request.equipment)
        equipment_context = f"\n\nLab Equipment Being Used: {equipment_list}\nIMPORTANT: Consider how this equipment affects the reaction (temperature, mixing, reaction rate, etc.)"
        print(f"✓ Equipment: {equipment_list}")
    else:
        print(f"✓ No equipment specified")
    
    # Detailed prompt requesting JSON structure
    prompt = f"""Analyze this chemical reaction:
Chemicals: {chemicals_str}{equipment_context}

Respond with a valid JSON object containing the following structure. 
IMPORTANT: 
1. Do not use Markdown formatting.
2. Ensure all string values are single-line and properly escaped.
3. Do not include unescaped newlines or line breaks inside string values.
4. Keep all descriptions concise and short to avoid truncation.

{{
  "balancedEquation": "balanced chemical equation",
  "reactionType": "type of reaction",
  "visualObservation": "what is visually observed (single sentence summary)",
  "color": "color of solution/products",
  "smell": "smell if any, or 'none'",
  "temperatureChange": "exothermic/endothermic/none",
  "gasEvolution": "name of gas or null",
  "emission": "light/sound or null",
  "stateChange": "description of state change or null",
  "phChange": "number or description of pH change",
  "instrumentAnalysis": {{
    "name": "instrument name",
    "intensity": "intensity/settings",
    "change": "physical/chemical change caused",
    "outcomeDifference": "how outcome differs",
    "counterfactual": "what would happen without it"
  }},
  "productsInfo": [
    {{
      "name": "product name",
      "state": "solid/liquid/gas/aqueous",
      "color": "color",
      "characteristics": "key characteristics (concise)",
      "commonUses": "common uses",
      "safetyHazards": "specific hazards"
    }}
  ],
  "explanation": {{
    "mechanism": "reaction mechanism type (concise)",
    "bondBreaking": "bond breaking details (concise)",
    "electronTransfer": "electron transfer details (concise)",
    "energyProfile": "energy profile description (concise)",
    "atomicLevel": "atomic/molecular level explanation (concise)",
    "keyConcept": "core chemistry concept demonstrated"
  }},
  "safety": {{
    "riskLevel": "Low/Medium/High",
    "precautions": "key precautions",
    "disposal": "disposal instructions",
    "firstAid": "first aid measures",
    "generalHazards": "general hazards"
  }},
  "precipitate": true/false,
  "precipitateColor": "color or null",
  "confidence": 0.9
}}

If no instrument is used, set instrumentAnalysis to null.
"""

    try:
        model = genai.GenerativeModel(GEMINI_MODEL)
        
        # Retry logic for robustness
        for attempt in range(2):
            try:
                # Configure generation with JSON enforcement
                config = genai.types.GenerationConfig(
                    temperature=0.1,
                    max_output_tokens=4000,
                    top_p=0.8,
                    top_k=20,
                    response_mime_type="application/json"
                )
                
                response = model.generate_content(
                    prompt,
                    stream=False,
                    generation_config=config
                )
                
                if response.text:
                    text = response.text.strip()
                    # Clean up markdown if present
                    if text.startswith("```json"):
                        text = text[7:]
                    if text.startswith("```"):
                        text = text[3:]
                    if text.endswith("```"):
                        text = text[:-3]
                    text = text.strip()
                
                    print(f"✓ Prompt: {chemicals_str} (Attempt {attempt+1})")
                    if request.equipment and attempt == 0:
                        print(f"✓ Lab Equipment: {', '.join(request.equipment)}")
                    
                    data = json.loads(text)
                    
                    # Normalize data for frontend
                    result = {
                        "balancedEquation": data.get("balancedEquation", "Unknown equation"),
                        "reactionType": data.get("reactionType", "Unknown"),
                        "visualObservation": data.get("visualObservation", "Reaction occurred"),
                        "color": data.get("color", "unknown"),
                        "smell": data.get("smell", "none"),
                        "temperatureChange": data.get("temperatureChange", "none"),
                        "gasEvolution": data.get("gasEvolution"),
                        "emission": data.get("emission"),
                        "stateChange": data.get("stateChange"),
                        "phChange": data.get("phChange"),
                        "instrumentAnalysis": data.get("instrumentAnalysis"),
                        "productsInfo": data.get("productsInfo", []),
                        "explanation": data.get("explanation", {
                            "mechanism": "Unknown",
                            "bondBreaking": "Unknown",
                            "atomicLevel": "Analysis unavailable",
                            "keyConcept": "Unknown"
                        }),
                        "safety": data.get("safety", {
                            "riskLevel": "Low",
                            "precautions": "Standard lab safety",
                            "disposal": "Follow local regulations",
                            "firstAid": "Consult safety data sheet",
                            "generalHazards": "Handle with care"
                        }),
                        "precipitate": data.get("precipitate", False),
                        "precipitateColor": data.get("precipitateColor"),
                        "confidence": data.get("confidence", 0.5),
                        
                        # Legacy mapping
                        "products": [p["name"] for p in data.get("productsInfo", [])],
                        "observations": [data.get("visualObservation", "")],
                        "temperature": "increased" if data.get("temperatureChange") == "exothermic" else 
                                      "decreased" if data.get("temperatureChange") == "endothermic" else "unchanged",
                        "safetyNotes": [data.get("safety", {}).get("generalHazards", "Handle with care")]
                    }
                    
                    print(f"✓ Parsed JSON successfully")
                    return result
            
            except Exception as e:
                print(f"✗ Attempt {attempt+1} failed: {e}")
                if attempt == 1: # Last attempt
                    raise HTTPException(status_code=500, detail=f"Failed to generate valid analysis: {str(e)}")
        
        raise HTTPException(status_code=500, detail="No valid response from AI")

    except Exception as e:
        print(f"✗ Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """WebSocket endpoint for real-time streaming"""
    await websocket.accept()
    
    try:
        while True:
            data = await websocket.receive_text()
            message_data = json.loads(data)
            
            query = message_data.get('message', '')
            context = message_data.get('context', '')
            chemicals = message_data.get('chemicals', [])
            equipment = message_data.get('equipment', [])
            history = message_data.get('history', [])
            
            # Stream response back to client
            async for token_data in generate_stream(query, context, chemicals, equipment, history):
                await websocket.send_text(token_data)
            
            # Send completion signal
            await websocket.send_text(json.dumps({"done": True}) + "\n")
            
    except WebSocketDisconnect:
        pass
    except Exception as e:
        await websocket.close()

# Quiz Models
class QuizConfig(BaseModel):
    difficulty: str  # easy, medium, hard
    num_questions: int
    question_types: List[str]  # explanation, mcq, complete_reaction, balance_equation, guess_product, etc
    include_timer: bool
    time_limit_per_question: Optional[int] = None  # in seconds

class QuizQuestion(BaseModel):
    id: int
    question_text: str
    question_type: str
    options: Optional[List[str]] = None  # for MCQ
    correct_answer: str
    explanation: str
    topic: str

class QuizSession(BaseModel):
    session_id: str
    config: QuizConfig
    questions: List[QuizQuestion]
    current_question_index: int = 0

class UserAnswer(BaseModel):
    question_id: int
    user_answer: str
    time_taken: int  # in seconds

class QuizResult(BaseModel):
    question_id: int
    question_text: str
    question_type: str
    user_answer: str
    correct_answer: str
    is_correct: bool
    explanation: str
    topic: str
    time_taken: int
    suggestions: str

# Store active quiz sessions (in production, use database)
quiz_sessions = {}

@app.post("/quiz/generate")
async def generate_quiz(config: QuizConfig):
    """Generate a new quiz with specified configuration"""
    import uuid
    import random
    
    session_id = str(uuid.uuid4())
    
    # Generate questions based on config
    questions = []
    
    for i in range(config.num_questions):
        question_type = random.choice(config.question_types)
        
        # Generate question based on type
        if question_type == "mcq":
            question = await generate_mcq_question(config.difficulty)
        elif question_type == "explanation":
            question = await generate_explanation_question(config.difficulty)
        elif question_type == "complete_reaction":
            question = await generate_complete_reaction_question(config.difficulty)
        elif question_type == "balance_equation":
            question = await generate_balance_equation_question(config.difficulty)
        elif question_type == "guess_product":
            question = await generate_guess_product_question(config.difficulty)
        else:
            question = await generate_mcq_question(config.difficulty)
        
        question.id = i + 1
        questions.append(question)
    
    # Create session
    session = QuizSession(
        session_id=session_id,
        config=config,
        questions=questions,
        current_question_index=0
    )
    
    quiz_sessions[session_id] = session
    
    print(f"✓ Quiz session created: {session_id}")
    print(f"✓ Questions: {len(questions)}, Difficulty: {config.difficulty}")
    
    return {
        "session_id": session_id,
        "total_questions": len(questions),
        "first_question": questions[0].dict() if questions else None
    }

async def generate_mcq_question(difficulty: str) -> QuizQuestion:
    """Generate MCQ question"""
    prompt = f"""Generate a multiple choice chemistry question at {difficulty} level.
    
Return ONLY valid JSON (no other text):
{{"question":"[question text]","options":["[option1]","[option2]","[option3]","[option4]"],"correct_answer":"[correct option]","explanation":"[detailed explanation]","topic":"[topic name]"}}"""
    
    model = genai.GenerativeModel(GEMINI_MODEL)
    response = model.generate_content(
        prompt,
        stream=False,
        generation_config=genai.types.GenerationConfig(
            temperature=0.8,
            max_output_tokens=500,
        )
    )
    
    try:
        text = response.text.strip().replace('```json', '').replace('```', '').strip()
        data = json.loads(text)
        return QuizQuestion(
            id=0,
            question_text=data.get("question", ""),
            question_type="mcq",
            options=data.get("options", []),
            correct_answer=data.get("correct_answer", ""),
            explanation=data.get("explanation", ""),
            topic=data.get("topic", "General Chemistry")
        )
    except Exception as e:
        print(f"Error generating MCQ: {e}")
        return QuizQuestion(
            id=0,
            question_text="What is the atomic number of Carbon?",
            question_type="mcq",
            options=["4", "6", "8", "12"],
            correct_answer="6",
            explanation="Carbon has 6 protons in its nucleus.",
            topic="Atomic Structure"
        )

async def generate_explanation_question(difficulty: str) -> QuizQuestion:
    """Generate explanation question"""
    prompt = f"""Generate a chemistry explanation question at {difficulty} level that requires a detailed answer.
    
Return ONLY valid JSON (no other text):
{{"question":"[question text]","correct_answer":"[expected answer]","explanation":"[detailed explanation]","topic":"[topic name]"}}"""
    
    model = genai.GenerativeModel(GEMINI_MODEL)
    response = model.generate_content(
        prompt,
        stream=False,
        generation_config=genai.types.GenerationConfig(
            temperature=0.8,
            max_output_tokens=500,
        )
    )
    
    try:
        text = response.text.strip().replace('```json', '').replace('```', '').strip()
        data = json.loads(text)
        return QuizQuestion(
            id=0,
            question_text=data.get("question", ""),
            question_type="explanation",
            correct_answer=data.get("correct_answer", ""),
            explanation=data.get("explanation", ""),
            topic=data.get("topic", "General Chemistry")
        )
    except Exception as e:
        print(f"Error generating explanation question: {e}")
        return QuizQuestion(
            id=0,
            question_text="Explain what is a chemical bond.",
            question_type="explanation",
            correct_answer="A chemical bond is a force of attraction between atoms.",
            explanation="Chemical bonds hold atoms together in molecules.",
            topic="Chemical Bonding"
        )

async def generate_complete_reaction_question(difficulty: str) -> QuizQuestion:
    """Generate complete the reaction question"""
    prompt = f"""Generate a chemistry question at {difficulty} level where the user completes a chemical reaction.
    
Return ONLY valid JSON (no other text):
{{"question":"[incomplete reaction equation]","correct_answer":"[complete equation]","explanation":"[explanation of the reaction]","topic":"[topic name]"}}"""
    
    model = genai.GenerativeModel(GEMINI_MODEL)
    response = model.generate_content(
        prompt,
        stream=False,
        generation_config=genai.types.GenerationConfig(
            temperature=0.8,
            max_output_tokens=500,
        )
    )
    
    try:
        text = response.text.strip().replace('```json', '').replace('```', '').strip()
        data = json.loads(text)
        return QuizQuestion(
            id=0,
            question_text=data.get("question", ""),
            question_type="complete_reaction",
            correct_answer=data.get("correct_answer", ""),
            explanation=data.get("explanation", ""),
            topic=data.get("topic", "Reactions")
        )
    except Exception as e:
        print(f"Error generating complete reaction question: {e}")
        return QuizQuestion(
            id=0,
            question_text="Complete: H2 + O2 → ?",
            question_type="complete_reaction",
            correct_answer="H2O",
            explanation="Hydrogen and oxygen combine to form water.",
            topic="Combustion Reactions"
        )

async def generate_balance_equation_question(difficulty: str) -> QuizQuestion:
    """Generate balance equation question"""
    prompt = f"""Generate a chemistry question at {difficulty} level where the user balances a chemical equation.
    
Return ONLY valid JSON (no other text):
{{"question":"[unbalanced equation]","correct_answer":"[balanced equation]","explanation":"[explanation of balancing]","topic":"[topic name]"}}"""
    
    model = genai.GenerativeModel(GEMINI_MODEL)
    response = model.generate_content(
        prompt,
        stream=False,
        generation_config=genai.types.GenerationConfig(
            temperature=0.8,
            max_output_tokens=500,
        )
    )
    
    try:
        text = response.text.strip().replace('```json', '').replace('```', '').strip()
        data = json.loads(text)
        return QuizQuestion(
            id=0,
            question_text=data.get("question", ""),
            question_type="balance_equation",
            correct_answer=data.get("correct_answer", ""),
            explanation=data.get("explanation", ""),
            topic=data.get("topic", "Stoichiometry")
        )
    except Exception as e:
        print(f"Error generating balance equation question: {e}")
        return QuizQuestion(
            id=0,
            question_text="Balance: Fe + O2 → Fe2O3",
            question_type="balance_equation",
            correct_answer="4Fe + 3O2 → 2Fe2O3",
            explanation="Balance atoms on both sides of the equation.",
            topic="Balancing Equations"
        )

async def generate_guess_product_question(difficulty: str) -> QuizQuestion:
    """Generate guess the product question"""
    prompt = f"""Generate a chemistry question at {difficulty} level where the user guesses the product of a reaction.
    
Return ONLY valid JSON (no other text):
{{"question":"[reactants given]","correct_answer":"[product]","explanation":"[explanation of the reaction]","topic":"[topic name]"}}"""
    
    model = genai.GenerativeModel(GEMINI_MODEL)
    response = model.generate_content(
        prompt,
        stream=False,
        generation_config=genai.types.GenerationConfig(
            temperature=0.8,
            max_output_tokens=500,
        )
    )
    
    try:
        text = response.text.strip().replace('```json', '').replace('```', '').strip()
        data = json.loads(text)
        return QuizQuestion(
            id=0,
            question_text=data.get("question", ""),
            question_type="guess_product",
            correct_answer=data.get("correct_answer", ""),
            explanation=data.get("explanation", ""),
            topic=data.get("topic", "Reactions")
        )
    except Exception as e:
        print(f"Error generating guess product question: {e}")
        return QuizQuestion(
            id=0,
            question_text="What is the product of: Na + Cl2 → ?",
            question_type="guess_product",
            correct_answer="NaCl",
            explanation="Sodium and chlorine react to form sodium chloride.",
            topic="Synthesis Reactions"
        )

@app.get("/quiz/session/{session_id}/question/{question_index}")
async def get_question(session_id: str, question_index: int):
    """Get a specific question from the quiz"""
    if session_id not in quiz_sessions:
        raise HTTPException(status_code=404, detail="Quiz session not found")
    
    session = quiz_sessions[session_id]
    if question_index < 0 or question_index >= len(session.questions):
        raise HTTPException(status_code=400, detail="Invalid question index")
    
    question = session.questions[question_index]
    session.current_question_index = question_index
    
    return {
        "question_number": question_index + 1,
        "total_questions": len(session.questions),
        "question": question.dict(),
        "can_go_back": question_index > 0,
        "can_go_forward": question_index < len(session.questions) - 1
    }

@app.post("/quiz/session/{session_id}/submit-answer")
async def submit_answer(session_id: str, answer: UserAnswer):
    """Submit an answer and get feedback"""
    if session_id not in quiz_sessions:
        raise HTTPException(status_code=404, detail="Quiz session not found")
    
    session = quiz_sessions[session_id]
    if answer.question_id < 1 or answer.question_id > len(session.questions):
        raise HTTPException(status_code=400, detail="Invalid question ID")
    
    question = session.questions[answer.question_id - 1]
    
    # Check if answer is correct - normalize both strings
    user_ans = answer.user_answer.lower().strip()
    correct_ans = question.correct_answer.lower().strip()
    is_correct = user_ans == correct_ans
    
    # Generate suggestions if wrong
    suggestions = ""
    if not is_correct:
        prompt = f"""The user answered incorrectly to this chemistry question:
Question: {question.question_text}
User's answer: {answer.user_answer}
Correct answer: {question.correct_answer}
Topic: {question.topic}

Provide specific learning suggestions to help them understand this topic better. Keep it concise."""
        
        model = genai.GenerativeModel(GEMINI_MODEL)
        response = model.generate_content(
            prompt,
            stream=False,
            generation_config=genai.types.GenerationConfig(
                temperature=0.7,
                max_output_tokens=300,
            )
        )
        suggestions = response.text.strip()
    
    result = QuizResult(
        question_id=answer.question_id,
        question_text=question.question_text,
        question_type=question.question_type,
        user_answer=answer.user_answer,
        correct_answer=question.correct_answer,
        is_correct=is_correct,
        explanation=question.explanation,
        topic=question.topic,
        time_taken=answer.time_taken,
        suggestions=suggestions
    )
    
    return result.dict()

@app.post("/quiz/session/{session_id}/finish")
async def finish_quiz(session_id: str, answers: List[UserAnswer]):
    """Finish quiz and get comprehensive results"""
    if session_id not in quiz_sessions:
        raise HTTPException(status_code=404, detail="Quiz session not found")
    
    session = quiz_sessions[session_id]
    results = []
    correct_count = 0
    total_time = 0
    
    for answer in answers:
        if answer.question_id < 1 or answer.question_id > len(session.questions):
            continue
            
        question = session.questions[answer.question_id - 1]
        
        # Normalize and compare answers
        user_ans = answer.user_answer.lower().strip()
        correct_ans = question.correct_answer.lower().strip()
        is_correct = user_ans == correct_ans
        
        if is_correct:
            correct_count += 1
        
        total_time += answer.time_taken
        
        # Generate suggestions if wrong
        suggestions = ""
        if not is_correct:
            prompt = f"""The user answered incorrectly to this chemistry question:
Question: {question.question_text}
User's answer: {answer.user_answer}
Correct answer: {question.correct_answer}
Topic: {question.topic}

Provide specific learning suggestions to help them understand this topic better. Keep it concise."""
            
            model = genai.GenerativeModel(GEMINI_MODEL)
            response = model.generate_content(
                prompt,
                stream=False,
                generation_config=genai.types.GenerationConfig(
                    temperature=0.7,
                    max_output_tokens=300,
                )
            )
            suggestions = response.text.strip()
        
        result = QuizResult(
            question_id=answer.question_id,
            question_text=question.question_text,
            question_type=question.question_type,
            user_answer=answer.user_answer,
            correct_answer=question.correct_answer,
            is_correct=is_correct,
            explanation=question.explanation,
            topic=question.topic,
            time_taken=answer.time_taken,
            suggestions=suggestions
        )
        results.append(result.dict())
    
    # Clean up session
    del quiz_sessions[session_id]
    
    score_percentage = (correct_count / len(answers)) * 100 if answers else 0
    
    return {
        "total_questions": len(answers),
        "correct_answers": correct_count,
        "score_percentage": score_percentage,
        "total_time_seconds": total_time,
        "average_time_per_question": total_time / len(answers) if answers else 0,
        "results": results
    }

if __name__ == "__main__":
    import uvicorn
    print("=" * 60)
    print("🧪 Chemistry Avatar API Starting...")
    print("=" * 60)
    print(f"✓ Using model: {GEMINI_MODEL}")
    print("✓ Backend URL: http://localhost:8000")
    print("✓ API Docs: http://localhost:8000/docs")
    print("✓ Health Check: http://localhost:8000/health")
    print("=" * 60)
    uvicorn.run(app, host="0.0.0.0", port=8000)
