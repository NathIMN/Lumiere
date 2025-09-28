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
  Info
} from 'lucide-react';

// Enhanced Quick Actions Component
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
      icon: Eye,
      onClick: () => onViewDetails(policy),
      color: 'blue',
      tooltip: 'View complete policy information'
    },
    {
      id: 'beneficiary-manage',
      label: hasBeneficiaries ? 'Manage Beneficiaries' : 'Add Beneficiary',
      icon: hasBeneficiaries ? Users : UserPlus,
      onClick: () => onAddBeneficiary(policy),
      color: 'green',
      tooltip: hasBeneficiaries 
        ? `Manage beneficiaries (${policy.beneficiaries.length} current)` 
        : 'Add new beneficiary to this policy',
      badge: hasBeneficiaries ? policy.beneficiaries.length : undefined
    }
  ];

  const getColorClasses = (color, disabled = false) => {
    if (disabled) {
      return 'text-gray-300 dark:text-gray-600 cursor-not-allowed bg-gray-50 dark:bg-gray-800';
    }
    
    const colors = {
      blue: 'text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20 focus:ring-blue-500',
      green: 'text-green-600 hover:text-green-700 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-900/20 focus:ring-green-500',
      red: 'text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 focus:ring-red-500',
      gray: 'text-gray-600 hover:text-gray-700 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-900/20 focus:ring-gray-500'
    };
    return colors[color] || colors.gray;
  };

  return (
    <div className={`flex items-center gap-1 ${className}`}>
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
                p-2 rounded-lg transition-all duration-200 border border-transparent
                ${getColorClasses(action.color, isDisabled)}
                ${!isDisabled ? 'hover:shadow-sm transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2' : ''}
              `}
              title={action.tooltip}
            >
              <IconComponent className="h-4 w-4" />
              {action.badge && (
                <span className="absolute -top-1 -right-1 h-4 w-4 text-xs flex items-center justify-center bg-blue-500 text-white rounded-full">
                  {action.badge}
                </span>
              )}
            </button>
            
            {/* Enhanced Tooltip */}
            {showTooltip === action.id && (
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-30">
                <div className="bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap shadow-lg">
                  {action.tooltip}
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

// Enhanced Dropdown Menu Component
const EnhancedDropdownMenu = ({ 
  policy, 
  isOpen, 
  onToggle, 
  onViewDetails, 
  onAddBeneficiary, 
  onRemoveBeneficiary,
  onEdit,
  onDownload,
  onArchive,
  onFavorite,
  className = ""
}) => {
  const [showConfirmation, setShowConfirmation] = useState(null);
  const hasBeneficiaries = policy.beneficiaries?.length > 0;

  const menuItems = [
    { type: 'header', content: 'Policy Actions' },
    {
      id: 'view',
      label: 'View Details',
      icon: Eye,
      onClick: () => onViewDetails(policy),
      color: 'blue',
      description: 'View complete policy information'
    },
    {
      id: 'edit',
      label: 'Edit Policy',
      icon: Edit,
      onClick: () => onEdit?.(policy),
      color: 'gray',
      description: 'Modify policy details',
      disabled: !onEdit
    },
    { type: 'divider' },
    { type: 'header', content: 'Beneficiary Management' },
    {
      id: 'add-beneficiary',
      label: hasBeneficiaries ? 'Manage Beneficiaries' : 'Add Beneficiary',
      icon: hasBeneficiaries ? Users : UserPlus,
      onClick: () => onAddBeneficiary(policy),
      color: 'green',
      description: hasBeneficiaries 
        ? `Current beneficiaries: ${policy.beneficiaries.length}` 
        : 'Add new beneficiary to this policy',
      badge: hasBeneficiaries ? policy.beneficiaries.length : undefined
    },
    hasBeneficiaries && {
      id: 'remove-beneficiary',
      label: 'Remove Beneficiary',
      icon: UserMinus,
      onClick: () => onRemoveBeneficiary(policy),
      color: 'red',
      description: 'Remove beneficiary from policy'
    },
    { type: 'divider' },
    { type: 'header', content: 'Document Actions' },
    {
      id: 'download',
      label: 'Download PDF',
      icon: Download,
      onClick: () => onDownload?.(policy),
      color: 'purple',
      description: 'Download policy document',
      disabled: !onDownload
    },
    {
      id: 'favorite',
      label: policy.isFavorite ? 'Remove from Favorites' : 'Add to Favorites',
      icon: policy.isFavorite ? StarOff : Star,
      onClick: () => onFavorite?.(policy),
      color: 'yellow',
      description: policy.isFavorite ? 'Remove from favorites' : 'Add to favorites',
      disabled: !onFavorite
    },
    { type: 'divider' },
    { type: 'header', content: 'Management' },
    {
      id: 'archive',
      label: 'Archive Policy',
      icon: Archive,
      onClick: () => setShowConfirmation('archive'),
      color: 'orange',
      description: 'Archive this policy',
      requiresConfirmation: true,
      disabled: !onArchive
    }
  ].filter(Boolean);

  const getColorClasses = (color) => {
    const colors = {
      blue: 'text-blue-700 dark:text-blue-300',
      green: 'text-green-700 dark:text-green-300',
      red: 'text-red-700 dark:text-red-300',
      gray: 'text-gray-700 dark:text-gray-300',
      purple: 'text-purple-700 dark:text-purple-300',
      yellow: 'text-yellow-700 dark:text-yellow-300',
      orange: 'text-orange-700 dark:text-orange-300'
    };
    return colors[color] || colors.gray;
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isOpen && !event.target.closest('.dropdown-menu')) {
        onToggle();
      }
    };

    if (isOpen) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => document.removeEventListener('click', handleClickOutside);
  }, [isOpen, onToggle]);

  if (!isOpen) return null;

  return (
    <>
      {/* Menu */}
      <div className={`dropdown-menu absolute right-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-lg shadow-xl z-30 border border-gray-200 dark:border-gray-600 ${className}`}>
        {/* Policy Info Header */}
        <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 rounded-t-lg">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-blue-600" />
            <span className="font-medium text-gray-900 dark:text-white text-sm">
              {policy.policyId || policy.policyNumber}
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {policy.policyType === 'life' ? 'Life Insurance' : 'Vehicle Insurance'} • 
            {policy.beneficiaries?.length || 0} beneficiaries
          </p>
        </div>

        <div className="py-2 max-h-80 overflow-y-auto">
          {menuItems.map((item, index) => {
            if (item.type === 'header') {
              return (
                <div key={index} className="px-4 py-2">
                  <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {item.content}
                  </h4>
                </div>
              );
            }

            if (item.type === 'divider') {
              return (
                <div key={index} className="my-1">
                  <div className="border-t border-gray-200 dark:border-gray-600" />
                </div>
              );
            }

            const IconComponent = item.icon;
            const isDisabled = item.disabled;

            return (
              <button
                key={item.id}
                onClick={!isDisabled ? () => {
                  item.onClick();
                  if (!item.requiresConfirmation) {
                    onToggle();
                  }
                } : undefined}
                disabled={isDisabled}
                className={`
                  flex items-center w-full px-4 py-3 text-sm transition-colors
                  ${isDisabled 
                    ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed' 
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                  }
                `}
              >
                <div className="flex items-center flex-1">
                  <IconComponent className={`h-4 w-4 mr-3 ${getColorClasses(item.color)}`} />
                  <div className="flex-1 text-left">
                    <div className={`font-medium ${getColorClasses(item.color)}`}>
                      {item.label}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {item.description}
                    </div>
                  </div>
                  {item.badge !== undefined && (
                    <span className="ml-2 px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Confirmation Dialog */}
        {showConfirmation && (
          <div className="border-t border-gray-200 dark:border-gray-600 p-4 bg-yellow-50 dark:bg-yellow-900/20">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <span className="font-medium text-yellow-800 dark:text-yellow-200">
                Confirm Action
              </span>
            </div>
            <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-4">
              Are you sure you want to archive this policy? This action can be undone later.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  onArchive?.(policy);
                  setShowConfirmation(null);
                  onToggle();
                }}
                className="flex-1 px-3 py-2 bg-yellow-600 hover:bg-yellow-700 text-white text-sm font-medium rounded-md transition-colors"
              >
                Archive
              </button>
              <button
                onClick={() => setShowConfirmation(null)}
                className="flex-1 px-3 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-200 text-sm font-medium rounded-md transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

// Enhanced Action Bar for Grid View
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
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <div className="flex items-center justify-between gap-2">
      {/* Quick Actions */}
      <QuickActions
        policy={policy}
        onViewDetails={onViewDetails}
        onAddBeneficiary={onAddBeneficiary}
        onRemoveBeneficiary={onRemoveBeneficiary}
        onEdit={onEdit}
        onDownload={onDownload}
      />

      {/* More Options */}
      <div className="relative">
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border border-transparent hover:border-gray-200 dark:hover:border-gray-600"
          title="More options"
        >
          <MoreVertical className="h-4 w-4" />
        </button>

        <EnhancedDropdownMenu
          policy={policy}
          isOpen={dropdownOpen}
          onToggle={() => setDropdownOpen(!dropdownOpen)}
          onViewDetails={onViewDetails}
          onAddBeneficiary={onAddBeneficiary}
          onRemoveBeneficiary={onRemoveBeneficiary}
          onEdit={onEdit}
          onDownload={onDownload}
          onArchive={onArchive}
          onFavorite={onFavorite}
        />
      </div>
    </div>
  );
};

// Enhanced Action Bar for Table View
export const EnhancedTableActionBar = ({ 
  policy, 
  onViewDetails, 
  onAddBeneficiary, 
  onRemoveBeneficiary,
  onEdit,
  onDownload,
  onArchive,
  onFavorite
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setDropdownOpen(!dropdownOpen)}
        className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 hover:shadow-sm border border-transparent hover:border-gray-200 dark:hover:border-gray-600"
        title="Policy actions"
      >
        <MoreVertical className="h-4 w-4" />
      </button>

      <EnhancedDropdownMenu
        policy={policy}
        isOpen={dropdownOpen}
        onToggle={() => setDropdownOpen(!dropdownOpen)}
        onViewDetails={onViewDetails}
        onAddBeneficiary={onAddBeneficiary}
        onRemoveBeneficiary={onRemoveBeneficiary}
        onEdit={onEdit}
        onDownload={onDownload}
        onArchive={onArchive}
        onFavorite={onFavorite}
      />
    </div>
  );
};

// Bulk Actions Bar
export const BulkActionsBar = ({ 
  selectedPolicies, 
  onBulkAction, 
  onClearSelection 
}) => {
  const bulkActions = [
    { id: 'export', label: 'Export Selected', icon: Download, color: 'blue' },
    { id: 'archive', label: 'Archive Selected', icon: Archive, color: 'orange' },
    { id: 'favorite', label: 'Add to Favorites', icon: Star, color: 'yellow' }
  ];

  if (selectedPolicies.length === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-40">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-600 px-6 py-4">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {selectedPolicies.length} selected
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            {bulkActions.map((action) => {
              const IconComponent = action.icon;
              return (
                <button
                  key={action.id}
                  onClick={() => onBulkAction(action.id, selectedPolicies)}
                  className={`
                    flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all hover:shadow-sm
                    ${action.color === 'blue' ? 'text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20' : ''}
                    ${action.color === 'orange' ? 'text-orange-600 hover:text-orange-700 hover:bg-orange-50 dark:hover:bg-orange-900/20' : ''}
                    ${action.color === 'yellow' ? 'text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50 dark:hover:bg-yellow-900/20' : ''}
                  `}
                  title={action.label}
                >
                  <IconComponent className="h-4 w-4" />
                  <span className="hidden sm:inline">{action.label}</span>
                </button>
              );
            })}
          </div>
          
          <div className="border-l border-gray-200 dark:border-gray-600 pl-4">
            <button
              onClick={onClearSelection}
              className="flex items-center gap-2 px-3 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors text-sm font-medium"
              title="Clear selection"
            >
              <XCircle className="h-4 w-4" />
              <span className="hidden sm:inline">Clear</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Floating Action Button for mobile (optional)
export const FloatingActionButton = ({ 
  policy, 
  onViewDetails, 
  onAddBeneficiary 
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const actions = [
    {
      label: 'View Details',
      icon: Eye,
      onClick: () => onViewDetails(policy),
      color: 'bg-blue-600 hover:bg-blue-700'
    },
    {
      label: 'Add Beneficiary',
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
        <div className="absolute bottom-16 right-0 space-y-3 mb-2">
          {actions.map((action, index) => {
            const IconComponent = action.icon;
            return (
              <div key={index} className="flex items-center gap-3">
                <span className="bg-gray-900 text-white px-3 py-2 rounded-lg text-sm whitespace-nowrap shadow-lg">
                  {action.label}
                </span>
                <button
                  onClick={() => {
                    action.onClick();
                    setIsOpen(false);
                  }}
                  className={`w-12 h-12 rounded-full shadow-lg flex items-center justify-center text-white transition-all transform hover:scale-105 ${action.color}`}
                >
                  <IconComponent className="h-5 w-5" />
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
        className={`w-14 h-14 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg flex items-center justify-center transition-all transform ${isOpen ? 'rotate-45 scale-110' : 'hover:scale-105'}`}
      >
        {isOpen ? <XCircle className="h-6 w-6" /> : <MoreVertical className="h-6 w-6" />}
      </button>
    </div>
  );
};