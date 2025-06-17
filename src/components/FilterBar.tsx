import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { TagPill } from "@/components/TagPill";
import { Filter, X, SlidersHorizontal, Clock, TrendingUp, ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

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
        <SlidersHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
        <h4 className="text-xs font-medium">{title}</h4>
      </div>
      <ScrollArea className="w-full">
        <div className="flex flex-wrap gap-1 pb-1">
          {tagGroup.map((tag) => (
            <TagPill
              key={tag.id}
              tag={tag}
              isSelected={selectedTags.includes(tag.id)}
              onClick={() => handleTagClick(tag.id)}
              className={cn(
                "text-xs",
                selectedTags.includes(tag.id) && "bg-primary text-primary-foreground hover:bg-primary/90"
              )}
            />
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );

  return (
    <div className="sticky top-20 z-40 mb-4">
      <div className="relative">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className={cn(
            "fixed right-4 z-50 shadow-lg transition-all duration-200",
            isExpanded ? "bg-background" : "bg-background/80 backdrop-blur-sm"
          )}
        >
          <Filter className="w-4 h-4 mr-2" />
          Filter
          {selectedTags.length > 0 && (
            <span className="ml-2 text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">
              {selectedTags.length}
            </span>
          )}
        </Button>

        {isExpanded && (
          <div className="absolute right-0 top-12 w-80 glass-effect rounded-lg shadow-lg p-3">
            <div className="space-y-3">
              {/* Clear button */}
              {selectedTags.length > 0 && (
                <div className="flex justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClearFilters}
                    className="h-7 text-xs text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-3.5 w-3.5 mr-1" />
                    Clear filters
                  </Button>
                </div>
              )}

              {/* Time Filter */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                  <h4 className="text-xs font-medium">Time Period</h4>
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  {timeFilters.map((filter) => (
                    <Button
                      key={filter.value}
                      variant="ghost"
                      size="sm"
                      onClick={() => onSortChange(filter.value)}
                      className={cn(
                        "h-7 text-xs",
                        currentSort === filter.value
                          ? "bg-primary text-primary-foreground hover:bg-primary/90"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {filter.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Sort Options */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5">
                  <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground" />
                  <h4 className="text-xs font-medium">Sort By</h4>
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  {sortOptions.map((option) => (
                    <Button
                      key={option.value}
                      variant="ghost"
                      size="sm"
                      onClick={() => onSortChange(option.value)}
                      className={cn(
                        "h-7 text-xs",
                        currentSort === option.value
                          ? "bg-primary text-primary-foreground hover:bg-primary/90"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Tag Groups */}
              {languageTags.length > 0 && renderTagGroup("Languages", languageTags)}
              {mainTags.length > 0 && renderTagGroup("Categories", mainTags)}
              {otherTags.length > 0 && renderTagGroup("Other Tags", otherTags)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
