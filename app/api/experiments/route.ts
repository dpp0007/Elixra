import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { getDatabase } from '@/lib/mongodb'
import { ExperimentLog } from '@/types/chemistry'
import { authOptions } from '@/lib/auth'
import { z } from 'zod'
import { ObjectId } from 'mongodb'

// Mark as dynamic route (uses session)
export const dynamic = 'force-dynamic'

const experimentSchema = z.object({
  name: z.string().min(1, 'Experiment name is required'),
  chemicals: z.array(z.object({
    chemical: z.object({
      id: z.string(),
      name: z.string(),
      formula: z.string(),
      color: z.string(),
      state: z.enum(['solid', 'liquid', 'gas']),
    }),
    amount: z.number().positive(),
    unit: z.enum(['ml', 'g', 'mol']),
  })),
  reactionDetails: z.object({
    color: z.string(),
    smell: z.string(),
    precipitate: z.boolean(),
    precipitateColor: z.string().optional(),
    products: z.array(z.string()),
    balancedEquation: z.string(),
    reactionType: z.string(),
    observations: z.array(z.string()),
    safetyNotes: z.array(z.string()).optional(),
    temperature: z.enum(['increased', 'decreased', 'unchanged']).optional(),
    gasEvolution: z.boolean().optional(),
    confidence: z.number().min(0).max(1),
  }).optional(),
})

export async function GET(request: NextRequest) {
  try {
    let session = null
    try {
      session = await getServerSession(authOptions)
    } catch (error) {
      // Ignore JWT errors - treat as anonymous user
      console.log('Session error (treating as anonymous):', error instanceof Error ? error.message : 'Unknown')
    }
    
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = parseInt(searchParams.get('skip') || '0')
    const search = searchParams.get('search')
    
    // Allow anonymous users to fetch their own experiments
    const userId = session?.user?.id || 'anonymous'
    
    const db = await getDatabase()
    
    // Build query
    const query: any = { userId }
    if (search) {
      query.$or = [
        { experimentName: { $regex: search, $options: 'i' } },
        { 'chemicals.chemical.name': { $regex: search, $options: 'i' } },
        { 'reactionDetails.reactionType': { $regex: search, $options: 'i' } }
      ]
    }
    
    const experiments = await db
      .collection<ExperimentLog>('experiments')
      .find(query)
      .sort({ timestamp: -1 })
      .skip(skip)
      .limit(limit)
      .toArray()

    const total = await db.collection<ExperimentLog>('experiments').countDocuments(query)

    return NextResponse.json({
      experiments,
      pagination: {
        total,
        limit,
        skip,
        hasMore: skip + limit < total
      }
    })
  } catch (error) {
    console.error('Failed to fetch experiments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch experiments' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    let session = null
    try {
      session = await getServerSession(authOptions)
    } catch (error) {
      // Ignore JWT errors - treat as anonymous user
      console.log('Session error (treating as anonymous):', error instanceof Error ? error.message : 'Unknown')
    }
    
    const body = await request.json()
    
    // Validate the experiment data
    const validatedData = experimentSchema.parse(body)
    
    const experimentLog: ExperimentLog = {
      userId: session?.user?.id || 'anonymous',
      experimentName: validatedData.name,
      chemicals: validatedData.chemicals,
      reactionDetails: validatedData.reactionDetails!,
      timestamp: new Date(),
      // Add metadata
      metadata: {
        userAgent: request.headers.get('user-agent'),
        ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
        sessionId: session?.user?.id ? undefined : 'anonymous-session'
      }
    }

    const db = await getDatabase()
    const result = await db.collection<ExperimentLog>('experiments').insertOne(experimentLog)

    // Update user statistics if authenticated (fixed ObjectId conversion)
    if (session?.user?.id) {
      await db.collection('users').updateOne(
        { _id: new ObjectId(session.user.id as string) },
        { 
          $inc: { 'stats.experimentsCount': 1 },
          $set: { 'stats.lastExperiment': new Date() }
        },
        { upsert: true }
      )
    }

    return NextResponse.json({ 
      success: true, 
      experimentId: result.insertedId,
      message: 'Experiment saved successfully'
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid experiment data', details: error.issues },
        { status: 400 }
      )
    }

    console.error('Failed to save experiment:', error)
    return NextResponse.json(
      { error: 'Failed to save experiment' },
      { status: 500 }
    )
  }
}