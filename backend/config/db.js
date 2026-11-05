import mongoose from 'mongoose';

let memoryServer = null;

export const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/urbanpulse';

  try {
    console.log(`[Database] Attempting connection to MongoDB at: ${mongoUri.replace(/:([^:@]{3,})@/, ':***@')}`);
    // Set a short serverSelectionTimeoutMS so if local mongod isn't running, it doesn't hang for 30s
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 2500,
    });
    console.log('[Database] MongoDB Connected successfully.');
  } catch (err) {
    console.warn(`[Database] Standard MongoDB connection failed: ${err.message}`);
    console.log('[Database] Falling back to MongoDB In-Memory Server for seamless local execution...');

    try {
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      memoryServer = await MongoMemoryServer.create({
        instance: {
          dbName: 'urbanpulse',
        },
      });
      const uri = memoryServer.getUri();
      console.log(`[Database] In-Memory MongoDB running at: ${uri}`);
      await mongoose.connect(uri);
      console.log('[Database] Connected to In-Memory MongoDB successfully.');

      // Auto-seed sample data into in-memory database
      try {
        const { seedDatabase } = await import('../seed.js');
        await seedDatabase();
      } catch (seedErr) {
        console.warn('[Database] Auto-seeding in-memory DB notice:', seedErr.message);
      }
    } catch (memErr) {
      console.error('[Database] Failed to initialize in-memory MongoDB:', memErr.message);
      console.error('[Database] Please provide a valid MONGODB_URI in backend/.env');
    }
  }
};

export const disconnectDB = async () => {
  try {
    await mongoose.disconnect();
    if (memoryServer) {
      await memoryServer.stop();
    }
  } catch (e) {
    console.error('Error disconnecting database:', e);
  }
};
