"use client";

import React from "react";
import { useAuth } from "@/hooks/use-auth";
import Sidebar from "@/components/dashboard/Sidebar";
import AppHeader from "@/components/layout/AppHeader";
import Link from "next/link";
import { useRouter } from "next/navigation";
interface LayoutProps {
  children: React.ReactNode;
}
const Layout: React.FC<LayoutProps> = ({ children }) => {
  const router = useRouter();
  const { user, logout } = useAuth();

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <AppHeader
          user={user}
          onLogout={logout}
          onProfileClick={() => {
            router.push("/profilesettings");
            // Navigate to profile settings
            // <Link
            //   href={`/profilesettings`}
            //   // className={cn(
            //   //   "block w-full text-left px-3 py-2 text-sm rounded-md transition-colors",
            //   //   isProjectActive(project.id, "subreddits")
            //   //     ? "bg-blue-100 text-blue-700"
            //   //     : "text-gray-600 hover:bg-gray-100"
            //   // )}
            // >
            //   - Settings
            // </Link>;
          }}
        />
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
};

export default Layout;
