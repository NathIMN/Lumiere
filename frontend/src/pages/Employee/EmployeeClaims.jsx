
import React, { useState } from 'react';
import { Plus, Search, Filter, FileText, Clock, CheckCircle, XCircle, AlertCircle, Upload, MessageSquare, Eye, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const EmployeeClaims = () => {
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const claims = [
    {
      claimId: 'LC000001',
      claimType: 'life',
      claimOption: 'hospitalization',
      claimAmount: { requested: 15000 },
      claimStatus: 'approved',
      submittedAt: '2024-09-10',
      createdAt: '2024-09-08'
    },
    {
      claimId: 'VC000001',
      claimType: 'vehicle',
      claimOption: 'accident',
      claimAmount: { requested: 45000 },
      claimStatus: 'hr',
      submittedAt: '2024-09-14',
      createdAt: '2024-09-12'
    },
    {
      claimId: 'LC000002',
      claimType: 'life',
      claimOption: 'medication',
      claimAmount: { requested: 8500 },
      claimStatus: 'employee',
      submittedAt: null,
      createdAt: '2024-09-15'
    },
    {
      claimId: 'VC000002',
      claimType: 'vehicle',
      claimOption: 'theft',
      claimAmount: { requested: 75000 },
      claimStatus: 'rejected',
      submittedAt: '2024-09-08',
      createdAt: '2024-09-05'
    },
    {
      claimId: 'LC000003',
      claimType: 'life',
      claimOption: 'death',
      claimAmount: { requested: 100000 },
      claimStatus: 'insurer',
      submittedAt: '2024-09-12',
      createdAt: '2024-09-10'
    },
    {
      claimId: 'LC000004',
      claimType: 'life',
      claimOption: 'channelling',
      claimAmount: { requested: 3500 },
      claimStatus: 'draft',
      submittedAt: null,
      createdAt: '2024-09-16'
    }
  ];

  const getDisplayStatus = (status) => {
    if (['employee', 'hr', 'insurer'].includes(status)) {
      return 'processing';
    }
    return status;
  };

  const getStatusColor = (status) => {
    const displayStatus = getDisplayStatus(status);
    switch (displayStatus) {
      case 'approved': return 'text-emerald-700 bg-emerald-100 border-emerald-200';
      case 'processing': return 'text-amber-700 bg-amber-100 border-amber-200';
      case 'draft': return 'text-gray-700 bg-gray-100 border-gray-200';
      case 'rejected': return 'text-red-700 bg-red-100 border-red-200';
      default: return 'text-gray-700 bg-gray-100 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    const displayStatus = getDisplayStatus(status);
    switch (displayStatus) {
      case 'approved': return <CheckCircle size={16} />;
      case 'processing': return <Clock size={16} />;
      case 'draft': return <FileText size={16} />;
      case 'rejected': return <XCircle size={16} />;
      default: return <FileText size={16} />;
    }
  };

  const getCategoryColor = (claimType) => {
    switch (claimType) {
      case 'life': return 'border-l-pink-500';
      case 'vehicle': return 'border-l-blue-500';
      default: return 'border-l-gray-500';
    }
  };

  const filteredClaims = claims.filter(claim => {
    const displayStatus = getDisplayStatus(claim.claimStatus);
    const matchesFilter = activeFilter === 'all' || displayStatus === activeFilter;
    const matchesSearch = claim.claimId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         claim.claimType.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         claim.claimOption.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const stats = {
    total: claims.length,
    approved: claims.filter(c => c.claimStatus === 'approved').length,
    processing: claims.filter(c => ['employee', 'hr', 'insurer'].includes(c.claimStatus)).length,
    draft: claims.filter(c => c.claimStatus === 'draft').length,
    rejected: claims.filter(c => c.claimStatus === 'rejected').length
  };

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-light text-gray-900 mb-2">Claims Portal</h1>
              <p className="text-gray-600">Manage your submissions and track progress</p>
            </div>
            <button onClick={() => (navigate("/employee/claim_form"))} className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 px-6 py-3 rounded-full text-white font-medium flex items-center gap-2 transition-all duration-300 shadow-lg hover:shadow-xl">
              <Plus size={20} />
              New Claim
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 text-center shadow-sm">
              <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
              <div className="text-sm text-gray-600">Total Claims</div>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 text-center shadow-sm">
              <div className="text-2xl font-bold text-gray-600">{stats.draft}</div>
              <div className="text-sm text-gray-500">Draft</div>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-center shadow-sm">
              <div className="text-2xl font-bold text-amber-600">{stats.processing}</div>
              <div className="text-sm text-amber-600">Processing</div>
            </div>
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-center shadow-sm">
              <div className="text-2xl font-bold text-emerald-600">{stats.approved}</div>
              <div className="text-sm text-emerald-600">Approved</div>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-center shadow-sm">
              <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
              <div className="text-sm text-red-600">Rejected</div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search claims by ID, type, or option..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-full text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent shadow-sm"
              />
            </div>
            <div className="flex gap-2">
              {['all', 'draft', 'processing', 'approved', 'rejected'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                    activeFilter === filter
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {filter.charAt(0).toUpperCase() + filter.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Claims List */}
        <div className="space-y-4">
          {filteredClaims.map((claim, index) => (
            <div
              key={claim.claimId}
              className={`bg-white border border-gray-200 rounded-2xl p-6 transition-all duration-300 hover:shadow-lg hover:scale-[1.01] border-l-4 shadow-sm ${getCategoryColor(claim.claimType)}`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                
                {/* Claim Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(claim.claimStatus)}`}>
                      {getStatusIcon(claim.claimStatus)}
                      {getDisplayStatus(claim.claimStatus).charAt(0).toUpperCase() + getDisplayStatus(claim.claimStatus).slice(1)}
                    </div>
                    <span className="text-gray-500 text-sm font-mono">{claim.claimId}</span>
                  </div>
                  
                  <h3 className="text-xl font-semibold text-gray-900 mb-1 capitalize">
                    {claim.claimType} Insurance - {claim.claimOption}
                  </h3>
                  
                  <div className="flex items-center gap-6 text-sm text-gray-600">
                    <span>Created: {new Date(claim.createdAt).toLocaleDateString()}</span>
                    {claim.submittedAt && <span>Submitted: {new Date(claim.submittedAt).toLocaleDateString()}</span>}
                    <span className="text-gray-900 font-semibold">Rs. {claim.claimAmount.requested?.toLocaleString()}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  <button className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 transition-colors duration-200">
                    <Eye size={16} />
                  </button>
                  <button className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 transition-colors duration-200">
                    <MessageSquare size={16} />
                  </button>
                  <button className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 transition-colors duration-200">
                    <Upload size={16} />
                  </button>
                  <button className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 transition-colors duration-200">
                    <Download size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredClaims.length === 0 && (
          <div className="text-center py-12">
            <FileText className="mx-auto text-slate-500 mb-4" size={64} />
            <h3 className="text-xl text-slate-400 mb-2">No claims found</h3>
            <p className="text-slate-500">Try adjusting your search or filter criteria</p>
          </div>
        )}

        {/* Quick Actions Footer */}
        <div className="mt-12 flex flex-wrap gap-4 justify-center">
          <button className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors duration-200">
            <Upload size={16} />
            Bulk Upload
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors duration-200">
            <Download size={16} />
            Export All
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors duration-200">
            <MessageSquare size={16} />
            Contact Support
          </button>
        </div>
      </div>
    </div>
  );
};