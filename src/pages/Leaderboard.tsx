
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trophy, Medal, Award, ArrowLeft } from "lucide-react";
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

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        // Get all users with their post counts and vote totals
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, username');

        if (profiles) {
          const leaderboardData = await Promise.all(
            profiles.map(async (profile) => {
              // Get post count
              const { count: postCount } = await supabase
                .from('posts')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', profile.id)
                .eq('status', 'visible');

              // Get total upvotes for user's posts
              const { data: posts } = await supabase
                .from('posts')
                .select('id')
                .eq('user_id', profile.id)
                .eq('status', 'visible');

              let totalUpvotes = 0;
              if (posts) {
                for (const post of posts) {
                  const { count: upvoteCount } = await supabase
                    .from('votes')
                    .select('*', { count: 'exact', head: true })
                    .eq('post_id', post.id)
                    .eq('vote_type', 'upvote');
                  
                  totalUpvotes += upvoteCount || 0;
                }
              }

              return {
                id: profile.id,
                username: profile.username,
                totalPosts: postCount || 0,
                totalUpvotes,
                score: (totalUpvotes * 2) + (postCount || 0) // Score formula
              };
            })
          );

          // Sort by score and filter out users with no activity
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

    fetchLeaderboard();
  }, []);

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0: return <Trophy className="w-6 h-6 text-yellow-500" />;
      case 1: return <Medal className="w-6 h-6 text-gray-400" />;
      case 2: return <Award className="w-6 h-6 text-amber-600" />;
      default: return <span className="w-6 h-6 flex items-center justify-center text-lg font-bold text-gray-400">#{index + 1}</span>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-400">Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white pb-20">
      <header className="sticky top-0 z-50 bg-gray-900/80 backdrop-blur-sm border-b border-gray-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/")}
                className="md:hidden"
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <h1 className="text-2xl font-bold text-orange-500">Leaderboard</h1>
            </div>
            <UserNav />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-orange-500 flex items-center space-x-2">
              <Trophy className="w-6 h-6" />
              <span>Top Roasters</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {users.map((user, index) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-4 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors cursor-pointer"
                  onClick={() => navigate(`/user/${user.id}`)}
                >
                  <div className="flex items-center space-x-4">
                    {getRankIcon(index)}
                    <div>
                      <h3 className="font-semibold text-white">{user.username}</h3>
                      <p className="text-sm text-gray-400">
                        {user.totalPosts} posts • {user.totalUpvotes} upvotes
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-bold text-orange-500">{user.score}</div>
                    <div className="text-xs text-gray-400">score</div>
                  </div>
                </div>
              ))}
              
              {users.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  No active users yet. Start posting to get on the leaderboard! 🔥
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
