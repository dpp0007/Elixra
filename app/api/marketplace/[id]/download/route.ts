import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { getDatabase } from '@/lib/mongodb'
import { authOptions } from '@/lib/auth'
import { ObjectId } from 'mongodb'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    const userId = session?.user?.id || 'anonymous'
    
    if (!ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { error: 'Invalid experiment ID' },
        { status: 400 }
      )
    }
    
    const db = await getDatabase()
    
    // Get experiment
    const experiment = await db.collection('marketplace_experiments').findOne({
      _id: new ObjectId(params.id)
    })
    
    if (!experiment) {
      return NextResponse.json(
        { error: 'Experiment not found' },
        { status: 404 }
      )
    }
    
    // Increment download count
    await db.collection('marketplace_experiments').updateOne(
      { _id: new ObjectId(params.id) },
      { $inc: { downloads: 1 } }
    )
    
    // Track download
    await db.collection('marketplace_downloads').insertOne({
      experimentId: params.id,
      userId,
      downloadedAt: new Date()
    })
    
    return NextResponse.json({
      success: true,
      experiment: experiment.experimentData
    })
  } catch (error) {
    console.error('Failed to download experiment:', error)
    return NextResponse.json(
      { error: 'Failed to download experiment' },
      { status: 500 }
    )
  }
}
