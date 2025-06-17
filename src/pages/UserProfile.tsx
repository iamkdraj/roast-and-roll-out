
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, User, TrendingUp, TrendingDown, FileText } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { PostCard } from "@/components/PostCard";
import { Post } from "@/hooks/usePosts";
import { getRandomAvatarColor, getAvatarInitials } from "@/utils/avatarUtils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const UserProfile = () => {
  const navigate = useNavigate();
  const { userId } = useParams<{ userId: string }>();
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalPosts: 0, totalUpvotes: 0, totalDownvotes: 0 });

  useEffect(() => {
    if (userId) {
      fetchUserData();
    }
  }, [userId]);

  const fetchUserData = async () => {
    if (!userId) return;

    try {
      // Fetch username
      const { data: profileData } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', userId)
        .maybeSingle();

      if (profileData) {
        setUsername(profileData.username);
      }

      // Fetch user posts
      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select(`
          *,
          post_tags(
            tags(name, emoji, is_sensitive)
          )
        `)
        .eq('user_id', userId)
        .eq('is_anonymous', false)
        .eq('status', 'visible')
        .order('created_at', { ascending: false });

      if (postsError) throw postsError;

      const postsWithVotes = await Promise.all(
        postsData.map(async (post) => {
          const { data: voteCountsData } = await supabase
            .rpc('get_vote_counts', { post_uuid: post.id });

          const voteCounts = voteCountsData as { upvotes: number; downvotes: number };

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
            isAnonymous: false,
            createdAt: post.created_at,
            isNSFW: post.post_tags.some((pt: any) => pt.tags.is_sensitive),
            userVote: null,
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

  const avatarColor = getRandomAvatarColor(username);

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
            <h1 className="text-xl font-bold text-primary">{username}'s Profile</h1>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* User Info Card */}
        <Card className="bg-card border-border">
          <CardContent className="p-8">
            <div className="flex items-center justify-center space-x-6">
              <Avatar className="h-20 w-20">
                <AvatarFallback className={`${avatarColor} text-white text-2xl font-bold`}>
                  {getAvatarInitials(username)}
                </AvatarFallback>
              </Avatar>
              <div className="text-center">
                <h2 className="text-3xl font-bold text-foreground mb-2">{username}</h2>
                <p className="text-muted-foreground">Roast enthusiast 🔥</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-card border-border hover:shadow-md transition-shadow">
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center mb-2">
                <FileText className="w-8 h-8 text-primary" />
              </div>
              <div className="text-3xl font-bold text-primary mb-1">{stats.totalPosts}</div>
              <div className="text-sm text-muted-foreground">Total Posts</div>
            </CardContent>
          </Card>
          
          <Card className="bg-card border-border hover:shadow-md transition-shadow">
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center mb-2">
                <TrendingUp className="w-8 h-8 text-green-500" />
              </div>
              <div className="text-3xl font-bold text-green-500 mb-1">{stats.totalUpvotes}</div>
              <div className="text-sm text-muted-foreground">Total Upvotes</div>
            </CardContent>
          </Card>
          
          <Card className="bg-card border-border hover:shadow-md transition-shadow">
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center mb-2">
                <TrendingDown className="w-8 h-8 text-red-500" />
              </div>
              <div className="text-3xl font-bold text-red-500 mb-1">{stats.totalDownvotes}</div>
              <div className="text-sm text-muted-foreground">Total Downvotes</div>
            </CardContent>
          </Card>
        </div>

        {/* User Posts */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center space-x-2">
              <User className="w-5 h-5" />
              <span>{username}'s Posts</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {userPosts.length === 0 ? (
              <div className="text-center py-12">
                <User className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground text-lg">No public posts yet.</p>
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

export default UserProfile;
