"use client";

import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";
import { User as UserIcon, Shield, Database, Calendar } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function ProfilePage() {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <div>
      <PageHeader 
        title="Profile Settings" 
        description="Manage your account preferences and settings."
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1 h-fit">
          <CardContent className="p-6 flex flex-col items-center text-center">
            <div className="w-24 h-24 bg-cyber-cyan/10 rounded-full flex items-center justify-center mb-4 border border-cyber-cyan/30 text-cyber-cyan">
              <UserIcon className="h-10 w-10" />
            </div>
            <h2 className="text-xl font-bold text-porcelain">{user.full_name}</h2>
            <p className="text-cloudburst text-sm mb-6">{user.email}</p>
            
            <Button variant="danger" className="w-full" onClick={logout}>
              Log Out
            </Button>
          </CardContent>
        </Card>

        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Account Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                  <div className="flex items-center gap-2 mb-1 text-cloudburst text-sm">
                    <Shield className="h-4 w-4" /> Auth Provider
                  </div>
                  <p className="font-medium text-porcelain capitalize">{user.auth_provider}</p>
                </div>
                <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                  <div className="flex items-center gap-2 mb-1 text-cloudburst text-sm">
                    <Calendar className="h-4 w-4" /> Member Since
                  </div>
                  <p className="font-medium text-porcelain">{formatDate(user.created_at)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>System Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                <div className="flex items-center gap-2 mb-2">
                  <Database className="h-5 w-5 text-cyber-cyan" />
                  <h3 className="font-medium text-porcelain">API Connection</h3>
                </div>
                <p className="text-sm text-cloudburst leading-relaxed">
                  The frontend is successfully connected to the backend APIs. S3 Image Storage, 
                  Google Gemini AI Analysis, and OpenWeatherMap services are actively managed 
                  by the backend infrastructure.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
