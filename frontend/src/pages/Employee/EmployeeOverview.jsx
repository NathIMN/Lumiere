
import React from 'react';
import { FileText, Clock, CheckCircle, AlertCircle, DollarSign, Calendar, Hospital, Activity } from 'lucide-react';

export const EmployeeOverview = () => {
  // Sample data based on your API structure
  const statistics = {
    totalClaims: 16,
    statusStats: [
      { _id: "draft", count: 6, totalRequested: 0, totalApproved: 0 },
      { _id: "insurer", count: 1, totalRequested: 2323.97, totalApproved: 0 },
      { _id: "employee", count: 3, totalRequested: 21.99, totalApproved: 0 },
      { _id: "hr", count: 6, totalRequested: 132310, totalApproved: 0 }
    ],
    typeStats: [
      { _id: "life", count: 13, totalRequested: 76878.96, totalApproved: 0 },
      { _id: "vehicle", count: 3, totalRequested: 57777, totalApproved: 0 }
    ]
  };

  const pendingClaims = [
    {
      claimId: "LC000022",
      claimAmount: { requested: 21.99 },
      claimType: "life",
      lifeClaimOption: "hospitalization",
      createdAt: "2025-09-22T06:32:30.056Z",
      questionnaire: {
        sections: [
          {
            responses: [
              { questionText: "Name of the hospital where treatment was received", answer: { textValue: "dwd" } },
              { questionText: "Date of hospital admission", answer: { dateValue: "2025-09-16T00:00:00.000Z" } }
            ]
          }
        ]
      }
    },
    {
      claimId: "LC000021",
      claimType: "life",
      lifeClaimOption: "hospitalization",
      createdAt: "2025-09-22T06:16:23.562Z"
    },
    {
      claimId: "LC000013",
      claimType: "life",
      lifeClaimOption: "hospitalization",
      createdAt: "2025-09-21T08:54:19.432Z"
    }
  ];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'employee': return 'bg-orange-100 text-orange-800';
      case 'hr': return 'bg-blue-100 text-blue-800';
      case 'insurer': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const totalRequested = statistics.statusStats.reduce((sum, stat) => sum + stat.totalRequested, 0);
  const employeeActionCount = statistics.statusStats.find(s => s._id === 'employee')?.count || 0;

  return (
    <div className="p-6  min-h-screen">
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Total Claims</p>
              <p className="text-3xl font-bold text-slate-900">{statistics.totalClaims}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Pending Actions</p>
              <p className="text-3xl font-bold text-orange-600">{employeeActionCount}</p>
            </div>
            <div className="p-3 bg-orange-100 rounded-lg">
              <Clock className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Total Requested</p>
              <p className="text-3xl font-bold text-green-600">{formatCurrency(totalRequested)}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Life Claims</p>
              <p className="text-3xl font-bold text-purple-600">
                {statistics.typeStats.find(t => t._id === 'life')?.count || 0}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Activity className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Claims Status Overview */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center mb-6">
            <div className="p-2 bg-slate-100 rounded-lg mr-3">
              <Activity className="h-5 w-5 text-slate-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900">Claims by Status</h3>
          </div>
          
          <div className="space-y-4">
            {statistics.statusStats.map((stat) => (
              <div key={stat._id} className="flex items-center justify-between p-4 rounded-lg bg-slate-50">
                <div className="flex items-center">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(stat._id)}`}>
                    {stat._id}
                  </span>
                  <span className="ml-3 text-sm font-medium text-slate-700">{stat.count} claims</span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-slate-900">{formatCurrency(stat.totalRequested)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Claims Requiring Action */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg mr-3">
                <AlertCircle className="h-5 w-5 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">Action Required</h3>
            </div>
            {pendingClaims.length > 0 && (
              <span className="bg-orange-100 text-orange-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                {pendingClaims.length} pending
              </span>
            )}
          </div>

          <div className="space-y-3">
            {pendingClaims.length > 0 ? (
              pendingClaims.map((claim) => (
                <div key={claim.claimId} className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <Hospital className="h-4 w-4 text-slate-400 mr-2" />
                        <span className="font-medium text-slate-900">{claim.claimId}</span>
                        <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                          {claim.claimType} - {claim.lifeClaimOption}
                        </span>
                      </div>
                      <div className="flex items-center text-sm text-slate-600">
                        <Calendar className="h-4 w-4 mr-1" />
                        Created {formatDate(claim.createdAt)}
                      </div>
                    </div>
                    {claim.claimAmount?.requested && (
                      <div className="text-right">
                        <p className="text-sm font-semibold text-slate-900">
                          {formatCurrency(claim.claimAmount.requested)}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                <p className="text-slate-600">No pending actions required</p>
                <p className="text-sm text-slate-500">All claims are up to date</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Stats Bar */}
      <div className="mt-8 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-slate-900">
              {statistics.typeStats.reduce((sum, type) => sum + type.count, 0)}
            </div>
            <div className="text-sm text-slate-600">Total Claims Filed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {statistics.statusStats.find(s => s._id === 'hr')?.count || 0}
            </div>
            <div className="text-sm text-slate-600">Under HR Review</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {statistics.statusStats.find(s => s._id === 'insurer')?.count || 0}
            </div>
            <div className="text-sm text-slate-600">With Insurer</div>
          </div>
        </div>
      </div>
    </div>
  );
};


