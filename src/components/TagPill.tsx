
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

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
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={cn(
        "inline-flex items-center px-2 py-1 rounded-full text-xs font-medium transition-colors",
        isSelected
          ? "bg-primary text-primary-foreground hover:bg-primary/90"
          : "bg-background/80 text-muted-foreground hover:bg-background hover:text-foreground",
        className
      )}
    >
      <motion.span 
        className="mr-1"
        initial={{ rotate: 0 }}
        whileHover={{ rotate: 12 }}
        transition={{ duration: 0.2 }}
      >
        {tag.emoji}
      </motion.span>
      {tag.name}
    </motion.button>
  );
}; 
