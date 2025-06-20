
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
  selectedLanguage: string;
  onLanguageChange: (language: string) => void;
}

export const FilterBar = ({ 
  tags, 
  selectedTags, 
  onTagSelect, 
  onClearFilters,
  onSortChange,
  currentSort,
  selectedLanguage,
  onLanguageChange
}: FilterBarProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const languages = [
    { value: "all", label: "All" },
    { value: "hindi", label: "Hindi" },
    { value: "english", label: "English" },
    { value: "hinglish", label: "Hinglish" }
  ];

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

  const activeFiltersCount = selectedTags.length + 
    (selectedLanguage !== "all" ? 1 : 0) + 
    (currentSort !== "newest" ? 1 : 0);

  return (
    <>
      {/* Fixed Filter Button */}
      <div className="fixed top-20 right-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="shadow-lg bg-background/95 backdrop-blur-sm border-border hover:bg-accent"
        >
          <Filter className="w-4 h-4" />
          <span className="ml-2">Filter</span>
          {activeFiltersCount > 0 && (
            <span className="ml-1 text-xs bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
              {activeFiltersCount}
            </span>
          )}
        </Button>

        {/* Filter Panel */}
        {isExpanded && (
          <div className="absolute right-0 top-12 w-80 bg-background border border-border rounded-lg shadow-xl p-4 max-h-96 overflow-y-auto">
            <div className="space-y-4">
              {/* Clear Filters */}
              {activeFiltersCount > 0 && (
                <div className="flex justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClearFilters}
                    className="h-7 text-xs text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-3.5 w-3.5 mr-1" />
                    Clear all filters
                  </Button>
                </div>
              )}

              {/* Language Filter */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Language</h4>
                <div className="grid grid-cols-2 gap-2">
                  {languages.map((lang) => (
                    <Button
                      key={lang.value}
                      variant="ghost"
                      size="sm"
                      onClick={() => onLanguageChange(lang.value)}
                      className={cn(
                        "h-8 text-xs w-full",
                        selectedLanguage === lang.value
                          ? "bg-primary text-primary-foreground hover:bg-primary/90"
                          : "text-muted-foreground hover:text-foreground hover:bg-accent"
                      )}
                    >
                      {lang.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Time Filter */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Time Period</h4>
                <div className="grid grid-cols-2 gap-2">
                  {timeFilters.map((filter) => (
                    <Button
                      key={filter.value}
                      variant="ghost"
                      size="sm"
                      onClick={() => onSortChange(filter.value)}
                      className={cn(
                        "h-8 text-xs w-full",
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
                <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
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
                          "text-xs cursor-pointer",
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
    </>
  );
};
