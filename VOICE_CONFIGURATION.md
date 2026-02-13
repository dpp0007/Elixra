# 🎙️ Avatar Voice Configuration Guide

## Quick Start

The avatar uses your browser's built-in text-to-speech (Web Speech API). Different voices are available depending on your operating system.

## Available Voices by OS

### Windows 🪟
- **Microsoft Zira** (Female) - Default, warm and natural
- **Microsoft David** (Male) - Professional and clear
- **Microsoft Mark** (Male) - Friendly and casual
- **Microsoft Hazel** (Female) - Warm and engaging
- **Microsoft Aria** (Female) - Modern and professional

### macOS 🍎
- **Samantha** (Female) - Default, natural sounding
- **Victoria** (Female) - British accent
- **Karen** (Female) - Australian accent
- **Moira** (Female) - Irish accent
- **Alex** (Male) - Professional
- **Bruce** (Male) - Australian

### Linux 🐧
- **eSpeak** - Multiple languages
- **Festival** - Open source
- **MBROLA** - Multilingual

## How to Change Voice

### Method 1: Browser Settings (Easiest)

**Chrome/Edge:**
1. Settings → Advanced → Accessibility
2. Find "Text-to-speech" or "Speech"
3. Select your preferred voice
4. Restart the app

**Safari (macOS):**
1. System Preferences → Accessibility → Speech
2. Select "System voice"
3. Choose your preferred voice
4. Restart Safari

### Method 2: Modify Code

Edit `components/StreamingChat.tsx` in the `speakNextInQueue()` function:

```typescript
// Find this section:
const voices = synthRef.current.getVoices()

// Change this:
const femaleVoice = voices.find(voice => 
  voice.name.includes('Zira')  // Change to: David, Mark, Hazel, Aria
)

// Or select by language:
const femaleVoice = voices.find(voice => 
  voice.lang.includes('en-GB')  // British English
)
```

### Method 3: Add Voice Selector UI

Add a dropdown to let users choose voices:

```typescript
// In StreamingChat component:
const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null)

// Add to UI:
<select onChange={(e) => {
  const voices = synthRef.current?.getVoices() || []
  const voice = voices.find(v => v.name === e.target.value)
  if (voice) setSelectedVoice(voice)
}}>
  {synthRef.current?.getVoices().map((voice, i) => (
    <option key={i} value={voice.name}>
      {voice.name} ({voice.lang})
    </option>
  ))}
</select>
```

## Voice Properties

Adjust these in `components/StreamingChat.tsx`:

```typescript
const utterance = new SpeechSynthesisUtterance(text)

utterance.rate = 1.1      // Speed: 0.1 (slow) to 2.0 (fast)
utterance.pitch = 1.0     // Pitch: 0.0 (low) to 2.0 (high)
utterance.volume = 1.0    // Volume: 0.0 (silent) to 1.0 (loud)
utterance.voice = voice   // Select specific voice
```

## Recommended Presets

### Professional Teaching
```
Voice: Zira (Windows) or Samantha (Mac)
Rate: 1.0
Pitch: 1.0
Volume: 1.0
```

### Friendly Learning
```
Voice: Hazel (Windows) or Victoria (Mac)
Rate: 1.1
Pitch: 1.1
Volume: 1.0
```

### Engaging Explanations
```
Voice: Aria (Windows) or Moira (Mac)
Rate: 0.95
Pitch: 1.05
Volume: 1.0
```

## Troubleshooting

### No voice playing
```javascript
// Check if supported
console.log(window.speechSynthesis)

// Check available voices
console.log(window.speechSynthesis.getVoices())

// Wait for voices to load
window.speechSynthesis.onvoiceschanged = () => {
  console.log(window.speechSynthesis.getVoices())
}
```

### Voice sounds robotic
- Reduce rate to 0.9-1.0
- Adjust pitch to 0.9-1.1
- Try different voice

### Voice too quiet
- Increase volume to 1.0
- Check system volume
- Try different voice

### Voice not changing
- Clear browser cache
- Restart browser
- Check if voice available on your OS
- Try selecting by language

## Advanced: Premium TTS Services

### Google Cloud Text-to-Speech
```bash
npm install @google-cloud/text-to-speech
```

### Azure Speech Services
```bash
npm install microsoft-cognitiveservices-speech-sdk
```

### ElevenLabs (Premium AI Voices)
```bash
npm install elevenlabs
```

## Testing Your Voice

1. Open the avatar page
2. Click the microphone button
3. Listen to the greeting
4. Provide your name
5. Listen to the response

The voice you hear is the one currently selected!

## Tips

✅ Test different voices with your students
✅ Choose voices matching your teaching style
✅ Adjust rate/pitch for clarity
✅ Use consistent voice throughout session
✅ Consider accessibility (clear pronunciation)
✅ Match voice to avatar personality
✅ Test on different devices/browsers

## Need Help?

Check the main README.md for more details on voice configuration and advanced options.
