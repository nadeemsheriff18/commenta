"use client";

import { useAuth } from "@/hooks/use-auth";
import ProtectedRoute from "@/components/ProtectedRoute";
import Layout from "@/components/Layout";
import ProjectsList from "@/components/dashboard/ProjectsList";
// export async function generateStaticParams() {
//   // Your static generation logic
//   return [];
// }
export default function ProjectsPage() {
  return (
    <ProtectedRoute>
      <Layout>
        <ProjectsList
          onCreateProject={() => {
            window.location.href = "/projects/create";
          }}
          onEditProject={(project) => {
            window.location.href = `/projects/${project.id}`;
          }}
          onUserNotFound={() => {
            window.location.href = "/login";
          }}
        />
      </Layout>
    </ProtectedRoute>
  );
}
