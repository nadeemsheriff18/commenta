'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Code, 
  Eye, 
  Settings, 
  Users, 
  Book, 
  FolderOpen, 
  Hash, 
  MessageSquare,
  BarChart3,
  User,
  LogIn,
  UserPlus,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

interface DeveloperModeProps {
  currentView: string;
  onViewChange: (view: string) => void;
  isAuthenticated: boolean;
}

export default function DeveloperMode({ currentView, onViewChange, isAuthenticated }: DeveloperModeProps) {
  const [isOpen, setIsOpen] = useState(false);

  const authPages = [
    { id: 'login', name: 'Login Page', icon: LogIn, description: 'User login form' },
    { id: 'register', name: 'Register Page', icon: UserPlus, description: 'User registration form' },
    { id: 'forgot-password', name: 'Forgot Password', icon: LogIn, description: 'Password reset request' },
    { id: 'reset-password', name: 'Reset Password', icon: LogIn, description: 'Password reset form' },
    { id: 'verify-email', name: 'Email Verification', icon: LogIn, description: 'Email verification page' },
  ];

  const dashboardPages = [
    { id: 'projects', name: 'Projects List', icon: FolderOpen, description: 'All projects overview' },
    { id: 'create-project', name: 'Create Project', icon: FolderOpen, description: 'New project form' },
    { id: 'dashboard', name: 'Project Dashboard', icon: BarChart3, description: 'Individual project dashboard' },
    { id: 'keywords', name: 'Keywords Page', icon: Hash, description: 'Keyword management' },
    { id: 'subreddits', name: 'Subreddits Page', icon: MessageSquare, description: 'Subreddit monitoring' },
    { id: 'settings', name: 'Project Settings', icon: Settings, description: 'Project configuration' },
    { id: 'knowledge-base', name: 'Knowledge Base', icon: Book, description: 'Help and documentation' },
    { id: 'accounts', name: 'Account Management', icon: Users, description: 'Billing and subscription' },
    { id: 'profile', name: 'Profile Settings', icon: User, description: 'User profile management' },
  ];

  const PageButton = ({ page, isActive }: { page: any; isActive: boolean }) => (
    <Button
      variant={isActive ? "default" : "outline"}
      size="sm"
      onClick={() => onViewChange(page.id)}
      className="w-full justify-start text-left h-auto p-3"
    >
      <page.icon className="mr-2 h-4 w-4 flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="font-medium">{page.name}</div>
        <div className="text-xs text-muted-foreground truncate">{page.description}</div>
      </div>
      {isActive && <Badge variant="secondary" className="ml-2">Active</Badge>}
    </Button>
  );

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <Button 
            variant="outline" 
            size="sm"
            className="bg-orange-100 border-orange-300 text-orange-800 hover:bg-orange-200 shadow-lg"
          >
            <Code className="mr-2 h-4 w-4" />
            Developer Mode
            {isOpen ? <ChevronDown className="ml-2 h-4 w-4" /> : <ChevronUp className="ml-2 h-4 w-4" />}
          </Button>
        </CollapsibleTrigger>
        
        <CollapsibleContent className="mt-2">
          <Card className="w-80 max-h-96 overflow-y-auto shadow-xl border-orange-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center">
                <Eye className="mr-2 h-5 w-5 text-orange-600" />
                Page Navigator
              </CardTitle>
              <CardDescription>
                Navigate between different pages and components for development
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Authentication Pages */}
              <div>
                <h4 className="font-medium text-sm text-gray-700 mb-2 flex items-center">
                  <LogIn className="mr-2 h-4 w-4" />
                  Authentication Pages
                </h4>
                <div className="space-y-2">
                  {authPages.map((page) => (
                    <PageButton 
                      key={page.id} 
                      page={page} 
                      isActive={currentView === page.id} 
                    />
                  ))}
                </div>
              </div>

              {/* Dashboard Pages */}
              <div>
                <h4 className="font-medium text-sm text-gray-700 mb-2 flex items-center">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  Dashboard Pages
                </h4>
                <div className="space-y-2">
                  {dashboardPages.map((page) => (
                    <PageButton 
                      key={page.id} 
                      page={page} 
                      isActive={currentView === page.id} 
                    />
                  ))}
                </div>
              </div>

              {/* Current State Info */}
              <div className="pt-3 border-t border-gray-200">
                <div className="text-xs text-gray-500 space-y-1">
                  <div>Current View: <span className="font-mono text-orange-600">{currentView}</span></div>
                  <div>Auth Status: <span className="font-mono text-orange-600">{isAuthenticated ? 'Authenticated' : 'Not Authenticated'}</span></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}