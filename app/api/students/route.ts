import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Student } from '@/lib/types';
import { z } from 'zod';

// Basic student validation schema
const studentSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  instrument: z.string().min(1, 'Instrument is required'),
  grade: z.string().min(1, 'Grade is required'),
  day: z.string().min(1, 'Day is required'),
  time: z.string().min(1, 'Time is required'),
  contact: z.string().optional(),
  currentMaterial: z.string().optional(),
});

// No-cache headers
const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate',
  'Pragma': 'no-cache',
  'Expires': '0'
};

// GET all students
export async function GET() {
  try {
    console.log('📋 Fetching all students');
    const { db } = await connectToDatabase();
    
    const students = await db.collection<Student>('students').find({}).toArray();
    
    return NextResponse.json(students, { headers: NO_CACHE_HEADERS });
  } catch (error) {
    console.error('❌ Error fetching students:', error);
    return NextResponse.json(
      { error: 'Failed to fetch students' },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
}

// POST new student
export async function POST(request: NextRequest) {
  try {
    console.log('➕ Creating new student');
    const body = await request.json();
    
    // Validate request body
    const validationResult = studentSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation error', details: validationResult.error.errors },
        { status: 400, headers: NO_CACHE_HEADERS }
      );
    }
    
    const { db } = await connectToDatabase();
    
    // Create new student object
    const newStudent: Student = {
      id: crypto.randomUUID(),
      ...validationResult.data,
      notes: [],
      attendance: 'Present',
      lastActive: 'Today',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    await db.collection<Student>('students').insertOne(newStudent);
    
    return NextResponse.json(
      { message: 'Student created successfully', student: newStudent },
      { status: 201, headers: NO_CACHE_HEADERS }
    );
  } catch (error) {
    console.error('❌ Error creating student:', error);
    return NextResponse.json(
      { error: 'Failed to create student' },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
} 