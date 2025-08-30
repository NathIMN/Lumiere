import Claim from "../models/Claim.js";
import { QuestionnaireTemplate } from "../models/QuestionnaireTemplate.js";
import asyncWrapper from "../middleware/async.js";
import { createCustomError } from "../errors/custom-error.js";

// Create initial claim with basic information only
const createClaim = asyncWrapper(async (req, res, next) => {
  const { employeeId, policy, claimType } = req.body;
  const { userId } = req.user;

  // Validate required fields
  if (!employeeId || !policy || !claimType) {
    return next(
      createCustomError("Employee ID, policy, and claim type are required", 400)
    );
  }

  // Validate claim type
  if (!["life", "vehicle"].includes(claimType)) {
    return next(
      createCustomError("Claim type must be either 'life' or 'vehicle'", 400)
    );
  }

  // Check if employee exists and matches authenticated user
  if (
    userId.toString() !== employeeId.toString() &&
    req.user.role !== "admin" &&
    req.user.role !== "hr"
  ) {
    console.log(userId);
    console.log(employeeId);
    return next(
      createCustomError("You can only create claims for yourself", 403)
    );
  }

  // Create claim with basic information only
  const claimData = {
    employeeId,
    policy,
    claimType,
    claimStatus: "draft",
    currentLocation: "employee",
    statusFlags: {
      isQuestionnaireLoaded: false,
      isQuestionnaireComplete: false,
      isDocumentationComplete: false,
      isReadyForSubmission: false,
      hasBeenSubmitted: false,
      requiresEmployeeAction: true,
      requiresHRAction: false,
      requiresInsurerAction: false,
    },
  };

  const claim = await Claim.create(claimData);

  res.status(201).json({
    success: true,
    message:
      "Claim created successfully. Please select claim option to continue.",
    claim,
    nextStep: "select_claim_option",
  });
});

// Load questionnaire based on claim option
const loadQuestionnaire = asyncWrapper(async (req, res, next) => {
  console.log(6);
  const { id: claimId } = req.params;
  const { claimOption } = req.body;
  const { userId } = req.user;

  const claim = await Claim.findById(claimId);
  if (!claim) {
    return next(createCustomError(`No claim found with id: ${claimId}`, 404));
  }

  // Check permissions
  if (
    claim.employeeId.toString() !== userId.toString() &&
    req.user.role !== "admin" &&
    req.user.role !== "hr"
  ) {
    return next(
      createCustomError("You don't have permission to modify this claim", 403)
    );
  }

  // Validate claim status
  if (claim.claimStatus !== "draft") {
    return next(
      createCustomError(
        "Questionnaire can only be loaded for draft claims",
        400
      )
    );
  }

  // Validate claim option based on claim type
  const validOptions =
    claim.claimType === "life"
      ? ["hospitalization", "channelling", "medication", "death"]
      : ["accident", "theft", "fire", "naturalDisaster"];

  if (!validOptions.includes(claimOption)) {
    return next(
      createCustomError(
        `Invalid claim option for ${claim.claimType} insurance`,
        400
      )
    );
  }

  // Set the appropriate claim option field
  if (claim.claimType === "life") {
    claim.lifeClaimOption = claimOption;
  } else {
    claim.vehicleClaimOption = claimOption;
  }

  // Load questionnaire template
  try {
    await claim.loadQuestionnaire();

    res.status(200).json({
      success: true,
      message: "Questionnaire loaded successfully",
      claim,
      questionnaire: claim.questionnaire,
      nextStep: "complete_questionnaire",
    });
  } catch (error) {
    return next(createCustomError(error.message, 400));
  }
});

// Update questionnaire answers
const updateQuestionnaireAnswer = asyncWrapper(async (req, res, next) => {
  const { id: claimId } = req.params;
  const { questionId, answer } = req.body;
  const { userId } = req.user;

  if (!questionId || answer === undefined) {
    return next(createCustomError("Question ID and answer are required", 400));
  }

  const claim = await Claim.findById(claimId);
  if (!claim) {
    return next(createCustomError(`No claim found with id: ${claimId}`, 404));
  }

  // Check permissions
  if (
    claim.employeeId.toString() !== userId.toString() &&
    req.user.role !== "admin" &&
    req.user.role !== "hr"
  ) {
    return next(
      createCustomError("You don't have permission to modify this claim", 403)
    );
  }

  // Validate claim status
  if (
    !["questionnaire_pending", "questionnaire_completed"].includes(
      claim.claimStatus
    )
  ) {
    return next(
      createCustomError(
        "Cannot update questionnaire for claims in this status",
        400
      )
    );
  }

  try {
    await claim.updateQuestionnaireAnswer(questionId, answer, userId);

    // Check if questionnaire is now complete
    const isComplete = claim.checkQuestionnaireCompletion();

    if (isComplete) {
      claim.claimStatus = "questionnaire_completed";
      await claim.save();
    }

    res.status(200).json({
      success: true,
      message: "Answer updated successfully",
      claim,
      questionnaire: claim.questionnaire,
      isComplete,
      nextStep: isComplete ? "set_claim_amount" : "continue_questionnaire",
    });
  } catch (error) {
    return next(createCustomError(error.message, 400));
  }
});

// Set claim amount and finalize for submission
const setClaimAmount = asyncWrapper(async (req, res, next) => {
  const { id: claimId } = req.params;
  const { requestedAmount, documents } = req.body;
  const { userId } = req.user;

  if (!requestedAmount || requestedAmount <= 0) {
    return next(createCustomError("Valid requested amount is required", 400));
  }

  const claim = await Claim.findById(claimId);
  if (!claim) {
    return next(createCustomError(`No claim found with id: ${claimId}`, 404));
  }

  // Check permissions
  if (
    claim.employeeId.toString() !== userId.toString() &&
    req.user.role !== "admin" &&
    req.user.role !== "hr"
  ) {
    return next(
      createCustomError("You don't have permission to modify this claim", 403)
    );
  }

  // Validate claim status
  if (claim.claimStatus !== "questionnaire_completed") {
    return next(
      createCustomError(
        "Questionnaire must be completed before setting claim amount",
        400
      )
    );
  }

  // Update claim amount
  claim.claimAmount.requested = requestedAmount;

  // Add documents if provided
  if (documents && Array.isArray(documents)) {
    claim.documents = [...claim.documents, ...documents];
    claim.statusFlags.isDocumentationComplete = documents.length > 0;
  }

  // Check submission readiness
  const isReady = claim.checkSubmissionReadiness();

  await claim.save();

  res.status(200).json({
    success: true,
    message: "Claim amount set successfully",
    claim,
    isReadyForSubmission: isReady,
    nextStep: isReady ? "submit_claim" : "add_required_info",
  });
});

// Submit claim for review
const submitClaim = asyncWrapper(async (req, res, next) => {
  const { id: claimId } = req.params;
  const { userId } = req.user;

  const claim = await Claim.findById(claimId);
  if (!claim) {
    return next(createCustomError(`No claim found with id: ${claimId}`, 404));
  }

  // Check permissions
  if (
    claim.employeeId.toString() !== userId.toString() &&
    req.user.role !== "admin" &&
    req.user.role !== "hr"
  ) {
    return next(
      createCustomError("You don't have permission to submit this claim", 403)
    );
  }

  try {
    await claim.submitClaim(userId);

    res.status(200).json({
      success: true,
      message: "Claim submitted successfully",
      claim,
      nextStep: "await_hr_review",
    });
  } catch (error) {
    return next(createCustomError(error.message, 400));
  }
});

// Get all claims (with filtering)
const getAllClaims = asyncWrapper(async (req, res) => {
  const {
    employeeId,
    claimStatus,
    claimType,
    currentLocation,
    priority,
    startDate,
    endDate,
    page = 1,
    limit = 10,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = req.query;

  // Build query object
  let query = {};

  if (employeeId) query.employeeId = employeeId;
  if (claimStatus) query.claimStatus = claimStatus;
  if (claimType) query.claimType = claimType;
  if (currentLocation) query.currentLocation = currentLocation;
  if (priority) query.priority = priority;

  // Date range filter
  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(endDate);
  }

  // Role-based filtering
  if (req.user.role === "employee") {
    query.employeeId = req.user.userId;
  } else if (req.user.role === "hr") {
    // HR can see all claims
  } else if (req.user.role === "insurance_agent") {
    // Insurance agents see only forwarded claims
    query.currentLocation = "insurer";
  }

  // Calculate pagination
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

  // Sort options
  const sortOptions = {};
  sortOptions[sortBy] = sortOrder === "desc" ? -1 : 1;

  const claims = await Claim.find(query)
    .populate("policy", "policyNumber policyType provider")
    .populate("employeeId", "firstName lastName email")
    .populate("documents", "filename originalName uploadedAt")
    .sort(sortOptions)
    .skip(skip)
    .limit(limitNum);

  const totalClaims = await Claim.countDocuments(query);

  res.status(200).json({
    success: true,
    count: claims.length,
    totalClaims,
    currentPage: pageNum,
    totalPages: Math.ceil(totalClaims / limitNum),
    claims,
  });
});

// Get claim by ID
const getClaimById = asyncWrapper(async (req, res, next) => {
  const { id: claimId } = req.params;

  const claim = await Claim.findById(claimId)
    .populate("policy", "policyNumber policyType provider coverage")
    .populate("employeeId", "firstName lastName email department")
    .populate("documents", "filename originalName fileType uploadedAt")
    .populate(
      "questionnaire.responses.answer.fileValue",
      "filename originalName"
    )
    .populate("workflowHistory.performedBy", "firstName lastName email");

  if (!claim) {
    return next(createCustomError(`No claim found with id: ${claimId}`, 404));
  }

  // Check permissions
  if (
    req.user.role === "employee" &&
    claim.employeeId._id.toString() !== req.user.userId
  ) {
    return next(
      createCustomError("You don't have permission to view this claim", 403)
    );
  }

  res.status(200).json({
    success: true,
    claim,
  });
});

// Get claims requiring action (for dashboards)
const getClaimsRequiringAction = asyncWrapper(async (req, res) => {
  const { role } = req.user;

  let query = {};

  switch (role) {
    case "employee":
      query = {
        employeeId: req.user.userId,
        "statusFlags.requiresEmployeeAction": true,
      };
      break;
    case "hr":
      query = {
        "statusFlags.requiresHRAction": true,
      };
      break;
    case "insurance_agent":
      query = {
        "statusFlags.requiresInsurerAction": true,
      };
      break;
    default:
      query = {};
  }

  const claims = await Claim.find(query)
    .populate("policy", "policyNumber policyType provider")
    .populate("employeeId", "firstName lastName email")
    .sort({ priority: -1, createdAt: -1 })
    .limit(20);

  res.status(200).json({
    success: true,
    count: claims.length,
    claims,
    role,
  });
});

// Update claim status (for HR and Insurance agents)
const updateClaimStatus = asyncWrapper(async (req, res, next) => {
  const { id: claimId } = req.params;
  const { status, notes, approvedAmount } = req.body;
  const { userId, role } = req.user;

  const claim = await Claim.findById(claimId);
  if (!claim) {
    return next(createCustomError(`No claim found with id: ${claimId}`, 404));
  }

  // Role-based permissions and valid status transitions
  const validTransitions = {
    hr: {
      from: ["submitted"],
      to: ["under_hr_review", "returned_to_employee", "forwarded_to_insurer"],
    },
    insurance_agent: {
      from: ["forwarded_to_insurer", "under_insurer_review"],
      to: ["approved", "rejected", "returned_to_employee"],
    },
  };

  if (!validTransitions[role]) {
    return next(
      createCustomError("You don't have permission to update claim status", 403)
    );
  }

  const transition = validTransitions[role];
  if (!transition.from.includes(claim.claimStatus)) {
    return next(
      createCustomError(`Cannot transition from ${claim.claimStatus}`, 400)
    );
  }

  if (!transition.to.includes(status)) {
    return next(
      createCustomError(`Invalid status transition to ${status}`, 400)
    );
  }

  // Update claim status and related fields
  const oldStatus = claim.claimStatus;
  claim.claimStatus = status;

  // Update status flags based on new status
  switch (status) {
    case "under_hr_review":
      claim.statusFlags.requiresHRAction = true;
      claim.statusFlags.requiresEmployeeAction = false;
      claim.reviewStartedAt = new Date();
      break;
    case "forwarded_to_insurer":
      claim.currentLocation = "insurer";
      claim.statusFlags.requiresInsurerAction = true;
      claim.statusFlags.requiresHRAction = false;
      claim.forwardedAt = new Date();
      break;
    case "approved":
      if (approvedAmount !== undefined) {
        claim.claimAmount.approved = approvedAmount;
      }
      claim.status = "approved"; // Legacy field
      claim.statusFlags.requiresInsurerAction = false;
      claim.decidedAt = new Date();
      break;
    case "rejected":
      claim.status = "rejected"; // Legacy field
      claim.statusFlags.requiresInsurerAction = false;
      claim.decidedAt = new Date();
      break;
    case "returned_to_employee":
      claim.currentLocation = "employee";
      claim.statusFlags.requiresEmployeeAction = true;
      claim.statusFlags.requiresHRAction = false;
      claim.statusFlags.requiresInsurerAction = false;
      break;
  }

  // Add notes if provided
  if (notes) {
    const noteField = role === "hr" ? "hr" : "insurer";
    claim.notes[noteField].push({
      note: notes,
      createdAt: new Date(),
    });
  }

  // Add to workflow history
  claim.workflowHistory.push({
    from: oldStatus,
    to: status,
    action: `status_updated_by_${role}`,
    performedBy: userId,
    timestamp: new Date(),
    notes: notes || "",
  });

  await claim.save();

  res.status(200).json({
    success: true,
    message: `Claim status updated to ${status}`,
    claim,
  });
});

// Add claim note
const addClaimNote = asyncWrapper(async (req, res, next) => {
  const { id: claimId } = req.params;
  const { note } = req.body;
  const { userId, role } = req.user;

  if (!note || note.trim().length === 0) {
    return next(createCustomError("Note content is required", 400));
  }

  const claim = await Claim.findById(claimId);
  if (!claim) {
    return next(createCustomError(`No claim found with id: ${claimId}`, 404));
  }

  // Determine note category based on role
  let noteCategory;
  if (role === "employee" && claim.employeeId === userId) {
    noteCategory = "employee";
  } else if (role === "hr" || role === "admin") {
    noteCategory = "hr";
  } else if (role === "insurance_agent") {
    noteCategory = "insurer";
  } else {
    return next(
      createCustomError(
        "You don't have permission to add notes to this claim",
        403
      )
    );
  }

  // Add note
  claim.notes[noteCategory].push({
    note: note.trim(),
    createdAt: new Date(),
  });

  await claim.save();

  res.status(200).json({
    success: true,
    message: "Note added successfully",
    claim: {
      _id: claim._id,
      claimId: claim.claimId,
      notes: claim.notes,
    },
  });
});

// Get claim statistics
const getClaimStatistics = asyncWrapper(async (req, res) => {
  const { userId, role } = req.user;

  let matchQuery = {};

  // Role-based filtering
  if (role === "employee") {
    matchQuery.employeeId = userId;
  }

  const stats = await Claim.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: "$claimStatus",
        count: { $sum: 1 },
        totalRequested: { $sum: "$claimAmount.requested" },
        totalApproved: { $sum: "$claimAmount.approved" },
      },
    },
  ]);

  const typeStats = await Claim.aggregate([
    { $match: matchQuery },
    {
      $group: {
        _id: "$claimType",
        count: { $sum: 1 },
        totalRequested: { $sum: "$claimAmount.requested" },
        totalApproved: { $sum: "$claimAmount.approved" },
      },
    },
  ]);

  const totalClaims = await Claim.countDocuments(matchQuery);

  res.status(200).json({
    success: true,
    totalClaims,
    statusStats: stats,
    typeStats,
    role,
  });
});

export {
  createClaim,
  loadQuestionnaire,
  updateQuestionnaireAnswer,
  setClaimAmount,
  submitClaim,
  getAllClaims,
  getClaimById,
  getClaimsRequiringAction,
  updateClaimStatus,
  addClaimNote,
  getClaimStatistics,
};
