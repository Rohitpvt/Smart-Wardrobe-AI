"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { m, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Loader2, Sparkles, ArrowRight, ArrowLeft, CheckCircle2 } from "lucide-react";
import { api } from "@/lib/axios";
import axios from "axios";
import { GoogleLogin } from '@react-oauth/google';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

// --- Schemas ---
// Local registration requires password; Google registration does not.
const localRegisterSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  email: z.string().min(1, "Email is required").email("Invalid email format"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^a-zA-Z0-9]/, "Password must contain at least one special character"),
  confirm_password: z.string().min(1, "Please confirm your password"),
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
}).refine((data) => data.password === data.confirm_password, {
  message: "Passwords do not match",
  path: ["confirm_password"],
});

const googleRegisterSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  email: z.string().min(1, "Email is required").email("Invalid email format"),
  password: z.string().optional(),
  confirm_password: z.string().optional(),
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

type RegisterFormValues = z.infer<typeof localRegisterSchema>;

const getPasswordStrength = (password: string) => {
  if (!password) return null;
  if (password.length < 8) return { label: "Weak", color: "bg-red-500", text: "text-red-500", width: "w-1/3" };
  const hasLetters = /[a-zA-Z]/.test(password);
  const hasNumbers = /[0-9]/.test(password);
  const hasSymbols = /[^a-zA-Z0-9]/.test(password);
  
  if (hasLetters && hasNumbers && hasSymbols) {
      return { label: "Strong", color: "bg-emerald-500", text: "text-emerald-500", width: "w-full" };
  }
  if ((hasLetters && hasNumbers) || (hasLetters && hasSymbols)) {
      return { label: "Medium", color: "bg-yellow-500", text: "text-yellow-500", width: "w-2/3" };
  }
  return { label: "Weak", color: "bg-red-500", text: "text-red-500", width: "w-1/3" };
};

export function RegisterForm() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [infoMsg, setInfoMsg] = useState("");
  const [debugData, setDebugData] = useState<any>(null);

  // --- Google registration state ---
  const [isGoogleRegistration, setIsGoogleRegistration] = useState(false);

  const {
    register,
    handleSubmit,
    trigger,
    getValues,
    setValue,
    setError,
    watch,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(isGoogleRegistration ? googleRegisterSchema : localRegisterSchema) as any,
    mode: "onTouched",
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      password: "",
      confirm_password: "",
      age: "",
      gender: "",
      height_cm: "",
      body_type: "",
      fashion_experience: "",
      primary_style: "",
    }
  });

  const passwordValue = watch("password");
  const strength = getPasswordStrength(passwordValue || "");

  // --- Check for pending Google registration on mount ---
  useEffect(() => {
    const checkPendingRegistration = async () => {
      try {
        const response = await api.get("/auth/google/pending-registration");
        if (response.data.status === "pending") {
          setIsGoogleRegistration(true);
          setValue("first_name", response.data.first_name || "");
          setValue("last_name", response.data.last_name || "");
          setValue("email", response.data.email || "");
          setInfoMsg("");
          setErrorMsg("");
          setSuccessMsg("Google account verified. Complete your style profile to finish registration.");
          setStep(2);
        }
      } catch (error) {
        // Ignore errors, user just won't be in pending state
      }
    };
    checkPendingRegistration();
  }, [setValue]);

  // --- Local registration mutation ---
  const registerMutation = useMutation({
    mutationFn: async (data: RegisterFormValues) => {
      const payload: any = {
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        password: data.password,
        age: parseInt(data.age, 10),
        gender: data.gender,
      };
      
      if (data.height_cm) payload.height_cm = parseInt(data.height_cm, 10);
      if (data.body_type) payload.body_type = data.body_type;
      if (data.fashion_experience) payload.fashion_experience = data.fashion_experience;
      if (data.primary_style) payload.primary_style = data.primary_style;

      await api.post("/auth/register", payload);
      return true;
    },
    onSuccess: () => {
      setSuccessMsg("Account created successfully. Redirecting to login...");
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    },
    onError: (error: unknown) => {
      if (axios.isAxiosError(error) && error.response) {
        const status = error.response.status;
        const detail = error.response.data?.detail || error.response.data?.error;
        if (status === 400) {
          setErrorMsg(detail || "Registration failed.");
        } else if (status === 429) {
          setErrorMsg(detail || "Too many attempts. Please try again later.");
        } else if (status === 422) {
          if (Array.isArray(detail)) {
            setErrorMsg(detail.map((err: { msg: string }) => err.msg).join(", "));
          } else {
            setErrorMsg("Please fill out all required fields correctly.");
          }
        } else {
          setErrorMsg(detail || "An unexpected error occurred.");
        }
      } else {
        setErrorMsg("Network error. Please ensure the server is running.");
      }
    },
  });

  // --- Google register-start mutation ---
  const googleRegisterStartMutation = useMutation({
    mutationFn: async (credential: string) => {
      const response = await api.post("/auth/google/register-start", { credential });
      return response.data;
    },
    onSuccess: (data) => {
      if (data.status === "account_exists") {
        setErrorMsg("");
        setInfoMsg("This Google account is already registered. Please sign in instead.");
      } else if (data.status === "new_google_user") {
        setIsGoogleRegistration(true);

        // Pre-fill Google-provided fields
        setValue("first_name", data.first_name || "");
        setValue("last_name", data.last_name || "");
        setValue("email", data.email || "");

        // Clear any previous messages
        setErrorMsg("");
        setInfoMsg("");
        setSuccessMsg("Google account verified. Complete your style profile to finish registration.");

        // Advance directly to Step 2
        setStep(2);
      }
    },
    onError: (error: unknown) => {
      setDebugData(null);
      if (axios.isAxiosError(error) && error.response) {
        if (error.response.data?.debug) {
          console.table(error.response.data.debug);
          setDebugData(error.response.data.debug);
        }
        setErrorMsg(error.response.data?.detail?.message || error.response.data?.detail || "Google verification failed.");
      } else {
        setErrorMsg("Network error during Google verification.");
      }
    }
  });

  // --- Google register-complete mutation ---
  const googleRegisterCompleteMutation = useMutation({
    mutationFn: async (data: RegisterFormValues) => {
      const payload: any = {
        age: parseInt(data.age, 10),
        gender: data.gender,
      };
      if (data.height_cm) payload.height_cm = parseInt(data.height_cm, 10);
      if (data.body_type) payload.body_type = data.body_type;
      if (data.fashion_experience) payload.fashion_experience = data.fashion_experience;
      if (data.primary_style) payload.primary_style = data.primary_style;

      const response = await api.post("/auth/google/register-complete", payload);
      return response.data;
    },
    onSuccess: () => {
      setSuccessMsg("Account created successfully! Redirecting to login...");
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    },
    onError: (error: unknown) => {
      if (axios.isAxiosError(error) && error.response) {
        setErrorMsg(error.response.data?.detail || "Google registration failed.");
      } else {
        setErrorMsg("Network error. Please try again.");
      }
    },
  });

  const cancelGoogleRegistration = async () => {
    try {
      await api.post("/auth/google/register-cancel");
    } catch (e) {
      // Ignore errors if cookie was already gone
    }
    setIsGoogleRegistration(false);
    setStep(1);
    setValue("first_name", "");
    setValue("last_name", "");
    setValue("email", "");
    setSuccessMsg("");
    setInfoMsg("");
    setErrorMsg("");
  };

  const nextStep = async () => {
    setErrorMsg("");
    if (step === 1) {
      const fieldsToValidate: (keyof RegisterFormValues)[] = isGoogleRegistration
        ? ["first_name", "last_name", "email"]
        : ["first_name", "last_name", "email", "password", "confirm_password"];
      
      const isValid = await trigger(fieldsToValidate);
      if (!isValid) return;

      // Check email availability (only for local registration — Google handles this in register-start)
      if (!isGoogleRegistration) {
        const email = getValues("email").trim();
        try {
          const res = await api.get(`/auth/check-email?email=${encodeURIComponent(email)}`);
          if (!res.data.available) {
            setError("email", { type: "manual", message: "Email is already taken" });
            return;
          }
        } catch (e) {
          setErrorMsg("Failed to verify email availability.");
          return;
        }
      }
    } else if (step === 2) {
      const isValid = await trigger(["age", "gender", "height_cm"]);
      if (!isValid) return;
    }
    setStep(step + 1);
  };

  const prevStep = () => {
    setErrorMsg("");
    // For Google registration, don't allow going back to Step 1
    if (isGoogleRegistration && step === 2) return;
    setStep(step - 1);
  };

  const onSubmit = (data: RegisterFormValues) => {
    // Prevent accidental form submission via Enter key on earlier steps
    if (step < 3) {
      nextStep();
      return;
    }

    setErrorMsg("");
    setSuccessMsg("");
    if (isGoogleRegistration) {
      googleRegisterCompleteMutation.mutate(data);
    } else {
      registerMutation.mutate(data);
    }
  };

  const isPending = registerMutation.isPending || googleRegisterCompleteMutation.isPending;

  // --- Step label ---
  const getStepLabel = () => {
    if (isGoogleRegistration) {
      if (step === 2) return "Physical Traits";
      if (step === 3) return "Style Preferences";
      return "Google Verification";
    }
    if (step === 1) return "Basic Info";
    if (step === 2) return "Physical Traits";
    return "Style Preferences";
  };

  const totalSteps = isGoogleRegistration ? 2 : 3;
  const displayStep = isGoogleRegistration ? step - 1 : step;

  return (
    <m.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary tracking-tight mb-2">
          Create your account
        </h1>
        <p className="text-text-secondary">
          Step {displayStep} of {totalSteps}: {getStepLabel()}
        </p>
        
        {/* Progress bar */}
        <div className="w-full h-1 bg-border-subtle rounded-full mt-4 overflow-hidden">
          <m.div 
            className="h-full bg-brand-blue"
            initial={{ width: `${((displayStep - 1) / totalSteps) * 100}%` }}
            animate={{ width: `${(displayStep / totalSteps) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      {/* Error message */}
      <AnimatePresence>
        {errorMsg && (
          <m.div
            initial={{ opacity: 0, y: -8, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 overflow-hidden"
          >
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center mt-0.5 shrink-0">
                <span className="text-xs">!</span>
              </div>
              <div className="flex flex-col">
                <span>{errorMsg}</span>
                {debugData && (
                  <div className="mt-3 p-3 bg-black/40 rounded border border-red-500/20 text-xs font-mono text-red-200/80 relative">
                    <div className="font-bold text-red-300 mb-1 flex justify-between items-center">
                      <span>Google OAuth Debug</span>
                      <button 
                        type="button"
                        onClick={() => navigator.clipboard.writeText(JSON.stringify(debugData, null, 2))}
                        className="bg-red-500/20 hover:bg-red-500/30 text-red-300 px-2 py-1 rounded text-[10px] uppercase font-bold tracking-wider transition-colors"
                      >
                        Copy Debug JSON
                      </button>
                    </div>
                    <div>Exception: {debugData.exception_message}</div>
                    <div>Type: {debugData.exception_type}</div>
                    <div>Audience Match: {String(debugData.aud_matches_backend)}</div>
                    <div>Issuer: {debugData.token_iss}</div>
                    <div>Segments: {debugData.token_segments}</div>
                    <div className="mt-1 truncate opacity-75">Client: {debugData.backend_google_client_id}</div>
                    <div className="mt-3 pt-2 border-t border-red-500/20 text-[10px] text-red-300/60 leading-tight">
                      The latest Google OAuth debug error has also been saved to artifacts/GOOGLE_LATEST_TOKEN_ERROR.json
                    </div>
                  </div>
                )}
              </div>
            </div>
          </m.div>
        )}
      </AnimatePresence>

      {/* Info message (account already exists) */}
      <AnimatePresence>
        {infoMsg && (
          <m.div
            initial={{ opacity: 0, y: -8, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 overflow-hidden"
          >
            <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-400 text-sm flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center mt-0.5 shrink-0">
                <span className="text-xs">i</span>
              </div>
              <div>
                <span>{infoMsg}</span>
                <div className="mt-2">
                  <Link href="/login" className="text-brand-blue hover:text-blue-400 font-semibold transition-colors underline">
                    Go to Login →
                  </Link>
                </div>
              </div>
            </div>
          </m.div>
        )}
      </AnimatePresence>

      {/* Success message */}
      <AnimatePresence>
        {successMsg && (
          <m.div
            initial={{ opacity: 0, y: -8, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-6 overflow-hidden"
          >
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-sm flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center mt-0.5 shrink-0">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
              <span>{successMsg}</span>
            </div>
          </m.div>
        )}
      </AnimatePresence>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        
        {/* STEP 1: Basic Info (local registration only — Google skips this) */}
        {step === 1 && !isGoogleRegistration && (
          <m.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
            
            {/* Google Registration */}
            <div className="flex justify-center mb-6 mt-2">
              <GoogleLogin
                onSuccess={credentialResponse => {
                  console.log("Google credential exists:", !!credentialResponse.credential);
                  console.log("Google credential length:", credentialResponse.credential?.length);
                  console.log("Google credential segments:", credentialResponse.credential?.split(".").length);
                  
                  if (!credentialResponse.credential) {
                    setErrorMsg("Google did not return a valid credential. Please try again.");
                    return;
                  }
                  
                  setErrorMsg("");
                  setInfoMsg("");
                  googleRegisterStartMutation.mutate(credentialResponse.credential);
                }}
                onError={() => {
                  setErrorMsg("Google sign-in was unsuccessful");
                }}
                theme="filled_black"
                shape="pill"
                text="continue_with"
              />
            </div>
            
            <div className="flex items-center gap-4 py-2">
              <div className="flex-1 h-px bg-border-subtle" />
              <span className="text-text-tertiary text-xs font-medium uppercase tracking-wider">or sign up with email</span>
              <div className="flex-1 h-px bg-border-subtle" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-text-secondary">First name *</label>
                <input type="text" {...register("first_name")} placeholder="Jane" className={`ds-input py-3 rounded-xl focus:border-brand-blue ${errors.first_name ? 'border-red-500' : 'border-border-subtle'}`} />
                {errors.first_name && <p className="text-red-500 text-xs mt-1">{errors.first_name.message}</p>}
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-text-secondary">Last name *</label>
                <input type="text" {...register("last_name")} placeholder="Doe" className={`ds-input py-3 rounded-xl focus:border-brand-blue ${errors.last_name ? 'border-red-500' : 'border-border-subtle'}`} />
                {errors.last_name && <p className="text-red-500 text-xs mt-1">{errors.last_name.message}</p>}
              </div>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-text-secondary">Email address *</label>
              <input type="email" {...register("email")} placeholder="you@example.com" className={`ds-input py-3 rounded-xl focus:border-brand-blue ${errors.email ? 'border-red-500' : 'border-border-subtle'}`} />
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-text-secondary">Password *</label>
              <div className="relative">
                <input type={showPassword ? "text" : "password"} {...register("password")} placeholder="Minimum 8 characters" className={`ds-input py-3 rounded-xl focus:border-brand-blue pr-11 ${errors.password ? 'border-red-500' : 'border-border-subtle'}`} />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-secondary transition-colors p-1">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
              {/* Password strength indicator */}
              {strength && (
                <div className="mt-2">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-text-secondary">Password strength</span>
                    <span className={strength.text}>{strength.label}</span>
                  </div>
                  <div className="w-full h-1.5 bg-border-subtle rounded-full overflow-hidden">
                    <div className={`h-full ${strength.color} ${strength.width} transition-all duration-300`} />
                  </div>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-text-secondary">Confirm Password *</label>
              <div className="relative">
                <input type={showConfirmPassword ? "text" : "password"} {...register("confirm_password")} placeholder="Re-enter password" className={`ds-input py-3 rounded-xl focus:border-brand-blue pr-11 ${errors.confirm_password ? 'border-red-500' : 'border-border-subtle'}`} />
                <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-secondary transition-colors p-1">
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.confirm_password && <p className="text-red-500 text-xs mt-1">{errors.confirm_password.message}</p>}
            </div>
          </m.div>
        )}

        {/* STEP 2: Physical Traits */}
        {step === 2 && (
          <m.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
            {/* Show Google pre-filled info for Google registrations */}
            {isGoogleRegistration && (
              <div className="p-3 bg-[#1e2433] border border-border-subtle rounded-xl mb-4 flex items-center justify-between">
                <div>
                  <p className="text-text-tertiary text-xs uppercase tracking-wider mb-2">Google Account</p>
                  <p className="text-text-primary text-sm font-medium">{getValues("first_name")} {getValues("last_name")}</p>
                  <p className="text-text-secondary text-xs">{getValues("email")}</p>
                </div>
                <button 
                  type="button" 
                  onClick={cancelGoogleRegistration}
                  className="text-xs text-brand-blue hover:text-blue-400 font-medium transition-colors border border-brand-blue/30 px-3 py-1.5 rounded-lg hover:bg-brand-blue/10"
                >
                  Switch Account
                </button>
              </div>
            )}
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
            <div className="space-y-2">
              <label className="block text-sm font-medium text-text-secondary">Height (cm) <span className="text-text-tertiary font-normal">(optional)</span></label>
              <input type="number" {...register("height_cm")} placeholder="175" className={`ds-input py-3 rounded-xl focus:border-brand-blue ${errors.height_cm ? 'border-red-500' : 'border-border-subtle'}`} />
              {errors.height_cm && <p className="text-red-500 text-xs mt-1">{errors.height_cm.message}</p>}
            </div>
          </m.div>
        )}

        {/* STEP 3: Style Preferences */}
        {step === 3 && (
          <m.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-text-secondary">Body Type <span className="text-text-tertiary font-normal">(optional)</span></label>
              <select {...register("body_type")} className="ds-input py-3 rounded-xl border-border-subtle focus:border-brand-blue appearance-none">
                <option value="">Select body type</option>
                <option value="Slim">Slim</option>
                <option value="Athletic">Athletic</option>
                <option value="Average">Average</option>
                <option value="Curvy">Curvy</option>
                <option value="Plus Size">Plus Size</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-text-secondary">Fashion Experience <span className="text-text-tertiary font-normal">(optional)</span></label>
              <select {...register("fashion_experience")} className="ds-input py-3 rounded-xl border-border-subtle focus:border-brand-blue appearance-none">
                <option value="">Select experience level</option>
                <option value="Beginner">Beginner - I need help with basics</option>
                <option value="Intermediate">Intermediate - I know what I like</option>
                <option value="Advanced">Advanced - I follow trends closely</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-text-secondary">Primary Style <span className="text-text-tertiary font-normal">(optional)</span></label>
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
          </m.div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center gap-3 pt-4">
          {step > 1 && !(isGoogleRegistration && step === 2) && (
            <button type="button" onClick={prevStep} disabled={isPending} className="ds-btn-secondary py-3.5 px-4 flex items-center justify-center">
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          
          {step < 3 ? (
            <button type="button" onClick={nextStep} className="ds-btn-primary flex-1 py-3.5 text-base flex items-center justify-center gap-2">
              Next Step <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button type="button" onClick={handleSubmit(onSubmit)} disabled={isPending || successMsg.includes("Account created")} className="ds-btn-primary flex-1 py-3.5 text-base flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
              {isPending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Completing...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Complete Registration
                </>
              )}
            </button>
          )}
        </div>
      </form>

      {/* Login link */}
      <div className="mt-8 text-center text-sm text-text-secondary">
        Already have an account?{" "}
        <Link href="/login" className="text-brand-blue hover:text-blue-400 font-semibold transition-colors">
          Sign in
        </Link>
      </div>
    </m.div>
  );
}
