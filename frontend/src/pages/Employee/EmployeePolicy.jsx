import { useState, useEffect } from 'react';
import InsuranceApiService from "../../services/insurance-api";
import { 
  Shield, Car, Heart, Calendar, DollarSign, FileText, Users, 
  AlertCircle, Plus, Eye, Download, Loader2, RefreshCw, CheckCircle
} from 'lucide-react';

export const EmployeePolicy = () => {
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activePolicy, setActivePolicy] = useState(null);

  useEffect(() => {
    const fetchPolicies = async () => {
      try {
        setLoading(true);
        const response = await InsuranceApiService.getUserPolicies();
        setPolicies(response?.policies || []);
      } catch (err) {
        console.error(err);
        setError('Failed to load policies');
      } finally {
        setLoading(false);
      }
    };
    fetchPolicies();
  }, []);

  const getStatusColor = (status) => {
    const colors = {
      active: 'text-green-600 bg-green-100',
      expired: 'text-red-600 bg-red-100',
      cancelled: 'text-gray-600 bg-gray-100',
      suspended: 'text-yellow-600 bg-yellow-100',
      pending: 'text-blue-600 bg-blue-100'
    };
    return colors[status] || 'text-gray-600 bg-gray-100';
  };

  const getPolicyIcon = (type) => {
    return type === 'life' ? <Heart className="w-6 h-6 text-red-500" /> : <Car className="w-6 h-6 text-blue-500" />;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getDaysUntilExpiry = (endDate) => {
    const today = new Date();
    const expiry = new Date(endDate);
    const timeDiff = expiry.getTime() - today.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    return daysDiff;
  };

  const getAgentName = (agent) => {
    if (!agent) return 'Not assigned';
    return agent.fullName || agent.email || 'Unknown Agent';
  };

  const getMonthlyPremium = (premium) => {
    const { amount, frequency } = premium;
    switch (frequency) {
      case 'monthly':
        return amount;
      case 'quarterly':
        return amount / 3;
      case 'semi-annual':
        return amount / 6;
      case 'annual':
        return amount / 12;
      default:
        return amount;
    }
  };

  const PolicyCard = ({ policy }) => {
    const daysUntilExpiry = getDaysUntilExpiry(policy.validity.endDate);
    const isExpiringSoon = daysUntilExpiry <= 30 && daysUntilExpiry > 0;

    return (
      <div className="bg-white rounded-xl shadow-md border border-gray-200 hover:shadow-lg transition-shadow duration-200">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center space-x-3">
              {getPolicyIcon(policy.policyType)}
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {policy.policyType === 'life' ? 'Life Insurance' : 'Vehicle Insurance'}
                </h3>
                <p className="text-sm text-gray-500">Policy ID: {policy.policyId}</p>
              </div>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(policy.status)}`}>
              {policy.status.charAt(0).toUpperCase() + policy.status.slice(1)}
            </span>
          </div>

          {/* Key Details */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-sm text-gray-600">Coverage Amount</p>
              <p className="text-lg font-semibold text-gray-900">{formatCurrency(policy.coverage.coverageAmount)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Monthly Premium</p>
              <p className="text-lg font-semibold text-gray-900">{formatCurrency(getMonthlyPremium(policy.premium))}</p>
              <p className="text-xs text-gray-500">({policy.premium.frequency})</p>
            </div>
          </div>

          {/* Validity */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-600">Policy Period</p>
              {isExpiringSoon && (
                <span className="flex items-center text-xs text-amber-600">
                  <AlertCircle className="w-3 h-3 mr-1" />
                  Expires in {daysUntilExpiry} days
                </span>
              )}
            </div>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="flex justify-between text-sm">
                <span>{formatDate(policy.validity.startDate)}</span>
                <span>→</span>
                <span className={isExpiringSoon ? 'text-amber-600 font-medium' : ''}>
                  {formatDate(policy.validity.endDate)}
                </span>
              </div>
            </div>
          </div>

          {/* Coverage Types */}
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-2">Coverage Types</p>
            <div className="flex flex-wrap gap-1">
              {(policy.coverage.typeLife || policy.coverage.typeVehicle).map((type, index) => (
                <span key={index} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-md">
                  {type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </span>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between items-center pt-4 border-t border-gray-100">
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <span className="flex items-center">
                <Users className="w-4 h-4 mr-1" />
                {policy.beneficiaries ? policy.beneficiaries.length : 0} beneficiaries
              </span>
              <span className="flex items-center">
                <FileText className="w-4 h-4 mr-1" />
                {policy.documents ? policy.documents.length : 0} documents
              </span>
            </div>
            <div className="flex space-x-2">
              <button 
                onClick={() => setActivePolicy(policy)}
                className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="View Details"
              >
                <Eye className="w-4 h-4" />
              </button>
              <button className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Download">
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const PolicyDetailModal = ({ policy, onClose }) => {
    if (!policy) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-start">
              <div className="flex items-center space-x-3">
                {getPolicyIcon(policy.policyType)}
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {policy.policyType === 'life' ? 'Life Insurance Policy' : 'Vehicle Insurance Policy'}
                  </h2>
                  <p className="text-gray-500">Policy ID: {policy.policyId}</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
          </div>
          
          <div className="p-6 space-y-6">
            {/* Coverage Details */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Coverage Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {policy.coverage.coverageDetails.map((detail, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-900 capitalize">{detail.type.replace('_', ' ')}</h4>
                    <p className="text-sm text-gray-600 mt-1">{detail.description}</p>
                    <p className="text-sm font-medium text-gray-900 mt-2">
                      Limit: {formatCurrency(detail.limit)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Premium Information */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Premium Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-sm text-blue-600">Premium Amount</p>
                  <p className="text-xl font-semibold text-blue-900">{formatCurrency(policy.premium.amount)}</p>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <p className="text-sm text-green-600">Frequency</p>
                  <p className="text-xl font-semibold text-green-900 capitalize">{policy.premium.frequency}</p>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                  <p className="text-sm text-purple-600">Deductible</p>
                  <p className="text-xl font-semibold text-purple-900">{formatCurrency(policy.coverage.deductible)}</p>
                </div>
              </div>
            </div>

            {/* Agent Information */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Insurance Agent</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="font-medium text-gray-900">{getAgentName(policy.insuranceAgent)}</p>
                <p className="text-sm text-gray-600">
                  {policy.insuranceAgent?.email && `Email: ${policy.insuranceAgent.email}`}
                </p>
                <p className="text-sm text-gray-600 mt-1">Contact your agent for policy changes or claims</p>
              </div>
            </div>

            {/* Notes */}
            {policy.notes && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Policy Notes</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-700">{policy.notes}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Loading state
  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading your policies...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center bg-white rounded-lg shadow-sm p-8 max-w-md w-full">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Policies</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6  min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">My Insurance Policies</h1>
            <p className="text-gray-600">Manage and view your insurance coverage</p>
          </div>
          {policies.length < 2 && (
            <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              <Plus className="w-4 h-4 mr-2" />
              Request New Policy
            </button>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <Shield className="w-8 h-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm text-gray-600">Active Policies</p>
              <p className="text-2xl font-semibold text-gray-900">
                {policies.filter(p => p.status === 'active').length}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <DollarSign className="w-8 h-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm text-gray-600">Total Coverage</p>
              <p className="text-2xl font-semibold text-gray-900">
                {formatCurrency(policies.reduce((sum, p) => sum + p.coverage.coverageAmount, 0))}
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <Calendar className="w-8 h-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm text-gray-600">Monthly Premium</p>
              <p className="text-2xl font-semibold text-gray-900">
                {formatCurrency(policies.reduce((sum, p) => sum + getMonthlyPremium(p.premium), 0))}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Policies Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {policies.map((policy) => (
          <PolicyCard key={policy.policyId} policy={policy} />
        ))}
        
        {/* Add Policy Card (if less than 2 policies) */}
        {policies.length < 2 && (
          <div className="bg-white rounded-xl shadow-md border-2 border-dashed border-gray-300 hover:border-blue-400 transition-colors cursor-pointer">
            <div className="p-6 text-center">
              <Plus className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Add New Policy</h3>
              <p className="text-gray-600 mb-4">You can have up to 2 active insurance policies</p>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Request Policy
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Policy Detail Modal */}
      {activePolicy && (
        <PolicyDetailModal 
          policy={activePolicy} 
          onClose={() => setActivePolicy(null)} 
        />
      )}
    </div>
  );
};