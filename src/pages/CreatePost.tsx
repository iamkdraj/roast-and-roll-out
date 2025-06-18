
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Send } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import usePosts from "@/hooks/usePosts";
import { useTags } from "@/hooks/useTags";
import { RichTextEditor } from "@/components/RichTextEditor";
import { TagPill } from "@/components/TagPill";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

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

  const primaryTags = tags.filter(tag => ['ROAST', 'JOKE', 'INSULT'].includes(tag.name));
  const otherTags = tags.filter(tag => !['ROAST', 'JOKE', 'INSULT'].includes(tag.name));

  const handleTagToggle = (tagId: string) => {
    setSelectedTags(prev => 
      prev.includes(tagId) 
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast({ title: "Error", description: "Please enter a title", variant: "destructive" });
      return;
    }

    if (!user) {
      navigate("/auth");
      return;
    }

    setIsSubmitting(true);

    try {
      await createPost({
        title: title.trim(),
        content,
        tags: selectedTags,
        isAnonymous
      });

      toast({ title: "Success", description: "Your post has been created!" });
      navigate("/");
    } catch (error) {
      console.error('Error creating post:', error);
      toast({ 
        title: "Error", 
        description: "Failed to create post. Please try again.", 
        variant: "destructive" 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <Card>
          <CardContent className="p-8 text-center">
            <p className="mb-4">Please log in to create a post</p>
            <Button onClick={() => navigate("/auth")}>Log In</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-background text-foreground"
    >
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-center relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/")}
              className="absolute left-0 text-primary p-2"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-bold text-primary">Create Post</h1>
          </div>
        </div>
      </header>

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
                  <TagPill
                    key={tag.id}
                    tag={tag}
                    isSelected={selectedTags.includes(tag.id)}
                    onClick={() => handleTagToggle(tag.id)}
                  />
                ))}
              </div>
              
              {otherTags.length > 0 && (
                <div className="space-y-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAllTags(!showAllTags)}
                  >
                    {showAllTags ? "Show Less" : "Show More Tags"}
                  </Button>
                  
                  {showAllTags && (
                    <motion.div 
                      className="flex flex-wrap gap-2"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                    >
                      {otherTags.map((tag) => (
                        <TagPill
                          key={tag.id}
                          tag={tag}
                          isSelected={selectedTags.includes(tag.id)}
                          onClick={() => handleTagToggle(tag.id)}
                        />
                      ))}
                    </motion.div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

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
    </motion.div>
  );
};

export default CreatePost;
