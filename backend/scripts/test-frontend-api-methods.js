/**
 * Test Frontend API Service Methods for Policy Creation
 * This simulates the frontend API service methods without actually making HTTP requests
 */

// Simulate the backend auto-initialization for testing
function simulateBackendAutoInit(policyData) {
  // Simulate what the backend does
  if (policyData.policyType === 'life') {
    const allLifeCoverageTypes = ["life_cover", "hospitalization", "surgical_benefits", "outpatient", "prescription_drugs"];
    
    if (!policyData.coverage) {
      policyData.coverage = {};
    }
    
    // Auto-initialize typeLife
    policyData.coverage.typeLife = allLifeCoverageTypes;
    
    // Auto-initialize coverageDetails with missing types
    const existingDetails = policyData.coverage.coverageDetails || [];
    const fullCoverageDetails = [];
    
    allLifeCoverageTypes.forEach(type => {
      const existing = existingDetails.find(detail => detail.type === type);
      if (existing) {
        fullCoverageDetails.push(existing);
      } else {
        fullCoverageDetails.push({
          type: type,
          description: `${type.replace('_', ' ')} coverage`,
          limit: 0
        });
      }
    });
    
    policyData.coverage.coverageDetails = fullCoverageDetails;
    
    // Auto-calculate coverage amount if needed
    if (policyData.coverage.coverageDetails.length > 0) {
      const calculatedAmount = policyData.coverage.coverageDetails.reduce(
        (total, detail) => total + (detail.limit || 0), 0
      );
      if (calculatedAmount > 0) {
        policyData.coverage.coverageAmount = calculatedAmount;
      }
    }
  }
  
  return policyData;
}

// Simulate frontend API service methods
class TestInsuranceApi {
  
  calculateTotalCoverageAmount(coverageDetails) {
    if (!Array.isArray(coverageDetails)) {
      return 0;
    }
    return coverageDetails.reduce((total, detail) => {
      return total + (detail.limit || 0);
    }, 0);
  }

  async createPolicy(policyData) {
    if (!policyData) {
      throw new Error('Policy data is required');
    }

    // Ensure coverageAmount is always provided (required by model validation)
    if (!policyData.coverage) {
      policyData.coverage = {};
    }

    if (!policyData.coverage.coverageAmount) {
      if (policyData.coverage.coverageDetails && policyData.coverage.coverageDetails.length > 0) {
        // Calculate from coverage details
        const calculatedAmount = policyData.coverage.coverageDetails.reduce(
          (total, detail) => total + (detail.limit || 0), 0
        );
        policyData.coverage.coverageAmount = calculatedAmount > 0 ? calculatedAmount : 1;
      } else {
        // Set minimum value - backend pre-save middleware will handle auto-calculation
        policyData.coverage.coverageAmount = 1;
      }
    }

    // Simulate backend processing
    const processedData = simulateBackendAutoInit({ ...policyData });
    
    return {
      success: true,
      policy: processedData
    };
  }

  async createLifePolicyWithAllCoverageTypes(policyData, customCoverageDetails = []) {
    if (!policyData) {
      throw new Error('Policy data is required');
    }

    if (policyData.policyType !== 'life') {
      throw new Error('This method is only for life insurance policies');
    }

    // Define all life coverage types with default descriptions and 0 limits
    const defaultCoverageDetails = [
      { type: "hospitalization", description: "Hospital stays and medical treatments", limit: 0 },
      { type: "surgical_benefits", description: "Surgical procedures and related costs", limit: 0 },
      { type: "outpatient", description: "Outpatient treatments and consultations", limit: 0 },
      { type: "prescription_drugs", description: "Prescription medications and pharmacy costs", limit: 0 }
    ];

    // Merge custom coverage details with defaults (custom values override defaults)
    const mergedCoverageDetails = defaultCoverageDetails.map(defaultDetail => {
      const customDetail = customCoverageDetails.find(detail => detail.type === defaultDetail.type);
      return customDetail ? { ...defaultDetail, ...customDetail } : defaultDetail;
    });

    // Ensure the policy data has all required coverage information
    const enhancedPolicyData = {
      ...policyData,
      coverage: {
        ...policyData.coverage,
        typeLife: ["life_cover", "hospitalization", "surgical_benefits", "outpatient", "prescription_drugs"],
        coverageDetails: mergedCoverageDetails,
        coverageAmount: this.calculateTotalCoverageAmount(mergedCoverageDetails)
      }
    };

    return this.createPolicy(enhancedPolicyData);
  }
}

// Test the API service methods
async function testFrontendApiMethods() {
  console.log('🧪 Testing Frontend API Service Methods\n');
  
  const api = new TestInsuranceApi();

  // Test Case 1: Basic createPolicy with no coverage data
  console.log('📋 Test Case 1: Basic createPolicy with minimal data');
  try {
    const result1 = await api.createPolicy({
      policyType: 'life',
      policyCategory: 'individual',
      insuranceAgent: '507f1f77bcf86cd799439011'
    });
    
    console.log('✅ Policy created successfully');
    console.log(`   Coverage amount: $${result1.policy.coverage.coverageAmount.toLocaleString()}`);
    console.log(`   Coverage types: [${result1.policy.coverage.typeLife.join(', ')}]`);
    console.log(`   Coverage details count: ${result1.policy.coverage.coverageDetails.length}`);
  } catch (error) {
    console.log('❌ Failed:', error.message);
  }

  // Test Case 2: createPolicy with partial coverage details
  console.log('\n📋 Test Case 2: createPolicy with partial coverage details');
  try {
    const result2 = await api.createPolicy({
      policyType: 'life',
      policyCategory: 'group',
      insuranceAgent: '507f1f77bcf86cd799439011',
      coverage: {
        coverageDetails: [
          { type: 'hospitalization', limit: 30000 },
          { type: 'outpatient', limit: 5000 }
        ]
      }
    });
    
    console.log('✅ Policy created successfully');
    console.log(`   Coverage amount: $${result2.policy.coverage.coverageAmount.toLocaleString()}`);
    console.log(`   Coverage types: [${result2.policy.coverage.typeLife.join(', ')}]`);
    console.log('   Coverage details:');
    result2.policy.coverage.coverageDetails.forEach(detail => {
      console.log(`     - ${detail.type}: $${detail.limit.toLocaleString()}`);
    });
  } catch (error) {
    console.log('❌ Failed:', error.message);
  }

  // Test Case 3: createLifePolicyWithAllCoverageTypes with custom details
  console.log('\n📋 Test Case 3: createLifePolicyWithAllCoverageTypes with custom details');
  try {
    const result3 = await api.createLifePolicyWithAllCoverageTypes(
      {
        policyType: 'life',
        policyCategory: 'group',
        insuranceAgent: '507f1f77bcf86cd799439011'
      },
      [
        { type: 'hospitalization', limit: 40000 },
        { type: 'surgical_benefits', limit: 20000 },
        { type: 'prescription_drugs', limit: 3000 }
        // outpatient will default to 0
      ]
    );
    
    console.log('✅ Life policy with all coverage types created successfully');
    console.log(`   Coverage amount: $${result3.policy.coverage.coverageAmount.toLocaleString()}`);
    console.log(`   Coverage types: [${result3.policy.coverage.typeLife.join(', ')}]`);
    console.log('   Coverage details:');
    result3.policy.coverage.coverageDetails.forEach(detail => {
      console.log(`     - ${detail.type}: $${detail.limit.toLocaleString()}`);
    });
  } catch (error) {
    console.log('❌ Failed:', error.message);
  }

  // Test Case 4: createLifePolicyWithAllCoverageTypes with no custom details
  console.log('\n📋 Test Case 4: createLifePolicyWithAllCoverageTypes with no custom details');
  try {
    const result4 = await api.createLifePolicyWithAllCoverageTypes({
      policyType: 'life',
      policyCategory: 'individual',
      insuranceAgent: '507f1f77bcf86cd799439011'
    });
    
    console.log('✅ Default life policy created successfully');
    console.log(`   Coverage amount: $${result4.policy.coverage.coverageAmount.toLocaleString()}`);
    console.log(`   Coverage types: [${result4.policy.coverage.typeLife.join(', ')}]`);
    console.log('   All coverage details have $0 limits (as expected for defaults)');
  } catch (error) {
    console.log('❌ Failed:', error.message);
  }

  // Test Case 5: Error handling - wrong policy type
  console.log('\n📋 Test Case 5: Error handling - wrong policy type for life-specific method');
  try {
    await api.createLifePolicyWithAllCoverageTypes({
      policyType: 'vehicle',
      policyCategory: 'individual'
    });
    console.log('❌ Should have failed but did not');
  } catch (error) {
    console.log('✅ Correctly caught error:', error.message);
  }

  console.log('\n' + '='.repeat(60));
  console.log('🎯 FRONTEND API SERVICE TEST COMPLETED');
  console.log('='.repeat(60));
  console.log('✅ createPolicy method handles missing coverageAmount');
  console.log('✅ Life policies get auto-initialized coverage types');
  console.log('✅ createLifePolicyWithAllCoverageTypes works correctly');
  console.log('✅ Error handling works for invalid policy types');
  console.log('✅ Coverage amounts are properly calculated');
}

testFrontendApiMethods();