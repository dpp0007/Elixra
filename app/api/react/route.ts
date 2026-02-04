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

    // Use Gemini backend for reaction analysis
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'
    console.log('Analyzing reaction with backend:', backendUrl)
    
    // Prepare equipment data
    const equipmentData = experiment.equipment?.map(eq => eq.name) || []
    console.log('✓ Equipment being sent to backend:', equipmentData)
    console.log('✓ Chemicals:', experiment.chemicals.map(c => c.chemical.name))
    
    // Call the analyze-reaction endpoint
    const response = await fetch(`${backendUrl}/analyze-reaction`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: 'Analyze reaction',
        context: 'Chemical reaction analysis',
        chemicals: experiment.chemicals.map(c => c.chemical.name),
        equipment: equipmentData
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Backend error:', response.status, errorText)
      throw new Error(`Backend returned ${response.status}: ${errorText}`)
    }

    // Parse the JSON response directly
    const reactionData = await response.json()
    console.log('✓ Reaction analysis received:', reactionData)

    // Validate and ensure all required fields are present
    const validatedResult: ReactionResult = {
      color: reactionData.color || 'unknown',
      smell: reactionData.smell || 'none',
      precipitate: Boolean(reactionData.precipitate),
      precipitateColor: reactionData.precipitateColor || undefined,
      products: Array.isArray(reactionData.products) ? reactionData.products : ['Unknown'],
      balancedEquation: reactionData.balancedEquation || 'Reaction equation unknown',
      reactionType: reactionData.reactionType || 'unknown',
      visualObservation: reactionData.visualObservation || 'No observation details provided',
      observations: Array.isArray(reactionData.observations) ? reactionData.observations : ['Reaction occurred'],
      safetyNotes: Array.isArray(reactionData.safetyNotes) ? reactionData.safetyNotes : ['Handle with care'],
      temperature: reactionData.temperature || 'unchanged',
      temperatureChange: reactionData.temperatureChange || (reactionData.temperature === 'increased' ? 'exothermic' : reactionData.temperature === 'decreased' ? 'endothermic' : 'none'),
      gasEvolution: reactionData.gasEvolution || null,
      confidence: typeof reactionData.confidence === 'number' ? Math.min(1, Math.max(0, reactionData.confidence)) : 0.5,
      
      // New structured data fields
      instrumentAnalysis: reactionData.instrumentAnalysis || undefined,
      productsInfo: Array.isArray(reactionData.productsInfo) ? reactionData.productsInfo : [],
      explanation: reactionData.explanation || {
        mechanism: 'Analysis not available',
        bondBreaking: 'Analysis not available',
        energyProfile: 'Analysis not available',
        atomicLevel: 'Analysis not available',
        keyConcept: 'Analysis not available'
      },
      safety: reactionData.safety || {
        riskLevel: 'Low',
        precautions: 'Standard lab safety protocols apply',
        disposal: 'Dispose according to local regulations',
        firstAid: 'Rinse with water if contact occurs',
        generalHazards: 'None identified'
      },
      phChange: reactionData.phChange || null,
      ph: reactionData.phChange ? parseFloat(reactionData.phChange) : undefined, // backend sends phChange string/number
      emission: reactionData.emission || null,
      stateChange: reactionData.stateChange || null
    }

    console.log('✓ Gemini Analysis successful:', validatedResult)
    return NextResponse.json(validatedResult)

  } catch (error) {
    console.error('Reaction analysis error:', error)
    return NextResponse.json(
      { error: `Failed to analyze reaction: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    )
  }
}
