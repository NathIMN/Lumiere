import express from 'express';
import {
  generateUsersReport,
  generatePoliciesReport,
  generateClaimsReport,
  generateFinancialReport,
  generateCustomReport,
  getReportTemplates,
  scheduleReport
} from '../controllers/reports.js';

import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

/**
 * @route   GET /api/reports/templates
 * @desc    Get available report templates
 * @access  Admin, HR, Insurance Agent
 */
router.get('/templates', authenticate, authorize('admin', 'hr_officer', 'insurance_agent'), getReportTemplates);

/**
 * @route   GET /api/reports/users
 * @desc    Generate user profiles report
 * @access  Admin, HR
 * @params  ?role=admin&dateFrom=2024-01-01&dateTo=2024-12-31&department=HR&status=active&format=pdf
 */
router.get('/users', authenticate, authorize('admin', 'hr_officer'), generateUsersReport);

/**
 * @route   GET /api/reports/policies
 * @desc    Generate policies report
 * @access  Admin, HR, Insurance Agent
 * @params  ?policyType=life&status=active&dateFrom=2024-01-01&dateTo=2024-12-31&agent=60f7d123456789&premium_min=1000&premium_max=5000&format=pdf
 */
router.get('/policies', authenticate, authorize('admin', 'hr_officer', 'insurance_agent'), generatePoliciesReport);

/**
 * @route   GET /api/reports/claims
 * @desc    Generate claims report
 * @access  Admin, HR, Insurance Agent
 * @params  ?status=approved&claimType=vehicle&dateFrom=2024-01-01&dateTo=2024-12-31&agent=60f7d123456789&amount_min=500&amount_max=10000&format=pdf
 */
router.get('/claims', authenticate, authorize('admin', 'hr_officer', 'insurance_agent'), generateClaimsReport);

/**
 * @route   GET /api/reports/financial
 * @desc    Generate financial summary report
 * @access  Admin
 * @params  ?dateFrom=2024-01-01&dateTo=2024-12-31&period=monthly&format=pdf
 */
router.get('/financial', authenticate, authorize('admin'), generateFinancialReport);

/**
 * @route   POST /api/reports/custom
 * @desc    Generate custom report with specific parameters
 * @access  Admin
 * @body    { reportName, reportType, filters, columns, groupBy, sortBy, format }
 */
router.post('/custom', authenticate, authorize('admin'), generateCustomReport);

/**
 * @route   POST /api/reports/schedule
 * @desc    Schedule automatic report generation
 * @access  Admin
 * @body    { reportType, filters, schedule, recipients, format }
 */
router.post('/schedule', authenticate, authorize('admin'), scheduleReport);

export default router;