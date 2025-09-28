// Test to debug policy coverage saving issues
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Policy from './models/Policy.js';

// Load environment variables
dotenv.config();

// Connect to database
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

const testPolicyCoverage = async () => {
  await connectDB();
  
  console.log('\n=== TESTING POLICY COVERAGE CREATION ===');
  
  // Test data similar to what frontend sends
  const testPolicyData = {
    policyType: 'life',
    policyCategory: 'individual', 
    insuranceAgent: '68d8d150cd2bf0b398a85778', // Use existing agent ID
    coverage: {
      coverageAmount: 0,
      deductible: 500,
      coverageDetails: [
        {
          type: 'life_cover',
          description: 'Life insurance and death benefits',
          limit: 50000
        },
        {
          type: 'hospitalization',
          description: 'Hospital stays and medical treatments',
          limit: 10000
        },
        {
          type: 'surgical_benefits', 
          description: 'Surgical procedures and related costs',
          limit: 15000
        },
        {
          type: 'outpatient',
          description: 'Outpatient treatments and consultations', 
          limit: 5000
        },
        {
          type: 'prescription_drugs',
          description: 'Prescription medications and pharmacy costs',
          limit: 3000
        }
      ]
    },
    validity: {
      startDate: new Date('2025-09-01'),
      endDate: new Date('2025-12-31')
    },
    premium: {
      amount: 2000,
      frequency: 'monthly'
    },
    status: 'active'
  };
  
  console.log('ORIGINAL DATA - Coverage Details:');
  testPolicyData.coverage.coverageDetails.forEach((detail, index) => {
    console.log(`  ${index}: ${detail.type} = ${detail.limit}`);
  });
  
  try {
    const policy = new Policy(testPolicyData);
    
    console.log('\nAFTER MODEL CONSTRUCTOR - Coverage Details:');
    policy.coverage.coverageDetails.forEach((detail, index) => {
      console.log(`  ${index}: ${detail.type} = ${detail.limit}`);
    });
    
    console.log('\nSaving policy...');
    const savedPolicy = await policy.save();
    
    console.log('\nAFTER SAVE - Coverage Details:');
    savedPolicy.coverage.coverageDetails.forEach((detail, index) => {
      console.log(`  ${index}: ${detail.type} = ${detail.limit}`);
    });
    
    console.log('\nTotal Coverage Amount:', savedPolicy.coverage.coverageAmount);
    console.log('Policy ID:', savedPolicy.policyId);
    
  } catch (error) {
    console.error('ERROR creating policy:', error.message);
  }
  
  await mongoose.disconnect();
  console.log('\n=== TEST COMPLETE ===');
};

testPolicyCoverage();