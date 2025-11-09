import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/mongodb'

function generateRoomCode(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase()
}

export async function POST(request: NextRequest) {
  try {
    // Generate guest user ID - no auth required for collaboration
    const userId = `guest-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const userName = 'Host'
    
    const roomCode = generateRoomCode()
    const db = await getDatabase()
    
    const collaborationSession = {
      roomCode,
      hostId: userId,
      participants: [{
        userId: userId,
        name: userName,
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
    const { roomCode, action, data } = await request.json()
    
    // Get user info from request data
    const userId = data?.userId || `guest-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const userName = data?.name || 'Guest User'
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
    
    switch (action) {
      case 'join':
        const newParticipant = {
          userId: userId,
          name: userName,
          color: data.color || '#10b981',
          isActive: true
        }
        
        // Check if user already exists
        const existingParticipant = collabSession.participants.find(
          (p: any) => p.userId === userId
        )
        
        if (!existingParticipant) {
          await db.collection('collaboration_sessions').updateOne(
            { roomCode } as any,
            { $push: { participants: newParticipant } } as any
          )
        }
        break
        
      case 'leave':
        await db.collection('collaboration_sessions').updateOne(
          { roomCode } as any,
          { $pull: { participants: { userId: userId } } } as any
        )
        break
        
      case 'update-experiment':
        await db.collection('collaboration_sessions').updateOne(
          { roomCode },
          { $set: { experiment: data.experiment } }
        )
        break
        
      case 'update-cursor':
        // Update cursor for specific user
        await db.collection('collaboration_sessions').updateOne(
          { roomCode, 'participants.userId': userId },
          { $set: { 'participants.$.cursor': data.cursor } }
        )
        break
        
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to update session:', error)
    return NextResponse.json(
      { error: 'Failed to update session' },
      { status: 500 }
    )
  }
}
