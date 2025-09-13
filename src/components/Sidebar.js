"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  FilePlus,
  ShieldCheck,
  LogOut,
  User,
  Package,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { useSidebar } from "../context/SidebarContext";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, role, logout } = useAuth();
  const { isMainSidebarCollapsed, setIsMainSidebarCollapsed } = useSidebar();

  const navItems = [
    { name: "Home", href: "/app", icon: Home },
    { name: "Search", href: "/search", icon: Search },
    ...(role === "Employee" || role === "MDGT"
      ? [{ name: "Requests", href: "/requests", icon: FilePlus }]
      : []),
    ...(role === "Employee"
      ? [{ name: "Materials", href: "/materials", icon: Package }]
      : []),
    ...(role === "MDGT"
      ? [{ name: "Governance", href: "/governance", icon: ShieldCheck }]
      : []),
    ...(role === "Admin"
      ? [{ name: "Admin Panel", href: "/dashboard", icon: Home }]
      : []),
  ];

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsMainSidebarCollapsed(!isMainSidebarCollapsed)}
        className="lg:hidden fixed top-4 left-4 z-50 bg-[#2f3190] text-white p-2 rounded-md shadow-lg transition-all hover:scale-105 hover:shadow-xl"
      >
        {isMainSidebarCollapsed ? (
          <span className="text-xl">&#9776;</span>
        ) : (
          <span className="text-xl">×</span>
        )}
      </button>

      <aside
        className={`${isMainSidebarCollapsed ? "w-16" : "w-64"} 
          h-screen bg-[#2f3190] flex flex-col fixed left-0 top-0 shadow-xl z-40 
          transition-all duration-300`}
      >
        {/* Logo + Collapse Button */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-white/10">
          {!isMainSidebarCollapsed ? (
            <Image
              src="https://meil.in/sites/default/files/meil_logo_old_update_24.png"
              alt="MEIL Logo"
              className="bg-amber-50 w-2/3 p-2 rounded-md"
              width={600}
              height={300}
            />
          ) : (
            <div className="bg-amber-50 w-10 h-10 p-2 rounded-md flex items-center justify-center">
              <span className="text-[#2f3190] font-bold text-lg">M</span>
            </div>
          )}

          {/* Collapse/Expand button beside logo */}
          <button
            onClick={() => setIsMainSidebarCollapsed(!isMainSidebarCollapsed)}
            className="ml-2 text-white hover:text-gray-300 transition"
            title={isMainSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isMainSidebarCollapsed ? (
              <ChevronRight size={22} />
            ) : (
              <ChevronLeft size={22} />
            )}
          </button>
        </div>

        {/* User Info */}
        {user && !isMainSidebarCollapsed && (
          <div className="px-4 py-3 mt-4 mx-4 bg-white/10 rounded-lg flex items-center gap-3">
            <div className="bg-[#7F56D9] p-2 rounded-full">
              <User size={16} className="text-white" />
            </div>
            <div className="text-white text-sm">
              <p className="font-medium">{user.emp_name || user.email}</p>
              <p className="text-xs opacity-80">Role: {role || "N/A"}</p>
            </div>
          </div>
        )}

        {user && isMainSidebarCollapsed && (
          <div className="px-2 py-3 mt-4 mx-2 bg-white/10 rounded-lg flex items-center justify-center">
            <div className="bg-[#7F56D9] p-2 rounded-full">
              <User size={16} className="text-white" />
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 mt-6 overflow-y-auto">
          <ul className="space-y-2 px-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all group relative overflow-hidden 
                      ${
                        isActive
                          ? "bg-red-500 text-white shadow-lg"
                          : "text-gray-300 hover:bg-white/10 hover:text-white"
                      } ${isMainSidebarCollapsed ? "justify-center" : ""}`}
                    title={isMainSidebarCollapsed ? item.name : ""}
                  >
                    <Icon size={20} className={isActive ? "animate-pulse" : ""} />
                    {!isMainSidebarCollapsed && (
                      <>
                        {item.name}
                        {isActive && (
                          <span className="absolute right-3 w-2 h-2 bg-white rounded-full animate-ping"></span>
                        )}
                      </>
                    )}
                  </Link>
                </li>
              );
            })}

            {user && (
              <li>
                <button
                  onClick={logout}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all w-full text-left text-gray-300 hover:bg-white/10 hover:text-white ${
                    isMainSidebarCollapsed ? "justify-center" : ""
                  }`}
                  title={isMainSidebarCollapsed ? "Logout" : ""}
                >
                  <LogOut size={20} />
                  {!isMainSidebarCollapsed && "Logout"}
                </button>
              </li>
            )}
          </ul>
        </nav>

        {/* Footer */}
        {!isMainSidebarCollapsed && (
          <div className="p-4 border-t border-white/10 text-xs text-gray-400">
            © {new Date().getFullYear()} MEIL MDM
            <p className="mt-1 text-[10px] opacity-70">v2.0 Enhanced</p>
          </div>
        )}
      </aside>

      {/* Overlay for mobile */}
      {!isMainSidebarCollapsed && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden backdrop-blur-sm transition-all duration-300"
          onClick={() => setIsMainSidebarCollapsed(true)}
        />
      )}
    </>
  );
}
