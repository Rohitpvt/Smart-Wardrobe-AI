"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import PageHeader from "@/components/ui/PageHeader";
import LoadingState from "@/components/ui/LoadingState";
import Image from "next/image";

export default function WardrobeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  
  const [item, setItem] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const data = await api.clothing.get(id);
        setItem(data);
      } catch (err) {
        console.error(err);
        router.push("/wardrobe");
      } finally {
        setIsLoading(false);
      }
    };
    fetchItem();
  }, [id, router]);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await api.clothing.delete(id);
      router.push("/wardrobe");
    } catch (err) {
      console.error(err);
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 md:p-10 max-w-6xl mx-auto flex items-center justify-center min-h-[50vh]">
        <LoadingState message="Loading item details..." />
      </div>
    );
  }
  
  if (!item) return null;

  const images = [item.front_image_url, item.back_image_url, item.label_image_url].filter(Boolean);

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto space-y-8">
      
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div>
          <Button variant="ghost" onClick={() => router.push("/wardrobe")} className="mb-4 text-xs">
            ← Back to Wardrobe
          </Button>
          <PageHeader 
            title={item.type} 
            description={item.brand ? `by ${item.brand}` : "No brand specified"}
          />
          <div className="flex flex-wrap gap-2 -mt-4 mb-6">
            <Badge variant="cyan">{item.category}</Badge>
            <Badge variant="orange">{item.primary_color}</Badge>
            {item.secondary_color && <Badge variant="default">{item.secondary_color}</Badge>}
            {item.season && <Badge variant="success">{item.season}</Badge>}
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Button variant="ghost" className="border border-starlight/20" onClick={() => alert("Edit functionality to be implemented")}>
            Edit Item
          </Button>
          {!showDeleteConfirm ? (
            <Button variant="ghost" onClick={() => setShowDeleteConfirm(true)} className="text-red-400 border border-red-500/20 hover:bg-red-500/10">
              Delete
            </Button>
          ) : (
            <div className="flex items-center gap-2 p-1 bg-red-500/10 rounded-xl border border-red-500/20">
              <Button variant="ghost" onClick={() => setShowDeleteConfirm(false)} className="text-sm">Cancel</Button>
              <Button variant="filled" onClick={handleDelete} disabled={isDeleting} className="text-sm bg-red-500 hover:bg-red-600 text-white">
                {isDeleting ? "Deleting..." : "Confirm Delete"}
              </Button>
            </div>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Images */}
        <div className="lg:col-span-5 space-y-4">
          <Card variant="translucent" className="aspect-[3/4] overflow-hidden bg-carbon flex items-center justify-center p-0 relative group">
            {images.length > 0 ? (
              <Image src={images[0]} alt="Front" fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
            ) : (
              <span className="text-6xl">👕</span>
            )}
          </Card>
          
          {images.length > 1 && (
            <div className="grid grid-cols-3 gap-4">
              {images.slice(1).map((img, i) => (
                <Card key={i} variant="basic" className="aspect-square overflow-hidden bg-carbon p-0 relative group cursor-pointer border border-starlight/10 hover:border-cyber-cyan/50">
                  <Image src={img} alt={`Additional ${i}`} fill className="object-cover group-hover:scale-110 transition-transform duration-300" />
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Right: Metadata */}
        <div className="lg:col-span-7 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Card variant="translucent" className="p-6">
              <h3 className="text-xs uppercase tracking-widest text-cloudburst mb-4 flex items-center gap-2">
                <span className="text-cyber-cyan text-sm">📏</span> Size & Fit
              </h3>
              <div className="space-y-4 text-sm">
                <div className="flex justify-between border-b border-starlight/5 pb-2">
                  <span className="text-muted">Size:</span> 
                  <span className="text-porcelain font-medium">{item.size || "-"}</span>
                </div>
                <div className="flex justify-between border-b border-starlight/5 pb-2">
                  <span className="text-muted">Fit/Gender:</span> 
                  <span className="text-porcelain font-medium">{item.gender_fit || "-"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Material:</span> 
                  <span className="text-porcelain font-medium">{item.material || "-"}</span>
                </div>
              </div>
            </Card>

            <Card variant="translucent" className="p-6">
              <h3 className="text-xs uppercase tracking-widest text-cloudburst mb-4 flex items-center gap-2">
                <span className="text-code-orange text-sm">🏷️</span> Usage & Value
              </h3>
              <div className="space-y-4 text-sm">
                <div className="flex justify-between border-b border-starlight/5 pb-2">
                  <span className="text-muted">Usage:</span> 
                  <span className="text-porcelain font-medium">{item.usage_frequency || "-"}</span>
                </div>
                <div className="flex justify-between border-b border-starlight/5 pb-2">
                  <span className="text-muted">Wears:</span> 
                  <span className="text-porcelain font-medium">{item.wear_count || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted">Price Range:</span> 
                  <span className="text-porcelain font-medium">{item.price_range || "-"}</span>
                </div>
              </div>
            </Card>
          </div>

          <Card variant="translucent" className="p-6">
            <h3 className="text-xs uppercase tracking-widest text-cloudburst mb-4 flex items-center gap-2">
              <span className="text-success text-sm">✨</span> Status & Occasion
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${item.is_clean ? 'bg-success' : 'bg-warning'}`}></div>
                <span className="text-muted">Clean:</span>
                <span className="text-porcelain">{item.is_clean ? "Yes" : "Needs Wash"}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${item.needs_repair ? 'bg-orange-500' : 'bg-success'}`}></div>
                <span className="text-muted">Condition:</span>
                <span className="text-porcelain">{item.needs_repair ? "Needs Repair" : (item.condition || "Good")}</span>
              </div>
              <div className="flex items-center gap-3 sm:col-span-2 mt-2">
                <span className="text-muted">Occasion:</span>
                <span className="text-porcelain bg-carbon px-2 py-1 rounded border border-starlight/10">{item.occasion || "Not specified"}</span>
              </div>
            </div>
          </Card>

          {item.notes && (
            <Card variant="translucent" className="p-6 border-l-2 border-cyber-cyan/50">
              <h3 className="text-xs uppercase tracking-widest text-cloudburst mb-3">Notes & Care</h3>
              <p className="text-porcelain text-sm leading-relaxed">{item.notes}</p>
            </Card>
          )}

          {item.ai_detected && (
            <Card variant="basic" className="p-5 border-cyber-cyan/20 bg-cyber-cyan/5 flex items-start gap-4">
              <div className="text-2xl mt-1">🤖</div>
              <div>
                <h3 className="text-sm font-medium text-cyber-cyan mb-1">AI Processed Item</h3>
                <p className="text-cloudburst text-xs leading-relaxed">
                  This item was automatically categorized and tagged by Midnight Intelligence. 
                  Confidence score: {item.ai_confidence ? `${item.ai_confidence}%` : 'N/A'}.
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
