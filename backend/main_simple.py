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
class ChatRequest(BaseModel):
    message: str
    context: Optional[str] = None
    chemicals: Optional[List[str]] = None

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

async def generate_stream(query: str, context: str = "", chemicals: List[str] = None):
    """Generate streaming response from Ollama"""
    
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

When explaining reactions:
- Start with what's happening overall
- Explain the mechanism step-by-step
- Describe what students would observe
- Mention any safety considerations
- Connect to real-world applications

Keep responses conversational, engaging, and educational."""

    user_prompt = f"""Student Question: {query}

{f"Current Lab Context: {context}" if context else ""}

{f"Chemicals Being Used: {', '.join(chemicals)}" if chemicals else ""}

Please provide a clear, educational response as a chemistry teacher would."""

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
    return StreamingResponse(
        generate_stream(request.message, request.context, request.chemicals),
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
            
            print(f"Received query: {query}")
            
            # Stream response back to client
            async for token_data in generate_stream(query, context, chemicals):
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
