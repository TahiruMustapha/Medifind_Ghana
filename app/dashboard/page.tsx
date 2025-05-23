"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NavBar } from "@/components/nav-bar";
import { useAuth } from "@/contexts/auth-context";
import { UserProfile } from "@/components/user-profile";
import { UserSubscriptions } from "@/components/user-subscriptions";
import { UserActivity } from "@/components/user-activity";
import { TwoFactorSettings } from "@/components/two-factor-settings";
import { SessionManagement } from "@/components/session-management";

export default function UserDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Redirect if not logged in
  useEffect(() => {
    if (!loading && !user) {
      // router.push("/login?redirect=/dashboard");
      router.push("/");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <main className="flex min-h-screen flex-col">
        <NavBar />
        <div className="flex-1 flex items-center justify-center">
          <p>Loading...</p>
        </div>
      </main>
    );
  }

  if (!user) {
    return null; 
  }

  return (
    <main className="flex min-h-screen flex-col">
      <NavBar />

      <div className="flex-1 p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold mb-2">User Dashboard</h1>
          <p className="text-muted-foreground mb-6">
            Manage your account and medicine subscriptions
          </p>

          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
              <TabsTrigger value="sessions">Sessions</TabsTrigger>
              <TabsTrigger value="subscriptions">
                Medicine Subscriptions
              </TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
            </TabsList>

            <TabsContent value="profile">
              <UserProfile />
            </TabsContent>

            <TabsContent value="security">
              <TwoFactorSettings />
            </TabsContent>

            <TabsContent value="sessions">
              <SessionManagement />
            </TabsContent>

            <TabsContent value="subscriptions">
              <UserSubscriptions />
            </TabsContent>

            <TabsContent value="activity">
              <UserActivity />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </main>
  );
}
