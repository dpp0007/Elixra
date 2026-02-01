import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { getDatabase } from '@/lib/mongodb'
import { authOptions } from '@/lib/auth'
import { ObjectId } from 'mongodb'

export async function GET(
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
    const experiment = await db
      .collection('experiments')
      .findOne({
        _id: new ObjectId(params.id),
        userId
      })

    if (!experiment) {
      return NextResponse.json(
        { error: 'Experiment not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(experiment)
  } catch (error) {
    console.error('Failed to fetch experiment:', error)
    return NextResponse.json(
      { error: 'Failed to fetch experiment' },
      { status: 500 }
    )
  }
}

export async function PUT(
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

    const body = await request.json()
    const { name, notes } = body

    const db = await getDatabase()
    const result = await db
      .collection('experiments')
      .updateOne(
        {
          _id: new ObjectId(params.id),
          userId
        },
        {
          $set: {
            experimentName: name,
            notes,
            updatedAt: new Date()
          }
        }
      )

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Experiment not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Experiment updated successfully'
    })
  } catch (error) {
    console.error('Failed to update experiment:', error)
    return NextResponse.json(
      { error: 'Failed to update experiment' },
      { status: 500 }
    )
  }
}

export async function DELETE(
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
    const result = await db
      .collection('experiments')
      .deleteOne({
        _id: new ObjectId(params.id),
        userId
      })

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Experiment not found' },
        { status: 404 }
      )
    }

    // Update user statistics if authenticated (fixed ObjectId conversion)
    if (session?.user?.id) {
      await db.collection('users').updateOne(
        { _id: new ObjectId(session.user.id as string) },
        { $inc: { 'stats.experimentsCount': -1 } }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Experiment deleted successfully'
    })
  } catch (error) {
    console.error('Failed to delete experiment:', error)
    return NextResponse.json(
      { error: 'Failed to delete experiment' },
      { status: 500 }
    )
  }
}