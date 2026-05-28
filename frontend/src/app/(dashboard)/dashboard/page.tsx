"use client";

import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";

export default function DashboardPage() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading || !isAuthenticated) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-charcoal p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-medium text-porcelain">Dashboard</h1>
            <p className="text-cloudburst mt-1">Welcome back, {user?.full_name}</p>
          </div>
          <div className="flex gap-4">
            <Button variant="ghost" onClick={logout}>Logout</Button>
            <Button variant="filled">Add Clothing</Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card variant="translucent" className="p-6">
            <Badge variant="cyan" className="mb-2">Wardrobe Size</Badge>
            <p className="text-4xl font-medium text-porcelain mt-2">0</p>
            <p className="text-sm text-cloudburst mt-1">Total items in your closet</p>
          </Card>
          
          <Card variant="translucent" className="p-6">
            <Badge variant="orange" className="mb-2">Saved Outfits</Badge>
            <p className="text-4xl font-medium text-porcelain mt-2">0</p>
            <p className="text-sm text-cloudburst mt-1">Favorite combinations</p>
          </Card>

          <Card variant="translucent" className="p-6">
            <Badge variant="success" className="mb-2">AI Analyses</Badge>
            <p className="text-4xl font-medium text-porcelain mt-2">0</p>
            <p className="text-sm text-cloudburst mt-1">Images processed</p>
          </Card>
        </div>

        {/* Profile Summary */}
        <Card variant="basic" className="p-6 mt-8">
          <h2 className="text-xl font-medium text-porcelain mb-4">Your Style Profile</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-muted uppercase tracking-widest mb-1">Gender</p>
              <p className="text-sm text-porcelain capitalize">{user?.gender_preference || "Not set"}</p>
            </div>
            <div>
              <p className="text-xs text-muted uppercase tracking-widest mb-1">Style</p>
              <p className="text-sm text-porcelain capitalize">{user?.style_preference || "Not set"}</p>
            </div>
            <div>
              <p className="text-xs text-muted uppercase tracking-widest mb-1">Location</p>
              <p className="text-sm text-porcelain capitalize">{user?.location || "Not set"}</p>
            </div>
            <div>
              <p className="text-xs text-muted uppercase tracking-widest mb-1">Status</p>
              <Badge variant={user?.is_profile_complete ? "success" : "warning"} dot>
                {user?.is_profile_complete ? "Complete" : "Incomplete"}
              </Badge>
            </div>
          </div>
        </Card>

      </div>
    </div>
  );
}
