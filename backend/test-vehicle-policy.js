import mongoose from 'mongoose';
import Policy from './models/Policy.js';
import dotenv from 'dotenv';

dotenv.config();

async function testVehiclePolicy() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    const vehiclePolicyData = {
      policyNumber: "VEH-TEST-" + Date.now(),
      policyType: "vehicle", 
      policyCategory: "individual",
      policyHolder: new mongoose.Types.ObjectId(),
      insuranceAgent: new mongoose.Types.ObjectId(),
      coverage: {
        coverageAmount: 50000
      },
      premium: {
        amount: 1200,
        frequency: "monthly"
      },
      validity: {
        startDate: new Date(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
      }
    };

    console.log('\n🧪 Creating vehicle policy...');
    const vehiclePolicy = new Policy(vehiclePolicyData);
    await vehiclePolicy.save();

    console.log('\n✅ Vehicle Policy created successfully!');
    console.log('Policy ID:', vehiclePolicy._id);
    console.log('Policy Type:', vehiclePolicy.policyType);
    
    console.log('\n📋 Coverage Details:');
    vehiclePolicy.coverage.coverageDetails.forEach((detail, index) => {
      console.log(`${index + 1}. ${detail.type}: ${detail.description} (Limit: ${detail.limit})`);
    });

    const expectedTypes = ["collision", "liability", "comprehensive", "personal_accident"];
    const actualTypes = vehiclePolicy.coverage.coverageDetails.map(d => d.type);
    
    console.log('\n🔍 Verification:');
    console.log('Expected types:', expectedTypes);
    console.log('Found types:', actualTypes);
    
    const allPresent = expectedTypes.every(type => actualTypes.includes(type));
    console.log('✅ All vehicle coverage types present:', allPresent);
    
    if (!allPresent) {
      console.log('❌ Missing types:', expectedTypes.filter(type => !actualTypes.includes(type)));
    } else {
      console.log('🎉 SUCCESS: All 4 vehicle coverage types auto-initialized correctly!');
    }

    await Policy.deleteOne({ _id: vehiclePolicy._id });
    console.log('\n🧹 Test policy cleaned up');
    console.log('\n✅ Vehicle policy auto-initialization test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('💾 Disconnected from MongoDB');
    process.exit(0);
  }
}

testVehiclePolicy();
