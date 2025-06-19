
import { useState, useEffect } from "react";
import { PostCard } from "@/components/PostCard";
import { FilterBar } from "@/components/FilterBar";
import { usePosts } from "@/hooks/usePosts";
import { useTags } from "@/hooks/useTags";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Layout } from "@/components/Layout";

const Index = () => {
  const { data: posts, isLoading: loading, vote, savePost, reportPost, deletePost, editPost } = usePosts();
  const { tags } = useTags();
  const navigate = useNavigate();
  const [filteredPosts, setFilteredPosts] = useState(posts);
  const [sortBy, setSortBy] = useState("newest");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showNSFW, setShowNSFW] = useState(localStorage.getItem('showNSFW') === 'true');

  useEffect(() => {
    let filtered = [...posts];

    // Filter by NSFW setting
    if (!showNSFW) {
      filtered = filtered.filter(post => !post.isNSFW);
    }

    if (selectedTags.length > 0) {
      filtered = filtered.filter(post => 
        selectedTags.some(tagId => {
          const selectedTag = tags.find(t => t.id === tagId);
          return selectedTag && post.tags.some(tag => tag.name === selectedTag.name);
        })
      );
    }

    switch (sortBy) {
      case "newest":
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case "oldest":
        filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case "most_voted":
        filtered.sort((a, b) => b.upvotes - a.upvotes);
        break;
      case "day":
        const dayAgo = new Date();
        dayAgo.setDate(dayAgo.getDate() - 1);
        filtered = filtered.filter(post => new Date(post.createdAt) >= dayAgo);
        break;
      case "week":
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        filtered = filtered.filter(post => new Date(post.createdAt) >= weekAgo);
        break;
      case "month":
        const monthAgo = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        filtered = filtered.filter(post => new Date(post.createdAt) >= monthAgo);
        break;
      case "year":
        const yearAgo = new Date();
        yearAgo.setFullYear(yearAgo.getFullYear() - 1);
        filtered = filtered.filter(post => new Date(post.createdAt) >= yearAgo);
        break;
    }

    setFilteredPosts(filtered);
  }, [posts, selectedTags, sortBy, showNSFW, tags]);

  // Update NSFW setting from localStorage
  useEffect(() => {
    const handleStorageChange = () => {
      setShowNSFW(localStorage.getItem('showNSFW') === 'true');
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleUsernameClick = (userId: string) => {
    navigate(`/user/${userId}`);
  };

  const handleTagSelect = (tagId: string) => {
    setSelectedTags(prev => 
      prev.includes(tagId) 
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };

  const handleEdit = async (postId: string, content: string) => {
    await editPost(postId, content);
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading roasts...</p>
          </motion.div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* Filter Bar */}
      <FilterBar
        tags={tags}
        selectedTags={selectedTags}
        onTagSelect={handleTagSelect}
        onClearFilters={() => setSelectedTags([])}
        onSortChange={setSortBy}
        currentSort={sortBy}
      />

      {/* Main Content */}
      <main className="container mx-auto px-4 py-2">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="space-y-6"
        >
          {filteredPosts.map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                duration: 0.5, 
                delay: index * 0.1,
                ease: "easeOut"
              }}
            >
              <PostCard
                post={post}
                onVote={vote}
                onSave={savePost}
                onReport={reportPost}
                onDelete={deletePost}
                onEdit={handleEdit}
                showNSFW={showNSFW}
                onUsernameClick={handleUsernameClick}
              />
            </motion.div>
          ))}
        </motion.div>
      </main>
    </Layout>
  );
};

export default Index;
