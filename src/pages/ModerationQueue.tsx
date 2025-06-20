
import { useState, useEffect } from "react";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye, EyeOff, Flag, Check, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface ReportedPost {
  id: string;
  title: string;
  content: string;
  username: string;
  created_at: string;
  report_count: number;
  status: string;
  tags: Array<{ emoji: string; name: string }>;
}

const ModerationQueue = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [reportedPosts, setReportedPosts] = useState<ReportedPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkModeratorAccess();
    fetchReportedPosts();
  }, [user]);

  const checkModeratorAccess = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (!profile || !['moderator', 'admin', 'superadmin'].includes(profile.role)) {
      toast.error("Access denied. Moderator privileges required.");
      navigate('/');
      return;
    }
  };

  const fetchReportedPosts = async () => {
    try {
      // Get posts with reports count
      const { data: postsData, error } = await supabase
        .from('posts')
        .select(`
          *,
          post_tags(
            tags(name, emoji)
          )
        `)
        .in('status', ['visible', 'hidden_reported'])
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get report counts for each post
      const postsWithReports = await Promise.all(
        postsData.map(async (post) => {
          const { data: reportData } = await supabase
            .from('reports')
            .select('id')
            .eq('post_id', post.id);

          let username = "Anonymous";
          if (!post.is_anonymous && post.user_id) {
            const { data: profileData } = await supabase
              .from('profiles')
              .select('username')
              .eq('id', post.user_id)
              .single();
            
            username = profileData?.username || "Unknown";
          }

          const contentString = typeof post.content === 'string' 
            ? post.content 
            : JSON.stringify(post.content) || "";

          return {
            id: post.id,
            title: post.title || "Untitled",
            content: contentString,
            username,
            created_at: post.created_at,
            report_count: reportData?.length || 0,
            status: post.status,
            tags: post.post_tags.map((pt: any) => ({
              emoji: pt.tags.emoji,
              name: pt.tags.name
            }))
          };
        })
      );

      // Filter posts with reports or already hidden
      const filteredPosts = postsWithReports.filter(post => 
        post.report_count > 0 || post.status === 'hidden_reported'
      );

      setReportedPosts(filteredPosts);
    } catch (error) {
      console.error('Error fetching reported posts:', error);
      toast.error('Failed to load reported posts');
    } finally {
      setLoading(false);
    }
  };

  const hidePost = async (postId: string) => {
    try {
      const { error } = await supabase
        .from('posts')
        .update({ status: 'hidden_manual' })
        .eq('id', postId);

      if (error) throw error;

      setReportedPosts(prev => prev.filter(p => p.id !== postId));
      toast.success("Post hidden successfully");
    } catch (error) {
      console.error('Error hiding post:', error);
      toast.error('Failed to hide post');
    }
  };

  const restorePost = async (postId: string) => {
    try {
      const { error } = await supabase
        .from('posts')
        .update({ status: 'visible' })
        .eq('id', postId);

      if (error) throw error;

      // Clear reports for this post
      await supabase
        .from('reports')
        .delete()
        .eq('post_id', postId);

      setReportedPosts(prev => prev.filter(p => p.id !== postId));
      toast.success("Post restored successfully");
    } catch (error) {
      console.error('Error restoring post:', error);
      toast.error('Failed to restore post');
    }
  };

  if (loading) {
    return (
      <Layout customTitle="Moderation Queue" showBackButton>
        <div className="container mx-auto px-4 py-6 max-w-4xl">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout customTitle="Moderation Queue" showBackButton>
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-2">🚨 Moderation Queue</h1>
            <p className="text-muted-foreground">Review reported posts and manage content</p>
          </div>

          {/* Posts List */}
          {reportedPosts.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Flag className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No reported posts</h3>
                <p className="text-muted-foreground">All posts are clean! 🎉</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {reportedPosts.map((post) => (
                <Card key={post.id} className="overflow-hidden">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <CardTitle className="text-lg">{post.title}</CardTitle>
                        <div className="flex gap-1">
                          {post.tags.map((tag, index) => (
                            <span key={index} className="text-sm">
                              {tag.emoji}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={post.report_count >= 100 ? "destructive" : "secondary"}
                        >
                          {post.report_count} reports
                        </Badge>
                        {post.status === 'hidden_reported' && (
                          <Badge variant="outline" className="text-orange-500 border-orange-500">
                            <EyeOff className="w-3 h-3 mr-1" />
                            Hidden
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      By {post.username} • {new Date(post.created_at).toLocaleDateString()}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="mb-4">
                      <p className="text-sm whitespace-pre-wrap">{post.content}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => hidePost(post.id)}
                      >
                        <X className="w-4 h-4 mr-1" />
                        Hide Post
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => restorePost(post.id)}
                      >
                        <Check className="w-4 h-4 mr-1" />
                        Restore & Clear Reports
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ModerationQueue;
