
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { TagPill } from "@/components/TagPill";
import { Filter, X, Clock, TrendingUp, ArrowUpDown, Hash } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
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
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const orderedTags = [...tags].sort((a, b) => {
    const order = ['NSFW', 'Jokes', 'Roasts', 'Insults', 'Pun', 'Wordplay', 'Dark'];
    const aIndex = order.findIndex(name => 
      a.name.toLowerCase().includes(name.toLowerCase()) || 
      name.toLowerCase().includes(a.name.toLowerCase())
    );
    const bIndex = order.findIndex(name => 
      b.name.toLowerCase().includes(name.toLowerCase()) || 
      name.toLowerCase().includes(b.name.toLowerCase())
    );
    
    if (aIndex === -1 && bIndex === -1) return 0;
    if (aIndex === -1) return 1;
    if (bIndex === -1) return -1;
    return aIndex - bIndex;
  });

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

  return (
    <div className="sticky top-12 z-40 mb-4">
      <div className="relative">
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
          <Button
            variant="outline"
            size={isScrolled ? "icon" : "sm"}
            onClick={() => setIsExpanded(!isExpanded)}
            className="fixed right-4 z-50 shadow-lg bg-background/90 backdrop-blur-sm transition-all duration-300 border-border hover:bg-accent"
          >
            <Filter className="w-4 h-4" />
            {!isScrolled && <span className="ml-2">Filter</span>}
            {selectedTags.length > 0 && (
              <motion.span 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="ml-1 text-xs bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full min-w-[18px] text-center"
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
              className="absolute right-0 top-12 w-80 bg-background/95 backdrop-blur-xl rounded-lg shadow-xl border border-border p-4 z-50"
            >
              <div className="space-y-4">
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

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                      <Clock className="h-4 w-4 text-muted-foreground" />
                    </motion.div>
                    <h4 className="text-sm font-medium">Time Period</h4>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {timeFilters.map((filter) => (
                      <motion.div key={filter.value} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onSortChange(filter.value)}
                          className={cn(
                            "h-8 text-xs w-full transition-all duration-200",
                            currentSort === filter.value
                              ? "bg-primary text-primary-foreground hover:bg-primary/90"
                              : "text-muted-foreground hover:text-foreground hover:bg-accent"
                          )}
                        >
                          {filter.label}
                        </Button>
                      </motion.div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                      <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                    </motion.div>
                    <h4 className="text-sm font-medium">Sort By</h4>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {sortOptions.map((option) => (
                      <motion.div key={option.value} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onSortChange(option.value)}
                          className={cn(
                            "h-8 text-xs w-full transition-all duration-200",
                            currentSort === option.value
                              ? "bg-primary text-primary-foreground hover:bg-primary/90"
                              : "text-muted-foreground hover:text-foreground hover:bg-accent"
                          )}
                        >
                          {option.label}
                        </Button>
                      </motion.div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                      <Hash className="h-4 w-4 text-muted-foreground" />
                    </motion.div>
                    <h4 className="text-sm font-medium">Filter by Tags</h4>
                  </div>
                  <ScrollArea className="h-48">
                    <div className="flex flex-wrap gap-2 pr-4">
                      {orderedTags.map((tag) => (
                        <motion.div
                          key={tag.id}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="select-none"
                        >
                          <TagPill
                            tag={tag}
                            isSelected={selectedTags.includes(tag.id)}
                            onClick={() => handleTagClick(tag.id)}
                            className={cn(
                              "text-xs transition-all duration-200 cursor-pointer",
                              selectedTags.includes(tag.id) && "bg-primary text-primary-foreground hover:bg-primary/90"
                            )}
                          />
                        </motion.div>
                      ))}
                    </div>
                    <ScrollBar />
                  </ScrollArea>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
