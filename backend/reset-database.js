import mongoose from 'mongoose';
import User from './models/User.js';
import Policy from './models/Policy.js';
import dotenv from 'dotenv';

dotenv.config();

async function resetDatabase() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear all collections
    await Policy.deleteMany({});
    console.log('🗑️ Cleared all policies');

    // You can also clear users if needed (but be careful not to delete admin users)
    // await User.deleteMany({ role: { $ne: 'admin' } });
    // console.log('🗑️ Cleared non-admin users');

    console.log('✅ Database reset completed successfully!');
    console.log('💡 You can now test the updated policy creation with the new structure');
    
  } catch (error) {
    console.error('❌ Database reset failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('💾 Disconnected from MongoDB');
    process.exit(0);
  }
}

// Run the reset
resetDatabase();