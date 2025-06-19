
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

const CreatePost = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { createPost } = usePosts();
  const { tags } = useTags();
  const { toast } = useToast();
  
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAllTags, setShowAllTags] = useState(false);

  // Always show these tags as requested
  const primaryTags = tags.filter(tag => ['Roast', 'Joke', 'Pun', 'Insult'].includes(tag.name));
  const otherTags = tags.filter(tag => !['Roast', 'Joke', 'Pun', 'Insult'].includes(tag.name));

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

  const convertToJson = (plainText: string) => {
    // Convert plain text with basic formatting to JSON structure
    return {
      type: 'doc',
      content: [{
        type: 'paragraph',
        content: [{
          type: 'text',
          text: plainText
        }]
      }]
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast({ title: "Error", description: "Please enter a title", variant: "destructive" });
      return;
    }

    if (!content.trim()) {
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
        content: convertToJson(content.trim()),
        tags: selectedTags,
        isAnonymous: !user || isAnonymous
      });

      toast({ title: "Success", description: "Your post has been created!" });
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
          {/* Title and Content in one card */}
          <div className="relative border border-border rounded-lg p-6 bg-card">
            {/* Title Input */}
            <div className="relative mb-6">
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter your post title..."
                className="text-lg font-semibold border-0 px-0 focus-visible:ring-0 bg-transparent"
                maxLength={200}
              />
              <Label className="absolute -top-3 left-3 px-2 bg-card text-sm font-medium text-muted-foreground">
                Title
              </Label>
            </div>

            {/* Content Input */}
            <div className="relative">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="What's your roast? Drop your joke, insult, or roast here..."
                className="w-full min-h-[120px] resize-none border-0 px-0 py-2 focus:outline-none bg-transparent text-base"
                maxLength={2000}
              />
              <Label className="absolute -top-3 left-3 px-2 bg-card text-sm font-medium text-muted-foreground">
                Body
              </Label>
              
              {/* Character counter */}
              <div className="flex justify-end mt-2">
                <span className={`text-sm ${content.length > 1800 ? 'text-destructive' : 'text-muted-foreground'}`}>
                  {content.length}/2000
                </span>
              </div>
            </div>
          </div>

          {/* Tags Section */}
          <div className="relative border border-border rounded-lg p-4 bg-card">
            <Label className="absolute -top-3 left-3 px-2 bg-card text-sm font-medium text-muted-foreground">
              Tags
            </Label>
            
            {/* Always visible tags */}
            <div className="flex flex-wrap gap-2 mb-3">
              {primaryTags.map((tag) => (
                <motion.div
                  key={tag.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <TagPill
                    tag={tag}
                    isSelected={selectedTags.includes(tag.id)}
                    onClick={() => handleTagToggle(tag.id)}
                  />
                </motion.div>
              ))}
            </div>
            
            {/* Expandable section for other tags */}
            {otherTags.length > 0 && (
              <div className="space-y-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAllTags(!showAllTags)}
                  className="p-2 h-auto"
                >
                  {showAllTags ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </Button>
                
                {showAllTags && (
                  <motion.div 
                    className="flex flex-wrap gap-2"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                  >
                    {otherTags.map((tag) => (
                      <motion.div
                        key={tag.id}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
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
            )}
          </div>

          {/* Anonymous posting section */}
          <div className="relative border border-border rounded-lg p-4 bg-card">
            <Label className="absolute -top-3 left-3 px-2 bg-card text-sm font-medium text-muted-foreground">
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

          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button 
              type="submit" 
              className="w-full" 
              size="lg"
              disabled={isSubmitting || !title.trim() || !content.trim() || selectedTags.length === 0}
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
