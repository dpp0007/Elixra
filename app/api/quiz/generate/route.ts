import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

interface QuizConfig {
  difficulty: 'easy' | 'medium' | 'hard'
  num_questions: number
  question_types: string[]
  include_timer: boolean
  time_limit_per_question: number | null
}

export async function POST(request: NextRequest) {
  try {
    const config: QuizConfig = await request.json()
    // Default to 127.0.0.1 to avoid localhost resolution issues
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8000'

    console.log('Quiz config:', config)

    // Call backend to generate quiz
    const response = await fetch(`${backendUrl}/quiz/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(config)
    })

    const contentType = response.headers.get('content-type')
    if (contentType && contentType.includes('text/html')) {
        const text = await response.text()
        if (text.includes('This page could not be found') || text.includes('Next.js')) {
            throw new Error(`Backend URL (${backendUrl}) appears to be pointing to the frontend application. Please ensure the Python backend is running on port 8000.`)
        }
        throw new Error(`Backend returned HTML instead of JSON. Status: ${response.status}`)
    }

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Backend error:', response.status, errorText)
      throw new Error(`Backend returned ${response.status}: ${errorText}`)
    }

    const data = await response.json()
    console.log('Quiz generated:', data)

    return NextResponse.json(data)
  } catch (error) {
    console.error('Quiz generation error:', error)
    return NextResponse.json(
      { error: `Failed to generate quiz: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // Default to 127.0.0.1 to avoid localhost resolution issues
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8000'
    
    const timestamp = Date.now()
    const randomSeed = Math.random()
    
    const prompt = `Generate 5 UNIQUE chemistry reaction quiz questions (seed: ${randomSeed}). Make them different from typical textbook examples. For each question:
1. Provide 2 reactants (chemical formulas)
2. Ask what product is formed
3. Provide 4 multiple choice options (one correct)
4. Include a detailed explanation
5. Assign points (10-20 based on difficulty)

IMPORTANT: Generate DIFFERENT questions each time. Use varied reaction types and compounds.

Format as JSON array with this structure:
[
  {
    "id": "q1",
    "reactants": ["HCl", "NaOH"],
    "question": "What is the product when Hydrochloric acid reacts with Sodium hydroxide?",
    "options": ["NaCl + H₂O", "Na₂O + HCl", "NaH + ClO", "No reaction"],
    "correctAnswer": 0,
    "explanation": "This is a neutralization reaction...",
    "points": 10
  }
]

Make questions progressively harder. Include:
- Neutralization reactions
- Precipitation reactions
- Displacement reactions
- Oxidation reactions
- Complex reactions

Return ONLY valid JSON, no markdown or extra text.`

    // Call Gemini backend
    const response = await fetch(`${backendUrl}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: prompt,
        context: 'Chemistry quiz generation',
        chemicals: []
      })
    })

    if (!response.ok) {
      throw new Error(`Backend returned ${response.status}`)
    }

    // Read the streaming response
    const reader = response.body?.getReader()
    const decoder = new TextDecoder()
    let fullText = ''

    if (reader) {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        
        const chunk = decoder.decode(value)
        const lines = chunk.split('\n').filter(line => line.trim())
        
        for (const line of lines) {
          try {
            const data = JSON.parse(line)
            if (data.token) {
              fullText += data.token
            }
          } catch (e) {
            // Ignore parse errors
          }
        }
      }
    }
    
    // Clean up the response
    let text = fullText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
    
    // Try to extract JSON array from the response
    const jsonMatch = text.match(/\[[\s\S]*\]/)
    if (jsonMatch) {
      text = jsonMatch[0]
    }
    
    const questions = JSON.parse(text)
    
    return NextResponse.json({ 
      success: true,
      questions,
      generatedAt: new Date().toISOString(),
      source: 'ollama'
    })
  } catch (error) {
    console.error('Quiz generation error:', error)
    return NextResponse.json({ 
      error: 'Failed to generate quiz',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
