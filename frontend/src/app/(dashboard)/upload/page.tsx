"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { v4 as uuidv4 } from "uuid";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import * as Constants from "@/lib/constants";

type Step = 1 | 2 | 3 | 4 | 5;

export default function UploadPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  
  // A temporary ID to group images for this upload session
  const [tempId] = useState(uuidv4());

  // Files
  const [frontImage, setFrontImage] = useState<File | null>(null);
  const [backImage, setBackImage] = useState<File | null>(null);
  const [labelImage, setLabelImage] = useState<File | null>(null);

  // Form Data
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

  const handleSave = async () => {
    try {
      setIsUploading(true);
      setError("");

      if (!frontImage) {
        throw new Error("Front image is required.");
      }

      // 1. Upload Images
      const front_image_key = await uploadToS3(frontImage, "front");
      const back_image_key = backImage ? await uploadToS3(backImage, "back") : undefined;
      const label_image_key = labelImage ? await uploadToS3(labelImage, "label") : undefined;

      // 2. Save Item
      const payload = {
        ...formData,
        front_image_key,
        back_image_key,
        label_image_key,
        purchase_date: formData.purchase_date ? new Date(formData.purchase_date).toISOString() : null,
      };

      const newItem = await api.clothing.create(payload);
      router.push(`/wardrobe/${(newItem as any).id}`);
    } catch (err: any) {
      setError(err.message || "An error occurred during upload.");
      setIsUploading(false);
    }
  };

  const nextStep = () => {
    if (step === 1 && !frontImage) {
      setError("Front image is required.");
      return;
    }
    setError("");
    setStep((prev) => Math.min(prev + 1, 5) as Step);
  };

  const prevStep = () => setStep((prev) => Math.max(prev - 1, 1) as Step);

  const renderSelect = (label: string, field: keyof typeof formData, options: string[], required = false) => (
    <div className="mb-4">
      <label className="block text-[13px] font-medium text-cloudburst mb-1.5 uppercase tracking-wider">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <select
        required={required}
        value={formData[field]}
        onChange={e => handleChange(field, e.target.value)}
        className="w-full bg-inkwell border border-starlight/10 rounded-[8px] px-4 py-2.5 text-porcelain text-sm focus:outline-none focus:border-cyber-cyan/50"
      >
        <option value="">Select...</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );

  return (
    <div className="min-h-screen bg-charcoal p-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-medium text-porcelain">Add to Wardrobe</h1>
          <div className="text-sm text-cloudburst font-[family-name:var(--font-mono)]">Step {step} of 5</div>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-[8px] bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
            {error}
          </div>
        )}

        <Card variant="translucent" className="p-8">
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="text-xl font-medium text-porcelain mb-4">1. Images</h2>
              
              <div>
                <label className="block text-[13px] font-medium text-cloudburst mb-1.5 uppercase tracking-wider">Front Image (Required)</label>
                <input type="file" accept="image/jpeg, image/png, image/webp" onChange={e => setFrontImage(e.target.files?.[0] || null)} className="text-sm text-cloudburst file:mr-4 file:py-2 file:px-4 file:rounded-[8px] file:border-0 file:text-sm file:font-medium file:bg-cyber-cyan/10 file:text-cyber-cyan hover:file:bg-cyber-cyan/20 cursor-pointer" />
              </div>
              
              <div>
                <label className="block text-[13px] font-medium text-cloudburst mb-1.5 uppercase tracking-wider">Back Image (Optional)</label>
                <input type="file" accept="image/jpeg, image/png, image/webp" onChange={e => setBackImage(e.target.files?.[0] || null)} className="text-sm text-cloudburst file:mr-4 file:py-2 file:px-4 file:rounded-[8px] file:border-0 file:text-sm file:font-medium file:bg-carbon file:text-porcelain hover:file:bg-starlight/10 cursor-pointer" />
              </div>

              <div>
                <label className="block text-[13px] font-medium text-cloudburst mb-1.5 uppercase tracking-wider">Label/Tag Image (Optional)</label>
                <input type="file" accept="image/jpeg, image/png, image/webp" onChange={e => setLabelImage(e.target.files?.[0] || null)} className="text-sm text-cloudburst file:mr-4 file:py-2 file:px-4 file:rounded-[8px] file:border-0 file:text-sm file:font-medium file:bg-carbon file:text-porcelain hover:file:bg-starlight/10 cursor-pointer" />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-xl font-medium text-porcelain mb-4">2. Basic Details</h2>
              <div className="grid grid-cols-2 gap-4">
                {renderSelect("Type", "type", Constants.CLOTHING_TYPES, true)}
                {renderSelect("Category", "category", Constants.CATEGORIES, true)}
                {renderSelect("Primary Color", "primary_color", Constants.COLORS, true)}
                {renderSelect("Secondary Color", "secondary_color", Constants.COLORS)}
                {renderSelect("Size", "size", Constants.SIZES)}
              </div>
              <div>
                <label className="block text-[13px] font-medium text-cloudburst mb-1.5 uppercase tracking-wider">Brand</label>
                <input type="text" value={formData.brand} onChange={e => handleChange("brand", e.target.value)} className="w-full bg-inkwell border border-starlight/10 rounded-[8px] px-4 py-2.5 text-porcelain text-sm focus:outline-none focus:border-cyber-cyan/50" placeholder="e.g. Nike, Zara" />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <h2 className="text-xl font-medium text-porcelain mb-4">3. Style Details</h2>
              <div className="grid grid-cols-2 gap-4">
                {renderSelect("Gender / Fit", "gender_fit", Constants.GENDER_FIT)}
                {renderSelect("Material / Fabric", "material", Constants.MATERIALS)}
                {renderSelect("Season", "season", Constants.SEASONS)}
                {renderSelect("Occasion", "occasion", Constants.OCCASIONS)}
                {renderSelect("Condition", "condition", Constants.CONDITIONS)}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <h2 className="text-xl font-medium text-porcelain mb-4">4. Usage Details</h2>
              <div className="grid grid-cols-2 gap-4">
                {renderSelect("Usage Frequency", "usage_frequency", Constants.USAGE_FREQUENCIES)}
                {renderSelect("Price Range", "price_range", Constants.PRICE_RANGES)}
                <div>
                  <label className="block text-[13px] font-medium text-cloudburst mb-1.5 uppercase tracking-wider">Purchase Date</label>
                  <input type="date" value={formData.purchase_date} onChange={e => handleChange("purchase_date", e.target.value)} className="w-full bg-inkwell border border-starlight/10 rounded-[8px] px-4 py-2.5 text-porcelain text-sm focus:outline-none focus:border-cyber-cyan/50 [color-scheme:dark]" />
                </div>
              </div>
              <div>
                <label className="block text-[13px] font-medium text-cloudburst mb-1.5 uppercase tracking-wider">Notes</label>
                <textarea value={formData.notes} onChange={e => handleChange("notes", e.target.value)} rows={3} className="w-full bg-inkwell border border-starlight/10 rounded-[8px] px-4 py-2.5 text-porcelain text-sm focus:outline-none focus:border-cyber-cyan/50" placeholder="Any special care instructions or memories..." />
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-6">
              <h2 className="text-xl font-medium text-porcelain mb-4">5. Review & Save</h2>
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <p className="text-sm text-cloudburst mb-2">Images to Upload:</p>
                  <ul className="text-sm text-porcelain space-y-1 list-disc pl-4">
                    <li>Front Image: {frontImage?.name}</li>
                    {backImage && <li>Back Image: {backImage.name}</li>}
                    {labelImage && <li>Label Image: {labelImage.name}</li>}
                  </ul>
                </div>
                <div>
                  <p className="text-sm text-cloudburst mb-2">Details:</p>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-2 py-1 text-xs bg-carbon rounded-[4px] border border-starlight/10">{formData.type || "No Type"}</span>
                    <span className="px-2 py-1 text-xs bg-carbon rounded-[4px] border border-starlight/10">{formData.category || "No Category"}</span>
                    <span className="px-2 py-1 text-xs bg-carbon rounded-[4px] border border-starlight/10">{formData.primary_color || "No Color"}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-starlight/10 flex justify-between items-center">
            {step > 1 ? (
              <Button variant="ghost" onClick={prevStep} disabled={isUploading}>Back</Button>
            ) : <div />}
            
            {step < 5 ? (
              <Button variant="filled" onClick={nextStep}>Next</Button>
            ) : (
              <Button variant="filled" onClick={handleSave} disabled={isUploading} className="bg-cyber-cyan text-inkwell font-semibold hover:bg-cyber-cyan/90">
                {isUploading ? "Uploading & Saving..." : "Save to Wardrobe"}
              </Button>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
