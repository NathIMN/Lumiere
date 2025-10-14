import puppeteer from 'puppeteer';
import handlebars from 'handlebars';
import fs from 'fs/promises';
import path from 'path';
import moment from 'moment';
import User from '../models/User.js';
import Policy from '../models/Policy.js';
import Claim from '../models/Claim.js';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class ReportsService {
  constructor() {
    this.templatePath = path.join(__dirname, '../templates');
    this.registerHandlebarsHelpers();
  }

  /**
   * Get report theme based on report type
   */
  getReportTheme(reportType = 'default') {
    const themes = {
      default: {
        primaryColor: '#2563eb',
        primaryDark: '#1e40af',
        secondaryColor: '#64748b',
        accentColor: '#059669',
        textColor: '#2c3e50',
        backgroundColor: '#ffffff',
        headerBackground: '#f8fafc',
        borderColor: '#e5e7eb',
        tableBorder: '#d1d5db',
        tableHeaderBackground: '#2563eb',
        tableHeaderBorder: '#1d4ed8'
      },
      users: {
        primaryColor: '#059669',
        primaryDark: '#047857',
        secondaryColor: '#6b7280',
        accentColor: '#2563eb',
        textColor: '#1f2937',
        backgroundColor: '#ffffff',
        headerBackground: '#f0fdf4',
        borderColor: '#d1fae5',
        tableBorder: '#a7f3d0',
        tableHeaderBackground: '#059669',
        tableHeaderBorder: '#047857'
      },
      policies: {
        primaryColor: '#7c3aed',
        primaryDark: '#5b21b6',
        secondaryColor: '#6b7280',
        accentColor: '#f59e0b',
        textColor: '#1f2937',
        backgroundColor: '#ffffff',
        headerBackground: '#faf5ff',
        borderColor: '#e9d5ff',
        tableBorder: '#c4b5fd',
        tableHeaderBackground: '#7c3aed',
        tableHeaderBorder: '#5b21b6'
      },
      claims: {
        primaryColor: '#dc2626',
        primaryDark: '#991b1b',
        secondaryColor: '#6b7280',
        accentColor: '#059669',
        textColor: '#1f2937',
        backgroundColor: '#ffffff',
        headerBackground: '#fef2f2',
        borderColor: '#fecaca',
        tableBorder: '#fca5a5',
        tableHeaderBackground: '#dc2626',
        tableHeaderBorder: '#991b1b'
      },
      financial: {
        primaryColor: '#f59e0b',
        primaryDark: '#d97706',
        secondaryColor: '#6b7280',
        accentColor: '#2563eb',
        textColor: '#1f2937',
        backgroundColor: '#ffffff',
        headerBackground: '#fffbeb',
        borderColor: '#fed7aa',
        tableBorder: '#fdba74',
        tableHeaderBackground: '#f59e0b',
        tableHeaderBorder: '#d97706'
      }
    };

    return themes[reportType] || themes.default;
  }

  /**
   * Register Handlebars helper functions
   */
  registerHandlebarsHelpers() {
    handlebars.registerHelper('formatDate', (date) => {
      if (!date || date === 'Never' || date === null || date === undefined) {
        return 'Never';
      }
      
      // Check if it's a valid date
      const dateObj = new Date(date);
      if (isNaN(dateObj.getTime())) {
        return 'Invalid Date';
      }
      
      return moment(date).format('MMM DD, YYYY');
    });

    handlebars.registerHelper('formatDateTime', (date) => {
      if (!date || date === 'Never' || date === null || date === undefined) {
        return 'Never';
      }
      
      const dateObj = new Date(date);
      if (isNaN(dateObj.getTime())) {
        return 'Invalid Date';
      }
      
      return moment(date).format('MMM DD, YYYY [at] h:mm A');
    });

    handlebars.registerHelper('formatCurrency', (amount) => {
      return new Intl.NumberFormat('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).format(amount || 0);
    });

    handlebars.registerHelper('eq', (a, b) => a === b);
    handlebars.registerHelper('gt', (a, b) => a > b);
    handlebars.registerHelper('lt', (a, b) => a < b);
    handlebars.registerHelper('and', function() {
      return Array.prototype.slice.call(arguments, 0, -1).every(Boolean);
    });
    handlebars.registerHelper('isEmployeeReport', function(filters) {
      //console.log('Filters in isEmployeeReport helper:', filters);
      return filters && filters.role === 'employee';
    });
  }

  /**
   * Load company logo as base64
   */
async loadLogo() {
  try {
    const logoPath = path.join(__dirname, '../public/lum2.png');
    const logoContent = await fs.readFile(logoPath);
    const base64Image = logoContent.toString('base64');
    // Return with correct MIME type for PNG
    return `data:image/png;base64,${base64Image}`;
  } catch (error) {
    console.warn('Logo file not found, proceeding without logo');
    return '';
  }
}

  /**
   * Load and compile Handlebars template
   */
  async loadTemplate(templateName) {
    try {
      const templatePath = path.join(this.templatePath, `${templateName}.hbs`);
      const templateContent = await fs.readFile(templatePath, 'utf-8');
      return handlebars.compile(templateContent);
    } catch (error) {
      console.error(`Error loading template ${templateName}:`, error);
      throw new Error(`Template ${templateName} not found`);
    }
  }

  /**
   * Generate PDF from HTML content
   */
  async generatePDF(htmlContent, options = {}) {
    let browser;
    try {
      browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });

      const page = await browser.newPage();
      
      // Set viewport to ensure consistent rendering
      await page.setViewport({
        width: 1200,
        height: 800,
        deviceScaleFactor: 1
      });
      
      await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

      const pdfOptions = {
        format: 'A4',
        printBackground: true,
        preferCSSPageSize: false,
        displayHeaderFooter: false,
        margin: {
          top: '15px',
          right: '15px',
          bottom: '15px',
          left: '15px'
        },
        // Optimize for large tables
        pageRanges: '',
        ...options
      };

      const pdfBuffer = await page.pdf(pdfOptions);
      return pdfBuffer;
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw new Error('PDF generation failed');
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }

  /**
   * Generate Users Report Data
   */
  async generateUsersReport(filters = {}) {
    try {
      // Build query based on filters
      let query = {};

      if (filters.role) {
        query.role = filters.role;
      }

      if (filters.status) {
        query.status = filters.status;
      }

      if (filters.department) {
        query['employment.department'] = filters.department;
      }

      if (filters.dateFrom && filters.dateTo) {
        query.createdAt = {
          $gte: filters.dateFrom,
          $lte: filters.dateTo
        };
      }

      console.log('Query:', JSON.stringify(query, null, 2));

      const users = await User.find(query)
        .select('-password')
        .sort({ createdAt: -1 })
        .lean();

      console.log('Total users found:', users.length);
      console.log('Sample user:', users[0] ? {
        department: users[0].employment?.department,
        status: users[0].status
      } : 'No users');

      // Generate summary statistics for ALL statuses
      const totalUsers = users.length;
      const activeUsers = users.filter(user => user.status === 'active').length;
      const inactiveUsers = users.filter(user => user.status === 'inactive').length;
      const suspendedUsers = users.filter(user => user.status === 'suspended').length;
      const terminatedUsers = users.filter(user => user.status === 'terminated').length;

      // Group by role
      const usersByRole = users.reduce((acc, user) => {
        acc[user.role] = (acc[user.role] || 0) + 1;
        return acc;
      }, {});

      // ✅ FIXED: Group by department with proper status tracking
      const usersByDepartment = users.reduce((acc, user) => {
        // Get the department name (or 'Unassigned' if missing)
        const dept = user.employment?.department || 'Unassigned';
        
        // Initialize department object if it doesn't exist
        if (!acc[dept]) {
          acc[dept] = { 
            active: 0, 
            inactive: 0, 
            suspended: 0, 
            terminated: 0, 
            total: 0 
          };
        }
        
        // Get user's status (default to 'inactive' if missing)
        const status = user.status || 'inactive';
        
        // Increment the appropriate status counter
        if (status === 'active') {
          acc[dept].active++;
        } else if (status === 'inactive') {
          acc[dept].inactive++;
        } else if (status === 'suspended') {
          acc[dept].suspended++;
        } else if (status === 'terminated') {
          acc[dept].terminated++;
        }
        
        // Always increment total
        acc[dept].total++;
        
        return acc;
      }, {});

      console.log('Users by department:', JSON.stringify(usersByDepartment, null, 2));

      return {
        users: users.map(user => ({
          userId: user.userId || user._id.toString().slice(-6).toUpperCase(),
          fullName: `${user.profile?.firstName || 'N/A'} ${user.profile?.lastName || 'N/A'}`,
          email: user.email || 'N/A',
          role: (user.role || 'user').replace('_', ' ').toUpperCase(),
          department: user.employment?.department || 'Unassigned',
          designation: user.employment?.designation || 'N/A',
          hireDate: user.employment?.joinDate || user.createdAt,
          status: user.status || 'unknown',
          lastLogin: user.lastLogin || null
        })),
        summary: {
          totalUsers,
          activeUsers,
          inactiveUsers,
          suspendedUsers,
          terminatedUsers,
          activePercentage: totalUsers > 0 ? ((activeUsers / totalUsers) * 100).toFixed(1) : 0
        },
        usersByRole: Object.entries(usersByRole).map(([role, count]) => ({
          role: role.replace('_', ' ').toUpperCase(),
          count,
          percentage: totalUsers > 0 ? ((count / totalUsers) * 100).toFixed(1) : 0
        })),
        // ✅ FIXED: Return proper department data with all status counts
        usersByDepartment: Object.entries(usersByDepartment).map(([department, data]) => ({
          department,
          activeCount: data.active,
          inactiveCount: data.inactive,
          suspendedCount: data.suspended,
          terminatedCount: data.terminated,
          totalCount: data.total,
          // Calculate percentage of total users in this department
          percentage: totalUsers > 0 ? ((data.total / totalUsers) * 100).toFixed(1) : '0.0'
        }))
      };
    } catch (error) {
      console.error('Error generating users report:', error);
      throw new Error('Failed to generate users report');
    }
  }

  /**
   * Generate Users PDF Report
   */
  async generateUsersPDF(reportData, filters) {
    try {
      const baseTemplate = await this.loadTemplate('base');
      const contentTemplate = await this.loadTemplate('users-report');
      const logoBase64 = await this.loadLogo();

      const templateData = {
        reportTitle: 'User Profiles Report',
        reportSubtitle: 'Comprehensive overview of system users and their profiles',
        generatedBy: 'System Administrator',
        generatedDate: moment().format('MMMM DD, YYYY'),
        reportPeriod: filters.dateFrom && filters.dateTo ? 
          `${moment(filters.dateFrom).format('MMM DD, YYYY')} - ${moment(filters.dateTo).format('MMM DD, YYYY')}` : 
          'All Time',
        totalRecords: reportData.users.length,
        reportType: 'Users',
        currentYear: new Date().getFullYear(),
        timestamp: moment().format('MMMM DD, YYYY [at] h:mm A'),
        logoBase64: logoBase64,
        theme: this.getReportTheme('users'),
        filters: filters, // ✅ ADD THIS LINE - Pass filters to template
        summary: [
          { label: 'Total Users', value: reportData.summary.totalUsers },
          { label: 'Active Users', value: reportData.summary.activeUsers },
          { label: 'Inactive Users', value: reportData.summary.inactiveUsers },
          { label: 'Active Percentage', value: `${reportData.summary.activePercentage}%` }
        ],
        ...reportData
      };

      // Register the content partial
      handlebars.registerPartial('content', contentTemplate);

      const html = baseTemplate(templateData);
      return await this.generatePDF(html);
    } catch (error) {
      console.error('Error generating users PDF:', error);
      throw new Error('Failed to generate users PDF report');
    }
  }

  /**
   * Generate Policies Report Data
   */
  async generatePoliciesReport(filters = {}, generatedBy = null) {
    try {
      let query = {};

      if (filters.policyType) {
        query.policyType = filters.policyType;
      }

      if (filters.status) {
        query.status = filters.status;
      }

      if (filters.agent) {
        query.assignedAgent = filters.agent;
      }

      if (filters.dateFrom && filters.dateTo) {
         console.log('Date filters:', filters.dateFrom, filters.dateTo);
        query.createdAt = {
          $gte: filters.dateFrom,
          $lte: filters.dateTo
        };
      }

      if (filters.premium_min || filters.premium_max) {
        query['premium.amount'] = {};
        if (filters.premium_min) query['premium.amount'].$gte = filters.premium_min;
        if (filters.premium_max) query['premium.amount'].$lte = filters.premium_max;
      }

      const policies = await Policy.find(query)
        .populate('insuranceAgent', 'profile.firstName profile.lastName email')
        .populate('beneficiaries', 'profile.firstName profile.lastName')
        .sort({ createdAt: -1 })
        .lean();

      // Generate statistics
      const totalPolicies = policies.length;
      const activePolicies = policies.filter(p => p.status === 'active').length;
      const totalPremium = policies.reduce((sum, p) => sum + (p.premium?.amount || 0), 0);
      const avgPremium = totalPolicies > 0 ? totalPremium / totalPolicies : 0;

      // Group by policy type
      const policyStats = policies.reduce((acc, policy) => {
        const type = policy.policyType;
        if (!acc[type]) {
          acc[type] = {
            policyType: type,
            activePolicies: 0,
            totalPremium: 0,
            count: 0
          };
        }
        if (policy.status === 'active') acc[type].activePolicies++;
        acc[type].totalPremium += policy.premium?.amount || 0;
        acc[type].count++;
        return acc;
      }, {});

      return {
        policies: policies.map(policy => ({
          policyNumber: policy.policyId || policy._id.toString().slice(-8).toUpperCase(),
          policyType: policy.policyType,
          beneficiariesCount: policy.beneficiaries?.length || 0,
          premiumAmount: policy.premium?.amount || 0,
          startDate: policy.validity?.startDate,
          endDate: policy.validity?.endDate,
          status: policy.status,
          agentName: policy.insuranceAgent ? 
            `${policy.insuranceAgent.profile?.firstName || 'N/A'} ${policy.insuranceAgent.profile?.lastName || 'N/A'}` : 'Unassigned'
        })),
        summary: {
          totalPolicies,
          activePolicies,
          totalPremium,
          avgPremium
        },
        policyStats: Object.values(policyStats).map(stat => ({
          ...stat,
          averagePremium: stat.count > 0 ? stat.totalPremium / stat.count : 0,
          renewalRate: 85 // This would come from actual renewal data
        }))
      };
    } catch (error) {
      console.error('Error generating policies report:', error);
      throw new Error('Failed to generate policies report');
    }
  }

  /**
   * Generate Policies PDF Report
   */
  async generatePoliciesPDF(reportData, filters, generatedBy = null) {
    try {
      const baseTemplate = await this.loadTemplate('base');
      const contentTemplate = await this.loadTemplate('policies-report');
      const logoBase64 = await this.loadLogo();

      const templateData = {
        reportTitle: 'Policies Report',
        reportSubtitle: 'Comprehensive overview of insurance policies',
        generatedBy: generatedBy || 'System Administrator',
        generatedDate: moment().format('MMMM DD, YYYY'),
        reportPeriod: filters.dateFrom && filters.dateTo ? 
          `${moment(filters.dateFrom).format('MMM DD, YYYY')} - ${moment(filters.dateTo).format('MMM DD, YYYY')}` : 
          'All Time',
        totalRecords: reportData.policies.length,
        reportType: 'Policies',
        currentYear: new Date().getFullYear(),
        timestamp: moment().format('MMMM DD, YYYY [at] h:mm A'),
        logoBase64: logoBase64,
        theme: this.getReportTheme('policies'),
        summary: [
          { label: 'Total Policies', value: reportData.summary.totalPolicies },
          { label: 'Active Policies', value: reportData.summary.activePolicies },
          { label: 'Total Premium', value: `$${reportData.summary.totalPremium.toLocaleString()}` },
          { label: 'Average Premium', value: `$${reportData.summary.avgPremium.toFixed(2)}` }
        ],
        ...reportData
      };

      handlebars.registerPartial('content', contentTemplate);
      const html = baseTemplate(templateData);
      return await this.generatePDF(html);
    } catch (error) {
      console.error('Error generating policies PDF:', error);
      throw new Error('Failed to generate policies PDF report');
    }
  }

  /**
   * Generate Claims Report Data
   */
  async generateClaimsReport(filters = {}, generatedBy = null) {
    try {
      let query = {};

      if (filters.status) {
        query.status = filters.status;
      }

      // If hrOnly filter is specified, only include claims with HR status
      if (filters.hrOnly === true || filters.hrOnly === 'true') {
        query.claimStatus = 'hr';
      } else if (filters.claimStatus) {
        query.claimStatus = filters.claimStatus;
      }

      if (filters.claimType) {
        query.claimType = filters.claimType;
      }

      if (filters.agent) {
        query.assignedAgent = filters.agent;
      }

      if (filters.dateFrom && filters.dateTo) {
        query.createdAt = {
          $gte: filters.dateFrom,
          $lte: filters.dateTo
        };
      }

      if (filters.amount_min || filters.amount_max) {
        query['claimAmount.requested'] = {};
        if (filters.amount_min) query['claimAmount.requested'].$gte = filters.amount_min;
        if (filters.amount_max) query['claimAmount.requested'].$lte = filters.amount_max;
      }

      const claims = await Claim.find(query)
        .populate('policy', 'policyId')
        .populate('employeeId', 'profile.firstName profile.lastName email')
        .populate('decision.decidedBy', 'profile.firstName profile.lastName')
        .sort({ createdAt: -1 })
        .lean();

      // Generate statistics
      const totalClaims = claims.length;
      const approvedClaims = claims.filter(c => c.claimStatus === 'approved').length;
      const totalAmount = claims.reduce((sum, c) => sum + (c.claimAmount?.requested || 0), 0);
      const avgSettlement = approvedClaims > 0 ? 
        claims.filter(c => c.claimStatus === 'approved').reduce((sum, c) => sum + (c.claimAmount?.approved || 0), 0) / approvedClaims : 0;

      return {
        claims: claims.map(claim => ({
          claimNumber: claim.claimId || claim._id.toString().slice(-8).toUpperCase(),
          policyNumber: claim.policy?.policyId || 'N/A',
          claimantName: claim.employeeId ? 
            `${claim.employeeId.profile?.firstName || 'N/A'} ${claim.employeeId.profile?.lastName || 'N/A'}` : 'N/A',
          claimType: claim.claimType || 'General',
          claimAmount: claim.claimAmount?.requested || 0,
          dateFiled: claim.createdAt,
          status: claim.claimStatus,
          agentName: claim.decision?.decidedBy ? 
            `${claim.decision.decidedBy.profile?.firstName || 'N/A'} ${claim.decision.decidedBy.profile?.lastName || 'N/A'}` : 'Unassigned',
          settlementDate: claim.settlementDate
        })),
        summary: {
          totalClaims,
          approvedClaims,
          totalAmount,
          avgSettlement,
          approvalRate: totalClaims > 0 ? ((approvedClaims / totalClaims) * 100).toFixed(1) : 0
        }
      };
    } catch (error) {
      console.error('Error generating claims report:', error);
      throw new Error('Failed to generate claims report');
    }
  }

  /**
   * Generate Claims PDF Report
   */
  async generateClaimsPDF(reportData, filters, generatedBy = null) {
    try {
      const baseTemplate = await this.loadTemplate('base');
      const contentTemplate = await this.loadTemplate('claims-report');
      const logoBase64 = await this.loadLogo();

      const reportSubtitle = filters.hrOnly === true || filters.hrOnly === 'true' ? 
        'HR Claims Report - Claims Pending HR Review' : 
        'Comprehensive overview of insurance claims';

      const templateData = {
        reportTitle: 'Claims Report',
        reportSubtitle: reportSubtitle,
        generatedBy: generatedBy || 'System Administrator',
        generatedDate: moment().format('MMMM DD, YYYY'),
        reportPeriod: filters.dateFrom && filters.dateTo ? 
          `${moment(filters.dateFrom).format('MMM DD, YYYY')} - ${moment(filters.dateTo).format('MMM DD, YYYY')}` : 
          'All Time',
        totalRecords: reportData.claims.length,
        reportType: 'Claims',
        currentYear: new Date().getFullYear(),
        timestamp: moment().format('MMMM DD, YYYY [at] h:mm A'),
        logoBase64: logoBase64,
        theme: this.getReportTheme('claims'),
        summary: [
          { label: 'Total Claims', value: reportData.summary.totalClaims },
          { label: 'Approved Claims', value: reportData.summary.approvedClaims },
          { label: 'Total Amount', value: `$${reportData.summary.totalAmount.toLocaleString()}` },
          { label: 'Approval Rate', value: `${reportData.summary.approvalRate}%` }
        ],
        ...reportData
      };

      handlebars.registerPartial('content', contentTemplate);
      const html = baseTemplate(templateData);
      return await this.generatePDF(html);
    } catch (error) {
      console.error('Error generating claims PDF:', error);
      throw new Error('Failed to generate claims PDF report');
    }
  }

  /**
   * Generate Financial Report Data
   */
  async generateFinancialReport(filters = {}, generatedBy = null) {
    try {
      // This would integrate with actual financial data
      // For now, generating sample data structure

      const reportData = {
        totalPremiumRevenue: 2500000,
        totalClaimsPaid: 1800000,
        netProfit: 700000,
        profitMargin: 28.0,
        revenueBreakdown: [
          { category: 'Life Insurance', amount: 1200000, percentage: 48, changeFromPrevious: 12 },
          { category: 'Vehicle Insurance', amount: 800000, percentage: 32, changeFromPrevious: 8 },
          { category: 'Health Insurance', amount: 500000, percentage: 20, changeFromPrevious: -5 }
        ]
      };

      return reportData;
    } catch (error) {
      console.error('Error generating financial report:', error);
      throw new Error('Failed to generate financial report');
    }
  }

  /**
   * Generate Financial PDF Report
   */
  async generateFinancialPDF(reportData, filters, generatedBy = null) {
    try {
      const baseTemplate = await this.loadTemplate('base');
      const contentTemplate = await this.loadTemplate('financial-report');
      const logoBase64 = await this.loadLogo();

      const templateData = {
        reportTitle: 'Financial Report',
        reportSubtitle: 'Comprehensive financial performance overview',
        generatedBy: generatedBy || 'System Administrator',
        generatedDate: moment().format('MMMM DD, YYYY'),
        reportPeriod: filters.dateFrom && filters.dateTo ? 
          `${moment(filters.dateFrom).format('MMM DD, YYYY')} - ${moment(filters.dateTo).format('MMM DD, YYYY')}` : 
          'All Time',
        totalRecords: 'Financial Summary',
        reportType: 'Financial',
        currentYear: new Date().getFullYear(),
        timestamp: moment().format('MMMM DD, YYYY [at] h:mm A'),
        logoBase64: logoBase64,
        theme: this.getReportTheme('financial'),
        summary: [
          { label: 'Total Revenue', value: `$${reportData.totalPremiumRevenue.toLocaleString()}` },
          { label: 'Claims Paid', value: `$${reportData.totalClaimsPaid.toLocaleString()}` },
          { label: 'Net Profit', value: `$${reportData.netProfit.toLocaleString()}` },
          { label: 'Profit Margin', value: `${reportData.profitMargin}%` }
        ],
        ...reportData
      };

      handlebars.registerPartial('content', contentTemplate);
      const html = baseTemplate(templateData);
      return await this.generatePDF(html);
    } catch (error) {
      console.error('Error generating financial PDF:', error);
      throw new Error('Failed to generate financial PDF report');
    }
  }

  /**
   * Generate Policy Users Report Data
   */
  async generatePolicyUsersReport(filters = {}, generatedBy = null) {
    try {
      if (!filters.policyId) {
        throw new Error('Policy ID is required for policy users report');
      }

      // Get the specific policy with all its beneficiaries
      const policy = await Policy.findById(filters.policyId)
        .populate('beneficiaries', 'profile.firstName profile.lastName email phoneNumber address dateOfBirth gender employeeId')
        .populate('insuranceAgent', 'profile.firstName profile.lastName email')
        .lean();

      if (!policy) {
        throw new Error('Policy not found');
      }

      console.log('Policy data for report:', JSON.stringify(policy, null, 2));

      // Format the policy data
      const formattedPolicy = {
        policyId: policy.policyId,
        policyType: policy.policyType,
        policyCategory: policy.policyCategory,
        status: policy.status,
        startDate: policy.validity?.startDate,
        endDate: policy.validity?.endDate,
        premium: {
          amount: policy.premium?.amount || 0,
          frequency: policy.premium?.frequency || 'N/A'
        },
        coverage: {
          amount: policy.coverage?.coverageAmount || 0,
          deductible: policy.coverage?.deductible || 0
        },
        agent: policy.insuranceAgent ? {
          name: `${policy.insuranceAgent.profile?.firstName || 'N/A'} ${policy.insuranceAgent.profile?.lastName || 'N/A'}`,
          email: policy.insuranceAgent.email
        } : null
      };

      // Format beneficiaries data (these are the "users" of the policy)
      const beneficiaries = policy.beneficiaries?.map(beneficiary => ({
        beneficiaryId: beneficiary._id,
        name: `${beneficiary.profile?.firstName || 'N/A'} ${beneficiary.profile?.lastName || 'N/A'}`,
        email: beneficiary.email,
        employeeId: beneficiary.employeeId,
        phoneNumber: beneficiary.profile?.phoneNumber || 'N/A',
        address: beneficiary.profile?.address || 'N/A',
        dateOfBirth: beneficiary.profile?.dateOfBirth,
        gender: beneficiary.profile?.gender || 'N/A'
      })) || [];

      return {
        policy: formattedPolicy,
        beneficiaries,
        summary: {
          totalBeneficiaries: beneficiaries.length,
          totalCoverage: policy.coverage?.coverageAmount || 0
        }
      };
    } catch (error) {
      console.error('Error generating policy users report:', error);
      throw new Error('Failed to generate policy users report');
    }
  }

  /**
   * Generate Policy Users PDF Report
   */
  async generatePolicyUsersPDF(reportData, filters, generatedBy = null) {
    try {
      const baseTemplate = await this.loadTemplate('base');
      const contentTemplate = await this.loadTemplate('employee-policy-report');
      const logoBase64 = await this.loadLogo();

      // Transform data to match the employee-policy-report template structure
      const transformedPolicy = {
        policyId: reportData.policy.policyId,
        policyType: reportData.policy.policyType?.toUpperCase() || 'N/A',
        status: reportData.policy.status?.toUpperCase() || 'N/A',
        coverageAmount: reportData.policy.coverage?.amount || 0,
        premiumAmount: reportData.policy.premium?.amount || 0,
        premiumFrequency: reportData.policy.premium?.frequency || 'N/A',
        startDate: reportData.policy.startDate,
        endDate: reportData.policy.endDate,
        agentName: reportData.policy.agent?.name || 'N/A',
        beneficiaries: reportData.beneficiaries.map(ben => ({
          name: ben.name,
          relationship: 'Beneficiary', // Default since we don't have relationship data
          contact: ben.email,
          percentage: reportData.beneficiaries.length > 1 ? 
            `${Math.round(100 / reportData.beneficiaries.length)}` : '100'
        }))
      };

      const templateData = {
        reportTitle: 'Policy Beneficiaries Report',
        reportSubtitle: `Beneficiaries for Policy ${reportData.policy.policyId}`,
        generatedBy: generatedBy || 'System Administrator',
        generatedDate: moment().format('MMMM DD, YYYY'),
        reportPeriod: 'Current Policy Status',
        totalRecords: reportData.beneficiaries.length,
        reportType: 'Policy Beneficiaries',
        currentYear: new Date().getFullYear(),
        timestamp: moment().format('MMMM DD, YYYY [at] h:mm A'),
        logoBase64: logoBase64,
        theme: this.getReportTheme('policies'),
        summary: [
          { label: 'Policy ID', value: reportData.policy.policyId },
          { label: 'Policy Type', value: reportData.policy.policyType?.toUpperCase() || 'N/A' },
          { label: 'Status', value: reportData.policy.status?.toUpperCase() || 'N/A' },
          { label: 'Total Beneficiaries', value: reportData.summary.totalBeneficiaries },
          { label: 'Coverage Amount', value: `$${reportData.summary.totalCoverage.toLocaleString()}` },
          { label: 'Premium Amount', value: `$${(reportData.policy.premium?.amount || 0).toLocaleString()}` }
        ],
        policy: transformedPolicy
      };

      handlebars.registerPartial('content', contentTemplate);
      const html = baseTemplate(templateData);
      return await this.generatePDF(html);
    } catch (error) {
      console.error('Error generating policy users PDF:', error);
      throw new Error('Failed to generate policy users PDF report');
    }
  }

  /**
   * Generate Custom Report
   */
  async generateCustomReport(config) {
    try {
      // Route to appropriate report generator based on type
      switch (config.reportType) {
        case 'users':
          return await this.generateUsersReport(config.filters);
        case 'policies':
          return await this.generatePoliciesReport(config.filters);
        case 'claims':
          return await this.generateClaimsReport(config.filters);
        case 'financial':
          return await this.generateFinancialReport(config.filters);
        case 'policy-users':
          return await this.generatePolicyUsersReport(config.filters);
        default:
          throw new Error('Invalid report type');
      }
    } catch (error) {
      console.error('Error generating custom report:', error);
      throw new Error('Failed to generate custom report');
    }
  }

  /**
   * Generate Custom PDF Report
   */
  async generateCustomPDF(reportData, config) {
    try {
      // Route to appropriate PDF generator based on type
      switch (config.reportType) {
        case 'users':
          return await this.generateUsersPDF(reportData, config.filters);
        case 'policies':
          return await this.generatePoliciesPDF(reportData, config.filters);
        case 'claims':
          return await this.generateClaimsPDF(reportData, config.filters);
        case 'financial':
          return await this.generateFinancialPDF(reportData, config.filters);
        case 'policy-users':
          return await this.generatePolicyUsersPDF(reportData, config.filters);
        default:
          throw new Error('Invalid report type for PDF generation');
      }
    } catch (error) {
      console.error('Error generating custom PDF:', error);
      throw new Error('Failed to generate custom PDF report');
    }
  }

  /**
   * Get Available Report Templates
   */
  async getAvailableTemplates() {
    return [
      {
        id: 'users',
        name: 'User Profiles Report',
        description: 'Comprehensive overview of system users and their profiles',
        category: 'User Management',
        filters: ['role', 'department', 'status', 'dateRange']
      },
      {
        id: 'policies',
        name: 'Policies Report',
        description: 'Detailed analysis of insurance policies',
        category: 'Policy Management',
        filters: ['policyType', 'status', 'agent', 'premiumRange', 'dateRange']
      },
      {
        id: 'claims',
        name: 'Claims Report',
        description: 'Comprehensive claims analysis and statistics',
        category: 'Claims Management',
        filters: ['status', 'claimType', 'agent', 'amountRange', 'dateRange']
      },
      {
        id: 'financial',
        name: 'Financial Report',
        description: 'Financial performance and revenue analysis',
        category: 'Financial Analysis',
        filters: ['period', 'dateRange']
      }
    ];
  }

  /**
   * Build filters list for display
   */
  buildFiltersList(filters) {
    const filtersList = [];
    
    if (filters.role) filtersList.push(`Role: ${filters.role}`);
    if (filters.status) filtersList.push(`Status: ${filters.status}`);
    if (filters.department) filtersList.push(`Department: ${filters.department}`);
    if (filters.policyType) filtersList.push(`Policy Type: ${filters.policyType}`);
    if (filters.claimType) filtersList.push(`Claim Type: ${filters.claimType}`);
    if (filters.agent) filtersList.push(`Agent: ${filters.agent}`);
    if (filters.dateFrom && filters.dateTo) {
      filtersList.push(`Date Range: ${moment(filters.dateFrom).format('MMM DD, YYYY')} - ${moment(filters.dateTo).format('MMM DD, YYYY')}`);
    }

    return filtersList.length > 0 ? filtersList : ['No filters applied'];
  }

  /**
   * Generate Employee Individual Claim Report Data
   */
  async generateEmployeeClaimReport(claimId, employeeId) {
    try {
      console.log('Looking for claim:', claimId, 'for employee:', employeeId);
      
      // Try multiple approaches to find the claim
      let claim = await Claim.findOne({
        claimId: claimId,
        employeeId: employeeId
      })
      .populate('policy', 'policyId')
      .populate('employeeId', 'profile.firstName profile.lastName email')
      .populate('decision.decidedBy', 'profile.firstName profile.lastName')
      .populate('documents')
      .lean();

      // If not found by claimId, try by _id in case claimId is actually the mongo _id
      if (!claim) {
        console.log('Not found by claimId, trying by _id');
        try {
          claim = await Claim.findOne({
            _id: claimId,
            employeeId: employeeId
          })
          .populate('policy', 'policyId')
          .populate('employeeId', 'profile.firstName profile.lastName email')
          .populate('decision.decidedBy', 'profile.firstName profile.lastName')
          .populate('documents')
          .lean();
        } catch (idError) {
          console.log('_id lookup failed:', idError.message);
        }
      }

      // If still not found, try without employee restriction to see if claim exists at all
      if (!claim) {
        console.log('Claim not found with employee restriction, checking if claim exists');
        const claimExists = await Claim.findOne({ claimId: claimId }).lean();
        if (claimExists) {
          console.log('Claim exists but employee mismatch:', claimExists.employeeId, 'vs', employeeId);
        } else {
          console.log('Claim does not exist with claimId:', claimId);
        }
      }

      if (!claim) {
        throw new Error('Claim not found or access denied');
      }

      console.log('Found claim:', claim._id);

      // Format the claim data for the report
      const reportData = {
        claim: {
          claimId: claim.claimId || claim._id.toString().slice(-8).toUpperCase(),
          policyId: claim.policy?.policyId || 'N/A',
          claimType: claim.claimType || 'General',
          claimOption: claim.claimOption || claim.lifeClaimOption || claim.vehicleClaimOption || 'N/A',
          incidentDate: claim.incidentDate,
          submissionDate: claim.createdAt,
          status: claim.claimStatus,
          requestedAmount: claim.claimAmount?.requested || 0,
          approvedAmount: claim.claimAmount?.approved || null,
          description: claim.incidentDescription || claim.description,
          decision: claim.decision ? {
            status: claim.decision.status,
            date: claim.decision.decidedAt,
            decidedBy: claim.decision.decidedBy ? 
              `${claim.decision.decidedBy.profile?.firstName || 'N/A'} ${claim.decision.decidedBy.profile?.lastName || 'N/A'}` : 'N/A',
            reason: claim.decision.reason
          } : null,
          documents: claim.documents ? claim.documents.map(doc => ({
            documentType: doc.documentType || 'General',
            fileName: doc.originalName || doc.filename || 'N/A',
            uploadDate: doc.uploadDate || doc.createdAt,
            status: doc.status || 'active'
          })) : [],
          timeline: this.buildClaimTimeline(claim)
        },
        employee: {
          name: claim.employeeId ? 
            `${claim.employeeId.profile?.firstName || 'N/A'} ${claim.employeeId.profile?.lastName || 'N/A'}` : 'N/A',
          email: claim.employeeId?.email || 'N/A'
        }
      };

      return reportData;
    } catch (error) {
      console.error('Error generating employee claim report:', error);
      throw new Error('Failed to generate employee claim report');
    }
  }

  /**
   * Build claim timeline from claim data
   */
  buildClaimTimeline(claim) {
    const timeline = [];
    
    timeline.push({
      date: claim.createdAt,
      status: 'submitted',
      action: 'Claim Submitted',
      notes: 'Initial claim submission by employee'
    });

    if (claim.decision?.decidedAt) {
      timeline.push({
        date: claim.decision.decidedAt,
        status: claim.decision.status,
        action: `Claim ${claim.decision.status}`,
        notes: claim.decision.reason || 'Decision made by reviewer'
      });
    }

    if (claim.settlementDate) {
      timeline.push({
        date: claim.settlementDate,
        status: 'settled',
        action: 'Claim Settled',
        notes: 'Payment processed and claim closed'
      });
    }

    return timeline.sort((a, b) => new Date(a.date) - new Date(b.date));
  }

  /**
   * Generate Employee Individual Claim PDF Report
   */
  async generateEmployeeClaimPDF(reportData) {
    try {
      const baseTemplate = await this.loadTemplate('base');
      const contentTemplate = await this.loadTemplate('employee-claim-report');
      const logoBase64 = await this.loadLogo();

      const templateData = {
        reportTitle: 'Individual Claim Report',
        reportSubtitle: `Detailed report for claim ${reportData.claim.claimId}`,
        generatedBy: reportData.employee.name,
        generatedDate: moment().format('MMMM DD, YYYY'),
        reportPeriod: 'Individual Claim',
        totalRecords: 1,
        reportType: 'Individual Claim',
        currentYear: new Date().getFullYear(),
        timestamp: moment().format('MMMM DD, YYYY [at] h:mm A'),
        logoBase64: logoBase64,
        theme: this.getReportTheme('default'),
        ...reportData
      };

      handlebars.registerPartial('content', contentTemplate);
      const html = baseTemplate(templateData);
      return await this.generatePDF(html);
    } catch (error) {
      console.error('Error generating employee claim PDF:', error);
      throw new Error('Failed to generate employee claim PDF report');
    }
  }

  /**
   * Generate Employee Claims Summary Report Data
   */
  async generateEmployeeClaimsSummaryReport(filters) {
  try {
    let query = { employeeId: filters.employeeId };

    console.log('generateEmployeeClaimsSummaryReport called with filters:', filters);
    console.log('Initial employeeId query:', query);

    // Add status filter
    if (filters.status) {
      query.claimStatus = filters.status;
    }

    // Add claim type filter
    if (filters.claimType) {
      query.claimType = filters.claimType;
    }

    // Add claim option filter
    if (filters.claimOption) {
      query.$or = [
        { claimOption: filters.claimOption },
        { lifeClaimOption: filters.claimOption },
        { vehicleClaimOption: filters.claimOption }
      ];
    }

    // Add search filter
    if (filters.search) {
      query.claimId = { $regex: filters.search, $options: 'i' };
    }

    // Add date range filter
    if (filters.dateFrom && filters.dateTo) {
      query.createdAt = {
        $gte: filters.dateFrom,
        $lte: filters.dateTo
      };
    }

    console.log('Final MongoDB query:', query);

    // Fetch claims with policy population
    const claims = await Claim.find(query)
      .populate('policy', 'policyId policyType status coverage premium validity insuranceAgent')
      .populate({
        path: 'policy',
        populate: {
          path: 'insuranceAgent',
          select: 'profile.firstName profile.lastName email'
        }
      })
      .populate('employeeId', 'profile.firstName profile.lastName email')
      .sort({ createdAt: -1 })
      .lean();

    console.log('Found claims count:', claims.length);

    // Get employee details
    const employeeDetails = await this.getEmployeeDetails(filters.employeeId);
    console.log('Employee details fetched:', employeeDetails.fullName);

    // Get unique policies from claims
    const uniquePolicyIds = [...new Set(claims.map(c => c.policy?._id?.toString()).filter(Boolean))];
    console.log('Unique policies found:', uniquePolicyIds.length);

    // Fetch detailed policy information
    const policies = await Policy.find({ _id: { $in: uniquePolicyIds } })
      .populate('insuranceAgent', 'profile.firstName profile.lastName email')
      .lean();

    // Format policies data
    const policiesData = policies.map(policy => ({
      policyId: policy.policyId || policy._id.toString().slice(-8).toUpperCase(),
      policyType: policy.policyType?.toUpperCase() || 'N/A',
      status: policy.status?.toUpperCase() || 'N/A',
      coverageAmount: policy.coverage?.coverageAmount || 0,
      premiumAmount: policy.premium?.amount || 0,
      premiumFrequency: policy.premium?.frequency || 'N/A',
      startDate: policy.validity?.startDate,
      endDate: policy.validity?.endDate,
      agentName: policy.insuranceAgent ? 
        `${policy.insuranceAgent.profile?.firstName || 'N/A'} ${policy.insuranceAgent.profile?.lastName || 'N/A'}` : 
        'Unassigned',
      claimsCount: claims.filter(c => c.policy?._id?.toString() === policy._id.toString()).length
    }));

    // Generate statistics
    const totalClaims = claims.length;
    const approvedClaims = claims.filter(c => c.claimStatus === 'approved').length;
    const rejectedClaims = claims.filter(c => c.claimStatus === 'rejected').length;
    const pendingClaims = claims.filter(c => ['hr', 'insurer', 'employee'].includes(c.claimStatus)).length;
    const totalRequested = claims.reduce((sum, c) => sum + (c.claimAmount?.requested || 0), 0);
    const totalApproved = claims.filter(c => c.claimStatus === 'approved')
      .reduce((sum, c) => sum + (c.claimAmount?.approved || 0), 0);

    // Group by claim type
    const claimsByType = claims.reduce((acc, claim) => {
      const type = claim.claimType || 'Other';
      if (!acc[type]) {
        acc[type] = {
          type,
          totalClaims: 0,
          approvedClaims: 0,
          totalRequested: 0,
          totalApproved: 0
        };
      }
      acc[type].totalClaims++;
      if (claim.claimStatus === 'approved') {
        acc[type].approvedClaims++;
        acc[type].totalApproved += claim.claimAmount?.approved || 0;
      }
      acc[type].totalRequested += claim.claimAmount?.requested || 0;
      return acc;
    }, {});

    // Calculate success rates
    Object.values(claimsByType).forEach(typeData => {
      typeData.successRate = typeData.totalClaims > 0 ? 
        ((typeData.approvedClaims / typeData.totalClaims) * 100).toFixed(1) : '0.0';
    });

    // Group by status
    const claimsByStatus = claims.reduce((acc, claim) => {
      const status = claim.claimStatus || 'unknown';
      if (!acc[status]) {
        acc[status] = {
          status,
          count: 0,
          totalAmount: 0
        };
      }
      acc[status].count++;
      acc[status].totalAmount += claim.claimAmount?.requested || 0;
      return acc;
    }, {});

    // Calculate percentages
    Object.values(claimsByStatus).forEach(statusData => {
      statusData.percentage = totalClaims > 0 ? 
        ((statusData.count / totalClaims) * 100).toFixed(1) : '0.0';
    });

    // Group claims by policy
    const claimsByPolicy = policies.map(policy => {
      const policyClaims = claims.filter(c => 
        c.policy?._id?.toString() === policy._id.toString()
      );
      
      return {
        policyId: policy.policyId,
        policyType: policy.policyType?.toUpperCase() || 'N/A',
        totalClaims: policyClaims.length,
        approvedClaims: policyClaims.filter(c => c.claimStatus === 'approved').length,
        rejectedClaims: policyClaims.filter(c => c.claimStatus === 'rejected').length,
        pendingClaims: policyClaims.filter(c => ['hr', 'insurer', 'employee'].includes(c.claimStatus)).length,
        totalRequested: policyClaims.reduce((sum, c) => sum + (c.claimAmount?.requested || 0), 0),
        totalApproved: policyClaims.filter(c => c.claimStatus === 'approved')
          .reduce((sum, c) => sum + (c.claimAmount?.approved || 0), 0)
      };
    });

    return {
      employee: employeeDetails,
      policies: policiesData,
      claims: claims.map(claim => ({
        claimId: claim.claimId || claim._id.toString().slice(-8).toUpperCase(),
        policyId: claim.policy?.policyId || 'N/A',
        claimType: claim.claimType || 'General',
        claimOption: claim.claimOption || claim.lifeClaimOption || claim.vehicleClaimOption || 'N/A',
        incidentDate: claim.incidentDate,
        submissionDate: claim.createdAt,
        status: claim.claimStatus,
        requestedAmount: claim.claimAmount?.requested || 0,
        approvedAmount: claim.claimAmount?.approved || null
      })),
      summary: {
        totalClaims,
        approvedClaims,
        rejectedClaims,
        pendingClaims,
        totalRequested,
        totalApproved,
        approvalRate: totalClaims > 0 ? ((approvedClaims / totalClaims) * 100).toFixed(1) : '0.0',
        totalPolicies: policiesData.length,
        activePolicies: policiesData.filter(p => p.status === 'ACTIVE').length
      },
      claimsByType: Object.values(claimsByType),
      claimsByStatus: Object.values(claimsByStatus),
      claimsByPolicy: claimsByPolicy
    };
  } catch (error) {
    console.error('Error generating employee claims summary report:', error);
    throw new Error('Failed to generate employee claims summary report');
  }
}

/**
 * Generate Enhanced Employee Claims Summary PDF Report
 */
async generateEmployeeClaimsSummaryPDF(reportData, filters) {
  try {
    const baseTemplate = await this.loadTemplate('base');
    const contentTemplate = await this.loadTemplate('employee-claims-summary-report');
    const logoBase64 = await this.loadLogo();

    const templateData = {
      reportTitle: 'My Claims Summary Report',
      reportSubtitle: 'Comprehensive overview of all submitted claims',
      generatedBy: reportData.employee.fullName,
      generatedDate: moment().format('MMMM DD, YYYY'),
      reportPeriod: filters.dateFrom && filters.dateTo ? 
        `${moment(filters.dateFrom).format('MMM DD, YYYY')} - ${moment(filters.dateTo).format('MMM DD, YYYY')}` : 
        'All Time',
      totalRecords: reportData.claims.length,
      reportType: 'Claims Summary',
      currentYear: new Date().getFullYear(),
      timestamp: moment().format('MMMM DD, YYYY [at] h:mm A'),
      logoBase64: logoBase64,
      theme: this.getReportTheme('default'),
      ...reportData,
      summary: [
        { label: 'Total Claims', value: reportData.summary.totalClaims },
        { label: 'Approved Claims', value: reportData.summary.approvedClaims },
        { label: 'Rejected Claims', value: reportData.summary.rejectedClaims },
        { label: 'Total Requested', value: `Rs. ${reportData.summary.totalRequested.toLocaleString('en-LK')}` },
        { label: 'Total Approved', value: `Rs. ${reportData.summary.totalApproved.toLocaleString('en-LK')}` },
        { label: 'Approval Rate', value: `${reportData.summary.approvalRate}%` },
        //{ label: 'Active Policies', value: `${reportData.summary.activePolicies} / ${reportData.summary.totalPolicies}` }
      ]
    };

    console.log('🧾 Final Summary Data for Template:', templateData.summary);

    handlebars.registerPartial('content', contentTemplate);
    const html = baseTemplate(templateData);
    return await this.generatePDF(html);
  } catch (error) {
    console.error('Error generating employee claims summary PDF:', error);
    throw new Error('Failed to generate employee claims summary PDF report');
  }
}

  /**
 * Get Employee Details by Employee ID (ObjectId)
 * @param {ObjectId} employeeId - The employee's ObjectId
 * @returns {Object} Employee details
 */
async getEmployeeDetails(employeeId) {
  try {
    console.log('Fetching employee details for:', employeeId);
    
    const employee = await User.findById(employeeId)
      .select('-password -__v')
      .lean();

    if (!employee) {
      throw new Error('Employee not found');
    }

    console.log('Found employee:', {
      userId: employee.userId,
      name: `${employee.profile?.firstName} ${employee.profile?.lastName}`,
      email: employee.email
    });
    // Format employee data for reports
    return {
      employeeId: employee._id,
      userId: employee.userId || employee._id.toString().slice(-6).toUpperCase(),
      fullName: `${employee.profile?.firstName || 'N/A'} ${employee.profile?.lastName || 'N/A'}`,
      email: employee.email || 'N/A',
      phone: employee.profile?.phoneNumber || 'N/A',
      address: employee.profile?.address || 'N/A',
      dateOfBirth: employee.profile?.dateOfBirth || null,
      nic: employee.profile?.nic || 'N/A',
      gender: employee.profile?.gender || 'N/A',
      department: employee.employment?.department || 'Unassigned',
      designation: employee.employment?.designation || 'N/A',
      employmentType: employee.employment?.employmentType || 'N/A',
      hireDate: employee.employment?.joinDate || employee.createdAt,
      status: employee.status || 'active',
    };

      } catch (error) {
    console.error('Error fetching employee details:', error);
    throw new Error('Failed to fetch employee details');
  }
}
  /**
   * Generate Employee Policy Report Data
   */
  async generateEmployeePolicyReport(policyId, employeeId) {
    try {
      const policy = await Policy.findOne({
        policyId: policyId,
        $or: [
          { 'beneficiaries': employeeId },
          { 'employeesIds': employeeId }
        ]
      })
      .populate('insuranceAgent', 'profile.firstName profile.lastName email')
      .populate('beneficiaries', 'profile.firstName profile.lastName email phone')
      .populate('documents')
      .lean();

      if (!policy) {
        throw new Error('Policy not found or access denied');
      }

      // Get related claims for this policy by this employee
      const claims = await Claim.find({
        policy: policy._id,
        employeeId: employeeId
      }).lean();

      // Format policy data for the report
      const reportData = {
        policy: {
          policyId: policy.policyId || policy._id.toString().slice(-8).toUpperCase(),
          policyType: policy.policyType,
          status: policy.status,
          coverageAmount: policy.coverage?.coverageAmount || 0,
          premiumAmount: policy.premium?.amount || 0,
          premiumFrequency: policy.premium?.frequency || 'N/A',
          startDate: policy.validity?.startDate,
          endDate: policy.validity?.endDate,
          agentName: policy.insuranceAgent ? 
            `${policy.insuranceAgent.profile?.firstName || 'N/A'} ${policy.insuranceAgent.profile?.lastName || 'N/A'}` : 'Unassigned',
          beneficiaries: policy.beneficiaries ? policy.beneficiaries.map(ben => ({
            name: `${ben.profile?.firstName || 'N/A'} ${ben.profile?.lastName || 'N/A'}`,
            relationship: ben.relationship || 'N/A',
            contact: ben.email || ben.phone || 'N/A',
            percentage: ben.percentage || 'N/A'
          })) : [],
          coverageDetails: this.formatCoverageDetails(policy),
          premiumHistory: [], // This would come from payment records
          documents: policy.documents ? policy.documents.map(doc => ({
            documentType: doc.documentType || 'General',
            fileName: doc.originalName || doc.filename || 'N/A',
            uploadDate: doc.uploadDate || doc.createdAt,
            status: doc.status || 'active'
          })) : [],
          claims: claims.map(claim => ({
            claimId: claim.claimId || claim._id.toString().slice(-8).toUpperCase(),
            claimType: claim.claimType || 'General',
            submissionDate: claim.createdAt,
            status: claim.claimStatus,
            requestedAmount: claim.claimAmount?.requested || 0,
            approvedAmount: claim.claimAmount?.approved || null
          }))
        }
      };

      return reportData;
    } catch (error) {
      console.error('Error generating employee policy report:', error);
      throw new Error('Failed to generate employee policy report');
    }
  }

  /**
   * Format coverage details based on policy type
   */
  formatCoverageDetails(policy) {
    const details = [];
    
    if (policy.policyType === 'life') {
      if (policy.coverage?.lifeInsurance) {
        details.push({
          type: 'Life Insurance',
          amount: policy.coverage.lifeInsurance.coverageAmount || 0,
          deductible: 0,
          description: 'Basic life insurance coverage'
        });
      }
    } else if (policy.policyType === 'vehicle') {
      if (policy.coverage?.vehicleInsurance) {
        const vehicleCoverage = policy.coverage.vehicleInsurance;
        if (vehicleCoverage.comprehensive) {
          details.push({
            type: 'Comprehensive',
            amount: vehicleCoverage.comprehensive.coverageAmount || 0,
            deductible: vehicleCoverage.comprehensive.deductible || 0,
            description: 'Comprehensive vehicle coverage'
          });
        }
        if (vehicleCoverage.collision) {
          details.push({
            type: 'Collision',
            amount: vehicleCoverage.collision.coverageAmount || 0,
            deductible: vehicleCoverage.collision.deductible || 0,
            description: 'Collision damage coverage'
          });
        }
        if (vehicleCoverage.liability) {
          details.push({
            type: 'Liability',
            amount: vehicleCoverage.liability.coverageAmount || 0,
            deductible: 0,
            description: 'Third-party liability coverage'
          });
        }
      }
    }

    return details;
  }

  /**
   * Generate Employee Policy PDF Report
   */
  async generateEmployeePolicyPDF(reportData) {
    try {
      const baseTemplate = await this.loadTemplate('base');
      const contentTemplate = await this.loadTemplate('employee-policy-report');
      const logoBase64 = await this.loadLogo();

      const templateData = {
        reportTitle: 'Individual Policy Report',
        reportSubtitle: `Detailed report for policy ${reportData.policy.policyId}`,
        generatedBy: 'Employee',
        generatedDate: moment().format('MMMM DD, YYYY'),
        reportPeriod: 'Individual Policy',
        totalRecords: 1,
        reportType: 'Policy Report',
        currentYear: new Date().getFullYear(),
        timestamp: moment().format('MMMM DD, YYYY [at] h:mm A'),
        logoBase64: logoBase64,
        theme: this.getReportTheme('policies'),
        ...reportData
      };

      handlebars.registerPartial('content', contentTemplate);
      const html = baseTemplate(templateData);
      return await this.generatePDF(html);
    } catch (error) {
      console.error('Error generating employee policy PDF:', error);
      throw new Error('Failed to generate employee policy PDF report');
    }
  }

  /**
   * Generate Documents PDF Report
   */
  async generateDocumentsPDF(reportData) {
    try {
      const baseTemplate = await this.loadTemplate('base');
      
      // Load the appropriate template based on report type
      const templateName = this.getDocumentTemplateByType(reportData.reportType);
      const contentTemplate = await this.loadTemplate(templateName);
      
      // Process data based on report type
      const processedData = this.processDocumentDataByType(reportData);
      
      const logoBase64 = await this.loadLogo();
      
      // Register additional helpers for document reports
      this.registerDocumentHelpers();

      const templateData = {
        reportTitle: reportData.reportTitle,
        reportSubtitle: `Generated on ${new Date(reportData.generatedAt).toLocaleDateString()}`,
        generatedBy: reportData.generatedBy,
        generatedAt: reportData.generatedAt,
        appliedFilters: reportData.appliedFilters,
        logoBase64: logoBase64,
        theme: this.getReportTheme('default'),
        ...processedData
      };

      handlebars.registerPartial('content', contentTemplate);
      const html = baseTemplate(templateData);
      return await this.generatePDF(html);
    } catch (error) {
      console.error('Error generating documents PDF:', error);
      throw new Error('Failed to generate documents PDF report');
    }
  }

  /**
   * Get template name based on document report type
   */
  getDocumentTemplateByType(reportType) {
    const templateMap = {
      'document-analytics': 'document-analytics-report',
      'storage-analysis': 'storage-analysis-report'
    };
    return templateMap[reportType] || 'document-analytics-report';
  }

  /**
   * Process document data based on report type
   */
  processDocumentDataByType(reportData) {
    const { reportType, documents, summary } = reportData;
    
    let processedData = {
      summary,
      documents,
      ...reportData
    };

    switch (reportType) {
      case 'document-analytics':
        processedData = this.processAnalyticsData(reportData);
        break;
      case 'storage-analysis':
        processedData = this.processStorageData(reportData);
        break;
      default:
        processedData = this.processAnalyticsData(reportData);
    }

    return processedData;
  }

  /**
   * Process data for analytics report
   */
  processAnalyticsData(reportData) {
    const { documents, summary } = reportData;
    
    // Calculate additional analytics
    const categorySizeBreakdown = documents.reduce((acc, doc) => {
      acc[doc.category] = (acc[doc.category] || 0) + (doc.size || 0);
      return acc;
    }, {});

    const typeAvgSizeBreakdown = {};
    Object.keys(summary.typeBreakdown).forEach(type => {
      const typeDocuments = documents.filter(doc => doc.type === type);
      const totalSize = typeDocuments.reduce((sum, doc) => sum + (doc.size || 0), 0);
      typeAvgSizeBreakdown[type] = typeDocuments.length > 0 ? totalSize / typeDocuments.length : 0;
    });

    const roleSizeBreakdown = documents.reduce((acc, doc) => {
      acc[doc.uploadedByRole] = (acc[doc.uploadedByRole] || 0) + (doc.size || 0);
      return acc;
    }, {});

    return {
      ...reportData,
      summary: {
        ...summary,
        categorySizeBreakdown,
        typeAvgSizeBreakdown,
        roleSizeBreakdown
      }
    };
  }

  /**
   * Process data for storage analysis report
   */
  processStorageData(reportData) {
    const { documents, summary } = reportData;
    
    // Calculate storage-specific metrics
    const categorySizeBreakdown = documents.reduce((acc, doc) => {
      acc[doc.category] = (acc[doc.category] || 0) + (doc.size || 0);
      return acc;
    }, {});

    const typeSizeBreakdown = documents.reduce((acc, doc) => {
      acc[doc.type] = (acc[doc.type] || 0) + (doc.size || 0);
      return acc;
    }, {});

    const averageFileSize = summary.totalDocuments > 0 ? 
      summary.totalSize / summary.totalDocuments : 0;
    
    const largestCategory = Object.keys(categorySizeBreakdown).reduce((a, b) => 
      categorySizeBreakdown[a] > categorySizeBreakdown[b] ? a : b, '');
    
    const storageEfficiency = this.calculateStorageEfficiency(documents);
    const monthlyGrowth = this.calculateMonthlyGrowth(documents);
    
    // Get largest files for optimization suggestions
    const largeFiles = documents
      .sort((a, b) => (b.size || 0) - (a.size || 0))
      .slice(0, 20);

    return {
      ...reportData,
      summary: {
        ...summary,
        categorySizeBreakdown,
        typeSizeBreakdown,
        averageFileSizeFormatted: this.formatFileSize(averageFileSize),
        largestCategory,
        storageEfficiency,
        monthlyGrowth
      },
      largeFiles
    };
  }

  /**
   * Helper method to format file size
   */
  formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Calculate verification timeline
   */
  calculateVerificationTimeline(documents) {
    const timeline = {};
    const months = ['Last 3 months', 'Last 6 months', 'Last 12 months'];
    
    months.forEach(period => {
      timeline[period] = {
        verified: 0,
        pending: 0,
        rate: 0
      };
    });
    
    return timeline;
  }

  /**
   * Calculate storage efficiency
   */
  calculateStorageEfficiency(documents) {
    if (!documents.length) return 85;
    
    // Calculate efficiency based on file types and sizes
    const totalSize = documents.reduce((sum, doc) => sum + (doc.size || 0), 0);
    const avgSize = totalSize / documents.length;
    
    // Efficiency calculation (simplified)
    if (avgSize < 1024 * 1024) return 95; // Small files are efficient
    if (avgSize < 10 * 1024 * 1024) return 85; // Medium files
    return 75; // Large files might need optimization
  }

  /**
   * Calculate monthly growth
   */
  calculateMonthlyGrowth(documents) {
    const growth = {};
    const now = new Date();
    
    // Get last 6 months
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
      
      const monthDocs = documents.filter(doc => {
        const docDate = new Date(doc.createdAt);
        return docDate.getMonth() === date.getMonth() && 
               docDate.getFullYear() === date.getFullYear();
      });
      
      const totalSize = monthDocs.reduce((sum, doc) => sum + (doc.size || 0), 0);
      
      growth[monthKey] = {
        count: monthDocs.length,
        size: totalSize,
        cumulative: 0, // Will calculate below
        growthRate: 0  // Will calculate below
      };
    }
    
    // Calculate cumulative and growth rates
    let cumulative = 0;
    let previousSize = 0;
    
    Object.keys(growth).forEach(month => {
      cumulative += growth[month].size;
      growth[month].cumulative = cumulative;
      
      if (previousSize > 0) {
        growth[month].growthRate = ((growth[month].size / previousSize - 1) * 100).toFixed(1);
      } else {
        growth[month].growthRate = 0;
      }
      
      previousSize = growth[month].size || 1; // Avoid division by zero
    });
    
    return growth;
  }

  /**
   * Calculate role average verification time
   */
  calculateRoleAvgVerificationTime(documents) {
    const avgTimes = {};
    // Calculate average verification time by role
    // Placeholder implementation
    return avgTimes;
  }

  /**
   * Calculate monthly verification trend
   */
  calculateMonthlyVerificationTrend(documents) {
    const trend = {};
    // Calculate monthly verification trends
    // Placeholder implementation
    return trend;
  }

  /**
   * Register additional Handlebars helpers for document reports
   */
  registerDocumentHelpers() {
    // Register percentage calculation helper
    handlebars.registerHelper('calculatePercentage', (count, total) => {
      return total > 0 ? ((count / total) * 100).toFixed(1) : 0;
    });

    // Register compliance rate helper
    handlebars.registerHelper('calculateComplianceRate', (verified, total) => {
      return total > 0 ? ((verified / total) * 100).toFixed(1) : 0;
    });

    // Register lookup helper
    handlebars.registerHelper('lookup', (obj, key) => {
      return obj && obj[key] ? obj[key] : 0;
    });

    // Register subtract helper
    handlebars.registerHelper('subtract', (a, b) => {
      return (a || 0) - (b || 0);
    });

    // Register formatFileSize helper
    handlebars.registerHelper('formatFileSize', (bytes) => {
      return this.formatFileSize(bytes || 0);
    });

    // Register days since upload helper
    handlebars.registerHelper('daysSinceUpload', (date) => {
      const now = new Date();
      const uploadDate = new Date(date);
      const diffTime = Math.abs(now - uploadDate);
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    });

    // Register other specialized helpers
    handlebars.registerHelper('getComplianceImpact', (status) => {
      const impacts = {
        'active': 'Positive',
        'verified': 'High Positive',
        'pending': 'Neutral',
        'rejected': 'Negative'
      };
      return impacts[status] || 'Neutral';
    });

    handlebars.registerHelper('getPriority', (days) => {
      if (days > 30) return 'High';
      if (days > 14) return 'Medium';
      return 'Low';
    });

    handlebars.registerHelper('getCategoryPriority', (category) => {
      const priorities = {
        'policy': 'Critical',
        'claim': 'High',
        'identity': 'High',
        'financial': 'Medium',
        'other': 'Low'
      };
      return priorities[category] || 'Medium';
    });

    // Register additional helpers for storage analysis
    handlebars.registerHelper('sortByDate', (array) => {
      if (!Array.isArray(array)) return array;
      return array.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    });

    handlebars.registerHelper('calculateAvgSize', (totalSize, count) => {
      if (!count || count === 0) return 0;
      return Math.round(totalSize / count);
    });

    handlebars.registerHelper('getVerificationPriority', (isVerified) => {
      return isVerified ? 'Low' : 'High';
    });

    handlebars.registerHelper('formatBytes', (bytes) => {
      return this.formatFileSize(bytes || 0);
    });

    handlebars.registerHelper('getStorageClass', (size) => {
      if (size > 10 * 1024 * 1024) return 'Large';
      if (size > 1024 * 1024) return 'Medium';
      return 'Small';
    });

    handlebars.registerHelper('calculateStorageUsage', (documents) => {
      if (!Array.isArray(documents)) return 0;
      return documents.reduce((sum, doc) => sum + (doc.size || 0), 0);
    });

    handlebars.registerHelper('getOptimizationSuggestion', (size) => {
      if (size > 50 * 1024 * 1024) return 'Consider compression';
      if (size > 10 * 1024 * 1024) return 'Monitor size';
      return 'Optimized';
    });
  }
}

export default new ReportsService();