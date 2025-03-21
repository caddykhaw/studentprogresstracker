import { NextResponse } from 'next/server'
import { z } from 'zod'
import { connectToDatabase } from '@/lib/mongodb'
import { Student } from '@/lib/types'

// Updated schema to match the full Student object structure
const studentUpdateSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Name is required'),
  instrument: z.string().min(1, 'Instrument is required'),
  grade: z.string().min(1, 'Grade is required'),
  day: z.string().min(1, 'Day is required'),
  time: z.string().min(1, 'Time is required'),
  notes: z.array(z.object({
    id: z.string(),
    content: z.string(),
    date: z.string()
  })).default([]),
  contact: z.string().optional(),
  currentMaterial: z.string().optional(),
  attendance: z.string().default('Present'),
  lastActive: z.string().default('Today'),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional()
})

// No-cache headers
const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate',
  'Pragma': 'no-cache',
  'Expires': '0'
}

export async function GET(
  request: Request,
  { params }: { params: { studentId: string } }
) {
  try {
    console.log(`🔍 Fetching student with ID: ${params.studentId}`)
    const { db } = await connectToDatabase()
    
    const student = await db.collection<Student>('students')
      .findOne({ id: params.studentId })
    
    if (!student) {
      return NextResponse.json(
        { error: "Student not found" },
        { status: 404, headers: NO_CACHE_HEADERS }
      )
    }
    
    return NextResponse.json(student, { headers: NO_CACHE_HEADERS })
  } catch (error) {
    console.error('❌ Error fetching student:', error)
    return NextResponse.json(
      { error: "Failed to fetch student" },
      { status: 500, headers: NO_CACHE_HEADERS }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { studentId: string } }
) {
  console.log(`✏️ Updating student with ID: ${params.studentId}`)
  try {
    const { db } = await connectToDatabase()
    const body = await request.json()
    
    // Validate the request data
    const validationResult = studentUpdateSchema.safeParse(body)
    if (!validationResult.success) {
      console.error('❌ Validation error:', validationResult.error.errors)
      return NextResponse.json(
        { error: "Invalid request data", details: validationResult.error.errors },
        { status: 400, headers: NO_CACHE_HEADERS }
      )
    }
    
    const updatedStudentData = validationResult.data
    
    // Ensure the updatedAt field is set to now
    const studentToUpdate = {
      ...updatedStudentData,
      updatedAt: new Date()
    }
    
    // Perform the update
    const result = await db.collection<Student>('students').updateOne(
      { id: params.studentId },
      { $set: studentToUpdate }
    )
    
    if (!result.acknowledged) {
      throw new Error('Update operation not acknowledged')
    }
    
    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: "Student not found" },
        { status: 404, headers: NO_CACHE_HEADERS }
      )
    }
    
    console.log('✅ Student updated successfully')
    return NextResponse.json({ 
      message: "Student updated successfully",
      student: studentToUpdate
    }, { headers: NO_CACHE_HEADERS })
  } catch (error) {
    console.error('❌ Error updating student:', error)
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred'
    return NextResponse.json(
      { error: "Failed to update student", details: errorMessage },
      { status: 500, headers: NO_CACHE_HEADERS }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { studentId: string } }
) {
  try {
    const { db } = await connectToDatabase()
    
    const result = await db.collection<Student>('students').deleteOne({ 
      id: params.studentId 
    })
    
    if (!result.acknowledged) {
      throw new Error('Delete operation not acknowledged')
    }
    
    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: "Student not found" },
        { status: 404, headers: NO_CACHE_HEADERS }
      )
    }
    
    return NextResponse.json({ 
      message: "Student deleted successfully",
      deletedId: params.studentId
    }, { headers: NO_CACHE_HEADERS })
  } catch (error) {
    console.error('❌ Error deleting student:', error)
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred'
    return NextResponse.json(
      { error: "Failed to delete student", details: errorMessage },
      { status: 500, headers: NO_CACHE_HEADERS }
    )
  }
} 