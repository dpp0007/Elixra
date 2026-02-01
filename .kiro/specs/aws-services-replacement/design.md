# AWS Services Replacement - Design Document

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend (Next.js)                        │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────┐  │
│  │ StreamingChat    │  │ VoiceChatTeacher │  │ AvatarTeacher│  │
│  │ (Bedrock LLM)    │  │ (Polly + Transcr)│  │ (Polly Audio)│  │
│  └────────┬─────────┘  └────────┬─────────┘  └──────┬───────┘  │
│           │                     │                    │           │
│           └─────────────────────┼────────────────────┘           │
│                                 │                                │
│                          WebSocket Connection                    │
│                                 │                                │
└─────────────────────────────────┼────────────────────────────────┘
                                  │
                    ┌─────────────┴──────────────┐
                    │                            │
        ┌───────────▼──────────────┐  ┌─────────▼──────────────┐
        │   Backend (FastAPI)      │  │  AWS Services          │
        │                          │  │                        │
        │  ┌────────────────────┐  │  │  ┌────────────────┐   │
        │  │ /chat (Bedrock)    │  │  │  │ Amazon Bedrock │   │
        │  ├────────────────────┤  │  │  │ (LLM Inference)│   │
        │  │ /analyze-molecule  │  │  │  └────────────────┘   │
        │  │ (Bedrock JSON)     │  │  │                        │
        │  ├────────────────────┤  │  │  ┌────────────────┐   │
        │  │ /analyze-reaction  │  │  │  │ Amazon Polly   │   │
        │  │ (Bedrock Analysis) │  │  │  │ (Text-to-Speech)   │
        │  ├────────────────────┤  │  │  └────────────────┘   │
        │  │ /quiz/generate     │  │  │                        │
        │  │ (Bedrock Questions)│  │  │  ┌────────────────┐   │
        │  ├────────────────────┤  │  │  │ Amazon Transcr │   │
        │  │ /ws (WebSocket)    │  │  │  │ (Speech-to-Text)   │
        │  │ Streaming          │  │  │  └────────────────┘   │
        │  ├────────────────────┤  │  │                        │
        │  │ /health            │  │  │  ┌────────────────┐   │
        │  │ AWS Status Check   │  │  │  │ AWS IAM        │   │
        │  └────────────────────┘  │  │  │ (Credentials)  │   │
        │                          │  │  └────────────────┘   │
        └──────────────────────────┘  └────────────────────────┘
```

## Component Design

### 1. Backend - AWS Service Integration

#### 1.1 Bedrock Integration (LLM Inference)

**File**: `build-o-thon/backend/services/bedrock_service.py`

```python
class BedrockService:
    def __init__(self):
        self.client = boto3.client('bedrock-runtime', region_name=AWS_REGION)
        self.model_id = os.getenv('BEDROCK_MODEL_ID', 'anthropic.claude-3-sonnet-20240229-v1:0')
    
    async def generate_stream(self, prompt: str, system_prompt: str = None) -> AsyncGenerator[str, None]:
        """Stream text generation from Bedrock"""
        # Yields tokens as they arrive
    
    async def generate_json(self, prompt: str, schema: dict) -> dict:
        """Generate structured JSON response"""
        # Returns validated JSON object
    
    async def analyze_molecule(self, atoms: List, bonds: List) -> dict:
        """Analyze molecular structure"""
        # Returns molecule analysis
    
    async def analyze_reaction(self, chemicals: List[str], equipment: List[str]) -> dict:
        """Analyze chemical reaction"""
        # Returns reaction analysis
    
    async def generate_quiz_question(self, difficulty: str, topic: str) -> dict:
        """Generate quiz question"""
        # Returns question with options and answer
```

**Key Features**:
- Streaming responses for real-time chat
- JSON mode for structured outputs
- Retry logic with exponential backoff
- Cost tracking and logging
- Error handling and fallbacks

#### 1.2 Polly Integration (Text-to-Speech)

**File**: `build-o-thon/backend/services/polly_service.py`

```python
class PollyService:
    def __init__(self):
        self.client = boto3.client('polly', region_name=AWS_REGION)
        self.voice_id = os.getenv('POLLY_VOICE_ID', 'Joanna')
    
    async def synthesize_speech(self, text: str) -> bytes:
        """Convert text to speech audio"""
        # Returns audio bytes
    
    async def synthesize_speech_stream(self, text: str) -> AsyncGenerator[bytes, None]:
        """Stream audio chunks"""
        # Yields audio chunks
    
    def get_phonemes(self, text: str) -> List[dict]:
        """Extract phoneme data for lip-sync"""
        # Returns phoneme timing data
    
    async def synthesize_with_ssml(self, ssml: str) -> bytes:
        """Synthesize with SSML for prosody control"""
        # Returns audio with emotion/emphasis
```

**Key Features**:
- Neural voice quality
- Streaming audio output
- Phoneme extraction for lip-sync
- SSML support for prosody
- Multiple voice options

#### 1.3 Transcribe Integration (Speech-to-Text)

**File**: `build-o-thon/backend/services/transcribe_service.py`

```python
class TranscribeService:
    def __init__(self):
        self.client = boto3.client('transcribe', region_name=AWS_REGION)
        self.language_code = os.getenv('TRANSCRIBE_LANGUAGE', 'en-US')
    
    async def start_stream_transcription(self, audio_stream: AsyncGenerator) -> AsyncGenerator[dict, None]:
        """Start real-time transcription"""
        # Yields partial and final transcriptions
    
    async def transcribe_audio(self, audio_bytes: bytes) -> str:
        """Transcribe audio file"""
        # Returns transcribed text
    
    def add_custom_vocabulary(self, terms: List[str]) -> None:
        """Add chemistry terms to vocabulary"""
        # Improves accuracy for domain-specific terms
```

**Key Features**:
- Real-time streaming transcription
- Custom vocabulary for chemistry terms
- Confidence scores
- Partial results support
- Language detection

#### 1.4 WebSocket Handler

**File**: `build-o-thon/backend/websocket_handler.py`

```python
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """Enhanced WebSocket with AWS services"""
    await websocket.accept()
    
    try:
        while True:
            data = await websocket.receive_text()
            message_data = json.loads(data)
            
            # Route to appropriate AWS service
            if message_data.get('type') == 'chat':
                async for token in bedrock_service.generate_stream(message_data['message']):
                    await websocket.send_text(json.dumps({"token": token}))
            
            elif message_data.get('type') == 'transcribe':
                async for result in transcribe_service.start_stream_transcription(message_data['audio']):
                    await websocket.send_text(json.dumps({"transcription": result}))
            
            elif message_data.get('type') == 'synthesize':
                async for audio_chunk in polly_service.synthesize_speech_stream(message_data['text']):
                    await websocket.send_bytes(audio_chunk)
    
    except WebSocketDisconnect:
        pass
```

### 2. Frontend - AWS Service Integration

#### 2.1 Transcribe Streaming Component

**File**: `build-o-thon/components/TranscribeStreaming.tsx`

```typescript
interface TranscribeStreamingProps {
  onTranscription: (text: string, isFinal: boolean) => void
  onError: (error: string) => void
}

export function TranscribeStreaming({ onTranscription, onError }: TranscribeStreamingProps) {
  const [isListening, setIsListening] = useState(false)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const wsRef = useRef<WebSocket | null>(null)
  
  const startListening = async () => {
    // Get microphone stream
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    
    // Create MediaRecorder
    const mediaRecorder = new MediaRecorder(stream)
    mediaRecorderRef.current = mediaRecorder
    
    // Connect to WebSocket
    const ws = new WebSocket(`${getWebSocketUrl()}/ws`)
    wsRef.current = ws
    
    // Send audio chunks to backend
    mediaRecorder.ondataavailable = (event) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          type: 'transcribe',
          audio: event.data
        }))
      }
    }
    
    // Receive transcription results
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data)
      onTranscription(data.transcription.text, data.transcription.isFinal)
    }
    
    mediaRecorder.start(100) // Send chunks every 100ms
    setIsListening(true)
  }
  
  const stopListening = () => {
    mediaRecorderRef.current?.stop()
    wsRef.current?.close()
    setIsListening(false)
  }
  
  return (
    <button onClick={isListening ? stopListening : startListening}>
      {isListening ? 'Stop Listening' : 'Start Listening'}
    </button>
  )
}
```

#### 2.2 Polly Audio Playback Component

**File**: `build-o-thon/components/PollyAudioPlayer.tsx`

```typescript
interface PollyAudioPlayerProps {
  text: string
  onPlayStart: () => void
  onPlayEnd: () => void
}

export function PollyAudioPlayer({ text, onPlayStart, onPlayEnd }: PollyAudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const wsRef = useRef<WebSocket | null>(null)
  
  const playAudio = async () => {
    onPlayStart()
    
    // Connect to WebSocket for audio streaming
    const ws = new WebSocket(`${getWebSocketUrl()}/ws`)
    wsRef.current = ws
    
    // Request audio synthesis
    ws.send(JSON.stringify({
      type: 'synthesize',
      text: text
    }))
    
    // Collect audio chunks
    const audioChunks: Uint8Array[] = []
    
    ws.onmessage = (event) => {
      if (event.data instanceof Blob) {
        audioChunks.push(new Uint8Array(event.data))
      }
    }
    
    ws.onclose = () => {
      // Combine chunks and play
      const audioBlob = new Blob(audioChunks, { type: 'audio/mpeg' })
      const audioUrl = URL.createObjectURL(audioBlob)
      
      if (audioRef.current) {
        audioRef.current.src = audioUrl
        audioRef.current.play()
        audioRef.current.onended = onPlayEnd
      }
    }
  }
  
  return (
    <>
      <audio ref={audioRef} />
      <button onClick={playAudio}>Play Audio</button>
    </>
  )
}
```

#### 2.3 Enhanced VoiceChatTeacher Component

**File**: `build-o-thon/components/VoiceChatTeacher.tsx` (Updated)

```typescript
export default function VoiceChatTeacher({
  onSpeakingChange,
  onLipSyncIntensityChange,
  onPhonemeChange,
  onEmotionChange
}: VoiceChatTeacherProps) {
  const [transcript, setTranscript] = useState('')
  const [isTranscribing, setIsTranscribing] = useState(false)
  
  const handleTranscription = (text: string, isFinal: boolean) => {
    setTranscript(text)
    
    if (isFinal) {
      // Send to chat endpoint
      sendMessage(text)
    }
  }
  
  const sendMessage = async (message: string) => {
    // Send to backend chat endpoint
    const response = await fetch('/api/chat', {
      method: 'POST',
      body: JSON.stringify({ message })
    })
    
    // Stream response and synthesize audio
    const reader = response.body?.getReader()
    while (true) {
      const { done, value } = await reader?.read() || {}
      if (done) break
      
      const text = new TextDecoder().decode(value)
      // Synthesize audio for response
      await synthesizeAndPlay(text)
    }
  }
  
  const synthesizeAndPlay = async (text: string) => {
    // Use Polly to synthesize and play
    onSpeakingChange?.(true)
    // ... audio playback logic
    onSpeakingChange?.(false)
  }
  
  return (
    <div>
      <TranscribeStreaming 
        onTranscription={handleTranscription}
        onError={(error) => console.error(error)}
      />
      <PollyAudioPlayer 
        text={transcript}
        onPlayStart={() => onSpeakingChange?.(true)}
        onPlayEnd={() => onSpeakingChange?.(false)}
      />
    </div>
  )
}
```

### 3. Data Flow Diagrams

#### 3.1 Chat Flow with Bedrock

```
User Input
    ↓
Frontend: /chat endpoint
    ↓
Backend: ChatRequest received
    ↓
BedrockService.generate_stream()
    ↓
Bedrock API (streaming)
    ↓
Backend: Yield tokens via WebSocket
    ↓
Frontend: Display streaming response
    ↓
PollyService.synthesize_speech_stream()
    ↓
Polly API (streaming audio)
    ↓
Frontend: Play audio via WebSocket
    ↓
Avatar: Lip-sync with phoneme data
```

#### 3.2 Voice Chat Flow with Transcribe + Polly

```
User speaks
    ↓
Frontend: Capture audio via MediaRecorder
    ↓
WebSocket: Send audio chunks
    ↓
Backend: TranscribeService.start_stream_transcription()
    ↓
Transcribe API (streaming)
    ↓
Backend: Yield partial transcriptions
    ↓
Frontend: Display interim results
    ↓
Final transcription received
    ↓
Backend: Send to Bedrock for response
    ↓
Bedrock: Generate response
    ↓
PollyService.synthesize_speech_stream()
    ↓
Polly API: Generate audio
    ↓
Frontend: Stream audio to user
    ↓
Avatar: Animate with lip-sync
```

## API Endpoints

### Updated Endpoints

#### POST /chat
- **Input**: ChatRequest (message, context, chemicals, equipment, history)
- **Output**: Streaming response via Server-Sent Events
- **AWS Service**: Bedrock (Claude 3 Sonnet)
- **Changes**: Replace Gemini with Bedrock streaming

#### POST /analyze-molecule
- **Input**: MoleculeAnalysisRequest (atoms, bonds)
- **Output**: JSON analysis
- **AWS Service**: Bedrock (JSON mode)
- **Changes**: Use Bedrock instead of Gemini

#### POST /analyze-reaction
- **Input**: ChatRequest (chemicals, equipment)
- **Output**: JSON reaction analysis
- **AWS Service**: Bedrock (JSON mode)
- **Changes**: Use Bedrock instead of Gemini

#### POST /quiz/generate
- **Input**: QuizConfig (difficulty, num_questions, question_types)
- **Output**: Quiz session with questions
- **AWS Service**: Bedrock (question generation)
- **Changes**: Use Bedrock instead of Gemini

#### WebSocket /ws
- **Input**: Message data (type: 'chat' | 'transcribe' | 'synthesize')
- **Output**: Streaming responses
- **AWS Services**: Bedrock, Transcribe, Polly
- **Changes**: Support multiple message types

#### GET /health
- **Output**: Health status including AWS service connectivity
- **Changes**: Add AWS service checks

## Environment Configuration

```bash
# AWS Credentials
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1

# Bedrock Configuration
BEDROCK_MODEL_ID=anthropic.claude-3-sonnet-20240229-v1:0
BEDROCK_MAX_TOKENS=2048
BEDROCK_TEMPERATURE=0.7

# Polly Configuration
POLLY_VOICE_ID=Joanna
POLLY_ENGINE=neural
POLLY_LANGUAGE_CODE=en-US

# Transcribe Configuration
TRANSCRIBE_LANGUAGE_CODE=en-US
TRANSCRIBE_REGION=us-east-1

# Feature Flags
USE_BEDROCK=true
USE_POLLY=true
USE_TRANSCRIBE=true
```

## Error Handling & Fallbacks

### Bedrock Failures
- Retry with exponential backoff (max 3 attempts)
- Fall back to cached responses if available
- Return error message to user
- Log to CloudWatch

### Polly Failures
- Use browser's Web Speech API as fallback
- Cache synthesized audio
- Return error message to user

### Transcribe Failures
- Fall back to browser's Web Speech API
- Allow manual text input
- Return error message to user

## Security Considerations

1. **AWS Credentials**: Never expose in frontend
   - All AWS calls proxied through backend
   - Use IAM roles in production
   - Rotate credentials regularly

2. **Input Validation**: Validate all user inputs
   - Sanitize text before sending to AWS
   - Validate audio format
   - Check request size limits

3. **Rate Limiting**: Implement rate limiting
   - Per-user request limits
   - Per-IP rate limiting
   - AWS service quotas

4. **Logging**: Log all AWS API calls
   - Request/response logging
   - Error logging
   - Cost tracking

## Performance Optimization

1. **Caching**:
   - Cache Bedrock responses for common queries
   - Cache Polly audio for repeated text
   - Use Redis for distributed caching

2. **Batching**:
   - Batch multiple requests to Bedrock
   - Combine Polly synthesis requests
   - Reduce API call overhead

3. **Streaming**:
   - Use streaming APIs for real-time responses
   - Implement chunked transfer encoding
   - Minimize latency with WebSocket

## Monitoring & Observability

1. **CloudWatch Metrics**:
   - Bedrock latency and token usage
   - Polly synthesis time
   - Transcribe accuracy and latency
   - WebSocket connection duration

2. **Logging**:
   - All AWS API calls
   - Error tracking
   - User interactions
   - Cost tracking

3. **Alerting**:
   - Service unavailability
   - High latency
   - Error rate spikes
   - Cost threshold exceeded

## Cost Estimation

### Monthly Costs (Estimated)
- **Bedrock**: ~$0.003 per 1K input tokens, ~$0.015 per 1K output tokens
- **Polly**: ~$0.000004 per character (neural voice)
- **Transcribe**: ~$0.0001 per second of audio

### Example Usage
- 1000 chat interactions: ~$50
- 500 voice sessions (30 min each): ~$150
- 1000 quiz generations: ~$30
- **Total**: ~$230/month

## Migration Path

1. **Phase 1**: Set up AWS services and credentials
2. **Phase 2**: Implement Bedrock integration for chat
3. **Phase 3**: Implement Polly integration for TTS
4. **Phase 4**: Implement Transcribe integration for STT
5. **Phase 5**: Testing and optimization
6. **Phase 6**: Production deployment
