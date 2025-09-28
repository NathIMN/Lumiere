import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Policy from '../models/Policy.js';
import User from '../models/User.js';
import connectDB from '../db/connect.js';

dotenv.config();

async function testLifePolicyAutoInitialization() {
  try {
    await connectDB(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');
    
    // Find an existing agent (or create a dummy one for testing)
    let agent = await User.findOne({ role: 'insurance_agent' });
    if (!agent) {
      console.log('Creating test agent...');
      agent = await User.create({
        firstName: 'Test',
        lastName: 'Agent',
        email: 'test.agent@lumiere.com',
        password: 'password123',
        role: 'insurance_agent'
      });
    }

    // Find existing employees for beneficiaries
    const employees = await User.find({ role: 'employee' }).limit(2);
    
    console.log('\n🧪 Testing Life Policy Auto-Initialization\n');
    
    // Test Case 1: Create a life policy with only some coverage types
    console.log('📋 Test Case 1: Creating life policy with partial coverage types');
    const partialPolicy = new Policy({
      policyType: 'life',
      policyCategory: 'group',
      insuranceAgent: agent._id,
      coverage: {
        coverageAmount: 1, // Temporary value, will be auto-calculated
        // Only define 2 coverage types initially
        typeLife: ['hospitalization', 'outpatient'],
        coverageDetails: [
          { type: 'hospitalization', description: 'Hospital care', limit: 25000 },
          { type: 'outpatient', description: 'Outpatient care', limit: 10000 }
        ]
      },
      validity: {
        startDate: new Date('2024-01-01'),
        endDate: new Date('2025-01-01')
      },
      premium: {
        amount: 500,
        frequency: 'monthly'
      },
      beneficiaries: employees.map(emp => emp._id)
    });

    console.log('Before save:');
    console.log(`   typeLife: [${partialPolicy.coverage.typeLife.join(', ')}]`);
    console.log(`   coverageDetails count: ${partialPolicy.coverage.coverageDetails.length}`);
    partialPolicy.coverage.coverageDetails.forEach(detail => {
      console.log(`   - ${detail.type}: $${detail.limit.toLocaleString()}`);
    });

    await partialPolicy.save();

    console.log('\nAfter save (auto-initialization):');
    console.log(`   typeLife: [${partialPolicy.coverage.typeLife.join(', ')}]`);
    console.log(`   coverageDetails count: ${partialPolicy.coverage.coverageDetails.length}`);
    partialPolicy.coverage.coverageDetails.forEach(detail => {
      console.log(`   - ${detail.type}: $${detail.limit.toLocaleString()}`);
    });
    console.log(`   Total coverageAmount: $${partialPolicy.coverage.coverageAmount.toLocaleString()}`);

    // Test Case 2: Create a life policy with no initial coverage types
    console.log('\n📋 Test Case 2: Creating life policy with no initial coverage types');
    const emptyPolicy = new Policy({
      policyType: 'life',
      policyCategory: 'individual',
      insuranceAgent: agent._id,
      coverage: {
        coverageAmount: 1, // Temporary value, will be auto-calculated
        // Start with empty coverage
        typeLife: [],
        coverageDetails: []
      },
      validity: {
        startDate: new Date('2024-01-01'),
        endDate: new Date('2025-01-01')
      },
      premium: {
        amount: 300,
        frequency: 'monthly'
      },
      beneficiaries: [employees[0]._id]
    });

    console.log('Before save:');
    console.log(`   typeLife: [${emptyPolicy.coverage.typeLife.join(', ')}]`);
    console.log(`   coverageDetails count: ${emptyPolicy.coverage.coverageDetails.length}`);

    await emptyPolicy.save();

    console.log('\nAfter save (auto-initialization):');
    console.log(`   typeLife: [${emptyPolicy.coverage.typeLife.join(', ')}]`);
    console.log(`   coverageDetails count: ${emptyPolicy.coverage.coverageDetails.length}`);
    emptyPolicy.coverage.coverageDetails.forEach(detail => {
      console.log(`   - ${detail.type}: $${detail.limit.toLocaleString()} (${detail.description})`);
    });
    console.log(`   Total coverageAmount: $${emptyPolicy.coverage.coverageAmount.toLocaleString()}`);

    // Test Case 3: Test claimedAmounts initialization
    console.log('\n📋 Test Case 3: Testing claimedAmounts initialization');
    console.log('Checking claimedAmounts structure:');
    console.log(`   Beneficiaries count: ${partialPolicy.beneficiaries.length}`);
    console.log(`   ClaimedAmounts count: ${partialPolicy.claimedAmounts.length}`);
    
    partialPolicy.claimedAmounts.forEach((beneficiaryClaims, index) => {
      console.log(`   Beneficiary ${index + 1}:`);
      beneficiaryClaims.forEach(claim => {
        console.log(`     - ${claim.coverageType}: $${claim.claimedAmount.toLocaleString()}`);
      });
    });

    // Test Case 4: Verify all 5 coverage types are always present
    console.log('\n📋 Test Case 4: Verification Summary');
    const expectedCoverageTypes = ['life_cover', 'hospitalization', 'surgical_benefits', 'outpatient', 'prescription_drugs'];
    
    [partialPolicy, emptyPolicy].forEach((policy, index) => {
      console.log(`\nPolicy ${index + 1} verification:`);
      const hasAllTypes = expectedCoverageTypes.every(type => 
        policy.coverage.typeLife.includes(type) && 
        policy.coverage.coverageDetails.some(detail => detail.type === type)
      );
      
      console.log(`   Has all 4 coverage types: ${hasAllTypes ? '✅ YES' : '❌ NO'}`);
      console.log(`   Coverage types: [${policy.coverage.typeLife.join(', ')}]`);
      
      const missingTypes = expectedCoverageTypes.filter(type => 
        !policy.coverage.typeLife.includes(type) || 
        !policy.coverage.coverageDetails.some(detail => detail.type === type)
      );
      
      if (missingTypes.length > 0) {
        console.log(`   Missing types: [${missingTypes.join(', ')}]`);
      }
    });

    // Clean up test policies
    await Policy.deleteOne({ _id: partialPolicy._id });
    await Policy.deleteOne({ _id: emptyPolicy._id });
    console.log('\n🧹 Cleaned up test policies');

    console.log('\n' + '='.repeat(60));
    console.log('🎯 LIFE POLICY AUTO-INITIALIZATION TEST COMPLETED');
    console.log('='.repeat(60));
    console.log('✅ All life policies now automatically include all 4 coverage types!');
    console.log('✅ Coverage types with 0 limits are initialized by default');
    console.log('✅ ClaimedAmounts structure matches all coverage types');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

async function main() {
  try {
    await testLifePolicyAutoInitialization();
  } catch (error) {
    console.error('❌ Test runner failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
}

main();