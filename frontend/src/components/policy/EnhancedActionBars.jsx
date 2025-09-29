/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { 
  Eye, 
  Users, 
  Calendar, 
  DollarSign, 
  Shield,
  Car,
  Heart,
  User,
  UserCheck,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Pause,
  UserPlus,
  UserMinus,
  MoreVertical,
  Edit,
  Trash2,
  Download,
  Share2,
  Archive,
  RefreshCw,
  FileText,
  Copy,
  Star,
  StarOff,
  Phone,
  Mail,
  Settings,
  Info,
  Zap,
  ArrowRight,
  Target
} from 'lucide-react';

// Enhanced Quick Actions Component with Better Visibility
const QuickActions = ({ 
  policy, 
  onViewDetails, 
  onAddBeneficiary, 
  onRemoveBeneficiary,
  onEdit,
  onDownload,
  className = ""
}) => {
  const [showTooltip, setShowTooltip] = useState(null);
  const hasBeneficiaries = policy.beneficiaries?.length > 0;

  const quickActions = [
    {
      id: 'view',
      label: 'View Details',
      shortLabel: 'View',
      icon: Eye,
      onClick: () => onViewDetails(policy),
      color: 'blue',
      tooltip: 'View complete policy information',
      primary: true
    },
    {
      id: 'beneficiary-manage',
      label: hasBeneficiaries ? 'Manage Beneficiaries' : 'Add Beneficiary',
      shortLabel: hasBeneficiaries ? 'Manage' : 'Add',
      icon: hasBeneficiaries ? Users : UserPlus,
      onClick: () => onAddBeneficiary(policy),
      color: 'green',
      tooltip: hasBeneficiaries 
        ? `Manage beneficiaries (${policy.beneficiaries.length} current)` 
        : 'Add new beneficiary to this policy',
      badge: hasBeneficiaries ? policy.beneficiaries.length : undefined,
      primary: true
    }
  ];

  const getButtonStyles = (action, disabled = false) => {
    if (disabled) {
      return 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200 dark:bg-gray-800 dark:text-gray-600 dark:border-gray-700';
    }

    const baseStyles = 'font-medium transition-all duration-200 transform hover:scale-105 active:scale-95 border-2 shadow-sm hover:shadow-md';
    
    if (action.primary) {
      const colors = {
        blue: 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600 hover:border-blue-700 focus:ring-4 focus:ring-blue-200 dark:focus:ring-blue-800',
        green: 'bg-green-600 hover:bg-green-700 text-white border-green-600 hover:border-green-700 focus:ring-4 focus:ring-green-200 dark:focus:ring-green-800',
        red: 'bg-red-600 hover:bg-red-700 text-white border-red-600 hover:border-red-700 focus:ring-4 focus:ring-red-200 dark:focus:ring-red-800'
      };
      return `${baseStyles} ${colors[action.color] || colors.blue}`;
    } else {
      const colors = {
        blue: 'bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200 hover:border-blue-300 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 dark:text-blue-300 dark:border-blue-800',
        green: 'bg-green-50 hover:bg-green-100 text-green-700 border-green-200 hover:border-green-300 dark:bg-green-900/20 dark:hover:bg-green-900/40 dark:text-green-300 dark:border-green-800',
        red: 'bg-red-50 hover:bg-red-100 text-red-700 border-red-200 hover:border-red-300 dark:bg-red-900/20 dark:hover:bg-red-900/40 dark:text-red-300 dark:border-red-800'
      };
      return `${baseStyles} ${colors[action.color] || colors.blue}`;
    }
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {quickActions.map((action) => {
        const IconComponent = action.icon;
        const isDisabled = action.disabled;
        
        return (
          <div key={action.id} className="relative">
            <button
              onClick={!isDisabled ? action.onClick : undefined}
              disabled={isDisabled}
              onMouseEnter={() => setShowTooltip(action.id)}
              onMouseLeave={() => setShowTooltip(null)}
              className={`
                flex items-center gap-2 px-4 py-2.5 rounded-lg focus:outline-none
                ${getButtonStyles(action, isDisabled)}
              `}
              title={action.tooltip}
            >
              <IconComponent className="h-4 w-4" />
              <span className="font-semibold text-sm">{action.shortLabel}</span>
              {action.badge && (
                <span className="ml-1 px-2 py-0.5 text-xs bg-white/20 text-white rounded-full font-bold">
                  {action.badge}
                </span>
              )}
            </button>
            
            {/* Enhanced Tooltip */}
            {showTooltip === action.id && (
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 z-50">
                <div className="bg-gray-900 dark:bg-gray-700 text-white text-sm rounded-lg px-3 py-2 whitespace-nowrap shadow-xl border">
                  <div className="font-medium">{action.label}</div>
                  <div className="text-xs text-gray-300 mt-1">{action.tooltip}</div>
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900 dark:border-t-gray-700"></div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

// Action Button Row for prominent display
const ActionButtonRow = ({ 
  policy, 
  onViewDetails, 
  onAddBeneficiary, 
  onRemoveBeneficiary,
  onEdit,
  onDownload,
  className = ""
}) => {
  const hasBeneficiaries = policy.beneficiaries?.length > 0;

  const primaryActions = [
    {
      id: 'view',
      label: 'View Policy Details',
      icon: Eye,
      onClick: () => onViewDetails(policy),
      color: 'blue',
      description: 'Review complete policy information and coverage details'
    },
    {
      id: 'beneficiaries',
      label: hasBeneficiaries ? `Manage Beneficiaries (${policy.beneficiaries.length})` : 'Add Beneficiaries',
      icon: hasBeneficiaries ? Users : UserPlus,
      onClick: () => onAddBeneficiary(policy),
      color: 'green',
      description: hasBeneficiaries 
        ? 'View, edit, or add more beneficiaries' 
        : 'Add beneficiaries to this policy',
      badge: hasBeneficiaries ? policy.beneficiaries.length : undefined
    }
  ];

  const getButtonStyles = (color) => {
    const styles = {
      blue: 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-blue-200',
      green: 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-green-200',
      red: 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white shadow-red-200'
    };
    return styles[color] || styles.blue;
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {primaryActions.map((action) => {
          const IconComponent = action.icon;
          
          return (
            <button
              key={action.id}
              onClick={action.onClick}
              className={`
                group relative p-4 rounded-xl border-2 border-transparent
                ${getButtonStyles(action.color)}
                hover:shadow-lg hover:-translate-y-0.5 
                transition-all duration-200 transform
                focus:outline-none focus:ring-4 focus:ring-offset-2 focus:ring-blue-500
                active:scale-95
              `}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <IconComponent className="h-5 w-5" />
                  </div>
                  <div className="text-left">
                    <div className="font-bold text-base">{action.label}</div>
                    <div className="text-sm text-white/80 mt-1">{action.description}</div>
                  </div>
                </div>
                
                {action.badge && (
                  <div className="bg-white/20 text-white px-3 py-1 rounded-full text-sm font-bold">
                    {action.badge}
                  </div>
                )}
                
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          );
        })}
      </div>

      {/* Secondary Actions Row */}
      <div className="flex items-center gap-2 pt-2 border-t border-gray-200 dark:border-gray-600">
        <div className="flex items-center gap-2 flex-1">
          <Info className="h-4 w-4 text-gray-400" />
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Policy ID: {policy.policyId || policy.policyNumber} • 
            Type: {policy.policyType === 'life' ? 'Life Insurance' : 'Vehicle Insurance'}
          </span>
        </div>
        
        <div className="flex items-center gap-1">
          <button
            onClick={() => onEdit?.(policy)}
            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
            title="Edit Policy"
            disabled={!onEdit}
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDownload?.(policy)}
            className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
            title="Download PDF"
            disabled={!onDownload}
          >
            <Download className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

// Simple Action Button Component (Screenshot Style)
export const ActionButton = ({ 
  icon: IconComponent, 
  onClick, 
  color = 'blue', 
  tooltip = '', 
  disabled = false,
  badge = null,
  className = ""
}) => {
  const colorStyles = {
    blue: 'text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:border-blue-200 dark:hover:border-blue-800',
    green: 'text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20 hover:border-green-200 dark:hover:border-green-800',
    orange: 'text-orange-600 hover:text-orange-700 hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:border-orange-200 dark:hover:border-orange-800',
    purple: 'text-purple-600 hover:text-purple-700 hover:bg-purple-50 dark:hover:bg-purple-900/20 hover:border-purple-200 dark:hover:border-purple-800',
    red: 'text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-200 dark:hover:border-red-800',
    gray: 'text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 hover:border-gray-200 dark:hover:border-gray-600'
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        relative p-2 rounded-lg transition-all duration-200 border border-transparent
        ${disabled ? 'opacity-50 cursor-not-allowed' : colorStyles[color]}
        ${className}
      `}
      title={tooltip}
    >
      <IconComponent className="h-4 w-4" />
      {badge !== null && (
        <span className="absolute -top-1 -right-1 bg-green-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
          {badge}
        </span>
      )}
    </button>
  );
};

// Screenshot-Style Action Bar Component
export const ActionButtonsBar = ({ 
  policy, 
  onViewDetails, 
  onAddBeneficiary, 
  onRemoveBeneficiary,
  onEdit,
  onDownload,
  onArchive,
  onFavorite,
  compact = false
}) => {
  const hasBeneficiaries = policy.beneficiaries?.length > 0;

  const actions = [
    {
      icon: Eye,
      onClick: () => onViewDetails(policy),
      color: 'blue',
      tooltip: 'View Details'
    },
    {
      icon: hasBeneficiaries ? Users : UserPlus,
      onClick: () => onAddBeneficiary(policy),
      color: 'green',
      tooltip: hasBeneficiaries ? `Manage Beneficiaries (${policy.beneficiaries.length})` : 'Add Beneficiary',
      badge: hasBeneficiaries ? policy.beneficiaries.length : null
    },
    {
      icon: Edit,
      onClick: () => onEdit?.(policy),
      color: 'orange',
      tooltip: 'Edit Policy',
      disabled: !onEdit
    },
    {
      icon: Download,
      onClick: () => onDownload?.(policy),
      color: 'purple',
      tooltip: 'Download PDF',
      disabled: !onDownload
    }
  ];

  return (
    <div className={`flex items-center ${compact ? 'gap-1' : 'gap-2'}`}>
      {actions.map((action, index) => (
        <ActionButton
          key={index}
          icon={action.icon}
          onClick={action.onClick}
          color={action.color}
          tooltip={action.tooltip}
          disabled={action.disabled}
          badge={action.badge}
        />
      ))}
      
      {/* More Options */}
      <ActionButton
        icon={MoreVertical}
        color="gray"
        tooltip="More Options"
        onClick={() => {}}
      />
    </div>
  );
};

// Update Enhanced Grid Action Bar to use the new components
export const EnhancedGridActionBar = ({ 
  policy, 
  onViewDetails, 
  onAddBeneficiary, 
  onRemoveBeneficiary,
  onEdit,
  onDownload,
  onArchive,
  onFavorite
}) => {
  const hasBeneficiaries = policy.beneficiaries?.length > 0;

  return (
    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
      {/* Policy Info */}
      <div className="flex items-center gap-2">
        <Shield className="h-4 w-4 text-blue-600" />
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {policy.policyId || policy.policyNumber}
        </span>
        {hasBeneficiaries && (
          <span className="px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 text-xs rounded-full">
            {policy.beneficiaries.length} beneficiaries
          </span>
        )}
      </div>

      {/* Action Buttons */}
      <ActionButtonsBar
        policy={policy}
        onViewDetails={onViewDetails}
        onAddBeneficiary={onAddBeneficiary}
        onRemoveBeneficiary={onRemoveBeneficiary}
        onEdit={onEdit}
        onDownload={onDownload}
        onArchive={onArchive}
        onFavorite={onFavorite}
        compact={true}
      />
    </div>
  );
};

// Update Enhanced Table Action Bar to use the new components  
// export const EnhancedTableActionBar = ({ 
//   policy, 
//   onViewDetails, 
//   onAddBeneficiary, 
//   onRemoveBeneficiary,
//   onEdit,
//   onDownload,
//   onArchive,
//   onFavorite
// }) => {
//   return (
//     <ActionButtonsBar
//       policy={policy}
//       onViewDetails={onViewDetails}
//       onAddBeneficiary={onAddBeneficiary}
//       onRemoveBeneficiary={onRemoveBeneficiary}
//       onEdit={onEdit}
//       onDownload={onDownload}
//       onArchive={onArchive}
//       onFavorite={onFavorite}
//       compact={true}
//     />
//   );
// };

export const EnhancedTableActionBar = ({ 
  policy, 
  onViewDetails, 
  onAddBeneficiary, 
  onDeletePolicy 
}) => {
  return (
    <div className="flex items-center gap-2">
      {/* View Button */}
      <button
        onClick={() => onViewDetails(policy)}
        className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-md"
        title="View Policy Details"
      >
        <Eye className="h-4 w-4" />
        <span>View</span>
      </button>

      {/* Add Beneficiary Button */}
      <button
        onClick={() => onAddBeneficiary(policy)}
        className="flex items-center gap-1.5 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-md"
        title="Add Beneficiary"
      >
        <UserPlus className="h-4 w-4" />
        <span>Add</span>
      </button>

      {/* Delete Policy Button */}
      <button
        onClick={() => onDeletePolicy(policy)}
        className="flex items-center gap-1.5 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-md"
        title="Delete Policy"
      >
        <Trash2 className="h-4 w-4" />
        <span>Delete</span>
      </button>
    </div>
  );
};

// Call-to-Action Panel for HR Dashboard
export const HRActionPanel = ({
  policy,
  onViewDetails,
  onAddBeneficiary,
  onRemoveBeneficiary,
  onEdit,
  onDownload
}) => {
  const hasBeneficiaries = policy.beneficiaries?.length > 0;
  const urgentActions = [];
  
  // Check for urgent actions needed
  if (!hasBeneficiaries) {
    urgentActions.push({
      type: 'warning',
      message: 'No beneficiaries assigned',
      action: 'Add Beneficiary',
      onClick: () => onAddBeneficiary(policy)
    });
  }

  return (
    <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-blue-600 text-white rounded-lg">
          <Target className="h-5 w-5" />
        </div>
        <div>
          <h3 className="font-bold text-lg text-blue-900 dark:text-blue-100">
            Policy Actions Required
          </h3>
          <p className="text-sm text-blue-700 dark:text-blue-300">
            Quick actions for policy {policy.policyId || policy.policyNumber}
          </p>
        </div>
      </div>

      {/* Urgent Actions */}
      {urgentActions.length > 0 && (
        <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <span className="text-sm font-medium text-amber-800 dark:text-amber-200">
              Attention Required
            </span>
          </div>
          {urgentActions.map((urgent, index) => (
            <div key={index} className="flex items-center justify-between">
              <span className="text-sm text-amber-700 dark:text-amber-300">
                {urgent.message}
              </span>
              <button
                onClick={urgent.onClick}
                className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white text-xs font-medium rounded-md transition-colors"
              >
                {urgent.action}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Primary Action Buttons */}
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => onViewDetails(policy)}
          className="group flex flex-col items-center p-4 bg-white dark:bg-gray-800 rounded-lg border-2 border-blue-200 dark:border-blue-800 hover:border-blue-400 dark:hover:border-blue-600 hover:shadow-lg transition-all duration-200"
        >
          <div className="p-3 bg-blue-600 text-white rounded-lg mb-3 group-hover:bg-blue-700 transition-colors">
            <Eye className="h-6 w-6" />
          </div>
          <span className="font-bold text-blue-900 dark:text-blue-100 mb-1">
            View Details
          </span>
          <span className="text-xs text-blue-700 dark:text-blue-300 text-center">
            Review complete policy information
          </span>
        </button>

        <button
          onClick={() => onAddBeneficiary(policy)}
          className="group flex flex-col items-center p-4 bg-white dark:bg-gray-800 rounded-lg border-2 border-green-200 dark:border-green-800 hover:border-green-400 dark:hover:border-green-600 hover:shadow-lg transition-all duration-200 relative"
        >
          <div className="p-3 bg-green-600 text-white rounded-lg mb-3 group-hover:bg-green-700 transition-colors">
            {hasBeneficiaries ? <Users className="h-6 w-6" /> : <UserPlus className="h-6 w-6" />}
          </div>
          <span className="font-bold text-green-900 dark:text-green-100 mb-1">
            {hasBeneficiaries ? 'Manage' : 'Add'} Beneficiaries
          </span>
          <span className="text-xs text-green-700 dark:text-green-300 text-center">
            {hasBeneficiaries 
              ? `${policy.beneficiaries.length} current beneficiaries` 
              : 'Add beneficiaries to policy'
            }
          </span>
          {hasBeneficiaries && (
            <div className="absolute -top-2 -right-2 bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
              {policy.beneficiaries.length}
            </div>
          )}
        </button>
      </div>

      {/* Secondary Actions */}
      <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t border-blue-200 dark:border-blue-800">
        <button
          onClick={() => onEdit?.(policy)}
          className="flex items-center gap-2 px-4 py-2 text-blue-700 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-200 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-lg transition-colors"
          disabled={!onEdit}
        >
          <Edit className="h-4 w-4" />
          <span className="font-medium">Edit Policy</span>
        </button>
        
        <button
          onClick={() => onDownload?.(policy)}
          className="flex items-center gap-2 px-4 py-2 text-blue-700 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-200 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-lg transition-colors"
          disabled={!onDownload}
        >
          <Download className="h-4 w-4" />
          <span className="font-medium">Download PDF</span>
        </button>
      </div>
    </div>
  );
};

// Enhanced Bulk Actions Bar with Better Visibility
export const BulkActionsBar = ({ 
  selectedPolicies, 
  onBulkAction, 
  onClearSelection 
}) => {
  const bulkActions = [
    { 
      id: 'export', 
      label: 'Export Selected', 
      icon: Download, 
      color: 'bg-blue-600 hover:bg-blue-700 text-white',
      description: 'Export to Excel/PDF'
    },
    { 
      id: 'archive', 
      label: 'Archive Selected', 
      icon: Archive, 
      color: 'bg-orange-600 hover:bg-orange-700 text-white',
      description: 'Move to archive'
    },
    { 
      id: 'favorite', 
      label: 'Add to Favorites', 
      icon: Star, 
      color: 'bg-yellow-600 hover:bg-yellow-700 text-white',
      description: 'Mark as favorites'
    }
  ];

  if (selectedPolicies.length === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-40 max-w-4xl w-full px-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl border-2 border-blue-200 dark:border-blue-800 p-6">
        <div className="flex items-center justify-between gap-6">
          {/* Selection Info */}
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 text-white rounded-lg">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <span className="text-lg font-bold text-gray-900 dark:text-white">
                {selectedPolicies.length} Policies Selected
              </span>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Choose an action to perform on selected policies
              </p>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            {bulkActions.map((action) => {
              const IconComponent = action.icon;
              return (
                <button
                  key={action.id}
                  onClick={() => onBulkAction(action.id, selectedPolicies)}
                  className={`
                    flex items-center gap-2 px-4 py-3 rounded-lg font-semibold transition-all hover:shadow-lg transform hover:scale-105
                    ${action.color}
                  `}
                  title={action.description}
                >
                  <IconComponent className="h-4 w-4" />
                  <span className="hidden sm:inline text-sm">{action.label}</span>
                </button>
              );
            })}
            
            {/* Clear Selection */}
            <div className="border-l-2 border-gray-300 dark:border-gray-600 pl-4 ml-2">
              <button
                onClick={onClearSelection}
                className="flex items-center gap-2 px-4 py-3 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors font-semibold"
                title="Clear selection"
              >
                <XCircle className="h-4 w-4" />
                <span className="hidden sm:inline text-sm">Clear All</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Floating Action Button for mobile with better visibility
export const FloatingActionButton = ({ 
  policy, 
  onViewDetails, 
  onAddBeneficiary 
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const actions = [
    {
      label: 'View Policy Details',
      icon: Eye,
      onClick: () => onViewDetails(policy),
      color: 'bg-blue-600 hover:bg-blue-700'
    },
    {
      label: 'Manage Beneficiaries',
      icon: UserPlus,
      onClick: () => onAddBeneficiary(policy),
      color: 'bg-green-600 hover:bg-green-700'
    }
  ];

  useEffect(() => {
    const handleClickOutside = () => {
      if (isOpen) setIsOpen(false);
    };

    if (isOpen) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => document.removeEventListener('click', handleClickOutside);
  }, [isOpen]);

  return (
    <div className="fixed bottom-6 right-6 z-30 md:hidden">
      {/* Action Buttons */}
      {isOpen && (
        <div className="absolute bottom-20 right-0 space-y-4 mb-2">
          {actions.map((action, index) => {
            const IconComponent = action.icon;
            return (
              <div key={index} className="flex items-center gap-4">
                <div className="bg-gray-900 text-white px-4 py-3 rounded-xl text-sm font-medium whitespace-nowrap shadow-xl border">
                  {action.label}
                </div>
                <button
                  onClick={() => {
                    action.onClick();
                    setIsOpen(false);
                  }}
                  className={`w-14 h-14 rounded-full shadow-xl flex items-center justify-center text-white transition-all transform hover:scale-110 active:scale-95 ${action.color}`}
                >
                  <IconComponent className="h-6 w-6" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Main FAB */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className={`
          w-16 h-16 rounded-full shadow-xl flex items-center justify-center text-white transition-all transform
          ${isOpen 
            ? 'bg-red-600 hover:bg-red-700 rotate-45 scale-110' 
            : 'bg-blue-600 hover:bg-blue-700 hover:scale-110'
          }
        `}
      >
        {isOpen ? <XCircle className="h-7 w-7" /> : <Zap className="h-7 w-7" />}
      </button>
    </div>
  );
};