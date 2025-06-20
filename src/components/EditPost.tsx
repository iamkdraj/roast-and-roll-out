
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { X, Save } from "lucide-react";
import { toast } from "sonner";
import { Post } from "@/hooks/usePosts";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface EditPostProps {
  post: Post;
  onClose: () => void;
  onSave: (title: string, content: string) => Promise<void>;
}

export const EditPost = ({ post, onClose, onSave }: EditPostProps) => {
  const [title, setTitle] = useState(post.title);
  const [content, setContent] = useState(post.content);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error("Title cannot be empty!");
      return;
    }

    if (!content.trim()) {
      toast.error("Content cannot be empty!");
      return;
    }

    if (title === post.title && content === post.content) {
      toast.error("No changes made!");
      return;
    }

    try {
      setIsSaving(true);
      await onSave(title, content);
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
            <Label htmlFor="edit-title" className="text-foreground">Title</Label>
            <Input
              id="edit-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-background border-input"
              maxLength={100}
            />
          </div>

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
              disabled={isSaving || !title.trim() || !content.trim() || (title === post.title && content === post.content)}
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
