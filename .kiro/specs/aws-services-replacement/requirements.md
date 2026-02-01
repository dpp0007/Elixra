# AWS Services Replacement - Requirements

## Overview
Replace current AI/voice providers (Google Gemini, Agora) with AWS services to leverage Amazon Bedrock for LLM inference, Amazon Polly for text-to-speech, and Amazon Transcribe for speech-to-text functionality.

## Current System Architecture
- **LLM Provider**: Google Gemini 2.0 Flash (via `google.generativeai`)
- **Voice TTS**: Agora SDK (real-time voice synthesis)
- **Voice STT**: Agora SDK (real-time speech recognition)
- **Backend**: FastAPI (Python)
- **Frontend**: Next.js 14 with React + TypeScript
- **Real-time Communication**: WebSocket for streaming responses

## User Stories

### 1. LLM Inference via Amazon Bedrock
**As a** chemistry student using the ERA tutor
**I want** AI responses to be generated using Amazon Bedrock models
**So that** I get accurate chemistry explanations with consistent quality

**Acceptance Criteria:**
- [ ] Bedrock replaces Gemini for all `/chat` endpoint requests
- [ ] Bedrock handles `/analyze-molecule` JSON generation
- [ ] Bedrock handles `/analyze-reaction` detailed analysis
- [ ] Bedrock handles `/quiz/generate` question generation
- [ ] Streaming responses work via WebSocket with Bedrock
- [ ] Error handling gracefully falls back if Bedrock is unavailable
- [ ] Response latency is comparable to Gemini (< 3 seconds for typical queries)

### 2. Text-to-Speech via Amazon Polly
**As a** chemistry student in voice chat mode
**I want** the AI tutor's responses to be spoken using Amazon Polly
**So that** I can learn through audio without reading text

**Acceptance Criteria:**
- [ ] Polly replaces Agora TTS for avatar voice synthesis
- [ ] Voice responses are generated for all chat messages
- [ ] Multiple voice options available (e.g., Joanna, Matthew)
- [ ] Lip-sync data is generated from Polly phoneme output
- [ ] Audio streaming works in real-time via WebSocket
- [ ] Voice quality is natural and clear for chemistry terminology
- [ ] Emotion/prosody can be controlled via SSML tags

### 3. Speech-to-Text via Amazon Transcribe
**As a** chemistry student using voice commands
**I want** my spoken questions to be transcribed using Amazon Transcribe
**So that** I can interact with the lab using natural speech

**Acceptance Criteria:**
- [ ] Transcribe replaces Agora ASR for voice command recognition
- [ ] Real-time transcription works during voice chat sessions
- [ ] Transcription accuracy is high for chemistry terminology
- [ ] Partial results are streamed to UI during speech
- [ ] Final transcription is sent to chat endpoint
- [ ] Voice command system recognizes chemistry-specific terms
- [ ] Confidence scores are provided for transcription accuracy

### 4. Backend AWS Integration
**As a** backend developer
**I want** AWS SDK properly configured and integrated
**So that** all services work reliably in production

**Acceptance Criteria:**
- [ ] AWS credentials configured via environment variables
- [ ] Boto3 SDK installed and configured
- [ ] Error handling for AWS service failures
- [ ] Logging for all AWS API calls
- [ ] Cost optimization (request batching, caching)
- [ ] Retry logic with exponential backoff
- [ ] Health check endpoint validates AWS connectivity

### 5. Frontend AWS Integration
**As a** frontend developer
**I want** AWS services integrated into React components
**So that** voice and AI features work seamlessly

**Acceptance Criteria:**
- [ ] AWS SDK for JavaScript configured
- [ ] Transcribe streaming integrated into VoiceChatTeacher
- [ ] Polly audio playback integrated into avatar component
- [ ] Real-time audio streaming works via WebSocket
- [ ] Error states handled gracefully
- [ ] Loading states shown during processing
- [ ] Microphone permissions requested properly

### 6. Data Flow & Streaming
**As a** system architect
**I want** streaming responses to work end-to-end
**So that** users get real-time feedback

**Acceptance Criteria:**
- [ ] Bedrock streaming responses work via WebSocket
- [ ] Polly audio chunks streamed to frontend
- [ ] Transcribe partial results streamed to UI
- [ ] No buffering delays in voice interactions
- [ ] Proper connection management for long sessions
- [ ] Graceful degradation if streaming fails

### 7. Chemistry Domain Optimization
**As a** chemistry educator
**I want** AWS services optimized for chemistry content
**So that** responses are accurate and domain-specific

**Acceptance Criteria:**
- [ ] Bedrock prompts include chemistry context
- [ ] Polly voice configured for technical terminology
- [ ] Transcribe custom vocabulary includes chemistry terms
- [ ] Quiz generation maintains chemistry accuracy
- [ ] Molecule analysis uses proper IUPAC naming
- [ ] Reaction analysis includes mechanism details

### 8. Environment Configuration
**As a** DevOps engineer
**I want** AWS configuration managed via environment variables
**So that** deployment is secure and flexible

**Acceptance Criteria:**
- [ ] AWS_ACCESS_KEY_ID configured
- [ ] AWS_SECRET_ACCESS_KEY configured
- [ ] AWS_REGION configured (default: us-east-1)
- [ ] Bedrock model ID configurable
- [ ] Polly voice ID configurable
- [ ] Transcribe language code configurable
- [ ] All configs documented in .env.example

## Technical Constraints

### Backend (Python/FastAPI)
- Use `boto3` for AWS SDK
- Maintain existing FastAPI structure
- Keep WebSocket streaming pattern
- Preserve JSON response formats
- Support async/await patterns

### Frontend (Next.js/React)
- Use `@aws-sdk/client-transcribe-streaming` for STT
- Use `@aws-sdk/client-polly` for TTS
- Maintain existing component structure
- Keep WebSocket communication pattern
- Support real-time audio streaming

### AWS Services
- **Bedrock**: Use Claude 3 or Llama 2 models
- **Polly**: Use Neural voices for quality
- **Transcribe**: Use streaming transcription API

## Non-Functional Requirements

### Performance
- LLM response latency: < 3 seconds
- TTS latency: < 1 second per sentence
- STT latency: < 500ms for partial results
- WebSocket connection stability: 99.9% uptime

### Reliability
- Automatic retry on transient failures
- Graceful fallback for service unavailability
- Error logging and monitoring
- Health checks for all AWS services

### Security
- AWS credentials never exposed in frontend
- All AWS calls proxied through backend
- CORS properly configured
- Input validation for all user inputs

### Cost Optimization
- Batch requests where possible
- Cache responses for repeated queries
- Monitor AWS usage and costs
- Implement request throttling

## Success Metrics

1. **Functional**: All AWS services integrated and working
2. **Performance**: Response times within SLA
3. **Reliability**: 99.9% uptime for AWS services
4. **User Experience**: Seamless voice interactions
5. **Cost**: AWS costs < $500/month for typical usage
6. **Accuracy**: Chemistry content accuracy maintained
