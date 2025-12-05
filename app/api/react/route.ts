import { NextRequest, NextResponse } from 'next/server'
import { Experiment, ReactionResult } from '@/types/chemistry'

export async function POST(request: NextRequest) {
  try {
    const experiment: Experiment = await request.json()
    
    if (!experiment.chemicals || experiment.chemicals.length < 2) {
      return NextResponse.json(
        { error: 'At least 2 chemicals are required for a reaction' },
        { status: 400 }
      )
    }

    try {
      // Use Ollama backend for reaction analysis
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'
      console.log('Backend URL:', backendUrl)
      
      // Prepare the prompt
      const chemicalsList = experiment.chemicals
        .map(c => `${c.chemical.name} (${c.chemical.formula}): ${c.amount} ${c.unit}`)
        .join('\n')

      // Calculate actual temperature from equipment
      let reactionTemperature = 25 // Room temperature default
      const bunsenBurner = experiment.equipment?.find(eq => eq.name === 'bunsen-burner')
      const hotPlate = experiment.equipment?.find(eq => eq.name === 'hot-plate')
      const stirrer = experiment.equipment?.find(eq => eq.name === 'magnetic-stirrer')
      
      if (bunsenBurner) {
        const burnerTemp = bunsenBurner.settings?.temperature || 0
        reactionTemperature = 25 + (burnerTemp / 1000) * 275 // 0-1000°C burner → 25-300°C solution
      } else if (hotPlate) {
        const plateTemp = hotPlate.settings?.temperature || 25
        reactionTemperature = Math.max(reactionTemperature, plateTemp)
      }
      
      if (stirrer) {
        const rpm = stirrer.settings?.rpm || 0
        reactionTemperature += (rpm / 1500) * 2 // Friction heat
      }
      
      // Calculate temperature effect on reaction rate (Arrhenius equation)
      const R = 8.314 // Gas constant J/(mol·K)
      const Ea = 50000 // Activation energy J/mol (typical value)
      const T = reactionTemperature + 273.15 // Convert to Kelvin
      const T0 = 298.15 // Room temperature in Kelvin
      const rateFactor = Math.exp(-Ea / (R * T)) / Math.exp(-Ea / (R * T0))
      const speedMultiplier = rateFactor.toFixed(2)
      
      // Include equipment information with calculated effects
      const equipmentInfo = experiment.equipment && experiment.equipment.length > 0
        ? `\n\nLab Equipment Active:\n${experiment.equipment.map(eq => {
            const settings = eq.settings || {}
            const settingsStr = Object.entries(settings)
              .map(([key, value]) => `${key}: ${value}`)
              .join(', ')
            return `- ${eq.name}: ${settingsStr}`
          }).join('\n')}\n\nCALCULATED EFFECTS:\n- Reaction Temperature: ${reactionTemperature.toFixed(1)}°C\n- Reaction Rate Multiplier: ${speedMultiplier}x (Arrhenius equation)\n- ${reactionTemperature > 100 ? 'WARNING: High temperature may cause decomposition, evaporation, or side reactions' : reactionTemperature > 50 ? 'Elevated temperature accelerates reaction significantly' : 'Room temperature - normal reaction kinetics'}`
        : '\n\nNo lab equipment active (room temperature 25°C, no stirring, no heating, rate multiplier: 1.0x)'

      // Try to call the analyze-reaction endpoint first, fall back to /chat if it doesn't exist
      let response = await fetch(`${backendUrl}/analyze-reaction`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: 'Analyze reaction',
          context: 'Chemical reaction analysis',
          chemicals: experiment.chemicals.map(c => c.chemical.name),
          equipment: experiment.equipment?.map(eq => eq.name) || []
        })
      })

      // If analyze-reaction doesn't exist (404), try the /chat endpoint
      if (response.status === 404) {
        console.log('analyze-reaction endpoint not found, trying /chat endpoint')
        const prompt = `You are an expert chemistry assistant. Analyze this chemical reaction and provide ONLY a valid JSON response (no markdown, no extra text):

Chemicals: ${experiment.chemicals.map(c => `${c.chemical.name} (${c.chemical.formula}): ${c.amount} ${c.unit}`).join(', ')}
${experiment.equipment && experiment.equipment.length > 0 ? `Equipment: ${experiment.equipment.map(eq => eq.name).join(', ')}` : ''}

Return ONLY this JSON structure:
{
  "color": "final solution color",
  "smell": "smell or 'none'",
  "precipitate": true/false,
  "precipitateColor": "color or null",
  "products": ["product1", "product2"],
  "balancedEquation": "balanced equation",
  "reactionType": "reaction type",
  "observations": ["observation1", "observation2"],
  "safetyNotes": ["note1", "note2"],
  "temperature": "increased/decreased/unchanged",
  "gasEvolution": true/false,
  "confidence": 0.5
}`

        response = await fetch(`${backendUrl}/chat`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: prompt,
            context: 'Chemical reaction analysis',
            chemicals: experiment.chemicals.map(c => c.chemical.name),
            equipment: experiment.equipment?.map(eq => eq.name) || []
          })
        })
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

      // Parse the JSON response
      let reactionResult: ReactionResult
      
      // Clean up the response
      let text = fullText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      
      // Try to extract JSON from the response - find the first { and last }
      const firstBrace = text.indexOf('{')
      const lastBrace = text.lastIndexOf('}')
      
      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        const jsonStr = text.substring(firstBrace, lastBrace + 1)
        try {
          reactionResult = JSON.parse(jsonStr)
        } catch (parseError) {
          console.error('JSON parse error:', parseError, 'JSON string:', jsonStr)
          throw new Error(`Failed to parse JSON response: ${parseError}`)
        }
      } else {
        throw new Error('No valid JSON found in AI response')
      }

      // Validate and ensure all required fields are present
      const validatedResult: ReactionResult = {
        color: reactionResult.color || 'unknown',
        smell: reactionResult.smell || 'none',
        precipitate: Boolean(reactionResult.precipitate),
        precipitateColor: reactionResult.precipitateColor || undefined,
        products: Array.isArray(reactionResult.products) ? reactionResult.products : ['Unknown'],
        balancedEquation: reactionResult.balancedEquation || 'Reaction equation unknown',
        reactionType: reactionResult.reactionType || 'unknown',
        observations: Array.isArray(reactionResult.observations) ? reactionResult.observations : ['Reaction occurred'],
        safetyNotes: Array.isArray(reactionResult.safetyNotes) ? reactionResult.safetyNotes : ['Handle with care'],
        temperature: reactionResult.temperature || 'unchanged',
        gasEvolution: Boolean(reactionResult.gasEvolution),
        confidence: typeof reactionResult.confidence === 'number' ? Math.min(1, Math.max(0, reactionResult.confidence)) : 0.5
      }

      console.log('Ollama Analysis successful:', validatedResult)
      return NextResponse.json(validatedResult)

    } catch (aiError) {
      console.error('Ollama AI error, using fallback:', aiError)
      
      // Fallback: Use deterministic reactions
      const fallbackResult = generateFallbackReaction(experiment)
      console.log('Using fallback reaction:', fallbackResult)
      return NextResponse.json(fallbackResult)
    }

  } catch (error) {
    console.error('Reaction analysis error:', error)
    return NextResponse.json(
      { error: 'Failed to analyze reaction' },
      { status: 500 }
    )
  }
}

// Fallback function for deterministic reactions
function generateFallbackReaction(experiment: Experiment): ReactionResult {
  const formulas = experiment.chemicals.map(c => c.chemical.formula)
  
  // Common reactions database
  const reactions: Record<string, ReactionResult> = {
    'NaCl+AgNO₃': {
      color: 'white precipitate',
      smell: 'none',
      precipitate: true,
      precipitateColor: 'white',
      products: ['AgCl', 'NaNO₃'],
      balancedEquation: 'NaCl + AgNO₃ → AgCl↓ + NaNO₃',
      reactionType: 'precipitation',
      observations: [
        'White precipitate forms immediately',
        'Solution becomes cloudy',
        'Precipitate settles at bottom'
      ],
      safetyNotes: ['Handle silver compounds with care', 'Avoid skin contact'],
      temperature: 'unchanged',
      gasEvolution: false,
      confidence: 0.95
    },
    'CuSO₄+NaOH': {
      color: 'blue precipitate',
      smell: 'none',
      precipitate: true,
      precipitateColor: 'blue',
      products: ['Cu(OH)₂', 'Na₂SO₄'],
      balancedEquation: 'CuSO₄ + 2NaOH → Cu(OH)₂↓ + Na₂SO₄',
      reactionType: 'precipitation',
      observations: [
        'Blue gelatinous precipitate forms',
        'Solution color changes from blue to lighter blue',
        'Precipitate is insoluble'
      ],
      safetyNotes: ['NaOH is corrosive', 'Wear protective equipment'],
      temperature: 'increased',
      gasEvolution: false,
      confidence: 0.92
    },
    'HCl+NaOH': {
      color: 'colorless',
      smell: 'none',
      precipitate: false,
      precipitateColor: undefined,
      products: ['NaCl', 'H₂O'],
      balancedEquation: 'HCl + NaOH → NaCl + H₂O',
      reactionType: 'acid-base neutralization',
      observations: [
        'Solution becomes warm',
        'No visible change in color',
        'pH changes to neutral'
      ],
      safetyNotes: ['Exothermic reaction', 'Handle acids and bases carefully'],
      temperature: 'increased',
      gasEvolution: false,
      confidence: 0.98
    }
  }

  // Try to find matching reaction
  const key1 = formulas.sort().join('+')
  const key2 = formulas.reverse().join('+')
  
  if (reactions[key1]) return reactions[key1]
  if (reactions[key2]) return reactions[key2]

  // Generic fallback
  return {
    color: 'mixed',
    smell: 'none',
    precipitate: false,
    precipitateColor: undefined,
    products: ['Mixed solution'],
    balancedEquation: `${formulas.join(' + ')} → Mixed solution`,
    reactionType: 'mixing',
    observations: [
      'Chemicals mixed together',
      'Solution color may change',
      'No obvious reaction observed'
    ],
    safetyNotes: ['Handle all chemicals with care', 'Wear protective equipment'],
    temperature: 'unchanged',
    gasEvolution: false,
    confidence: 0.5
  }
}
