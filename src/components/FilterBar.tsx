
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { TagPill } from "@/components/TagPill";
import { Filter, X, SlidersHorizontal, Clock, TrendingUp, ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface FilterBarProps {
  tags: { id: string; name: string; emoji: string }[];
  selectedTags: string[];
  onTagSelect: (tagId: string) => void;
  onClearFilters: () => void;
  onSortChange: (sort: string) => void;
  currentSort: string;
}

export const FilterBar = ({ 
  tags, 
  selectedTags, 
  onTagSelect, 
  onClearFilters,
  onSortChange,
  currentSort 
}: FilterBarProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Group tags by category
  const languageTags = tags.filter(tag => 
    ["Hindi", "English", "Hinglish"].includes(tag.name)
  );
  
  const mainTags = tags.filter(tag => 
    ["Roast", "Jokes", "Insults"].includes(tag.name)
  );
  
  const otherTags = tags.filter(tag => 
    !["Hindi", "English", "Hinglish", "Roast", "Jokes", "Insults"].includes(tag.name)
  );

  const timeFilters = [
    { value: "day", label: "Today" },
    { value: "week", label: "This Week" },
    { value: "month", label: "This Month" },
    { value: "year", label: "This Year" },
    { value: "all", label: "All Time" },
  ];

  const sortOptions = [
    { value: "newest", label: "Newest", icon: ArrowUpDown },
    { value: "oldest", label: "Oldest", icon: ArrowUpDown },
    { value: "most_voted", label: "Most Voted", icon: TrendingUp },
  ];

  const handleTagClick = (tagId: string) => {
    onTagSelect(tagId);
  };

  const renderTagGroup = (title: string, tagGroup: typeof tags) => (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5">
        <motion.div
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <SlidersHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
        </motion.div>
        <h4 className="text-xs font-medium">{title}</h4>
      </div>
      <ScrollArea className="w-full">
        <div className="flex flex-wrap gap-1 pb-1">
          {tagGroup.map((tag) => (
            <motion.div
              key={tag.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <TagPill
                tag={tag}
                isSelected={selectedTags.includes(tag.id)}
                onClick={() => handleTagClick(tag.id)}
                className={cn(
                  "text-xs transition-all duration-200",
                  selectedTags.includes(tag.id) && "bg-primary text-primary-foreground hover:bg-primary/90"
                )}
              />
            </motion.div>
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );

  return (
    <div className="sticky top-12 z-30 mb-4">
      <div className="relative">
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className={cn(
              "fixed right-4 z-50 shadow-lg transition-all duration-300",
              isExpanded ? "bg-background" : "bg-background/80 backdrop-blur-sm"
            )}
          >
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <Filter className="w-4 h-4 mr-2" />
            </motion.div>
            Filter
            {selectedTags.length > 0 && (
              <motion.span 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="ml-2 text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded-full"
              >
                {selectedTags.length}
              </motion.span>
            )}
          </Button>
        </motion.div>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="absolute right-0 top-12 w-80 glass-effect rounded-lg shadow-xl p-3 z-50"
            >
              <div className="space-y-3">
                {/* Clear button */}
                {selectedTags.length > 0 && (
                  <div className="flex justify-end">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={onClearFilters}
                        className="h-7 text-xs text-muted-foreground hover:text-foreground"
                      >
                        <X className="h-3.5 w-3.5 mr-1" />
                        Clear filters
                      </Button>
                    </motion.div>
                  </div>
                )}

                {/* Time Filter */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5">
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                    </motion.div>
                    <h4 className="text-xs font-medium">Time Period</h4>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {timeFilters.map((filter) => (
                      <motion.div
                        key={filter.value}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onSortChange(filter.value)}
                          className={cn(
                            "h-7 text-xs transition-all duration-200",
                            currentSort === filter.value
                              ? "bg-primary text-primary-foreground hover:bg-primary/90"
                              : "text-muted-foreground hover:text-foreground"
                          )}
                        >
                          {filter.label}
                        </Button>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Sort Options */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5">
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />
                    </motion.div>
                    <h4 className="text-xs font-medium">Sort By</h4>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {sortOptions.map((option) => (
                      <motion.div
                        key={option.value}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onSortChange(option.value)}
                          className={cn(
                            "h-7 text-xs transition-all duration-200",
                            currentSort === option.value
                              ? "bg-primary text-primary-foreground hover:bg-primary/90"
                              : "text-muted-foreground hover:text-foreground"
                          )}
                        >
                          {option.label}
                        </Button>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Tag Groups */}
                {languageTags.length > 0 && renderTagGroup("Languages", languageTags)}
                {mainTags.length > 0 && renderTagGroup("Categories", mainTags)}
                {otherTags.length > 0 && renderTagGroup("Other Tags", otherTags)}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
