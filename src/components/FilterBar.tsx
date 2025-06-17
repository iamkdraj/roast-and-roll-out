
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tag } from "@/hooks/useTags";
import { Filter, X, ChevronDown } from "lucide-react";
import { useState } from "react";
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

  return (
    <div className="sticky top-16 z-40 bg-gray-950/95 backdrop-blur-sm border-b border-gray-800 py-2">
      <div className="container mx-auto px-4">
        {/* Compact filter bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-orange-500 hover:text-orange-400 flex items-center space-x-1"
            >
              <Filter className="w-4 h-4" />
              <span>Filters</span>
              <ChevronDown className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
              {hasActiveFilters && (
                <span className="ml-1 w-2 h-2 bg-orange-500 rounded-full"></span>
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
                      className="bg-orange-600/20 text-orange-400 border-orange-600/30 text-xs px-2 py-0.5"
                      title={tag.name}
                    >
                      {tag.emoji} {tag.name}
                    </Badge>
                  ) : null;
                })}
                {selectedTags.length > 3 && (
                  <span className="text-xs text-gray-400">+{selectedTags.length - 3}</span>
                )}
              </div>
            )}
          </div>

          {/* Quick sort and clear */}
          <div className="flex items-center space-x-2">
            <Select value={sortBy} onValueChange={onSortChange}>
              <SelectTrigger className="w-32 h-8 bg-gray-800 border-gray-700 text-white text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
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
                className="h-8 px-2 text-gray-400 hover:text-white"
              >
                <X className="w-3 h-3" />
              </Button>
            )}
          </div>
        </div>

        {/* Expanded filter panel */}
        {isExpanded && (
          <div className="mt-4 p-4 bg-gray-900/50 rounded-lg border border-gray-800">
            <div className="space-y-4">
              {/* Language Filters */}
              <div>
                <label className="text-sm font-medium text-gray-300 mb-2 block">Language</label>
                <div className="flex flex-wrap gap-2">
                  {languageTags.map((tag) => (
                    <Badge
                      key={tag.id}
                      variant={selectedTags.includes(tag.name) ? "default" : "outline"}
                      className={`cursor-pointer transition-all text-sm group relative ${
                        selectedTags.includes(tag.name)
                          ? "bg-orange-600 text-white border-orange-600"
                          : "bg-gray-800 text-gray-300 border-gray-600 hover:border-orange-500"
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
                <label className="text-sm font-medium text-gray-300 mb-2 block">Content Tags</label>
                <div className="flex flex-wrap gap-2">
                  {contentTags.map((tag) => (
                    <Badge
                      key={tag.id}
                      variant={selectedTags.includes(tag.name) ? "default" : "outline"}
                      className={`cursor-pointer transition-all text-sm group relative ${
                        selectedTags.includes(tag.name)
                          ? "bg-orange-600 text-white border-orange-600"
                          : "bg-gray-800 text-gray-300 border-gray-600 hover:border-orange-500"
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
