import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { formula, atoms } = await request.json()
    
    const atomList = atoms.map((a: any) => a.element).join(', ')
    
    const prompt = `Analyze the molecule with formula ${formula} containing atoms: ${atomList}

Provide:
1. IUPAC name (if applicable)
2. Common name
3. Molecular properties:
   - Molecular weight
   - Polarity
   - Bond angles
   - Geometry (linear, bent, tetrahedral, etc.)
4. Chemical properties:
   - Reactivity
   - Acidity/Basicity
   - Common reactions
5. Uses and applications
6. Safety information

Format as JSON:
{
  "formula": "${formula}",
  "iupacName": "...",
  "commonName": "...",
  "molecularWeight": 18.015,
  "properties": {
    "polarity": "polar/nonpolar",
    "geometry": "bent",
    "bondAngles": "104.5°",
    "hybridization": "sp3"
  },
  "chemical": {
    "reactivity": "...",
    "acidity": "neutral/acidic/basic",
    "commonReactions": ["..."]
  },
  "uses": ["..."],
  "safety": "..."
}

Be scientifically accurate. Return ONLY valid JSON.`

    // Use Gemini backend for molecule analysis
    // Default to 127.0.0.1 to avoid localhost resolution issues
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8000'
    
    const response = await fetch(`${backendUrl}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: prompt,
        context: `Molecule analysis for ${formula}`,
        chemicals: []
      })
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
    
    // Try to extract JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      text = jsonMatch[0]
    }
    
    const analysis = JSON.parse(text)
    
    return NextResponse.json({ 
      success: true,
      analysis,
      generatedAt: new Date().toISOString(),
      source: 'ollama'
    })
  } catch (error) {
    console.error('Molecule analysis error:', error)
    return NextResponse.json({ 
      error: 'Failed to analyze molecule',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
