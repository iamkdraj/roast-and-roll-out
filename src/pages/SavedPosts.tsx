
import { useState, useEffect } from "react";
import { PostCard } from "@/components/PostCard";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Layout } from "@/components/Layout";
import { useToast } from "@/hooks/use-toast";
import { Post } from "@/hooks/usePosts";
import { Bookmark } from "lucide-react";

const SavedPosts = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [savedPosts, setSavedPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchSavedPosts();
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

  const fetchSavedPosts = async () => {
    if (!user) return;

    try {
      const { data: savedData, error } = await supabase
        .from('saved_posts')
        .select(`
          posts (
            *,
            post_tags (
              tags (name, emoji, is_sensitive)
            )
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const postsWithVotes = await Promise.all(
        savedData.map(async (saved: any) => {
          const post = saved.posts;
          
          const { data: voteCountsData } = await supabase
            .rpc('get_vote_counts', { post_uuid: post.id });

          const voteCounts = voteCountsData as any;

          const { data: voteData } = await supabase
            .from('votes')
            .select('vote_type')
            .eq('post_id', post.id)
            .eq('user_id', user.id)
            .maybeSingle();

          let username = "Anonymous";
          if (!post.is_anonymous && post.user_id) {
            const { data: profileData } = await supabase
              .from('profiles')
              .select('username')
              .eq('id', post.user_id)
              .maybeSingle();
            
            username = profileData?.username || "Unknown";
          }

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
            username,
            isAnonymous: post.is_anonymous,
            createdAt: post.created_at,
            isNSFW: post.post_tags.some((pt: any) => pt.tags.is_sensitive),
            userVote: (voteData?.vote_type as "upvote" | "downvote") || null,
            isSaved: true,
            user_id: post.user_id
          };
        })
      );

      setSavedPosts(postsWithVotes);
    } catch (error) {
      console.error('Error fetching saved posts:', error);
      toast({ title: "Error", description: "Failed to load saved posts", variant: "destructive" });
    } finally {
      setLoading(false);
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
      <Layout customTitle="Saved Posts" showBackButton>
        <div className="container mx-auto px-4 py-6">
          <div className="text-center py-12">
            <p className="text-muted-foreground">Please log in to view saved posts</p>
          </div>
        </div>
      </Layout>
    );
  }

  if (loading) {
    return (
      <Layout customTitle="Saved Posts" showBackButton>
        <div className="container mx-auto px-4 py-6">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading saved posts...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout customTitle="Saved Posts" showBackButton>
      <div className="container mx-auto px-4 py-6">
        {savedPosts.length === 0 ? (
          <div className="text-center py-12">
            <Bookmark className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground text-lg">No saved posts yet</p>
            <p className="text-muted-foreground text-sm">Save posts you love to read them later!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {savedPosts.map((post, index) => (
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
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default SavedPosts;
