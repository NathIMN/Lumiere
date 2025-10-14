import Claim from "../models/Claim.js";
import Policy from "../models/Policy.js";
import User from "../models/User.js";
import Notification from "../models/Notification.js";
import EmailService from "../services/emailService.js";
import asyncWrapper from "../middleware/async.js";
import { createCustomError } from "../errors/custom-error.js";
import { uploadClaimDocument, uploadMultipleClaimDocuments } from "./documentUpload.js";
import { 
  sendInAppNotification, 
  sendCombinedNotification 
} from "./notifications.js";
import { socketHandler } from "../server.js";

// Helper function to send claim-related notifications
const sendClaimNotification = async (userId, notificationType, claim, additionalData = {}) => {
  try {
    // Define notification content based on type
    const notifications = {
      'claim_submitted': {
        title: 'Claim Submitted Successfully',
        message: `Your ${claim.claimType} insurance claim #${claim.claimId} has been submitted and is under review by HR.`,
        type: 'success',
        actionButton: {
          text: 'View Claim',
          url: `/employee/claims/${claim._id}`
        }
      },
      'claim_forwarded_to_insurer': {
        title: 'Claim Forwarded to Insurer',
        message: `${claim.claimType} claim #${claim.claimId} has been forwarded to the insurance agent for review.`,
        type: 'info',
        actionButton: {
          text: 'View Claim',
          url: `/agent/claims-review/${claim._id}`
        }
      },
      'claim_approved': {
        title: 'Claim Approved! ✅',
        message: `Great news! Your ${claim.claimType} claim #${claim.claimId} has been approved${additionalData.approvedAmount ? ` for $${additionalData.approvedAmount.toLocaleString()}` : ''}.`,
        type: 'success',
        priority: 'high',
        actionButton: {
          text: 'View Claim',
          url: `/employee/claims/${claim._id}`
        }
      },
      'claim_rejected': {
        title: 'Claim Rejected',
        message: `Your ${claim.claimType} claim #${claim.claimId} has been rejected. Please review the details for more information.`,
        type: 'error',
        priority: 'high',
        actionButton: {
          text: 'View Claim',
          url: `/employee/claims/${claim._id}`
        }
      },
      'claim_returned_to_employee': {
        title: 'Additional Information Required',
        message: `Your ${claim.claimType} claim #${claim.claimId} has been returned. Please provide additional information as requested.`,
        type: 'warning',
        priority: 'high',
        actionButton: {
          text: 'Update Claim',
          url: `/employee/claims/${claim._id}`
        }
      },
      'claim_returned_to_hr': {
        title: 'Claim Returned for Review',
        message: `${claim.claimType} claim #${claim.claimId} has been returned by the insurance agent for further review.`,
        type: 'warning',
        priority: 'medium',
        actionButton: {
          text: 'Review Claim',
          url: `/hr/claims/${claim._id}`
        }
      },
      'new_claim_for_hr': {
        title: 'New Claim for Review',
        message: `A new ${claim.claimType} claim #${claim.claimId} has been submitted and requires HR review.`,
        type: 'info',
        priority: 'medium',
        actionButton: {
          text: 'Review Claim',
          url: `/hr/claims/${claim._id}`
        }
      },
      'new_claim_for_agent': {
        title: 'New Claim for Decision',
        message: `A ${claim.claimType} claim #${claim.claimId} has been forwarded and requires your decision.`,
        type: 'info',
        priority: 'medium',
        actionButton: {
          text: 'Review Claim',
          url: `/agent/claims-review/${claim._id}`
        }
      }
    };

    const notification = notifications[notificationType];
    if (!notification) {
      console.error(`Unknown notification type: ${notificationType}`);
      return;
    }

    // Create notification directly in database
    const newNotification = await Notification.create({
      userId,
      title: notification.title,
      message: notification.message,
      type: notification.type,
      priority: notification.priority || 'medium',
      category: 'claim',
      actionButton: notification.actionButton,
      metadata: {
        claimId: claim._id,
        claimNumber: claim.claimId,
        claimType: claim.claimType,
        claimStatus: claim.claimStatus,
        ...additionalData
      }
    });

    // Emit real-time notification via Socket.IO if user is connected
    if (socketHandler && socketHandler.connectedUsers.has(userId.toString())) {
      console.log(`🔌 User ${userId} is connected, sending real-time notification`);
      socketHandler.io.to(`user_${userId}`).emit("new_notification", {
        id: newNotification._id,
        title: newNotification.title,
        message: newNotification.message,
        type: newNotification.type,
        priority: newNotification.priority,
        category: newNotification.category,
        actionButton: newNotification.actionButton,
        createdAt: newNotification.createdAt,
      });
    } else {
      console.log(`⚠️ User ${userId} is not connected or socketHandler not available`);
      if (socketHandler) {
        console.log(`Connected users: ${Array.from(socketHandler.connectedUsers)}`);
      }
    }

    // Send email notifications for critical events (employee only)
    const emailNotificationTypes = [
      'claim_returned_to_employee',
      'claim_approved', 
      'claim_rejected'
    ];

    if (emailNotificationTypes.includes(notificationType)) {
      try {
        // Get user email
        const user = await User.findById(userId);
        if (user && user.email) {
          console.log(`📧 Sending email notification to ${user.email} for ${notificationType}`);
          
          // Create email-friendly subject and message
          let emailSubject = notification.title;
          let emailMessage = notification.message;
          
          // Add more detailed email content
          if (notificationType === 'claim_approved') {
            emailSubject = `✅ Insurance Claim Approved - ${claim.claimId}`;
            emailMessage = `
Great news! Your ${claim.claimType} insurance claim has been approved.

Claim Details:
• Claim Number: ${claim.claimId}
• Claim Type: ${claim.claimType.charAt(0).toUpperCase() + claim.claimType.slice(1)} Insurance
${additionalData.approvedAmount ? `• Approved Amount: $${additionalData.approvedAmount.toLocaleString()}` : ''}

Next Steps:
Your payment will be processed and you should receive it within 2-3 business days.

You can view your claim details by logging into your employee dashboard.
            `;
          } else if (notificationType === 'claim_rejected') {
            emailSubject = `❌ Insurance Claim Rejected - ${claim.claimId}`;
            emailMessage = `
We regret to inform you that your ${claim.claimType} insurance claim has been rejected.

Claim Details:
• Claim Number: ${claim.claimId}
• Claim Type: ${claim.claimType.charAt(0).toUpperCase() + claim.claimType.slice(1)} Insurance
${additionalData.rejectionReason ? `• Rejection Reason: ${additionalData.rejectionReason}` : ''}

Next Steps:
Please review the rejection details in your employee dashboard. You may contact HR if you have questions about this decision.
            `;
          } else if (notificationType === 'claim_returned_to_employee') {
            emailSubject = `📋 Additional Information Required - ${claim.claimId}`;
            emailMessage = `
Your ${claim.claimType} insurance claim requires additional information.

Claim Details:
• Claim Number: ${claim.claimId}
• Claim Type: ${claim.claimType.charAt(0).toUpperCase() + claim.claimType.slice(1)} Insurance
${additionalData.returnReason ? `• Required Information: ${additionalData.returnReason}` : ''}

Next Steps:
Please log into your employee dashboard to provide the requested information and resubmit your claim.
            `;
          }

          await EmailService.sendNotificationEmail(
            user.email,
            emailSubject,
            emailMessage,
            {
              priority: notification.priority || 'medium',
              actionButton: notification.actionButton
            }
          );
          
          console.log(`✅ Email sent successfully to ${user.email}`);
        }
      } catch (emailError) {
        console.error(`❌ Failed to send email notification:`, emailError);
        // Don't throw error - in-app notification should still work
      }
    }

    console.log(`✅ Claim notification sent: ${notification.title} to user ${userId}`);

  } catch (error) {
    console.error('Error sending claim notification:', error);
  }
};

// Helper function to notify HR officers about new claims
const notifyHROfficers = async (claim) => {
  try {
    const hrOfficers = await User.find({ role: 'hr_officer' });
    console.log(`🔍 Found ${hrOfficers.length} HR officers to notify about claim ${claim.claimId}`);
    
    for (const hr of hrOfficers) {
      console.log(`📨 Sending notification to HR officer: ${hr.email} (${hr._id})`);
      await sendClaimNotification(hr._id, 'new_claim_for_hr', claim);
    }
  } catch (error) {
    console.error('Error notifying HR officers:', error);
  }
};

// Helper function to notify insurance agents about new claims
const notifyInsuranceAgents = async (claim) => {
  try {
    const agents = await User.find({ role: 'insurance_agent' });
    console.log(`🔍 Found ${agents.length} insurance agents to notify about claim ${claim.claimId}`);
    
    for (const agent of agents) {
      console.log(`📨 Sending notification to insurance agent: ${agent.email} (${agent._id})`);
      await sendClaimNotification(agent._id, 'new_claim_for_agent', claim);
    }
  } catch (error) {
    console.error('Error notifying insurance agents:', error);
  }
};

// Create initial draft claim with type and option
const createClaim = asyncWrapper(async (req, res, next) => {
  const { policy, claimType, claimOption } = req.body;
  const { userId } = req.user;

  const employeeId = userId;

  // Validate required fields
  if (!policy || !claimType || !claimOption) {
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
//   if (
//     userId.toString() !== employeeId.toString() &&
//     req.user.role !== "admin" &&
//     req.user.role !== "hr_officer"
//   ) {
//     return next(
//       createCustomError("You can only create claims for yourself", 403)
//     );
//   }

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

    // Send notification to employee confirming submission
    await sendClaimNotification(claim.employeeId, 'claim_submitted', claim);
    
    // Notify all HR officers about new claim
    await notifyHROfficers(claim);

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

    // Send notification to employee about forwarding
    await sendClaimNotification(claim.employeeId, 'claim_forwarded_to_insurer', claim);
    
    // Notify all insurance agents about new claim
    await notifyInsuranceAgents(claim);

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

  const claim = await Claim.findById(claimId).populate('policy');
  if (!claim) {
    return next(createCustomError(`No claim found with id: ${claimId}`, 404));
  }

  // For approved claims, validate against coverage limits
  if (status === "approved") {
    const policy = await Policy.findById(claim.policy);
    
    if (!policy) {
      return next(createCustomError("Policy not found for this claim", 404));
    }

    // Check if employee is a beneficiary of the policy
    const isBeneficiary = policy.beneficiaries.some(
      b => b.toString() === claim.employeeId.toString()
    );

    if (!isBeneficiary) {
      return next(createCustomError("Employee is not a beneficiary of this policy", 400));
    }

    // Validate coverage breakdown from HR forwarding details
    if (!claim.hrForwardingDetails || !claim.hrForwardingDetails.coverageBreakdown) {
      return next(createCustomError("Coverage breakdown is required for claim approval", 400));
    }

    // First, validate total coverage limit for beneficiary
    const remainingTotalCoverage = policy.getRemainingTotalCoverage(claim.employeeId);
    if (approvedAmount > remainingTotalCoverage) {
      return next(createCustomError(
        `Approved amount ($${approvedAmount.toLocaleString()}) exceeds remaining total coverage ($${remainingTotalCoverage.toLocaleString()}) for this beneficiary`, 
        400
      ));
    }

    // Validate each coverage type against individual limits
    for (const coverage of claim.hrForwardingDetails.coverageBreakdown) {
      const { coverageType, requestedAmount } = coverage;
      
      // Check if this is a valid coverage type for the policy
      const validCoverageTypes = policy.policyType === 'life' ? policy.coverage.typeLife : policy.coverage.typeVehicle;
      if (!validCoverageTypes.includes(coverageType)) {
        return next(createCustomError(`Invalid coverage type: ${coverageType} for ${policy.policyType} policy`, 400));
      }

      // For partial approvals, calculate the proportional amount for this coverage type
      const coverageApprovedAmount = (requestedAmount / claim.claimAmount.requested) * approvedAmount;
      
      // Check individual coverage type limit
      const remainingCoverageLimitForType = policy.getRemainingCoverage(claim.employeeId, coverageType);
      if (coverageApprovedAmount > remainingCoverageLimitForType) {
        return next(createCustomError(
          `Coverage ${coverageType} approved amount ($${coverageApprovedAmount.toLocaleString()}) exceeds remaining limit ($${remainingCoverageLimitForType.toLocaleString()})`, 
          400
        ));
      }
    }
  }

  const decision = {
    status,
    approvedAmount: status === "approved" ? approvedAmount : undefined,
    rejectionReason: status === "rejected" ? rejectionReason : undefined,
    insurerNotes,
  };

  try {
    await claim.makeDecision(decision, userId);

    // If approved, update the claimed amounts in the policy
    if (status === "approved") {
      const policy = await Policy.findById(claim.policy);
      
      // Update claimed amounts for each coverage type based on the approved amount proportion
      for (const coverage of claim.hrForwardingDetails.coverageBreakdown) {
        const { coverageType, requestedAmount } = coverage;
        const coverageApprovedAmount = (requestedAmount / claim.claimAmount.requested) * approvedAmount;
        
        // Add this amount to the policy's claimed amounts
        policy.addClaimedAmount(claim.employeeId, coverageType, coverageApprovedAmount);
      }

      await policy.save();
    }

    // Send notification to employee about claim decision
    if (status === "approved") {
      await sendClaimNotification(claim.employeeId, 'claim_approved', claim, { 
        approvedAmount 
      });
    } else {
      await sendClaimNotification(claim.employeeId, 'claim_rejected', claim, { 
        rejectionReason 
      });
    }

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

    // Send notification based on where the claim is being returned
    if (nextStage === "employee") {
      await sendClaimNotification(claim.employeeId, 'claim_returned_to_employee', claim, { 
        returnReason 
      });
    } else if (nextStage === "hr") {
      // Find the HR officer who originally forwarded it (if available) or notify all HR officers
      const hrOfficers = await User.find({ role: 'hr_officer' });
      for (const hr of hrOfficers) {
        await sendClaimNotification(hr._id, 'claim_returned_to_hr', claim, { 
          returnReason 
        });
      }
    }

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
    search,
    page = 1,
    limit = 100,
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

  // Search functionality
  if (search) {
    query.$or = [
      { claimId: { $regex: search, $options: "i" } },
      { claimType: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } }
    ];
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
    .populate("policy", "policyNumber policyType provider policyId")
    .populate("employeeId", "userId profile fullname email employment")
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

  const claim = await Claim.findOne({ claimId: claimId }) // Changed from findById to findOne
    .populate("policy", "policyNumber policyId policyType provider coverage")
    .populate("employeeId", "userId profile fullname email employment")
    .populate("documents", "filename originalName fileType uploadedAt")
    .populate("questionnaire.sections.responses.answer.fileValue", "filename originalName")
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
    .populate("policy", "policyNumber policyId policyType provider")
  .populate("employeeId", "userId profile fullname email employment")
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


// Get questionnaire questions for a claim (updated to return sections)
const getQuestionnaireQuestions = asyncWrapper(async (req, res, next) => {
  const { id: claimId } = req.params;
  const { userId } = req.user;

  const claim = await Claim.findById(claimId)
    .populate("questionnaire.templateReference")
    .populate("questionnaire.sections.responses.answer.fileValue", "filename originalName");

  if (!claim) {
    return next(createCustomError(`No claim found with id: ${claimId}`, 404));
  }

  // Check permissions
  if (
    claim.employeeId.toString() !== userId.toString() &&
    req.user.role !== "admin" &&
    req.user.role !== "hr_officer" &&
    req.user.role !== "insurance_agent"
  ) {
    return next(
      createCustomError("You don't have permission to view this questionnaire", 403)
    );
  }

  // Validate claim status - questionnaire should be available for employee submission and agent review
  if (claim.claimStatus !== "employee" && claim.claimStatus !== "insurer") {
    return next(
      createCustomError("Questionnaire is not available for this claim status", 400)
    );
  }

  // Check if questionnaire is loaded
  if (!claim.questionnaire.sections || claim.questionnaire.sections.length === 0) {
    return next(
      createCustomError("Questionnaire not loaded for this claim", 400)
    );
  }

  // Format sections and questions for frontend consumption
  const sections = claim.questionnaire.sections
    .sort((a, b) => a.order - b.order)
    .map(section => ({
      sectionId: section.sectionId,
      title: section.title,
      description: section.description,
      order: section.order,
      isComplete: section.isComplete,
      completedAt: section.completedAt,
      questions: section.responses
        .sort((a, b) => a.order - b.order)
        .map(response => ({
          questionId: response.questionId,
          questionText: response.questionText,
          questionType: response.questionType,
          isRequired: response.isRequired,
          validation: response.validation,
          order: response.order,
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
        }))
    }));

  // Calculate totals
  const totalQuestions = sections.reduce((sum, section) => sum + section.questions.length, 0);
  const answeredQuestions = sections.reduce((sum, section) => 
    sum + section.questions.filter(q => q.isAnswered).length, 0);

  res.status(200).json({
    success: true,
    message: "Questionnaire sections retrieved successfully",
    questionnaire: {
      claimId: claim._id,
      claimType: claim.claimType,
      claimOption: claim.claimType === "life" ? claim.lifeClaimOption : claim.vehicleClaimOption,
      isComplete: claim.questionnaire.isComplete,
      completedAt: claim.questionnaire.completedAt,
      totalQuestions: totalQuestions,
      answeredQuestions: answeredQuestions,
      totalSections: sections.length,
      completedSections: sections.filter(s => s.isComplete).length,
      sections: sections
    }
  });
});

// Submit all questionnaire answers at once (updated to work with sections)
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
    req.user.role !== "hr_officer"
  ) {
    return next(
      createCustomError("You don't have permission to update this questionnaire", 403)
    );
  }

  // Validate claim status
  if (claim.claimStatus !== "employee" && claim.claimStatus !== "draft") {
    return next(
      createCustomError("Can only update questionnaire when claim is with employee", 400)
    );
  }

  // Check if questionnaire is loaded
  if (!claim.questionnaire.sections || claim.questionnaire.sections.length === 0) {
    return next(
      createCustomError("Questionnaire not loaded for this claim", 400)
    );
  }

  // Validate answers format
  const validationErrors = [];
  const allQuestionIds = claim.questionnaire.sections.flatMap(s => s.responses.map(r => r.questionId));

  for (const answer of answers) {
    if (!answer.questionId || answer.value === undefined) {
      validationErrors.push("Each answer must have questionId and value");
      continue;
    }

    if (!allQuestionIds.includes(answer.questionId)) {
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

    // Check questionnaire completion and auto-update status
    claim.checkQuestionnaireCompletion();

    // Save the claim
    await claim.save();

    // Get updated questionnaire data with sections
    const sections = claim.questionnaire.sections
      .sort((a, b) => a.order - b.order)
      .map(section => ({
        sectionId: section.sectionId,
        title: section.title,
        description: section.description,
        order: section.order,
        isComplete: section.isComplete,
        completedAt: section.completedAt,
        questions: section.responses
          .sort((a, b) => a.order - b.order)
          .map(response => ({
            questionId: response.questionId,
            questionText: response.questionText,
            questionType: response.questionType,
            options: response.options,
            isRequired: response.isRequired,
            order: response.order,
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
          }))
      }));

    const totalQuestions = sections.reduce((sum, section) => sum + section.questions.length, 0);
    const answeredQuestions = sections.reduce((sum, section) => 
      sum + section.questions.filter(q => q.isAnswered).length, 0);

    res.status(200).json({
      success: true,
      message: `Successfully updated ${updatedQuestions.length} answers across all sections`,
      questionnaire: {
        claimId: claim._id,
        isComplete: claim.questionnaire.isComplete,
        completedAt: claim.questionnaire.completedAt,
        totalQuestions: totalQuestions,
        answeredQuestions: answeredQuestions,
        updatedQuestions: updatedQuestions.length,
        totalSections: sections.length,
        completedSections: sections.filter(s => s.isComplete).length,
        sections: sections
      },
      nextStep: claim.questionnaire.isComplete ? "set_claim_amount_and_submit" : "continue_answering_questions"
    });

  } catch (error) {
    return next(createCustomError(error.message, 400));
  }
});

// Add to your claims controller
const updateClaimStatus = asyncWrapper(async (req, res, next) => {
  const { id: claimId } = req.params;
  const { status } = req.body;
  const { userId } = req.user;

  const claim = await Claim.findById(claimId);
  if (!claim) {
    return next(createCustomError(`No claim found with id: ${claimId}`, 404));
  }

  // Check permissions
  if (claim.employeeId.toString() !== userId.toString()) {
    return next(createCustomError("You don't have permission to update this claim", 403));
  }

  claim.claimStatus = status;
  await claim.save();

  res.status(200).json({
    success: true,
    message: "Claim status updated successfully",
    claim
  });
});

// Submit questionnaire answers for a specific section
const submitSectionAnswers = asyncWrapper(async (req, res, next) => {
  const { id: claimId, sectionId } = req.params;
  const { answers } = req.body;
  const { userId } = req.user;

  // Validate request body
  if (!sectionId) {
    return next(createCustomError("Section ID is required", 400));
  }

  if (!answers || !Array.isArray(answers) || answers.length === 0) {
    return next(createCustomError("Answers array is required and must not be empty", 400));
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
      createCustomError("You don't have permission to update this questionnaire", 403)
    );
  }

  // Validate claim status
  if (claim.claimStatus !== "employee" && claim.claimStatus !== "draft") {
    return next(
      createCustomError("Can only update questionnaire when claim is with employee or as a draft", 400)
    );
  }

  // Find the target section
  const targetSection = claim.questionnaire.sections.find(s => s.sectionId === sectionId);
  if (!targetSection) {
    return next(createCustomError(`Section with ID ${sectionId} not found`, 404));
  }

  // Validate answers format and question IDs
  const validationErrors = [];
  const sectionQuestionIds = targetSection.responses.map(r => r.questionId);

  for (const answer of answers) {
    if (!answer.questionId || answer.value === undefined) {
      validationErrors.push("Each answer must have questionId and value");
      continue;
    }

    if (!sectionQuestionIds.includes(answer.questionId)) {
      validationErrors.push(`Invalid questionId for this section: ${answer.questionId}`);
    }
  }

  if (validationErrors.length > 0) {
    return next(createCustomError(`Validation errors: ${validationErrors.join(', ')}`, 400));
  }

  try {
    // Update answers for this section
    const updatedQuestions = [];
    for (const answer of answers) {
      await claim.updateQuestionnaireAnswer(answer.questionId, answer.value);
      updatedQuestions.push(answer.questionId);
    }

    // Check questionnaire completion and auto-update status
    claim.checkQuestionnaireCompletion();

    // Save the claim
    await claim.save();

    // Get updated section data
    const updatedSection = claim.questionnaire.sections.find(s => s.sectionId === sectionId);
    const formattedSection = {
      sectionId: updatedSection.sectionId,
      title: updatedSection.title,
      description: updatedSection.description,
      order: updatedSection.order,
      isComplete: updatedSection.isComplete,
      completedAt: updatedSection.completedAt,
      questions: updatedSection.responses
        .sort((a, b) => a.order - b.order)
        .map(response => ({
          questionId: response.questionId,
          questionText: response.questionText,
          questionType: response.questionType,
          isRequired: response.isRequired,
          order: response.order,
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
        }))
    };

    // Calculate overall progress
    const totalQuestions = claim.questionnaire.sections.reduce(
      (sum, section) => sum + section.responses.length, 0);
    const answeredQuestions = claim.questionnaire.sections.reduce(
      (sum, section) => sum + section.responses.filter(r => r.isAnswered).length, 0);

    res.status(200).json({
      success: true,
      message: `Successfully updated ${updatedQuestions.length} answers in section: ${updatedSection.title}`,
      section: formattedSection,
      progress: {
        claimId: claim._id,
        sectionComplete: updatedSection.isComplete,
        questionnaireComplete: claim.questionnaire.isComplete,
        totalQuestions: totalQuestions,
        answeredQuestions: answeredQuestions,
        updatedQuestions: updatedQuestions.length,
        completedSections: claim.questionnaire.sections.filter(s => s.isComplete).length,
        totalSections: claim.questionnaire.sections.length
      },
      nextStep: claim.questionnaire.isComplete ? "set_claim_amount_and_submit" : "continue_answering_questions"
    });

  } catch (error) {
    return next(createCustomError(error.message, 400));
  }
});

// Get specific section data
const getSectionQuestions = asyncWrapper(async (req, res, next) => {
  const { id: claimId, sectionId } = req.params;
  const { userId } = req.user;

  const claim = await Claim.findById(claimId)
    .populate("questionnaire.sections.responses.answer.fileValue", "filename originalName");

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
      createCustomError("You don't have permission to view this questionnaire", 403)
    );
  }

  // Find the specific section
  const section = claim.questionnaire.sections.find(s => s.sectionId === sectionId);
  if (!section) {
    return next(createCustomError(`Section with ID ${sectionId} not found`, 404));
  }

  // Format section data
  const formattedSection = {
    sectionId: section.sectionId,
    title: section.title,
    description: section.description,
    order: section.order,
    isComplete: section.isComplete,
    completedAt: section.completedAt,
    questions: section.responses
      .sort((a, b) => a.order - b.order)
      .map(response => ({
        questionId: response.questionId,
        questionText: response.questionText,
        questionType: response.questionType,
        isRequired: response.isRequired,
        order: response.order,
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
      }))
  };

  res.status(200).json({
    success: true,
    message: "Section questions retrieved successfully",
    section: formattedSection,
    claimId: claim._id,
    claimStatus: claim.claimStatus
  });
});

const deleteClaimById = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, role } = req.user;

    // Find the claim first
    const claim = await Claim.findById(id);
    
    if (!claim) {
      return res.status(404).json({
        success: false,
        message: "Claim not found",
      });
    }

    // Check permissions - only employees can delete their own claims
    if (role !== "admin" && claim.employeeId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to delete this claim",
      });
    }

    // Check if claim can be deleted (only draft or employee status)
    if (!["draft", "employee"].includes(claim.claimStatus)) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete claim that has been submitted to HR or beyond",
      });
    }

    // Delete the claim
    await Claim.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Claim deleted successfully",
    });

  } catch (error) {
    console.error("Error deleting claim:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete claim",
      error: error.message,
    });
  }
};

// Upload document for a specific claim
const uploadClaimDocuments = asyncWrapper(async (req, res, next) => {
  // Delegate to the documentUpload controller function
  req.body.claimId = req.params.id;
  return uploadClaimDocument(req, res, next);
});

// Upload multiple documents for a specific claim
const uploadMultipleDocumentsForClaim = asyncWrapper(async (req, res, next) => {
  // Delegate to the documentUpload controller function
  req.body.claimId = req.params.id;
  return uploadMultipleClaimDocuments(req, res, next);
});

// Get documents for a specific claim
const getClaimDocuments = asyncWrapper(async (req, res, next) => {
  const { id: claimId } = req.params;
  const { userId, role } = req.user;

  const claim = await Claim.findById(claimId)
    .populate("documents", "filename originalName fileType uploadedAt metadata docType");

  if (!claim) {
    return next(createCustomError(`No claim found with id: ${claimId}`, 404));
  }

  // Check permissions
  if (
    role === "employee" &&
    claim.employeeId.toString() !== userId.toString()
  ) {
    return next(
      createCustomError("You don't have permission to view documents for this claim", 403)
    );
  }

  res.status(200).json({
    success: true,
    count: claim.documents.length,
    documents: claim.documents,
    claimId
  });
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
  submitSectionAnswers, // New method for section-specific updates
  getSectionQuestions,  // New method for getting specific section
  updateClaimStatus,
  deleteClaimById,
  uploadClaimDocuments,
  uploadMultipleDocumentsForClaim,
  getClaimDocuments
};