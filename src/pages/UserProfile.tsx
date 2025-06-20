
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, TrendingUp, TrendingDown, FileText } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { PostCard } from "@/components/PostCard";
import { Post } from "@/hooks/usePosts";
import { getRandomAvatarColor, getAvatarInitials } from "@/utils/avatarUtils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Layout } from "@/components/Layout";
import { motion } from "framer-motion";

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
            title: post.title || 'Untitled',
            content: convertJsonToHtml(post.content),
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

  const handleEdit = async (postId: string, content: string): Promise<void> => {
    // This will be handled by the edit modal
    return Promise.resolve();
  };

  if (loading) {
    return (
      <Layout customTitle={`${username}'s Profile`}>
        <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  const avatarColor = getRandomAvatarColor(username);

  return (
    <Layout customTitle={`${username}'s Profile`}>
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* User Info Card */}
        <Card className="stats-card">
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

        {/* Stats Cards in a Row */}
        <div className="flex gap-4 justify-center">
          <motion.div 
            className="flex flex-col items-center p-4 bg-card border border-border rounded-lg stats-card min-w-[120px]"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <FileText className="w-6 h-6 text-primary mb-2" />
            <div className="text-2xl font-bold text-primary">{stats.totalPosts}</div>
            <div className="text-sm text-muted-foreground text-center">Posts</div>
          </motion.div>
          
          <motion.div 
            className="flex flex-col items-center p-4 bg-card border border-border rounded-lg stats-card min-w-[120px]"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <TrendingUp className="w-6 h-6 text-green-500 mb-2" />
            <div className="text-2xl font-bold text-green-500">{stats.totalUpvotes}</div>
            <div className="text-sm text-muted-foreground text-center">Upvotes</div>
          </motion.div>
          
          <motion.div 
            className="flex flex-col items-center p-4 bg-card border border-border rounded-lg stats-card min-w-[120px]"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <TrendingDown className="w-6 h-6 text-red-500 mb-2" />
            <div className="text-2xl font-bold text-red-500">{stats.totalDownvotes}</div>
            <div className="text-sm text-muted-foreground text-center">Downvotes</div>
          </motion.div>
        </div>

        {/* User Posts */}
        <Card className="stats-card">
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
                {userPosts.map((post, index) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <PostCard
                      post={post}
                      onVote={() => {}}
                      onSave={() => {}}
                      onReport={() => {}}
                      onDelete={() => {}}
                      onEdit={handleEdit}
                      showNSFW={true}
                    />
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default UserProfile;
