
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { RichTextEditor } from "@/components/RichTextEditor";
import { usePosts } from "@/hooks/usePosts";
import { useTags } from "@/hooks/useTags";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

const CreatePost = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState({
    type: 'doc',
    content: [{
      type: 'paragraph',
      content: [{
        type: 'text',
        text: '',
        marks: []
      }]
    }]
  });
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [showMoreTags, setShowMoreTags] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { createPost } = usePosts();
  const { tags } = useTags();
  const { user } = useAuth();
  const navigate = useNavigate();

  const primaryTags = tags.filter(tag => ['ROAST', 'JOKE', 'INSULT'].includes(tag.name));
  const otherTags = tags.filter(tag => !['ROAST', 'JOKE', 'INSULT'].includes(tag.name));

  const handleTagSelect = (tagName: string) => {
    setSelectedTags(prev => 
      prev.includes(tagName) 
        ? prev.filter(name => name !== tagName)
        : [...prev, tagName]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      toast.error("Please add a title");
      return;
    }

    if (!content || !content.content || content.content.length === 0) {
      toast.error("Please add some content");
      return;
    }

    if (selectedTags.length === 0) {
      toast.error("Please select at least one tag");
      return;
    }

    setIsSubmitting(true);
    
    try {
      await createPost(title, JSON.stringify(content), selectedTags, isAnonymous);
      navigate("/");
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error("Failed to create post");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <motion.header 
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky top-0 z-50 bg-card/80 backdrop-blur-sm border-b border-border"
      >
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <motion.div 
              className="flex items-center space-x-4"
              whileHover={{ scale: 1.02 }}
            >
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate("/")}
                className="h-8 w-8"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <h1 className="text-xl font-bold text-primary">Create Post</h1>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                type="submit"
                form="create-post-form"
                disabled={isSubmitting}
                className="bg-primary hover:bg-primary/90"
              >
                {isSubmitting ? "Posting..." : "Post"}
              </Button>
            </motion.div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <motion.form
          id="create-post-form"
          onSubmit={handleSubmit}
          className="space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          {/* Title */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Input
              placeholder="Enter your post title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-lg font-semibold"
            />
          </motion.div>

          {/* Content Editor */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <RichTextEditor
              value={content}
              onChange={setContent}
              placeholder="What's on your mind?"
              className="min-h-48"
            />
          </motion.div>

          {/* Tags */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-3"
          >
            <h3 className="text-sm font-medium text-muted-foreground">Select Tags</h3>
            
            {/* Primary Tags */}
            <div className="flex gap-2 flex-wrap">
              {primaryTags.map((tag) => (
                <motion.div
                  key={tag.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Badge
                    variant={selectedTags.includes(tag.name) ? "default" : "outline"}
                    className="cursor-pointer transition-all"
                    onClick={() => handleTagSelect(tag.name)}
                  >
                    <span className="mr-1">{tag.emoji}</span>
                    {tag.name}
                  </Badge>
                </motion.div>
              ))}
              
              {otherTags.length > 0 && (
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowMoreTags(!showMoreTags)}
                    className="h-6 px-2"
                  >
                    {showMoreTags ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    <span className="ml-1">More</span>
                  </Button>
                </motion.div>
              )}
            </div>

            {/* Additional Tags */}
            <AnimatePresence>
              {showMoreTags && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex gap-2 flex-wrap overflow-hidden"
                >
                  {otherTags.map((tag) => (
                    <motion.div
                      key={tag.id}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Badge
                        variant={selectedTags.includes(tag.name) ? "default" : "outline"}
                        className="cursor-pointer transition-all"
                        onClick={() => handleTagSelect(tag.name)}
                      >
                        <span className="mr-1">{tag.emoji}</span>
                        {tag.name}
                      </Badge>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Anonymous Toggle */}
          {user && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="flex items-center space-x-3 p-4 rounded-lg border bg-card"
            >
              <Switch
                id="anonymous"
                checked={isAnonymous}
                onCheckedChange={setIsAnonymous}
              />
              <label htmlFor="anonymous" className="text-sm font-medium cursor-pointer">
                Post anonymously
              </label>
            </motion.div>
          )}
        </motion.form>
      </main>
    </div>
  );
};

export default CreatePost;
