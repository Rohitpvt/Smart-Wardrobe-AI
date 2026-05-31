"use client";

import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/hooks/useAuth";
import { Shield, Calendar } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function ProfilePage() {
  const { user, logout } = useAuth();

  if (!user) return null;

  const initials = user.full_name
    ?.split(" ")
    .map((n: string) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "U";

  return (
    <div>
      <PageHeader 
        title="Profile" 
        description="Manage your account preferences and settings."
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Avatar Card */}
        <Card className="md:col-span-1 h-fit">
          <CardContent className="p-6 flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-2xl bg-cyber-cyan/10 flex items-center justify-center mb-4 border border-cyber-cyan/20 text-cyber-cyan text-2xl font-bold">
              {initials}
            </div>
            <h2 className="text-lg font-bold text-porcelain">{user.full_name}</h2>
            <p className="text-sm text-cloudburst mb-6">{user.email}</p>
            
            <Button variant="danger" className="w-full" onClick={logout}>
              Log Out
            </Button>
          </CardContent>
        </Card>

        {/* Details Column */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Account Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <InfoTile 
                  icon={<Shield className="h-4 w-4" />} 
                  label="Auth Provider" 
                  value={user.auth_provider} 
                />
                <InfoTile 
                  icon={<Calendar className="h-4 w-4" />} 
                  label="Member Since" 
                  value={formatDate(user.created_at)} 
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>System Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <StatusRow label="Backend API" status="Connected" />
              <StatusRow label="S3 Image Storage" status="Active" />
              <StatusRow label="NVIDIA Vision AI" status="Available" />
              <StatusRow label="OpenWeatherMap" status="Available" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function InfoTile({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="p-4 bg-surface-raised rounded-xl border border-border-subtle">
      <div className="flex items-center gap-2 mb-1.5 text-cloudburst text-xs">
        {icon}
        {label}
      </div>
      <p className="text-sm font-medium text-porcelain capitalize">{value}</p>
    </div>
  );
}

function StatusRow({ label, status }: { label: string; status: string }) {
  return (
    <div className="flex items-center justify-between p-3.5 bg-surface-raised rounded-xl border border-border-subtle">
      <span className="text-sm text-porcelain">{label}</span>
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-emerald-400" />
        <span className="text-xs text-cloudburst">{status}</span>
      </div>
    </div>
  );
}
