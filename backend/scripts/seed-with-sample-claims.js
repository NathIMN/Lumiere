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
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@lumiere.com',
    password: 'password123',
    role: 'admin',
    employeeId: 'ADM001',
    employment: {
      department: 'IT',
      position: 'System Administrator',
      startDate: new Date('2023-01-01'),
      salary: 80000,
      status: 'active'
    },
    contactInfo: {
      phone: '+1234567890',
      address: {
        street: '123 Admin St',
        city: 'Tech City',
        state: 'CA',
        zipCode: '12345',
        country: 'USA'
      }
    }
  },
  {
    firstName: 'HR',
    lastName: 'Officer',
    email: 'hr@lumiere.com',
    password: 'password123',
    role: 'hr_officer',
    employeeId: 'HR001',
    employment: {
      department: 'Human Resources',
      position: 'HR Officer',
      startDate: new Date('2023-02-01'),
      salary: 65000,
      status: 'active'
    },
    contactInfo: {
      phone: '+1234567891',
      address: {
        street: '456 HR Avenue',
        city: 'Business City',
        state: 'CA',
        zipCode: '12346',
        country: 'USA'
      }
    }
  },
  {
    firstName: 'Insurance',
    lastName: 'Agent',
    email: 'agent@lumiere.com',
    password: 'password123',
    role: 'insurance_agent',
    employeeId: 'AGT001',
    employment: {
      department: 'Insurance',
      position: 'Senior Agent',
      startDate: new Date('2023-01-15'),
      salary: 70000,
      status: 'active'
    },
    contactInfo: {
      phone: '+1234567892',
      address: {
        street: '789 Agent Blvd',
        city: 'Insurance City',
        state: 'CA',
        zipCode: '12347',
        country: 'USA'
      }
    }
  },
  {
    firstName: 'John',
    lastName: 'Employee',
    email: 'employee@lumiere.com',
    password: 'password123',
    role: 'employee',
    employeeId: 'EMP001',
    employment: {
      department: 'Engineering',
      position: 'Software Developer',
      startDate: new Date('2023-03-01'),
      salary: 75000,
      status: 'active'
    },
    contactInfo: {
      phone: '+1234567893',
      address: {
        street: '321 Employee Lane',
        city: 'Dev City',
        state: 'CA',
        zipCode: '12348',
        country: 'USA'
      }
    }
  },
  {
    firstName: 'Jane',
    lastName: 'Executive',
    email: 'executive@lumiere.com',
    password: 'password123',
    role: 'executive',
    employeeId: 'EXC001',
    employment: {
      department: 'Management',
      position: 'Vice President',
      startDate: new Date('2022-01-01'),
      salary: 120000,
      status: 'active'
    },
    contactInfo: {
      phone: '+1234567894',
      address: {
        street: '555 Executive Plaza',
        city: 'Corporate City',
        state: 'CA',
        zipCode: '12349',
        country: 'USA'
      }
    }
  }
];

// Life insurance questionnaire template
const lifeInsuranceTemplate = {
  claimType: 'life',
  claimOption: 'hospitalization',
  templateName: 'Life Insurance - Hospitalization Claim',
  description: 'Questionnaire for life insurance hospitalization claims',
  version: '1.0',
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
        }
      ]
    }
  ]
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
      const hashedPassword = await bcrypt.hash(userData.password, 12);
      const user = new User({
        ...userData,
        password: hashedPassword
      });
      await user.save();
      users.push(user);
      console.log(`👤 Created user: ${user.firstName} ${user.lastName} (${user.role})`);
    }
    
    return users;
  } catch (error) {
    console.error('❌ Error seeding users:', error);
    throw error;
  }
}

async function seedQuestionnaireTemplate() {
  try {
    const template = new QuestionnaireTemplate(lifeInsuranceTemplate);
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
    const agent = users.find(u => u.role === 'insurance_agent');
    const beneficiaries = users.filter(u => ['employee', 'executive'].includes(u.role));

    const policyData = {
      policyType: 'life',
      policyCategory: 'group',
      insuranceAgent: agent._id,
      coverage: {
        coverageAmount: 50000,
        deductible: 500,
        typeLife: ['life_cover', 'hospitalization', 'surgical_benefits', 'outpatient', 'prescription_drugs'],
        coverageDetails: [
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
        ]
      },
      validity: {
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31')
      },
      premium: {
        amount: 2000,
        frequency: 'annual'
      },
      beneficiaries: beneficiaries.map(b => b._id),
      status: 'active',
      notes: 'Sample group life insurance policy for testing claimed amounts tracking'
    };

    const policy = new Policy(policyData);
    await policy.save();
    
    await policy.populate([
      { path: 'insuranceAgent', select: 'firstName lastName email' },
      { path: 'beneficiaries', select: 'firstName lastName email employeeId' }
    ]);
    
    console.log(`🏥 Created life insurance policy: ${policy.policyId}`);
    return { policy, beneficiaries };
  } catch (error) {
    console.error('❌ Error seeding policy:', error);
    throw error;
  }
}

async function createSampleClaims(users, policy, template) {
  try {
    const employee = users.find(u => u.role === 'employee');
    const executive = users.find(u => u.role === 'executive');
    const hrUser = users.find(u => u.role === 'hr_officer');
    const agent = users.find(u => u.role === 'insurance_agent');

    const claims = [];

    // Claim 1: Approved claim for employee (hospitalization) - This will add to claimed amounts
    const claim1Data = {
      employeeId: employee._id,
      policy: policy._id,
      claimType: 'life',
      lifeClaimOption: 'hospitalization',
      claimStatus: 'approved',
      questionnaire: {
        templateReference: template._id,
        sections: template.sections.map((section, index) => ({
          sectionId: section._id?.toString() || `section_${index}`,
          title: section.title,
          description: section.description,
          order: section.order,
          responses: section.questions.map(q => ({
            questionId: q.questionId,
            questionText: q.questionText,
            questionType: q.questionType,
            options: q.options,
            isRequired: q.isRequired,
            order: q.order,
            answer: getAnswerForQuestion(q.questionId),
            isAnswered: true,
            answeredAt: new Date()
          })),
          isComplete: true,
          completedAt: new Date()
        })),
        isComplete: true,
        completedAt: new Date()
      },
      claimAmount: {
        requested: 5000,
        approved: 4500
      },
      hrForwardingDetails: {
        coverageBreakdown: [
          {
            coverageType: 'hospitalization',
            requestedAmount: 5000,
            notes: 'Hospital stay for 3 days'
          }
        ],
        hrNotes: 'Verified documentation and eligibility',
        forwardedBy: hrUser._id,
        forwardedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) // 5 days ago
      },
      decision: {
        status: 'approved',
        approvedAmount: 4500,
        insurerNotes: 'Approved after review. Reasonable hospitalization costs.',
        decidedBy: agent._id,
        decidedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
      },
      submittedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
      forwardedToInsurerAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      finalizedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    };

    const claim1 = new Claim(claim1Data);
    await claim1.save();

    // Update policy claimed amounts manually for this approved claim
    policy.addClaimedAmount(employee._id, 'hospitalization', 4500);
    await policy.save();

    console.log(`✅ Created approved claim: ${claim1.claimId} - $4,500 approved (hospitalization)`);
    claims.push(claim1);

    // Claim 2: Pending claim for executive (outpatient)
    const claim2Data = {
      employeeId: executive._id,
      policy: policy._id,
      claimType: 'life',
      lifeClaimOption: 'hospitalization',
      claimStatus: 'insurer',
      questionnaire: {
        templateReference: template._id,
        sections: template.sections.map((section, index) => ({
          sectionId: section._id?.toString() || `section_${index}`,
          title: section.title,
          description: section.description,
          order: section.order,
          responses: section.questions.map(q => ({
            questionId: q.questionId,
            questionText: q.questionText,
            questionType: q.questionType,
            options: q.options,
            isRequired: q.isRequired,
            order: q.order,
            answer: getAnswerForQuestion(q.questionId, 'executive'),
            isAnswered: true,
            answeredAt: new Date()
          })),
          isComplete: true,
          completedAt: new Date()
        })),
        isComplete: true,
        completedAt: new Date()
      },
      claimAmount: {
        requested: 3000
      },
      hrForwardingDetails: {
        coverageBreakdown: [
          {
            coverageType: 'outpatient',
            requestedAmount: 2000,
            notes: 'Outpatient consultation and tests'
          },
          {
            coverageType: 'prescription_drugs',
            requestedAmount: 1000,
            notes: 'Prescribed medications'
          }
        ],
        hrNotes: 'Multiple coverage types claim - ready for review',
        forwardedBy: hrUser._id,
        forwardedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1 day ago
      },
      submittedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      forwardedToInsurerAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
    };

    const claim2 = new Claim(claim2Data);
    await claim2.save();
    console.log(`⏳ Created pending claim: ${claim2.claimId} - $3,000 requested (outpatient + drugs)`);
    claims.push(claim2);

    // Claim 3: Another approved claim for employee (surgical_benefits) - Add more claimed amounts
    const claim3Data = {
      employeeId: employee._id,
      policy: policy._id,
      claimType: 'life',
      lifeClaimOption: 'hospitalization',
      claimStatus: 'approved',
      questionnaire: {
        templateReference: template._id,
        sections: template.sections.map((section, index) => ({
          sectionId: section._id?.toString() || `section_${index}`,
          title: section.title,
          description: section.description,
          order: section.order,
          responses: section.questions.map(q => ({
            questionId: q.questionId,
            questionText: q.questionText,
            questionType: q.questionType,
            options: q.options,
            isRequired: q.isRequired,
            order: q.order,
            answer: getAnswerForQuestion(q.questionId, 'employee2'),
            isAnswered: true,
            answeredAt: new Date()
          })),
          isComplete: true,
          completedAt: new Date()
        })),
        isComplete: true,
        completedAt: new Date()
      },
      claimAmount: {
        requested: 8000,
        approved: 7000
      },
      hrForwardingDetails: {
        coverageBreakdown: [
          {
            coverageType: 'surgical_benefits',
            requestedAmount: 8000,
            notes: 'Minor surgical procedure'
          }
        ],
        hrNotes: 'Surgical procedure claim with proper documentation',
        forwardedBy: hrUser._id,
        forwardedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) // 10 days ago
      },
      decision: {
        status: 'approved',
        approvedAmount: 7000,
        insurerNotes: 'Approved surgical claim after medical review',
        decidedBy: agent._id,
        decidedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 days ago
      },
      submittedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000), // 12 days ago
      forwardedToInsurerAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      finalizedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    };

    const claim3 = new Claim(claim3Data);
    await claim3.save();

    // Update policy claimed amounts for this approved claim
    policy.addClaimedAmount(employee._id, 'surgical_benefits', 7000);
    await policy.save();

    console.log(`✅ Created approved claim: ${claim3.claimId} - $7,000 approved (surgical_benefits)`);
    claims.push(claim3);

    return claims;
  } catch (error) {
    console.error('❌ Error creating sample claims:', error);
    throw error;
  }
}

function getAnswerForQuestion(questionId, variant = 'default') {
  const answers = {
    default: {
      patient_name: { textValue: 'John Employee' },
      patient_age: { numberValue: 35 },
      patient_relationship: { selectValue: 'Self' },
      hospital_name: { textValue: 'General Hospital' },
      admission_date: { dateValue: new Date('2024-09-15') },
      discharge_date: { dateValue: new Date('2024-09-18') },
      diagnosis: { textValue: 'Acute appendicitis' },
      total_bill_amount: { numberValue: 5000 }
    },
    executive: {
      patient_name: { textValue: 'Jane Executive' },
      patient_age: { numberValue: 45 },
      patient_relationship: { selectValue: 'Self' },
      hospital_name: { textValue: 'Medical Center' },
      admission_date: { dateValue: new Date('2024-09-20') },
      discharge_date: { dateValue: new Date('2024-09-20') },
      diagnosis: { textValue: 'Routine checkup and consultation' },
      total_bill_amount: { numberValue: 3000 }
    },
    employee2: {
      patient_name: { textValue: 'John Employee' },
      patient_age: { numberValue: 35 },
      patient_relationship: { selectValue: 'Self' },
      hospital_name: { textValue: 'Surgical Center' },
      admission_date: { dateValue: new Date('2024-09-10') },
      discharge_date: { dateValue: new Date('2024-09-12') },
      diagnosis: { textValue: 'Minor surgical procedure' },
      total_bill_amount: { numberValue: 8000 }
    }
  };

  return answers[variant]?.[questionId] || answers.default[questionId] || {};
}

async function displayAdvancedSeedSummary(users, policy, template, claims) {
  console.log('\n' + '='.repeat(70));
  console.log('🎯 ADVANCED SEED DATA - CLAIMED AMOUNTS TESTING READY');
  console.log('='.repeat(70));
  
  console.log('\n👥 TEST ACCOUNTS:');
  users.forEach(user => {
    console.log(`   • ${user.email.padEnd(25)} | password123 | ${user.role.toUpperCase()}`);
  });
  
  console.log(`\n🏥 POLICY DETAILS:`);
  console.log(`   • Policy ID: ${policy.policyId}`);
  console.log(`   • Type: ${policy.policyType} (${policy.policyCategory})`);
  console.log(`   • Beneficiaries: ${policy.beneficiaries.length}`);
  
  console.log(`\n💰 COVERAGE LIMITS:`);
  policy.coverage.coverageDetails.forEach(detail => {
    console.log(`   • ${detail.type.padEnd(20)}: $${detail.limit.toLocaleString().padStart(7)}`);
  });
  
  console.log(`\n📊 CURRENT CLAIMED AMOUNTS:`);
  
  // Display claimed amounts for each beneficiary
  for (let i = 0; i < policy.beneficiaries.length; i++) {
    const beneficiary = policy.beneficiaries[i];
    console.log(`\n   👤 ${beneficiary.firstName} ${beneficiary.lastName} (${beneficiary.employeeId}):`);
    
    if (policy.claimedAmounts && policy.claimedAmounts[i]) {
      policy.claimedAmounts[i].forEach(claimed => {
        const limit = policy.getCoverageLimit(claimed.coverageType);
        const remaining = limit - claimed.claimedAmount;
        const percentage = limit > 0 ? Math.round((claimed.claimedAmount / limit) * 100) : 0;
        
        console.log(`      • ${claimed.coverageType.padEnd(18)}: $${claimed.claimedAmount.toLocaleString().padStart(5)} / $${limit.toLocaleString().padStart(5)} (${percentage}% used, $${remaining.toLocaleString()} remaining)`);
      });
    } else {
      console.log(`      • No claims yet - full coverage available`);
    }
  }
  
  console.log(`\n📋 SAMPLE CLAIMS CREATED:`);
  claims.forEach(claim => {
    const statusEmoji = claim.claimStatus === 'approved' ? '✅' : 
                       claim.claimStatus === 'rejected' ? '❌' : '⏳';
    const employee = users.find(u => u._id.toString() === claim.employeeId.toString());
    console.log(`   ${statusEmoji} ${claim.claimId} - ${employee.firstName} ${employee.lastName} - $${claim.claimAmount.requested.toLocaleString()} requested`);
    if (claim.claimAmount.approved) {
      console.log(`      💰 $${claim.claimAmount.approved.toLocaleString()} approved`);
    }
  });
  
  console.log(`\n🧪 TESTING SCENARIOS:`);
  console.log(`   1. Login as employee@lumiere.com`);
  console.log(`      - Check claimed amounts: GET /api/policies/${policy._id}/claimed-amounts`);
  console.log(`      - Should show used hospitalization + surgical_benefits`);
  console.log(`   2. Try to submit claim exceeding remaining limits`);
  console.log(`      - Employee has used $4,500/$20,000 hospitalization`);
  console.log(`      - Employee has used $7,000/$15,000 surgical_benefits`);
  console.log(`   3. Login as agent@lumiere.com`);
  console.log(`      - Approve pending claim: POST /api/claims/{id}/decision`);
  console.log(`      - Try to approve amount exceeding limits (should fail)`);
  console.log(`   4. Check policy summary: GET /api/policies/${policy._id}/claimed-amounts/summary`);
  
  console.log(`\n🎯 API ENDPOINTS TO TEST:`);
  console.log(`   • GET  /api/policies/${policy._id}/claimed-amounts`);
  console.log(`   • GET  /api/policies/${policy._id}/claimed-amounts?beneficiaryId=${users.find(u => u.role === 'employee')._id}`);
  console.log(`   • GET  /api/policies/${policy._id}/claimed-amounts/summary`);
  console.log(`   • POST /api/claims (create new claim)`);
  console.log(`   • PATCH /api/claims/{id}/decision (approve/reject with limit validation)`);
  
  console.log(`\n💡 VALIDATION TESTING:`);
  console.log(`   • Employee hospitalization remaining: $${15500} / $20,000`);
  console.log(`   • Employee surgical_benefits remaining: $${8000} / $15,000`);
  console.log(`   • Executive has full coverage available on all types`);
  console.log(`   • Try approving claims that exceed these limits to test validation`);
  
  console.log('\n' + '='.repeat(70));
}

async function main() {
  try {
    console.log('🚀 Starting advanced seed process with sample claims...\n');
    
    await connectDB();
    await clearExistingData();
    
    const users = await seedUsers();
    const template = await seedQuestionnaireTemplate();
    const { policy, beneficiaries } = await seedPolicy(users);
    const claims = await createSampleClaims(users, policy, template);
    
    // Reload policy to get updated claimed amounts
    const updatedPolicy = await Policy.findById(policy._id).populate([
      { path: 'insuranceAgent', select: 'firstName lastName email' },
      { path: 'beneficiaries', select: 'firstName lastName email employeeId' }
    ]);
    
    await displayAdvancedSeedSummary(users, updatedPolicy, template, claims);
    
    console.log('\n✅ Advanced seed process completed successfully!');
    console.log('🔬 Database ready for comprehensive claimed amounts testing');
    
  } catch (error) {
    console.error('\n❌ Seed process failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
    process.exit(0);
  }
}

main();