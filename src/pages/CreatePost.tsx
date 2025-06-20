
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ChevronDown, ChevronUp, Send } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import usePosts from "@/hooks/usePosts";
import { useTags } from "@/hooks/useTags";
import { TagPill } from "@/components/TagPill";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { Layout } from "@/components/Layout";
import { RichTextEditor } from "@/components/RichTextEditor";

const CreatePost = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { createPost } = usePosts();
  const { tags } = useTags();
  const { toast } = useToast();
  
  const [title, setTitle] = useState("");
  const [content, setContent] = useState({
    type: 'doc',
    content: [{
      type: 'paragraph',
      content: []
    }]
  });
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAllTags, setShowAllTags] = useState(false);

  const primaryTags = tags.filter(tag => ['Roast', 'Joke', 'Pun'].includes(tag.name)).slice(0, 3);
  const otherTags = tags.filter(tag => !['Roast', 'Joke', 'Pun'].includes(tag.name));

  const handleTagToggle = (tagId: string) => {
    setSelectedTags(prev => 
      prev.includes(tagId) 
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };

  const getAnonymousPostCount = () => {
    const anonymousPostsKey = 'anonymous_posts_' + new Date().toDateString();
    const todaysPosts = JSON.parse(localStorage.getItem(anonymousPostsKey) || '[]');
    return todaysPosts.length;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast({ title: "Error", description: "Please enter a title", variant: "destructive" });
      return;
    }

    if (!content.content || content.content.length === 0 || 
        (content.content.length === 1 && (!content.content[0].content || content.content[0].content.length === 0))) {
      toast({ title: "Error", description: "Please enter some content", variant: "destructive" });
      return;
    }

    if (selectedTags.length === 0) {
      toast({ title: "Error", description: "Please select at least one tag", variant: "destructive" });
      return;
    }

    if (!user && getAnonymousPostCount() >= 2) {
      toast({ 
        title: "Error", 
        description: "You've reached the daily limit of 2 anonymous posts", 
        variant: "destructive" 
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await createPost({
        title: title.trim(),
        content: content,
        tags: selectedTags,
        isAnonymous: !user || isAnonymous
      });

      toast({ title: "Success! 🎉", description: "Your roast has been posted successfully!" });
      navigate("/");
    } catch (error: any) {
      console.error('Error creating post:', error);
      toast({ 
        title: "Error", 
        description: error.message || "Failed to create post. Please try again.", 
        variant: "destructive" 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout customTitle="Create Post" showBackButton>
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <motion.form 
          onSubmit={handleSubmit} 
          className="space-y-6"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          {/* Title Input */}
          <div className="relative border-2 border-border rounded-lg p-4 bg-background">
            <Label className="absolute -top-3 left-3 px-2 bg-background text-xs font-medium text-muted-foreground">
              Title
            </Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter your post title..."
              className="border-0 text-lg font-semibold bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 px-0"
              maxLength={200}
            />
          </div>

          {/* Content Input */}
          <div className="relative border-2 border-border rounded-lg bg-background focus-within:border-primary transition-colors p-4">
            <Label className="absolute -top-3 left-3 px-2 bg-background text-xs font-medium text-muted-foreground">
              Body
            </Label>
            <div className="mt-2">
              <RichTextEditor
                content={content}
                onChange={setContent}
              />
            </div>
          </div>

          {/* Tags */}
          <div className="relative border-2 border-border rounded-lg p-4 bg-background">
            <Label className="absolute -top-3 left-3 px-2 bg-background text-xs font-medium text-muted-foreground">
              Tags
            </Label>
            
            <div className="flex items-center gap-2">
              {primaryTags.map((tag) => (
                <motion.div
                  key={tag.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="select-none"
                >
                  <TagPill
                    tag={tag}
                    isSelected={selectedTags.includes(tag.id)}
                    onClick={() => handleTagToggle(tag.id)}
                  />
                </motion.div>
              ))}
              
              {otherTags.length > 0 && (
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAllTags(!showAllTags)}
                    className="h-7 px-2"
                  >
                    {showAllTags ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  </Button>
                </motion.div>
              )}
            </div>
            
            {showAllTags && otherTags.length > 0 && (
              <motion.div 
                className="flex flex-wrap gap-2 mt-3"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
              >
                {otherTags.map((tag) => (
                  <motion.div
                    key={tag.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="select-none"
                  >
                    <TagPill
                      tag={tag}
                      isSelected={selectedTags.includes(tag.id)}
                      onClick={() => handleTagToggle(tag.id)}
                    />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </div>

          {/* Anonymous Post Option */}
          <div className="relative border-2 border-border rounded-lg p-4 bg-background">
            <Label className="absolute -top-3 left-3 px-2 bg-background text-xs font-medium text-muted-foreground">
              Post Anonymously
            </Label>
            
            {!user ? (
              <div className="text-center text-sm text-muted-foreground">
                <p className="mb-2">You can post anonymously without logging in</p>
                <p className="text-xs">Limit: {getAnonymousPostCount()}/2 posts per day</p>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <span className="text-sm">Post this anonymously</span>
                <Switch
                  checked={isAnonymous}
                  onCheckedChange={setIsAnonymous}
                />
              </div>
            )}
          </div>

          {/* Submit Button */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button 
              type="submit" 
              className="w-full" 
              size="lg"
              disabled={isSubmitting || !title.trim() || selectedTags.length === 0}
            >
              {isSubmitting ? (
                "Creating Post..."
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Create Post
                </>
              )}
            </Button>
          </motion.div>
        </motion.form>
      </div>
    </Layout>
  );
};

export default CreatePost;
