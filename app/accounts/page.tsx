"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import Layout from "@/components/Layout";
import Accounts from "@/components/dashboard/Accounts";

export default function AccountsPage() {
  return (
    <ProtectedRoute>
      <Layout>
        <Accounts />
      </Layout>
    </ProtectedRoute>
  );
}