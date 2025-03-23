import { MongoClient, Collection, Document } from 'mongodb';
import * as fs from 'fs';
import * as path from 'path';

interface BackupMetadata {
  timestamp: string;
  databaseName: string;
  collections: {
    [key: string]: {
      count: number;
      fields: string[];
      indexes: string[];
    };
  };
}

async function downloadMongoData() {
  const client = new MongoClient(process.env.MONGODB_URI!);
  const outputDir = path.join(process.cwd(), 'mongodb-backup');
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupDir = path.join(outputDir, timestamp);
  
  try {
    // Create backup directory with timestamp
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    console.log('Connecting to MongoDB...');
    await client.connect();
    const db = client.db('student-progress-tracker');
    
    // Get all collections
    const collections = await db.listCollections().toArray();
    console.log(`Found ${collections.length} collections`);
    
    const metadata: BackupMetadata = {
      timestamp,
      databaseName: 'student-progress-tracker',
      collections: {}
    };

    // Download each collection
    for (const collection of collections) {
      const collectionName = collection.name;
      console.log(`\nDownloading collection: ${collectionName}...`);
      
      const documents = await db.collection(collectionName).find({}).toArray();
      
      // Convert dates to ISO strings for readable format
      const documentsWithReadableDates = documents.map(doc => ({
        ...doc,
        createdAt: doc.createdAt instanceof Date ? doc.createdAt.toISOString() : doc.createdAt,
        updatedAt: doc.updatedAt instanceof Date ? doc.updatedAt.toISOString() : doc.updatedAt
      }));
      
      // Save readable format
      fs.writeFileSync(
        path.join(backupDir, `${collectionName}.json`),
        JSON.stringify(documentsWithReadableDates, null, 2)
      );
      
      // Save raw data
      fs.writeFileSync(
        path.join(backupDir, `${collectionName}.raw.json`),
        JSON.stringify(documents)
      );
      
      // Get collection indexes
      const coll = db.collection(collectionName);
      const indexes = await coll.indexes();
      const indexNames = indexes
        .map(index => index.name)
        .filter((name): name is string => name !== undefined);
      
      // Add to metadata
      metadata.collections[collectionName] = {
        count: documents.length,
        fields: documents.length > 0 ? Object.keys(documents[0]) : [],
        indexes: indexNames
      };
      
      console.log(`✓ Saved ${documents.length} documents from ${collectionName}`);
    }
    
    // Save metadata
    fs.writeFileSync(
      path.join(backupDir, 'metadata.json'),
      JSON.stringify(metadata, null, 2)
    );
    
    // Create a symlink to latest backup
    const latestLink = path.join(outputDir, 'latest');
    if (fs.existsSync(latestLink)) {
      fs.unlinkSync(latestLink);
    }
    fs.symlinkSync(backupDir, latestLink);
    
    console.log('\nBackup Summary:');
    console.log('----------------');
    console.log(`Timestamp: ${timestamp}`);
    console.log(`Backup location: ${backupDir}`);
    console.log('\nCollections backed up:');
    for (const [name, info] of Object.entries(metadata.collections)) {
      console.log(`- ${name}: ${info.count} documents`);
    }
    console.log('\nFiles for each collection:');
    console.log('- [collection].json (readable format)');
    console.log('- [collection].raw.json (raw data)');
    console.log('\nOther files:');
    console.log('- metadata.json (backup information)');
    console.log('\nQuick access:');
    console.log(`Latest backup symlink: ${latestLink}`);
    
  } catch (error) {
    console.error('Error downloading MongoDB data:', error);
    throw error;
  } finally {
    await client.close();
  }
}

// Add this to allow running directly with ts-node
if (require.main === module) {
  downloadMongoData()
    .then(() => console.log('\nDownload completed successfully'))
    .catch((error) => {
      console.error('Download failed:', error);
      process.exit(1);
    });
}

export default downloadMongoData; 