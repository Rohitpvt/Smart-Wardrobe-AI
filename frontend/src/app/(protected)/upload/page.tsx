"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useToast } from "@/hooks/useToast";
import api from "@/lib/api";
import axios from "axios";
import { UploadCloud, Camera, CheckCircle2, RefreshCw, Sparkles } from "lucide-react";
import { AIAnalysisResult } from "@/lib/types";
import Image from "next/image";

export default function UploadPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [step, setStep] = useState<"select" | "uploading" | "analyzing" | "review">("select");
  
  // AI Results
  const [s3Key, setS3Key] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<AIAnalysisResult | null>(null);

  // Form editing
  const [formData, setFormData] = useState({
    type: "",
    category: "",
    primary_color: "",
    secondary_color: "",
    material: "",
    brand: "",
    season: "",
    occasion: "",
    gender_fit: ""
  });
  const [saving, setSaving] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      // Validate
      if (!["image/jpeg", "image/png", "image/webp"].includes(selectedFile.type)) {
        showToast("Invalid file type. Only JPEG, PNG, WEBP allowed.", "error");
        return;
      }
      if (selectedFile.size > 10 * 1024 * 1024) {
        showToast("File is too large. Max 10MB.", "error");
        return;
      }

      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setStep("select");
    }
  };

  const processUploadAndAnalyze = async () => {
    if (!file) return;

    try {
      setStep("uploading");
      const currentTempId = crypto.randomUUID();

      // 1. Get Presigned URL
      const presignRes = await api.post("/uploads/presign", {
        file_name: file.name,
        file_type: file.type,
        upload_context: "front",
        temp_id: currentTempId
      });

      const { upload_url, fields, s3_key } = presignRes.data;
      setS3Key(s3_key);

      // 2. Upload to S3
      const s3FormData = new FormData();
      Object.entries(fields).forEach(([key, value]) => {
        s3FormData.append(key, value as string);
      });
      s3FormData.append("file", file);

      await axios.post(upload_url, s3FormData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      // 3. Analyze with AI
      setStep("analyzing");
      const analyzeRes = await api.post("/ai/analyze-clothing", {
        s3_key: s3_key,
        user_hints: ""
      });

      const result = analyzeRes.data;
      setAnalysis(result);
      
      // Map to form data
      setFormData({
        type: result.type || "",
        category: result.category || "",
        primary_color: result.primary_color || "",
        secondary_color: result.secondary_color || "",
        material: result.possible_material || "",
        brand: "",
        season: result.season_suggestion || "",
        occasion: result.occasion_suggestion || "",
        gender_fit: ""
      });

      setStep("review");
      showToast("AI Analysis Complete!", "success");

    } catch (error: any) {
      console.error(error);
      const status = error.response?.status;
      const detail = error.response?.data?.detail;

      if (status === 429) {
        showToast("AI provider quota exhausted. Try again later or switch AI_PROVIDER to mock.", "error");
      } else {
        showToast(detail || "Processing failed. Please try again.", "error");
      }
      setStep("select");
    }
  };

  const handleSave = async () => {
    if (!s3Key) return;
    setSaving(true);
    try {
      await api.post("/clothing/", {
        ...formData,
        front_image_key: s3Key,
        ai_detected: true,
        ai_confidence: analysis?.confidence || 0
      });
      
      showToast("Clothing item saved to wardrobe!", "success");
      router.push("/wardrobe");
    } catch (error: any) {
      showToast(error.response?.data?.detail || "Failed to save item.", "error");
      setSaving(false);
    }
  };

  return (
    <div>
      <PageHeader 
        title="Upload & Analyze" 
        description="Add a new item to your wardrobe. Our AI will automatically categorize it for you."
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Image Selection & Progress */}
        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Clothing Image</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center p-6 md:p-8">
            {preview ? (
              <div className="w-full relative aspect-[3/4] rounded-lg overflow-hidden border border-white/10 mb-6 bg-black/50">
                <Image src={preview} alt="Preview" fill unoptimized className="object-cover" />
                {step === "select" && (
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute top-2 right-2 p-2 bg-black/70 rounded-full text-white hover:bg-black"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </button>
                )}
              </div>
            ) : (
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="w-full aspect-[3/4] rounded-lg border-2 border-dashed border-white/20 hover:border-cyber-cyan hover:bg-cyber-cyan/5 transition-colors flex flex-col items-center justify-center mb-6"
              >
                <Camera className="h-12 w-12 text-cloudburst mb-4" />
                <p className="text-porcelain font-medium">Click to select an image</p>
                <p className="text-cloudburst text-sm mt-1">JPEG, PNG, WEBP up to 10MB</p>
              </button>
            )}

            <input 
              type="file" 
              accept="image/jpeg, image/png, image/webp" 
              className="hidden" 
              ref={fileInputRef}
              onChange={handleFileSelect}
            />

            {step === "select" && file && (
              <Button onClick={processUploadAndAnalyze} className="w-full" size="lg">
                <Sparkles className="mr-2 h-5 w-5" /> Analyze with AI
              </Button>
            )}

            {step === "uploading" && (
              <div className="w-full py-4 flex flex-col items-center text-cloudburst">
                <UploadCloud className="h-8 w-8 animate-bounce mb-2 text-cyber-cyan" />
                <p>Uploading securely to private vault...</p>
              </div>
            )}

            {step === "analyzing" && (
              <div className="w-full py-4 flex flex-col items-center text-cloudburst">
                <Sparkles className="h-8 w-8 animate-pulse mb-2 text-cyber-cyan" />
                <p>AI is analyzing your clothing...</p>
              </div>
            )}
            
            {step === "review" && (
              <div className="w-full py-4 flex flex-col items-center text-green-400">
                <CheckCircle2 className="h-8 w-8 mb-2" />
                <p>Analysis Complete</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right Column: AI Results & Form */}
        <Card className={step === "review" ? "opacity-100" : "opacity-50 pointer-events-none"}>
          <CardHeader>
            <CardTitle>AI Extraction Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-6 md:p-8">
            <div className="grid grid-cols-2 gap-4">
              <Input 
                label="Type" 
                value={formData.type} 
                onChange={e => setFormData({...formData, type: e.target.value})} 
                placeholder="e.g. T-Shirt"
              />
              <Input 
                label="Category" 
                value={formData.category} 
                onChange={e => setFormData({...formData, category: e.target.value})} 
                placeholder="e.g. Tops"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <Input 
                label="Primary Color" 
                value={formData.primary_color} 
                onChange={e => setFormData({...formData, primary_color: e.target.value})} 
              />
              <Input 
                label="Secondary Color" 
                value={formData.secondary_color} 
                onChange={e => setFormData({...formData, secondary_color: e.target.value})} 
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input 
                label="Material" 
                value={formData.material} 
                onChange={e => setFormData({...formData, material: e.target.value})} 
              />
              <Input 
                label="Brand" 
                value={formData.brand} 
                onChange={e => setFormData({...formData, brand: e.target.value})} 
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input 
                label="Season" 
                value={formData.season} 
                onChange={e => setFormData({...formData, season: e.target.value})} 
              />
              <Input 
                label="Occasion" 
                value={formData.occasion} 
                onChange={e => setFormData({...formData, occasion: e.target.value})} 
              />
            </div>
          </CardContent>
          <CardFooter className="justify-end">
            <Button 
              onClick={handleSave} 
              isLoading={saving} 
              disabled={step !== "review" || !formData.type || !formData.category}
            >
              Save to Wardrobe
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
