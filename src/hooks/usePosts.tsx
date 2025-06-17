import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export interface Post {
  id: string;
  content: string;
  tags: { emoji: string; name: string }[];
  upvotes: number;
  downvotes: number;
  username: string;
  isAnonymous: boolean;
  createdAt: string;
  isNSFW: boolean;
  userVote?: "upvote" | "downvote" | null;
  isSaved?: boolean;
  user_id?: string;
  editHistory?: {
    content: string;
    timestamp: string;
  }[];
}

interface VoteCounts {
  upvotes: number;
  downvotes: number;
}

export const usePosts = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

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

          return {
            id: post.id,
            content: post.content,
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

  const createPost = async (content: string, tagNames: string[], isAnonymous: boolean = false) => {
    try {
      const { data: tags, error: tagsError } = await supabase
        .from('tags')
        .select('id, name')
        .in('name', tagNames);

      if (tagsError) throw tagsError;

      const { data: post, error: postError } = await supabase
        .from('posts')
        .insert({
          content,
          user_id: isAnonymous ? null : user?.id,
          is_anonymous: isAnonymous
        })
        .select()
        .single();

      if (postError) throw postError;

      const postTags = tags.map(tag => ({
        post_id: post.id,
        tag_id: tag.id
      }));

      const { error: tagError } = await supabase
        .from('post_tags')
        .insert(postTags);

      if (tagError) throw tagError;

      await fetchPosts();
      toast.success("Post created successfully! 🔥");
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error('Failed to create post');
    }
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
    posts,
    loading,
    createPost,
    vote,
    savePost,
    reportPost,
    deletePost,
    editPost,
    refreshPosts: fetchPosts
  };
};
