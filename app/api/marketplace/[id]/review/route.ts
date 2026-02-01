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
    if (!ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { error: 'Invalid experiment ID' },
        { status: 400 }
      )
    }
    
    const db = await getDatabase()
    const reviews = await db
      .collection('marketplace_reviews')
      .find({ experimentId: params.id })
      .sort({ createdAt: -1 })
      .toArray()
    
    return NextResponse.json({ reviews })
  } catch (error) {
    console.error('Failed to fetch reviews:', error)
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }
    
    if (!ObjectId.isValid(params.id)) {
      return NextResponse.json(
        { error: 'Invalid experiment ID' },
        { status: 400 }
      )
    }
    
    const { rating, comment } = await request.json()
    
    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Invalid rating' },
        { status: 400 }
      )
    }
    
    const db = await getDatabase()
    
    // Check if user already reviewed
    const existingReview = await db.collection('marketplace_reviews').findOne({
      experimentId: params.id,
      userId: session.user.id
    })
    
    if (existingReview) {
      return NextResponse.json(
        { error: 'You have already reviewed this experiment' },
        { status: 400 }
      )
    }
    
    // Create review
    const review = {
      experimentId: params.id,
      userId: session.user.id,
      userName: session.user.name || 'Anonymous',
      rating,
      comment: comment || '',
      helpful: 0,
      createdAt: new Date()
    }
    
    await db.collection('marketplace_reviews').insertOne(review)
    
    // Update experiment average rating
    const allReviews = await db.collection('marketplace_reviews')
      .find({ experimentId: params.id })
      .toArray()
    
    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length
    
    await db.collection('marketplace_experiments').updateOne(
      { _id: new ObjectId(params.id) },
      { $set: { rating: Math.round(avgRating * 10) / 10 } }
    )
    
    return NextResponse.json({
      success: true,
      review
    })
  } catch (error) {
    console.error('Failed to create review:', error)
    return NextResponse.json(
      { error: 'Failed to create review' },
      { status: 500 }
    )
  }
}
