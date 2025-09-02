import React, { useState } from "react";
import { 
  Home, 
  FileText, 
  Shield, 
  Settings, 
  MessageSquare, 
  ChevronsLeft,
  ChevronsRight
} from "lucide-react";

export const EmployeeDashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("Dashboard");

  const menuItems = [
    { id: "Dashboard", label: "Dashboard", icon: Home },
    { id: "Claims", label: "Claims", icon: FileText },
    { id: "Policies", label: "Policies", icon: Shield },
    { id: "Settings", label: "Settings", icon: Settings },
    { id: "Messages", label: "Messages", icon: MessageSquare },
  ];

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const StatBox = ({ title, value, subtitle, gradient, Icon }) => (
    <div className="p-6 border border-gray-200 bg-white">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-medium text-gray-700 uppercase tracking-wide">
          {title}
        </h3>
        <div
          className={`w-10 h-10 ${gradient} flex items-center justify-center`}
        >
          <Icon className="w-5 h-5 text-white" />
        </div>
      </div>
      <p className="text-3xl font-semibold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case "Dashboard":
        return (
          <div className="p-8 space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-gray-200">
              <StatBox
                title="Active Claims"
                value="3"
                subtitle="2 pending review"
                gradient="bg-gradient-to-br from-pink-400 to-orange-400"
                Icon={FileText}
              />
              <StatBox
                title="Policies"
                value="5"
                subtitle="All up to date"
                gradient="bg-gradient-to-br from-blue-400 to-cyan-400"
                Icon={Shield}
              />
              <StatBox
                title="Messages"
                value="2"
                subtitle="New messages"
                gradient="bg-gradient-to-br from-purple-400 to-pink-400"
                Icon={MessageSquare}
              />
            </div>

            {/* Recent Activity */}
            <div className="bg-white border border-gray-200">
              <h3 className="px-6 py-4 text-sm font-semibold text-gray-700 uppercase tracking-wide border-b">
                Recent Activity
              </h3>
              <div className="divide-y divide-gray-200">
                <div className="flex items-start space-x-3 p-6">
                  <div className="w-8 h-8 bg-gradient-to-br from-pink-400 to-orange-400 flex items-center justify-center">
                    <FileText className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Claim submitted</p>
                    <p className="text-sm text-gray-600">
                      Your medical claim has been submitted for review
                    </p>
                    <p className="text-xs text-gray-500 mt-1">2 hours ago</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3 p-6">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center">
                    <Shield className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Policy updated</p>
                    <p className="text-sm text-gray-600">
                      Your health insurance policy has been renewed
                    </p>
                    <p className="text-xs text-gray-500 mt-1">1 day ago</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      default:
        return (
          <div className="p-8">
            <div className="bg-white border border-gray-200 p-12 text-center">
              <h2 className="text-xl font-bold text-gray-800 mb-3">
                {activeTab} Page
              </h2>
              <p className="text-gray-600">
                {activeTab} functionality coming soon
              </p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? "w-64" : "w-16"
        } bg-white border-r border-gray-200 transition-all duration-300 ease-in-out flex flex-col`}
      >
        {/* Logo Section */}
        <div className="p-4 border-b border-gray-200 flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-pink-400 via-purple-400 to-cyan-400 flex items-center justify-center">
            <div className="w-4 h-4 bg-white"></div>
          </div>
          {sidebarOpen && (
            <h1 className="text-lg font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 bg-clip-text text-transparent">
              Lumiere
            </h1>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center px-3 py-2 text-sm transition-all ${
                  activeTab === item.id
                    ? "bg-gradient-to-r from-pink-100 to-cyan-100 text-gray-900 font-medium"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                } ${sidebarOpen ? "space-x-3" : "justify-center"}`}
              >
                <IconComponent className="w-5 h-5 flex-shrink-0" />
                {sidebarOpen && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>

        {/* Toggle Button */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={toggleSidebar}
            className="w-full flex items-center justify-center text-gray-600 hover:text-gray-900 transition"
          >
            {sidebarOpen ? (
              <ChevronsLeft className="w-5 h-5" />
            ) : (
              <ChevronsRight className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-semibold text-gray-800">
              Employee Dashboard
            </h1>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-pink-400 to-cyan-400 flex items-center justify-center text-white text-sm font-medium">
                JD
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-gray-800">John Doe</p>
                <p className="text-xs text-gray-600">Employee</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">{renderContent()}</main>
      </div>
    </div>
  );
};


