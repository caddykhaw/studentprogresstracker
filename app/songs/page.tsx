import { Metadata } from 'next';
import SongLibrary from '@/components/songs/SongLibrary';
import { connectToDatabase } from '@/lib/mongodb';
import { Song } from '@/lib/types';

export const metadata: Metadata = {
  title: 'Song Library',
  description: 'Manage your teaching song library',
};

async function getSongs() {
  try {
    const { db } = await connectToDatabase();
    const songsData = await db.collection('songs').find().sort({ title: 1 }).toArray();
    
    // Map MongoDB documents to Song type
    return songsData.map(doc => {
      // Convert MongoDB _id to string if needed
      const { _id, ...rest } = doc;
      return rest as unknown as Song;
    });
  } catch (error) {
    console.error('Failed to fetch songs:', error);
    return [];
  }
}

export default async function SongsPage() {
  const songs = await getSongs();
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Song Library</h1>
        <p className="text-gray-500 dark:text-gray-400">
          Manage your teaching song collection and student progress
        </p>
      </div>
      
      <SongLibrary initialSongs={songs} />
    </div>
  );
} 