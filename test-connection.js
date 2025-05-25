import { MongoClient } from 'mongodb';

const testConnection = async () => {
  // Try both connection strings
  const uris = [
    "mongodb+srv://niku.njgajera2550:yourpassword@niku.nj.y712b4u.mongodb.net/videotube?retryWrites=true&w=majority",
    "mongodb://niku.njgajera2550:yourpassword@niku.nj.y712b4u.mongodb.net:27017/videotube?retryWrites=true&w=majority"
  ];

  for (const uri of uris) {
    console.log(`\nTesting URI: ${uri.split('@')[0]}@*******`);
    const client = new MongoClient(uri, { 
      connectTimeoutMS: 5000,
      serverSelectionTimeoutMS: 5000 
    });

    try {
      await client.connect();
      const db = client.db();
      console.log('✅ Ping successful:', await db.command({ ping: 1 }));
      console.log('📁 Collections:', await db.listCollections().toArray());
      return true;
    } catch (err) {
      console.error(`❌ Connection failed: ${err.message}`);
    } finally {
      await client.close();
    }
  }
  return false;
}

testConnection().then(success => {
  console.log(success ? 'Test completed successfully' : 'All connection attempts failed');
  process.exit(success ? 0 : 1);
});