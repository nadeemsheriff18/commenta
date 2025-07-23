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
          const res = await fetch("http://192.168.43.144:8000/auth_callback", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({ code, timezone }),
          });

          const data = await res.json();
          console.log("Login success:", data);

          if (data.token) {
            const result = await authService.loginGoogle(data);
            console.log("Callback Result:", result);

            router.replace("/projects");
          } else {
            console.error("No token returned from server");
          }
        } catch (error) {
          console.error("Login failed", error);
        }
      }
    };

    handleAuthCallback();
  }, [searchParams, router]);

  return <p>Authenticating with Google...</p>;
}
