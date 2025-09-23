import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  FileText,
  User,
  Calendar,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Upload,
  Download,
  Eye,
  MessageSquare,
  Phone,
  Mail,
  Shield,
  Activity,
  Save,
  Send,
  MoreHorizontal,
  Paperclip,
  Image as ImageIcon
} from 'lucide-react';

const ClaimReviewDetails = () => {
  const { claimId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [reviewNotes, setReviewNotes] = useState('');
  const [decision, setDecision] = useState('');
  const [requiredDocuments, setRequiredDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Mock claim data - in real app, fetch from API
  const [claimData] = useState({
    id: "CLM-001",
    employee: {
      name: "John Doe",
      id: "EMP-12345",
      department: "Engineering",
      email: "john.doe@company.com",
      phone: "+1 (555) 123-4567",
      hireDate: "2020-03-15",
      manager: "Sarah Wilson"
    },
    insurance: {
      type: "Life Insurance",
      policyNumber: "LI-789456",
      coverage: "$100,000",
      premium: "$150/month",
      startDate: "2020-04-01",
      beneficiaries: ["Jane Doe (Spouse)", "Mike Doe (Son)"]
    },
    claim: {
      amount: "$5,000",
      submittedDate: "2024-01-15",
      incidentDate: "2024-01-10",
      status: "Pending",
      priority: "High",
      reason: "Medical treatment for chronic condition",
      description: "Emergency medical treatment required for pre-existing heart condition. Patient admitted to St. Mary's Hospital for cardiac catheterization procedure.",
      daysWaiting: 3
    },
    documents: [
      { name: "Medical Report.pdf", type: "pdf", size: "2.4 MB", status: "verified", uploadDate: "2024-01-15" },
      { name: "Hospital Bill.pdf", type: "pdf", size: "1.1 MB", status: "pending", uploadDate: "2024-01-15" },
      { name: "Doctor Certificate.jpg", type: "image", size: "856 KB", status: "verified", uploadDate: "2024-01-16" },
      { name: "Insurance Card.pdf", type: "pdf", size: "342 KB", status: "verified", uploadDate: "2024-01-15" }
    ],
    timeline: [
      { date: "2024-01-15", event: "Claim submitted by employee", type: "submission" },
      { date: "2024-01-15", event: "Initial documents uploaded", type: "documents" },
      { date: "2024-01-16", event: "Additional medical certificate provided", type: "documents" },
      { date: "2024-01-17", event: "Assigned to Agent John Smith", type: "assignment" },
      { date: "2024-01-18", event: "Under review - pending medical verification", type: "review" }
    ],
    reviewHistory: [
      { agent: "System", date: "2024-01-15", note: "Automatic validation passed - all required fields completed" },
      { agent: "Agent Smith", date: "2024-01-17", note: "Initial review completed. Requesting additional medical documentation." }
    ]
  });

  const handleApprove = async () => {
    setIsLoading(true);
    try {
      // API call to approve claim
      await new Promise(resolve => setTimeout(resolve, 2000));
      alert('Claim approved successfully!');
      navigate('/agent/claims-review');
    } catch (error) {
      console.error('Error approving claim:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReject = async () => {
    if (!reviewNotes.trim()) {
      alert('Please provide rejection reason in review notes');
      return;
    }
    setIsLoading(true);
    try {
      // API call to reject claim
      await new Promise(resolve => setTimeout(resolve, 2000));
      alert('Claim rejected successfully!');
      navigate('/agent/claims-review');
    } catch (error) {
      console.error('Error rejecting claim:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestDocuments = () => {
    alert('Document request sent to employee');
  };

  const getStatusColor = (status) => {
    const colors = {
      'Pending': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      'Approved': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      'Rejected': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
      'Under Review': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: FileText },
    { id: 'documents', label: 'Documents', icon: Paperclip },
    { id: 'timeline', label: 'Timeline', icon: Activity },
    { id: 'questionnaire', label: 'Questionnaire', icon: MessageSquare }
  ];

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/agent/claims-review')}
            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Claim Review - {claimData.id}
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              {claimData.insurance.type} • Submitted {claimData.claim.submittedDate}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(claimData.claim.status)}`}>
            {claimData.claim.status}
          </span>
          {claimData.claim.priority === 'High' && (
            <span className="px-3 py-1 bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 rounded-full text-sm font-medium flex items-center gap-1">
              <AlertTriangle className="w-4 h-4" />
              High Priority
            </span>
          )}
        </div>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <DollarSign className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Claim Amount</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">{claimData.claim.amount}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <Clock className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Days Waiting</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">{claimData.claim.daysWaiting} days</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <Shield className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Coverage</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">{claimData.insurance.coverage}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <FileText className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Documents</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">{claimData.documents.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Tabs Content */}
        <div className="lg:col-span-2">
          {/* Tab Navigation */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 mb-6">
            <div className="border-b border-gray-200 dark:border-gray-700">
              <nav className="flex space-x-8 px-6">
                {tabs.map((tab) => {
                  const IconComponent = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                        activeTab === tab.id
                          ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                          : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                      }`}
                    >
                      <IconComponent className="w-4 h-4" />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Employee Information */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Employee Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <User className="w-4 h-4 text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Name</p>
                            <p className="font-medium text-gray-900 dark:text-white">{claimData.employee.name}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                            <p className="font-medium text-gray-900 dark:text-white">{claimData.employee.email}</p>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <Phone className="w-4 h-4 text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Phone</p>
                            <p className="font-medium text-gray-900 dark:text-white">{claimData.employee.phone}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Department</p>
                            <p className="font-medium text-gray-900 dark:text-white">{claimData.employee.department}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Claim Details */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Claim Details</h3>
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2">{claimData.claim.reason}</h4>
                      <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
                        {claimData.claim.description}
                      </p>
                      <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Incident Date:</span>
                          <span className="ml-2 text-gray-900 dark:text-white font-medium">{claimData.claim.incidentDate}</span>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Submitted:</span>
                          <span className="ml-2 text-gray-900 dark:text-white font-medium">{claimData.claim.submittedDate}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Insurance Information */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Insurance Policy</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Policy Number</p>
                        <p className="font-medium text-gray-900 dark:text-white">{claimData.insurance.policyNumber}</p>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Monthly Premium</p>
                        <p className="font-medium text-gray-900 dark:text-white">{claimData.insurance.premium}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'documents' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Uploaded Documents</h3>
                    <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors">
                      <Upload className="w-4 h-4" />
                      Request Additional
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    {claimData.documents.map((doc, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                            {doc.type === 'pdf' ? (
                              <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            ) : (
                              <ImageIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{doc.name}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{doc.size} • {doc.uploadDate}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            doc.status === 'verified' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                            'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300'
                          }`}>
                            {doc.status}
                          </span>
                          <button className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors">
                            <Eye className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                          </button>
                          <button className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors">
                            <Download className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'timeline' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Claim Timeline</h3>
                  <div className="space-y-4">
                    {claimData.timeline.map((event, index) => (
                      <div key={index} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                            event.type === 'submission' ? 'bg-blue-100 dark:bg-blue-900/30' :
                            event.type === 'documents' ? 'bg-green-100 dark:bg-green-900/30' :
                            event.type === 'assignment' ? 'bg-purple-100 dark:bg-purple-900/30' :
                            'bg-orange-100 dark:bg-orange-900/30'
                          }`}>
                            {event.type === 'submission' && <Send className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
                            {event.type === 'documents' && <FileText className="w-4 h-4 text-green-600 dark:text-green-400" />}
                            {event.type === 'assignment' && <User className="w-4 h-4 text-purple-600 dark:text-purple-400" />}
                            {event.type === 'review' && <Eye className="w-4 h-4 text-orange-600 dark:text-orange-400" />}
                          </div>
                          {index < claimData.timeline.length - 1 && (
                            <div className="w-0.5 h-8 bg-gray-200 dark:bg-gray-600 mt-2"></div>
                          )}
                        </div>
                        <div className="flex-1 pb-8">
                          <div className="flex items-center justify-between">
                            <p className="font-medium text-gray-900 dark:text-white">{event.event}</p>
                            <span className="text-sm text-gray-500 dark:text-gray-400">{event.date}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'questionnaire' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Life Insurance Questionnaire</h3>
                    <span className="px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 rounded-full text-sm font-medium">
                      Completed
                    </span>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2">Medical History</h4>
                      <p className="text-gray-600 dark:text-gray-300 text-sm">
                        Patient has a history of coronary artery disease diagnosed in 2019. Currently on medication and under regular cardiologist supervision.
                      </p>
                    </div>
                    
                    <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2">Current Treatment</h4>
                      <p className="text-gray-600 dark:text-gray-300 text-sm">
                        Emergency cardiac catheterization performed on 2024-01-10 due to chest pain and irregular heartbeat. Procedure successful, patient stable.
                      </p>
                    </div>
                    
                    <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2">Supporting Documents</h4>
                      <ul className="text-gray-600 dark:text-gray-300 text-sm space-y-1">
                        <li>• Medical report from cardiologist</li>
                        <li>• Hospital admission records</li>
                        <li>• Procedure documentation</li>
                        <li>• Treatment cost breakdown</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Action Panel */}
        <div className="space-y-6">
          {/* Review Actions */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Review Actions</h3>
            
            {/* Review Notes */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Review Notes
              </label>
              <textarea
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                rows={4}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Add your review notes, recommendations, or reasons for decision..."
              />
            </div>

            {/* Decision Buttons */}
            <div className="space-y-3">
              <button
                onClick={handleApprove}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-green-800 text-white px-4 py-3 rounded-lg font-medium transition-colors"
              >
                <CheckCircle className="w-5 h-5" />
                {isLoading ? 'Processing...' : 'Approve Claim'}
              </button>
              
              <button
                onClick={handleReject}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 disabled:bg-red-800 text-white px-4 py-3 rounded-lg font-medium transition-colors"
              >
                <XCircle className="w-5 h-5" />
                {isLoading ? 'Processing...' : 'Reject Claim'}
              </button>
              
              <button
                onClick={handleRequestDocuments}
                className="w-full flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-4 py-3 rounded-lg font-medium transition-colors"
              >
                <Upload className="w-5 h-5" />
                Request Documents
              </button>
            </div>
          </div>

          {/* Contact Employee */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Contact Employee</h3>
            <div className="space-y-3">
              <button className="w-full flex items-center gap-3 p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors">
                <Phone className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Call Employee</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{claimData.employee.phone}</p>
                </div>
              </button>
              
              <button className="w-full flex items-center gap-3 p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors">
                <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Send Email</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{claimData.employee.email}</p>
                </div>
              </button>
            </div>
          </div>

          {/* Review History */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Review History</h3>
            <div className="space-y-3">
              {claimData.reviewHistory.map((review, index) => (
                <div key={index} className="border-l-2 border-blue-200 dark:border-blue-800 pl-4">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-medium text-gray-900 dark:text-white text-sm">{review.agent}</p>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{review.date}</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{review.note}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClaimReviewDetails;
