import { useState, useEffect, useMemo } from 'react';
import { 
  ClipboardCheck, 
  FileText, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Filter,
  Search,
  Calendar,
  Users,
  DollarSign,
  Eye,
  ChevronRight,
  Info,
  Bell,
  Target,
  Plus,
  Send,
  MessageSquare,
  ArrowRight,
  Activity
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AgentOverview = () => {
  const navigate = useNavigate();
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriority, setFilterPriority] = useState('All');
  const [dateRange, setDateRange] = useState('Today');
  const [showNotifications, setShowNotifications] = useState(true);

  // Enhanced mock data with questionnaire features
  const [dashboardData] = useState({
    statistics: {
      pendingClaims: { value: 23, trend: +2, target: 20, status: 'warning' },
      approvedToday: { value: 12, trend: +5, target: 10, status: 'success' },
      totalEmployees: { value: 156, trend: -1, target: 160, status: 'info' },
      questionnaires: { value: 8, trend: +1, target: 5, status: 'success' },
      pendingResponses: { value: 12, trend: +3, target: 10, status: 'warning' },
      completedResponses: { value: 8, trend: +2, target: 15, status: 'info' },
      activeTemplates: { value: 5, trend: 0, target: 8, status: 'success' }
    },
    recentClaims: [
      {
        id: "CLM-001",
        employee: "John Doe",
        department: "Engineering",
        amount: "$5,000",
        status: "Pending",
        priority: "High",
        submitted: "2024-01-15",
        daysWaiting: 3,
        insuranceType: "Life Insurance",
        progress: 25,
        nextAction: "Medical Review Required"
      },
      {
        id: "CLM-002",
        employee: "Jane Smith",
        department: "Marketing",
        amount: "$2,500",
        status: "Under Review",
        priority: "Medium",
        submitted: "2024-01-14",
        daysWaiting: 4,
        insuranceType: "Vehicle Insurance",
        progress: 60,
        nextAction: "Awaiting Documentation"
      }
    ],
    notifications: [
      { id: 1, type: 'urgent', message: 'CLM-001 requires immediate attention - 3 days overdue', time: '2 min ago' },
      { id: 2, type: 'info', message: 'New questionnaire response from John Doe (CLM-001)', time: '30 min ago' },
      { id: 3, type: 'success', message: 'Health Insurance questionnaire template updated', time: '2 hours ago' }
    ],
    questionnaireActivity: [
      {
        employee: "John Doe",
        questionnaire: "Life Insurance Assessment",
        status: "completed",
        submittedAt: "2 hours ago",
        claimId: "CLM-001"
      },
      {
        employee: "Sarah Wilson", 
        questionnaire: "Vehicle Damage Assessment",
        status: "pending",
        sentAt: "1 day ago",
        claimId: "CLM-003"
      },
      {
        employee: "Mike Johnson",
        questionnaire: "Health Insurance Pre-approval",
        status: "completed",
        submittedAt: "3 hours ago", 
        claimId: "CLM-002"
      }
    ]
  });

  // Filtered claims with validation
  const filteredClaims = useMemo(() => {
    let filtered = dashboardData.recentClaims;

    if (searchTerm.trim()) {
      filtered = filtered.filter(claim =>
        claim.employee.toLowerCase().includes(searchTerm.toLowerCase()) ||
        claim.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        claim.department.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterPriority !== 'All') {
      filtered = filtered.filter(claim => claim.priority === filterPriority);
    }

    return filtered;
  }, [searchTerm, filterPriority, dashboardData.recentClaims]);

  // Auto refresh with validation
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isRefreshing) {
        setLastUpdated(new Date());
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [isRefreshing]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to refresh data:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const getStatusColor = (status) => {
    const statusColors = {
      'Pending': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      'Under Review': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
      'Approved': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      'Rejected': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
    };
    return statusColors[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
  };

  const getPriorityColor = (priority) => {
    const priorityColors = {
      'High': 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
      'Medium': 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
      'Low': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
    };
    return priorityColors[priority] || 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
  };

  const handleClaimClick = (claimId) => {
    if (claimId && claimId.trim()) {
      navigate(`/agent/claims-review/${claimId}`);
    }
  };

  const handleQuickAction = (action) => {
    switch (action) {
      case 'review-claims':
      case 'pendingclaims':
        navigate('/agent/claims-review');
        break;
      case 'questionnaires':
        navigate('/agent/questionnaires');
        break;
      case 'view-all-claims':
        navigate('/agent/claims-review');
        break;
      default:
        console.log(`Action ${action} not implemented`);
    }
  };

  return (
    <div className="p-6 space-y-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      {/* Enhanced Header with Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Dashboard Overview
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Welcome back! Here's what's happening with your claims and policies.
          </p>
          <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Last updated: {lastUpdated.toLocaleTimeString()}
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              {dateRange}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="Today">Today</option>
            <option value="This Week">This Week</option>
            <option value="This Month">This Month</option>
            <option value="Last 30 Days">Last 30 Days</option>
          </select>

          <button 
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white px-6 py-2 rounded-lg transition-colors duration-200 font-medium"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      {/* Notifications Bar */}
      {showNotifications && dashboardData.notifications.length > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/50 dark:to-purple-900/50 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h3 className="font-semibold text-gray-900 dark:text-white">Notifications</h3>
            </div>
            <button
              onClick={() => setShowNotifications(false)}
              className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white text-xl"
            >
              ×
            </button>
          </div>
          <div className="space-y-2">
            {dashboardData.notifications.slice(0, 2).map((notification) => (
              <div key={notification.id} className="flex items-center gap-3 text-sm">
                <div className={`w-2 h-2 rounded-full ${
                  notification.type === 'urgent' ? 'bg-red-400' :
                  notification.type === 'success' ? 'bg-green-400' : 'bg-blue-400'
                }`} />
                <span className="text-gray-700 dark:text-gray-300 flex-1">{notification.message}</span>
                <span className="text-gray-500 dark:text-gray-400">{notification.time}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Enhanced Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Object.entries(dashboardData.statistics).slice(0, 4).map(([key, stat]) => {
          const icons = {
            pendingClaims: { icon: Clock, color: 'yellow', bgLight: 'bg-yellow-50', bgDark: 'dark:bg-yellow-900/20' },
            approvedToday: { icon: CheckCircle, color: 'green', bgLight: 'bg-green-50', bgDark: 'dark:bg-green-900/20' },
            totalEmployees: { icon: Users, color: 'blue', bgLight: 'bg-blue-50', bgDark: 'dark:bg-blue-900/20' },
            questionnaires: { icon: ClipboardCheck, color: 'purple', bgLight: 'bg-purple-50', bgDark: 'dark:bg-purple-900/20' }
          };

          const config = icons[key];
          const IconComponent = config.icon;
          const isAboveTarget = stat.value >= stat.target;

          return (
            <div
              key={key}
              className={`${config.bgLight} ${config.bgDark} bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-300 cursor-pointer hover:transform hover:scale-105 shadow-sm`}
              onClick={() => handleQuickAction(key.replace(/([A-Z])/g, '-$1').toLowerCase())}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 bg-${config.color}-100 dark:bg-${config.color}-900/30 rounded-lg`}>
                  <IconComponent className={`w-8 h-8 text-${config.color}-600 dark:text-${config.color}-400`} />
                </div>
                <div className="flex items-center gap-1 text-xs">
                  {stat.trend > 0 ? (
                    <TrendingUp className="w-3 h-3 text-green-500" />
                  ) : (
                    <TrendingDown className="w-3 h-3 text-red-500" />
                  )}
                  <span className={stat.trend > 0 ? 'text-green-500' : 'text-red-500'}>
                    {stat.trend > 0 ? '+' : ''}{stat.trend}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-3xl font-bold text-gray-900 dark:text-white">{stat.value}</div>
                <div className={`text-sm font-medium text-${config.color}-700 dark:text-${config.color}-400 capitalize`}>
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </div>
                
                <div className="mt-3">
                  <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
                    <span>Target: {stat.target}</span>
                    <span>{Math.round((stat.value / stat.target) * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        isAboveTarget ? 'bg-green-500' : 'bg-yellow-500'
                      }`}
                      style={{ width: `${Math.min((stat.value / stat.target) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Questionnaire Management Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Questionnaire Management
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Create, send, and review questionnaire responses
            </p>
          </div>
          <button 
            onClick={() => navigate('/agent/questionnaires/create')}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Questionnaire
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Pending Responses */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                <Clock className="w-8 h-8 text-orange-600 dark:text-orange-400" />
              </div>
              <span className="text-xs text-orange-600 dark:text-orange-400 font-medium">
                AWAITING RESPONSE
              </span>
            </div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">12</div>
            <div className="text-sm text-orange-600 dark:text-orange-400 font-medium mb-2">
              Pending Employee Responses
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Average response time: 2.5 days
            </div>
            <button className="w-full mt-4 bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-lg text-sm transition-colors">
              Send Reminders
            </button>
          </div>

          {/* Completed Responses */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                READY FOR REVIEW
              </span>
            </div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">8</div>
            <div className="text-sm text-green-600 dark:text-green-400 font-medium mb-2">
              Completed Responses
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Awaiting your review
            </div>
            <button 
              onClick={() => navigate('/agent/questionnaires/responses')}
              className="w-full mt-4 bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg text-sm transition-colors"
            >
              Review Responses
            </button>
          </div>

          {/* Active Templates */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <FileText className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              </div>
              <span className="text-xs text-purple-600 dark:text-purple-400 font-medium">
                TEMPLATES
              </span>
            </div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">5</div>
            <div className="text-sm text-purple-600 dark:text-purple-400 font-medium mb-2">
              Active Templates
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Health, Vehicle, Life, Property
            </div>
            <button 
              onClick={() => navigate('/agent/questionnaires/templates')}
              className="w-full mt-4 bg-purple-500 hover:bg-purple-600 text-white py-2 rounded-lg text-sm transition-colors"
            >
              Manage Templates
            </button>
          </div>
        </div>
      </div>

      {/* Questionnaire Workflow Process */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 mb-8">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
          Questionnaire Workflow Process
        </h2>
        
        <div className="flex items-center justify-between">
          {/* Step 1 */}
          <div className="flex flex-col items-center text-center flex-1">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-3">
              <Plus className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Create Questionnaire</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Build custom forms for specific claims</p>
          </div>

          <ArrowRight className="w-8 h-8 text-gray-400 mx-4" />

          {/* Step 2 */}
          <div className="flex flex-col items-center text-center flex-1">
            <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center mb-3">
              <Send className="w-8 h-8 text-orange-600 dark:text-orange-400" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Send to Employee</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Employee receives and fills questionnaire</p>
          </div>

          <ArrowRight className="w-8 h-8 text-gray-400 mx-4" />

          {/* Step 3 */}
          <div className="flex flex-col items-center text-center flex-1">
            <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mb-3">
              <MessageSquare className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Review Responses</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Analyze answers and supporting documents</p>
          </div>

          <ArrowRight className="w-8 h-8 text-gray-400 mx-4" />

          {/* Step 4 */}
          <div className="flex flex-col items-center text-center flex-1">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-3">
              <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Make Decision</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Approve or reject based on responses</p>
          </div>
        </div>
      </div>

      {/* Recent Questionnaire Activity */}
      <div className="mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Recent Questionnaire Activity
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Latest questionnaire submissions and responses
              </p>
            </div>
            <button 
              onClick={() => navigate('/agent/questionnaires')}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium flex items-center gap-1"
            >
              View All <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-4">
            {dashboardData.questionnaireActivity.map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    activity.status === 'completed' 
                      ? 'bg-green-100 dark:bg-green-900/30' 
                      : 'bg-orange-100 dark:bg-orange-900/30'
                  }`}>
                    {activity.status === 'completed' ? (
                      <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
                    ) : (
                      <Clock className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {activity.employee} • {activity.claimId}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {activity.questionnaire}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    activity.status === 'completed'
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                      : 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300'
                  }`}>
                    {activity.status === 'completed' ? 'Completed' : 'Pending'}
                  </span>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {activity.submittedAt || activity.sentAt}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Enhanced Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Enhanced Recent Claims */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Recent Claims ({filteredClaims.length})
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Latest claims requiring your attention
              </p>
            </div>
            <button
              onClick={() => handleQuickAction('view-all-claims')}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium flex items-center gap-1"
            >
              View All <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Enhanced Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search claims, employees, or departments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-white"
                >
                  ×
                </button>
              )}
            </div>
            
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="px-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="All">All Priorities</option>
              <option value="High">High Priority</option>
              <option value="Medium">Medium Priority</option>
              <option value="Low">Low Priority</option>
            </select>
          </div>

          {/* Enhanced Claims List */}
          <div className="space-y-4">
            {filteredClaims.length > 0 ? (
              filteredClaims.map((claim) => (
                <div
                  key={claim.id}
                  onClick={() => handleClaimClick(claim.id)}
                  className="group bg-white dark:bg-gray-800 rounded-lg p-4 hover:bg-gradient-to-r hover:from-gray-50 hover:to-blue-50 dark:hover:from-gray-700 dark:hover:to-blue-900/30 transition-all duration-300 cursor-pointer border border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-xl transform hover:scale-[1.01]"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-bold text-gray-900 dark:text-white text-lg group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors">
                          {claim.id}
                        </h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(claim.status)} shadow-sm`}>
                          {claim.status}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(claim.priority)} shadow-sm`}>
                          {claim.priority} Priority
                        </span>
                        {claim.daysWaiting > 2 && (
                          <span className="px-2 py-1 bg-red-600 text-white rounded-full text-xs flex items-center gap-1 shadow-sm animate-pulse">
                            <AlertCircle className="w-3 h-3" />
                            {claim.daysWaiting}d overdue
                          </span>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="space-y-1">
                          <span className="text-gray-500 dark:text-gray-400 text-xs font-semibold uppercase tracking-wide">Employee</span>
                          <p className="text-gray-900 dark:text-white font-bold text-base group-hover:text-gray-900 dark:group-hover:text-white">
                            {claim.employee}
                          </p>
                          <p className="text-gray-600 dark:text-gray-300 font-medium group-hover:text-gray-700 dark:group-hover:text-gray-200">
                            {claim.department}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <span className="text-gray-500 dark:text-gray-400 text-xs font-semibold uppercase tracking-wide">Insurance</span>
                          <p className="text-gray-900 dark:text-white font-bold text-base group-hover:text-gray-900 dark:group-hover:text-white">
                            {claim.insuranceType}
                          </p>
                          <p className="text-gray-600 dark:text-gray-300 font-medium group-hover:text-gray-700 dark:group-hover:text-gray-200">
                            Amount: <span className="font-bold text-green-600 dark:text-green-400">{claim.amount}</span>
                          </p>
                        </div>
                        <div className="space-y-1">
                          <span className="text-gray-500 dark:text-gray-400 text-xs font-semibold uppercase tracking-wide">Next Action</span>
                          <p className="text-gray-900 dark:text-white font-bold text-base group-hover:text-gray-900 dark:group-hover:text-white">
                            {claim.nextAction}
                          </p>
                          <p className="text-gray-600 dark:text-gray-300 font-medium group-hover:text-gray-700 dark:group-hover:text-gray-200">
                            Submitted: {claim.submitted}
                          </p>
                        </div>
                      </div>

                      {/* Enhanced Progress Bar */}
                      <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-750 rounded-lg group-hover:bg-white dark:group-hover:bg-gray-700 transition-colors">
                        <div className="flex justify-between text-xs text-gray-700 dark:text-gray-300 mb-2 font-bold">
                          <span>Processing Progress</span>
                          <span className="text-lg font-bold">{claim.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-3 shadow-inner">
                          <div
                            className={`h-3 rounded-full transition-all duration-500 shadow-sm ${
                              claim.progress === 100 ? 'bg-gradient-to-r from-green-400 to-green-600' :
                              claim.progress >= 50 ? 'bg-gradient-to-r from-blue-400 to-blue-600' : 
                              'bg-gradient-to-r from-yellow-400 to-orange-500'
                            }`}
                            style={{ width: `${claim.progress}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="ml-6 text-right flex flex-col items-end">
                      <p className="text-3xl font-black text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mb-3">
                        {claim.amount}
                      </p>
                      <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 group-hover:bg-blue-700 group-hover:scale-110 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 shadow-lg hover:shadow-xl">
                        <Eye className="w-4 h-4" />
                        Review
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-16 text-gray-500 dark:text-gray-400">
                <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                  <FileText className="w-12 h-12 opacity-50" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-700 dark:text-gray-300">No claims found</h3>
                <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
                  Try adjusting your search criteria or filter options to find the claims you're looking for.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Enhanced Performance Overview & Quick Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Target className="w-5 h-5" />
              Performance Overview
            </h2>
          </div>

          <div className="space-y-6">
            {/* Processing Efficiency */}
            <div className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Claims Processed</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-blue-800 dark:text-blue-400">87/100</span>
                  <Info className="w-4 h-4 text-blue-600 dark:text-blue-400" title="Target: 100 claims per month" />
                </div>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-2">
                <div className="bg-blue-500 h-3 rounded-full" style={{ width: '87%' }}></div>
              </div>
              <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
                <span>Target: 90</span>
                <span className="text-green-600 dark:text-green-400">Above Target</span>
              </div>
            </div>

            {/* Response Time */}
            <div className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 rounded-lg p-4 border border-green-200 dark:border-green-800">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-green-700 dark:text-green-300">Avg Response Time</span>
                <span className="text-lg font-bold text-green-800 dark:text-green-400">2.3 days</span>
              </div>
              <p className="text-xs text-green-600 dark:text-green-500">12% faster than last month</p>
            </div>

            {/* Enhanced Quick Actions */}
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Quick Actions</h3>
              
              <button
                onClick={() => handleQuickAction('review-claims')}
                className="w-full bg-yellow-500 hover:bg-yellow-600 text-white p-3 rounded-lg flex items-center justify-between transition-colors shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5" />
                  <span>Review Pending Claims</span>
                </div>
                <span className="bg-white/20 px-2 py-1 rounded text-sm">
                  {dashboardData.statistics.pendingClaims.value}
                </span>
              </button>

              <button
                onClick={() => navigate('/agent/questionnaires/create')}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-lg flex items-center justify-between transition-colors shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <Plus className="w-5 h-5" />
                  <span>Create Questionnaire</span>
                </div>
                <span className="bg-white/20 px-2 py-1 rounded text-sm">
                  New
                </span>
              </button>

              <button
                onClick={() => navigate('/agent/questionnaires/responses')}
                className="w-full bg-green-500 hover:bg-green-600 text-white p-3 rounded-lg flex items-center justify-between transition-colors shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <MessageSquare className="w-5 h-5" />
                  <span>Review Responses</span>
                </div>
                <span className="bg-white/20 px-2 py-1 rounded text-sm">
                  8
                </span>
              </button>

              <button
                onClick={() => handleQuickAction('questionnaires')}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-lg flex items-center justify-between transition-colors shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <ClipboardCheck className="w-5 h-5" />
                  <span>Manage Templates</span>
                </div>
                <span className="bg-white/20 px-2 py-1 rounded text-sm">
                  {dashboardData.statistics.questionnaires.value}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentOverview;
