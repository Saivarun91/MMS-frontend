// app/(main)/layout.js
"use client"; // ✅ make this a client component

import Sidebar from "@/components/Sidebar";
import { SidebarProvider, useSidebar } from "@/context/SidebarContext";
import "../globals.css";

function MainLayoutContent({ children }) {
    const { isMainSidebarCollapsed } = useSidebar();

    return (
        <div className="flex min-h-screen bg-white">
            <Sidebar />
            <main
                className={`flex-1 overflow-y-auto p-6 md:p-8 transition-all duration-300 ${
                    isMainSidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'
                }`}
            >
                <div className="max-w-7xl mx-auto">{children}</div>
            </main>
        </div>
    );
}

export default function MainLayout({ children }) {
    return (
        <SidebarProvider>
            <MainLayoutContent>{children}</MainLayoutContent>
        </SidebarProvider>
    );
}
