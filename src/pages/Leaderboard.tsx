
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Medal, Award, Crown, TrendingUp, Star, Hash, Users } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

interface LeaderboardUser {
  rank: number;
  username: string;
  score: number;
  posts: number;
  upvotes: number;
  ratio?: number;
}

interface TopPost {
  id: string;
  title: string;
  content: string;
  username: string;
  upvotes: number;
  created_at: string;
  tags: Array<{ emoji: string; name: string }>;
}

interface TagRanking {
  name: string;
  emoji: string;
  usage_count: number;
  total_upvotes: number;
}

const Leaderboard = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("daily");
  const [selectedView, setSelectedView] = useState("users");
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [topPosts, setTopPosts] = useState<TopPost[]>([]);
  const [tagRankings, setTagRankings] = useState<TagRanking[]>([]);
  const [loading, setLoading] = useState(true);

  const periods = [
    { value: "daily", label: "Daily", icon: Star },
    { value: "weekly", label: "Weekly", icon: TrendingUp },
    { value: "monthly", label: "Monthly", icon: Award },
    { value: "yearly", label: "Yearly", icon: Medal },
    { value: "alltime", label: "All Time", icon: Crown }
  ];

  useEffect(() => {
    fetchLeaderboardData();
  }, [selectedPeriod]);

  const fetchLeaderboardData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchTopUsers(),
        fetchTopPosts(),
        fetchTagRankings()
      ]);
    } catch (error) {
      console.error('Error fetching leaderboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDateFilter = () => {
    const now = new Date();
    switch (selectedPeriod) {
      case "daily":
        const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        return dayAgo.toISOString();
      case "weekly":
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return weekAgo.toISOString();
      case "monthly":
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return monthAgo.toISOString();
      case "yearly":
        const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        return yearAgo.toISOString();
      default:
        return "1970-01-01T00:00:00.000Z";
    }
  };

  const fetchTopUsers = async () => {
    try {
      const dateFilter = getDateFilter();
      
      // Get users with their post counts and upvotes
      const { data: userData, error } = await supabase
        .from('profiles')
        .select(`
          id,
          username,
          created_at
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const userStats = await Promise.all(
        userData.map(async (user) => {
          // Get post count
          const { data: posts } = await supabase
            .from('posts')
            .select('id')
            .eq('user_id', user.id)
            .eq('status', 'visible')
            .gte('created_at', dateFilter);

          // Get total upvotes
          const { data: votes } = await supabase
            .from('votes')
            .select('vote_type')
            .eq('user_id', user.id)
            .eq('vote_type', 'upvote')
            .gte('created_at', dateFilter);

          const postCount = posts?.length || 0;
          const upvotes = votes?.length || 0;
          const score = postCount * 5 + upvotes * 2;

          return {
            username: user.username,
            score,
            posts: postCount,
            upvotes: upvotes,
            ratio: postCount > 0 ? upvotes / postCount : 0
          };
        })
      );

      const sortedUsers = userStats
        .filter(user => user.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 10)
        .map((user, index) => ({
          rank: index + 1,
          ...user
        }));

      setUsers(sortedUsers);
    } catch (error) {
      console.error('Error fetching top users:', error);
    }
  };

  const fetchTopPosts = async () => {
    try {
      const dateFilter = getDateFilter();
      
      const { data: postsData, error } = await supabase
        .from('posts')
        .select(`
          *,
          post_tags(
            tags(name, emoji)
          )
        `)
        .eq('status', 'visible')
        .gte('created_at', dateFilter)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const postsWithVotes = await Promise.all(
        postsData.map(async (post) => {
          const { data: voteData } = await supabase
            .rpc('get_vote_counts', { post_uuid: post.id });

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
            upvotes: voteData?.upvotes || 0,
            created_at: post.created_at,
            tags: post.post_tags.map((pt: any) => ({
              emoji: pt.tags.emoji,
              name: pt.tags.name
            }))
          };
        })
      );

      const sortedPosts = postsWithVotes
        .sort((a, b) => b.upvotes - a.upvotes)
        .slice(0, 10);

      setTopPosts(sortedPosts);
    } catch (error) {
      console.error('Error fetching top posts:', error);
    }
  };

  const fetchTagRankings = async () => {
    try {
      const { data: tagsData, error } = await supabase
        .from('tags')
        .select('*');

      if (error) throw error;

      const tagStats = await Promise.all(
        tagsData.map(async (tag) => {
          // Count usage
          const { data: usage } = await supabase
            .from('post_tags')
            .select('post_id')
            .eq('tag_id', tag.id);

          // Count total upvotes for posts with this tag
          const { data: upvoteData } = await supabase
            .from('votes')
            .select('post_id')
            .eq('vote_type', 'upvote')
            .in('post_id', usage?.map(u => u.post_id) || []);

          return {
            name: tag.name,
            emoji: tag.emoji,
            usage_count: usage?.length || 0,
            total_upvotes: upvoteData?.length || 0
          };
        })
      );

      const sortedTags = tagStats
        .sort((a, b) => b.usage_count - a.usage_count)
        .slice(0, 10);

      setTagRankings(sortedTags);
    } catch (error) {
      console.error('Error fetching tag rankings:', error);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Award className="w-6 h-6 text-amber-600" />;
      default:
        return <span className="w-6 h-6 flex items-center justify-center text-sm font-bold text-muted-foreground">#{rank}</span>;
    }
  };

  const getRankBadgeColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-gradient-to-r from-yellow-400 to-yellow-600 text-white";
      case 2:
        return "bg-gradient-to-r from-gray-300 to-gray-500 text-white";
      case 3:
        return "bg-gradient-to-r from-amber-400 to-amber-600 text-white";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  if (loading) {
    return (
      <Layout customTitle="Leaderboard" showBackButton>
        <div className="container mx-auto px-4 py-6 max-w-4xl">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout customTitle="Leaderboard" showBackButton>
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-2">🏆 Leaderboard</h1>
            <p className="text-muted-foreground">Top roasters and their epic burns</p>
          </div>

          {/* Period Selector */}
          <Card>
            <CardHeader>
              <CardTitle className="text-center">Select Time Period</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {periods.map((period) => {
                  const Icon = period.icon;
                  return (
                    <Button
                      key={period.value}
                      variant={selectedPeriod === period.value ? "default" : "outline"}
                      onClick={() => setSelectedPeriod(period.value)}
                      className="flex flex-col items-center gap-2 h-16"
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-xs">{period.label}</span>
                    </Button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* View Tabs */}
          <Tabs value={selectedView} onValueChange={setSelectedView} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="users" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Top Users
              </TabsTrigger>
              <TabsTrigger value="posts" className="flex items-center gap-2">
                <Trophy className="w-4 h-4" />
                Top Posts
              </TabsTrigger>
              <TabsTrigger value="tags" className="flex items-center gap-2">
                <Hash className="w-4 h-4" />
                Tag Rankings
              </TabsTrigger>
            </TabsList>

            <TabsContent value="users" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-yellow-500" />
                    {periods.find(p => p.value === selectedPeriod)?.label} Top Users
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {users.length === 0 ? (
                    <p className="text-center text-muted-foreground">No users found for this period</p>
                  ) : (
                    users.map((user) => (
                      <div
                        key={user.rank}
                        className={cn(
                          "flex items-center gap-4 p-4 rounded-lg border transition-colors hover:bg-accent/50",
                          user.rank <= 3 ? "bg-accent/20" : "bg-background"
                        )}
                      >
                        <div className="flex-shrink-0">
                          {getRankIcon(user.rank)}
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-lg">{user.username}</h3>
                            <Badge className={cn("text-xs", getRankBadgeColor(user.rank))}>
                              Rank #{user.rank}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>📝 {user.posts} posts</span>
                            <span>👍 {user.upvotes} upvotes</span>
                            <span>📊 {user.ratio?.toFixed(1)} ratio</span>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-2xl font-bold text-primary">{user.score}</div>
                          <div className="text-xs text-muted-foreground">points</div>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="posts" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-yellow-500" />
                    {periods.find(p => p.value === selectedPeriod)?.label} Top Posts
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {topPosts.length === 0 ? (
                    <p className="text-center text-muted-foreground">No posts found for this period</p>
                  ) : (
                    topPosts.map((post, index) => (
                      <div
                        key={post.id}
                        className="p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {getRankIcon(index + 1)}
                            <h3 className="font-semibold">{post.title}</h3>
                            <div className="flex gap-1">
                              {post.tags.map((tag, tagIndex) => (
                                <span key={tagIndex} className="text-sm">
                                  {tag.emoji}
                                </span>
                              ))}
                            </div>
                          </div>
                          <Badge variant="secondary">
                            👍 {post.upvotes}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          By {post.username} • {new Date(post.created_at).toLocaleDateString()}
                        </p>
                        <p className="text-sm line-clamp-2">{post.content}</p>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tags" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Hash className="w-5 h-5 text-primary" />
                    Most Popular Tags
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {tagRankings.map((tag, index) => (
                    <div
                      key={tag.name}
                      className="flex items-center gap-4 p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex-shrink-0">
                        {getRankIcon(index + 1)}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{tag.emoji}</span>
                        <div>
                          <h3 className="font-semibold">{tag.name}</h3>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>📝 {tag.usage_count} uses</span>
                            <span>👍 {tag.total_upvotes} upvotes</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Scoring Info */}
          <Card>
            <CardHeader>
              <CardTitle>How Scoring Works</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl mb-2">📝</div>
                <h3 className="font-semibold">Post Creation</h3>
                <p className="text-sm text-muted-foreground">+5 points per post</p>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-2">👍</div>
                <h3 className="font-semibold">Upvotes</h3>
                <p className="text-sm text-muted-foreground">+2 points per upvote</p>
              </div>
              <div className="text-center">
                <div className="text-2xl mb-2">🔥</div>
                <h3 className="font-semibold">Trending Posts</h3>
                <p className="text-sm text-muted-foreground">+10 bonus points</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Leaderboard;
