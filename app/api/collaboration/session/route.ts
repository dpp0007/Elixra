import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { getDatabase } from '@/lib/mongodb'
import { authOptions } from '@/lib/auth'

function generateRoomCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
    
    const roomCode = generateRoomCode()
    const db = await getDatabase()
    
    const collaborationSession = {
      roomCode,
      hostId: session.user.id,
      participants: [{
        userId: session.user.id,
        name: session.user.name || 'Host',
        color: '#3b82f6',
        isActive: true
      }],
      experiment: null,
      createdAt: new Date(),
      isActive: true
    }
    
    await db.collection('collaboration_sessions').insertOne(collaborationSession)
    
    return NextResponse.json({
      success: true,
      roomCode,
      session: collaborationSession
    })
  } catch (error) {
    console.error('Failed to create collaboration session:', error)
    return NextResponse.json(
      { error: 'Failed to create session' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const roomCode = searchParams.get('roomCode')
    
    if (!roomCode) {
      return NextResponse.json(
        { error: 'Room code required' },
        { status: 400 }
      )
    }
    
    const db = await getDatabase()
    const session = await db.collection('collaboration_sessions').findOne({
      roomCode,
      isActive: true
    })
    
    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(session)
  } catch (error) {
    console.error('Failed to fetch session:', error)
    return NextResponse.json(
      { error: 'Failed to fetch session' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
    
    const { roomCode, action, data } = await request.json()
    const db = await getDatabase()
    
    const collabSession = await db.collection('collaboration_sessions').findOne({
      roomCode,
      isActive: true
    })
    
    if (!collabSession) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      )
    }
    
    let update: any = {}
    
    switch (action) {
      case 'join':
        const newParticipant = {
          userId: session.user.id,
          name: session.user.name || 'User',
          color: data.color || '#10b981',
          isActive: true
        }
        update = {
          $push: { participants: newParticipant }
        }
        break
        
      case 'leave':
        update = {
          $pull: { participants: { userId: session.user.id } }
        }
        break
        
      case 'update-experiment':
        update = {
          $set: { experiment: data.experiment }
        }
        break
        
      case 'update-cursor':
        update = {
          $set: {
            [`participants.$[elem].cursor`]: data.cursor
          }
        }
        break
        
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }
    
    await db.collection('collaboration_sessions').updateOne(
      { roomCode },
      update,
      { arrayFilters: [{ 'elem.userId': session.user.id }] }
    )
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to update session:', error)
    return NextResponse.json(
      { error: 'Failed to update session' },
      { status: 500 }
    )
  }
}
