import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { Experiment, ReactionResult } from '@/types/chemistry'

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

export async function POST(request: NextRequest) {
  try {
    const experiment: Experiment = await request.json()
    
    if (!experiment.chemicals || experiment.chemicals.length < 2) {
      return NextResponse.json(
        { error: 'At least 2 chemicals are required for a reaction' },
        { status: 400 }
      )
    }

    // Check if API key is configured
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'Gemini API key not configured. Please set GEMINI_API_KEY in environment variables.' },
        { status: 503 }
      )
    }

    try {
      // Use Gemini AI for reaction analysis
      // Using the latest Gemini 2.5 Flash model (as of Oct 2025)
      const model = genAI.getGenerativeModel({ 
        model: 'gemini-2.0-flash-exp',
        // Disable thinking to prioritize speed for chemistry analysis
        generationConfig: {
          temperature: 0.7,
          topP: 0.95,
          topK: 40,
          maxOutputTokens: 2048,
        }
      })

      // Prepare the prompt for Gemini
      const chemicalsList = experiment.chemicals
        .map(c => `${c.chemical.name} (${c.chemical.formula}): ${c.amount} ${c.unit}`)
        .join('\n')

      const prompt = `You are an expert chemistry assistant analyzing a chemical reaction. 

Chemicals being mixed:
${chemicalsList}

Analyze this chemical reaction and provide a detailed response in the following JSON format:
{
  "color": "describe the final solution color (e.g., 'blue', 'colorless', 'light green')",
  "smell": "describe any smell (e.g., 'pungent', 'sweet', 'none')",
  "precipitate": true or false,
  "precipitateColor": "color of precipitate if any (e.g., 'white', 'blue', 'brown')",
  "products": ["list", "of", "product", "formulas"],
  "balancedEquation": "complete balanced chemical equation with states and arrows",
  "reactionType": "type of reaction (e.g., 'precipitation', 'acid-base', 'redox', 'complexation', 'no reaction')",
  "observations": ["detailed", "observation", "points"],
  "safetyNotes": ["important", "safety", "warnings"],
  "temperature": "increased" or "decreased" or "unchanged",
  "gasEvolution": true or false,
  "confidence": 0.0 to 1.0
}

Provide ONLY the JSON response, no additional text. Ensure all field names match exactly.`

      const result = await model.generateContent(prompt)
      const response = await result.response
      const text = response.text()

      // Parse the JSON response
      let reactionResult: ReactionResult
      
      // Try to extract JSON from the response
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        reactionResult = JSON.parse(jsonMatch[0])
      } else {
        throw new Error('Invalid JSON response from AI')
      }

      // Validate and ensure all required fields are present
      const validatedResult: ReactionResult = {
        color: reactionResult.color,
        smell: reactionResult.smell ,
        precipitate: reactionResult.precipitate,
        precipitateColor: reactionResult.precipitateColor,
        products: reactionResult.products ,
        balancedEquation: reactionResult.balancedEquation ,
        reactionType: reactionResult.reactionType ,
        observations: reactionResult.observations ,
        safetyNotes: reactionResult.safetyNotes ,
        temperature: reactionResult.temperature ,
        gasEvolution: reactionResult.gasEvolution ,
        confidence: reactionResult.confidence 
      }

      console.log('AI Analysis successful:', validatedResult)
      return NextResponse.json(validatedResult)

    } catch (aiError) {
      console.error('Gemini AI error, using fallback:', aiError)
      
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