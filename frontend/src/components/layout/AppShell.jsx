import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import TopHeader from './TopHeader';
import CommandPalette from './CommandPalette';
import NotificationsDrawer from './NotificationsDrawer';
import HelpModal from './HelpModal';
import api from '../../services/api';

export default function AppShell({ children }) {
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isBackendHealthy, setIsBackendHealthy] = useState(true);
  const [recentEvents, setRecentEvents] = useState([]);

  useEffect(() => {
    async function checkHealthAndEvents() {
      try {
        const [healthRes, auditRes] = await Promise.all([
          api.getHealth().catch(() => ({ success: false })),
          api.getAuditEvents({ limit: 8 }).catch(() => ({ success: false })),
        ]);

        setIsBackendHealthy(healthRes.success !== false && healthRes.status !== 'DOWN');
        if (auditRes.success) {
          setRecentEvents(auditRes.events || auditRes.logs || []);
        }
      } catch (err) {
        setIsBackendHealthy(false);
      }
    }

    checkHealthAndEvents();
    const interval = setInterval(checkHealthAndEvents, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#F4F7FE] dark:bg-[#0B1437] text-slate-900 dark:text-white flex flex-col font-body transition-colors duration-300">
      
      {/* Top Header */}
      <TopHeader
        onOpenCommandPalette={setIsCommandPaletteOpen}
        onOpenNotifications={setIsNotificationsOpen}
        onOpenHelp={setIsHelpOpen}
        onToggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        notificationCount={recentEvents.filter(e => e.status === 'BLOCKED' || e.action === 'ATTACK_DETECTED').length}
        isBackendHealthy={isBackendHealthy}
      />

      {/* Main Body Container with Sidebar & Content */}
      <div className="flex-1 flex max-w-[1600px] w-full mx-auto">
        
        {/* Left Persistent / Responsive Sidebar */}
        <Sidebar
          isMobileOpen={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
          isBackendConnected={isBackendHealthy}
        />

        {/* Dynamic Page Content */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* Global Modals & Drawers */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={setIsCommandPaletteOpen}
      />

      <NotificationsDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
        events={recentEvents}
      />

      <HelpModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />

    </div>
  );
}
