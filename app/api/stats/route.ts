import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { Student } from '@/lib/types';

// No-cache headers
const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate',
  'Pragma': 'no-cache',
  'Expires': '0'
};

// GET application statistics
export async function GET() {
  try {
    console.log('📊 Fetching application statistics');
    const { db } = await connectToDatabase();
    
    // Get current date information
    const now = new Date();
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const today = days[now.getDay()];
    
    // Get basic collection counts
    const [studentCount, settingCount, songCount] = await Promise.all([
      db.collection('students').countDocuments(),
      db.collection('settings').countDocuments(),
      db.collection('songs').countDocuments()
    ]);
    
    // Get students with today's lessons
    const studentsToday = await db.collection<Student>('students')
      .find({ day: { $regex: new RegExp(today, 'i') } })
      .sort({ time: 1 })
      .toArray();
    
    // Get instrument statistics
    const instrumentPipeline = [
      {
        $group: {
          _id: '$instrument',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ];
    
    const instrumentStats = await db.collection<Student>('students')
      .aggregate(instrumentPipeline)
      .toArray();
    
    // Get day distribution statistics
    const dayPipeline = [
      {
        $group: {
          _id: '$day',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { 
          _id: 1 // Sort by day name
        }
      }
    ];
    
    const dayStats = await db.collection<Student>('students')
      .aggregate(dayPipeline)
      .toArray();
    
    // Get recently updated students
    const recentlyUpdated = await db.collection<Student>('students')
      .find({})
      .sort({ updatedAt: -1 })
      .limit(5)
      .toArray();
    
    // Compile statistics
    const statistics = {
      counts: {
        students: studentCount,
        settings: settingCount,
        songs: songCount,
        studentsToday: studentsToday.length
      },
      today: {
        day: today,
        date: now.toISOString(),
        students: studentsToday.map(s => ({
          id: s.id,
          name: s.name,
          time: s.time,
          instrument: s.instrument
        }))
      },
      distributions: {
        instruments: instrumentStats,
        days: dayStats
      },
      recent: {
        updatedStudents: recentlyUpdated.map(s => ({
          id: s.id,
          name: s.name,
          instrument: s.instrument,
          updatedAt: s.updatedAt
        }))
      }
    };
    
    return NextResponse.json(statistics, { headers: NO_CACHE_HEADERS });
  } catch (error) {
    console.error('❌ Error fetching statistics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500, headers: NO_CACHE_HEADERS }
    );
  }
} 