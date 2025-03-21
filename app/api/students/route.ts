import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Student, StudentCreate } from '@/lib/types';
import { z } from 'zod';

const studentSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  grade: z.string().min(1, 'Grade is required'),
  instrument: z.string().min(1, 'Instrument is required'),
  day: z.string().min(1, 'Day is required'),
  time: z.string().min(1, 'Time is required'),
  attendance: z.string().default('Present'),
  lastActive: z.string().default('Today'),
  contact: z.string().optional(),
  currentMaterial: z.string().optional(),
});

// Force dynamic rendering to prevent caching issues
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';
export const revalidate = 0;

export async function GET() {
  console.log('📥 Received GET request for students');
  try {
    console.log('🔄 Attempting to connect to database...');
    const { db } = await connectToDatabase();
    
    if (!db) {
      console.error('❌ Database connection failed: db object is null');
      return NextResponse.json(
        { error: 'Database connection failed', timestamp: new Date().toISOString() },
        { status: 500 }
      );
    }
    console.log('✅ Database connection successful');
    
    console.log('🔍 Querying students collection...');
    const students = await db.collection<Student>('students')
      .find({})
      .toArray();
    
    console.log(`✅ Successfully retrieved ${students?.length || 0} students`);
    
    // Return empty array if no students found instead of throwing error
    return NextResponse.json(students || [], {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (error) {
    console.error('❌ Server Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    const errorDetails = error instanceof Error ? error.stack : 'No stack trace available';
    console.error('Error details:', errorDetails);
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch students', 
        details: errorMessage,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { db } = await connectToDatabase();
    
    if (!db) {
      return NextResponse.json(
        { error: 'Database connection failed', timestamp: new Date().toISOString() },
        { status: 500 }
      );
    }
    
    const body = await request.json();
    
    const validationResult = studentSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.errors },
        { status: 400 }
      );
    }
    
    const studentData = validationResult.data;
    const newStudent: Student = {
      id: crypto.randomUUID(),
      name: studentData.name,
      grade: studentData.grade,
      instrument: studentData.instrument,
      day: studentData.day,
      time: studentData.time,
      attendance: studentData.attendance,
      lastActive: studentData.lastActive,
      contact: studentData.contact,
      currentMaterial: studentData.currentMaterial,
      createdAt: new Date(),
      updatedAt: new Date(),
      notes: []
    };

    const result = await db.collection<Student>('students').insertOne(newStudent);
    
    if (!result.acknowledged) {
      throw new Error('Failed to insert student');
    }
    
    return NextResponse.json({ 
      message: 'Student created successfully',
      id: result.insertedId,
      student: newStudent
    }, { 
      status: 201,
      headers: {
        'Content-Type': 'application/json',
      }
    });
  } catch (error) {
    console.error('❌ Error creating student:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json(
      { error: 'Failed to create student', details: errorMessage },
      { status: 500 }
    );
  }
} 