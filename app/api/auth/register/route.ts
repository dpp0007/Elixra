import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/mongodb'
import bcrypt from 'bcryptjs'
import { z } from 'zod'

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, password } = registerSchema.parse(body)

    const db = await getDatabase()
    
    // Check if email already exists
    const existingEmail = await db.collection('users').findOne({ email })
    if (existingEmail) {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Select random avatar
    const avatars = [
      '/Assets/Profile/Female 2.svg',
      '/Assets/Profile/Female1.svg',
      '/Assets/Profile/Male1.svg',
      '/Assets/Profile/Male2.svg'
    ]
    const randomAvatar = avatars[Math.floor(Math.random() * avatars.length)]

    // Create user
    const result = await db.collection('users').insertOne({
      name,
      email,
      password: hashedPassword,
      createdAt: new Date(),
      emailVerified: null,
      image: randomAvatar,
      experiments: [], // Initialize empty experiments array
      savedExperiments: [] // Initialize empty saved experiments array
    })

    return NextResponse.json({
      success: true,
      userId: result.insertedId,
      message: 'User created successfully'
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0]?.message || 'Validation error' },
        { status: 400 }
      )
    }

    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}