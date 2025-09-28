import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Import models
import User from '../models/User.js';
import Policy from '../models/Policy.js';
import Claim from '../models/Claim.js';

dotenv.config();

const MONGODB_URI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/lumiere_test';

async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
}

async function testClaimedAmountsSystem() {
  try {
    console.log('🧪 Testing Claimed Amounts Tracking System\n');
    
    // Get test data
    const policy = await Policy.findOne({ policyType: 'life' })
      .populate('beneficiaries', 'profile.firstName profile.lastName email employment.employeeId');
    
    if (!policy) {
      console.log('❌ No test policy found. Run seed script first.');
      return;
    }
    
    console.log(`📋 Testing Policy: ${policy.policyId}`);
    console.log(`👥 Beneficiaries: ${policy.beneficiaries.length}`);
    console.log(`🏥 Coverage Types:`, policy.coverage.typeLife);
    
    // Debug: show claimedAmounts structure
    console.log('\n🔍 Debug: ClaimedAmounts structure');
    policy.claimedAmounts.forEach((ca, index) => {
      console.log(`   ClaimedAmount ${index + 1}:`, JSON.stringify(ca, null, 2));
    });
    
    // Try to manually trigger synchronization
    console.log('\n🔧 Attempting to synchronize claimedAmounts...');
    await policy.save();
    console.log('✅ Policy saved, claimedAmounts should now be synchronized');
    
        // Reload policy to see updated structure and get properly populated beneficiaries
    const reloadedPolicy = await Policy.findById(policy._id)
      .populate('beneficiaries', 'profile.firstName profile.lastName email employment.employeeId');
    
    console.log('\n🔍 Debug: Reloaded ClaimedAmounts structure');
    reloadedPolicy.claimedAmounts.forEach((ca, index) => {
      console.log(`   ClaimedAmount ${index + 1}:`, JSON.stringify(ca, null, 2));
    });
    
    // Debug: show beneficiary structure and IDs
    console.log('\n🔍 Debug: Beneficiary structure');
    reloadedPolicy.beneficiaries.forEach((ben, index) => {
      console.log(`   Beneficiary ${index + 1}:`, {
        id: ben._id,
        idString: ben._id.toString(),
        email: ben.email,
        firstName: ben.profile?.firstName,
        lastName: ben.profile?.lastName
      });
    });
    
    // Debug: check if beneficiary lookup works
    console.log('\n🔍 Debug: Beneficiary lookup test');
    const testBenId = reloadedPolicy.beneficiaries[0]._id;
    const foundIndex = reloadedPolicy.beneficiaries.findIndex(
      id => id.toString() === testBenId.toString()
    );
    console.log(`   Looking for: ${testBenId}`);
    console.log(`   Found at index: ${foundIndex}`);
    console.log(`   Beneficiaries array:`, reloadedPolicy.beneficiaries.map(b => b._id.toString()));
    
    // Use reloaded policy for testing
    
    // Test 1: Check claimedAmounts array structure
    console.log('\n🔍 Test 1: ClaimedAmounts Array Structure');
    console.log(`   ClaimedAmounts array length: ${policy.claimedAmounts?.length || 0}`);
    console.log(`   Beneficiaries array length: ${policy.beneficiaries.length}`);
    
    if (policy.claimedAmounts?.length === policy.beneficiaries.length) {
      console.log('   ✅ Array lengths match');
    } else {
      console.log('   ❌ Array lengths do not match');
    }
    
    // Test 2: Check individual beneficiary claimed amounts
    console.log('\n🔍 Test 2: Individual Beneficiary Claimed Amounts');
    
    for (let i = 0; i < reloadedPolicy.beneficiaries.length; i++) {
      const beneficiary = reloadedPolicy.beneficiaries[i];
      console.log(`\n   👤 ${beneficiary.profile.firstName} ${beneficiary.profile.lastName}:`);
      
      // Test each coverage type
      const coverageTypes = reloadedPolicy.coverage.coverageDetails.map(cd => cd.type);
      for (const coverageType of coverageTypes) {
        const claimedAmount = reloadedPolicy.getClaimedAmountForBeneficiary(beneficiary._id, coverageType);
        const coverageLimit = reloadedPolicy.getCoverageLimit(coverageType);
        const remainingCoverage = reloadedPolicy.getRemainingCoverage(beneficiary._id, coverageType);
        
        console.log(`      ${coverageType}:`);
        console.log(`        Claimed: $${claimedAmount.toLocaleString()}`);
        console.log(`        Limit: $${coverageLimit.toLocaleString()}`);
        console.log(`        Remaining: $${remainingCoverage.toLocaleString()}`);
      }
    }
    
    // Test 3: Validate claim amount function
    console.log('\n🔍 Test 3: Claim Amount Validation');
    
    const testBeneficiary = policy.beneficiaries[0];
    const testCases = [
      { amount: 1000, coverageType: 'hospitalization', shouldPass: true },
      { amount: 50000, coverageType: 'hospitalization', shouldPass: false },
      { amount: 5000, coverageType: 'prescription_drugs', shouldPass: true },
    ];
    
    for (const testCase of testCases) {
      const isValid = policy.validateClaimAmount(
        testBeneficiary._id, 
        testCase.coverageType, 
        testCase.amount
      );
      
      const status = isValid === testCase.shouldPass ? '✅' : '❌';
      console.log(`   ${status} $${testCase.amount.toLocaleString()} for ${testCase.coverageType}: ${isValid ? 'VALID' : 'INVALID'}`);
    }
    
    // Test 4: Check existing approved claims impact
    console.log('\n🔍 Test 4: Approved Claims Impact');
    
    const approvedClaims = await Claim.find({
      policy: policy._id,
      claimStatus: 'approved'
    }).populate('employeeId', 'firstName lastName');
    
    console.log(`   Found ${approvedClaims.length} approved claims:`);
    
    let totalApprovedAmount = 0;
    for (const claim of approvedClaims) {
      totalApprovedAmount += claim.claimAmount.approved || 0;
      console.log(`   • ${claim.claimId}: $${(claim.claimAmount.approved || 0).toLocaleString()} - ${claim.employeeId.firstName} ${claim.employeeId.lastName}`);
    }
    
    console.log(`   Total approved amount: $${totalApprovedAmount.toLocaleString()}`);
    
    // Test 5: Coverage utilization summary
    console.log('\n🔍 Test 5: Coverage Utilization Summary');
    
    const coverageSummary = {};
    
    for (const coverageDetail of policy.coverage.coverageDetails) {
      const coverageType = coverageDetail.type;
      let totalClaimed = 0;
      
      for (const beneficiary of policy.beneficiaries) {
        totalClaimed += policy.getClaimedAmountForBeneficiary(beneficiary._id, coverageType);
      }
      
      const utilizationPercentage = coverageDetail.limit > 0 ? 
        Math.round((totalClaimed / (coverageDetail.limit * policy.beneficiaries.length)) * 100) : 0;
      
      coverageSummary[coverageType] = {
        totalLimit: coverageDetail.limit * policy.beneficiaries.length,
        totalClaimed,
        utilizationPercentage
      };
      
      console.log(`   ${coverageType}:`);
      console.log(`     Total limit (all beneficiaries): $${(coverageDetail.limit * policy.beneficiaries.length).toLocaleString()}`);
      console.log(`     Total claimed: $${totalClaimed.toLocaleString()}`);
      console.log(`     Utilization: ${utilizationPercentage}%`);
    }
    
    // Test 6: Test adding new claimed amount
    console.log('\n🔍 Test 6: Adding New Claimed Amount (Simulation)');
    
    const testBeneficiaryForAdd = policy.beneficiaries[0];
    const originalAmount = policy.getClaimedAmountForBeneficiary(testBeneficiaryForAdd._id, 'outpatient');
    
    console.log(`   Original outpatient amount for ${testBeneficiaryForAdd.firstName}: $${originalAmount.toLocaleString()}`);
    
    // Simulate adding a claim (don't actually save)
    const simulatedAddAmount = 2000;
    const newAmount = originalAmount + simulatedAddAmount;
    const wouldBeValid = policy.validateClaimAmount(testBeneficiaryForAdd._id, 'outpatient', simulatedAddAmount);
    
    console.log(`   Simulating adding $${simulatedAddAmount.toLocaleString()}`);
    console.log(`   New amount would be: $${newAmount.toLocaleString()}`);
    console.log(`   Validation result: ${wouldBeValid ? '✅ VALID' : '❌ INVALID'}`);
    
    // Test 6: Total Coverage Validation
    console.log('\n🔍 Test 6: Total Coverage Validation');
    
    const testBeneficiaryForTotal = policy.beneficiaries[0];
    const originalTotalClaimed = policy.getTotalClaimedForBeneficiary(testBeneficiaryForTotal._id);
    const totalCoverageLimit = policy.coverage.coverageAmount;
    const remainingTotalCoverage = policy.getRemainingTotalCoverage(testBeneficiaryForTotal._id);
    
    console.log(`   Total Coverage Limit: $${totalCoverageLimit.toLocaleString()}`);
    console.log(`   Current Total Claimed: $${originalTotalClaimed.toLocaleString()}`);
    console.log(`   Remaining Total Coverage: $${remainingTotalCoverage.toLocaleString()}`);
    
    // Test various total coverage scenarios
    const testScenarios = [
      { amount: 25000, description: 'Half of total coverage' },
      { amount: 50000, description: 'Full total coverage' },
      { amount: 60000, description: 'Exceeds total coverage' }
    ];
    
    testScenarios.forEach(scenario => {
      const isValid = policy.validateTotalClaimAmount(testBeneficiaryForTotal._id, scenario.amount);
      console.log(`   ${scenario.description} ($${scenario.amount.toLocaleString()}): ${isValid ? '✅ VALID' : '❌ INVALID'}`);
    });

    // Test 7: Coverage Consistency Validation
    console.log('\n🔍 Test 7: Coverage Amount Consistency');
    
    const validation = policy.validateCoverageConsistency();
    console.log(`   Consistency Check: ${validation.isConsistent ? '✅ CONSISTENT' : '❌ INCONSISTENT'}`);
    console.log(`   Current Amount: $${validation.currentAmount.toLocaleString()}`);
    console.log(`   Calculated Amount: $${validation.calculatedAmount.toLocaleString()}`);
    if (!validation.isConsistent) {
      console.log(`   Difference: $${Math.abs(validation.difference).toLocaleString()}`);
    }

    // Test 8: Individual Coverage vs Total Coverage Simulation
    console.log('\n🔍 Test 8: Individual vs Total Coverage Limits');
    
    const testBen = policy.beneficiaries[0];
    
    // Simulate claiming maximum for each coverage type to test total limit enforcement
    let simulatedTotalClaimed = 0;
    const coverageBreakdown = [];
    
    for (const coverageDetail of policy.coverage.coverageDetails) {
      const maxForType = coverageDetail.limit;
      simulatedTotalClaimed += maxForType;
      coverageBreakdown.push({
        type: coverageDetail.type,
        limit: maxForType,
        wouldExceedTotal: simulatedTotalClaimed > totalCoverageLimit
      });
    }
    
    console.log(`   Sum of all individual limits: $${simulatedTotalClaimed.toLocaleString()}`);
    console.log(`   Total coverage limit: $${totalCoverageLimit.toLocaleString()}`);
    console.log(`   Would individual maximums exceed total? ${simulatedTotalClaimed > totalCoverageLimit ? '⚠️  YES' : '✅ NO'}`);
    
    if (simulatedTotalClaimed === totalCoverageLimit) {
      console.log(`   ✅ Perfect alignment: Individual limits sum exactly to total coverage`);
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('🎯 COMPREHENSIVE CLAIMED AMOUNTS & COVERAGE VALIDATION COMPLETED');
    console.log('='.repeat(60));
    
    const allTestsPassed = policy.claimedAmounts?.length === policy.beneficiaries.length && 
                         policy.validateCoverageConsistency().isConsistent;
    
    if (allTestsPassed) {
      console.log('✅ All basic tests passed - System appears to be working correctly');
    } else {
      console.log('❌ Some tests failed - Check the implementation');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

async function main() {
  try {
    await connectDB();
    await testClaimedAmountsSystem();
  } catch (error) {
    console.error('❌ Test runner failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
}

main();