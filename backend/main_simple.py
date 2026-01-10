"""
Simplified FastAPI Backend for Chemistry Teaching Avatar
Uses Ollama for chat and Google Gemini for reaction analysis
"""
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List, Optional
import ollama
import json
import asyncio
import os
import httpx
from datetime import datetime
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

app = FastAPI(title="Chemistry Avatar API", version="1.0.0")

# Get Gemini API key from environment
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
GEMINI_MODEL = "gemini-2.5-flash"  # Latest fast model for quick analysis
GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models"

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
        gemini_status = "connected" if GEMINI_API_KEY else "not_configured"
        return {
            "status": "healthy",
            "ollama": "connected",
            "gemini": gemini_status,
            "models": [m['name'] for m in models.get('models', [])]
        }
    except Exception as e:
        return {
            "status": "degraded",
            "ollama": "disconnected",
            "error": str(e)
        }

async def analyze_reaction_with_gemini(chemicals: List[str], equipment: List[str] = None):
    """Analyze chemical reaction using Google Gemini API with Ollama fallback"""
    
    if not GEMINI_API_KEY:
        print("⚠️ Gemini API key not configured, using Ollama")
        async for response in generate_json_reaction(chemicals, equipment):
            yield response
        return
    
    chemicals_str = ', '.join(chemicals[:3])
    equipment_str = f" using {', '.join(equipment[:2])}" if equipment else ""
    
    # Optimized prompt for Gemini
    prompt = f"""Analyze this chemical reaction: {chemicals_str}{equipment_str}

Return ONLY valid JSON (no markdown, no explanation):
{{
  "color": "final solution color or 'colorless'",
  "precipitate": true or false,
  "precipitateColor": "color if forms or null",
  "products": ["product1", "product2"],
  "balancedEquation": "balanced equation with states",
  "reactionType": "precipitation/acid-base/redox/combustion/etc",
  "observations": ["observation1", "observation2"],
  "temperature": "increased/decreased/unchanged",
  "gasEvolution": true or false,
  "confidence": 0.95
}}"""

    try:
        print(f"🔵 Gemini: Analyzing {chemicals_str}{equipment_str}")
        
        async with httpx.AsyncClient(timeout=15.0) as client:
            response = await client.post(
                f"{GEMINI_URL}/{GEMINI_MODEL}:generateContent",
                params={"key": GEMINI_API_KEY},
                json={
                    "contents": [
                        {
                            "parts": [
                                {"text": prompt}
                            ]
                        }
                    ],
                    "generationConfig": {
                        "temperature": 0.2,
                        "maxOutputTokens": 500,
                        "topP": 0.8,
                        "topK": 20,
                    }
                }
            )
            
            if response.status_code == 200:
                data = response.json()
                
                # Check for API errors in response
                if "error" in data:
                    error_detail = data.get("error", {}).get("message", "Unknown error")
                    print(f"✗ Gemini API error: {error_detail}")
                    print(f"⚠️ Falling back to Ollama")
                    async for result in generate_json_reaction(chemicals, equipment):
                        yield result
                    return
                
                if "candidates" in data and len(data["candidates"]) > 0:
                    content = data["candidates"][0]["content"]["parts"][0]["text"]
                    
                    # Clean up markdown if present
                    if content.startswith("```"):
                        content = content.split("```")[1]
                        if content.startswith("json"):
                            content = content[4:]
                    content = content.strip()
                    
                    # Stream the response
                    for char in content:
                        yield json.dumps({"token": char}) + "\n"
                        await asyncio.sleep(0.001)
                    
                    print(f"✓ Gemini analysis complete")
                else:
                    print(f"✗ No response from Gemini, falling back to Ollama")
                    async for result in generate_json_reaction(chemicals, equipment):
                        yield result
            else:
                # Non-200 status code - fallback to Ollama
                error_text = response.text[:200] if response.text else "No error details"
                print(f"✗ Gemini API error {response.status_code}: {error_text}")
                print(f"⚠️ Falling back to Ollama")
                async for result in generate_json_reaction(chemicals, equipment):
                    yield result
                
    except asyncio.TimeoutError:
        print(f"✗ Gemini request timeout, falling back to Ollama")
        async for result in generate_json_reaction(chemicals, equipment):
            yield result
    except httpx.ConnectError as e:
        print(f"✗ Gemini connection error: {str(e)}, falling back to Ollama")
        async for result in generate_json_reaction(chemicals, equipment):
            yield result
    except Exception as e:
        print(f"✗ Gemini error: {str(e)}, falling back to Ollama")
        async for result in generate_json_reaction(chemicals, equipment):
            yield result

async def generate_json_reaction(chemicals: List[str], equipment: List[str] = None):
    """Generate JSON reaction analysis from Ollama - optimized for speed"""
    
    chemicals_str = ', '.join(chemicals[:3])  # Max 3 chemicals
    equipment_str = f" using {', '.join(equipment[:2])}" if equipment else ""  # Max 2 equipment
    
    # Minimal JSON prompt for faster processing
    json_prompt = f"""Analyze: {chemicals_str}{equipment_str}

Return ONLY valid JSON (no markdown):
{{"color":"color","precipitate":true/false,"products":["product1"],"equation":"balanced equation","type":"reaction type","temp":"increased/decreased/unchanged"}}"""

    try:
        print(f"Analyzing: {chemicals_str}{equipment_str}")
        
        stream = ollama.chat(
            model='llama3.2:3b-instruct-q4_K_M',
            messages=[
                {'role': 'user', 'content': json_prompt}
            ],
            stream=True,
            options={
                'temperature': 0.2,  # Very low for consistent JSON
                'top_p': 0.7,
                'top_k': 20,
                'num_predict': 512,  # Reduced for speed
                'num_thread': 4,
            }
        )
        
        full_response = ''
        for chunk in stream:
            if 'message' in chunk and 'content' in chunk['message']:
                token = chunk['message']['content']
                if token:
                    full_response += token
                    yield json.dumps({"token": token}) + "\n"
        
        # Validate JSON
        try:
            json.loads(full_response)
            print(f"✓ Valid JSON response")
        except json.JSONDecodeError:
            print(f"✗ Invalid JSON from model")
            
    except Exception as e:
        error_msg = f"Error: Could not connect to Ollama."
        print(f"✗ Error: {error_msg}")
        yield json.dumps({"token": error_msg, "error": True}) + "\n"

async def generate_stream(query: str, context: str = "", chemicals: List[str] = None, equipment: List[str] = None, history: List[dict] = None):
    """Generate streaming response from Ollama with chat history context"""
    
    # Optimized system prompt - shorter for faster processing
    system_prompt = """You are ERA, a chemistry teacher. Keep responses short and clear.
- Use bullet points with dashes (-)
- 2-3 bullets max per response
- Keep each bullet to 1-2 sentences
- Be friendly and educational"""

    # Build minimal conversation history for context
    conversation_context = ""
    if history and len(history) > 2:
        # Only include last 2 exchanges (4 messages) for speed
        conversation_context = "\nRecent: "
        for msg in history[-4:]:
            role = "Q" if msg.get('role') == 'user' else "A"
            content = msg.get('content', '')[:100]  # Truncate to 100 chars
            conversation_context += f"{role}: {content}... "

    # Minimal user prompt for faster processing
    user_prompt = f"{query}"
    if context:
        user_prompt += f" (Lab: {context})"
    if chemicals:
        user_prompt += f" (Chemicals: {', '.join(chemicals[:3])})"  # Max 3 chemicals
    if conversation_context:
        user_prompt += conversation_context

    try:
        print(f"Generating response for: {query[:50]}...")
        
        stream = ollama.chat(
            model='llama3.2:3b-instruct-q4_K_M',
            messages=[
                {'role': 'system', 'content': system_prompt},
                {'role': 'user', 'content': user_prompt}
            ],
            stream=True,
            options={
                'temperature': 0.5,  # Lower = faster, more consistent
                'top_p': 0.8,
                'top_k': 30,
                'num_predict': 256,  # Reduced from 512 for faster responses
                'num_thread': 4,  # Use 4 threads for faster processing
            }
        )
        
        for chunk in stream:
            if 'message' in chunk and 'content' in chunk['message']:
                token = chunk['message']['content']
                if token:
                    yield json.dumps({"token": token}) + "\n"
                    # Removed sleep delay for faster streaming
                
    except Exception as e:
        error_msg = f"Error: Could not connect to Ollama. Make sure Ollama is running."
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
    """Specialized endpoint for reaction analysis - uses Gemini API"""
    if not request.chemicals or len(request.chemicals) < 2:
        from fastapi import HTTPException
        raise HTTPException(status_code=400, detail="At least 2 chemicals required")
    
    # Use Gemini for analysis (faster and more accurate)
    return StreamingResponse(
        analyze_reaction_with_gemini(request.chemicals, request.equipment),
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
    print("✓ Using model: llama3.2:3b-instruct-q4_K_M (Chat)")
    if GEMINI_API_KEY:
        print("✓ Using Gemini 2.5 Flash (Reaction Analysis)")
    else:
        print("⚠️ Gemini API key not configured (using Ollama fallback)")
    print("✓ Backend URL: http://localhost:8000")
    print("✓ API Docs: http://localhost:8000/docs")
    print("✓ Health Check: http://localhost:8000/health")
    print("=" * 60)
    uvicorn.run(app, host="0.0.0.0", port=8000)
