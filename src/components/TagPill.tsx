import { cn } from "@/lib/utils";

interface TagPillProps {
  tag: {
    id: string;
    name: string;
    emoji: string;
  };
  isSelected: boolean;
  onClick: () => void;
  className?: string;
}

export const TagPill = ({ tag, isSelected, onClick, className }: TagPillProps) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium transition-colors",
        isSelected
          ? "bg-primary text-primary-foreground hover:bg-primary/90"
          : "bg-background/80 text-muted-foreground hover:bg-background hover:text-foreground",
        className
      )}
    >
      <span className="mr-1">{tag.emoji}</span>
      {tag.name}
    </button>
  );
}; 