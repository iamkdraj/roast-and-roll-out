import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { X, Save, History } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Post } from "@/hooks/usePosts";

interface EditPostProps {
  post: Post;
  onClose: () => void;
  onSave: (content: string) => Promise<void>;
}

export const EditPost = ({ post, onClose, onSave }: EditPostProps) => {
  const [content, setContent] = useState(post.content);
  const [isSaving, setIsSaving] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const handleSave = async () => {
    if (!content.trim()) {
      toast.error("Content cannot be empty!");
      return;
    }

    if (content === post.content) {
      toast.error("No changes made!");
      return;
    }

    try {
      setIsSaving(true);
      await onSave(content);
      toast.success("Post updated successfully!");
      onClose();
    } catch (error) {
      toast.error("Failed to update post!");
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Edit Post</CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowHistory(!showHistory)}
            >
              <History className="w-4 h-4 mr-2" />
              History
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Version History */}
          <Collapsible open={showHistory} onOpenChange={setShowHistory}>
            <CollapsibleContent>
              <div className="space-y-2 mb-4">
                {post.editHistory?.map((version, index) => (
                  <div key={index} className="p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">
                        {new Date(version.timestamp).toLocaleString()}
                      </span>
                      <Badge variant="outline">
                        Version {post.editHistory.length - index}
                      </Badge>
                    </div>
                    <p className="text-sm whitespace-pre-wrap">{version.content}</p>
                  </div>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* Content Input */}
          <div>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[120px] resize-none"
              maxLength={2000}
            />
            <div className="flex justify-between items-center mt-2">
              <span className="text-sm text-muted-foreground">
                {content.length}/2000 characters
              </span>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving || !content.trim() || content === post.content}
            >
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 