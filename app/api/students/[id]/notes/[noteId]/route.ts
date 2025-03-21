import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Student } from '@/lib/types';
import { z } from 'zod';

// Note content validation schema
const noteUpdateSchema = z.object({
  content: z.string().min(1, 'Note content is required'),
});

// No-cache headers
const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate',
  'Pragma': 'no-cache',
  'Expires': '0'
};

// GET a specific note for a student
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string, noteId: string } }
) {
  try {
    console.log(`🔍 Fetching note ${params.noteId} for student ID: ${params.id}`);
    const { db } = await connectToDatabase();
    
    const student = await db.collection<Student>('students').findOne(
      { id: params.id },
      { projection: { notes: { $elemMatch: { id: params.noteId } } } }
    );
    
    if (!student || !student.notes || student.notes.length === 0) {
      return NextResponse.json(
        { error: 'Note not found' },
        { status: 404, headers: NO_CACHE_HEADERS }
      );
    }
    
    return NextResponse.json(student.notes[0], { headers: NO_CACHE_HEADERS });
  } catch (error) {
    console.error('❌ Error fetching student note:', error);
    return NextResponse.json(
      { error: 'Failed to fetch student note' },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
}

// PUT (update) a specific note for a student
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string, noteId: string } }
) {
  try {
    console.log(`✏️ Updating note ${params.noteId} for student ID: ${params.id}`);
    const body = await request.json();
    
    // Validate request body
    const validationResult = noteUpdateSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation error', details: validationResult.error.errors },
        { status: 400, headers: NO_CACHE_HEADERS }
      );
    }
    
    const { db } = await connectToDatabase();
    
    // Update the note in the student's notes array
    const result = await db.collection<Student>('students').updateOne(
      { 
        id: params.id,
        'notes.id': params.noteId 
      },
      { 
        $set: { 
          'notes.$.content': validationResult.data.content,
          updatedAt: new Date()
        } 
      }
    );
    
    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Note not found' },
        { status: 404, headers: NO_CACHE_HEADERS }
      );
    }
    
    // Get the updated note
    const student = await db.collection<Student>('students').findOne(
      { id: params.id },
      { projection: { notes: { $elemMatch: { id: params.noteId } } } }
    );
    
    const updatedNote = student?.notes?.[0] || null;
    
    return NextResponse.json(
      { message: 'Note updated successfully', note: updatedNote },
      { status: 200, headers: NO_CACHE_HEADERS }
    );
  } catch (error) {
    console.error('❌ Error updating student note:', error);
    return NextResponse.json(
      { error: 'Failed to update student note' },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
}

// DELETE a specific note for a student
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string, noteId: string } }
) {
  try {
    console.log(`🗑️ Deleting note ${params.noteId} for student ID: ${params.id}`);
    const { db } = await connectToDatabase();
    
    // Remove the note from the student's notes array
    const result = await db.collection<Student>('students').updateOne(
      { id: params.id },
      { 
        $pull: { notes: { id: params.noteId } },
        $set: { updatedAt: new Date() }
      }
    );
    
    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404, headers: NO_CACHE_HEADERS }
      );
    }
    
    if (result.modifiedCount === 0) {
      return NextResponse.json(
        { error: 'Note not found or already deleted' },
        { status: 404, headers: NO_CACHE_HEADERS }
      );
    }
    
    return NextResponse.json(
      { message: 'Note deleted successfully' },
      { status: 200, headers: NO_CACHE_HEADERS }
    );
  } catch (error) {
    console.error('❌ Error deleting student note:', error);
    return NextResponse.json(
      { error: 'Failed to delete student note' },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
} 