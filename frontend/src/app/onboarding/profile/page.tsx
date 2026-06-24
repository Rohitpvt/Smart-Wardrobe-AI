"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { m } from "framer-motion";
import { Loader2, ArrowRight } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const onboardingSchema = z.object({
  age: z.string().min(1, "Age is required").refine((val) => {
    const num = parseInt(val, 10);
    return !isNaN(num) && num >= 13 && num <= 100;
  }, { message: "Age must be between 13 and 100" }),
  gender: z.string().min(1, "Gender is required"),
  height_cm: z.string().optional().refine((val) => {
    if (!val) return true;
    const num = parseInt(val, 10);
    return !isNaN(num) && num >= 100 && num <= 250;
  }, { message: "Height must be between 100 and 250 cm" }),
  body_type: z.string().optional(),
  fashion_experience: z.string().optional(),
  primary_style: z.string().optional(),
});

type OnboardingFormValues = z.infer<typeof onboardingSchema>;

export default function OnboardingPage() {
  const router = useRouter();
  const [errorMsg, setErrorMsg] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<OnboardingFormValues>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      age: "",
      gender: "",
      height_cm: "",
      body_type: "",
      fashion_experience: "",
      primary_style: "",
    }
  });

  const onboardingMutation = useMutation({
    mutationFn: async (data: OnboardingFormValues) => {
      const payload: any = {
        age: parseInt(data.age, 10),
        gender: data.gender,
        onboarding_completed: true
      };
      
      if (data.height_cm) payload.height_cm = parseInt(data.height_cm, 10);
      if (data.body_type) payload.body_type = data.body_type;
      if (data.fashion_experience) payload.fashion_experience = data.fashion_experience;
      if (data.primary_style) payload.primary_style = data.primary_style;

      await api.put("/users/profile", payload);
      return true;
    },
    onSuccess: () => {
      router.push("/dashboard");
    },
    onError: () => {
      setErrorMsg("Failed to save profile. Please try again.");
    }
  });

  const onSubmit = (data: OnboardingFormValues) => {
    setErrorMsg("");
    onboardingMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-[#10131a] flex items-center justify-center p-6">
      <m.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-xl bg-[#1a1f2b] p-8 rounded-2xl border border-border-subtle"
      >
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary tracking-tight mb-2">
            Complete your profile
          </h1>
          <p className="text-text-secondary">
            To generate personalized recommendations, the AI Stylist needs to know a bit about you.
          </p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-text-secondary">Age *</label>
              <input type="number" {...register("age")} placeholder="25" className={`ds-input py-3 rounded-xl focus:border-brand-blue ${errors.age ? 'border-red-500' : 'border-border-subtle'}`} />
              {errors.age && <p className="text-red-500 text-xs mt-1">{errors.age.message}</p>}
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-text-secondary">Gender *</label>
              <select {...register("gender")} className={`ds-input py-3 rounded-xl focus:border-brand-blue appearance-none ${errors.gender ? 'border-red-500' : 'border-border-subtle'}`}>
                <option value="" disabled>Select gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Non-binary">Non-binary</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
              {errors.gender && <p className="text-red-500 text-xs mt-1">{errors.gender.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-text-secondary">Height (cm)</label>
              <input type="number" {...register("height_cm")} placeholder="175" className={`ds-input py-3 rounded-xl focus:border-brand-blue ${errors.height_cm ? 'border-red-500' : 'border-border-subtle'}`} />
              {errors.height_cm && <p className="text-red-500 text-xs mt-1">{errors.height_cm.message}</p>}
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-text-secondary">Body Type</label>
              <select {...register("body_type")} className="ds-input py-3 rounded-xl border-border-subtle focus:border-brand-blue appearance-none">
                <option value="">Select body type</option>
                <option value="Slim">Slim</option>
                <option value="Athletic">Athletic</option>
                <option value="Average">Average</option>
                <option value="Curvy">Curvy</option>
                <option value="Plus Size">Plus Size</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-text-secondary">Fashion Experience</label>
            <select {...register("fashion_experience")} className="ds-input py-3 rounded-xl border-border-subtle focus:border-brand-blue appearance-none">
              <option value="">Select experience level</option>
              <option value="Beginner">Beginner - I need help with basics</option>
              <option value="Intermediate">Intermediate - I know what I like</option>
              <option value="Advanced">Advanced - I follow trends closely</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-text-secondary">Primary Style</label>
            <select {...register("primary_style")} className="ds-input py-3 rounded-xl border-border-subtle focus:border-brand-blue appearance-none">
              <option value="">Select primary style</option>
              <option value="Casual">Casual</option>
              <option value="Streetwear">Streetwear</option>
              <option value="Minimalist">Minimalist</option>
              <option value="Vintage">Vintage</option>
              <option value="Business Professional">Business Professional</option>
              <option value="Bohemian">Bohemian</option>
            </select>
          </div>

          <button type="submit" disabled={onboardingMutation.isPending} className="ds-btn-primary w-full py-4 text-base flex items-center justify-center gap-2 mt-4">
            {onboardingMutation.isPending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>Finish Setup <ArrowRight className="w-5 h-5" /></>
            )}
          </button>
        </form>
      </m.div>
    </div>
  );
}
