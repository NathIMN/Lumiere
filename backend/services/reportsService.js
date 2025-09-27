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
  }

  /**
   * Load company logo as base64
   */
  async loadLogo() {
    try {
      const logoPath = path.join(__dirname, '../public/LumiereLogo.svg');
      const logoContent = await fs.readFile(logoPath);
      return logoContent.toString('base64');
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

      const users = await User.find(query)
        .select('-password')
        .sort({ createdAt: -1 })
        .lean();

            // Generate summary statistics
      const totalUsers = users.length;
      const activeUsers = users.filter(user => user.status === 'active').length;

      const inactiveUsers = totalUsers - activeUsers;

      // Group by role
      const usersByRole = users.reduce((acc, user) => {
        acc[user.role] = (acc[user.role] || 0) + 1;
        return acc;
      }, {});

      // Group by department
      const usersByDepartment = users.reduce((acc, user) => {
        const dept = user.employment?.department || 'Unassigned';
        if (!acc[dept]) {
          acc[dept] = { active: 0, inactive: 0, total: 0 };
        }
        acc[dept][user.status === 'active' ? 'active' : 'inactive']++;
        acc[dept].total++;
        return acc;
      }, {});

      return {
        users: users.map(user => ({
          employeeId: user.employeeId || user._id.toString().slice(-6).toUpperCase(),
          fullName: `${user.profile?.firstName || 'N/A'} ${user.profile?.lastName || 'N/A'}`,
          email: user.email || 'N/A',
          role: (user.role || 'user').replace('_', ' ').toUpperCase(),
          department: user.employment?.department || 'Unassigned',
          hireDate: user.createdAt,
          status: user.status || 'unknown',
          lastLogin: user.lastLogin || null
        })),
        summary: {
          totalUsers,
          activeUsers,
          inactiveUsers,
          activePercentage: totalUsers > 0 ? ((activeUsers / totalUsers) * 100).toFixed(1) : 0
        },
        usersByRole: Object.entries(usersByRole).map(([role, count]) => ({
          role: role.replace('_', ' ').toUpperCase(),
          count,
          percentage: totalUsers > 0 ? ((count / totalUsers) * 100).toFixed(1) : 0
        })),
        usersByDepartment: Object.entries(usersByDepartment).map(([department, data]) => ({
          department,
          activeCount: data.active,
          inactiveCount: data.inactive,
          totalCount: data.total
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
  async generatePoliciesReport(filters = {}) {
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
  async generatePoliciesPDF(reportData, filters) {
    try {
      const baseTemplate = await this.loadTemplate('base');
      const contentTemplate = await this.loadTemplate('policies-report');
      const logoBase64 = await this.loadLogo();

      const templateData = {
        reportTitle: 'Policies Report',
        reportSubtitle: 'Comprehensive overview of insurance policies',
        generatedBy: 'System Administrator',
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
  async generateClaimsReport(filters = {}) {
    try {
      let query = {};

      if (filters.status) {
        query.status = filters.status;
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
  async generateClaimsPDF(reportData, filters) {
    try {
      const baseTemplate = await this.loadTemplate('base');
      const contentTemplate = await this.loadTemplate('claims-report');
      const logoBase64 = await this.loadLogo();

      const templateData = {
        reportTitle: 'Claims Report',
        reportSubtitle: 'Comprehensive overview of insurance claims',
        generatedBy: 'System Administrator',
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
  async generateFinancialReport(filters = {}) {
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
  async generateFinancialPDF(reportData, filters) {
    try {
      const baseTemplate = await this.loadTemplate('base');
      const contentTemplate = await this.loadTemplate('financial-report');
      const logoBase64 = await this.loadLogo();

      const templateData = {
        reportTitle: 'Financial Report',
        reportSubtitle: 'Comprehensive financial performance overview',
        generatedBy: 'System Administrator',
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
}

export default new ReportsService();