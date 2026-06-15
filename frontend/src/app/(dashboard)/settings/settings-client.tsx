"use client";
import { useState } from "react";

import { api } from "@/lib/axios";
import axios from "axios";
import { m, Variants } from "framer-motion";
import { 
  User, Shield, MapPin, Sparkles, CheckCircle2, AlertCircle, 
  Settings2, CloudSun, Lock, Mail, BadgeCheck, Activity
} from "lucide-react";
import { toast } from "sonner";

import { fadeUp, staggerContainer as stagger } from "@/lib/animations";
import { GlassPanel } from "@/components/ui/GlassPanel";

interface ProfileData {
  first_name: string;
  last_name: string;
  email: string;
  city: string;
  country_code: string;
}

export default function SettingsClient({ initialProfile }: { initialProfile: ProfileData }) {
  const [profile, setProfile] = useState<ProfileData>(initialProfile);
  
  const [passwordForm, setPasswordForm] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });

  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });
  };

  const submitProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileLoading(true);
    try {
      await api.put("/users/profile", profile);
      toast.success("Profile intelligence updated successfully.");
    } catch (err) {
      toast.error("Failed to update profile parameters.");
    } finally {
      setProfileLoading(false);
    }
  };

  const submitPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      toast.error("New security credentials do not match.");
      return;
    }
    if (passwordForm.new_password.length < 8) {
      toast.error("New password must be at least 8 characters long.");
      return;
    }
    
    setPasswordLoading(true);
    try {
      await api.put("/users/password", {
        current_password: passwordForm.current_password,
        new_password: passwordForm.new_password,
      });
      toast.success("Security credentials updated successfully.");
    } catch (err: unknown) {
      if (axios.isAxiosError(err) && err.response) {
        toast.error(err.response?.data?.detail || "Failed to update security credentials.");
      } else {
        toast.error("Failed to update security credentials.");
      }
    } finally {
      setPasswordLoading(false);
    }
  };

  // Compute Intelligence Readiness
  const fields = [profile.first_name, profile.last_name, profile.city, profile.country_code];
  const filledFields = fields.filter(Boolean).length;
  const completenessScore = Math.round((filledFields / fields.length) * 100) || 0;
  
  const hasLocation = Boolean(profile.city && profile.country_code);

  return (
    <m.div 
      initial="hidden" 
      animate="visible" 
      variants={stagger} 
      className="max-w-6xl mx-auto space-y-8 pb-16"
    >
      {/* ═══ SECTION 1: PROFILE COMMAND CENTER ═══ */}
      <m.section variants={fadeUp} className="relative overflow-hidden rounded-[2rem] bg-surface-1/70 backdrop-blur-xl border border-white/10 shadow-[0_0_50px_rgba(59,130,246,0.03)] p-8 md:p-12">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-brand-blue/20 via-brand-purple/10 to-transparent rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-brand-blue/10 to-transparent rounded-full blur-[80px] pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-full bg-surface-2 border-2 border-brand-blue/30 p-1 relative group">
              <div className="absolute inset-0 bg-brand-blue/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="w-full h-full bg-[#060816] rounded-full flex items-center justify-center relative z-10 overflow-hidden">
                <span className="text-3xl font-bold text-white uppercase">
                  {profile.first_name ? profile.first_name[0] : <User className="w-8 h-8 text-slate-500" />}
                  {profile.last_name ? profile.last_name[0] : ""}
                </span>
              </div>
              {hasLocation && (
                <div className="absolute -bottom-1 -right-1 bg-surface-1 border border-brand-blue/30 w-8 h-8 rounded-full flex items-center justify-center z-20 shadow-lg">
                  <BadgeCheck className="w-4 h-4 text-brand-blue" />
                </div>
              )}
            </div>
            
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight mb-2 flex items-center gap-3">
                {profile.first_name || profile.last_name ? `${profile.first_name} ${profile.last_name}` : "Stylist Profile"}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400">
                <span className="flex items-center gap-1.5"><Mail className="w-4 h-4" /> {profile.email || "No email linked"}</span>
                {hasLocation && (
                  <>
                    <span className="w-1 h-1 rounded-full bg-white/20" />
                    <span className="flex items-center gap-1.5 text-brand-blue"><MapPin className="w-4 h-4" /> {profile.city}, {profile.country_code.toUpperCase()}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="bg-surface-2/80 border border-white/10 rounded-2xl p-4 flex items-center gap-4 shrink-0">
            <div className="p-3 bg-brand-blue/10 rounded-xl">
              <Activity className="w-6 h-6 text-brand-blue" />
            </div>
            <div>
              <p className="text-xs font-label-md text-slate-500 uppercase tracking-widest mb-1">Account Status</p>
              <p className="text-sm font-semibold text-white flex items-center gap-2">
                Active Member
              </p>
            </div>
          </div>
        </div>
      </m.section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          
          {/* ═══ SECTION 2: PERSONAL INFORMATION ═══ */}
          <m.section variants={fadeUp} className="bg-surface-1/70 backdrop-blur-xl border border-white/10 rounded-[2rem] p-8 md:p-10 shadow-xl relative overflow-hidden">
            <div className="flex items-center gap-3 mb-8 pb-6 border-b border-white/5">
              <Settings2 className="w-6 h-6 text-brand-blue" />
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">Identity & Localization</h2>
                <p className="text-sm text-slate-400 mt-1">Configure your core identity for AI personalization.</p>
              </div>
            </div>

            <form onSubmit={submitProfile} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-label-sm text-slate-400 uppercase tracking-widest mb-2 pl-1">First Name</label>
                  <input 
                    type="text" 
                    name="first_name" 
                    value={profile.first_name} 
                    onChange={handleProfileChange}
                    className="w-full bg-[#060816]/80 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-brand-blue/50 focus:border-brand-blue/50 transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)]" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-label-sm text-slate-400 uppercase tracking-widest mb-2 pl-1">Last Name</label>
                  <input 
                    type="text" 
                    name="last_name" 
                    value={profile.last_name} 
                    onChange={handleProfileChange}
                    className="w-full bg-[#060816]/80 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-brand-blue/50 focus:border-brand-blue/50 transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)]" 
                  />
                </div>
              </div>

              {/* ═══ SECTION 4: WEATHER & LOCATION ═══ */}
              <div className="mt-8 pt-8 border-t border-white/5">
                <div className="flex items-center justify-between mb-6">
                   <label className="block text-xs font-label-sm text-brand-blue uppercase tracking-widest pl-1">Environmental Targeting</label>
                   {!hasLocation && (
                     <span className="text-xs text-yellow-500 bg-yellow-500/10 px-2 py-1 rounded border border-yellow-500/20">Missing Data</span>
                   )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
                  
                  <div>
                    <label className="block text-xs font-label-sm text-slate-400 uppercase tracking-widest mb-2 pl-1">City</label>
                    <input 
                      type="text" 
                      name="city" 
                      placeholder="e.g. London"
                      value={profile.city} 
                      onChange={handleProfileChange}
                      className="w-full bg-[#060816]/80 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-brand-blue/50 focus:border-brand-blue/50 transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)]" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-label-sm text-slate-400 uppercase tracking-widest mb-2 pl-1">Country Code</label>
                    <input 
                      type="text" 
                      name="country_code" 
                      placeholder="e.g. UK"
                      maxLength={2}
                      value={profile.country_code} 
                      onChange={handleProfileChange}
                      className="w-full bg-[#060816]/80 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-brand-blue/50 focus:border-brand-blue/50 uppercase transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)]" 
                    />
                  </div>
                </div>

                <div className="mt-4 bg-brand-blue/5 border border-brand-blue/10 rounded-xl p-4 flex gap-3">
                  <CloudSun className="w-5 h-5 text-brand-blue shrink-0" />
                  <p className="text-sm text-slate-300 leading-relaxed">
                    Location data enables our styling engine to pull real-time weather forecasts when generating outfit recommendations. Without this, the AI defaults to season-agnostic styling.
                  </p>
                </div>
              </div>

              <div className="pt-6 flex justify-end">
                <button 
                  type="submit" 
                  disabled={profileLoading}
                  className="ds-btn-primary px-8 py-3 shadow-[0_0_20px_rgba(59,130,246,0.2)]"
                >
                  {profileLoading ? 'Syncing...' : 'Update Identity Profile'}
                </button>
              </div>
            </form>
          </m.section>

          {/* ═══ SECTION 5: SECURITY & ACCOUNT ═══ */}
          <m.section variants={fadeUp} className="bg-surface-1/70 backdrop-blur-xl border border-white/10 rounded-[2rem] p-8 md:p-10 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/5 rounded-full blur-[80px] pointer-events-none" />
            
            <div className="flex items-center gap-3 mb-8 pb-6 border-b border-white/5">
              <Shield className="w-6 h-6 text-slate-400" />
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">Security Credentials</h2>
                <p className="text-sm text-slate-400 mt-1">Manage your account protection and authentication.</p>
              </div>
            </div>

            <form onSubmit={submitPassword} className="space-y-6">
              <div>
                <label className="block text-xs font-label-sm text-slate-400 uppercase tracking-widest mb-2 pl-1">Current Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input 
                    type="password" 
                    name="current_password" 
                    required
                    value={passwordForm.current_password} 
                    onChange={handlePasswordChange}
                    className="w-full bg-[#060816]/80 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-red-500/50 focus:border-red-500/50 transition-all" 
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-label-sm text-slate-400 uppercase tracking-widest mb-2 pl-1">New Password</label>
                  <input 
                    type="password" 
                    name="new_password" 
                    required
                    minLength={8}
                    value={passwordForm.new_password} 
                    onChange={handlePasswordChange}
                    className="w-full bg-[#060816]/80 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-red-500/50 focus:border-red-500/50 transition-all" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-label-sm text-slate-400 uppercase tracking-widest mb-2 pl-1">Confirm New Password</label>
                  <input 
                    type="password" 
                    name="confirm_password" 
                    required
                    minLength={8}
                    value={passwordForm.confirm_password} 
                    onChange={handlePasswordChange}
                    className="w-full bg-[#060816]/80 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-red-500/50 focus:border-red-500/50 transition-all" 
                  />
                </div>
              </div>
              <div className="pt-4 flex justify-end">
                <button 
                  type="submit" 
                  disabled={passwordLoading}
                  className="px-6 py-3 bg-surface-2 border border-red-500/30 text-red-400 font-medium rounded-xl hover:bg-red-500/10 hover:border-red-500/50 transition-all focus:outline-none focus:ring-2 focus:ring-red-500/50 disabled:opacity-50"
                >
                  {passwordLoading ? 'Updating Security...' : 'Update Password'}
                </button>
              </div>
            </form>
          </m.section>
        </div>

        {/* ═══ SECTION 7: AI PERSONALIZATION INSIGHTS ═══ */}
        <div className="lg:col-span-1 space-y-6">
          <m.div variants={fadeUp} className="bg-surface-1/70 backdrop-blur-xl border border-brand-purple/20 rounded-[2rem] p-6 lg:p-8 shadow-[0_0_30px_rgba(139,92,246,0.05)] relative overflow-hidden group">
             <div className="absolute top-0 right-0 w-32 h-32 bg-brand-purple/20 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2 pointer-events-none group-hover:scale-150 transition-transform duration-700" />
             
             <div className="flex items-center gap-3 mb-6 relative z-10">
               <div className="p-2 bg-brand-purple/10 rounded-lg text-brand-purple border border-brand-purple/20">
                 <Sparkles className="w-5 h-5" />
               </div>
               <h3 className="text-lg font-bold text-white tracking-tight">AI Intelligence</h3>
             </div>

             <div className="space-y-6 relative z-10">
               <div>
                 <div className="flex justify-between items-end mb-2">
                   <span className="text-sm font-medium text-slate-300">Profile Completeness</span>
                   <span className="text-xl font-bold text-brand-purple">{completenessScore}%</span>
                 </div>
                 <div className="h-2 w-full bg-surface-3 rounded-full overflow-hidden">
                   <m.div 
                     initial={{ width: 0 }}
                     animate={{ width: `${completenessScore}%` }}
                     transition={{ duration: 1, delay: 0.5 }}
                     className="h-full bg-gradient-to-r from-brand-blue to-brand-purple rounded-full"
                   />
                 </div>
               </div>

               <div className="space-y-3 pt-4 border-t border-white/5">
                 <div className="flex items-start gap-3">
                   {hasLocation ? <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" /> : <AlertCircle className="w-5 h-5 text-yellow-500 shrink-0" />}
                   <div>
                     <p className="text-sm font-medium text-slate-200">Weather Targeting</p>
                     <p className="text-xs text-slate-500 mt-0.5">{hasLocation ? "Active & Calibrated" : "Missing Location Data"}</p>
                   </div>
                 </div>

                 <div className="flex items-start gap-3">
                   {completenessScore >= 50 ? <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" /> : <AlertCircle className="w-5 h-5 text-yellow-500 shrink-0" />}
                   <div>
                     <p className="text-sm font-medium text-slate-200">Identity Graph</p>
                     <p className="text-xs text-slate-500 mt-0.5">{completenessScore >= 50 ? "Sufficient for Basics" : "Requires more detail"}</p>
                   </div>
                 </div>
               </div>
               
               {completenessScore < 100 && (
                 <div className="mt-4 p-4 bg-surface-2/80 rounded-xl border border-white/5">
                   <p className="text-xs text-slate-400 leading-relaxed">
                     Complete all identity fields to maximize the personalization depth of your generated outfits.
                   </p>
                 </div>
               )}
             </div>
          </m.div>
        </div>
      </div>
    </m.div>
  );
}
