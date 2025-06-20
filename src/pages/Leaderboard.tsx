
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Medal, Award, Crown, TrendingUp, Star } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const Leaderboard = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("daily");

  const periods = [
    { value: "daily", label: "Daily", icon: Star },
    { value: "weekly", label: "Weekly", icon: TrendingUp },
    { value: "monthly", label: "Monthly", icon: Award },
    { value: "yearly", label: "Yearly", icon: Medal },
    { value: "alltime", label: "All Time", icon: Crown }
  ];

  // Mock leaderboard data
  const leaderboardData = {
    daily: [
      { rank: 1, username: "RoastMaster", score: 245, posts: 12, upvotes: 189 },
      { rank: 2, username: "WittyUser", score: 198, posts: 8, upvotes: 156 },
      { rank: 3, username: "SavageBurn", score: 167, posts: 10, upvotes: 134 },
      { rank: 4, username: "ComedyKing", score: 134, posts: 6, upvotes: 98 },
      { rank: 5, username: "PunMaster", score: 112, posts: 7, upvotes: 87 }
    ],
    weekly: [
      { rank: 1, username: "RoastMaster", score: 1245, posts: 42, upvotes: 989 },
      { rank: 2, username: "WittyUser", score: 998, posts: 38, upvotes: 756 },
      { rank: 3, username: "SavageBurn", score: 867, posts: 35, upvotes: 634 },
      { rank: 4, username: "ComedyKing", score: 734, posts: 28, upvotes: 598 },
      { rank: 5, username: "PunMaster", score: 612, posts: 25, upvotes: 487 }
    ],
    monthly: [
      { rank: 1, username: "RoastMaster", score: 4245, posts: 142, upvotes: 3189 },
      { rank: 2, username: "WittyUser", score: 3998, posts: 138, upvotes: 2756 },
      { rank: 3, username: "SavageBurn", score: 3267, posts: 125, upvotes: 2434 },
      { rank: 4, username: "ComedyKing", score: 2734, posts: 118, upvotes: 2198 },
      { rank: 5, username: "PunMaster", score: 2412, posts: 105, upvotes: 1987 }
    ],
    yearly: [
      { rank: 1, username: "RoastMaster", score: 24245, posts: 542, upvotes: 18189 },
      { rank: 2, username: "WittyUser", score: 19998, posts: 438, upvotes: 15756 },
      { rank: 3, username: "SavageBurn", score: 17267, posts: 425, upvotes: 14434 },
      { rank: 4, username: "ComedyKing", score: 15734, posts: 418, upvotes: 12198 },
      { rank: 5, username: "PunMaster", score: 14412, posts: 405, upvotes: 11987 }
    ],
    alltime: [
      { rank: 1, username: "RoastMaster", score: 54245, posts: 1542, upvotes: 42189 },
      { rank: 2, username: "WittyUser", score: 49998, posts: 1338, upvotes: 38756 },
      { rank: 3, username: "SavageBurn", score: 47267, posts: 1225, upvotes: 36434 },
      { rank: 4, username: "ComedyKing", score: 45734, posts: 1118, upvotes: 34198 },
      { rank: 5, username: "PunMaster", score: 44412, posts: 1005, upvotes: 32987 }
    ]
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

  const currentData = leaderboardData[selectedPeriod as keyof typeof leaderboardData];

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

          {/* Leaderboard */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                {periods.find(p => p.value === selectedPeriod)?.label} Leaders
              </CardTitle>
            </CardContent>
            <CardContent className="space-y-4">
              {currentData.map((user, index) => (
                <div
                  key={user.rank}
                  className={cn(
                    "flex items-center gap-4 p-4 rounded-lg border transition-colors hover:bg-accent/50",
                    user.rank <= 3 ? "bg-accent/20" : "bg-background"
                  )}
                >
                  {/* Rank Icon */}
                  <div className="flex-shrink-0">
                    {getRankIcon(user.rank)}
                  </div>

                  {/* User Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibol text-lg">{user.username}</h3>
                      <Badge className={cn("text-xs", getRankBadgeColor(user.rank))}>
                        Rank #{user.rank}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>📝 {user.posts} posts</span>
                      <span>👍 {user.upvotes} upvotes</span>
                    </div>
                  </div>

                  {/* Score */}
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary">{user.score}</div>
                    <div className="text-xs text-muted-foreground">points</div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

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
