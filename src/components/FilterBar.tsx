
import { Button } from "@/components/ui/button";
import { TagPill } from "@/components/TagPill";
import { Filter, X } from "lucide-react";
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

  const timeFilters = [
    { value: "newest", label: "All Time" },
    { value: "day", label: "Today" },
    { value: "week", label: "This Week" },
    { value: "month", label: "This Month" },
    { value: "year", label: "This Year" }
  ];

  const handleTagClick = (tagId: string) => {
    onTagSelect(tagId);
  };

  const activeFiltersCount = selectedTags.length + (currentSort !== "newest" ? 1 : 0);

  return (
    <div className="fixed top-16 right-4 z-50">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsExpanded(!isExpanded)}
        className="shadow-lg bg-background/95 backdrop-blur-sm border-border hover:bg-accent h-8 px-3"
      >
        <Filter className="w-3 h-3" />
        {activeFiltersCount > 0 && (
          <span className="ml-1 text-xs bg-primary text-primary-foreground px-1 py-0.5 rounded-full min-w-[16px] text-center leading-none">
            {activeFiltersCount}
          </span>
        )}
      </Button>

      {isExpanded && (
        <div className="absolute right-0 top-10 w-72 bg-background border border-border rounded-lg shadow-xl p-3 max-h-80 overflow-y-auto">
          <div className="space-y-3">
            {activeFiltersCount > 0 && (
              <div className="flex justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClearFilters}
                  className="h-6 text-xs text-muted-foreground hover:text-foreground px-2"
                >
                  <X className="h-3 w-3 mr-1" />
                  Clear all
                </Button>
              </div>
            )}

            {/* Time Filter */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Time Period</h4>
              <div className="grid grid-cols-2 gap-1">
                {timeFilters.map((filter) => (
                  <Button
                    key={filter.value}
                    variant="ghost"
                    size="sm"
                    onClick={() => onSortChange(filter.value)}
                    className={cn(
                      "h-7 text-xs w-full",
                      currentSort === filter.value
                        ? "bg-primary text-primary-foreground hover:bg-primary/90"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent"
                    )}
                  >
                    {filter.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Tags Filter */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Filter by Tags</h4>
              <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto">
                {tags.map((tag) => (
                  <div
                    key={tag.id}
                    className="select-none cursor-pointer"
                    onClick={() => handleTagClick(tag.id)}
                  >
                    <TagPill
                      tag={tag}
                      isSelected={selectedTags.includes(tag.id)}
                      onClick={() => {}}
                      className={cn(
                        "text-xs cursor-pointer h-6 px-2",
                        selectedTags.includes(tag.id) && "bg-primary text-primary-foreground hover:bg-primary/90"
                      )}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
