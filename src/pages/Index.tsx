
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PostCard } from "@/components/PostCard";
import { CreatePost } from "@/components/CreatePost";
import { FilterBar } from "@/components/FilterBar";
import { UserNav } from "@/components/UserNav";
import { Plus } from "lucide-react";
import { usePosts } from "@/hooks/usePosts";
import { useTags } from "@/hooks/useTags";
import { useAuth } from "@/hooks/useAuth";

const Index = () => {
  const { posts, loading, createPost, vote, savePost, reportPost } = usePosts();
  const { tags } = useTags();
  const { user } = useAuth();
  const [filteredPosts, setFilteredPosts] = useState(posts);
  const [sortBy, setSortBy] = useState("newest");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showNSFW, setShowNSFW] = useState(false);

  useEffect(() => {
    let filtered = [...posts];

    // Filter by tags
    if (selectedTags.length > 0) {
      filtered = filtered.filter(post => 
        selectedTags.some(tagName => post.tags.some(tag => tag.name === tagName))
      );
    }

    // Sort posts
    switch (sortBy) {
      case "newest":
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case "oldest":
        filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        break;
      case "upvotes":
        filtered.sort((a, b) => b.upvotes - a.upvotes);
        break;
      case "controversial":
        filtered.sort((a, b) => (b.downvotes / Math.max(b.upvotes, 1)) - (a.downvotes / Math.max(a.upvotes, 1)));
        break;
    }

    setFilteredPosts(filtered);
  }, [posts, selectedTags, sortBy]);

  const handleCreatePost = async (content: string, tagNames: string[], isAnonymous: boolean) => {
    await createPost(content, tagNames, isAnonymous);
    setShowCreatePost(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading roasts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-gray-900/80 backdrop-blur-sm border-b border-gray-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-orange-500">Roastr</h1>
              <span className="text-sm text-gray-400">Where jokes get roasted</span>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                onClick={() => setShowCreatePost(true)}
                className="bg-orange-600 hover:bg-orange-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Post
              </Button>
              <UserNav />
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="p-4">
                <h3 className="font-semibold mb-4 text-orange-500">Filter Posts</h3>
                <FilterBar
                  tags={tags}
                  selectedTags={selectedTags}
                  onTagChange={setSelectedTags}
                  sortBy={sortBy}
                  onSortChange={setSortBy}
                />
                
                <div className="mt-6 p-4 bg-gray-800 rounded-lg">
                  <h4 className="font-medium mb-2 text-orange-400">NSFW Content</h4>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showNSFW}
                      onChange={(e) => setShowNSFW(e.target.checked)}
                      className="rounded border-gray-600 text-orange-500 focus:ring-orange-500"
                    />
                    <span className="text-sm text-gray-300">Show NSFW posts</span>
                  </label>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Feed */}
          <div className="lg:col-span-3">
            <div className="space-y-4">
              {filteredPosts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onVote={vote}
                  onSave={savePost}
                  onReport={reportPost}
                  showNSFW={showNSFW}
                />
              ))}
              
              {filteredPosts.length === 0 && !loading && (
                <Card className="bg-gray-900 border-gray-800">
                  <CardContent className="p-8 text-center">
                    <p className="text-gray-400">
                      {posts.length === 0 
                        ? "No posts yet. Be the first to drop a roast! 🔥" 
                        : "No posts match your filters. Try adjusting your selection!"
                      }
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Create Post Modal */}
      {showCreatePost && (
        <CreatePost
          onClose={() => setShowCreatePost(false)}
          onSubmit={handleCreatePost}
        />
      )}

      {/* Floating Action Button */}
      <Button
        onClick={() => setShowCreatePost(true)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-orange-600 hover:bg-orange-700 shadow-lg lg:hidden"
      >
        <Plus className="w-6 h-6" />
      </Button>
    </div>
  );
};

export default Index;
