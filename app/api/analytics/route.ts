import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { getDatabase } from '@/lib/mongodb'
import { authOptions } from '@/lib/auth'

// Mark as dynamic route (uses headers/session)
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const userId = session?.user?.id || 'anonymous'
    
    const db = await getDatabase()
    
    // Get all user experiments
    const experiments = await db
      .collection('experiments')
      .find({ userId })
      .toArray()
    
    // Calculate analytics
    const totalExperiments = experiments.length
    
    // Success rate (experiments with reaction results)
    const successfulExperiments = experiments.filter(exp => exp.reactionDetails).length
    const successRate = totalExperiments > 0 
      ? (successfulExperiments / totalExperiments) * 100 
      : 0
    
    // Average accuracy (based on AI confidence)
    const accuracyScores = experiments
      .filter(exp => exp.reactionDetails?.confidence)
      .map(exp => exp.reactionDetails.confidence * 100)
    const averageAccuracy = accuracyScores.length > 0
      ? accuracyScores.reduce((a, b) => a + b, 0) / accuracyScores.length
      : 0
    
    // Most used chemicals
    const chemicalCounts: Record<string, number> = {}
    experiments.forEach(exp => {
      exp.chemicals?.forEach((chem: any) => {
        const name = chem.chemical.name
        chemicalCounts[name] = (chemicalCounts[name] || 0) + 1
      })
    })
    const mostUsedChemicals = Object.entries(chemicalCounts)
      .map(([chemical, count]) => ({ chemical, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
    
    // Experiments per day (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    const recentExperiments = experiments.filter(exp => 
      new Date(exp.timestamp) >= thirtyDaysAgo
    )
    
    const experimentsPerDay: Record<string, number> = {}
    recentExperiments.forEach(exp => {
      const date = new Date(exp.timestamp).toISOString().split('T')[0]
      experimentsPerDay[date] = (experimentsPerDay[date] || 0) + 1
    })
    
    const experimentsPerDayArray = Object.entries(experimentsPerDay)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date))
    
    // Reaction types distribution
    const reactionTypeCounts: Record<string, number> = {}
    experiments.forEach(exp => {
      if (exp.reactionDetails?.reactionType) {
        const type = exp.reactionDetails.reactionType
        reactionTypeCounts[type] = (reactionTypeCounts[type] || 0) + 1
      }
    })
    const reactionTypes = Object.entries(reactionTypeCounts)
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count)
    
    // Time spent (estimate based on experiment count and average time)
    const estimatedTimePerExperiment = 5 // minutes
    const timeSpent = totalExperiments * estimatedTimePerExperiment
    
    const analytics = {
      userId,
      totalExperiments,
      successRate: Math.round(successRate * 10) / 10,
      averageAccuracy: Math.round(averageAccuracy * 10) / 10,
      mostUsedChemicals,
      timeSpent,
      experimentsPerDay: experimentsPerDayArray,
      reactionTypes,
      generatedAt: new Date()
    }
    
    return NextResponse.json(analytics)
  } catch (error) {
    console.error('Failed to generate analytics:', error)
    return NextResponse.json(
      { error: 'Failed to generate analytics' },
      { status: 500 }
    )
  }
}
