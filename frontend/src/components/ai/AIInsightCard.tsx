import Card from "../ui/Card";
import Badge from "../ui/Badge";

interface AIInsightCardProps {
  title: string;
  description: string;
  confidence?: number; // 0 to 100
  icon?: string;
}

export default function AIInsightCard({ title, description, confidence, icon = "✦" }: AIInsightCardProps) {
  return (
    <Card variant="translucent" className="p-5 border border-cyber-cyan/10 hover:border-cyber-cyan/30 transition-colors relative overflow-hidden group">
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-glow-cyan opacity-50 pointer-events-none transition-opacity group-hover:opacity-100" />
      
      <div className="flex items-start gap-4 relative z-10">
        <div className="w-10 h-10 rounded bg-carbon border border-cyber-cyan/20 flex items-center justify-center shrink-0 shadow-[0_0_10px_rgba(82,225,254,0.1)] text-cyber-cyan text-lg">
          {icon}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <h4 className="text-porcelain font-medium">{title}</h4>
            {confidence !== undefined && (
              <Badge variant="cyan" className="text-[10px] bg-cyber-cyan/10 border border-cyber-cyan/20">
                {confidence}% match
              </Badge>
            )}
          </div>
          <p className="text-sm text-cloudburst leading-relaxed">
            {description}
          </p>
        </div>
      </div>
    </Card>
  );
}
