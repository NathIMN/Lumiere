import { createCustomError } from '../errors/custom-error.js';

/**
 * Role-based access control middleware for reports
 * @param {Array} allowedRoles - Array of roles that can access the route
 */
export const authorizeReports = (allowedRoles = []) => {
  return (req, res, next) => {
    try {
      // Ensure user is authenticated
      if (!req.user) {
        return next(createCustomError('Authentication required', 401));
      }

      const userRole = req.user.role;

      // Check if user role is in allowed roles
      if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
        return next(createCustomError(`Access denied. Required roles: ${allowedRoles.join(', ')}`, 403));
      }

      // Role-specific access control for different report types
      const endpoint = req.path;
      
      // Financial reports - Admin only
      if (endpoint.includes('/financial')) {
        if (userRole !== 'admin') {
          return next(createCustomError('Financial reports require admin access', 403));
        }
      }

      // Custom reports - Admin only
      if (endpoint.includes('/custom')) {
        if (userRole !== 'admin') {
          return next(createCustomError('Custom reports require admin access', 403));
        }
      }

      // Schedule reports - Admin only
      if (endpoint.includes('/schedule')) {
        if (userRole !== 'admin') {
          return next(createCustomError('Report scheduling requires admin access', 403));
        }
      }

      // Users reports - Admin and HR only
      if (endpoint.includes('/users')) {
        if (!['admin', 'hr_officer'].includes(userRole)) {
          return next(createCustomError('User reports require admin or HR access', 403));
        }
      }

      // Policies and Claims reports - Admin, HR, and Insurance Agents
      if (endpoint.includes('/policies') || endpoint.includes('/claims')) {
        if (!['admin', 'hr_officer', 'insurance_agent'].includes(userRole)) {
          return next(createCustomError('This report requires admin, HR, or insurance agent access', 403));
        }
      }

      next();
    } catch (error) {
      return next(createCustomError('Authorization failed', 500));
    }
  };
};

/**
 * Middleware to check if user can view all data or only their own
 */
export const filterUserAccess = (req, res, next) => {
  const userRole = req.user.role;
  const userId = req.user.userId;

  // Admins and HR can see all data
  if (['admin', 'hr_officer'].includes(userRole)) {
    req.canViewAllData = true;
  } else {
    // Other roles can only see their own data
    req.canViewAllData = false;
    req.userId = userId;
  }

  next();
};

/**
 * Middleware to log report generation activities
 */
export const logReportActivity = (req, res, next) => {
  const originalSend = res.send;
  
  res.send = function(data) {
    // Log successful report generation
    if (res.statusCode === 200) {
      console.log(`📊 Report Generated: ${req.method} ${req.originalUrl}`, {
        user: req.user.email,
        role: req.user.role,
        timestamp: new Date().toISOString(),
        query: req.query,
        userAgent: req.get('User-Agent')
      });
    }
    
    originalSend.call(this, data);
  };

  next();
};

export default {
  authorizeReports,
  filterUserAccess,
  logReportActivity
};