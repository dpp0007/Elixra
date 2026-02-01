import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { getDatabase } from '@/lib/mongodb'
import { authOptions } from '@/lib/auth'
import { ObjectId } from 'mongodb'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const userId = session?.user?.id || 'anonymous'
    const { searchParams } = new URL(request.url)
    const experimentId = searchParams.get('experimentId')
    
    const db = await getDatabase()
    
    const query: any = { userId }
    if (experimentId) {
      query.experimentId = experimentId
    }
    
    const entries = await db
      .collection('lab_notebook')
      .find(query)
      .sort({ timestamp: -1 })
      .toArray()
    
    return NextResponse.json({ entries })
  } catch (error) {
    console.error('Failed to fetch notebook entries:', error)
    return NextResponse.json(
      { error: 'Failed to fetch notebook entries' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const userId = session?.user?.id || 'anonymous'
    const body = await request.json()
    
    const entry = {
      userId,
      experimentId: body.experimentId,
      hypothesis: body.hypothesis || '',
      observations: body.observations || [],
      conclusion: body.conclusion || '',
      drawings: body.drawings || [],
      tags: body.tags || [],
      timestamp: new Date()
    }
    
    const db = await getDatabase()
    const result = await db.collection('lab_notebook').insertOne(entry)
    
    return NextResponse.json({
      success: true,
      entryId: result.insertedId
    })
  } catch (error) {
    console.error('Failed to create notebook entry:', error)
    return NextResponse.json(
      { error: 'Failed to create notebook entry' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const userId = session?.user?.id || 'anonymous'
    const body = await request.json()
    const { entryId, ...updates } = body
    
    if (!ObjectId.isValid(entryId)) {
      return NextResponse.json(
        { error: 'Invalid entry ID' },
        { status: 400 }
      )
    }
    
    const db = await getDatabase()
    const result = await db.collection('lab_notebook').updateOne(
      { _id: new ObjectId(entryId), userId },
      { $set: { ...updates, updatedAt: new Date() } }
    )
    
    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Entry not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to update notebook entry:', error)
    return NextResponse.json(
      { error: 'Failed to update notebook entry' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const userId = session?.user?.id || 'anonymous'
    const { searchParams } = new URL(request.url)
    const entryId = searchParams.get('entryId')
    
    if (!entryId || !ObjectId.isValid(entryId)) {
      return NextResponse.json(
        { error: 'Invalid entry ID' },
        { status: 400 }
      )
    }
    
    const db = await getDatabase()
    const result = await db.collection('lab_notebook').deleteOne({
      _id: new ObjectId(entryId),
      userId
    })
    
    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Entry not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete notebook entry:', error)
    return NextResponse.json(
      { error: 'Failed to delete notebook entry' },
      { status: 500 }
    )
  }
}
