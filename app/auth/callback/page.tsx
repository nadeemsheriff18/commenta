"use client";
import Cookies from "js-cookie";
import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { authService } from "@/lib/auth";

export default function GoogleCallbackPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const handleAuthCallback = async () => {
  const code = searchParams.get("code");
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  if (code && timezone) {
    try {
      // Directly call the correct function from authService
      const result = await authService.handleGoogleCallback(code, timezone);
      
      if (result.success) {
        console.log("Callback Result:", result);
        router.replace("/projects");
      } else {
        console.error("Authentication failed:", result.message);
        router.replace("/login"); // Redirect to login on failure
      }
    } catch (error) {
      console.error("Login failed", error);
      router.replace("/login");
    }
  }
};

    handleAuthCallback();
  }, [searchParams, router]);

  return <p>Authenticating with Google...</p>;
}
