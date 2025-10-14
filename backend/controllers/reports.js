import asyncHandler from '../middleware/async.js';
import reportsService from '../services/reportsService.js';
import { StatusCodes } from 'http-status-codes';
import { createCustomError } from '../errors/custom-error.js';
import User from '../models/User.js';
import mongoose from 'mongoose';

/**
 * @desc    Generate User Profiles Report
 * @route   GET /api/reports/users
 * @access  Admin, HR
 */
const generateUsersReport = asyncHandler(async (req, res) => {
  const { 
    role, 
    dateFrom, 
    dateTo, 
    department, 
    status, // ✅ Remove the default value
    format = 'pdf' 
  } = req.query;

  // Validate query parameters
  if (dateFrom && dateTo && new Date(dateFrom) > new Date(dateTo)) {
    throw new CustomError('Invalid date range: dateFrom cannot be after dateTo', StatusCodes.BAD_REQUEST);
  }

  const filters = {
    role,
    dateFrom: dateFrom ? new Date(dateFrom) : null,
    dateTo: dateTo ? new Date(dateTo) : null,
    department
    // ✅ Only add status if it's explicitly provided
  };

  // ✅ Only add status to filters if it's explicitly provided
  if (status) {
    filters.status = status;
  }

  const reportData = await reportsService.generateUsersReport(filters);
  
  if (format === 'pdf') {
    const pdfBuffer = await reportsService.generateUsersPDF(reportData, filters);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="users-report-${new Date().toISOString().split('T')[0]}.pdf"`);
    res.send(pdfBuffer);
  } else {
    res.status(StatusCodes.OK).json({
      success: true,
      data: reportData,
      filters: filters,
      generatedAt: new Date().toISOString()
    });
  }
});

/**
 * @desc    Generate Policies Report
 * @route   GET /api/reports/policies
 * @access  Admin, HR, Insurance Agent
 */
const generatePoliciesReport = asyncHandler(async (req, res) => {
  const { 
    policyType, 
    status, 
    dateFrom, 
    dateTo, 
    agent,
    premium_min,
    premium_max,
    format = 'pdf' 
  } = req.query;

  // Validate query parameters
  if (dateFrom && dateTo && new Date(dateFrom) > new Date(dateTo)) {
    throw new CustomError('Invalid date range: dateFrom cannot be after dateTo', StatusCodes.BAD_REQUEST);
  }

  if (premium_min && premium_max && parseFloat(premium_min) > parseFloat(premium_max)) {
    throw new CustomError('Invalid premium range: minimum cannot be greater than maximum', StatusCodes.BAD_REQUEST);
  }

  const filters = {
    policyType,
    status,
    dateFrom: dateFrom ? new Date(dateFrom) : null,
    dateTo: dateTo ? new Date(dateTo) : null,
    agent,
    premium_min: premium_min ? parseFloat(premium_min) : null,
    premium_max: premium_max ? parseFloat(premium_max) : null
  };

  const reportData = await reportsService.generatePoliciesReport(filters);
  
  // Get user's full name for report attribution
  const generatedBy = req.user ? 
    (() => {
      const firstName = req.user.profile?.firstName || '';
      const lastName = req.user.profile?.lastName || '';
      const fullName = `${firstName} ${lastName}`.trim();
      return fullName || req.user.email || 'System User';
    })() :
    'System Administrator';
  
  if (format === 'pdf') {
    const pdfBuffer = await reportsService.generatePoliciesPDF(reportData, filters, generatedBy);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="policies-report-${new Date().toISOString().split('T')[0]}.pdf"`);
    res.send(pdfBuffer);
  } else {
    res.status(StatusCodes.OK).json({
      success: true,
      data: reportData,
      filters: filters,
      generatedAt: new Date().toISOString()
    });
  }
});

/**
 * @desc    Generate Claims Report
 * @route   GET /api/reports/claims
 * @access  Admin, HR, Insurance Agent
 */
const generateClaimsReport = asyncHandler(async (req, res) => {
  const { 
    status, 
    claimType, 
    dateFrom, 
    dateTo, 
    agent,
    amount_min,
    amount_max,
    format = 'pdf' 
  } = req.query;

  // Validate query parameters
  if (dateFrom && dateTo && new Date(dateFrom) > new Date(dateTo)) {
    throw new CustomError('Invalid date range: dateFrom cannot be after dateTo', StatusCodes.BAD_REQUEST);
  }

  if (amount_min && amount_max && parseFloat(amount_min) > parseFloat(amount_max)) {
    throw new CustomError('Invalid amount range: minimum cannot be greater than maximum', StatusCodes.BAD_REQUEST);
  }

  const filters = {
    status,
    claimType,
    dateFrom: dateFrom ? new Date(dateFrom) : null,
    dateTo: dateTo ? new Date(dateTo) : null,
    agent,
    amount_min: amount_min ? parseFloat(amount_min) : null,
    amount_max: amount_max ? parseFloat(amount_max) : null,
    hrOnly: req.query.hrOnly // Add hrOnly filter for HR-specific claims
  };

  const reportData = await reportsService.generateClaimsReport(filters);
  
  // Get user's full name for report attribution
  const generatedBy = req.user ? 
    (() => {
      const firstName = req.user.profile?.firstName || '';
      const lastName = req.user.profile?.lastName || '';
      const fullName = `${firstName} ${lastName}`.trim();
      return fullName || req.user.email || 'System User';
    })() :
    'System Administrator';
  
  if (format === 'pdf') {
    const pdfBuffer = await reportsService.generateClaimsPDF(reportData, filters, generatedBy);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="claims-report-${new Date().toISOString().split('T')[0]}.pdf"`);
    res.send(pdfBuffer);
  } else {
    res.status(StatusCodes.OK).json({
      success: true,
      data: reportData,
      filters: filters,
      generatedAt: new Date().toISOString()
    });
  }
});

/**
 * @desc    Generate Financial Summary Report
 * @route   GET /api/reports/financial
 * @access  Admin
 */
const generateFinancialReport = asyncHandler(async (req, res) => {
  const { 
    dateFrom, 
    dateTo, 
    period = 'monthly', // monthly, quarterly, yearly
    format = 'pdf' 
  } = req.query;

  // Default to current year if no dates provided
  const currentYear = new Date().getFullYear();
  const defaultDateFrom = dateFrom ? new Date(dateFrom) : new Date(currentYear, 0, 1);
  const defaultDateTo = dateTo ? new Date(dateTo) : new Date(currentYear, 11, 31);

  if (defaultDateFrom > defaultDateTo) {
    throw new CustomError('Invalid date range: dateFrom cannot be after dateTo', StatusCodes.BAD_REQUEST);
  }

  const filters = {
    dateFrom: defaultDateFrom,
    dateTo: defaultDateTo,
    period
  };

  const reportData = await reportsService.generateFinancialReport(filters);
  
  // Get user's full name for report attribution
  const generatedBy = req.user ? 
    (() => {
      const firstName = req.user.profile?.firstName || '';
      const lastName = req.user.profile?.lastName || '';
      const fullName = `${firstName} ${lastName}`.trim();
      return fullName || req.user.email || 'System User';
    })() :
    'System Administrator';
  
  if (format === 'pdf') {
    const pdfBuffer = await reportsService.generateFinancialPDF(reportData, filters, generatedBy);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="financial-report-${new Date().toISOString().split('T')[0]}.pdf"`);
    res.send(pdfBuffer);
  } else {
    res.status(StatusCodes.OK).json({
      success: true,
      data: reportData,
      filters: filters,
      generatedAt: new Date().toISOString()
    });
  }
});

/**
 * @desc    Generate Policy Users Report
 * @route   GET /api/reports/policy-users/:policyId
 * @access  Admin, HR, Insurance Agent
 */
const generatePolicyUsersReport = asyncHandler(async (req, res) => {
  const { policyId } = req.params;
  const { format = 'pdf' } = req.query;

  if (!policyId) {
    throw new createCustomError('Policy ID is required', StatusCodes.BAD_REQUEST);
  }

  const filters = {
    policyId
  };

  const reportData = await reportsService.generatePolicyUsersReport(filters);
  
  // Get user's full name for report attribution
  const generatedBy = req.user ? 
    (() => {
      const firstName = req.user.profile?.firstName || '';
      const lastName = req.user.profile?.lastName || '';
      const fullName = `${firstName} ${lastName}`.trim();
      return fullName || req.user.email || 'System User';
    })() :
    'System Administrator';
  
  if (format === 'pdf') {
    const pdfBuffer = await reportsService.generatePolicyUsersPDF(reportData, filters, generatedBy);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="policy-users-report-${policyId}-${new Date().toISOString().split('T')[0]}.pdf"`);
    res.send(pdfBuffer);
  } else {
    res.status(StatusCodes.OK).json({
      success: true,
      data: reportData,
      filters: filters,
      generatedAt: new Date().toISOString()
    });
  }
});

/**
 * @desc    Generate Custom Report
 * @route   POST /api/reports/custom
 * @access  Admin
 */
const generateCustomReport = asyncHandler(async (req, res) => {
  const { 
    reportName,
    reportType, // 'users', 'policies', 'claims', 'financial'
    filters,
    columns,
    groupBy,
    sortBy,
    format = 'pdf'
  } = req.body;

  // Validate required fields
  if (!reportName || !reportType) {
    throw new CustomError('Report name and type are required', StatusCodes.BAD_REQUEST);
  }

  const validReportTypes = ['users', 'policies', 'claims', 'financial'];
  if (!validReportTypes.includes(reportType)) {
    throw new CustomError(`Invalid report type. Must be one of: ${validReportTypes.join(', ')}`, StatusCodes.BAD_REQUEST);
  }

  const reportConfig = {
    reportName,
    reportType,
    filters: filters || {},
    columns: columns || [],
    groupBy,
    sortBy,
    generatedBy: req.user.id,
    generatedAt: new Date()
  };

  const reportData = await reportsService.generateCustomReport(reportConfig);
  
  if (format === 'pdf') {
    const pdfBuffer = await reportsService.generateCustomPDF(reportData, reportConfig);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${reportName.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf"`);
    res.send(pdfBuffer);
  } else {
    res.status(StatusCodes.OK).json({
      success: true,
      data: reportData,
      config: reportConfig
    });
  }
});

/**
 * @desc    Get Report Templates
 * @route   GET /api/reports/templates
 * @access  Admin, HR
 */
const getReportTemplates = asyncHandler(async (req, res) => {
  const templates = await reportsService.getAvailableTemplates();
  
  res.status(StatusCodes.OK).json({
    success: true,
    data: templates
  });
});

/**
 * @desc    Generate Report Schedule (for future implementation)
 * @route   POST /api/reports/schedule
 * @access  Admin
 */
const scheduleReport = asyncHandler(async (req, res) => {
  const { 
    reportType,
    filters,
    schedule, // 'daily', 'weekly', 'monthly'
    recipients,
    format = 'pdf'
  } = req.body;

  // This would integrate with a job scheduler like node-cron
  // For now, just return a placeholder response
  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Report scheduling feature will be implemented soon',
    data: {
      reportType,
      schedule,
      recipients,
      format,
      scheduledAt: new Date().toISOString()
    }
  });
});

/**
 * @desc    Generate Individual Claim Report
 * @route   GET /api/reports/employee/claim/:claimId
 * @access  Employee (own claims only)
 */
const generateEmployeeClaimReport = asyncHandler(async (req, res) => {
  const { claimId } = req.params;
  const { format = 'pdf' } = req.query;
  const employeeId = req.user.userId || req.user.id;

  console.log('generateEmployeeClaimReport called:');
  console.log('claimId:', claimId);
  console.log('employeeId:', employeeId);
  console.log('user object:', req.user);

  // Validate that the claim belongs to the requesting employee
  const reportData = await reportsService.generateEmployeeClaimReport(claimId, employeeId);
  
  if (format === 'pdf') {
    const pdfBuffer = await reportsService.generateEmployeeClaimPDF(reportData);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="claim-report-${claimId}-${new Date().toISOString().split('T')[0]}.pdf"`);
    res.send(pdfBuffer);
  } else {
    res.status(StatusCodes.OK).json({
      success: true,
      data: reportData,
      generatedAt: new Date().toISOString()
    });
  }
});

/**
 * @desc    Generate Employee Claims Summary Report
 * @route   GET /api/reports/employee/claims-summary
 * @access  Employee (own claims only)
 */
const generateEmployeeClaimsSummaryReport = asyncHandler(async (req, res) => {
  const { 
    dateFrom, 
    dateTo, 
    status,
    claimType,
    claimOption,
    search, 
    format = 'pdf' 
  } = req.query;
  const employeeId = req.user.userId || req.user.id;

  console.log('generateEmployeeClaimsSummaryReport called:');
  console.log('employeeId:', employeeId);
  console.log('filters:', { dateFrom, dateTo, status, claimType, claimOption, search });

  // Validate query parameters
  if (dateFrom && dateTo && new Date(dateFrom) > new Date(dateTo)) {
    throw new CustomError('Invalid date range: dateFrom cannot be after dateTo', StatusCodes.BAD_REQUEST);
  }

  const filters = {
    employeeId,
    dateFrom: dateFrom ? new Date(dateFrom) : null,
    dateTo: dateTo ? new Date(dateTo) : null,
    status,
    claimType,
    claimOption,
    search   
  };

  const reportData = await reportsService.generateEmployeeClaimsSummaryReport(filters);
  
  if (format === 'pdf') {
    const pdfBuffer = await reportsService.generateEmployeeClaimsSummaryPDF(reportData, filters);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="my-claims-summary-${new Date().toISOString().split('T')[0]}.pdf"`);
    res.send(pdfBuffer);
  } else {
    res.status(StatusCodes.OK).json({
      success: true,
      data: reportData,
      filters: filters,
      generatedAt: new Date().toISOString()
    });
  }
});

/**
 * @desc    Generate Individual Policy Report
 * @route   GET /api/reports/employee/policy/:policyId
 * @access  Employee (own policies only)
 */
const generateEmployeePolicyReport = asyncHandler(async (req, res) => {
  const { policyId } = req.params;
  const { format = 'pdf' } = req.query;
  const employeeId = req.user.userId || req.user.id;

  // Validate that the policy includes the requesting employee
  const reportData = await reportsService.generateEmployeePolicyReport(policyId, employeeId);
  
  if (format === 'pdf') {
    const pdfBuffer = await reportsService.generateEmployeePolicyPDF(reportData);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="policy-report-${policyId}-${new Date().toISOString().split('T')[0]}.pdf"`);
    res.send(pdfBuffer);
  } else {
    res.status(StatusCodes.OK).json({
      success: true,
      data: reportData,
      generatedAt: new Date().toISOString()
    });
  }
});

/**
 * @desc    Generate Documents Report
 * @route   POST /api/reports/documents
 * @access  Admin, HR
 */
const generateDocumentsReport = asyncHandler(async (req, res) => {
  const { 
    reportType = 'document-analytics',
    filters = {},
    documents = [],
    format = 'pdf' 
  } = req.body;

  // Validate required fields
  if (!documents || documents.length === 0) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      message: 'Documents array is required and cannot be empty'
    });
  }

  // Extract all unique user IDs from uploadedBy fields (including invalid ones)
  const allUploaderIds = [...new Set(documents
    .map(doc => doc.uploadedBy)
    .filter(id => id) // Keep all non-empty IDs
  )];

  // Separate valid and invalid ObjectIds
  const validUploaderIds = allUploaderIds.filter(id => mongoose.Types.ObjectId.isValid(id));
  const invalidUploaderIds = allUploaderIds.filter(id => !mongoose.Types.ObjectId.isValid(id));

  // Fetch user data for valid IDs
  const users = await User.find({ 
    _id: { $in: validUploaderIds } 
  }).select('_id profile.firstName profile.lastName email');

  // Create a lookup map for user names
  const userLookup = users.reduce((acc, user) => {
    const fullName = `${user.profile.firstName} ${user.profile.lastName}`.trim();
    acc[user._id.toString()] = fullName || user.email || 'Unknown User';
    return acc;
  }, {});

  // Add entries for invalid IDs
  invalidUploaderIds.forEach(id => {
    userLookup[id] = 'Deleted User';
  });

  // Add entries for valid IDs that don't have corresponding users (deleted users)
  validUploaderIds.forEach(id => {
    if (!userLookup[id]) {
      userLookup[id] = 'Deleted User';
    }
  });

  // Process the documents data
  const processedDocuments = documents.map(doc => ({
    name: doc.name || doc.originalName || 'Unknown',
    type: doc.type || 'Unknown',
    category: doc.category || doc.docType || 'Uncategorized',
    size: doc.size || 0,
    sizeFormatted: formatFileSize(doc.size || 0),
    status: doc.status || 'Unknown',
    isVerified: doc.isVerified || false,
    uploadedBy: userLookup[doc.uploadedBy] || doc.uploadedBy || 'Unknown',
    uploadedByRole: doc.uploadedByRole || 'Unknown',
    createdAt: doc.createdAt || new Date(),
    updatedAt: doc.updatedAt || new Date(),
    mimeType: doc.mimeType || 'application/octet-stream'
  }));

  // Calculate summary statistics
  const summary = {
    totalDocuments: processedDocuments.length,
    totalSize: processedDocuments.reduce((sum, doc) => sum + (doc.size || 0), 0),
    verifiedCount: processedDocuments.filter(doc => doc.isVerified).length,
    unverifiedCount: processedDocuments.filter(doc => !doc.isVerified).length,
    categoryBreakdown: processedDocuments.reduce((acc, doc) => {
      acc[doc.category] = (acc[doc.category] || 0) + 1;
      return acc;
    }, {}),
    typeBreakdown: processedDocuments.reduce((acc, doc) => {
      acc[doc.type] = (acc[doc.type] || 0) + 1;
      return acc;
    }, {}),
    statusBreakdown: processedDocuments.reduce((acc, doc) => {
      acc[doc.status] = (acc[doc.status] || 0) + 1;
      return acc;
    }, {}),
    roleBreakdown: processedDocuments.reduce((acc, doc) => {
      acc[doc.uploadedByRole] = (acc[doc.uploadedByRole] || 0) + 1;
      return acc;
    }, {}),
    // Calculate size breakdowns
    categorySizeBreakdown: processedDocuments.reduce((acc, doc) => {
      acc[doc.category] = (acc[doc.category] || 0) + (doc.size || 0);
      return acc;
    }, {}),
    typeSizeBreakdown: processedDocuments.reduce((acc, doc) => {
      acc[doc.type] = (acc[doc.type] || 0) + (doc.size || 0);
      return acc;
    }, {}),
    roleSizeBreakdown: processedDocuments.reduce((acc, doc) => {
      acc[doc.uploadedByRole] = (acc[doc.uploadedByRole] || 0) + (doc.size || 0);
      return acc;
    }, {}),
    // Calculate average size breakdowns
    typeAvgSizeBreakdown: {}
  };

  // Calculate average sizes by type
  Object.keys(summary.typeBreakdown).forEach(type => {
    const count = summary.typeBreakdown[type];
    const totalSize = summary.typeSizeBreakdown[type] || 0;
    summary.typeAvgSizeBreakdown[type] = count > 0 ? totalSize / count : 0;
  });

  // Format all size values to human readable format
  summary.categorySizeBreakdownFormatted = {};
  Object.keys(summary.categorySizeBreakdown).forEach(category => {
    summary.categorySizeBreakdownFormatted[category] = formatFileSize(summary.categorySizeBreakdown[category]);
  });

  summary.typeAvgSizeBreakdownFormatted = {};
  Object.keys(summary.typeAvgSizeBreakdown).forEach(type => {
    summary.typeAvgSizeBreakdownFormatted[type] = formatFileSize(summary.typeAvgSizeBreakdown[type]);
  });

  summary.roleSizeBreakdownFormatted = {};
  Object.keys(summary.roleSizeBreakdown).forEach(role => {
    summary.roleSizeBreakdownFormatted[role] = formatFileSize(summary.roleSizeBreakdown[role]);
  });

  summary.verificationRate = summary.totalDocuments > 0 ? 
    ((summary.verifiedCount / summary.totalDocuments) * 100).toFixed(1) : 0;
  summary.totalSizeFormatted = formatFileSize(summary.totalSize);

  // Get user's full name for report attribution
  const generatedBy = req.user ? 
    (() => {
      const firstName = req.user.profile?.firstName || req.user.firstName || '';
      const lastName = req.user.profile?.lastName || req.user.lastName || '';
      return `${firstName} ${lastName}`.trim() || req.user.email || 'Unknown User';
    })() :
    'System Administrator';

  const reportData = {
    reportTitle: getDocumentReportTitle(reportType),
    reportType,
    reportPeriod: determineReportPeriod(filters),
    summary,
    documents: processedDocuments,
    filters,
    generatedBy,
    generatedAt: new Date().toISOString(),
    appliedFilters: Object.entries(filters).filter(([k,v]) => v && v !== '').map(([k,v]) => `${k}=${v}`).join(', ') || 'None'
  };
  
  if (format === 'pdf') {
    const pdfBuffer = await reportsService.generateDocumentsPDF(reportData);
    
    // Set response headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="document-${reportType}-${new Date().toISOString().split('T')[0]}.pdf"`);
    res.setHeader('Content-Length', pdfBuffer.length);
    
    res.send(pdfBuffer);
  } else {
    res.status(StatusCodes.OK).json({
      success: true,
      data: reportData,
      generatedAt: new Date().toISOString()
    });
  }
});

// Helper function for file size formatting
const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Helper function for document report titles
const getDocumentReportTitle = (reportType) => {
  const titles = {
    'document-analytics': 'Document Analytics Report',
    'document-audit': 'Document Audit Trail Report',
    'compliance-report': 'Document Compliance Report',
    'storage-analysis': 'Storage & Category Analysis Report',
    'verification-summary': 'Document Verification Summary Report'
  };
  return titles[reportType] || 'Document Management Report';
};

// Helper function to determine report period from filters
const determineReportPeriod = (filters) => {
  if (filters.dateFrom && filters.dateTo) {
    const from = new Date(filters.dateFrom).toLocaleDateString();
    const to = new Date(filters.dateTo).toLocaleDateString();
    return `${from} - ${to}`;
  } else if (filters.dateFrom) {
    return `From ${new Date(filters.dateFrom).toLocaleDateString()}`;
  } else if (filters.dateTo) {
    return `Until ${new Date(filters.dateTo).toLocaleDateString()}`;
  }
  return 'All Time';
};

export {
  generateUsersReport,
  generatePoliciesReport,
  generateClaimsReport,
  generateFinancialReport,
  generatePolicyUsersReport,
  generateDocumentsReport,
  generateCustomReport,
  getReportTemplates,
  scheduleReport,
  generateEmployeeClaimReport,
  generateEmployeeClaimsSummaryReport,
  generateEmployeePolicyReport
};