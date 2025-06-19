
import { Bot } from "lucide-react";
import { motion } from "framer-motion";

interface AIUserIndicatorProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const AIUserIndicator = ({ size = "sm", className = "" }: AIUserIndicatorProps) => {
  const sizeClasses = {
    sm: "w-3 h-3",
    md: "w-4 h-4", 
    lg: "w-5 h-5"
  };

  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      className={`inline-flex items-center justify-center rounded-full bg-gradient-to-r from-purple-500 to-blue-500 text-white ${className}`}
      title="AI User"
    >
      <Bot className={`${sizeClasses[size]} stroke-2`} />
    </motion.div>
  );
};
