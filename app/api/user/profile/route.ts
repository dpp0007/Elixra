export const runtime = 'nodejs'
export const dynamic = 'force-dynamic' // Mark as dynamic route (uses headers/session)

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { getDatabase } from '@/lib/mongodb'
import { authOptions } from '@/lib/auth'
import { ObjectId } from 'mongodb'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in to access your profile' },
        { status: 401 }
      )
    }

    const db = await getDatabase()
    
    // Get user profile with statistics - Convert string ID to ObjectId
    const user = await db.collection('users').findOne(
      { _id: new ObjectId(session.user.id as string) },
      { projection: { password: 0 } }
    )

    if (!user) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      )
    }

    // Get experiment statistics - Use string ID for experiments collection
    const experimentStats = await db.collection('experiments').aggregate([
      { $match: { userId: session.user.id } },
      {
        $group: {
          _id: null,
          totalExperiments: { $sum: 1 },
          reactionTypes: { $addToSet: '$reactionDetails.reactionType' },
          chemicalsUsed: { $addToSet: '$chemicals.chemical.name' },
          lastExperiment: { $max: '$timestamp' }
        }
      }
    ]).toArray()

    const stats = experimentStats[0] || {
      totalExperiments: 0,
      reactionTypes: [],
      chemicalsUsed: [],
      lastExperiment: null
    }

    return NextResponse.json({
      user: {
        ...user,
        stats: {
          ...user.stats,
          ...stats
        }
      }
    })
  } catch (error) {
    console.error('Failed to fetch user profile:', error)
    
    // Handle specific MongoDB errors
    if (error instanceof Error && error.message.includes('ObjectId')) {
      return NextResponse.json(
        { error: 'Invalid user ID format' },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Internal server error - Failed to fetch user profile' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized - Please sign in to update your profile' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { name, preferences, image } = body

    // Basic validation
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Name is required and must be a non-empty string' },
        { status: 400 }
      )
    }

    const db = await getDatabase()
    
    // Prepare update data
    const updateData: any = {
      name: name.trim(),
      preferences: preferences || {},
      updatedAt: new Date()
    }

    // Only update image if provided (allow null to remove image)
    if (image !== undefined) {
      updateData.image = image
    }
    
    // Update user profile - Convert string ID to ObjectId
    const result = await db.collection('users').updateOne(
      { _id: new ObjectId(session.user.id as string) },
      {
        $set: updateData
      }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully'
    })
  } catch (error) {
    console.error('Failed to update user profile:', error)
    
    // Handle specific MongoDB errors
    if (error instanceof Error && error.message.includes('ObjectId')) {
      return NextResponse.json(
        { error: 'Invalid user ID format' },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Internal server error - Failed to update user profile' },
      { status: 500 }
    )
  }
}