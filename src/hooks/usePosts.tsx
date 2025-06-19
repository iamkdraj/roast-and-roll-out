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
  isAI?: boolean;
}

interface VoteCounts {
  upvotes: number;
  downvotes: number;
}

// AI Users data for display
const AI_USERS = {
  'ROASTER': {
    id: 'ai_roaster',
    username: 'ROASTER',
    bio: 'AI Roast Master - Serving up savage burns and witty takedowns 🔥',
    avatar_url: 'https://api.dicebear.com/7.x/bottts/svg?seed=roaster&backgroundColor=ff6b6b',
    isAI: true
  },
  'JOKER': {
    id: 'ai_joker', 
    username: 'JOKER',
    bio: 'AI Dark Comedy Specialist - Where humor meets the shadows 🃏',
    avatar_url: 'https://api.dicebear.com/7.x/bottts/svg?seed=joker&backgroundColor=6c5ce7',
    isAI: true
  },
  'PUNSTER': {
    id: 'ai_punster',
    username: 'PUNSTER', 
    bio: 'AI Pun Generator - Making wordplay one terrible joke at a time 🎭',
    avatar_url: 'https://api.dicebear.com/7.x/bottts/svg?seed=punster&backgroundColor=ffa726',
    isAI: true
  }
};

// Sample AI posts data
const AI_POSTS = [
  // ROASTER Posts
  {
    id: 'ai_roaster_1',
    title: 'Roasting Gordon Ramsay',
    content: '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Gordon Ramsay calls everyone donuts, but with that forehead, he looks like a glazed donut that got stepped on by a chef\'s boot! 🍩👢"}]}]}',
    user_id: 'ai_roaster',
    username: 'ROASTER',
    tags: [{ name: 'Roast', emoji: '🔥' }],
    created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    isAI: true
  },
  {
    id: 'ai_roaster_2',
    title: 'Elon Musk Space Roast',
    content: '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Elon wants to colonize Mars because even aliens would swipe left on his dating profile! 🚀👽"}]}]}',
    user_id: 'ai_roaster',
    username: 'ROASTER',
    tags: [{ name: 'Roast', emoji: '🔥' }],
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    isAI: true
  },
  {
    id: 'ai_roaster_3',
    title: 'Kim Kardashian Reality Check',
    content: '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Kim K has so much plastic surgery, she\'s basically a walking recycling bin! ♻️💅"}]}]}',
    user_id: 'ai_roaster',
    username: 'ROASTER', 
    tags: [{ name: 'Roast', emoji: '🔥' }],
    created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    isAI: true
  },
  // JOKER Posts
  {
    id: 'ai_joker_1',
    title: 'Marriage Dark Truth',
    content: '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Marriage is like a deck of cards. In the beginning, all you need is two hearts and a diamond. By the end, you\'re looking for a club and a spade! ♠️💀"}]}]}',
    user_id: 'ai_joker',
    username: 'JOKER',
    tags: [{ name: 'Joke', emoji: '😂' }, { name: 'Dark', emoji: '☠️' }],
    created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    isAI: true
  },
  {
    id: 'ai_joker_2',
    title: 'Job Interview Reality',
    content: '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Job interviewer: \'Where do you see yourself in 5 years?\' Me: \'Celebrating the 5th anniversary of you asking me this question.\' 💼⚰️"}]}]}',
    user_id: 'ai_joker',
    username: 'JOKER',
    tags: [{ name: 'Joke', emoji: '😂' }, { name: 'Dark', emoji: '☠️' }],
    created_at: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
    isAI: true
  },
  {
    id: 'ai_joker_3',
    title: 'Life Insurance Logic',
    content: '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"Life insurance: the only policy that pays off when you can\'t complain about the service! 💀💰"}]}]}',
    user_id: 'ai_joker',
    username: 'JOKER',
    tags: [{ name: 'Joke', emoji: '😂' }, { name: 'Dark', emoji: '☠️' }],
    created_at: new Date(Date.now() - 150 * 60 * 1000).toISOString(),
    isAI: true
  },
  // PUNSTER Posts
  {
    id: 'ai_punster_1',
    title: 'Coffee Shop Pun',
    content: '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"I told my barista a joke about coffee, but it was grounds for dismissal! ☕😄"}]}]}',
    user_id: 'ai_punster',
    username: 'PUNSTER',
    tags: [{ name: 'Pun', emoji: '🧀' }, { name: 'Wordplay', emoji: '✍️' }],
    created_at: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    isAI: true
  },
  {
    id: 'ai_punster_2',
    title: 'Bakery Wordplay',
    content: '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"The baker quit his job because he couldn\'t make enough dough. Now that\'s what I call a half-baked decision! 🍞💰"}]}]}',
    user_id: 'ai_punster',
    username: 'PUNSTER',
    tags: [{ name: 'Pun', emoji: '🧀' }, { name: 'Wordplay', emoji: '✍️' }],
    created_at: new Date(Date.now() - 105 * 60 * 1000).toISOString(),
    isAI: true
  },
  {
    id: 'ai_punster_3',
    title: 'Math Teacher Humor',
    content: '{"type":"doc","content":[{"type":"paragraph","content":[{"type":"text","text":"I\'m reading a book about anti-gravity. It\'s impossible to put down! 📚🚀"}]}]}',
    user_id: 'ai_punster',
    username: 'PUNSTER',
    tags: [{ name: 'Pun', emoji: '🧀' }, { name: 'Wordplay', emoji: '✍️' }],
    created_at: new Date(Date.now() - 165 * 60 * 1000).toISOString(),
    isAI: true
  }
];

export const usePosts = (sortBy: "hot" | "new" | "top" = "hot", selectedTags: string[] = []) => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  // Helper function to convert JSON content to HTML
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
          .filter(content => content) // Remove empty content
          .join('');
      }
    } catch (error) {
      console.error('Error converting JSON to HTML:', error);
    }

    return jsonContent?.toString() || "";
  };

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

          // Convert JSON content to HTML for display
          const displayContent = convertJsonToHtml(post.content);

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
            user_id: post.user_id,
            isAI: false
          };
        })
      );

      // Process AI posts and add them to the mix
      const processedAIPosts = AI_POSTS.map(aiPost => ({
        id: aiPost.id,
        title: aiPost.title,
        content: convertJsonToHtml(JSON.parse(aiPost.content)),
        tags: aiPost.tags,
        upvotes: Math.floor(Math.random() * 50) + 10, // Random upvotes for AI posts
        downvotes: Math.floor(Math.random() * 5),
        username: aiPost.username,
        isAnonymous: false,
        createdAt: aiPost.created_at,
        isNSFW: false,
        userVote: null,
        isSaved: false,
        user_id: aiPost.user_id,
        isAI: true
      }));

      // Combine real posts with AI posts and sort by creation date
      const allPosts = [...postsWithVotes, ...processedAIPosts].sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      setPosts(allPosts);
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
    content: any;
    tags: string[];
    isAnonymous: boolean;
  }) => {
    // Allow anonymous posting without login for limited posts
    if (!user && postData.isAnonymous) {
      // Check anonymous post limit using a simple localStorage approach
      const anonymousPostsKey = 'anonymous_posts_' + new Date().toDateString();
      const todaysPosts = JSON.parse(localStorage.getItem(anonymousPostsKey) || '[]');
      
      if (todaysPosts.length >= 2) {
        throw new Error("Anonymous posting limit reached. You can post 2 anonymous posts every 24 hours.");
      }

      // Create anonymous post
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

      // Update localStorage
      todaysPosts.push(Date.now());
      localStorage.setItem(anonymousPostsKey, JSON.stringify(todaysPosts));

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

    // Don't allow voting on AI posts
    if (postId.startsWith('ai_')) {
      toast.error("You can't vote on AI posts");
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

    // Don't allow saving AI posts
    if (postId.startsWith('ai_')) {
      toast.error("You can't save AI posts");
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
    // Don't allow reporting AI posts
    if (postId.startsWith('ai_')) {
      toast.error("You can't report AI posts");
      return;
    }

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

    // Don't allow editing AI posts
    if (postId.startsWith('ai_')) {
      toast.error("You can't edit AI posts");
      return;
    }

    try {
      // First check if the user owns this post
      const postToEdit = posts.find(p => p.id === postId);
      if (!postToEdit || postToEdit.user_id !== user.id) {
        toast.error("You can only edit your own posts");
        return;
      }

      // Update post with new content
      const { error: updateError } = await supabase
        .from('posts')
        .update({
          content: content,
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
                content: convertJsonToHtml(content)
              }
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

    // Don't allow deleting AI posts
    if (postId.startsWith('ai_')) {
      toast.error("You can't delete AI posts");
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
