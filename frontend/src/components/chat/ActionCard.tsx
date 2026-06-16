import { m } from "framer-motion";
import { fadeUp } from "@/lib/animations";
import { ToolInvocation } from "@/types/chat";
import { Sparkles, ArrowRight, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { OutfitCompletionCard } from "../recommendations/OutfitCompletionCard";

interface ActionCardProps {
  action: ToolInvocation;
}

export function ActionCard({ action }: ActionCardProps) {
  let title = "Stylist Action";
  let description = "The stylist has suggested an action.";
  let href = "/dashboard";
  let buttonText = "View";

  switch (action.type) {
    case "generate_outfit":
      title = "Generate Outfit";
      description = `Generate a new outfit for: ${action.params?.occasion || "Any Occasion"}`;
      href = "/recommendations";
      buttonText = "Go to Generator";
      break;
    case "show_underutilized":
      title = "Rotation Insights";
      description = "View items you haven't worn recently to improve wardrobe rotation.";
      href = "/dashboard";
      buttonText = "View Analytics";
      break;
    case "show_purchase_recommendations":
      title = "Purchase Recommendations";
      description = "See what items the AI recommends you buy to fill gaps in your wardrobe.";
      href = "/dashboard";
      buttonText = "View Recommendations";
      break;
    case "show_rotation_insights":
      title = "Wardrobe Health";
      description = "Review your Cost Per Wear and rotation efficiency.";
      href = "/dashboard";
      buttonText = "View Economics";
      break;
    case "show_cost_per_wear":
      title = "Cost Per Wear Analytics";
      description = "Review your wardrobe economics and CPW metrics.";
      href = "/dashboard";
      buttonText = "View CPW";
      break;
    case "show_taste_profile":
      title = "Taste Profile";
      description = "Review your personalized Style DNA and style evolution.";
      href = "/dashboard";
      buttonText = "View Taste Profile";
      break;
    case "build_outfit_around_item":
      title = "Outfit Builder";
      description = `Outfit successfully built around your requested item.`;
      href = `/recommendations?view=anchor&keyword=${encodeURIComponent(action.params?.item_keyword || "")}`;
      buttonText = "View Outfit";
      break;
    default:
      title = "Unknown Action";
      description = "This action is not recognized.";
      buttonText = "View Dashboard";
      break;
  }

  if (action.type === "build_outfit_around_item" && action.params?.outfit_data) {
    return (
      <div className="mt-4 w-full">
        <OutfitCompletionCard data={action.params.outfit_data} />
      </div>
    );
  }

  return (
    <m.div 
      variants={fadeUp}
      className="mt-4 flex items-center justify-between p-4 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm shadow-sm max-w-sm"
    >
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-brand-purple" />
          <h4 className="text-sm font-medium text-white">{title}</h4>
        </div>
        <p className="text-xs text-white/60">{description}</p>
      </div>
      
      <Link href={href} className="flex-shrink-0">
        <button className="flex items-center justify-center w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 transition-colors">
          <ArrowUpRight className="w-4 h-4 text-white" />
        </button>
      </Link>
    </m.div>
  );
}
