import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { getDatabase } from '@/lib/mongodb'
import { authOptions } from '@/lib/auth'
import { generateDailyChallenge, checkChallengeCompletion } from '@/lib/challenges'

export async function GET(request: NextRequest) {
  try {
    const db = await getDatabase()
    
    // Get today's challenge
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    let challenge = await db.collection('daily_challenges').findOne({
      date: { $gte: today }
    })
    
    if (!challenge) {
      // Generate new daily challenge
      const newChallenge = generateDailyChallenge()
      challenge = {
        ...newChallenge,
        date: today,
        completedBy: []
      }
      await db.collection('daily_challenges').insertOne(challenge)
    }
    
    return NextResponse.json(challenge)
  } catch (error) {
    console.error('Failed to fetch daily challenge:', error)
    return NextResponse.json(
      { error: 'Failed to fetch daily challenge' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const userId = session?.user?.id || 'anonymous'
    const { challengeId, experiment, reactionResult } = await request.json()
    
    const db = await getDatabase()
    
    // Get challenge
    const challenge = await db.collection('daily_challenges').findOne({
      id: challengeId
    })
    
    if (!challenge) {
      return NextResponse.json(
        { error: 'Challenge not found' },
        { status: 404 }
      )
    }
    
    // Check if already completed
    if (challenge.completedBy?.includes(userId)) {
      return NextResponse.json({
        success: false,
        message: 'Challenge already completed'
      })
    }
    
    // Check completion
    const isCompleted = checkChallengeCompletion(challenge, experiment, reactionResult)
    
    if (isCompleted) {
      // Mark as completed
      await db.collection('daily_challenges').updateOne(
        { id: challengeId },
        { $push: { completedBy: userId } }
      )
      
      // Award points
      await db.collection('user_progress').updateOne(
        { userId },
        { 
          $inc: { xp: challenge.points },
          $push: { 
            completedChallenges: {
              challengeId,
              completedAt: new Date(),
              points: challenge.points
            }
          }
        },
        { upsert: true }
      )
      
      return NextResponse.json({
        success: true,
        points: challenge.points,
        message: 'Challenge completed!'
      })
    }
    
    return NextResponse.json({
      success: false,
      message: 'Challenge requirements not met'
    })
  } catch (error) {
    console.error('Failed to complete challenge:', error)
    return NextResponse.json(
      { error: 'Failed to complete challenge' },
      { status: 500 }
    )
  }
}
