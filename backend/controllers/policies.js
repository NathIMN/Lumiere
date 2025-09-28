import Policy from "../models/Policy.js";
import User from "../models/User.js";
import asyncWrapper from "../middleware/async.js";
import { createCustomError } from "../errors/custom-error.js";

// Create new policy (admin/hr only)
const createPolicy = asyncWrapper(async (req, res, next) => {
  const { insuranceAgent, beneficiaries } = req.body;

  // Validate insurance agent exists and has correct role
  const agent = await User.findById(insuranceAgent);
  if (!agent) {
    return next(createCustomError("Insurance agent not found", 404));
  }
  if (agent.role !== "insurance_agent") {
    return next(createCustomError("Specified user is not an insurance agent", 400));
  }

  // Validate beneficiaries if provided
  if (beneficiaries && beneficiaries.length > 0) {
    const validBeneficiaries = await User.find({ 
      _id: { $in: beneficiaries },
      role: { $in: ["employee", "executive"] }
    });
    
    if (validBeneficiaries.length !== beneficiaries.length) {
      return next(createCustomError("One or more beneficiaries are invalid", 400));
    }
  }

  // Prepare policy data with proper coverageAmount handling
  const policyData = { ...req.body };
  
  // Ensure coverageAmount is provided (required by model)
  // The pre-save middleware will auto-calculate it if coverageDetails exist
  if (!policyData.coverage?.coverageAmount) {
    if (policyData.coverage?.coverageDetails?.length > 0) {
      // Calculate from coverage details
      policyData.coverage.coverageAmount = policyData.coverage.coverageDetails.reduce(
        (total, detail) => total + (detail.limit || 0), 0
      );
    } else {
      // Set minimum value, will be auto-calculated by pre-save middleware
      if (!policyData.coverage) policyData.coverage = {};
      policyData.coverage.coverageAmount = 1; // Temporary, will be recalculated
    }
  }

  const policy = await Policy.create(policyData);
  
  // Populate references for response
  await policy.populate([
    { path: "insuranceAgent", select: "firstName lastName email role" },
    { path: "beneficiaries", select: "firstName lastName email employeeId" }
  ]);

  res.status(201).json({
    success: true,
    message: "Policy created successfully",
    policy,
  });
});

// Get all policies with filtering and pagination
const getAllPolicies = asyncWrapper(async (req, res) => {
  const { 
    policyType, 
    policyCategory, 
    status, 
    insuranceAgent,
    page = 1, 
    limit = 10,
    search 
  } = req.query;

  let query = {};

  // Filter by policy type
  if (policyType) query.policyType = policyType;
  
  // Filter by policy category
  if (policyCategory) query.policyCategory = policyCategory;
  
  // Filter by status
  if (status) query.status = status;
  
  // Filter by insurance agent
  if (insuranceAgent) query.insuranceAgent = insuranceAgent;

  // Search functionality (by policyId or notes)
  if (search) {
    query.$or = [
      { policyId: { $regex: search, $options: "i" } },
      { notes: { $regex: search, $options: "i" } }
    ];
  }

  // Pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);
  
  const policies = await Policy.find(query)
    .populate([
      { path: "insuranceAgent", select: "firstName lastName email role" },
      { path: "beneficiaries", select: "firstName lastName email employeeId" },
      { path: "documents", select: "fileName fileType uploadDate" }
    ])
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const totalPolicies = await Policy.countDocuments(query);
  const totalPages = Math.ceil(totalPolicies / parseInt(limit));

  res.status(200).json({
    success: true,
    count: policies.length,
    totalPolicies,
    totalPages,
    currentPage: parseInt(page),
    policies,
  });
});

// Get policy by ID
const getPolicyById = asyncWrapper(async (req, res, next) => {
  const { id: policyId } = req.params;
  
  const policy = await Policy.findById(policyId)
    .populate([
      { path: "insuranceAgent", select: "firstName lastName email role phone" },
      { path: "beneficiaries", select: "firstName lastName email employeeId employment" },
      { path: "documents" }
    ]);

  if (!policy) {
    return next(createCustomError(`No policy with id: ${policyId}`, 404));
  }

  res.status(200).json({
    success: true,
    policy,
  });
});

// Get policy by policyId (custom ID)
const getPolicyByPolicyId = asyncWrapper(async (req, res, next) => {
  const { policyId } = req.params;
  
  const policy = await Policy.findOne({ policyId: policyId.toUpperCase() })
    .populate([
      { path: "insuranceAgent", select: "firstName lastName email role phone" },
      { path: "beneficiaries", select: "firstName lastName email employeeId employment" },
      { path: "documents" }
    ]);

  if (!policy) {
    return next(createCustomError(`No policy with policy ID: ${policyId}`, 404));
  }

  res.status(200).json({
    success: true,
    policy,
  });
});

// Update policy (admin/hr only)
const updatePolicy = asyncWrapper(async (req, res, next) => {
  const { id: policyId } = req.params;
  const { insuranceAgent, beneficiaries } = req.body;

  // Prevent updating auto-generated fields
  delete req.body.policyId;
  delete req.body.createdAt;
  delete req.body.updatedAt;

  // Validate insurance agent if being updated
  if (insuranceAgent) {
    const agent = await User.findById(insuranceAgent);
    if (!agent || agent.role !== "insurance_agent") {
      return next(createCustomError("Invalid insurance agent", 400));
    }
  }

  // Validate beneficiaries if being updated
  if (beneficiaries && beneficiaries.length > 0) {
    const validBeneficiaries = await User.find({ 
      _id: { $in: beneficiaries },
      role: { $in: ["employee", "executive"] }
    });
    
    if (validBeneficiaries.length !== beneficiaries.length) {
      return next(createCustomError("One or more beneficiaries are invalid", 400));
    }
  }

  const policy = await Policy.findByIdAndUpdate(policyId, req.body, {
    new: true,
    runValidators: true,
  }).populate([
    { path: "insuranceAgent", select: "firstName lastName email role" },
    { path: "beneficiaries", select: "firstName lastName email employeeId" }
  ]);

  if (!policy) {
    return next(createCustomError(`No policy with id: ${policyId}`, 404));
  }

  res.status(200).json({
    success: true,
    message: "Policy updated successfully",
    policy,
  });
});

// Delete policy (admin only)
const deletePolicy = asyncWrapper(async (req, res, next) => {
  const { id: policyId } = req.params;
  
  const policy = await Policy.findByIdAndDelete(policyId);
  if (!policy) {
    return next(createCustomError(`No policy with id: ${policyId}`, 404));
  }

  res.status(200).json({
    success: true,
    message: "Policy deleted successfully",
    policy,
  });
});

// Update policy status (admin/hr only)
const updatePolicyStatus = asyncWrapper(async (req, res, next) => {
  const { id: policyId } = req.params;
  const { status } = req.body;

  if (!status || !["active", "expired", "cancelled", "suspended", "pending"].includes(status)) {
    return next(createCustomError("Please provide a valid status", 400));
  }

  const policy = await Policy.findByIdAndUpdate(
    policyId,
    { status },
    { new: true, runValidators: true }
  ).populate([
    { path: "insuranceAgent", select: "firstName lastName email role" },
    { path: "beneficiaries", select: "firstName lastName email employeeId" }
  ]);

  if (!policy) {
    return next(createCustomError(`No policy with id: ${policyId}`, 404));
  }

  res.status(200).json({
    success: true,
    message: "Policy status updated successfully",
    policy,
  });
});

// Add beneficiary to policy (admin/hr only)
const addBeneficiary = asyncWrapper(async (req, res, next) => {
  const { id: policyId } = req.params;
  const { beneficiaryId } = req.body;

  if (!beneficiaryId) {
    return next(createCustomError("Beneficiary ID is required", 400));
  }

  // Validate beneficiary exists and has correct role
  const beneficiary = await User.findById(beneficiaryId);
  if (!beneficiary) {
    return next(createCustomError("Beneficiary not found", 404));
  }
  if (!["employee", "executive"].includes(beneficiary.role)) {
    return next(createCustomError("User must be an employee or executive to be a beneficiary", 400));
  }

  const policy = await Policy.findById(policyId);
  if (!policy) {
    return next(createCustomError(`No policy with id: ${policyId}`, 404));
  }

  // Check if beneficiary is already added
  if (policy.beneficiaries.includes(beneficiaryId)) {
    return next(createCustomError("User is already a beneficiary of this policy", 400));
  }

  policy.beneficiaries.push(beneficiaryId);
  await policy.save();

  await policy.populate([
    { path: "insuranceAgent", select: "firstName lastName email role" },
    { path: "beneficiaries", select: "firstName lastName email employeeId" }
  ]);

  res.status(200).json({
    success: true,
    message: "Beneficiary added successfully",
    policy,
  });
});

// Remove beneficiary from policy (admin/hr only)
const removeBeneficiary = asyncWrapper(async (req, res, next) => {
  const { id: policyId } = req.params;
  const { beneficiaryId } = req.body;

  if (!beneficiaryId) {
    return next(createCustomError("Beneficiary ID is required", 400));
  }

  const policy = await Policy.findById(policyId);
  if (!policy) {
    return next(createCustomError(`No policy with id: ${policyId}`, 404));
  }

  // Check if beneficiary exists in the policy
  if (!policy.beneficiaries.includes(beneficiaryId)) {
    return next(createCustomError("User is not a beneficiary of this policy", 400));
  }

  policy.beneficiaries = policy.beneficiaries.filter(
    (id) => id.toString() !== beneficiaryId
  );
  await policy.save();

  await policy.populate([
    { path: "insuranceAgent", select: "firstName lastName email role" },
    { path: "beneficiaries", select: "firstName lastName email employeeId" }
  ]);

  res.status(200).json({
    success: true,
    message: "Beneficiary removed successfully",
    policy,
  });
});

// Get policies for a specific user (employee/executive)
const getUserPolicies = asyncWrapper(async (req, res, next) => {
  const { userId } = req.user;
  const { status, policyType } = req.query;

  let query = { beneficiaries: userId };

  // Filter by status if provided
  if (status) query.status = status;
  
  // Filter by policy type if provided
  if (policyType) query.policyType = policyType;

  const policies = await Policy.find(query)
    .populate([
      { path: "insuranceAgent", select: "firstName lastName email role phone" },
      { path: "documents", select: "fileName fileType uploadDate" }
    ])
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: policies.length,
    policies,
  });
});

// Get policies managed by insurance agent
const getAgentPolicies = asyncWrapper(async (req, res, next) => {
  const { userId } = req.user;
  const { status, policyType, policyCategory } = req.query;

  let query = { insuranceAgent: userId };

  // Filter by status if provided
  if (status) query.status = status;
  
  // Filter by policy type if provided
  if (policyType) query.policyType = policyType;

  // Filter by policy category if provided
  if (policyCategory) query.policyCategory = policyCategory;

  const policies = await Policy.find(query)
    .populate([
      { path: "beneficiaries", select: "firstName lastName email employeeId employment" },
      { path: "documents", select: "fileName fileType uploadDate" }
    ])
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: policies.length,
    policies,
  });
});

// Get policy statistics (admin/hr only)
const getPolicyStats = asyncWrapper(async (req, res) => {
  // Policy type statistics
  const typeStats = await Policy.aggregate([
    {
      $group: {
        _id: "$policyType",
        count: { $sum: 1 },
        totalCoverage: { $sum: "$coverage.coverageAmount" },
        avgPremium: { $avg: "$premium.amount" }
      },
    },
  ]);

  // Policy status statistics
  const statusStats = await Policy.aggregate([
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
      },
    },
  ]);

  // Policy category statistics
  const categoryStats = await Policy.aggregate([
    {
      $group: {
        _id: "$policyCategory",
        count: { $sum: 1 },
      },
    },
  ]);

  // Expiring policies (within next 30 days)
  const expiringPolicies = await Policy.countDocuments({
    "validity.endDate": {
      $lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      $gte: new Date()
    },
    status: "active"
  });

  // Total statistics
  const totalPolicies = await Policy.countDocuments();
  const activePolicies = await Policy.countDocuments({ status: "active" });

  res.status(200).json({
    success: true,
    stats: {
      totalPolicies,
      activePolicies,
      expiringPolicies,
      typeStats,
      statusStats,
      categoryStats,
    },
  });
});

// Get expiring policies (admin/hr only)
const getExpiringPolicies = asyncWrapper(async (req, res) => {
  const { days = 30 } = req.query;
  
  const expiringDate = new Date(Date.now() + parseInt(days) * 24 * 60 * 60 * 1000);
  
  const policies = await Policy.find({
    "validity.endDate": {
      $lte: expiringDate,
      $gte: new Date()
    },
    status: "active"
  })
  .populate([
    { path: "insuranceAgent", select: "firstName lastName email role phone" },
    { path: "beneficiaries", select: "firstName lastName email employeeId" }
  ])
  .sort({ "validity.endDate": 1 });

  res.status(200).json({
    success: true,
    count: policies.length,
    policies,
  });
});

// Renew policy (admin/hr only)
const renewPolicy = asyncWrapper(async (req, res, next) => {
  const { id: policyId } = req.params;
  const { newEndDate, newPremiumAmount } = req.body;

  if (!newEndDate) {
    return next(createCustomError("New end date is required for renewal", 400));
  }

  const policy = await Policy.findById(policyId);
  if (!policy) {
    return next(createCustomError(`No policy with id: ${policyId}`, 404));
  }

  // Validate new end date
  const renewalDate = new Date(newEndDate);
  if (renewalDate <= policy.validity.endDate) {
    return next(createCustomError("New end date must be after current end date", 400));
  }

  // Update policy validity
  policy.validity.startDate = policy.validity.endDate;
  policy.validity.endDate = renewalDate;
  policy.status = "active";
  
  // Update premium if provided
  if (newPremiumAmount) {
    policy.premium.amount = newPremiumAmount;
  }

  await policy.save();

  await policy.populate([
    { path: "insuranceAgent", select: "firstName lastName email role" },
    { path: "beneficiaries", select: "firstName lastName email employeeId" }
  ]);

  res.status(200).json({
    success: true,
    message: "Policy renewed successfully",
    policy,
  });
});

// Check policy eligibility for user
const checkPolicyEligibility = asyncWrapper(async (req, res, next) => {
  const { userId } = req.user;
  const { policyType } = req.params;

  if (!["life", "vehicle"].includes(policyType)) {
    return next(createCustomError("Invalid policy type", 400));
  }

  // Find active policies where user is a beneficiary
  const eligiblePolicies = await Policy.find({
    beneficiaries: userId,
    policyType,
    status: "active",
    "validity.endDate": { $gte: new Date() }
  })
  .populate([
    { path: "insuranceAgent", select: "firstName lastName email role phone" }
  ]);

  const isEligible = eligiblePolicies.length > 0;

  res.status(200).json({
    success: true,
    isEligible,
    eligiblePolicies,
    message: isEligible 
      ? `User is eligible for ${policyType} insurance claims`
      : `User is not eligible for ${policyType} insurance claims`
  });
});

// Get policy usage summary (claims vs coverage)
const getPolicyUsage = asyncWrapper(async (req, res, next) => {
  const { id: policyId } = req.params;

  const policy = await Policy.findById(policyId);
  if (!policy) {
    return next(createCustomError(`No policy with id: ${policyId}`, 404));
  }

  // This would require Claims model integration - placeholder for now
  // const claims = await Claim.find({ policyId, status: "approved" });
  // const totalClaimedAmount = claims.reduce((sum, claim) => sum + claim.approvedAmount, 0);
  
  const totalClaimedAmount = 0; // Placeholder until Claims model is implemented
  const remainingCoverage = policy.coverage.coverageAmount - totalClaimedAmount;
  const usagePercentage = (totalClaimedAmount / policy.coverage.coverageAmount) * 100;

  res.status(200).json({
    success: true,
    usage: {
      policyId: policy.policyId,
      totalCoverage: policy.coverage.coverageAmount,
      totalClaimed: totalClaimedAmount,
      remainingCoverage,
      usagePercentage: Math.round(usagePercentage * 100) / 100,
    },
  });
});

// Bulk update policy status (admin only)
const bulkUpdateStatus = asyncWrapper(async (req, res, next) => {
  const { policyIds, status } = req.body;

  if (!policyIds || !Array.isArray(policyIds) || policyIds.length === 0) {
    return next(createCustomError("Policy IDs array is required", 400));
  }

  if (!status || !["active", "expired", "cancelled", "suspended", "pending"].includes(status)) {
    return next(createCustomError("Please provide a valid status", 400));
  }

  const result = await Policy.updateMany(
    { _id: { $in: policyIds } },
    { status },
    { runValidators: true }
  );

  res.status(200).json({
    success: true,
    message: `${result.modifiedCount} policies updated successfully`,
    modifiedCount: result.modifiedCount,
  });
});

// Get policies by insurance agent (for agent dashboard)
const getPoliciesByAgent = asyncWrapper(async (req, res, next) => {
  const { agentId } = req.params;
  const { status, policyType } = req.query;

  // Verify agent exists
  const agent = await User.findById(agentId);
  if (!agent || agent.role !== "insurance_agent") {
    return next(createCustomError("Insurance agent not found", 404));
  }

  let query = { insuranceAgent: agentId };
  if (status) query.status = status;
  if (policyType) query.policyType = policyType;

  const policies = await Policy.find(query)
    .populate([
      { path: "beneficiaries", select: "firstName lastName email employeeId employment" },
      { path: "documents", select: "fileName fileType uploadDate" }
    ])
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: policies.length,
    policies,
  });
});

// Get claimed amounts for a specific beneficiary (employee can check their own, admin/hr/agent can check any)
const getBeneficiaryClaimedAmounts = asyncWrapper(async (req, res, next) => {
  const { id: policyId } = req.params;
  const { beneficiaryId } = req.query;
  const { userId, role } = req.user;

  const policy = await Policy.findById(policyId).populate([
    { path: "beneficiaries", select: "firstName lastName email employeeId" }
  ]);

  if (!policy) {
    return next(createCustomError(`No policy with id: ${policyId}`, 404));
  }

  // Check permissions - employees can only check their own amounts
  if (role === "employee" || role === "executive") {
    if (!beneficiaryId || beneficiaryId !== userId.toString()) {
      return next(createCustomError("You can only check your own claimed amounts", 403));
    }
  }

  const targetBeneficiaryId = beneficiaryId || userId;

  // Check if user is a beneficiary of this policy
  const isBeneficiary = policy.beneficiaries.some(
    b => b._id.toString() === targetBeneficiaryId.toString()
  );

  if (!isBeneficiary) {
    return next(createCustomError("User is not a beneficiary of this policy", 404));
  }

  // Get all coverage types for this policy
  const coverageTypes = policy.policyType === 'life' ? policy.coverage.typeLife : policy.coverage.typeVehicle;
  
  // Build response with claimed amounts and limits
  const claimedAmounts = coverageTypes.map(coverageType => {
    const claimed = policy.getClaimedAmountForBeneficiary(targetBeneficiaryId, coverageType);
    const limit = policy.getCoverageLimit(coverageType);
    const remaining = limit - claimed;

    return {
      coverageType,
      claimedAmount: claimed,
      coverageLimit: limit,
      remainingAmount: Math.max(0, remaining),
      utilizationPercentage: limit > 0 ? Math.round((claimed / limit) * 100) : 0
    };
  });

  res.status(200).json({
    success: true,
    policyId: policy.policyId,
    policyType: policy.policyType,
    beneficiaryId: targetBeneficiaryId,
    claimedAmounts,
    totalCoverageAmount: policy.coverage.coverageAmount
  });
});

// Get claimed amounts summary for all beneficiaries (admin/hr/agent only)
const getPolicyClaimedAmountsSummary = asyncWrapper(async (req, res, next) => {
  const { id: policyId } = req.params;
  const { role } = req.user;

  // Check permissions
  if (!["admin", "hr_officer", "insurance_agent"].includes(role)) {
    return next(createCustomError("Access denied. Admin, HR, or Insurance Agent role required", 403));
  }

  const policy = await Policy.findById(policyId).populate([
    { path: "beneficiaries", select: "firstName lastName email employeeId" }
  ]);

  if (!policy) {
    return next(createCustomError(`No policy with id: ${policyId}`, 404));
  }

  const coverageTypes = policy.policyType === 'life' ? policy.coverage.typeLife : policy.coverage.typeVehicle;
  
  // Build summary for each beneficiary
  const beneficiariesSummary = policy.beneficiaries.map(beneficiary => {
    const claimedAmounts = coverageTypes.map(coverageType => {
      const claimed = policy.getClaimedAmountForBeneficiary(beneficiary._id, coverageType);
      const limit = policy.getCoverageLimit(coverageType);
      
      return {
        coverageType,
        claimedAmount: claimed,
        coverageLimit: limit,
        remainingAmount: Math.max(0, limit - claimed),
        utilizationPercentage: limit > 0 ? Math.round((claimed / limit) * 100) : 0
      };
    });

    const totalClaimed = claimedAmounts.reduce((sum, c) => sum + c.claimedAmount, 0);
    const totalLimit = claimedAmounts.reduce((sum, c) => sum + c.coverageLimit, 0);

    return {
      beneficiary: {
        id: beneficiary._id,
        name: `${beneficiary.firstName} ${beneficiary.lastName}`,
        email: beneficiary.email,
        employeeId: beneficiary.employeeId
      },
      claimedAmounts,
      totalClaimed,
      totalLimit,
      totalUtilizationPercentage: totalLimit > 0 ? Math.round((totalClaimed / totalLimit) * 100) : 0
    };
  });

  res.status(200).json({
    success: true,
    policyId: policy.policyId,
    policyType: policy.policyType,
    beneficiariesCount: policy.beneficiaries.length,
    beneficiariesSummary
  });
});

// Validate policy coverage amount consistency
const validatePolicyCoverageConsistency = asyncWrapper(async (req, res, next) => {
  const { id: policyId } = req.params;

  const policy = await Policy.findById(policyId);
  if (!policy) {
    return next(createCustomError(`No policy with id: ${policyId}`, 404));
  }

  const validation = policy.validateCoverageConsistency();

  res.status(200).json({
    success: true,
    policyId: policy.policyId,
    validation: {
      ...validation,
      needsSync: !validation.isConsistent,
      coverageDetails: policy.coverage.coverageDetails.map(detail => ({
        type: detail.type,
        limit: detail.limit
      }))
    }
  });
});

// Get enhanced claimed amounts summary with total coverage validation
const getEnhancedClaimedAmountsSummary = asyncWrapper(async (req, res, next) => {
  const { id: policyId } = req.params;

  const policy = await Policy.findById(policyId).populate('beneficiaries', 'profile.firstName profile.lastName email employment.employeeId');
  if (!policy) {
    return next(createCustomError(`No policy with id: ${policyId}`, 404));
  }

  const summary = {
    policyId: policy.policyId,
    totalCoverageAmount: policy.coverage.coverageAmount,
    calculatedCoverageAmount: policy.calculateTotalCoverageAmount(),
    isConsistent: policy.validateCoverageConsistency().isConsistent,
    beneficiaries: []
  };

  // Calculate utilization for each beneficiary
  for (const beneficiary of policy.beneficiaries) {
    const beneficiaryData = {
      beneficiaryId: beneficiary._id,
      name: `${beneficiary.profile.firstName} ${beneficiary.profile.lastName}`,
      email: beneficiary.email,
      employeeId: beneficiary.employment?.employeeId,
      coverageTypes: [],
      totalClaimed: policy.getTotalClaimedForBeneficiary(beneficiary._id),
      totalRemaining: policy.getRemainingTotalCoverage(beneficiary._id),
      utilizationPercentage: 0
    };

    // Calculate utilization percentage
    if (policy.coverage.coverageAmount > 0) {
      beneficiaryData.utilizationPercentage = Math.round(
        (beneficiaryData.totalClaimed / policy.coverage.coverageAmount) * 100
      );
    }

    // Get details for each coverage type
    for (const coverageDetail of policy.coverage.coverageDetails) {
      const claimed = policy.getClaimedAmountForBeneficiary(beneficiary._id, coverageDetail.type);
      const remaining = policy.getRemainingCoverage(beneficiary._id, coverageDetail.type);
      const typeUtilization = coverageDetail.limit > 0 ? Math.round((claimed / coverageDetail.limit) * 100) : 0;

      beneficiaryData.coverageTypes.push({
        type: coverageDetail.type,
        limit: coverageDetail.limit,
        claimed: claimed,
        remaining: remaining,
        utilizationPercentage: typeUtilization
      });
    }

    summary.beneficiaries.push(beneficiaryData);
  }

  res.status(200).json({
    success: true,
    summary
  });
});

export {
  createPolicy,
  getAllPolicies,
  getPolicyById,
  getPolicyByPolicyId,
  updatePolicy,
  deletePolicy,
  updatePolicyStatus,
  addBeneficiary,
  removeBeneficiary,
  getUserPolicies,
  getAgentPolicies,
  getPolicyStats,
  getExpiringPolicies,
  renewPolicy,
  checkPolicyEligibility,
  getPolicyUsage,
  bulkUpdateStatus,
  getPoliciesByAgent,
  getBeneficiaryClaimedAmounts,
  getPolicyClaimedAmountsSummary,
  validatePolicyCoverageConsistency,
  getEnhancedClaimedAmountsSummary,
};