import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Student } from '@/lib/types';
import { z } from 'zod';

// Basic student update validation schema
const studentUpdateSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  instrument: z.string().min(1, 'Instrument is required').optional(),
  grade: z.string().min(1, 'Grade is required').optional(),
  day: z.string().min(1, 'Day is required').optional(),
  time: z.string().min(1, 'Time is required').optional(),
  contact: z.string().optional(),
  currentMaterial: z.string().optional(),
  notes: z.array(
    z.object({
      id: z.string(),
      content: z.string(),
      date: z.string()
    })
  ).optional(),
  attendance: z.string().optional(),
  lastActive: z.string().optional(),
});

// No-cache headers
const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate',
  'Pragma': 'no-cache',
  'Expires': '0'
};

// GET a specific student by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log(`🔍 Fetching student with ID: ${params.id}`);
    const { db } = await connectToDatabase();
    
    const student = await db.collection<Student>('students').findOne({ id: params.id });
    
    if (!student) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404, headers: NO_CACHE_HEADERS }
      );
    }
    
    return NextResponse.json(student, { headers: NO_CACHE_HEADERS });
  } catch (error) {
    console.error('❌ Error fetching student:', error);
    return NextResponse.json(
      { error: 'Failed to fetch student' },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
}

// PUT (update) a specific student by ID
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log(`✏️ Updating student with ID: ${params.id}`);
    const body = await request.json();
    
    // Validate request body
    const validationResult = studentUpdateSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation error', details: validationResult.error.errors },
        { status: 400, headers: NO_CACHE_HEADERS }
      );
    }
    
    const { db } = await connectToDatabase();
    
    // Add updatedAt field to track when the record was last modified
    const updateData = {
      ...validationResult.data,
      updatedAt: new Date()
    };
    
    const result = await db.collection<Student>('students').updateOne(
      { id: params.id },
      { $set: updateData }
    );
    
    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404, headers: NO_CACHE_HEADERS }
      );
    }
    
    // Get the updated student data
    const updatedStudent = await db.collection<Student>('students').findOne({ id: params.id });
    
    return NextResponse.json(
      { message: 'Student updated successfully', student: updatedStudent },
      { status: 200, headers: NO_CACHE_HEADERS }
    );
  } catch (error) {
    console.error('❌ Error updating student:', error);
    return NextResponse.json(
      { error: 'Failed to update student' },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
}

// DELETE a specific student by ID
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log(`🗑️ Deleting student with ID: ${params.id}`);
    const { db } = await connectToDatabase();
    
    const result = await db.collection<Student>('students').deleteOne({ id: params.id });
    
    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404, headers: NO_CACHE_HEADERS }
      );
    }
    
    return NextResponse.json(
      { message: 'Student deleted successfully' },
      { status: 200, headers: NO_CACHE_HEADERS }
    );
  } catch (error) {
    console.error('❌ Error deleting student:', error);
    return NextResponse.json(
      { error: 'Failed to delete student' },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
} 