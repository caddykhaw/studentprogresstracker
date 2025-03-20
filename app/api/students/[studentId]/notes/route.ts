import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { z } from 'zod';
import { ObjectId } from 'mongodb';

// Zod schema for note validation
const NoteSchema = z.object({
  content: z.string().min(1, "Note content is required"),
  date: z.string().optional()
});

// No-cache headers configuration
const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  'Pragma': 'no-cache',
  'Expires': '0',
  'Surrogate-Control': 'no-store'
} as const;

// POST new note
export async function POST(
  request: NextRequest,
  { params }: { params: { studentId: string } }
) {
  console.log('📤 POST /api/students/[studentId]/notes - Starting request...');
  
  try {
    const body = await request.json();
    
    // Validate request body
    const validationResult = NoteSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation error', details: validationResult.error.errors },
        { status: 400, headers: NO_CACHE_HEADERS }
      );
    }
    
    const { db } = await connectToDatabase();
    
    const note = {
      id: new ObjectId().toString(),
      content: validationResult.data.content,
      date: validationResult.data.date || new Date().toISOString()
    };
    
    const result = await db.collection('students').updateOne(
      { _id: new ObjectId(params.studentId) },
      { $push: { notes: note } }
    );
    
    if (!result.acknowledged) {
      throw new Error('Failed to add note');
    }
    
    return NextResponse.json({
      message: 'Note added successfully',
      id: note.id
    }, {
      status: 201,
      headers: NO_CACHE_HEADERS
    });
    
  } catch (error) {
    console.error('❌ Error in POST /api/students/[studentId]/notes:', error);
    return NextResponse.json(
      { error: 'Failed to add note', details: error instanceof Error ? error.message : 'An unknown error occurred' },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
}

// PUT update note
export async function PUT(
  request: NextRequest,
  { params }: { params: { studentId: string; noteId: string } }
) {
  console.log('📝 PUT /api/students/[studentId]/notes/[noteId] - Starting request...');
  
  try {
    const body = await request.json();
    
    // Validate request body
    const validationResult = NoteSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation error', details: validationResult.error.errors },
        { status: 400, headers: NO_CACHE_HEADERS }
      );
    }
    
    const { db } = await connectToDatabase();
    
    const result = await db.collection('students').updateOne(
      { 
        _id: new ObjectId(params.studentId),
        'notes.id': params.noteId
      },
      { 
        $set: { 
          'notes.$.content': validationResult.data.content,
          'notes.$.date': validationResult.data.date || new Date().toISOString()
        }
      }
    );
    
    if (!result.acknowledged) {
      throw new Error('Failed to update note');
    }
    
    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Note not found' },
        { status: 404, headers: NO_CACHE_HEADERS }
      );
    }
    
    return NextResponse.json({
      message: 'Note updated successfully'
    }, {
      status: 200,
      headers: NO_CACHE_HEADERS
    });
    
  } catch (error) {
    console.error('❌ Error in PUT /api/students/[studentId]/notes/[noteId]:', error);
    return NextResponse.json(
      { error: 'Failed to update note', details: error instanceof Error ? error.message : 'An unknown error occurred' },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
}

// DELETE note
export async function DELETE(
  request: NextRequest,
  { params }: { params: { studentId: string; noteId: string } }
) {
  console.log('🗑️ DELETE /api/students/[studentId]/notes/[noteId] - Starting request...');
  
  try {
    const { db } = await connectToDatabase();
    
    const result = await db.collection('students').updateOne(
      { _id: new ObjectId(params.studentId) },
      { $pull: { notes: { id: params.noteId } } }
    );
    
    if (!result.acknowledged) {
      throw new Error('Failed to delete note');
    }
    
    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Note not found' },
        { status: 404, headers: NO_CACHE_HEADERS }
      );
    }
    
    return NextResponse.json({
      message: 'Note deleted successfully'
    }, {
      status: 200,
      headers: NO_CACHE_HEADERS
    });
    
  } catch (error) {
    console.error('❌ Error in DELETE /api/students/[studentId]/notes/[noteId]:', error);
    return NextResponse.json(
      { error: 'Failed to delete note', details: error instanceof Error ? error.message : 'An unknown error occurred' },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
}

export async function GET(
  request: Request,
  { params }: { params: { studentId: string } }
) {
  try {
    // Here you would typically fetch the student's notes from your database
    // For now, we'll return mock data
    return NextResponse.json({
      notes: [
        {
          id: '1',
          content: 'Completed homework assignment',
          date: new Date().toISOString()
        }
      ]
    })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch notes" },
      { status: 500 }
    )
  }
} 