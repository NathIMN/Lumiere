import asyncHandler from '../middleware/async.js';
import reportsService from '../services/reportsService.js';
import { StatusCodes } from 'http-status-codes';
import { createCustomError } from '../errors/custom-error.js';

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
    status = 'active',
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
    department,
    status
  };

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
  
  if (format === 'pdf') {
    const pdfBuffer = await reportsService.generatePoliciesPDF(reportData, filters);
    
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
    amount_max: amount_max ? parseFloat(amount_max) : null
  };

  const reportData = await reportsService.generateClaimsReport(filters);
  
  if (format === 'pdf') {
    const pdfBuffer = await reportsService.generateClaimsPDF(reportData, filters);
    
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
  
  if (format === 'pdf') {
    const pdfBuffer = await reportsService.generateFinancialPDF(reportData, filters);
    
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
    format = 'pdf' 
  } = req.query;
  const employeeId = req.user.userId || req.user.id;

  console.log('generateEmployeeClaimsSummaryReport called:');
  console.log('employeeId:', employeeId);
  console.log('filters:', { dateFrom, dateTo, status, claimType });

  // Validate query parameters
  if (dateFrom && dateTo && new Date(dateFrom) > new Date(dateTo)) {
    throw new CustomError('Invalid date range: dateFrom cannot be after dateTo', StatusCodes.BAD_REQUEST);
  }

  const filters = {
    employeeId,
    dateFrom: dateFrom ? new Date(dateFrom) : null,
    dateTo: dateTo ? new Date(dateTo) : null,
    status,
    claimType
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

export {
  generateUsersReport,
  generatePoliciesReport,
  generateClaimsReport,
  generateFinancialReport,
  generateCustomReport,
  getReportTemplates,
  scheduleReport,
  generateEmployeeClaimReport,
  generateEmployeeClaimsSummaryReport,
  generateEmployeePolicyReport
};