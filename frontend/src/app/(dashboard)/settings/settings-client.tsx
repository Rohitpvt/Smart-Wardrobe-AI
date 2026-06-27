"use client";
import { useState, useRef } from "react";

import { api } from "@/lib/axios";
import axios from "axios";
import { m } from "framer-motion";
import { 
  User, Shield, MapPin, Sparkles, CheckCircle2, AlertCircle, 
  Settings2, CloudSun, Lock, Mail, BadgeCheck, Activity,
  Camera, Trash2, Loader2, Image as ImageIcon
} from "lucide-react";
import { toast } from "sonner";

import { fadeUp, staggerContainer as stagger } from "@/lib/animations";

interface ProfileData {
  first_name: string;
  last_name: string;
  email: string;
  city: string;
  country_code: string;
  styling_preference?: string;
  age?: number | null;
  gender?: string | null;
  height_cm?: number | null;
  body_type?: string | null;
  fashion_experience?: string | null;
  primary_style?: string | null;
  profile_image_url?: string | null;
  weather_city?: string | null;
  weather_country?: string | null;
  weather_latitude?: number | null;
  weather_longitude?: number | null;
  weather_location_enabled?: boolean | null;
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
  const [imageUploading, setImageUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });
  };

  const submitProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileLoading(true);
    try {
      const payload = {
        ...profile,
        age: profile.age ? parseInt(profile.age as any, 10) : null,
        height_cm: profile.height_cm ? parseInt(profile.height_cm as any, 10) : null,
      };
      await api.put("/users/profile", payload);
      toast.success("Profile intelligence updated successfully.");
    } catch (err) {
      toast.error("Failed to update profile parameters.");
    } finally {
      setProfileLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    const formData = new FormData();
    formData.append("image", file);

    setImageUploading(true);
    try {
      const res = await api.post("/users/profile-picture", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setProfile({ ...profile, profile_image_url: res.data.profile_image_url });
      toast.success("Profile picture updated successfully.");
    } catch (err) {
      toast.error("Failed to upload profile picture.");
    } finally {
      setImageUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDeleteImage = async () => {
    setImageUploading(true);
    try {
      await api.delete("/users/profile-picture");
      setProfile({ ...profile, profile_image_url: null });
      toast.success("Profile picture removed.");
    } catch (err) {
      toast.error("Failed to remove profile picture.");
    } finally {
      setImageUploading(false);
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
  const fields = [
    profile.first_name, profile.last_name, profile.city, profile.country_code,
    profile.age, profile.gender, profile.height_cm, profile.body_type, 
    profile.fashion_experience, profile.primary_style
  ];
  const filledFields = fields.filter(Boolean).length;
  const completenessScore = Math.round((filledFields / fields.length) * 100) || 0;
  
  const hasLocation = Boolean(
    profile.weather_location_enabled !== false &&
    ((profile.weather_latitude && profile.weather_longitude) || profile.weather_city || profile.city)
  );

  const [locationStatus, setLocationStatus] = useState<"MISSING" | "ACTIVE" | "DENIED">(hasLocation ? "ACTIVE" : "MISSING");

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }
    
    toast.loading("Finding your location...");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        toast.dismiss();
        setProfile({
          ...profile,
          weather_latitude: position.coords.latitude,
          weather_longitude: position.coords.longitude,
          weather_location_enabled: true
        });
        setLocationStatus("ACTIVE");
        toast.success("Location acquired! Don't forget to save your profile.");
      },
      (error) => {
        toast.dismiss();
        setLocationStatus("DENIED");
        toast.error("Location access denied.");
      }
    );
  };

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
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="w-24 h-24 rounded-full bg-surface-2 border-2 border-brand-blue/30 p-1 relative group shrink-0">
              <div className="absolute inset-0 bg-brand-blue/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="w-full h-full bg-[#060816] rounded-full flex items-center justify-center relative z-10 overflow-hidden group-hover:bg-black/50 transition-colors">
                {profile.profile_image_url ? (
                  <img src={profile.profile_image_url} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl font-bold text-white uppercase">
                    {profile.first_name ? profile.first_name[0] : <User className="w-8 h-8 text-slate-500" />}
                    {profile.last_name ? profile.last_name[0] : ""}
                  </span>
                )}
                
                {/* Upload overlay */}
                <div 
                  className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {imageUploading ? <Loader2 className="w-6 h-6 text-white animate-spin" /> : <Camera className="w-6 h-6 text-white" />}
                </div>
              </div>
              <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
              
              {profile.profile_image_url && (
                <button 
                  onClick={handleDeleteImage}
                  disabled={imageUploading}
                  className="absolute -bottom-1 -right-1 bg-red-500 hover:bg-red-600 border border-red-400 w-8 h-8 rounded-full flex items-center justify-center z-20 shadow-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4 text-white" />
                </button>
              )}
            </div>
            
            <div className="text-center md:text-left">
              <h1 className="text-3xl font-bold text-white tracking-tight mb-2 flex items-center justify-center md:justify-start gap-3">
                {profile.first_name || profile.last_name ? `${profile.first_name} ${profile.last_name}` : "Stylist Profile"}
              </h1>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-slate-400">
                <span className="flex items-center gap-1.5"><Mail className="w-4 h-4" /> {profile.email || "No email linked"}</span>
                {hasLocation && (
                  <>
                    <span className="w-1 h-1 rounded-full bg-white/20 hidden md:block" />
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
                <h2 className="text-xl font-bold text-white tracking-tight">Identity & Style Context</h2>
                <p className="text-sm text-slate-400 mt-1">Configure your identity to refine AI personalization.</p>
              </div>
            </div>

            <form onSubmit={submitProfile} className="space-y-8">
              
              <div className="space-y-6">
                <h3 className="text-sm font-bold text-slate-300 border-b border-white/5 pb-2">Basic Info</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-label-sm text-slate-400 uppercase tracking-widest mb-2 pl-1">First Name</label>
                    <input type="text" name="first_name" value={profile.first_name} onChange={handleProfileChange} className="w-full bg-[#060816]/80 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-brand-blue/50 focus:border-brand-blue/50 transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)]" />
                  </div>
                  <div>
                    <label className="block text-xs font-label-sm text-slate-400 uppercase tracking-widest mb-2 pl-1">Last Name</label>
                    <input type="text" name="last_name" value={profile.last_name} onChange={handleProfileChange} className="w-full bg-[#060816]/80 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-brand-blue/50 focus:border-brand-blue/50 transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)]" />
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="text-sm font-bold text-slate-300 border-b border-white/5 pb-2">Physical Traits</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-xs font-label-sm text-slate-400 uppercase tracking-widest mb-2 pl-1">Age</label>
                    <input type="number" name="age" value={profile.age || ""} onChange={handleProfileChange} className="w-full bg-[#060816]/80 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-brand-blue/50 focus:border-brand-blue/50 transition-all" />
                  </div>
                  <div>
                    <label className="block text-xs font-label-sm text-slate-400 uppercase tracking-widest mb-2 pl-1">Gender</label>
                    <select name="gender" value={profile.gender || ""} onChange={handleProfileChange} className="w-full bg-[#060816]/80 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-brand-blue/50 focus:border-brand-blue/50 transition-all appearance-none">
                      <option value="">Select</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Non-binary">Non-binary</option>
                      <option value="Prefer not to say">Prefer not to say</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-label-sm text-slate-400 uppercase tracking-widest mb-2 pl-1">Height (cm)</label>
                    <input type="number" name="height_cm" value={profile.height_cm || ""} onChange={handleProfileChange} className="w-full bg-[#060816]/80 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-brand-blue/50 focus:border-brand-blue/50 transition-all" />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-label-sm text-slate-400 uppercase tracking-widest mb-2 pl-1">Body Type</label>
                    <select name="body_type" value={profile.body_type || ""} onChange={handleProfileChange} className="w-full bg-[#060816]/80 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-brand-blue/50 focus:border-brand-blue/50 transition-all appearance-none">
                      <option value="">Select</option>
                      <option value="Slim">Slim</option>
                      <option value="Athletic">Athletic</option>
                      <option value="Average">Average</option>
                      <option value="Curvy">Curvy</option>
                      <option value="Plus Size">Plus Size</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="text-sm font-bold text-slate-300 border-b border-white/5 pb-2">Style Profile</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-label-sm text-slate-400 uppercase tracking-widest mb-2 pl-1">Fashion Experience</label>
                    <select name="fashion_experience" value={profile.fashion_experience || ""} onChange={handleProfileChange} className="w-full bg-[#060816]/80 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-brand-blue/50 focus:border-brand-blue/50 transition-all appearance-none">
                      <option value="">Select</option>
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-label-sm text-slate-400 uppercase tracking-widest mb-2 pl-1">Primary Style Goal</label>
                    <select name="primary_style" value={profile.primary_style || ""} onChange={handleProfileChange} className="w-full bg-[#060816]/80 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-brand-blue/50 focus:border-brand-blue/50 transition-all appearance-none">
                      <option value="">Select</option>
                      <option value="Casual">Casual</option>
                      <option value="Streetwear">Streetwear</option>
                      <option value="Minimalist">Minimalist</option>
                      <option value="Vintage">Vintage</option>
                      <option value="Business Professional">Business Professional</option>
                      <option value="Bohemian">Bohemian</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* ═══ SECTION 4: WEATHER TARGETING ═══ */}
              <div className="pt-6">
                <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-6">
                  <h3 className="text-sm font-bold text-slate-300">Weather Targeting</h3>
                  {locationStatus === "ACTIVE" && <span className="text-xs font-semibold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full flex items-center gap-1"><CheckCircle2 className="w-3 h-3"/> Active</span>}
                  {locationStatus === "MISSING" && <span className="text-xs font-semibold text-yellow-500 bg-yellow-500/10 px-2 py-0.5 rounded-full flex items-center gap-1"><AlertCircle className="w-3 h-3"/> Missing</span>}
                  {locationStatus === "DENIED" && <span className="text-xs font-semibold text-red-400 bg-red-400/10 px-2 py-0.5 rounded-full flex items-center gap-1"><AlertCircle className="w-3 h-3"/> Denied</span>}
                </div>
                
                <p className="text-sm text-slate-400 mb-6">Add your location so Smart Wardrobe AI can consider weather when creating outfits.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
                  <div>
                    <label className="block text-xs font-label-sm text-slate-400 uppercase tracking-widest mb-2 pl-1">City</label>
                    <input type="text" name="weather_city" placeholder={profile.city || "e.g. London"} value={profile.weather_city || ""} onChange={handleProfileChange} className="w-full bg-[#060816]/80 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-brand-blue/50 focus:border-brand-blue/50 transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)]" />
                  </div>
                  <div>
                    <label className="block text-xs font-label-sm text-slate-400 uppercase tracking-widest mb-2 pl-1">Country</label>
                    <input type="text" name="weather_country" placeholder={profile.country_code || "e.g. UK"} value={profile.weather_country || ""} onChange={handleProfileChange} className="w-full bg-[#060816]/80 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-brand-blue/50 focus:border-brand-blue/50 uppercase transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)]" />
                  </div>
                </div>

                <div className="mt-6 flex justify-start">
                  <button type="button" onClick={handleUseCurrentLocation} className="px-4 py-2 bg-surface-2 border border-brand-blue/30 text-brand-blue font-medium rounded-xl hover:bg-brand-blue/10 hover:border-brand-blue/50 transition-all focus:outline-none focus:ring-2 focus:ring-brand-blue/50 flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4" /> Use My Current Location
                  </button>
                </div>

                <div className="mt-6 bg-brand-blue/5 border border-brand-blue/10 rounded-xl p-4 flex gap-3">
                  <CloudSun className="w-5 h-5 text-brand-blue shrink-0" />
                  <div className="text-sm text-slate-300 leading-relaxed flex-1">
                    {locationStatus === "ACTIVE" && "Using weather data for your saved location."}
                    {locationStatus === "MISSING" && "Add your city or use current location to enable weather-aware outfit suggestions."}
                    {locationStatus === "DENIED" && "Location Permission Denied. You can still enter your city manually."}
                  </div>
                </div>
              </div>

              <div className="pt-6 flex justify-end">
                <button 
                  type="submit" 
                  disabled={profileLoading}
                  className="ds-btn-primary px-8 py-3 shadow-[0_0_20px_rgba(59,130,246,0.2)] flex items-center gap-2"
                >
                  {profileLoading && <Loader2 className="w-4 h-4 animate-spin" />}
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
                  <input type="password" name="current_password" required value={passwordForm.current_password} onChange={handlePasswordChange} className="w-full bg-[#060816]/80 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-red-500/50 focus:border-red-500/50 transition-all" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-label-sm text-slate-400 uppercase tracking-widest mb-2 pl-1">New Password</label>
                  <input type="password" name="new_password" required minLength={8} value={passwordForm.new_password} onChange={handlePasswordChange} className="w-full bg-[#060816]/80 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-red-500/50 focus:border-red-500/50 transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-label-sm text-slate-400 uppercase tracking-widest mb-2 pl-1">Confirm New Password</label>
                  <input type="password" name="confirm_password" required minLength={8} value={passwordForm.confirm_password} onChange={handlePasswordChange} className="w-full bg-[#060816]/80 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-1 focus:ring-red-500/50 focus:border-red-500/50 transition-all" />
                </div>
              </div>
              <div className="pt-4 flex justify-end">
                <button type="submit" disabled={passwordLoading} className="px-6 py-3 bg-surface-2 border border-red-500/30 text-red-400 font-medium rounded-xl hover:bg-red-500/10 hover:border-red-500/50 transition-all focus:outline-none focus:ring-2 focus:ring-red-500/50 disabled:opacity-50">
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
                     <p className="text-xs text-slate-500 mt-0.5">{hasLocation ? "Weather Targeting Active" : "Missing Location Data"}</p>
                   </div>
                 </div>

                 <div className="flex items-start gap-3">
                   {completenessScore >= 80 ? <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" /> : <AlertCircle className="w-5 h-5 text-yellow-500 shrink-0" />}
                   <div>
                     <p className="text-sm font-medium text-slate-200">Identity Graph</p>
                     <p className="text-xs text-slate-500 mt-0.5">{completenessScore >= 80 ? "Sufficient for Deep AI" : "Requires more detail"}</p>
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

               <div className="mt-6 pt-6 border-t border-white/5">
                 <h4 className="text-sm font-medium text-slate-300 mb-3">AI Activity</h4>
                 <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                   View your Gemini key connection status and recent AI activity.
                 </p>
                 <a 
                   href="/settings/ai-usage"
                   className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-brand-purple/10 border border-brand-purple/30 text-brand-purple rounded-xl hover:bg-brand-purple/20 transition-all font-medium text-sm"
                 >
                   <Activity className="w-4 h-4" />
                   View AI Activity
                 </a>
               </div>
             </div>
          </m.div>
        </div>
      </div>
    </m.div>
  );
}
