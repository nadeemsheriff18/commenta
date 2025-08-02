"use client";

import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Layout } from "lucide-react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function ProPlanPage() {
  const router = useRouter();

  const redirect = () => {
    // Add your authentication + payment redirect logic here
    router.push("/pro-payment");
  };

  return (
    <ProtectedRoute>
       
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white to-green-50 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl w-full">
        <Card className="shadow-2xl border-2 border-green-700 rounded-3xl font-anek transition hover:shadow-green-200">
          <CardHeader className="text-center space-y-2">
            <CardTitle className="text-3xl font-extrabold text-green-800">Commentta Pro</CardTitle>
            <CardDescription className="text-gray-600">
              Unlock powerful features to grow faster on Reddit.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6 px-8">
            <div className="text-center">
              <p className="text-4xl font-bold text-green-700">$50.00</p>
              <p className="text-sm text-gray-500 mt-1">30-day access</p>
            </div>

            <div className="pt-6 border-t border-gray-200">
              <p className="font-semibold text-lg mb-4 text-gray-800">What’s Included</p>
              <ul className="space-y-3 text-sm text-gray-700">
                {[
                  "100 Subreddits Tracked",
                  "Up to 100 Comments per Day",
                  "New Mentions Every 2 Hours",
                  "Email Alerts Every 2 Hours",
                  "Full Analytical Dashboard",
                  "Create Multiple Projects",
                ].map((feature) => (
                  <li key={feature} className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 mr-2" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>

          <CardFooter className="px-8 pb-8">
            <Button
              className="w-full rounded-lg bg-green-700 hover:bg-green-800 text-white text-base font-medium py-2.5"
              onClick={redirect}
            >
              Upgrade now
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
   
    </ProtectedRoute>
  );
}
