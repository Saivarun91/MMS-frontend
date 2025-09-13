"use client";

import "../globals.css";
import DashboardSidebar from "@/components/DashboardSidebar";
import Protected from "@/components/Protected";
import { SidebarProvider, useSidebar } from "@/context/SidebarContext";

function DashboardLayoutContent({ children }) {
  const { isDashboardSidebarCollapsed } = useSidebar();

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Admin Sidebar */}
      <DashboardSidebar />

      {/* Main Content */}
      <main
        className={`flex-1 overflow-y-auto p-6 md:p-8 transition-all duration-300 ${
          isDashboardSidebarCollapsed ? "ml-0 lg:ml-16" : "ml-0 lg:ml-64"
        }`}
      >
        <div className="max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  );
}

export default function DashboardLayoutClient({ children }) {
  return (
    <Protected allowedRoles={["Admin", "MDGT"]}>
      <SidebarProvider>
        <DashboardLayoutContent>{children}</DashboardLayoutContent>
      </SidebarProvider>
    </Protected>
  );
}
