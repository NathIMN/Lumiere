import Claim from "../models/Claim.js";
import asyncWrapper from "../middleware/async.js";
import { createCustomError } from "../errors/custom-error.js";

// Create initial draft claim with type and option
const createClaim = asyncWrapper(async (req, res, next) => {
  const { employeeId, policy, claimType, claimOption } = req.body;
  const { userId } = req.user;

  // Validate required fields
  if (!employeeId || !policy || !claimType || !claimOption) {
    return next(
      createCustomError("Employee ID, policy, claim type, and claim option are required", 400)
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
    req.user.role !== "hr_officer"
  ) {
    return next(
      createCustomError("You can only create claims for yourself", 403)
    );
  }

  // Create claim data with appropriate claim option field
  const claimData = {
    employeeId,
    policy,
    claimType,
    claimStatus: "draft",
  };

  // Set the appropriate claim option based on claim type
  if (claimType === "life") {
    claimData.lifeClaimOption = claimOption;
  } else {
    claimData.vehicleClaimOption = claimOption;
  }

  const claim = await Claim.create(claimData);

  // Automatically load questionnaire after creating claim
  try {
    await claim.loadQuestionnaire();

    res.status(201).json({
      success: true,
      message: "Claim created and questionnaire loaded successfully",
      claim,
      nextStep: "complete_questionnaire_and_submit",
    });
  } catch (error) {
    // If questionnaire loading fails, delete the created claim
    await Claim.findByIdAndDelete(claim._id);
    return next(createCustomError(error.message, 400));
  }
});

// Update questionnaire answer
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
    req.user.role !== "hr_officer"
  ) {
    return next(
      createCustomError("You don't have permission to modify this claim", 403)
    );
  }

  // Validate claim status
  if (claim.claimStatus !== "employee") {
    return next(
      createCustomError("Can only update questionnaire when claim is with employee", 400)
    );
  }

  try {
    await claim.updateQuestionnaireAnswer(questionId, answer);
    claim.checkQuestionnaireCompletion();
    await claim.save();

    res.status(200).json({
      success: true,
      message: "Answer updated successfully",
      claim,
      isQuestionnaireComplete: claim.questionnaire.isComplete,
    });
  } catch (error) {
    return next(createCustomError(error.message, 400));
  }
});

// Submit claim (used for both initial submission and resubmission after being returned)
const submitClaim = asyncWrapper(async (req, res, next) => {
  const { id: claimId } = req.params;
  const { claimAmount, documents } = req.body;
  const { userId } = req.user;

  if (!claimAmount || claimAmount <= 0) {
    return next(createCustomError("Valid claim amount is required", 400));
  }

  const claim = await Claim.findById(claimId);
  if (!claim) {
    return next(createCustomError(`No claim found with id: ${claimId}`, 404));
  }

  // Check permissions
  if (
    claim.employeeId.toString() !== userId.toString() &&
    req.user.role !== "admin" &&
    req.user.role !== "hr_officer"
  ) {
    return next(
      createCustomError("You don't have permission to submit this claim", 403)
    );
  }

  // Validate claim status
  if (claim.claimStatus !== "employee") {
    return next(
      createCustomError("Can only submit claim when it's with employee", 400)
    );
  }

  // Check if questionnaire is complete
  if (!claim.questionnaire.isComplete) {
    return next(
      createCustomError("Questionnaire must be completed before submission", 400)
    );
  }

  // Update claim amount
  claim.claimAmount.requested = claimAmount;

  // Add documents if provided
  if (documents && Array.isArray(documents)) {
    claim.documents = [...claim.documents, ...documents];
  }

  // Clear return reason if this is a resubmission
  if (claim.returnReason) {
    claim.returnReason = undefined;
  }

  try {
    await claim.submitToHR();

    res.status(200).json({
      success: true,
      message: "Claim submitted to HR successfully",
      claim,
      nextStep: "await_hr_review",
    });
  } catch (error) {
    return next(createCustomError(error.message, 400));
  }
});

// Forward claim to insurer (HR only)
const forwardToInsurer = asyncWrapper(async (req, res, next) => {
  const { id: claimId } = req.params;
  const { coverageBreakdown, hrNotes } = req.body;
  const { userId, role } = req.user;

  // Check role permissions
  if (role !== "hr_officer" && role !== "admin") {
    return next(
      createCustomError("Only HR officers can forward claims to insurers", 403)
    );
  }

  if (!coverageBreakdown || !Array.isArray(coverageBreakdown) || coverageBreakdown.length === 0) {
    return next(
      createCustomError("Coverage breakdown is required when forwarding to insurer", 400)
    );
  }

  // Validate coverage breakdown format
  for (const coverage of coverageBreakdown) {
    if (!coverage.coverageType || !coverage.requestedAmount || coverage.requestedAmount <= 0) {
      return next(
        createCustomError("Each coverage item must have a type and valid requested amount", 400)
      );
    }
  }

  const claim = await Claim.findById(claimId);
  if (!claim) {
    return next(createCustomError(`No claim found with id: ${claimId}`, 404));
  }

  try {
    await claim.forwardToInsurer(coverageBreakdown, hrNotes, userId);

    res.status(200).json({
      success: true,
      message: "Claim forwarded to insurer successfully",
      claim,
      nextStep: "await_insurer_decision",
    });
  } catch (error) {
    return next(createCustomError(error.message, 400));
  }
});

// Make final decision on claim (Insurance agent only)
const makeDecision = asyncWrapper(async (req, res, next) => {
  const { id: claimId } = req.params;
  const { status, approvedAmount, rejectionReason, insurerNotes } = req.body;
  const { userId, role } = req.user;

  // Check role permissions
  if (role !== "insurance_agent" && role !== "admin") {
    return next(
      createCustomError("Only insurance agents can make claim decisions", 403)
    );
  }

  if (!["approved", "rejected"].includes(status)) {
    return next(
      createCustomError("Decision status must be either 'approved' or 'rejected'", 400)
    );
  }

  if (status === "approved" && (!approvedAmount || approvedAmount <= 0)) {
    return next(
      createCustomError("Approved amount is required for approved claims", 400)
    );
  }

  if (status === "rejected" && !rejectionReason) {
    return next(
      createCustomError("Rejection reason is required for rejected claims", 400)
    );
  }

  const claim = await Claim.findById(claimId);
  if (!claim) {
    return next(createCustomError(`No claim found with id: ${claimId}`, 404));
  }

  const decision = {
    status,
    approvedAmount: status === "approved" ? approvedAmount : undefined,
    rejectionReason: status === "rejected" ? rejectionReason : undefined,
    insurerNotes,
  };

  try {
    await claim.makeDecision(decision, userId);

    res.status(200).json({
      success: true,
      message: `Claim ${status} successfully`,
      claim,
      nextStep: "claim_finalized",
    });
  } catch (error) {
    return next(createCustomError(error.message, 400));
  }
});

// Return claim to previous stage
const returnClaim = asyncWrapper(async (req, res, next) => {
  const { id: claimId } = req.params;
  const { returnReason } = req.body;
  const { userId, role } = req.user;

  if (!returnReason || returnReason.trim().length === 0) {
    return next(createCustomError("Return reason is required", 400));
  }

  const claim = await Claim.findById(claimId);
  if (!claim) {
    return next(createCustomError(`No claim found with id: ${claimId}`, 404));
  }

  // Check permissions based on current claim status
  if (claim.claimStatus === "hr" && role !== "hr_officer" && role !== "admin") {
    return next(
      createCustomError("Only HR officers can return claims from HR stage", 403)
    );
  }

  if (claim.claimStatus === "insurer" && role !== "insurance_agent" && role !== "admin") {
    return next(
      createCustomError("Only insurance agents can return claims from insurer stage", 403)
    );
  }

  try {
    await claim.returnToPreviousStage(returnReason, userId);

    const nextStage = claim.claimStatus === "employee" ? "employee" : "hr";

    res.status(200).json({
      success: true,
      message: `Claim returned to ${nextStage} successfully`,
      claim,
      nextStep: `claim_with_${nextStage}`,
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

  // Date range filter
  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(endDate);
  }

  // Role-based filtering
  if (req.user.role === "employee") {
    query.employeeId = req.user.userId;
  } else if (req.user.role === "hr_officer") {
    // HR can see all claims
  } else if (req.user.role === "insurance_agent") {
    // Insurance agents see only claims that are with them or finalized
    query.claimStatus = { $in: ["insurer", "approved", "rejected"] };
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
    .populate("questionnaire.responses.answer.fileValue", "filename originalName")
    .populate("hrForwardingDetails.forwardedBy", "firstName lastName email")
    .populate("decision.decidedBy", "firstName lastName email");

  if (!claim) {
    return next(createCustomError(`No claim found with id: ${claimId}`, 404));
  }

  // Check permissions
  if (
    req.user.role === "employee" &&
    claim.employeeId._id.toString() !== req.user.userId.toString()
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
        claimStatus: "employee",
      };
      break;
    case "hr_officer":
      query = {
        claimStatus: "hr",
      };
      break;
    case "insurance_agent":
      query = {
        claimStatus: "insurer",
      };
      break;
    default:
      query = {};
  }

  const claims = await Claim.find(query)
    .populate("policy", "policyNumber policyType provider")
    .populate("employeeId", "firstName lastName email")
    .sort({ createdAt: -1 })
    .limit(20);

  res.status(200).json({
    success: true,
    count: claims.length,
    claims,
    role,
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

// Get questionnaire questions for a claim
const getQuestionnaireQuestions = asyncWrapper(async (req, res, next) => {
  const { id: claimId } = req.params;
  const { userId } = req.user;

  const claim = await Claim.findById(claimId)
    .populate("questionnaire.templateReference")
    .populate("questionnaire.responses.answer.fileValue", "filename originalName");

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
      createCustomError("You don't have permission to view this questionnaire", 403)
    );
  }

  // Validate claim status - questionnaire should be available when status is "employee"
  if (claim.claimStatus !== "employee") {
    return next(
      createCustomError("Questionnaire is not available for this claim status", 400)
    );
  }

  // Check if questionnaire is loaded
  if (!claim.questionnaire.responses || claim.questionnaire.responses.length === 0) {
    return next(
      createCustomError("Questionnaire not loaded for this claim", 400)
    );
  }

  // Format questions for frontend consumption
  const questions = claim.questionnaire.responses.map(response => ({
    questionId: response.questionId,
    questionText: response.questionText,
    questionType: response.questionType,
    isRequired: response.isRequired,
    currentAnswer: response.isAnswered ? {
      value: response.answer.textValue || 
             response.answer.numberValue || 
             response.answer.dateValue || 
             response.answer.booleanValue || 
             response.answer.selectValue || 
             response.answer.multiselectValue || 
             response.answer.fileValue,
      answeredAt: response.answeredAt
    } : null,
    isAnswered: response.isAnswered
  }));

  res.status(200).json({
    success: true,
    message: "Questionnaire questions retrieved successfully",
    questionnaire: {
      claimId: claim._id,
      claimType: claim.claimType,
      claimOption: claim.claimType === "life" ? claim.lifeClaimOption : claim.vehicleClaimOption,
      isComplete: claim.questionnaire.isComplete,
      completedAt: claim.questionnaire.completedAt,
      totalQuestions: questions.length,
      answeredQuestions: questions.filter(q => q.isAnswered).length,
      questions: questions
    }
  });
});

// Submit all questionnaire answers at once
const submitQuestionnaireAnswers = asyncWrapper(async (req, res, next) => {
  const { id: claimId } = req.params;
  const { answers } = req.body;
  const { userId } = req.user;

  // Validate request body
  if (!answers || !Array.isArray(answers) || answers.length === 0) {
    return next(
      createCustomError("Answers array is required and must not be empty", 400)
    );
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
      createCustomError("You don't have permission to update this questionnaire", 403)
    );
  }

  // Validate claim status
  if (claim.claimStatus !== "employee") {
    return next(
      createCustomError("Can only update questionnaire when claim is with employee", 400)
    );
  }

  // Check if questionnaire is loaded
  if (!claim.questionnaire.responses || claim.questionnaire.responses.length === 0) {
    return next(
      createCustomError("Questionnaire not loaded for this claim", 400)
    );
  }

  // Validate answers format
  const validationErrors = [];
  const questionIds = claim.questionnaire.responses.map(r => r.questionId);

  for (const answer of answers) {
    if (!answer.questionId || answer.value === undefined) {
      validationErrors.push("Each answer must have questionId and value");
      continue;
    }

    if (!questionIds.includes(answer.questionId)) {
      validationErrors.push(`Invalid questionId: ${answer.questionId}`);
    }
  }

  if (validationErrors.length > 0) {
    return next(createCustomError(`Validation errors: ${validationErrors.join(', ')}`, 400));
  }

  try {
    // Update all answers
    const updatedQuestions = [];
    for (const answer of answers) {
      await claim.updateQuestionnaireAnswer(answer.questionId, answer.value);
      updatedQuestions.push(answer.questionId);
    }

    // Check if questionnaire is now complete
    const isComplete = claim.checkQuestionnaireCompletion();
    await claim.save();

    // Get updated questionnaire data
    const questions = claim.questionnaire.responses.map(response => ({
      questionId: response.questionId,
      questionText: response.questionText,
      questionType: response.questionType,
      isRequired: response.isRequired,
      currentAnswer: response.isAnswered ? {
        value: response.answer.textValue || 
               response.answer.numberValue || 
               response.answer.dateValue || 
               response.answer.booleanValue || 
               response.answer.selectValue || 
               response.answer.multiselectValue || 
               response.answer.fileValue,
        answeredAt: response.answeredAt
      } : null,
      isAnswered: response.isAnswered,
      wasUpdated: updatedQuestions.includes(response.questionId)
    }));

    res.status(200).json({
      success: true,
      message: `Successfully updated ${updatedQuestions.length} answers`,
      questionnaire: {
        claimId: claim._id,
        isComplete: isComplete,
        completedAt: claim.questionnaire.completedAt,
        totalQuestions: questions.length,
        answeredQuestions: questions.filter(q => q.isAnswered).length,
        updatedQuestions: updatedQuestions.length,
        questions: questions
      },
      nextStep: isComplete ? "set_claim_amount_and_submit" : "continue_answering_questions"
    });

  } catch (error) {
    return next(createCustomError(error.message, 400));
  }
});

export {
  createClaim,
  updateQuestionnaireAnswer,
  submitClaim,
  forwardToInsurer,
  makeDecision,
  returnClaim,
  getAllClaims,
  getClaimById,
  getClaimsRequiringAction,
  getClaimStatistics,
  getQuestionnaireQuestions,
  submitQuestionnaireAnswers,
};