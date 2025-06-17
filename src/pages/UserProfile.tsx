
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, MessageSquare, ThumbsUp } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PostCard } from "@/components/PostCard";
import { UserNav } from "@/components/UserNav";
import { getRandomAvatarColor, getAvatarInitials } from "@/utils/avatarUtils";
import { usePosts } from "@/hooks/usePosts";

interface UserProfile {
  id: string;
  username: string;
  bio: string;
  avatar_url: string;
  created_at: string;
}

const UserProfile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [userPosts, setUserPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalPosts: 0, totalUpvotes: 0 });
  const { vote, savePost, reportPost } = usePosts();

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!userId) return;

      try {
        // Fetch user profile
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (profileData) {
          setProfile(profileData);

          // Fetch user's posts
          const { data: postsData } = await supabase
            .from('posts')
            .select(`
              *,
              post_tags(
                tags(name, emoji, is_sensitive)
              )
            `)
            .eq('user_id', userId)
            .eq('status', 'visible')
            .order('created_at', { ascending: false });

          if (postsData) {
            const postsWithVotes = await Promise.all(
              postsData.map(async (post) => {
                const { data: voteCountsData } = await supabase
                  .rpc('get_vote_counts', { post_uuid: post.id });

                return {
                  id: post.id,
                  content: post.content,
                  tags: post.post_tags.map((pt: any) => ({
                    emoji: pt.tags.emoji,
                    name: pt.tags.name
                  })).filter((tag: any) => !['Hindi', 'Hinglish', 'English'].includes(tag.name)),
                  upvotes: voteCountsData?.upvotes || 0,
                  downvotes: voteCountsData?.downvotes || 0,
                  username: profileData.username,
                  isAnonymous: post.is_anonymous,
                  createdAt: post.created_at,
                  isNSFW: post.post_tags.some((pt: any) => pt.tags.is_sensitive),
                  user_id: post.user_id
                };
              })
            );

            setUserPosts(postsWithVotes);
            
            // Calculate stats
            const totalUpvotes = postsWithVotes.reduce((sum, post) => sum + post.upvotes, 0);
            setStats({
              totalPosts: postsWithVotes.length,
              totalUpvotes
            });
          }
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [userId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">User not found</h2>
          <Button onClick={() => navigate("/")}>Go back home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white pb-20">
      <header className="sticky top-0 z-50 bg-gray-900/80 backdrop-blur-sm border-b border-gray-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/")}
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <h1 className="text-2xl font-bold text-orange-500">Profile</h1>
            </div>
            <UserNav />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Info */}
          <div className="lg:col-span-1">
            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="p-6">
                <div className="text-center">
                  {profile.avatar_url ? (
                    <img
                      src={profile.avatar_url}
                      alt={profile.username}
                      className="w-24 h-24 rounded-full mx-auto mb-4"
                    />
                  ) : (
                    <div className={`w-24 h-24 rounded-full mx-auto mb-4 flex items-center justify-center text-white font-bold text-2xl ${getRandomAvatarColor(profile.username)}`}>
                      {getAvatarInitials(profile.username)}
                    </div>
                  )}
                  <h2 className="text-2xl font-bold text-white mb-2">{profile.username}</h2>
                  {profile.bio && (
                    <p className="text-gray-400 mb-4">{profile.bio}</p>
                  )}
                  <div className="flex items-center justify-center text-sm text-gray-500 mb-4">
                    <Calendar className="w-4 h-4 mr-1" />
                    Joined {new Date(profile.created_at).toLocaleDateString()}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="bg-gray-800 rounded-lg p-3">
                      <div className="flex items-center justify-center mb-1">
                        <MessageSquare className="w-4 h-4 text-orange-500 mr-1" />
                      </div>
                      <div className="text-xl font-bold text-white">{stats.totalPosts}</div>
                      <div className="text-xs text-gray-400">Posts</div>
                    </div>
                    <div className="bg-gray-800 rounded-lg p-3">
                      <div className="flex items-center justify-center mb-1">
                        <ThumbsUp className="w-4 h-4 text-orange-500 mr-1" />
                      </div>
                      <div className="text-xl font-bold text-white">{stats.totalUpvotes}</div>
                      <div className="text-xs text-gray-400">Upvotes</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* User Posts */}
          <div className="lg:col-span-2">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader>
                <CardTitle className="text-orange-500">Posts by {profile.username}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {userPosts.map((post) => (
                    <PostCard
                      key={post.id}
                      post={post}
                      onVote={vote}
                      onSave={savePost}
                      onReport={reportPost}
                      onDelete={() => {}}
                      showNSFW={true}
                    />
                  ))}
                  
                  {userPosts.length === 0 && (
                    <div className="text-center py-8 text-gray-400">
                      No posts yet from this user.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
