"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";

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

  if (isLoading) return <div className="min-h-screen bg-charcoal flex justify-center pt-20 text-cloudburst">Loading...</div>;
  if (!item) return null;

  const images = [item.front_image_url, item.back_image_url, item.label_image_url].filter(Boolean);

  return (
    <div className="min-h-screen bg-charcoal p-8">
      <div className="max-w-6xl mx-auto">
        <Button variant="ghost" onClick={() => router.push("/wardrobe")} className="mb-6">
          ← Back to Wardrobe
        </Button>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: Images */}
          <div className="space-y-4">
            <Card variant="translucent" className="aspect-[3/4] overflow-hidden bg-carbon flex items-center justify-center">
              {images.length > 0 ? (
                <img src={images[0]} alt="Front" className="w-full h-full object-cover" />
              ) : (
                <span className="text-cloudburst">No Image</span>
              )}
            </Card>
            {images.length > 1 && (
              <div className="grid grid-cols-3 gap-4">
                {images.slice(1).map((img, i) => (
                  <Card key={i} variant="basic" className="aspect-square overflow-hidden bg-carbon">
                    <img src={img} alt={`Additional ${i}`} className="w-full h-full object-cover" />
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Right: Metadata */}
          <div className="space-y-8">
            <div>
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-cloudburst uppercase tracking-widest text-xs mb-1">{item.brand}</p>
                  <h1 className="text-3xl font-medium text-porcelain">{item.type}</h1>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" onClick={() => alert("Edit functionality pending in Phase 3/4")} className="text-sm">
                    Edit
                  </Button>
                  {!showDeleteConfirm ? (
                    <Button variant="ghost" onClick={() => setShowDeleteConfirm(true)} className="text-sm text-red-400 hover:bg-red-500/10">
                      Delete
                    </Button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" onClick={() => setShowDeleteConfirm(false)} className="text-sm">Cancel</Button>
                      <Button variant="filled" onClick={handleDelete} disabled={isDeleting} className="text-sm bg-red-500 hover:bg-red-600 text-white">
                        {isDeleting ? "Deleting..." : "Confirm"}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mt-4">
                <Badge variant="cyan">{item.category}</Badge>
                <Badge variant="orange">{item.primary_color}</Badge>
                {item.secondary_color && <Badge variant="basic">{item.secondary_color}</Badge>}
                {item.season && <Badge variant="success">{item.season}</Badge>}
              </div>
            </div>

            <Card variant="translucent" className="p-6">
              <h3 className="text-sm uppercase tracking-widest text-cloudburst mb-4 border-b border-starlight/10 pb-2">Details</h3>
              <div className="grid grid-cols-2 gap-y-4 text-sm">
                <div><span className="text-muted">Size:</span> <span className="text-porcelain">{item.size || "-"}</span></div>
                <div><span className="text-muted">Fit:</span> <span className="text-porcelain">{item.gender_fit || "-"}</span></div>
                <div><span className="text-muted">Material:</span> <span className="text-porcelain">{item.material || "-"}</span></div>
                <div><span className="text-muted">Condition:</span> <span className="text-porcelain">{item.condition || "-"}</span></div>
                <div><span className="text-muted">Occasion:</span> <span className="text-porcelain">{item.occasion || "-"}</span></div>
                <div><span className="text-muted">Usage:</span> <span className="text-porcelain">{item.usage_frequency || "-"}</span></div>
                <div><span className="text-muted">Price Range:</span> <span className="text-porcelain">{item.price_range || "-"}</span></div>
                <div><span className="text-muted">Added:</span> <span className="text-porcelain">{new Date(item.created_at).toLocaleDateString()}</span></div>
              </div>
              {item.notes && (
                <div className="mt-4 pt-4 border-t border-starlight/10">
                  <span className="text-muted text-sm block mb-1">Notes:</span>
                  <p className="text-porcelain text-sm">{item.notes}</p>
                </div>
              )}
            </Card>

            <Card variant="basic" className="p-6 border-cyber-cyan/20 bg-cyber-cyan/5">
              <h3 className="text-sm uppercase tracking-widest text-cyber-cyan mb-2 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyber-cyan animate-pulse"></span>
                AI Analysis Pending
              </h3>
              <p className="text-cloudburst text-sm">AI auto-tagging and outfit recommendations for this item will be activated in Phase 4.</p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
