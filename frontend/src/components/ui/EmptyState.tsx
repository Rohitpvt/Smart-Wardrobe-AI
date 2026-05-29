import Card from "./Card";
import Button from "./Button";

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: string;
}

export default function EmptyState({ title, description, actionLabel, onAction, icon = "✦" }: EmptyStateProps) {
  return (
    <Card variant="basic" className="p-12 text-center border-dashed border-starlight/20 flex flex-col items-center justify-center min-h-[300px]">
      <div className="w-12 h-12 rounded-full bg-inkwell border border-starlight/10 flex items-center justify-center text-xl text-cyber-cyan mb-4 shadow-subtle-2">
        {icon}
      </div>
      <h3 className="text-xl font-medium text-porcelain mb-2">{title}</h3>
      <p className="text-cloudburst text-sm max-w-md mx-auto mb-6">{description}</p>
      {actionLabel && onAction && (
        <Button variant="ghost-cyan" className="border border-cyber-cyan/30" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </Card>
  );
}
