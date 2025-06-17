
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tag } from "@/hooks/useTags";
import { Filter, X, ChevronDown } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

interface FilterBarProps {
  tags: Tag[];
  selectedTags: string[];
  onTagChange: (tags: string[]) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
}

export const FilterBar = ({ tags, selectedTags, onTagChange, sortBy, onSortChange }: FilterBarProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setIsCollapsed(scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleTagToggle = (tagName: string) => {
    const newTags = selectedTags.includes(tagName)
      ? selectedTags.filter(t => t !== tagName)
      : [...selectedTags, tagName];
    onTagChange(newTags);
  };

  const clearFilters = () => {
    onTagChange([]);
    onSortChange("newest");
  };

  const hasActiveFilters = selectedTags.length > 0 || sortBy !== "newest";

  // Separate language tags from content tags
  const languageTags = tags.filter(tag => ['Hindi', 'Hinglish', 'English'].includes(tag.name));
  const contentTags = tags.filter(tag => !['Hindi', 'Hinglish', 'English'].includes(tag.name));

  if (isCollapsed) {
    return (
      <div className="fixed top-20 right-4 z-40">
        <Button
          onClick={() => setIsExpanded(!isExpanded)}
          className="bg-primary text-primary-foreground rounded-full shadow-lg hover:scale-110 transition-all"
          size="lg"
        >
          <Filter className="w-5 h-5" />
          {hasActiveFilters && (
            <span className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 rounded-full text-xs flex items-center justify-center text-white">
              {selectedTags.length}
            </span>
          )}
        </Button>
        
        {isExpanded && (
          <div className="absolute top-12 right-0 w-80 bg-card border border-border rounded-lg shadow-xl p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-foreground">Filters</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            {/* Sort */}
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block">Sort By</label>
              <Select value={sortBy} onValueChange={onSortChange}>
                <SelectTrigger className="bg-background border-border text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="newest">🕐 Newest</SelectItem>
                  <SelectItem value="oldest">🕐 Oldest</SelectItem>
                  <SelectItem value="upvotes">👍 Top</SelectItem>
                  <SelectItem value="controversial">🔥 Hot</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Language Filters */}
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block">Language</label>
              <div className="flex flex-wrap gap-2">
                {languageTags.map((tag) => (
                  <Badge
                    key={tag.id}
                    variant={selectedTags.includes(tag.name) ? "default" : "outline"}
                    className={`cursor-pointer transition-all text-sm ${
                      selectedTags.includes(tag.name)
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background text-muted-foreground border-border hover:border-primary"
                    }`}
                    onClick={() => handleTagToggle(tag.name)}
                    title={tag.name}
                  >
                    <span className="mr-1">{tag.emoji}</span>
                    <span className="text-xs">{tag.name}</span>
                  </Badge>
                ))}
              </div>
            </div>

            {/* Content Tags */}
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block">Content Tags</label>
              <div className="flex flex-wrap gap-2">
                {contentTags.map((tag) => (
                  <Badge
                    key={tag.id}
                    variant={selectedTags.includes(tag.name) ? "default" : "outline"}
                    className={`cursor-pointer transition-all text-sm ${
                      selectedTags.includes(tag.name)
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background text-muted-foreground border-border hover:border-primary"
                    }`}
                    onClick={() => handleTagToggle(tag.name)}
                    title={tag.name}
                  >
                    <span className="mr-1">{tag.emoji}</span>
                    <span className="text-xs">{tag.name}</span>
                  </Badge>
                ))}
              </div>
            </div>

            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
                className="w-full"
              >
                Clear All Filters
              </Button>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="sticky top-16 z-40 bg-background/95 backdrop-blur-sm border-b border-border py-2">
      <div className="container mx-auto px-4">
        {/* Compact filter bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-primary hover:text-primary/80 flex items-center space-x-1"
            >
              <Filter className="w-4 h-4" />
              <span>Filters</span>
              <ChevronDown className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
              {hasActiveFilters && (
                <span className="ml-1 w-2 h-2 bg-primary rounded-full"></span>
              )}
            </Button>

            {/* Selected tags preview */}
            {selectedTags.length > 0 && (
              <div className="flex items-center space-x-1">
                {selectedTags.slice(0, 3).map((tagName) => {
                  const tag = tags.find(t => t.name === tagName);
                  return tag ? (
                    <Badge
                      key={tag.id}
                      variant="secondary"
                      className="bg-primary/20 text-primary border-primary/30 text-xs px-2 py-0.5"
                      title={tag.name}
                    >
                      {tag.emoji} {tag.name}
                    </Badge>
                  ) : null;
                })}
                {selectedTags.length > 3 && (
                  <span className="text-xs text-muted-foreground">+{selectedTags.length - 3}</span>
                )}
              </div>
            )}
          </div>

          {/* Quick sort and clear */}
          <div className="flex items-center space-x-2">
            <Select value={sortBy} onValueChange={onSortChange}>
              <SelectTrigger className="w-32 h-8 bg-card border-border text-foreground text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                <SelectItem value="newest" className="text-xs">🕐 Newest</SelectItem>
                <SelectItem value="oldest" className="text-xs">🕐 Oldest</SelectItem>
                <SelectItem value="upvotes" className="text-xs">👍 Top</SelectItem>
                <SelectItem value="controversial" className="text-xs">🔥 Hot</SelectItem>
              </SelectContent>
            </Select>

            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="h-8 px-2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-3 h-3" />
              </Button>
            )}
          </div>
        </div>

        {/* Expanded filter panel */}
        {isExpanded && (
          <div className="mt-4 p-4 bg-card/50 rounded-lg border border-border">
            <div className="space-y-4">
              {/* Language Filters */}
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">Language</label>
                <div className="flex flex-wrap gap-2">
                  {languageTags.map((tag) => (
                    <Badge
                      key={tag.id}
                      variant={selectedTags.includes(tag.name) ? "default" : "outline"}
                      className={`cursor-pointer transition-all text-sm group relative ${
                        selectedTags.includes(tag.name)
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-card text-muted-foreground border-border hover:border-primary"
                      }`}
                      onClick={() => handleTagToggle(tag.name)}
                      title={tag.name}
                    >
                      <span className="mr-1">{tag.emoji}</span>
                      <span className="text-xs">{tag.name}</span>
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Content Tags */}
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">Content Tags</label>
                <div className="flex flex-wrap gap-2">
                  {contentTags.map((tag) => (
                    <Badge
                      key={tag.id}
                      variant={selectedTags.includes(tag.name) ? "default" : "outline"}
                      className={`cursor-pointer transition-all text-sm group relative ${
                        selectedTags.includes(tag.name)
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-card text-muted-foreground border-border hover:border-primary"
                      }`}
                      onClick={() => handleTagToggle(tag.name)}
                      title={tag.name}
                    >
                      <span className="mr-1">{tag.emoji}</span>
                      <span className="text-xs">{tag.name}</span>
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
