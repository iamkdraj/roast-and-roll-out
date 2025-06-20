import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export interface Post {
  id: string;
  title: string;
  content: string;
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
  editHistory?: Array<{ content: any; timestamp: string }>;
}

interface VoteCounts {
  upvotes: number;
  downvotes: number;
}

export const usePosts = (sortBy: "hot" | "new" | "top" = "hot", selectedTags: string[] = []) => {
  const { user } = useAuth();
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

          let userVote: "upvote" | "downvote" | null = null;
          if (user) {
            const { data: voteData } = await supabase
              .from('votes')
              .select('vote_type')
              .eq('post_id', post.id)
              .eq('user_id', user.id)
              .maybeSingle();
            
            userVote = (voteData?.vote_type as "upvote" | "downvote") || null;
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

          // Ensure content is always a string
          const contentString = typeof post.content === 'string' 
            ? post.content 
            : JSON.stringify(post.content) || "";

          return {
            id: post.id,
            title: post.title || "Untitled",
            content: contentString,
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

  const createPost = async (postData: { 
    title: string;
    content: string;
    tags: string[];
    isAnonymous: boolean;
  }) => {
    if (!user && postData.isAnonymous) {
      const anonymousPostsKey = 'anonymous_posts_' + new Date().toDateString();
      const todaysPosts = JSON.parse(localStorage.getItem(anonymousPostsKey) || '[]');
      
      if (todaysPosts.length >= 2) {
        throw new Error("Anonymous posting limit reached. You can post 2 anonymous posts every 24 hours.");
      }

      const { data, error } = await supabase
        .from('posts')
        .insert({
          title: postData.title,
          content: postData.content,
          user_id: null,
          is_anonymous: true,
          status: 'visible'
        })
        .select()
        .single();

      if (error) throw error;

      todaysPosts.push(Date.now());
      localStorage.setItem(anonymousPostsKey, JSON.stringify(todaysPosts));

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
    }

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
        toast.success("Post removed from your library! 📚");
      } else {
        await supabase
          .from('saved_posts')
          .insert({
            post_id: postId,
            user_id: user.id
          });
        toast.success("Post saved to your library! 📌✨");
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

      toast.success("Post reported successfully! 🚨 Thanks for keeping Roastr clean!");
    } catch (error) {
      console.error('Error reporting post:', error);
      toast.error('Failed to report post');
    }
  };

  const editPost = async (postId: string, content: string) => {
    if (!user) {
      toast.error("Please log in to edit posts");
      return;
    }

    try {
      const postToEdit = posts.find(p => p.id === postId);
      if (!postToEdit || postToEdit.user_id !== user.id) {
        toast.error("You can only edit your own posts");
        return;
      }

      const { error: updateError } = await supabase
        .from('posts')
        .update({
          content: content,
          updated_at: new Date().toISOString()
        })
        .eq('id', postId)
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      setPosts(prevPosts =>
        prevPosts.map(p =>
          p.id === postId
            ? { ...p, content: content }
            : p
        )
      );

      toast.success("Post updated successfully! ✏️");
    } catch (error) {
      console.error('Error editing post:', error);
      toast.error('Failed to edit post');
      throw error;
    }
  };

  const deletePost = async (postId: string) => {
    if (!user) {
      toast.error("Please log in to delete posts");
      return;
    }

    try {
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

      setPosts(prevPosts => prevPosts.filter(p => p.id !== postId));
      toast.success("Post deleted successfully! 🗑️");
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error('Failed to delete post');
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
    reportPost,
    editPost,
    refetch: fetchPosts
  };
};

export default usePosts;
