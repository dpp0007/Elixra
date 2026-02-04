import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/mongodb'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { z } from 'zod'

const usernameSchema = z.object({
  username: z.string()
    .min(3, 'Username must be at least 3 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores')
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { username } = usernameSchema.parse(body)

    const db = await getDatabase()

    // Check if username is already taken
    const existingUser = await db.collection('users').findOne({ 
      username: { $regex: new RegExp(`^${username}$`, 'i') } // Case insensitive check
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Username is already taken' },
        { status: 400 }
      )
    }

    // Update user
    const result = await db.collection('users').updateOne(
      { email: session.user.email },
      { $set: { username: username } }
    )

    if (result.modifiedCount === 0) {
      return NextResponse.json(
        { error: 'Failed to update username' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Username set successfully'
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message || 'Validation error' },
        { status: 400 }
      )
    }

    console.error('Username update error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
