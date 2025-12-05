"""
Simplified FastAPI Backend for Chemistry Teaching Avatar
Works without RAG dependencies - just Ollama streaming
"""
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List, Optional
import ollama
import json
import asyncio

app = FastAPI(title="Chemistry Avatar API", version="1.0.0")

# CORS configuration for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
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

class ChatResponse(BaseModel):
    token: str

# Health check
@app.get("/")
async def root():
    return {
        "status": "online",
        "service": "Chemistry Teaching Avatar",
        "version": "1.0.0",
        "model": "llama3.2:3b-instruct-q4_K_M"
    }

@app.get("/health")
async def health_check():
    """Check if Ollama is available"""
    try:
        # Try to list models
        models = ollama.list()
        return {
            "status": "healthy",
            "ollama": "connected",
            "models": [m['name'] for m in models.get('models', [])]
        }
    except Exception as e:
        return {
            "status": "degraded",
            "ollama": "disconnected",
            "error": str(e)
        }

async def generate_json_reaction(chemicals: List[str], equipment: List[str] = None):
    """Generate JSON reaction analysis from Ollama"""
    
    chemicals_str = ', '.join(chemicals)
    equipment_str = f" using {', '.join(equipment)}" if equipment else ""
    
    json_prompt = f"""Analyze the chemical reaction between {chemicals_str}{equipment_str}.

Provide ONLY a valid JSON response with this exact structure (no other text, no markdown):
{{
  "color": "describe the final solution color",
  "smell": "describe any smell or 'none'",
  "precipitate": true or false,
  "precipitateColor": "color if precipitate forms or null",
  "products": ["list", "of", "product", "formulas"],
  "balancedEquation": "complete balanced equation with states",
  "reactionType": "type like precipitation, acid-base, redox, etc",
  "observations": ["observation 1", "observation 2"],
  "safetyNotes": ["safety note 1", "safety note 2"],
  "temperature": "increased, decreased, or unchanged",
  "gasEvolution": true or false,
  "confidence": 0.0 to 1.0
}}

CRITICAL: Return ONLY valid JSON, no markdown, no extra text."""

    try:
        print(f"Generating JSON reaction for: {chemicals_str}{equipment_str}")
        
        stream = ollama.chat(
            model='llama3.2:3b-instruct-q4_K_M',
            messages=[
                {'role': 'user', 'content': json_prompt}
            ],
            stream=True,
            options={
                'temperature': 0.3,  # Lower temperature for consistent JSON
                'top_p': 0.9,
                'top_k': 40,
                'num_predict': 1024,
            }
        )
        
        full_response = ''
        for chunk in stream:
            if 'message' in chunk and 'content' in chunk['message']:
                token = chunk['message']['content']
                if token:
                    full_response += token
                    yield json.dumps({"token": token}) + "\n"
                    await asyncio.sleep(0.01)
        
        # Validate the response is valid JSON
        try:
            json.loads(full_response)
            print(f"✓ Valid JSON response generated")
        except json.JSONDecodeError as e:
            print(f"✗ Invalid JSON from model: {e}")
            print(f"Response was: {full_response}")
            
    except Exception as e:
        error_msg = f"Error: Could not connect to Ollama. Make sure Ollama is running. Details: {str(e)}"
        print(f"✗ Error: {error_msg}")
        yield json.dumps({"token": error_msg, "error": True}) + "\n"

async def generate_stream(query: str, context: str = "", chemicals: List[str] = None, equipment: List[str] = None, history: List[dict] = None):
    """Generate streaming response from Ollama with chat history context"""
    
    # Build enhanced prompt
    system_prompt = """You are ERA (ELIXRA Reaction Avatar), a friendly and knowledgeable chemistry teacher for high school students (grades 9-12).

CRITICAL FORMATTING RULES:
- Format ALL responses as bullet points using ONLY the dash symbol (-)
- NEVER use asterisks (*) for bullets or emphasis
- NEVER use ** for bold text
- NEVER use * for italic text
- ONLY use dash (-) for bullet points
- Each bullet should contain ONE key concept or important point
- Keep bullets concise and focused (1-2 sentences max per bullet)
- Use sub-bullets with spaces and dash (  -) for additional details
- NO long paragraphs - break everything into digestible bullet points
- NO asterisks anywhere in your response

Your teaching style:
- Explain concepts step-by-step in simple terms
- Use analogies and real-world examples
- Be encouraging and patient
- Ask follow-up questions to check understanding
- Break down complex mechanisms into digestible parts
- Always prioritize safety and proper lab techniques
- Remember previous topics discussed in this conversation and build upon them
- Reference earlier explanations when relevant

When explaining reactions:
- Start with what's happening overall
- Explain the mechanism step-by-step
- Describe what students would observe
- Mention any safety considerations
- Connect to real-world applications

Keep responses conversational, engaging, and educational."""

    # Build conversation history for context
    conversation_context = ""
    if history and len(history) > 0:
        conversation_context = "\n\nPrevious conversation:\n"
        for msg in history[-6:]:  # Include last 6 messages for context (3 exchanges)
            role = "Student" if msg.get('role') == 'user' else "ERA"
            conversation_context += f"{role}: {msg.get('content', '')}\n"

    user_prompt = f"""Student Question: {query}

{f"Current Lab Context: {context}" if context else ""}

{f"Chemicals Being Used: {', '.join(chemicals)}" if chemicals else ""}

{f"Equipment Available: {', '.join(equipment)}" if equipment else ""}

{conversation_context}

Please provide a clear, educational response as a chemistry teacher would. Remember the context of our previous discussion and build upon it."""

    try:
        # Stream from Ollama using Llama 3.2 model (smaller, faster)
        print(f"Generating response for: {query[:50]}...")
        
        stream = ollama.chat(
            model='llama3.2:3b-instruct-q4_K_M',  # Smaller, faster model
            messages=[
                {'role': 'system', 'content': system_prompt},
                {'role': 'user', 'content': user_prompt}
            ],
            stream=True,
            options={
                'temperature': 0.7,
                'top_p': 0.9,
                'top_k': 40,
                'num_predict': 512,
            }
        )
        
        for chunk in stream:
            # Debug: print the chunk structure
            print(f"Chunk: {chunk}")
            
            if 'message' in chunk and 'content' in chunk['message']:
                token = chunk['message']['content']
                if token:  # Only send non-empty tokens
                    yield json.dumps({"token": token}) + "\n"
                    await asyncio.sleep(0.01)  # Small delay for smooth streaming
                
    except Exception as e:
        error_msg = f"Error: Could not connect to Ollama. Make sure Ollama is running. Details: {str(e)}"
        print(f"Error: {error_msg}")
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
    """Specialized endpoint for reaction analysis - returns JSON"""
    if not request.chemicals or len(request.chemicals) < 2:
        from fastapi import HTTPException
        raise HTTPException(status_code=400, detail="At least 2 chemicals required")
    
    return StreamingResponse(
        generate_json_reaction(request.chemicals, request.equipment),
        media_type="application/x-ndjson"
    )

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """WebSocket endpoint for real-time streaming"""
    await websocket.accept()
    print("✓ WebSocket connection established")
    
    try:
        while True:
            # Receive message from client
            data = await websocket.receive_text()
            message_data = json.loads(data)
            
            query = message_data.get('message', '')
            context = message_data.get('context', '')
            chemicals = message_data.get('chemicals', [])
            equipment = message_data.get('equipment', [])
            history = message_data.get('history', [])
            
            print(f"Received query: {query}")
            print(f"Equipment: {equipment}")
            print(f"Chat history messages: {len(history)}")
            
            # Stream response back to client
            async for token_data in generate_stream(query, context, chemicals, equipment, history):
                await websocket.send_text(token_data)
            
            # Send completion signal
            await websocket.send_text(json.dumps({"done": True}) + "\n")
            
    except WebSocketDisconnect:
        print("✗ WebSocket connection closed")
    except Exception as e:
        print(f"✗ WebSocket error: {e}")
        await websocket.close()

if __name__ == "__main__":
    import uvicorn
    print("=" * 60)
    print("🧪 Chemistry Avatar API Starting...")
    print("=" * 60)
    print("✓ Using model: llama3.2:3b-instruct-q4_K_M")
    print("✓ Backend URL: http://localhost:8000")
    print("✓ API Docs: http://localhost:8000/docs")
    print("✓ Health Check: http://localhost:8000/health")
    print("=" * 60)
    uvicorn.run(app, host="0.0.0.0", port=8000)
