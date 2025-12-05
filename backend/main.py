"""
FastAPI Backend for Chemistry Teaching Avatar
Provides streaming AI responses using Ollama + RAG
"""
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List, Optional
import ollama
import json
import asyncio
from rag_pipeline import ChemistryRAG

app = FastAPI(title="ERA - ELIXRA Reaction Avatar API", version="1.0.0")

# CORS configuration for Next.js frontend
# Allow localhost and all network IPs for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
        "*"  # Allow all origins for network access (change in production!)
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize RAG pipeline (optional - will work without database)
try:
    rag = ChemistryRAG()
    print("✓ RAG pipeline loaded successfully")
except Exception as e:
    print(f"⚠ RAG pipeline not available: {e}")
    print("  Backend will work without RAG enhancement")
    rag = None

# Models
class MessageHistory(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    message: str
    context: Optional[str] = None
    chemicals: Optional[List[str]] = None
    equipment: Optional[List[str]] = None  # Equipment being used in the lab
    history: Optional[List[MessageHistory]] = None  # Chat history for context

class ChatResponse(BaseModel):
    token: str

# Health check
@app.get("/")
async def root():
    return {
        "status": "online",
        "service": "ERA - ELIXRA Reaction Avatar",
        "version": "1.0.0",
        "description": "Intelligent Chemistry Teaching Assistant"
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
    
    # Build the prompt for JSON response
    chemicals_str = ', '.join(chemicals)
    equipment_str = f" using {', '.join(equipment)}" if equipment else ""
    
    json_prompt = f"""Analyze the chemical reaction between {chemicals_str}{equipment_str}.

Provide ONLY a valid JSON response with this exact structure (no other text):
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
        stream = ollama.chat(
            model='gpt-oss',
            messages=[
                {'role': 'user', 'content': json_prompt}
            ],
            stream=True,
            options={
                'temperature': 0.3,  # Lower temperature for more consistent JSON
                'top_p': 0.9,
                'top_k': 40,
                'num_predict': 1024,
            }
        )
        
        full_response = ''
        for chunk in stream:
            if 'message' in chunk and 'content' in chunk['message']:
                token = chunk['message']['content']
                full_response += token
                yield json.dumps({"token": token}) + "\n"
                await asyncio.sleep(0.01)
        
        # Validate the response is valid JSON
        try:
            json.loads(full_response)
        except json.JSONDecodeError as e:
            print(f"Invalid JSON from model: {e}")
            print(f"Response was: {full_response}")
            
    except Exception as e:
        error_msg = f"Error: Could not connect to Ollama. Make sure Ollama is running. Details: {str(e)}"
        yield json.dumps({"token": error_msg, "error": True}) + "\n"

async def generate_stream(query: str, context: str = "", chemicals: List[str] = None, equipment: List[str] = None, history: List[dict] = None):
    """Generate streaming response from Ollama with RAG context, equipment awareness, and chat history"""
    
    # Retrieve relevant chemistry context (if RAG is available)
    if rag:
        rag_context = rag.retrieve_context(query, k=2)
    else:
        rag_context = "Chemistry knowledge base not loaded. Providing general chemistry assistance."
    
    # Build conversation history for context
    conversation_context = ""
    if history and len(history) > 0:
        conversation_context = "\n\nPrevious conversation:\n"
        for msg in history[-6:]:  # Include last 6 messages for context (3 exchanges)
            role = "Student" if msg.get('role') == 'user' else "ERA"
            conversation_context += f"{role}: {msg.get('content', '')}\n"
    
    # Build enhanced prompt
    system_prompt = """You are ERA (ELIXRA Reaction Avatar), a knowledgeable chemistry teacher. 

CRITICAL IDENTITY RULES:
- Your name is ERA, NOT CHEM
- ERA stands for ELIXRA Reaction Avatar
- Never introduce yourself as CHEM or Ms. CHEM
- Never say "get it? Chemistry teacher?"
- You have already introduced yourself in the initial greeting
- Do NOT repeat introductions or formalities

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

Guidelines:
- Get straight to the answer - no repetitive greetings or filler phrases
- Explain concepts step-by-step in simple terms
- Use analogies and real-world examples when helpful
- Be concise but thorough
- For reactions: explain mechanism, observations, and safety

Example format (ONLY use dashes, NO asterisks):
- Main concept or answer
- Key point 1 with brief explanation
- Key point 2 with brief explanation
  - Sub-detail if needed
- Summary or conclusion

WRONG (DO NOT DO THIS):
* Using asterisks for bullets
** Bold text with asterisks
* Any asterisks at all

RIGHT (DO THIS):
- Using dashes for bullets
- Plain text without asterisks
- Clean, readable format

Keep responses focused and educational. Answer the question directly without re-introducing yourself."""

    user_prompt = f"""Student Question: {query}

{f"Current Lab Context: {context}" if context else ""}

{f"Chemicals Being Used: {', '.join(chemicals)}" if chemicals else ""}

{f"Equipment Available: {', '.join(equipment)}" if equipment else ""}

{conversation_context}

Relevant Chemistry Knowledge:
{rag_context}

Please provide a clear, educational response as a chemistry teacher would."""

    try:
        # Stream from Ollama
        # Using gpt-oss model (larger, better quality)
        stream = ollama.chat(
            model='gpt-oss',  # You can change this to any model you have
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
            if 'message' in chunk and 'content' in chunk['message']:
                token = chunk['message']['content']
                yield json.dumps({"token": token}) + "\n"
                await asyncio.sleep(0.01)  # Small delay for smooth streaming
                
    except Exception as e:
        error_msg = f"Error: Could not connect to Ollama. Make sure Ollama is running with llama3.2 model. Details: {str(e)}"
        yield json.dumps({"token": error_msg, "error": True}) + "\n"

@app.post("/chat")
async def chat(request: ChatRequest):
    """HTTP endpoint for streaming chat"""
    history = [h.dict() if hasattr(h, 'dict') else h for h in (request.history or [])]
    return StreamingResponse(
        generate_stream(request.message, request.context, request.chemicals, request.equipment, history),
        media_type="application/x-ndjson"
    )

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """WebSocket endpoint for real-time streaming"""
    await websocket.accept()
    print("WebSocket connection established")
    
    try:
        while True:
            # Receive message from client
            data = await websocket.receive_text()
            message_data = json.loads(data)
            
            query = message_data.get('message', '')
            context = message_data.get('context', '')
            chemicals = message_data.get('chemicals', [])
            equipment = message_data.get('equipment', [])  # Get equipment from client
            history = message_data.get('history', [])  # Get chat history from client
            
            print(f"Received query: {query}")
            print(f"Equipment: {equipment}")
            print(f"Chat history messages: {len(history)}")
            
            # Stream response back to client
            async for token_data in generate_stream(query, context, chemicals, equipment, history):
                await websocket.send_text(token_data)
            
            # Send completion signal
            await websocket.send_text(json.dumps({"done": True}) + "\n")
            
    except WebSocketDisconnect:
        print("WebSocket connection closed")
    except Exception as e:
        print(f"WebSocket error: {e}")
        await websocket.close()

@app.post("/analyze-reaction")
async def analyze_reaction(request: ChatRequest):
    """Specialized endpoint for reaction analysis - returns JSON"""
    if not request.chemicals or len(request.chemicals) < 2:
        raise HTTPException(status_code=400, detail="At least 2 chemicals required")
    
    return StreamingResponse(
        generate_json_reaction(request.chemicals, request.equipment),
        media_type="application/x-ndjson"
    )

if __name__ == "__main__":
    import uvicorn
    print("Starting Chemistry Avatar API...")
    print("Make sure Ollama is running: ollama serve")
    print("And model is pulled: ollama pull llama3.2:3b-instruct-q4_K_M")
    uvicorn.run(app, host="0.0.0.0", port=8000)
