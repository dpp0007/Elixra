export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { getDatabase } from '@/lib/mongodb'
import { authOptions } from '@/lib/auth'
import { ExperimentLog } from '@/types/chemistry'
import { ObjectId } from 'mongodb'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const db = await getDatabase()
    const collection = db.collection('experiments')

    // retention policy: delete unsaved experiments older than 30 days
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    await collection.deleteMany({
      userId: session.user.id,
      isSaved: { $ne: true },
      timestamp: { $lt: thirtyDaysAgo }
    })

    // Fetch experiments
    const experiments = await collection
      .find({ userId: session.user.id })
      .sort({ timestamp: -1 })
      .toArray()

    return NextResponse.json({ 
      experiments: experiments.map(exp => ({
        ...exp,
        _id: exp._id.toString()
      }))
    })
  } catch (error) {
    console.error('Failed to fetch experiments:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    // Basic validation
    if (!body.experimentName || !body.chemicals) {
       return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const experiment: ExperimentLog = {
      ...body,
      userId: session.user.id,
      timestamp: new Date(),
      // Ensure isSaved is set if provided, default to false
      isSaved: body.isSaved || false
    }

    const db = await getDatabase()
    const { _id, ...experimentData } = experiment
    const result = await db.collection('experiments').insertOne(experimentData)

    return NextResponse.json({ 
      success: true, 
      experiment: { ...experiment, _id: result.insertedId } 
    })
  } catch (error) {
    console.error('Failed to save experiment:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
       return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Missing experiment ID' },
        { status: 400 }
      )
    }

    const db = await getDatabase()
    const result = await db.collection('experiments').deleteOne({
      _id: new ObjectId(id),
      userId: session.user.id
    })

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Experiment not found or unauthorized' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete experiment:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
       return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { id, isSaved } = body

    if (!id || typeof isSaved !== 'boolean' || !ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid or missing fields' },
        { status: 400 }
      )
    }

    const db = await getDatabase()
    const result = await db.collection('experiments').updateOne(
      { _id: new ObjectId(id), userId: session.user.id },
      { $set: { isSaved } }
    )

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Experiment not found or unauthorized' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to update experiment:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
