import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Student } from '@/store/useStudentStore';

export async function GET() {
  console.log('📥 GET /api/students - Starting request...');
  
  try {
    console.log('🔌 Connecting to MongoDB...');
    const { db } = await connectToDatabase();
    
    console.log('📚 Fetching students from database...');
    const students = await db.collection('students').find({}).toArray();
    
    console.log(`✅ Successfully fetched ${students.length} students`);
    return NextResponse.json(students, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (error) {
    console.error('❌ Error in GET /api/students:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json(
      { error: 'Failed to fetch students', details: errorMessage },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  console.log('📤 POST /api/students - Starting request...');
  
  try {
    const { db } = await connectToDatabase();
    const student = await request.json();
    
    // Validate required fields
    if (!student.name || !student.day || !student.time || !student.instrument || !student.grade) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    console.log('💾 Inserting new student:', student);
    const result = await db.collection('students').insertOne(student);
    
    if (!result.acknowledged) {
      throw new Error('Failed to insert student');
    }
    
    return NextResponse.json({ 
      message: 'Student created successfully',
      id: result.insertedId 
    }, { status: 201 });
  } catch (error) {
    console.error('❌ Error in POST /api/students:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json(
      { error: 'Failed to create student', details: errorMessage },
      { status: 500 }
    );
  }
} 