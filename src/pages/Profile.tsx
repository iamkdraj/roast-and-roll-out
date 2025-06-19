
import { useState, useEffect } from "react";
import { PostCard } from "@/components/PostCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Layout } from "@/components/Layout";
import { useToast } from "@/hooks/use-toast";
import { Post } from "@/hooks/usePosts";
import { getRandomAvatarColor, getAvatarInitials } from "@/utils/avatarUtils";
import { Edit, FileText, TrendingUp, TrendingDown } from "lucide-react";

const Profile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalPosts: 0, totalUpvotes: 0, totalDownvotes: 0 });
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState({ username: '', bio: '' });

  useEffect(() => {
    if (user) {
      fetchUserPosts();
      fetchUserStats();
      fetchProfile();
    } else {
      setLoading(false);
    }
  }, [user]);

  const convertJsonToHtml = (jsonContent: any): string => {
    if (!jsonContent || typeof jsonContent !== 'object') {
      return jsonContent?.toString() || "";
    }

    try {
      if (jsonContent.content && Array.isArray(jsonContent.content)) {
        return jsonContent.content
          .map((node: any) => {
            if (node.type === 'paragraph') {
              const textContent = node.content?.map((textNode: any) => {
                if (textNode.type === 'text') {
                  let text = textNode.text || '';
                  if (textNode.marks) {
                    textNode.marks.forEach((mark: any) => {
                      switch (mark.type) {
                        case 'bold':
                          text = `<strong>${text}</strong>`;
                          break;
                        case 'italic':
                          text = `<em>${text}</em>`;
                          break;
                        case 'underline':
                          text = `<u>${text}</u>`;
                          break;
                      }
                    });
                  }
                  return text;
                }
                return '';
              }).join('') || '';
              return textContent ? `<p>${textContent}</p>` : '';
            }
            return '';
          })
          .join('');
      }
    } catch (error) {
      console.error('Error converting JSON to HTML:', error);
    }

    return jsonContent?.toString() || "";
  };

  const fetchProfile = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('profiles')
      .select('username, bio')
      .eq('id', user.id)
      .maybeSingle();

    if (data) {
      setProfile({ username: data.username || '', bio: data.bio || '' });
    }
  };

  const fetchUserPosts = async () => {
    if (!user) return;

    try {
      const { data: postsData, error } = await supabase
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

      if (error) throw error;

      const postsWithVotes = await Promise.all(
        postsData.map(async (post) => {
          const { data: voteCountsData } = await supabase
            .rpc('get_vote_counts', { post_uuid: post.id });

          const voteCounts = voteCountsData as any;

          const { data: voteData } = await supabase
            .from('votes')
            .select('vote_type')
            .eq('post_id', post.id)
            .eq('user_id', user.id)
            .maybeSingle();

          const { data: savedData } = await supabase
            .from('saved_posts')
            .select('id')
            .eq('post_id', post.id)
            .eq('user_id', user.id)
            .maybeSingle();

          const { data: profileData } = await supabase
            .from('profiles')
            .select('username')
            .eq('id', user.id)
            .maybeSingle();

          return {
            id: post.id,
            title: post.title || "Untitled",
            content: convertJsonToHtml(post.content),
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
            userVote: (voteData?.vote_type as "upvote" | "downvote") || null,
            isSaved: !!savedData,
            user_id: post.user_id
          };
        })
      );

      setUserPosts(postsWithVotes);
    } catch (error) {
      console.error('Error fetching user posts:', error);
      toast({ title: "Error", description: "Failed to load your posts", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const fetchUserStats = async () => {
    if (!user) return;

    try {
      const { data: postsData } = await supabase
        .from('posts')
        .select('id')
        .eq('user_id', user.id)
        .eq('status', 'visible');

      if (postsData) {
        const postIds = postsData.map(p => p.id);
        
        if (postIds.length > 0) {
          const votePromises = postIds.map(postId => 
            supabase.rpc('get_vote_counts', { post_uuid: postId })
          );
          
          const voteResults = await Promise.all(votePromises);
          
          let totalUpvotes = 0;
          let totalDownvotes = 0;
          
          voteResults.forEach(result => {
            if (result.data && typeof result.data === 'object') {
              const voteData = result.data as { upvotes?: number; downvotes?: number };
              totalUpvotes += voteData.upvotes || 0;
              totalDownvotes += voteData.downvotes || 0;
            }
          });
          
          setStats({
            totalPosts: postsData.length,
            totalUpvotes,
            totalDownvotes
          });
        }
      }
    } catch (error) {
      console.error('Error fetching user stats:', error);
    }
  };

  const handleUpdateProfile = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          username: profile.username,
          bio: profile.bio
        })
        .eq('id', user.id);

      if (error) throw error;

      toast({ title: "Success", description: "Profile updated successfully" });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({ title: "Error", description: "Failed to update profile", variant: "destructive" });
    }
  };

  const handleVote = async (postId: string, voteType: "upvote" | "downvote") => {
    toast({ title: "Info", description: "Voting functionality would be implemented here" });
  };

  const handleSave = async (postId: string) => {
    toast({ title: "Info", description: "Save functionality would be implemented here" });
  };

  const handleReport = async (postId: string) => {
    toast({ title: "Info", description: "Report functionality would be implemented here" });
  };

  const handleDelete = async (postId: string) => {
    toast({ title: "Info", description: "Delete functionality would be implemented here" });
  };

  const handleEdit = async (postId: string, content: string) => {
    toast({ title: "Info", description: "Edit functionality would be implemented here" });
  };

  if (!user) {
    return (
      <Layout customTitle="My Profile" showBackButton>
        <div className="container mx-auto px-4 py-6">
          <div className="text-center py-12">
            <p className="text-muted-foreground">Please log in to view your profile</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (loading) {
    return (
      <Layout customTitle="My Profile" showBackButton>
        <div className="container mx-auto px-4 py-6">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading your profile...</p>
          </div>
        </div>
      </Layout>
    );
  }

  const avatarColor = getRandomAvatarColor(profile.username);

  return (
    <Layout customTitle="My Profile" showBackButton>
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border rounded-lg p-6 mb-6"
        >
          <div className="flex items-start gap-6">
            <Avatar className="h-24 w-24">
              <AvatarFallback className={`${avatarColor} text-white text-2xl font-bold`}>
                {getAvatarInitials(profile.username)}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      value={profile.username}
                      onChange={(e) => setProfile(prev => ({ ...prev, username: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="bio">Bio</Label>
                    <Input
                      id="bio"
                      value={profile.bio}
                      onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
                      placeholder="Tell us about yourself..."
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleUpdateProfile} size="sm">Save</Button>
                    <Button onClick={() => setIsEditing(false)} variant="outline" size="sm">Cancel</Button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-2xl font-bold">{profile.username}</h1>
                    <Button
                      onClick={() => setIsEditing(true)}
                      variant="ghost"
                      size="sm"
                      className="opacity-70 hover:opacity-100"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-muted-foreground">{profile.bio || "No bio yet"}</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Stats */}
          <div className="flex gap-6 mt-6 pt-6 border-t border-border">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              <div>
                <div className="text-xl font-bold">{stats.totalPosts}</div>
                <div className="text-sm text-muted-foreground">Posts</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
              <div>
                <div className="text-xl font-bold text-green-500">{stats.totalUpvotes}</div>
                <div className="text-sm text-muted-foreground">Upvotes</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-red-500" />
              <div>
                <div className="text-xl font-bold text-red-500">{stats.totalDownvotes}</div>
                <div className="text-sm text-muted-foreground">Downvotes</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Posts */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Your Posts</h2>
          {userPosts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">You haven't created any posts yet</p>
            </div>
          ) : (
            userPosts.map((post, index) => (
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
                  onVote={handleVote}
                  onSave={handleSave}
                  onReport={handleReport}
                  onDelete={handleDelete}
                  onEdit={handleEdit}
                  showNSFW={true}
                  onUsernameClick={() => {}}
                />
              </motion.div>
            ))
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
