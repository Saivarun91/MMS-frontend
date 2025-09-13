"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Building2,
  Users,
  LogOut,
  User,
  ShieldCheck,
  ChevronUp,
  ChevronDown,
  Building,
  Mail,
  Menu,
  X,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useAuth } from "../context/AuthContext";
import { useSidebar } from "../context/SidebarContext";

export default function DashboardSidebar() {
  const pathname = usePathname();
  const { user, role, logout } = useAuth();
  const { isDashboardSidebarCollapsed, setIsDashboardSidebarCollapsed } =
    useSidebar();
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showScrollBottom, setShowScrollBottom] = useState(false);
  const navRef = useRef(null);

  // Scroll indicators
  useEffect(() => {
    const element = navRef.current;
    const checkScroll = () => {
      if (element) {
        const { scrollTop, scrollHeight, clientHeight } = element;
        setShowScrollTop(scrollTop > 20);
        setShowScrollBottom(scrollTop < scrollHeight - clientHeight - 20);
      }
    };
    if (element) {
      element.addEventListener("scroll", checkScroll);
      checkScroll();
    }
    return () => element?.removeEventListener("scroll", checkScroll);
  }, []);

  const navItems = [
    { name: "Overview", href: "/dashboard", icon: Home },
    { name: "Employees/Users", href: "/dashboard/employees", icon: Users },
    { name: "Companies", href: "/dashboard/companies", icon: Building },
    { name: "Projects", href: "/dashboard/projects", icon: Building2 },
    { name: "Approvals", href: "/dashboard/approvals", icon: ShieldCheck },
    { name: "Permissions", href: "/dashboard/permissions", icon: ShieldCheck },
    { name: "Roles", href: "/dashboard/roles", icon: ShieldCheck },
    { name: "Email Domains", href: "/dashboard/email-domains", icon: Mail },
    { name: "User Dashboard", href: "/app", icon: Home },
  ];

  return (
    <>
      {/* Sidebar */}
      <aside
        className={`h-screen bg-gradient-to-b from-violet-800 via-purple-800 to-violet-900 flex flex-col fixed left-0 top-0 shadow-2xl z-40 transition-all duration-500
          ${isDashboardSidebarCollapsed ? "w-20" : "w-64"}`}
      >
        {/* Logo + Collapse button */}
<div className="flex items-center justify-between px-4 py-4 border-b border-violet-600/30 shrink-0">
  {/* Logo */}
  <Image
    src="https://meil.in/sites/default/files/meil_logo_old_update_24.png"
    alt="MEIL Logo"
    className={`bg-white rounded-md transition-all duration-500 
      ${isDashboardSidebarCollapsed ? "w-8 h-8" : "w-2/3 p-2"}`}
    width={200}
    height={200}
  />

  {/* Collapse Button */}
  <button
    onClick={() =>
      setIsDashboardSidebarCollapsed(!isDashboardSidebarCollapsed)
    }
    className="p-2 rounded-lg bg-violet-700/40 hover:bg-violet-600/60 transition-colors"
  >
    {isDashboardSidebarCollapsed ? (
      <ChevronDown size={18} className="text-white" />
    ) : (
      <ChevronUp size={18} className="text-white" />
    )}
  </button>
</div>


        {/* User card */}
        {user && !isDashboardSidebarCollapsed && (
          <div className="px-4 py-3 mt-4 mx-4 bg-violet-700/40 rounded-xl flex items-center gap-3 backdrop-blur-sm border border-violet-500/30 shadow-md">
            <div className="bg-gradient-to-r from-violet-600 to-purple-600 p-2 rounded-full shadow-md">
              <User size={16} className="text-white" />
            </div>
            <div className="text-white text-sm">
              <p className="font-medium">{user.emp_name || user.email}</p>
              <p className="text-xs opacity-80">Role: {role || "N/A"}</p>
            </div>
          </div>
        )}

        {/* Nav */}
        <nav
          ref={navRef}
          className="flex-1 mt-4 overflow-y-auto scrollbar-thin scrollbar-thumb-violet-600 scrollbar-track-violet-900/30"
        >
          <ul className="space-y-2 px-2 pb-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-3 rounded-xl font-medium transition-all duration-300 ${
                      isActive
                        ? "bg-gradient-to-r from-purple-600 to-violet-700 text-white shadow-lg"
                        : "text-violet-100 hover:bg-violet-700/40 hover:text-white"
                    }`}
                  >
                    <Icon size={20} />
                    {!isDashboardSidebarCollapsed && (
                      <span className="whitespace-nowrap">{item.name}</span>
                    )}
                  </Link>
                </li>
              );
            })}

            {/* Logout */}
            {user && (
              <li className="mt-4">
                <button
                  onClick={logout}
                  className="flex items-center gap-3 px-3 py-3 rounded-xl font-medium w-full text-left text-violet-100 hover:bg-violet-700/40 hover:text-white border border-violet-600/30 hover:border-violet-500/50"
                >
                  <LogOut size={20} />
                  {!isDashboardSidebarCollapsed && <span>Logout</span>}
                </button>
              </li>
            )}
          </ul>
        </nav>
      </aside>
    </>
  );
}
