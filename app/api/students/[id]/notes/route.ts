import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Student, Note } from '@/lib/types';
import { z } from 'zod';

// Note validation schema
const noteSchema = z.object({
  content: z.string().min(1, 'Note content is required'),
});

// No-cache headers
const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate',
  'Pragma': 'no-cache',
  'Expires': '0'
};

// GET all notes for a student
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log(`📝 Fetching notes for student ID: ${params.id}`);
    const { db } = await connectToDatabase();
    
    const student = await db.collection<Student>('students').findOne({ id: params.id });
    
    if (!student) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404, headers: NO_CACHE_HEADERS }
      );
    }
    
    return NextResponse.json(student.notes || [], { headers: NO_CACHE_HEADERS });
  } catch (error) {
    console.error('❌ Error fetching student notes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch student notes' },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
}

// POST a new note for a student
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log(`➕ Adding note for student ID: ${params.id}`);
    const body = await request.json();
    
    // Validate request body
    const validationResult = noteSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation error', details: validationResult.error.errors },
        { status: 400, headers: NO_CACHE_HEADERS }
      );
    }
    
    const { db } = await connectToDatabase();
    
    // Check if student exists
    const student = await db.collection<Student>('students').findOne({ id: params.id });
    
    if (!student) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404, headers: NO_CACHE_HEADERS }
      );
    }
    
    // Create new note
    const newNote: Note = {
      id: crypto.randomUUID(),
      content: validationResult.data.content,
      date: new Date().toISOString()
    };
    
    // Add note to student's notes array
    const result = await db.collection<Student>('students').updateOne(
      { id: params.id },
      { 
        $push: { notes: newNote },
        $set: { updatedAt: new Date() }
      }
    );
    
    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Failed to add note' },
        { status: 500, headers: NO_CACHE_HEADERS }
      );
    }
    
    return NextResponse.json(
      { message: 'Note added successfully', note: newNote },
      { status: 201, headers: NO_CACHE_HEADERS }
    );
  } catch (error) {
    console.error('❌ Error adding student note:', error);
    return NextResponse.json(
      { error: 'Failed to add student note' },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
} 