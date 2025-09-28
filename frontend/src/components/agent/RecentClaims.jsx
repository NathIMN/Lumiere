import { useState } from 'react';
import { FileText, Search, Filter, Eye, Edit, MoreHorizontal } from "lucide-react";

export const RecentClaims = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');

  const claims = [
    {
      id: "CLM-001",
      customer: "John Doe",
      type: "Life Insurance", 
      amount: "$5,000",
      date: "2024-01-15",
      status: "Pending",
      statusColor: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
      priority: "High"
    },
    {
      id: "CLM-002",
      customer: "Jane Smith",
      type: "Vehicle Insurance",
      amount: "$2,500", 
      date: "2024-01-14",
      status: "Approved",
      statusColor: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
      priority: "Medium"
    },
    {
      id: "CLM-003",
      customer: "Mike Johnson",
      type: "Life Insurance",
      amount: "$8,000",
      date: "2024-01-14", 
      status: "Under Review",
      statusColor: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
      priority: "High"
    },
  ];

  const filteredClaims = claims.filter(claim => {
    const matchesSearch = claim.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         claim.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'All' || claim.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const handleViewClaim = (claimId) => {
    console.log(`Viewing claim: ${claimId}`);
  };

  const handleEditClaim = (claimId) => {
    console.log(`Editing claim: ${claimId}`);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
      {/* Enhanced Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <FileText className="w-6 h-6 text-gray-500 dark:text-gray-400 mr-3" />
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Recent Claims ({filteredClaims.length})
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Latest claims requiring your attention
            </p>
          </div>
        </div>
        
        <button className="text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 text-sm font-medium transition-colors">
          View All
        </button>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            placeholder="Search claims or customer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>
        
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        >
          <option value="All">All Status</option>
          <option value="Pending">Pending</option>
          <option value="Approved">Approved</option>
          <option value="Under Review">Under Review</option>
        </select>
      </div>

      {/* Claims List */}
      <div className="space-y-4">
        {filteredClaims.length > 0 ? (
          filteredClaims.map((claim, index) => (
            <div
              key={index}
              className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 hover:bg-gray-100 dark:hover:bg-gray-600 transition-all duration-200 group border border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
                      {claim.id}
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${claim.statusColor}`}>
                      {claim.status}
                    </span>
                    {claim.priority === 'High' && (
                      <span className="px-2 py-1 bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 rounded-full text-xs font-medium">
                        High Priority
                      </span>
                    )}
                  </div>
                  <p className="text-gray-700 dark:text-gray-300 font-medium">
                    {claim.customer}
                  </p>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    {claim.type}
                  </p>
                </div>

                <div className="flex items-start gap-4">
                  <div className="text-right">
                    <p className="font-bold text-gray-900 dark:text-white text-lg">
                      {claim.amount}
                    </p>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                      {claim.date}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button
                      onClick={() => handleViewClaim(claim.id)}
                      className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                      title="View details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleEditClaim(claim.id)}
                      className="p-2 bg-gray-500 dark:bg-gray-600 hover:bg-gray-600 dark:hover:bg-gray-700 text-white rounded-lg transition-colors"
                      title="Edit claim"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button className="p-2 bg-gray-500 dark:bg-gray-600 hover:bg-gray-600 dark:hover:bg-gray-700 text-white rounded-lg transition-colors">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No claims match your search criteria</p>
          </div>
        )}
      </div>
    </div>
  );
};
