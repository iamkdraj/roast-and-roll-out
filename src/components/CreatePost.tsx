import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { X, Send, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";
import { useTags } from "@/hooks/useTags";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CreatePostProps {
  onClose: () => void;
  onSubmit: (title: string, content: string, tagNames: string[], isAnonymous: boolean) => void;
}

export const CreatePost = ({ onClose, onSubmit }: CreatePostProps) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [postAsAnonymous, setPostAsAnonymous] = useState(false);
  const [isTagsOpen, setIsTagsOpen] = useState(false);
  const [anonymousPostCount, setAnonymousPostCount] = useState(0);
  const { tags } = useTags();
  const { user } = useAuth();

  // Check anonymous post count
  useEffect(() => {
    const checkAnonymousPosts = async () => {
      if (!user) return;
      
      const twentyFourHoursAgo = new Date();
      twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

      const { data, error } = await supabase
        .from('posts')
        .select('id')
        .eq('user_id', user.id)
        .eq('is_anonymous', true)
        .gte('created_at', twentyFourHoursAgo.toISOString());

      if (!error && data) {
        setAnonymousPostCount(data.length);
      }
    };

    checkAnonymousPosts();
  }, [user]);

  const handleTagToggle = (tagName: string) => {
    setSelectedTags(prev => 
      prev.includes(tagName) 
        ? prev.filter(t => t !== tagName)
        : [...prev, tagName]
    );
  };

  const handleSubmit = () => {
    if (!title.trim()) {
      toast.error("Please enter a title!");
      return;
    }

    if (!content.trim()) {
      toast.error("Please enter some content!");
      return;
    }

    if (selectedTags.length === 0) {
      toast.error("Please select at least one tag!");
      return;
    }

    if (content.length > 2000) {
      toast.error("Content is too long! Maximum 2000 characters.");
      return;
    }

    if (postAsAnonymous && anonymousPostCount >= 2) {
      toast.error("You've reached the limit of 2 anonymous posts in 24 hours!");
      return;
    }

    onSubmit(title.trim(), content.trim(), selectedTags, postAsAnonymous);
  };

  const characterCount = content.length;
  const isOverLimit = characterCount > 2000;

  // Separate default tags and other tags
  const defaultTags = tags.filter(tag => ['Roast', 'Joke', 'Insult'].includes(tag.name));
  const otherTags = tags.filter(tag => !['Roast', 'Joke', 'Insult'].includes(tag.name));

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Create a Post</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
          >
            <X className="w-4 h-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Title Input */}
          <div>
            <Label htmlFor="title" className="text-foreground">Title</Label>
            <Input
              id="title"
              placeholder="Enter a catchy title for your roast..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-background border-input"
              maxLength={100}
            />
          </div>

          {/* Content Input */}
          <div>
            <Textarea
              placeholder="What's your roast? Drop your joke, insult, or roast here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[120px] resize-none"
              maxLength={2000}
            />
            <div className="flex justify-between items-center mt-2">
              <span className={`text-sm ${isOverLimit ? 'text-destructive' : 'text-muted-foreground'}`}>
                {characterCount}/2000 characters
              </span>
            </div>
          </div>

          {/* Default Tags */}
          <div>
            <h3 className="text-sm font-medium mb-3">
              Select Tags (at least one required)
            </h3>
            <div className="flex flex-wrap gap-2">
              {defaultTags.map((tag) => (
                <Badge
                  key={tag.id}
                  variant={selectedTags.includes(tag.name) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => handleTagToggle(tag.name)}
                >
                  {tag.emoji} {tag.name}
                </Badge>
              ))}
            </div>
          </div>

          {/* Other Tags */}
          <Collapsible open={isTagsOpen} onOpenChange={setIsTagsOpen}>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">
                More Tags
              </h3>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm">
                  {isTagsOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </Button>
              </CollapsibleTrigger>
            </div>
            <CollapsibleContent>
              <div className="flex flex-wrap gap-2 mt-3">
                {otherTags.map((tag) => (
                  <Badge
                    key={tag.id}
                    variant={selectedTags.includes(tag.name) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => handleTagToggle(tag.name)}
                  >
                    {tag.emoji} {tag.name}
                  </Badge>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Anonymous Post Button */}
          {user && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                {anonymousPostCount}/2 anonymous posts in 24h
              </div>
              <Button
                variant={postAsAnonymous ? "default" : "outline"}
                size="sm"
                onClick={() => setPostAsAnonymous(!postAsAnonymous)}
                disabled={anonymousPostCount >= 2 && !postAsAnonymous}
              >
                {postAsAnonymous ? "Posting Anonymously" : "Post Anonymously"}
              </Button>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!title.trim() || !content.trim() || selectedTags.length === 0 || isOverLimit}
            >
              <Send className="w-4 h-4 mr-2" />
              Post Roast
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
