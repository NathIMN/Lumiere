import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

// Import models
import User from '../models/User.js';
import Policy from '../models/Policy.js';
import { QuestionnaireTemplate } from '../models/QuestionnaireTemplate.js';
import Claim from '../models/Claim.js';

// Load environment variables
dotenv.config();

const MONGODB_URI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/lumiere_test';

// Sample users - one for each role
const sampleUsers = [
  {
    email: 'admin@lumiere.com',
    password: 'password123',
    role: 'admin',
    profile: {
      firstName: 'Admin',
      lastName: 'User',
      dateOfBirth: new Date('1985-01-15'),
      nic: '850151234V',
      phoneNumber: '+94771234567',
      address: '123 Admin Street, Colombo 03, Sri Lanka'
    }
  },
  {
    email: 'hr@lumiere.com',
    password: 'password123',
    role: 'hr_officer',
    profile: {
      firstName: 'HR',
      lastName: 'Officer',
      dateOfBirth: new Date('1988-05-20'),
      nic: '881412345V',
      phoneNumber: '+94771234568',
      address: '456 HR Avenue, Colombo 07, Sri Lanka'
    }
  },
  {
    email: 'agent@securelife.com',
    password: 'password123',
    role: 'insurance_agent',
    profile: {
      firstName: 'Agent',
      lastName: 'Smith',
      dateOfBirth: new Date('1980-07-10'),
      nic: '802101234V',
      phoneNumber: '+94771234569',
      address: '789 Insurance Plaza, Colombo 01, Sri Lanka'
    },
    insuranceProvider: {
      companyName: "SecureLife Insurance",
      agentId: "AGENT001",
      licenseNumber: "INS123456789",
      contactEmail: "agent.smith@securelife.com",
      contactPhone: "+94771234569"
    }
  },
  {
    email: 'employee@lumiere.com',
    password: 'password123',
    role: 'employee',
    profile: {
      firstName: 'John',
      lastName: 'Employee',
      dateOfBirth: new Date('1990-07-25'),
      nic: '902062347V',
      phoneNumber: '+94771234570',
      address: '321 Employee Lane, Galle, Sri Lanka'
    },
    employment: {
      department: 'Engineering',
      designation: 'Software Developer',
      employmentType: 'permanent',
      joinDate: new Date('2023-03-01'),
      salary: 75000
    },
    bankDetails: {
      accountHolderName: 'John Employee',
      bankName: 'Commercial Bank',
      branchName: 'Galle Branch',
      accountNumber: '12345678901'
    }
  },
  {
    email: 'executive@lumiere.com',
    password: 'password123',
    role: 'employee',
    profile: {
      firstName: 'Jane',
      lastName: 'Executive',
      dateOfBirth: new Date('1982-12-05'),
      nic: '826392348V',
      phoneNumber: '+94771234571',
      address: '555 Executive Plaza, Colombo 02, Sri Lanka'
    },
    employment: {
      department: 'Management',
      designation: 'Vice President',
      employmentType: 'executive',
      joinDate: new Date('2022-01-01'),
      salary: 120000
    },
    bankDetails: {
      accountHolderName: 'Jane Executive',
      bankName: 'Nations Trust Bank',
      branchName: 'Colombo 02 Branch',
      accountNumber: '98765432109'
    }
  }
];

// Life insurance questionnaire template
const lifeInsuranceTemplate = {
  claimType: 'life',
  claimOption: 'hospitalization',
  title: 'Life Insurance - Hospitalization Claim',
  description: 'Questionnaire for life insurance hospitalization claims',
  version: 1,
  isActive: true,
  sections: [
    {
      title: 'Patient Information',
      description: 'Basic information about the patient',
      order: 1,
      questions: [
        {
          questionId: 'patient_name',
          questionText: 'Full name of the patient',
          questionType: 'text',
          isRequired: true,
          order: 1
        },
        {
          questionId: 'patient_age',
          questionText: 'Age of the patient',
          questionType: 'number',
          isRequired: true,
          order: 2
        },
        {
          questionId: 'patient_relationship',
          questionText: 'Relationship to policy holder',
          questionType: 'select',
          options: ['Self', 'Spouse', 'Child', 'Parent', 'Other'],
          isRequired: true,
          order: 3
        }
      ]
    },
    {
      title: 'Hospitalization Details',
      description: 'Details about the hospitalization',
      order: 2,
      questions: [
        {
          questionId: 'hospital_name',
          questionText: 'Name of the hospital',
          questionType: 'text',
          isRequired: true,
          order: 1
        },
        {
          questionId: 'admission_date',
          questionText: 'Date of admission',
          questionType: 'date',
          isRequired: true,
          order: 2
        },
        {
          questionId: 'discharge_date',
          questionText: 'Date of discharge',
          questionType: 'date',
          isRequired: true,
          order: 3
        },
        {
          questionId: 'diagnosis',
          questionText: 'Primary diagnosis',
          questionType: 'text',
          isRequired: true,
          order: 4
        },
        {
          questionId: 'treatment_received',
          questionText: 'Treatment received',
          questionType: 'text',
          isRequired: true,
          order: 5
        }
      ]
    },
    {
      title: 'Financial Information',
      description: 'Cost and billing information',
      order: 3,
      questions: [
        {
          questionId: 'total_bill_amount',
          questionText: 'Total hospital bill amount',
          questionType: 'number',
          isRequired: true,
          order: 1
        },
        {
          questionId: 'amount_paid',
          questionText: 'Amount already paid by patient',
          questionType: 'number',
          isRequired: true,
          order: 2
        },
        {
          questionId: 'insurance_coverage',
          questionText: 'Any other insurance coverage?',
          questionType: 'boolean',
          isRequired: true,
          order: 3
        }
      ]
    }
  ]
};

// Sample life insurance policy
const createSamplePolicy = (agentId, beneficiaryIds) => {
  const coverageDetails = [
    {
      type: 'life_cover',
      description: 'Life insurance and death benefits',
      limit: 100000
    },
    {
      type: 'hospitalization',
      description: 'Hospital stays and room charges',
      limit: 20000
    },
    {
      type: 'surgical_benefits',
      description: 'Surgical procedures and operations',
      limit: 15000
    },
    {
      type: 'outpatient',
      description: 'Outpatient treatments and consultations',
      limit: 8000
    },
    {
      type: 'prescription_drugs',
      description: 'Prescription medications',
      limit: 7000
    }
  ];

  // Calculate total coverage amount automatically
  const totalCoverageAmount = coverageDetails.reduce((sum, detail) => sum + detail.limit, 0);

  return {
    policyType: 'life',
    policyCategory: 'group',
    insuranceAgent: agentId,
    coverage: {
      coverageAmount: totalCoverageAmount, // Auto-calculated: 150,000
      deductible: 500,
      typeLife: ['life_cover', 'hospitalization', 'surgical_benefits', 'outpatient', 'prescription_drugs'],
      coverageDetails: coverageDetails
    },
    validity: {
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-12-31')
    },
    premium: {
      amount: 2000,
      frequency: 'annual'
    },
    beneficiaries: beneficiaryIds,
    status: 'active',
    notes: 'Sample group life insurance policy with auto-calculated coverage amount for testing claimed amounts tracking'
  };
};

async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
}

async function clearExistingData() {
  try {
    await User.deleteMany({});
    await Policy.deleteMany({});
    await QuestionnaireTemplate.deleteMany({});
    await Claim.deleteMany({});
    console.log('🧹 Cleared existing data');
  } catch (error) {
    console.error('❌ Error clearing data:', error);
    throw error;
  }
}

async function seedUsers() {
  try {
    const users = [];
    
    for (const userData of sampleUsers) {
      // Let the User model middleware handle password hashing
      const user = new User(userData);
      await user.save();
      users.push(user);
      console.log(`👤 Created user: ${user.profile.firstName} ${user.profile.lastName} (${user.role})`);
    }
    
    return users;
  } catch (error) {
    console.error('❌ Error seeding users:', error);
    throw error;
  }
}

async function seedQuestionnaireTemplate() {
  try {
    // Find an admin user to set as modifiedBy
    const adminUser = await User.findOne({ role: 'admin' });
    if (!adminUser) {
      throw new Error('No admin user found to set as template modifier');
    }
    
    const templateData = {
      ...lifeInsuranceTemplate,
      modifiedBy: adminUser._id
    };
    
    const template = new QuestionnaireTemplate(templateData);
    await template.save();
    console.log('📋 Created questionnaire template: Life Insurance - Hospitalization');
    return template;
  } catch (error) {
    console.error('❌ Error seeding questionnaire template:', error);
    throw error;
  }
}

async function seedPolicy(users) {
  try {
    // Find the insurance agent
    const agent = users.find(u => u.role === 'insurance_agent');
    
    // Get employee and executive as beneficiaries
    const beneficiaries = users
      .filter(u => u.role === 'employee')
      .map(u => u._id);

    const policyData = createSamplePolicy(agent._id, beneficiaries);
    const policy = new Policy(policyData);
    await policy.save();
    
    // Populate for display
    await policy.populate([
      { path: 'insuranceAgent', select: 'profile.firstName profile.lastName email role' },
      { path: 'beneficiaries', select: 'profile.firstName profile.lastName email userId' }
    ]);
    
    console.log(`🏥 Created life insurance policy: ${policy.policyId}`);
    console.log(`   Agent: ${policy.insuranceAgent.profile.firstName} ${policy.insuranceAgent.profile.lastName}`);
    console.log(`   Beneficiaries: ${policy.beneficiaries.map(b => `${b.profile.firstName} ${b.profile.lastName} (${b.userId})`).join(', ')}`);
    console.log(`   Coverage Types: ${policy.coverage.typeLife.join(', ')}`);
    console.log(`   Coverage Limits:`);
    policy.coverage.coverageDetails.forEach(detail => {
      console.log(`     - ${detail.type}: $${detail.limit.toLocaleString()}`);
    });
    
    return policy;
  } catch (error) {
    console.error('❌ Error seeding policy:', error);
    throw error;
  }
}

async function displaySeedSummary(users, policy, template) {
  console.log('\n' + '='.repeat(60));
  console.log('🎯 SEED DATA SUMMARY - READY FOR TESTING');
  console.log('='.repeat(60));
  
  console.log('\n👥 TEST ACCOUNTS:');
  users.forEach(user => {
    console.log(`   • ${user.email} | ${user.password} | ${user.role.toUpperCase()}`);
  });
  
  console.log(`\n🏥 POLICY:`)
  console.log(`   • Policy ID: ${policy.policyId}`)
  console.log(`   • Type: ${policy.policyType} (${policy.policyCategory})`)
  console.log(`   • Total Coverage: $${policy.coverage.coverageAmount.toLocaleString()}`)
  console.log(`   • Beneficiaries: ${policy.beneficiaries.length}`)
  
  // Display coverage consistency validation
  const validation = policy.validateCoverageConsistency();
  console.log(`   • Coverage Calculation: ${validation.isConsistent ? '✅ Consistent' : '⚠️ Needs Review'}`)
  if (validation.calculatedAmount !== validation.currentAmount) {
    console.log(`     - Current: $${validation.currentAmount.toLocaleString()}`)
    console.log(`     - Calculated: $${validation.calculatedAmount.toLocaleString()}`)
  }
  
  console.log(`\n📋 QUESTIONNAIRE:`)
  console.log(`   • Template: ${template.title}`)
  console.log(`   • Claim Type: ${template.claimType} - ${template.claimOption}`)
  console.log(`   • Sections: ${template.sections.length}`)
  
  console.log(`\n🧪 TESTING WORKFLOW:`);
  console.log(`   1. Login as employee@lumiere.com (password123)`);
  console.log(`   2. Create a claim for policy ${policy.policyId}`);
  console.log(`   3. Fill questionnaire and submit with amount`);
  console.log(`   4. Login as hr@lumiere.com to forward to insurer`);
  console.log(`   5. Login as agent@lumiere.com to approve/reject`);
  console.log(`   6. Check claimed amounts tracking updates`);
  
  console.log(`\n🎯 TESTING ENDPOINTS:`);
  console.log(`   • GET /api/policies/${policy._id}/claimed-amounts`);
  console.log(`   • GET /api/policies/${policy._id}/claimed-amounts/summary`);
  console.log(`   • GET /api/policies/${policy._id}/enhanced-claimed-amounts-summary`);
  console.log(`   • GET /api/policies/${policy._id}/validate-coverage-consistency`);
  console.log(`   • Use preview claim approval in insurance agent interface`);
  
  console.log(`\n💡 COVERAGE LIMITS FOR TESTING:`);
  policy.coverage.coverageDetails.forEach(detail => {
    console.log(`   • ${detail.type}: $${detail.limit.toLocaleString()}`);
  });
  
  console.log('\n' + '='.repeat(60));
}

async function main() {
  try {
    console.log('🚀 Starting seed process for claimed amounts testing...\n');
    
    await connectDB();
    await clearExistingData();
    
    const users = await seedUsers();
    const template = await seedQuestionnaireTemplate();
    const policy = await seedPolicy(users);
    
    await displaySeedSummary(users, policy, template);
    
    console.log('\n✅ Seed process completed successfully!');
    console.log('🔬 Database is ready for claimed amounts testing');
    
  } catch (error) {
    console.error('\n❌ Seed process failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
    process.exit(0);
  }
}

// Handle process termination
process.on('SIGINT', async () => {
  console.log('\n⚠️  Process interrupted by user');
  await mongoose.connection.close();
  process.exit(0);
});

process.on('unhandledRejection', async (err) => {
  console.error('❌ Unhandled Promise Rejection:', err);
  await mongoose.connection.close();
  process.exit(1);
});

main();