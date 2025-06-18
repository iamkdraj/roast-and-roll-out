
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Send } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import usePosts from "@/hooks/usePosts";
import { useTags } from "@/hooks/useTags";
import { RichTextEditor } from "@/components/RichTextEditor";
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
  const [content, setContent] = useState({
    type: 'doc',
    content: [{ type: 'paragraph', content: [{ type: 'text', text: '' }] }]
  });
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAllTags, setShowAllTags] = useState(false);

  // Always show these tags
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast({ title: "Error", description: "Please enter a title", variant: "destructive" });
      return;
    }

    // Check if content has actual text
    const hasContent = content.content.some((node: any) => 
      node.content && node.content.some((textNode: any) => 
        textNode.text && textNode.text.trim().length > 0
      )
    );

    if (!hasContent) {
      toast({ title: "Error", description: "Please enter some content", variant: "destructive" });
      return;
    }

    if (!user && !isAnonymous) {
      toast({ 
        title: "Error", 
        description: "Please log in or post anonymously", 
        variant: "destructive" 
      });
      return;
    }

    if (!user && isAnonymous && getAnonymousPostCount() >= 2) {
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
        content,
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
      <div className="container mx-auto px-4 py-6">
        <motion.form 
          onSubmit={handleSubmit} 
          className="space-y-6"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Title</CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter your post title..."
                className="text-lg font-semibold"
                maxLength={200}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Content</CardTitle>
            </CardHeader>
            <CardContent>
              <RichTextEditor
                content={content}
                onChange={setContent}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tags</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
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
              
              {otherTags.length > 0 && (
                <div className="space-y-2">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowAllTags(!showAllTags)}
                    >
                      {showAllTags ? "Show Less" : "Show More Tags"}
                    </Button>
                  </motion.div>
                  
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
            </CardContent>
          </Card>

          {user && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="anonymous"
                    checked={isAnonymous}
                    onCheckedChange={setIsAnonymous}
                  />
                  <Label htmlFor="anonymous">Post anonymously</Label>
                </div>
              </CardContent>
            </Card>
          )}

          {!user && (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center text-sm text-muted-foreground">
                  <p>You can post anonymously without logging in</p>
                  <p>Limit: {getAnonymousPostCount()}/2 posts per day</p>
                </div>
              </CardContent>
            </Card>
          )}

          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button 
              type="submit" 
              className="w-full" 
              size="lg"
              disabled={isSubmitting}
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
