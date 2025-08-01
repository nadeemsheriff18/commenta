"use client";

import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import AppHeader from "@/components/layout/AppHeader";
import CreateProjectForm from "./CreateProjectForm";
import ProjectDashboard from "./ProjectDashboard";
import ProjectsList from "./ProjectsList";
import ProjectSettings from "./ProjectSettings";
import KeywordsPage from "./KeywordsPage";
import SubredditsPage from "./SubredditsPage";
import KnowledgeBase from "./KnowledgeBase";

import ProfileSettings from "./ProfileSettings";
import { Project } from "@/lib/api";
import { apiService } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
interface User {
  name: string;
  email: string;
  user_id: string;
}

interface DashboardProps {
  user: User | null;
  onLogout: () => void;
  initialView?: string;
  refreshTrigger?: number; // Add refresh trigger prop
}

export default function Dashboard({
  user,
  onLogout,
  initialView,
  refreshTrigger,
}: DashboardProps) {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [currentView, setCurrentView] = useState<
    | "projects"
    | "create-project"
    | "dashboard"
    | "keywords"
    | "subreddits"
    | "settings"
    | "knowledge-base"
    | "accounts"
    | "profile"
  >((initialView as any) || "projects");
  const [expandedProject, setExpandedProject] = useState<string | null>(null);
  const [projectsRefreshKey, setProjectsRefreshKey] = useState(0);

  // Update view when initialView changes (for developer mode)
  useEffect(() => {
    if (initialView) {
      setCurrentView(initialView as any);
    }
  }, [initialView]);

  // Handle refresh trigger from parent
  useEffect(() => {
    if (refreshTrigger) {
      setProjectsRefreshKey((prev) => prev + 1);
    }
  }, [refreshTrigger]);

  const handleProjectSelect = (project: Project) => {
    setSelectedProject(project);
    setCurrentView("dashboard");
    setExpandedProject(project.id);
  };

  const handleCreateProjectSuccess = () => {
    // const temp = useAuth();
    // const res = temp.checkAuth();
    // console.log("Project created successfully, auth check result:", res);
    setCurrentView("projects");
    // Clear API cache and trigger refresh
  
    setProjectsRefreshKey((prev) => prev + 1);
  };
  const handleUserNotFound = () => {
    // Clear user session and redirect to login
    onLogout();
  };

  const renderMainContent = () => {
    switch (currentView) {
      case "projects":
        return (
          <ProjectsList
            key={projectsRefreshKey} // Force re-render when key changes
            onCreateProject={() => setCurrentView("create-project")}
            onEditProject={(project) => {
              setSelectedProject(project);
              setCurrentView("dashboard");
              setExpandedProject(project.id);
            }}
            onUserNotFound={handleUserNotFound}
          />
        );
      case "create-project":
        return (
          <CreateProjectForm
            onCreateProject={handleCreateProjectSuccess}
            onBack={() => setCurrentView("projects")}
          />
        );
      case "dashboard":
        return <ProjectDashboard project={selectedProject} />;
      case "keywords":
        return <KeywordsPage project={selectedProject} />;
      case "subreddits":
        return <SubredditsPage project={selectedProject} />;
      case "settings":
        return (
          <ProjectSettings
            project={selectedProject}
            // onBack={() => setCurrentView("dashboard")}
          />
        );
      case "knowledge-base":
        return <KnowledgeBase />;
      
      case "profile":
        return (
          <ProfileSettings
            user={user}
            onBack={() => setCurrentView("dashboard")}
          />
        );
      default:
        return (
          <ProjectsList
            onCreateProject={() => setCurrentView("create-project")}
            onEditProject={(project) => {
              setSelectedProject(project);
              setCurrentView("dashboard");
              setExpandedProject(project.id);
            }}
            onUserNotFound={handleUserNotFound}
          />
        );
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* <Sidebar
        // selectedProject={selectedProject}
        expandedProject={expandedProject}
        currentView={currentView}
        onProjectSelect={handleProjectSelect}
        onViewChange={(view: string) => setCurrentView(view as any)}
        onCreateProject={() => setCurrentView("create-project")}
        onExpandProject={setExpandedProject}
      /> */}
      <div className="flex-1 flex flex-col">
        <AppHeader
          user={user}
          onLogout={onLogout}
          onProfileClick={() => setCurrentView("profile")}
        />
        <main className="flex-1 overflow-auto">{renderMainContent()}</main>
      </div>
    </div>
  );
}
