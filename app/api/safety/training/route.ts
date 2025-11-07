import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { getDatabase } from '@/lib/mongodb'
import { authOptions } from '@/lib/auth'

const SAFETY_QUIZ = {
  questions: [
    {
      id: 1,
      question: 'What should you always wear when working in a chemistry lab?',
      options: [
        'Casual clothes',
        'Safety goggles and lab coat',
        'Sandals',
        'Jewelry'
      ],
      correctAnswer: 1,
      explanation: 'Safety goggles protect your eyes and a lab coat protects your skin and clothes from chemical spills.'
    },
    {
      id: 2,
      question: 'What should you do if a chemical spills on your skin?',
      options: [
        'Ignore it',
        'Wipe it with a towel',
        'Rinse immediately with water for 15 minutes',
        'Apply lotion'
      ],
      correctAnswer: 2,
      explanation: 'Immediately rinse the affected area with water for at least 15 minutes to dilute and remove the chemical.'
    },
    {
      id: 3,
      question: 'How should you smell a chemical?',
      options: [
        'Put your nose directly over the container',
        'Waft the vapors toward your nose',
        'Take a deep breath over the container',
        'You should never smell chemicals'
      ],
      correctAnswer: 1,
      explanation: 'Wafting allows you to safely detect odors without inhaling concentrated vapors.'
    },
    {
      id: 4,
      question: 'What is the first thing you should do in case of a fire in the lab?',
      options: [
        'Try to put it out yourself',
        'Alert others and activate the fire alarm',
        'Run away',
        'Take photos'
      ],
      correctAnswer: 1,
      explanation: 'Safety of people is the priority. Alert others and activate the alarm before attempting to fight the fire.'
    },
    {
      id: 5,
      question: 'Where should you dispose of chemical waste?',
      options: [
        'Down the sink',
        'In the regular trash',
        'In designated waste containers',
        'Outside'
      ],
      correctAnswer: 2,
      explanation: 'Chemical waste must be disposed of in designated containers according to safety protocols.'
    },
    {
      id: 6,
      question: 'What does a corrosive hazard symbol indicate?',
      options: [
        'The chemical is flammable',
        'The chemical can burn or destroy living tissue',
        'The chemical is toxic',
        'The chemical is radioactive'
      ],
      correctAnswer: 1,
      explanation: 'Corrosive chemicals can cause severe burns and damage to skin, eyes, and other tissues.'
    },
    {
      id: 7,
      question: 'When should you read the MSDS (Material Safety Data Sheet)?',
      options: [
        'After an accident',
        'Never',
        'Before working with any chemical',
        'Only if required'
      ],
      correctAnswer: 2,
      explanation: 'Always read the MSDS before working with a chemical to understand its hazards and safety precautions.'
    },
    {
      id: 8,
      question: 'What should you do if you get a chemical in your eye?',
      options: [
        'Rub your eye',
        'Use eye wash station for 15 minutes',
        'Wait and see if it gets better',
        'Apply eye drops'
      ],
      correctAnswer: 1,
      explanation: 'Immediately use the eye wash station and rinse for at least 15 minutes while holding the eyelid open.'
    },
    {
      id: 9,
      question: 'Can you eat or drink in the chemistry lab?',
      options: [
        'Yes, if you are careful',
        'Only water is allowed',
        'No, never',
        'Yes, but only in designated areas'
      ],
      correctAnswer: 2,
      explanation: 'Never eat or drink in the lab to avoid accidental ingestion of chemicals.'
    },
    {
      id: 10,
      question: 'What should you do before leaving the lab?',
      options: [
        'Just leave',
        'Wash your hands thoroughly',
        'Turn off your phone',
        'Check social media'
      ],
      correctAnswer: 1,
      explanation: 'Always wash your hands thoroughly before leaving the lab to remove any chemical residue.'
    }
  ],
  passingScore: 80
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const userId = session?.user?.id || 'anonymous'
    
    const db = await getDatabase()
    const training = await db.collection('safety_training').findOne({ userId })
    
    return NextResponse.json({
      quiz: SAFETY_QUIZ,
      training: training || { completed: false, score: 0 }
    })
  } catch (error) {
    console.error('Failed to fetch safety training:', error)
    return NextResponse.json(
      { error: 'Failed to fetch safety training' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const userId = session?.user?.id || 'anonymous'
    const { answers } = await request.json()
    
    // Calculate score
    let correctAnswers = 0
    SAFETY_QUIZ.questions.forEach((question, index) => {
      if (answers[index] === question.correctAnswer) {
        correctAnswers++
      }
    })
    
    const score = (correctAnswers / SAFETY_QUIZ.questions.length) * 100
    const passed = score >= SAFETY_QUIZ.passingScore
    
    const db = await getDatabase()
    
    const training = {
      userId,
      completed: passed,
      score: Math.round(score),
      completedAt: passed ? new Date() : undefined,
      attempts: 1
    }
    
    await db.collection('safety_training').updateOne(
      { userId },
      { 
        $set: training,
        $inc: { attempts: 1 }
      },
      { upsert: true }
    )
    
    // Award XP if passed
    if (passed) {
      await db.collection('user_progress').updateOne(
        { userId },
        { 
          $inc: { xp: 200 },
          $set: { safetyCertified: true }
        },
        { upsert: true }
      )
    }
    
    return NextResponse.json({
      success: true,
      passed,
      score: Math.round(score),
      correctAnswers,
      totalQuestions: SAFETY_QUIZ.questions.length
    })
  } catch (error) {
    console.error('Failed to submit safety training:', error)
    return NextResponse.json(
      { error: 'Failed to submit training' },
      { status: 500 }
    )
  }
}
