"use client";

import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import Layout from "@/components/Layout";
import CreateProjectForm from "@/components/dashboard/CreateProjectForm";

export default function CreateProjectPage() {
  const router = useRouter();

  return (
    <ProtectedRoute>
      <Layout>
        <CreateProjectForm
          onCreateProject={() => {
            router.push("/projects");
          }}
          onBack={() => {
            router.push("/projects");
          }}
        />
      </Layout>
    </ProtectedRoute>
  );
}
