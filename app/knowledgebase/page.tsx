"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import Layout from "@/components/Layout";
import KnowledgeBase from "@/components/dashboard/KnowledgeBase";

export default function KnowledgeBasePage() {
  return (
    <ProtectedRoute>
      <Layout>
        <KnowledgeBase />
      </Layout>
    </ProtectedRoute>
  );
}