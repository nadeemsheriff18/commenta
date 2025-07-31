"use client";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, Settings, LogOut } from "lucide-react";
import Link from "next/link";

interface User {
  name: string;
  email: string;
  user_id: string;
  picture?: string;
}

interface AppHeaderProps {
  user?: User | null;
  onLogout?: () => void;
  onProfileClick?: () => void;
  showAuthButtons?: boolean;
  onLoginClick?: () => void;
  onRegisterClick?: () => void;
}

export default function AppHeader({
  user,
  onLogout,
  onProfileClick,
  showAuthButtons = false,
  onLoginClick,
  onRegisterClick,
}: AppHeaderProps) {
  const handlelogout = () => {
    if (onLogout) {
      onLogout();
    }
  };
  return (
    <header className="bg-off-white border-b border-gray-200 px-6 py-4 shadow-sm">
      {/* --- MODIFIED: Changed justify-between to justify-end --- */}
      <div className="flex items-center justify-end">
        
        {/* --- REMOVED: Logo and ProjectTool title section --- */}

        <div className="flex items-center space-x-4">
          {user ? (
            <div className="flex items-center space-x-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                {/* User ID was removed as requested earlier */}
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-10 w-10 rounded-full"
                  >
                    <Avatar className="h-10 w-10">
                      {user.picture ? (
                        <img
                          src={user.picture}
                          alt={user.name}
                          className="h-10 w-10 rounded-full"
                        />
                      ) : (
                        <AvatarFallback className="bg-blue-100 text-blue-600">
                          {user.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      )}
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="flex items-center justify-start gap-2 p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      <p className="font-medium">{user.name}</p>
                      <p className="w-[200px] truncate text-sm text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  {onProfileClick && (
                    <DropdownMenuItem onClick={onProfileClick}>
                      <Settings className="mr-2 h-4 w-4" />
                      Profile Settings
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  {onLogout && (
                    <DropdownMenuItem onClick={handlelogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Log out
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : showAuthButtons ? (
            <div className="flex items-center space-x-2">
              {onLoginClick && (
                <Button variant="ghost" onClick={onLoginClick}>
                  Sign In
                </Button>
              )}
              {onRegisterClick && (
                <Button onClick={onRegisterClick}>Sign Up</Button>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}