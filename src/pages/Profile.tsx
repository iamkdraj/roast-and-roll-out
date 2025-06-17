import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, User, TrendingUp, TrendingDown, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { PostCard } from "@/components/PostCard";
import { Post } from "@/hooks/usePosts";

const Profile = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalPosts: 0, totalUpvotes: 0, totalDownvotes: 0 });

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    fetchUserData();
  }, [user]);

  const fetchUserData = async () => {
    if (!user) return;

    try {
      // Fetch user posts
      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select(`
          *,
          post_tags(
            tags(name, emoji, is_sensitive)
          )
        `)
        .eq('user_id', user.id)
        .eq('status', 'visible')
        .order('created_at', { ascending: false });

      if (postsError) throw postsError;

      const postsWithVotes = await Promise.all(
        postsData.map(async (post) => {
          const { data: voteCountsData } = await supabase
            .rpc('get_vote_counts', { post_uuid: post.id });

          const voteCounts = voteCountsData as { upvotes: number; downvotes: number };

          const { data: voteData } = await supabase
            .from('votes')
            .select('vote_type')
            .eq('post_id', post.id)
            .eq('user_id', user.id)
            .maybeSingle();

          const { data: profileData } = await supabase
            .from('profiles')
            .select('username')
            .eq('id', post.user_id)
            .maybeSingle();

          return {
            id: post.id,
            content: post.content,
            tags: post.post_tags.map((pt: any) => ({
              emoji: pt.tags.emoji,
              name: pt.tags.name
            })),
            upvotes: voteCounts?.upvotes || 0,
            downvotes: voteCounts?.downvotes || 0,
            username: profileData?.username || "Unknown",
            isAnonymous: post.is_anonymous,
            createdAt: post.created_at,
            isNSFW: post.post_tags.some((pt: any) => pt.tags.is_sensitive),
            userVote: voteData?.vote_type as "upvote" | "downvote" | null,
            isSaved: false,
            user_id: post.user_id
          };
        })
      );

      setUserPosts(postsWithVotes);

      // Calculate stats
      const totalUpvotes = postsWithVotes.reduce((sum, post) => sum + post.upvotes, 0);
      const totalDownvotes = postsWithVotes.reduce((sum, post) => sum + post.downvotes, 0);
      
      setStats({
        totalPosts: postsWithVotes.length,
        totalUpvotes,
        totalDownvotes
      });

    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
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
            <h1 className="text-xl font-bold text-primary">My Profile</h1>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Stats Cards in a Row */}
        <div className="flex gap-4 justify-center">
          <div className="flex flex-col items-center p-4 bg-card border border-border rounded-lg stats-card min-w-[120px]">
            <FileText className="w-6 h-6 text-primary mb-2" />
            <div className="text-2xl font-bold text-primary">{stats.totalPosts}</div>
            <div className="text-sm text-muted-foreground text-center">Posts</div>
          </div>
          
          <div className="flex flex-col items-center p-4 bg-card border border-border rounded-lg stats-card min-w-[120px]">
            <TrendingUp className="w-6 h-6 text-green-500 mb-2" />
            <div className="text-2xl font-bold text-green-500">{stats.totalUpvotes}</div>
            <div className="text-sm text-muted-foreground text-center">Upvotes</div>
          </div>
          
          <div className="flex flex-col items-center p-4 bg-card border border-border rounded-lg stats-card min-w-[120px]">
            <TrendingDown className="w-6 h-6 text-red-500 mb-2" />
            <div className="text-2xl font-bold text-red-500">{stats.totalDownvotes}</div>
            <div className="text-sm text-muted-foreground text-center">Downvotes</div>
          </div>
        </div>

        {/* User Posts */}
        <Card className="stats-card">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center space-x-2">
              <User className="w-5 h-5" />
              <span>My Posts</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {userPosts.length === 0 ? (
              <div className="text-center py-12">
                <User className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground text-lg">No posts yet. Start roasting! 🔥</p>
              </div>
            ) : (
              <div className="space-y-4">
                {userPosts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    onVote={() => {}}
                    onSave={() => {}}
                    onReport={() => {}}
                    onDelete={() => {}}
                    showNSFW={true}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
