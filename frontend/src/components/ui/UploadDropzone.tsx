import { useCallback } from "react";
import Card from "./Card";

interface UploadDropzoneProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  isUploading?: boolean;
}

export default function UploadDropzone({ onFileSelect, accept = "image/*", isUploading }: UploadDropzoneProps) {
  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (isUploading) return;
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFileSelect(e.dataTransfer.files[0]);
    }
  }, [onFileSelect, isUploading]);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileSelect(e.target.files[0]);
    }
  };

  return (
    <Card 
      variant="basic" 
      className={`border-2 border-dashed flex flex-col items-center justify-center p-12 transition-all duration-200 ${
        isUploading ? "opacity-50 border-starlight/10 cursor-not-allowed" : "border-starlight/20 hover:border-cyber-cyan/50 hover:bg-inkwell/50 cursor-pointer"
      }`}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onClick={() => !isUploading && document.getElementById("file-upload")?.click()}
    >
      <input 
        id="file-upload" 
        type="file" 
        accept={accept}
        className="hidden" 
        onChange={handleChange}
        disabled={isUploading}
      />
      <div className="w-16 h-16 rounded-full bg-carbon border border-starlight/10 flex items-center justify-center text-3xl mb-4 shadow-subtle-2 text-cyber-cyan/70">
        ☁️
      </div>
      <h3 className="text-lg font-medium text-porcelain mb-2">Drag and drop your image here</h3>
      <p className="text-sm text-cloudburst max-w-sm text-center">
        Supported formats: JPG, PNG, WEBP. AI analysis works best with clear, well-lit photos.
      </p>
    </Card>
  );
}
