import { Outlet } from 'react-router-dom';
import { LayoutDashboard, FileText, HelpCircle, ClipboardCheck, CheckCircle, TrendingUp } from 'lucide-react';
import { Header } from '../../components/dashboard/Header';
import { SideBar } from '../../components/dashboard/SideBar';

export const AgentDashboard = ({ 
  isDark, 
  isCollapsed, 
  scrolled, 
  onToggleTheme, 
  onToggleSidebar 
}) => {
  const agentLinks = [
    { path: '/agent/overview', label: 'Agent Portal', icon: LayoutDashboard },
    { path: '/agent/claims-review', label: 'Claims Review', icon: FileText },
    { path: '/agent/questionnaires', label: 'Questionnaires', icon: HelpCircle },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex">
      {/* Sidebar - Fixed */}
      <div className={`fixed left-0 top-0 h-full z-30 transition-all duration-300 ${
        isCollapsed ? 'w-20' : 'w-72'
      }`}>
        <SideBar 
          links={agentLinks} 
          toggleSidebar={onToggleSidebar} 
          isCollapsed={isCollapsed} 
        />
      </div>

      {/* Main Content Area */}
      <div className={`flex-1 transition-all duration-300 ${
        isCollapsed ? 'ml-20' : 'ml-72'
      }`}>
        {/* Header - Fixed to content area */}
        <div className="sticky top-0 z-20 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700">
          <Header 
            onToggleTheme={onToggleTheme} 
            isDark={isDark} 
            isCollapsed={isCollapsed} 
            scrolled={scrolled} 
          />
        </div>

        {/* Page Content */}
        <main className="bg-gray-50 dark:bg-gray-900 min-h-screen">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
