
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trophy, Medal, Award, ArrowLeft, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { UserNav } from "@/components/UserNav";

interface LeaderboardUser {
  id: string;
  username: string;
  totalPosts: number;
  totalUpvotes: number;
  score: number;
}

const Leaderboard = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState("all");

  useEffect(() => {
    fetchLeaderboard();
  }, [timeframe]);

  const getDateFilter = () => {
    const now = new Date();
    switch (timeframe) {
      case "daily":
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        return yesterday.toISOString();
      case "weekly":
        const weekAgo = new Date(now);
        weekAgo.setDate(weekAgo.getDate() - 7);
        return weekAgo.toISOString();
      case "monthly":
        const monthAgo = new Date(now);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        return monthAgo.toISOString();
      case "yearly":
        const yearAgo = new Date(now);
        yearAgo.setFullYear(yearAgo.getFullYear() - 1);
        return yearAgo.toISOString();
      default:
        return null;
    }
  };

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const dateFilter = getDateFilter();
      
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, username');

      if (profiles) {
        const leaderboardData = await Promise.all(
          profiles.map(async (profile) => {
            let postQuery = supabase
              .from('posts')
              .select('*', { count: 'exact', head: true })
              .eq('user_id', profile.id)
              .eq('status', 'visible');
            
            if (dateFilter) {
              postQuery = postQuery.gte('created_at', dateFilter);
            }
            
            const { count: postCount } = await postQuery;

            let postsQuery = supabase
              .from('posts')
              .select('id')
              .eq('user_id', profile.id)
              .eq('status', 'visible');
            
            if (dateFilter) {
              postsQuery = postsQuery.gte('created_at', dateFilter);
            }
            
            const { data: posts } = await postsQuery;

            let totalUpvotes = 0;
            if (posts) {
              for (const post of posts) {
                let voteQuery = supabase
                  .from('votes')
                  .select('*', { count: 'exact', head: true })
                  .eq('post_id', post.id)
                  .eq('vote_type', 'upvote');
                
                if (dateFilter) {
                  voteQuery = voteQuery.gte('created_at', dateFilter);
                }
                
                const { count: upvoteCount } = await voteQuery;
                totalUpvotes += upvoteCount || 0;
              }
            }

            return {
              id: profile.id,
              username: profile.username,
              totalPosts: postCount || 0,
              totalUpvotes,
              score: (totalUpvotes * 2) + (postCount || 0)
            };
          })
        );

        const sortedUsers = leaderboardData
          .filter(user => user.score > 0)
          .sort((a, b) => b.score - a.score)
          .slice(0, 20);

        setUsers(sortedUsers);
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0: return <Trophy className="w-6 h-6 text-yellow-500" />;
      case 1: return <Medal className="w-6 h-6 text-gray-400" />;
      case 2: return <Award className="w-6 h-6 text-amber-600" />;
      default: return <span className="w-6 h-6 flex items-center justify-center text-lg font-bold text-muted-foreground">#{index + 1}</span>;
    }
  };

  const getTimeframeLabel = () => {
    switch (timeframe) {
      case "daily": return "Daily";
      case "weekly": return "Weekly";
      case "monthly": return "Monthly";
      case "yearly": return "Yearly";
      default: return "All Time";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card/80 backdrop-blur-sm border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-center relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/")}
              className="absolute left-0 md:hidden text-primary p-2"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-2xl font-bold text-primary">Leaderboard</h1>
            <div className="absolute right-0">
              <UserNav />
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Timeframe Filter */}
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-primary" />
                <span className="font-medium text-foreground">Timeframe:</span>
              </div>
              <Select value={timeframe} onValueChange={setTimeframe}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="yearly">This Year</SelectItem>
                  <SelectItem value="monthly">This Month</SelectItem>
                  <SelectItem value="weekly">This Week</SelectItem>
                  <SelectItem value="daily">Today</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Leaderboard */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-primary flex items-center space-x-2">
              <Trophy className="w-6 h-6" />
              <span>{getTimeframeLabel()} Top Roasters</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {users.map((user, index) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer border border-border/50"
                  onClick={() => navigate(`/user/${user.id}`)}
                >
                  <div className="flex items-center space-x-4">
                    {getRankIcon(index)}
                    <div>
                      <h3 className="font-semibold text-foreground">{user.username}</h3>
                      <p className="text-sm text-muted-foreground">
                        {user.totalPosts} posts • {user.totalUpvotes} upvotes
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-primary">{user.score}</div>
                    <div className="text-xs text-muted-foreground">score</div>
                  </div>
                </div>
              ))}
              
              {users.length === 0 && (
                <div className="text-center py-12">
                  <Trophy className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground text-lg">
                    No active users for this timeframe. Start posting to get on the leaderboard! 🔥
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Leaderboard;
