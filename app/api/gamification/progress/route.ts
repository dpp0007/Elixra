import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { getDatabase } from '@/lib/mongodb'
import { authOptions } from '@/lib/auth'
import { checkAchievements, calculateXP, getLevelFromXP } from '@/lib/achievements'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const userId = session?.user?.id || 'anonymous'
    
    const db = await getDatabase()
    
    let progress = await db.collection('user_progress').findOne({ userId })
    
    if (!progress) {
      progress = {
        userId,
        level: 1,
        xp: 0,
        achievements: [],
        experimentsCompleted: 0,
        accuracyScore: 0,
        accuracyStreak: 0,
        streak: 0,
        lastActive: new Date()
      }
      await db.collection('user_progress').insertOne(progress)
    }
    
    return NextResponse.json(progress)
  } catch (error) {
    console.error('Failed to fetch progress:', error)
    return NextResponse.json(
      { error: 'Failed to fetch progress' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const userId = session?.user?.id || 'anonymous'
    const { action, data } = await request.json()
    
    const db = await getDatabase()
    
    let progress = await db.collection('user_progress').findOne({ userId })
    
    if (!progress) {
      progress = {
        userId,
        level: 1,
        xp: 0,
        achievements: [],
        experimentsCompleted: 0,
        accuracyScore: 0,
        accuracyStreak: 0,
        streak: 0,
        lastActive: new Date()
      }
    }
    
    // Add XP based on action
    const xpGained = calculateXP(action)
    progress.xp += xpGained
    progress.level = getLevelFromXP(progress.xp)
    
    // Update specific metrics
    if (action === 'complete-experiment') {
      progress.experimentsCompleted += 1
      
      // Update streak
      const lastActive = new Date(progress.lastActive)
      const today = new Date()
      const daysDiff = Math.floor((today.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24))
      
      if (daysDiff === 1) {
        progress.streak += 1
      } else if (daysDiff > 1) {
        progress.streak = 1
      }
      
      progress.lastActive = today
    }
    
    if (data?.accuracy) {
      progress.accuracyScore = data.accuracy
      if (data.accuracy >= 90) {
        progress.accuracyStreak = (progress.accuracyStreak || 0) + 1
      } else {
        progress.accuracyStreak = 0
      }
    }
    
    // Check for new achievements
    const newAchievements = checkAchievements(progress)
    if (newAchievements.length > 0) {
      progress.achievements = [...(progress.achievements || []), ...newAchievements]
    }
    
    // Save to database
    await db.collection('user_progress').updateOne(
      { userId },
      { $set: progress },
      { upsert: true }
    )
    
    return NextResponse.json({
      success: true,
      progress,
      xpGained,
      newAchievements
    })
  } catch (error) {
    console.error('Failed to update progress:', error)
    return NextResponse.json(
      { error: 'Failed to update progress' },
      { status: 500 }
    )
  }
}
