import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PostCard } from "@/components/PostCard";
import { CreatePost } from "@/components/CreatePost";
import { FilterBar } from "@/components/FilterBar";
import { UserNav } from "@/components/UserNav";
import { Plus, Home, Trophy, Bookmark, User } from "lucide-react";
import { usePosts } from "@/hooks/usePosts";
import { useTags } from "@/hooks/useTags";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const { posts, loading, createPost, vote, savePost, reportPost, deletePost } = usePosts();
  const { tags } = useTags();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [filteredPosts, setFilteredPosts] = useState(posts);
  const [sortBy, setSortBy] = useState("newest");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showCreatePost, setShowCreatePost] = useState(false);
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

  const handleCreatePost = async (content: string, tagNames: string[], isAnonymous: boolean) => {
    await createPost(content, tagNames, isAnonymous);
    setShowCreatePost(false);
  };

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
    // Implement edit functionality
    return Promise.resolve();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading roasts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-primary">Roastr</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                onClick={() => setShowCreatePost(true)}
                className="bg-primary hover:bg-primary/90 text-primary-foreground hidden md:flex"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Post
              </Button>
              <UserNav />
            </div>
          </div>
        </div>
      </header>

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
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          {filteredPosts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onVote={vote}
              onSave={savePost}
              onReport={reportPost}
              onDelete={deletePost}
              onEdit={handleEdit}
              showNSFW={showNSFW}
              onUsernameClick={handleUsernameClick}
            />
          ))}
        </div>
      </main>

      {/* Create Post Modal */}
      {showCreatePost && (
        <CreatePost
          onClose={() => setShowCreatePost(false)}
          onSubmit={handleCreatePost}
        />
      )}

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-sm border-t border-border md:hidden z-40">
        <div className="flex items-center justify-around py-2">
          <Button 
            variant="ghost" 
            className="flex flex-col items-center space-y-1 text-primary"
            onClick={() => navigate("/")}
          >
            <Home className="w-5 h-5" />
            <span className="text-xs">Home</span>
          </Button>
          <Button 
            variant="ghost" 
            className="flex flex-col items-center space-y-1 text-muted-foreground hover:text-primary"
            onClick={() => navigate("/leaderboard")}
          >
            <Trophy className="w-5 h-5" />
            <span className="text-xs">Leaderboard</span>
          </Button>
          <Button
            onClick={() => setShowCreatePost(true)}
            className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full w-12 h-12 flex items-center justify-center"
          >
            <Plus className="w-6 h-6" />
          </Button>
          <Button 
            variant="ghost" 
            className="flex flex-col items-center space-y-1 text-muted-foreground hover:text-primary"
            onClick={() => navigate("/saved")}
          >
            <Bookmark className="w-5 h-5" />
            <span className="text-xs">Saved</span>
          </Button>
          <Button 
            variant="ghost" 
            className="flex flex-col items-center space-y-1 text-muted-foreground hover:text-primary"
            onClick={() => navigate("/profile")}
          >
            <User className="w-5 h-5" />
            <span className="text-xs">Profile</span>
          </Button>
        </div>
      </nav>
    </div>
  );
};

export default Index;
