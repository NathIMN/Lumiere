import React, { useState } from "react";
import { 
  Home, 
  FileText, 
  Shield, 
  MessageSquare,
  Settings,
  Bell,
  User,
  Table,
  LogIn,
  UserPlus,
  DollarSign,
  Users,
  UserCheck,
  BarChart3,
  Eye,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

/**
 * Lumiere gradient colors (used consistently)
 * coral -> pink -> purple -> cyan
 * #ff7a66 (coral), #ff6fa8 (pink), #8b5cf6 (purple), #06b6d4 (cyan)
 *
 * We'll use Tailwind arbitrary values for exactness where helpful,
 * and fallback to combined gradients for visual continuity.
 */

// Reusable Sidebar Component (tabs changed)
const Sidebar = ({ activeTab, setActiveTab, sidebarOpen = true, toggleSidebar = () => {} }) => {
  const menuItems = [
    { id: "Dashboard", label: "Dashboard", icon: Home },
    { id: "Claims", label: "Claims", icon: FileText },
    { id: "Policies", label: "Policies", icon: Shield },
    { id: "Messages", label: "Messages", icon: MessageSquare },
    { id: "Settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className={`${sidebarOpen ? "w-64" : "w-16"} bg-white shadow-sm border-r border-gray-200 h-full flex flex-col transition-all duration-300 ease-in-out`}>
      {/* Logo */}
      <div className="p-6">
        <div className="flex items-center space-x-3">
          <div
            className="w-9 h-9 flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg,#ff7a66 0%, #ff6fa8 40%, #8b5cf6 70%, #06b6d4 100%)",
            }}
          >
            <div className="w-4 h-4 bg-white" />
          </div>

          {sidebarOpen && (
            <h1
              className="text-xl font-bold"
              style={{
                background: "linear-gradient(90deg,#ff7a66,#ff6fa8,#8b5cf6,#06b6d4)",
                WebkitBackgroundClip: "text",
                color: "transparent",
              }}
            >
              Lumiere
            </h1>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = activeTab === item.id;

            return (
              <li key={item.id}>
                <button
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full h-12 flex items-center transition-all duration-150 ${
                    sidebarOpen ? "px-3" : "justify-center"
                  } ${isActive ? "bg-gradient-to-r from-[#ff7a66] via-[#ff6fa8] to-[#06b6d4] text-white font-medium" : "text-gray-700 hover:bg-gray-50"}`}
                  style={{
                    borderRadius: 8,
                  }}
                >
                  <span className={`flex items-center justify-center w-8 h-8 ${isActive ? "" : ""}`}>
                    <IconComponent className={`w-5 h-5 ${isActive ? "text-white" : "text-gray-600"}`} />
                  </span>
                  {sidebarOpen && <span className={`ml-3`}>{item.label}</span>}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Toggle Button */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={toggleSidebar}
          className="w-full h-10 flex items-center justify-center text-gray-600 hover:text-gray-900 transition-all duration-150"
        >
          {sidebarOpen ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
        </button>
      </div>
    </div>
  );
};

// Reusable Header Component
const Header = ({ title, breadcrumbs }) => {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <nav className="text-sm mb-1">
            <span className="text-gray-500">Home</span>
            <span className="text-gray-400 mx-2">/</span>
            <span className="text-gray-700">{breadcrumbs || title}</span>
          </nav>
          <h1 className="text-xl font-semibold text-gray-800">{title}</h1>
        </div>

        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search"
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-opacity-80"
              style={{ borderColor: "#e5e7eb" }}
            />
          </div>

          <button className="p-2 text-gray-600 hover:text-gray-800">
            <Bell className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-3">
            <div
              className="w-8 h-8 flex items-center justify-center text-sm font-medium"
              style={{
                background: "linear-gradient(135deg,#ff7a66 0%, #ff6fa8 40%, #8b5cf6 70%)",
                color: "white",
                borderRadius: 6,
              }}
            >
              JD
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-medium text-gray-800">John Doe</p>
              <p className="text-xs text-gray-600">Employee</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

// Metric Card uses Lumiere gradient accents
const MetricCard = ({ title, value, change, changeType, icon: Icon, iconBg }) => {
  const changeColor = changeType === "positive" ? "text-green-600" : "text-red-600";
  return (
    <div className="bg-white border border-gray-200 p-5" style={{ borderRadius: 8 }}>
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`w-11 h-11 flex items-center justify-center`} style={{ borderRadius: 8, background: iconBg }}>
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
      <p className={`text-sm ${changeColor}`}>{change}</p>
    </div>
  );
};

// Simple bar-like chart (visual placeholder)
const SimpleChart = ({ title, subtitle, data, color }) => {
  return (
    <div className="bg-white border border-gray-200 p-5" style={{ borderRadius: 8 }}>
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-1">{title}</h3>
        <p className="text-sm text-gray-600">{subtitle}</p>
      </div>
      <div className="h-48 flex items-end gap-2">
        {data.map((value, idx) => (
          <div key={idx} className="flex-1 flex flex-col items-center">
            <div
              style={{
                height: `${(value / Math.max(...data)) * 100}%`,
                width: "100%",
                background: color,
                borderTopLeftRadius: 4,
                borderTopRightRadius: 4,
              }}
            />
            <span className="text-xs text-gray-500 mt-2">{["M","T","W","T","F","S","S"][idx] || idx + 1}</span>
          </div>
        ))}
      </div>
      <div className="flex items-center mt-4 pt-4 border-t border-gray-100">
        <div className="w-3 h-3 mr-2" style={{ background: "#06b6d4", borderRadius: 4 }} />
        <span className="text-sm text-gray-600">campaign sent 2 days ago</span>
      </div>
    </div>
  );
};

// Line chart placeholder via SVG
const LineChart = ({ title, subtitle, data, color }) => {
  const max = Math.max(...data);
  return (
    <div className="bg-white border border-gray-200 p-5" style={{ borderRadius: 8 }}>
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-1">{title}</h3>
        <p className="text-sm text-gray-600">{subtitle}</p>
      </div>

      <div className="h-48 relative">
        <svg className="w-full h-full" viewBox="0 0 400 200">
          <polyline
            fill="none"
            stroke={color}
            strokeWidth="3"
            points={data.map((v, i) => `${(i / (data.length - 1)) * 380 + 10},${190 - (v / max) * 170}`).join(" ")}
          />
          {data.map((v, i) => (
            <circle
              key={i}
              cx={(i / (data.length - 1)) * 380 + 10}
              cy={190 - (v / max) * 170}
              r="3"
              fill={color}
            />
          ))}
        </svg>
        <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-gray-500">
          {["Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"].map((m, idx) => <span key={idx}>{m}</span>)}
        </div>
      </div>

      <div className="flex items-center mt-4 pt-4 border-t border-gray-100">
        <div className="w-3 h-3 bg-[#ff7a66] rounded-sm mr-2"></div>
        <span className="text-sm text-gray-600">updated 4 min ago</span>
      </div>
    </div>
  );
};

// Dashboard content re-used but with Lumiere color accents
const DashboardContent = () => {
  const barData = [25, 10, 5, 20, 45, 10, 35];
  const lineData1 = [50, 70, 280, 300, 480, 350, 200, 230, 500];
  const lineData2 = [50, 70, 280, 480, 200, 250, 480, 400, 500];

  return (
    <div className="p-6 bg-gray-50 min-h-full">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <MetricCard
          title="Today's Money"
          value="$53k"
          change="+55% than last week"
          changeType="positive"
          icon={DollarSign}
          iconBg="linear-gradient(90deg,#ff7a66,#ff6fa8)"
        />
        <MetricCard
          title="Today's Users"
          value="2,300"
          change="+3% than last month"
          changeType="positive"
          icon={Users}
          iconBg="linear-gradient(90deg,#8b5cf6,#06b6d4)"
        />
        <MetricCard
          title="New Clients"
          value="3,462"
          change="-2% than yesterday"
          changeType="negative"
          icon={UserCheck}
          iconBg="linear-gradient(90deg,#06b6d4,#8b5cf6)"
        />
        <MetricCard
          title="Sales"
          value="$103,430"
          change="+5% than yesterday"
          changeType="positive"
          icon={BarChart3}
          iconBg="linear-gradient(90deg,#ff6fa8,#8b5cf6)"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <SimpleChart title="Website View" subtitle="Last Campaign Performance" data={barData} color="#ff6fa8" />
        <LineChart title="Daily Sales" subtitle="15% increase today" data={lineData1} color="#3b82f6" />
        <LineChart title="Completed Tasks" subtitle="Campaign performance" data={lineData2} color="#10b981" />
      </div>
    </div>
  );
};

const PlaceholderContent = ({ title, icon: Icon }) => (
  <div className="p-6 bg-gray-50 min-h-full">
    <div className="bg-white border border-gray-200 p-12" style={{ borderRadius: 8 }}>
      <div className="text-center">
        <Icon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">{title}</h2>
        <p className="text-gray-600">This page is under development</p>
      </div>
    </div>
  </div>
);

// Main Dashboard Component with requested tabs and color scheme
const MaterialDashboard = () => {
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => setSidebarOpen((s) => !s);

  const renderContent = () => {
    switch (activeTab) {
      case "Dashboard":
        return <DashboardContent />;
      case "Claims":
        return <PlaceholderContent title="Claims" icon={FileText} />;
      case "Policies":
        return <PlaceholderContent title="Policies" icon={Shield} />;
      case "Messages":
        return <PlaceholderContent title="Messages" icon={MessageSquare} />;
      case "Settings":
        return <PlaceholderContent title="Settings" icon={Settings} />;
      default:
        return <DashboardContent />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        sidebarOpen={sidebarOpen}
        toggleSidebar={toggleSidebar}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title={activeTab} breadcrumbs={activeTab} />
        <main className="flex-1 overflow-y-auto">{renderContent()}</main>
      </div>
    </div>
  );
};

export default MaterialDashboard;
