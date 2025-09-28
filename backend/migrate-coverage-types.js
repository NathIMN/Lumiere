import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Claim from './models/Claim.js';

dotenv.config();

// Mapping from old display names to new database keys
const coverageTypeMapping = {
  // Life coverage types
  'Life Cover': 'life_cover',
  'Hospitalization': 'hospitalization',
  'Surgical Benefits': 'surgical_benefits',
  'Outpatient': 'outpatient',
  'Prescription Drugs': 'prescription_drugs',
  
  // Vehicle coverage types
  'Collision': 'collision',
  'Liability': 'liability',
  'Comprehensive': 'comprehensive',
  'Personal Accident': 'personal_accident'
};

async function migrateCoverageTypes() {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Find all claims that have hrForwardingDetails with coverageBreakdown
    const claimsWithCoverage = await Claim.find({
      'hrForwardingDetails.coverageBreakdown': { $exists: true, $ne: null }
    });

    console.log(`Found ${claimsWithCoverage.length} claims with coverage breakdown`);

    let updatedCount = 0;

    for (const claim of claimsWithCoverage) {
      let needsUpdate = false;
      const updatedBreakdown = claim.hrForwardingDetails.coverageBreakdown.map(coverage => {
        const oldType = coverage.coverageType;
        const newType = coverageTypeMapping[oldType];
        
        if (newType && newType !== oldType) {
          console.log(`Claim ${claim.claimId}: Converting "${oldType}" to "${newType}"`);
          needsUpdate = true;
          return {
            ...coverage,
            coverageType: newType
          };
        }
        return coverage;
      });

      if (needsUpdate) {
        await Claim.updateOne(
          { _id: claim._id },
          {
            $set: {
              'hrForwardingDetails.coverageBreakdown': updatedBreakdown
            }
          }
        );
        updatedCount++;
        console.log(`✅ Updated claim ${claim.claimId}`);
      }
    }

    console.log(`\n🎉 Migration completed! Updated ${updatedCount} claims.`);

  } catch (error) {
    console.error('Migration error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('Connection closed');
  }
}

migrateCoverageTypes();