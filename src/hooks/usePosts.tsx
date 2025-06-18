import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";
import { useQueryClient } from "react-query";

export interface Post {
  id: string;
  title: string;
  content: any;
  tags: Array<{ emoji: string; name: string }>;
  upvotes: number;
  downvotes: number;
  username: string;
  isAnonymous: boolean;
  createdAt: string;
  isNSFW: boolean;
  userVote: "upvote" | "downvote" | null;
  isSaved: boolean;
  user_id: string;
}

interface VoteCounts {
  upvotes: number;
  downvotes: number;
}

export const usePosts = (sortBy: "hot" | "new" | "top" = "hot", selectedTags: string[] = []) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = async () => {
    try {
      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select(`
          *,
          post_tags(
            tags(name, emoji, is_sensitive)
          )
        `)
        .eq('status', 'visible')
        .order('created_at', { ascending: false });

      if (postsError) throw postsError;

      const postsWithVotes = await Promise.all(
        postsData.map(async (post) => {
          const { data: voteCountsData } = await supabase
            .rpc('get_vote_counts', { post_uuid: post.id });

          const voteCounts = (voteCountsData as unknown) as VoteCounts;

          let userVote = null;
          if (user) {
            const { data: voteData } = await supabase
              .from('votes')
              .select('vote_type')
              .eq('post_id', post.id)
              .eq('user_id', user.id)
              .maybeSingle();
            
            userVote = voteData?.vote_type || null;
          }

          let isSaved = false;
          if (user) {
            const { data: savedData } = await supabase
              .from('saved_posts')
              .select('id')
              .eq('post_id', post.id)
              .eq('user_id', user.id)
              .maybeSingle();
            
            isSaved = !!savedData;
          }

          let username = "Anonymous";
          if (!post.is_anonymous && post.user_id) {
            const { data: profileData } = await supabase
              .from('profiles')
              .select('username')
              .eq('id', post.user_id)
              .maybeSingle();
            
            username = profileData?.username || "Unknown";
          }

          // Convert JSON content to text for display
          let displayContent = "";
          try {
            if (typeof post.content === 'string') {
              const contentObj = JSON.parse(post.content);
              if (contentObj.content && Array.isArray(contentObj.content)) {
                displayContent = contentObj.content
                  .map((node: any) => {
                    if (node.content && Array.isArray(node.content)) {
                      return node.content
                        .map((textNode: any) => textNode.text || '')
                        .join('');
                    }
                    return '';
                  })
                  .join('\n');
              }
            } else {
              displayContent = JSON.stringify(post.content);
            }
          } catch (error) {
            console.error('Error parsing content:', error);
            displayContent = post.content?.toString() || "";
          }

          return {
            id: post.id,
            title: post.title || "Untitled",
            content: displayContent,
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
            userVote,
            isSaved,
            user_id: post.user_id
          };
        })
      );

      setPosts(postsWithVotes);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast.error('Failed to load posts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, [user]);

  const deletePost = async (postId: string) => {
    if (!user) {
      toast.error("Please log in to delete posts");
      return;
    }

    try {
      // First check if the user owns this post
      const postToDelete = posts.find(p => p.id === postId);
      if (!postToDelete || postToDelete.user_id !== user.id) {
        toast.error("You can only delete your own posts");
        return;
      }

      const { error } = await supabase
        .from('posts')
        .update({ status: 'deleted' })
        .eq('id', postId)
        .eq('user_id', user.id);

      if (error) throw error;

      // Remove the post from local state immediately
      setPosts(prevPosts => prevPosts.filter(p => p.id !== postId));
      toast.success("Post deleted successfully");
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error('Failed to delete post');
    }
  };

  const createPost = async (postData: { 
    title: string;
    content: any;
    tags: string[];
    isAnonymous: boolean;
  }) => {
    if (!user) throw new Error("Must be logged in to create posts");

    const { data, error } = await supabase
      .from('posts')
      .insert({
        title: postData.title,
        content: postData.content,
        user_id: user.id,
        is_anonymous: postData.isAnonymous,
        status: 'visible'
      })
      .select()
      .single();

    if (error) throw error;

    // Add tags
    if (postData.tags.length > 0) {
      const tagInserts = postData.tags.map(tagId => ({
        post_id: data.id,
        tag_id: tagId
      }));

      const { error: tagError } = await supabase
        .from('post_tags')
        .insert(tagInserts);

      if (tagError) throw tagError;
    }

    return data;
  };

  const vote = async (postId: string, voteType: "upvote" | "downvote") => {
    if (!user) {
      toast.error("Please log in to vote");
      return;
    }

    try {
      const { data: existingVote } = await supabase
        .from('votes')
        .select('vote_type')
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (existingVote) {
        if (existingVote.vote_type === voteType) {
          await supabase
            .from('votes')
            .delete()
            .eq('post_id', postId)
            .eq('user_id', user.id);
        } else {
          await supabase
            .from('votes')
            .update({ vote_type: voteType })
            .eq('post_id', postId)
            .eq('user_id', user.id);
        }
      } else {
        await supabase
          .from('votes')
          .insert({
            post_id: postId,
            user_id: user.id,
            vote_type: voteType,
            is_anonymous: false
          });
      }

      await fetchPosts();
    } catch (error) {
      console.error('Error voting:', error);
      toast.error('Failed to vote');
    }
  };

  const savePost = async (postId: string) => {
    if (!user) {
      toast.error("Please log in to save posts");
      return;
    }

    try {
      const { data: existingSave } = await supabase
        .from('saved_posts')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (existingSave) {
        await supabase
          .from('saved_posts')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', user.id);
        toast.success("Post removed from library");
      } else {
        await supabase
          .from('saved_posts')
          .insert({
            post_id: postId,
            user_id: user.id
          });
        toast.success("Post saved to library! 📌");
      }

      await fetchPosts();
    } catch (error) {
      console.error('Error saving post:', error);
      toast.error('Failed to save post');
    }
  };

  const reportPost = async (postId: string) => {
    try {
      await supabase
        .from('reports')
        .insert({
          post_id: postId,
          user_id: user?.id || null,
          ip_hash: user ? null : 'anonymous_' + Date.now()
        });

      toast.success("Post reported. Thanks for keeping Roastr clean! 🚫");
    } catch (error) {
      console.error('Error reporting post:', error);
      toast.error('Failed to report post');
    }
  };

  const editPost = async (postId: string, newContent: string) => {
    if (!user) {
      toast.error("Please log in to edit posts");
      return;
    }

    try {
      // First check if the user owns this post
      const postToEdit = posts.find(p => p.id === postId);
      if (!postToEdit || postToEdit.user_id !== user.id) {
        toast.error("You can only edit your own posts");
        return;
      }

      // Get current post data
      const { data: currentPost, error: fetchError } = await supabase
        .from('posts')
        .select('content, edit_history')
        .eq('id', postId)
        .single();

      if (fetchError) throw fetchError;

      // Prepare edit history
      const editHistory = [
        ...(currentPost.edit_history || []),
        {
          content: currentPost.content,
          timestamp: new Date().toISOString()
        }
      ];

      // Update post with new content and edit history
      const { error: updateError } = await supabase
        .from('posts')
        .update({
          content: newContent,
          edit_history: editHistory,
          updated_at: new Date().toISOString()
        })
        .eq('id', postId)
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      // Update local state
      setPosts(prevPosts =>
        prevPosts.map(p =>
          p.id === postId
            ? {
                ...p,
                content: newContent,
                editHistory: editHistory
              }
            : p
        )
      );

      toast.success("Post updated successfully");
    } catch (error) {
      console.error('Error editing post:', error);
      toast.error('Failed to edit post');
      throw error;
    }
  };

  return {
    data: posts,
    isLoading: loading,
    error: null,
    vote,
    createPost,
    deletePost,
    savePost,
    unsavePost,
    reportPost,
    refetch: fetchPosts
  };
};

export default usePosts;
