import { NextResponse } from 'next/server'
import { z } from 'zod'

const studentUpdateSchema = z.object({
  name: z.string().min(1),
  grade: z.string().min(1),
  attendance: z.string().optional(),
  lastActive: z.string().optional()
})

export async function GET(
  request: Request,
  { params }: { params: { studentId: string } }
) {
  try {
    // Here you would typically fetch the student from your database
    // For now, we'll return a mock response
    return NextResponse.json({
      id: params.studentId,
      name: "John Doe",
      grade: "Grade 5",
      attendance: "90%",
      lastActive: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch student" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { studentId: string } }
) {
  try {
    const body = await request.json()
    const validatedData = studentUpdateSchema.parse(body)

    // Here you would typically update the student in your database
    // For now, we'll return the validated data
    return NextResponse.json({
      id: params.studentId,
      ...validatedData
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: "Failed to update student" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { studentId: string } }
) {
  try {
    // Here you would typically delete the student from your database
    // For now, we'll just return a success response
    return NextResponse.json({ deleted: params.studentId })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete student" },
      { status: 500 }
    )
  }
} 