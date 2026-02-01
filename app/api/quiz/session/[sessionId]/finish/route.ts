import { NextRequest, NextResponse } from 'next/server'

interface UserAnswer {
  question_id: number
  user_answer: string
  time_taken: number
}

export async function POST(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    // Default to 127.0.0.1 to avoid localhost resolution issues
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8000'
    const { sessionId } = params
    const answers: UserAnswer[] = await request.json()

    const response = await fetch(
      `${backendUrl}/quiz/session/${sessionId}/finish`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(answers)
      }
    )

    const contentType = response.headers.get('content-type')
    if (contentType && contentType.includes('text/html')) {
        const text = await response.text()
        if (text.includes('This page could not be found') || text.includes('Next.js')) {
            throw new Error(`Backend URL (${backendUrl}) appears to be pointing to the frontend application. Please ensure the Python backend is running on port 8000.`)
        }
        throw new Error(`Backend returned HTML instead of JSON. Status: ${response.status}`)
    }

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Backend error:', response.status, errorText)
      throw new Error(`Backend returned ${response.status}: ${errorText}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Finish quiz error:', error)
    return NextResponse.json(
      { error: `Failed to finish quiz: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    )
  }
}
