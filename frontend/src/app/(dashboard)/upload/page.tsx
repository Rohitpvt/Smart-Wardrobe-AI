"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import PageHeader from "@/components/ui/PageHeader";
import StepForm from "@/components/ui/StepForm";
import UploadDropzone from "@/components/ui/UploadDropzone";
import AIInsightCard from "@/components/ai/AIInsightCard";
import * as Constants from "@/lib/constants";
import Image from "next/image";

type Step = 0 | 1 | 2 | 3 | 4;

export default function UploadPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(0);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  
  const [tempId] = useState(crypto.randomUUID());

  const [frontImage, setFrontImage] = useState<File | null>(null);
  const [frontImageKey, setFrontImageKey] = useState<string | null>(null);
  const [frontPreview, setFrontPreview] = useState<string | null>(null);
  
  const [backImage, setBackImage] = useState<File | null>(null);
  const [backImageKey, setBackImageKey] = useState<string | null>(null);
  
  const [labelImage, setLabelImage] = useState<File | null>(null);
  const [labelImageKey, setLabelImageKey] = useState<string | null>(null);

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState<any>(null);

  const [formData, setFormData] = useState({
    type: "",
    category: "",
    brand: "",
    primary_color: "",
    secondary_color: "",
    size: "",
    gender_fit: "",
    material: "",
    season: "",
    occasion: "",
    condition: "",
    usage_frequency: "",
    purchase_date: "",
    price_range: "",
    notes: ""
  });

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFrontImageSelect = (file: File) => {
    setFrontImage(file);
    setFrontImageKey(null);
    setAiResult(null);
    const objectUrl = URL.createObjectURL(file);
    setFrontPreview(objectUrl);
  };

  const uploadToS3 = async (file: File, context: string): Promise<string> => {
    const { upload_url, fields, s3_key } = await api.uploads.presign({
      file_name: file.name,
      file_type: file.type,
      upload_context: context,
      temp_id: tempId
    });

    const fd = new FormData();
    Object.entries(fields).forEach(([k, v]) => fd.append(k, v));
    fd.append("file", file);

    const response = await fetch(upload_url, {
      method: "POST",
      body: fd
    });

    if (!response.ok) {
      throw new Error(`Failed to upload ${context} image to S3.`);
    }

    return s3_key;
  };

  const handleAnalyzeAI = async () => {
    if (!frontImage) return;
    
    try {
      setIsAnalyzing(true);
      setError("");
      
      let key = frontImageKey;
      if (!key) {
        key = await uploadToS3(frontImage, "front");
        setFrontImageKey(key);
      }

      const result = await api.ai.analyzeClothing({ s3_key: key });
      setAiResult(result);

    } catch (err: any) {
      setError(err.message || "Failed to analyze image with AI.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const applyAISuggestions = () => {
    if (!aiResult) return;
    
    setFormData(prev => ({
      ...prev,
      type: aiResult.type || prev.type,
      category: aiResult.category || prev.category,
      primary_color: aiResult.primary_color || prev.primary_color,
      secondary_color: aiResult.secondary_color || prev.secondary_color,
      material: aiResult.possible_material || prev.material,
      season: aiResult.season_suggestion || prev.season,
      occasion: aiResult.occasion_suggestion || prev.occasion,
      condition: aiResult.visible_condition || prev.condition,
    }));
    
    setStep(1);
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError("");

      if (!frontImage && !frontImageKey) {
        throw new Error("Front image is required.");
      }

      const f_key = frontImageKey || await uploadToS3(frontImage!, "front");
      const b_key = backImage && !backImageKey ? await uploadToS3(backImage, "back") : backImageKey;
      const l_key = labelImage && !labelImageKey ? await uploadToS3(labelImage, "label") : labelImageKey;

      const payload = {
        ...formData,
        front_image_key: f_key,
        back_image_key: b_key,
        label_image_key: l_key,
        purchase_date: formData.purchase_date ? new Date(formData.purchase_date).toISOString() : null,
        ai_detected: !!aiResult,
        ai_confidence: aiResult?.confidence_score ? Math.round(aiResult.confidence_score * 100) : null
      };

      const newItem = await api.clothing.create(payload);
      router.push(`/wardrobe/${(newItem as any).id}`);
    } catch (err: any) {
      setError(err.message || "An error occurred during save.");
      setIsSaving(false);
    }
  };

  const nextStep = () => {
    if (step === 0 && !frontImage) {
      setError("Front image is required.");
      return;
    }
    setError("");
    setStep((prev) => Math.min(prev + 1, 4) as Step);
  };

  const prevStep = () => setStep((prev) => Math.max(prev - 1, 0) as Step);

  const renderSelect = (label: string, field: keyof typeof formData, options: string[], required = false) => (
    <div>
      <label className="block text-[12px] font-medium text-cloudburst mb-1.5 uppercase tracking-wider">
        {label} {required && <span className="text-cyber-cyan">*</span>}
      </label>
      <select
        required={required}
        value={formData[field]}
        onChange={e => handleChange(field, e.target.value)}
        className="w-full bg-inkwell border border-starlight/10 rounded-xl px-4 py-3 text-porcelain text-sm focus:outline-none focus:border-cyber-cyan/50 focus:ring-1 focus:ring-cyber-cyan/50 transition-colors"
      >
        <option value="">Select...</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );

  const stepsList = [
    { id: "images", label: "Images & AI" },
    { id: "basic", label: "Basic Details" },
    { id: "style", label: "Style & Fit" },
    { id: "usage", label: "Usage & Care" },
    { id: "review", label: "Review" },
  ];

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto">
      <PageHeader 
        title="Add to Wardrobe" 
        description="Upload an item to track usage and get AI suggestions."
      />

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
          {error}
        </div>
      )}

      <Card variant="translucent" className="p-6 md:p-10 shadow-2xl">
        <StepForm
          steps={stepsList}
          currentStepIndex={step}
          onNext={nextStep}
          onPrev={prevStep}
          onSubmit={handleSave}
          isSubmitting={isSaving}
        >
          {step === 0 && (
            <div className="space-y-8 animate-fade-in">
              <div>
                <h3 className="text-porcelain font-medium mb-4">Front Image <span className="text-cyber-cyan">*</span></h3>
                {!frontImage ? (
                  <UploadDropzone onFileSelect={handleFrontImageSelect} isUploading={isAnalyzing} />
                ) : (
                  <div className="flex flex-col md:flex-row gap-6">
                    <div className="relative w-48 h-64 bg-inkwell rounded-xl border border-starlight/10 overflow-hidden flex-shrink-0">
                      {frontPreview && (
                        <Image src={frontPreview} alt="Preview" fill className="object-cover" />
                      )}
                      <button 
                        onClick={() => { setFrontImage(null); setFrontPreview(null); setAiResult(null); }}
                        className="absolute top-2 right-2 bg-carbon/80 text-porcelain p-1.5 rounded-full hover:bg-red-500/80 transition-colors"
                      >
                        ✕
                      </button>
                    </div>
                    
                    <div className="flex-1 flex flex-col justify-center">
                      {!aiResult ? (
                        <div className="text-center md:text-left space-y-4">
                          <p className="text-sm text-cloudburst">Image loaded. Let AI extract the details to save you time.</p>
                          <Button 
                            variant="filled" 
                            onClick={handleAnalyzeAI} 
                            disabled={isAnalyzing}
                            className="bg-cyber-cyan text-inkwell w-full md:w-auto"
                          >
                            {isAnalyzing ? "Analyzing..." : "✨ Extract Details"}
                          </Button>
                          <div className="block mt-4">
                             <Button variant="ghost" onClick={nextStep} className="text-xs text-cloudburst hover:text-porcelain">Skip AI analysis</Button>
                          </div>
                        </div>
                      ) : (
                        <div className="animate-fade-in-up">
                          <AIInsightCard 
                            title="AI Analysis Complete" 
                            description={`"${aiResult.explanation}"`}
                            confidence={Math.round(aiResult.confidence_score * 100)}
                          />
                          <div className="mt-4 flex flex-wrap gap-2">
                            {aiResult.type && <Badge variant="cyan">{aiResult.type}</Badge>}
                            {aiResult.category && <Badge variant="cyan">{aiResult.category}</Badge>}
                            {aiResult.primary_color && <Badge variant="cyan">{aiResult.primary_color}</Badge>}
                          </div>
                          <div className="mt-6 flex gap-3">
                            <Button variant="filled" onClick={applyAISuggestions} className="bg-porcelain text-carbon flex-1">Apply & Continue</Button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-starlight/10">
                <div>
                  <h3 className="text-cloudburst text-sm font-medium mb-2">Back Image (Optional)</h3>
                  <input type="file" accept="image/jpeg, image/png, image/webp" onChange={e => {setBackImage(e.target.files?.[0] || null); setBackImageKey(null);}} className="text-sm text-cloudburst file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-medium file:bg-carbon file:text-porcelain hover:file:bg-starlight/10 cursor-pointer w-full" />
                </div>
                <div>
                  <h3 className="text-cloudburst text-sm font-medium mb-2">Label/Tag Image (Optional)</h3>
                  <input type="file" accept="image/jpeg, image/png, image/webp" onChange={e => {setLabelImage(e.target.files?.[0] || null); setLabelImageKey(null);}} className="text-sm text-cloudburst file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-medium file:bg-carbon file:text-porcelain hover:file:bg-starlight/10 cursor-pointer w-full" />
                </div>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-6 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {renderSelect("Type", "type", Constants.CLOTHING_TYPES, true)}
                {renderSelect("Category", "category", Constants.CATEGORIES, true)}
                {renderSelect("Primary Color", "primary_color", Constants.COLORS, true)}
                {renderSelect("Secondary Color", "secondary_color", Constants.COLORS)}
                {renderSelect("Size", "size", Constants.SIZES)}
                <div>
                  <label className="block text-[12px] font-medium text-cloudburst mb-1.5 uppercase tracking-wider">Brand</label>
                  <input type="text" value={formData.brand} onChange={e => handleChange("brand", e.target.value)} className="w-full bg-inkwell border border-starlight/10 rounded-xl px-4 py-3 text-porcelain text-sm focus:outline-none focus:border-cyber-cyan/50 focus:ring-1 focus:ring-cyber-cyan/50 transition-colors" placeholder="e.g. Nike, Zara, Vintage" />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {renderSelect("Gender / Fit", "gender_fit", Constants.GENDER_FIT)}
                {renderSelect("Material / Fabric", "material", Constants.MATERIALS)}
                {renderSelect("Season", "season", Constants.SEASONS)}
                {renderSelect("Occasion", "occasion", Constants.OCCASIONS)}
                {renderSelect("Condition", "condition", Constants.CONDITIONS)}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {renderSelect("Usage Frequency", "usage_frequency", Constants.USAGE_FREQUENCIES)}
                {renderSelect("Price Range", "price_range", Constants.PRICE_RANGES)}
                <div>
                  <label className="block text-[12px] font-medium text-cloudburst mb-1.5 uppercase tracking-wider">Purchase Date</label>
                  <input type="date" value={formData.purchase_date} onChange={e => handleChange("purchase_date", e.target.value)} className="w-full bg-inkwell border border-starlight/10 rounded-xl px-4 py-3 text-porcelain text-sm focus:outline-none focus:border-cyber-cyan/50 focus:ring-1 focus:ring-cyber-cyan/50 transition-colors [color-scheme:dark]" />
                </div>
              </div>
              <div>
                <label className="block text-[12px] font-medium text-cloudburst mb-1.5 uppercase tracking-wider">Notes</label>
                <textarea value={formData.notes} onChange={e => handleChange("notes", e.target.value)} rows={4} className="w-full bg-inkwell border border-starlight/10 rounded-xl px-4 py-3 text-porcelain text-sm focus:outline-none focus:border-cyber-cyan/50 focus:ring-1 focus:ring-cyber-cyan/50 transition-colors" placeholder="Any special care instructions, memories, or styling notes..." />
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-8 animate-fade-in">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                
                <div className="md:col-span-1">
                  <div className="relative w-full aspect-[3/4] bg-inkwell rounded-xl border border-starlight/10 overflow-hidden mb-4">
                    {frontPreview ? (
                      <Image src={frontPreview} alt="Preview" fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl">👕</div>
                    )}
                  </div>
                </div>

                <div className="md:col-span-2 space-y-6">
                  <div>
                    <h4 className="text-sm font-medium text-cloudburst uppercase tracking-wider mb-3">Classification</h4>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="cyan" className="bg-carbon border border-starlight/10">{formData.type || "No Type"}</Badge>
                      <Badge variant="cyan" className="bg-carbon border border-starlight/10">{formData.category || "No Category"}</Badge>
                      {formData.brand && <Badge variant="default" className="bg-carbon border border-starlight/10">{formData.brand}</Badge>}
                      {aiResult && <Badge variant="success" className="bg-cyber-cyan/10 border border-cyber-cyan/30 text-cyber-cyan">✨ AI Assisted</Badge>}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-cloudburst uppercase tracking-wider mb-3">Style & Material</h4>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-3 py-1.5 bg-carbon rounded-full text-xs text-porcelain border border-starlight/10">{formData.primary_color || "No Color"}</span>
                      {formData.secondary_color && <span className="px-3 py-1.5 bg-carbon rounded-full text-xs text-porcelain border border-starlight/10">{formData.secondary_color}</span>}
                      {formData.material && <span className="px-3 py-1.5 bg-carbon rounded-full text-xs text-porcelain border border-starlight/10">{formData.material}</span>}
                      {formData.season && <span className="px-3 py-1.5 bg-carbon rounded-full text-xs text-porcelain border border-starlight/10">{formData.season}</span>}
                      {formData.occasion && <span className="px-3 py-1.5 bg-carbon rounded-full text-xs text-porcelain border border-starlight/10">{formData.occasion}</span>}
                    </div>
                  </div>

                  {formData.notes && (
                    <div>
                      <h4 className="text-sm font-medium text-cloudburst uppercase tracking-wider mb-3">Notes</h4>
                      <p className="text-sm text-porcelain bg-inkwell p-3 rounded-lg border border-starlight/5">"{formData.notes}"</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </StepForm>
      </Card>
    </div>
  );
}
