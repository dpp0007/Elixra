import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { getDatabase } from '@/lib/mongodb'
import { authOptions } from '@/lib/auth'
import { ObjectId } from 'mongodb'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const difficulty = searchParams.get('difficulty')
    const search = searchParams.get('search')
    const sort = searchParams.get('sort') || 'popular'
    
    const db = await getDatabase()
    
    const query: any = {}
    if (category) query.tags = category
    if (difficulty) query.difficulty = difficulty
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } }
      ]
    }
    
    let sortQuery: any = {}
    switch (sort) {
      case 'popular':
        sortQuery = { downloads: -1 }
        break
      case 'rating':
        sortQuery = { rating: -1 }
        break
      case 'recent':
        sortQuery = { createdAt: -1 }
        break
      default:
        sortQuery = { downloads: -1 }
    }
    
    const experiments = await db
      .collection('marketplace_experiments')
      .find(query)
      .sort(sortQuery)
      .limit(50)
      .toArray()
    
    return NextResponse.json({ experiments })
  } catch (error) {
    console.error('Failed to fetch marketplace experiments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch experiments' },
      { status: 500 }
    )
  }
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
    
    const body = await request.json()
    const db = await getDatabase()
    
    const experiment = {
      authorId: session.user.id,
      authorName: session.user.name || 'Anonymous',
      title: body.title,
      description: body.description,
      chemicals: body.chemicals || [],
      difficulty: body.difficulty || 'beginner',
      rating: 0,
      downloads: 0,
      price: body.price || 0,
      isPremium: body.isPremium || false,
      tags: body.tags || [],
      experimentData: body.experimentData,
      createdAt: new Date()
    }
    
    const result = await db.collection('marketplace_experiments').insertOne(experiment)
    
    return NextResponse.json({
      success: true,
      experimentId: result.insertedId
    })
  } catch (error) {
    console.error('Failed to publish experiment:', error)
    return NextResponse.json(
      { error: 'Failed to publish experiment' },
      { status: 500 }
    )
  }
}
