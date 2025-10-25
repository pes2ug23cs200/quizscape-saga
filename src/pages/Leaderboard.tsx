import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Navbar } from "@/components/Navbar";
import { Trophy, Medal, Award, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface LeaderboardEntry {
  id: string;
  display_name: string | null;
  level: number;
  total_score: number;
  total_quizzes: number;
}

const Leaderboard = () => {
  const [loading, setLoading] = useState(true);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);

      const { data } = await supabase
        .from("profiles")
        .select("id, display_name, level, total_score, total_quizzes")
        .order("total_score", { ascending: false })
        .limit(100);

      if (data) {
        setLeaderboard(data);
      }
      setLoading(false);
    };

    fetchLeaderboard();
  }, []);

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Trophy className="h-6 w-6 text-gold" />;
      case 1:
        return <Medal className="h-6 w-6 text-muted-foreground" style={{ color: "#C0C0C0" }} />;
      case 2:
        return <Medal className="h-6 w-6 text-destructive" style={{ color: "#CD7F32" }} />;
      default:
        return <Award className="h-6 w-6 text-muted-foreground" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center min-h-[80vh]">
          <Loader2 className="h-8 w-8 animate-spin text-secondary" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-24 pb-20">
        <div className="mb-8 text-center">
          <Trophy className="h-16 w-16 text-gold mx-auto mb-4" />
          <h1 className="text-4xl font-bold mb-2">Global Leaderboard</h1>
          <p className="text-muted-foreground">Top 100 quiz masters worldwide</p>
        </div>

        {/* Top 3 Podium */}
        {leaderboard.length >= 3 && (
          <div className="grid md:grid-cols-3 gap-6 mb-12 max-w-4xl mx-auto">
            {/* 2nd Place */}
            <Card className={`border-2 ${leaderboard[1]?.id === currentUserId ? "border-secondary" : "border-border"} mt-8`}>
              <CardContent className="pt-8 text-center">
                <Medal className="h-12 w-12 mx-auto mb-4" style={{ color: "#C0C0C0" }} />
                <div className="text-4xl font-bold mb-2">2nd</div>
                <Avatar className="mx-auto mb-3">
                  <AvatarFallback className="bg-secondary text-secondary-foreground text-lg">
                    {leaderboard[1]?.display_name?.charAt(0).toUpperCase() || "?"}
                  </AvatarFallback>
                </Avatar>
                <h3 className="font-semibold mb-1">{leaderboard[1]?.display_name || "Anonymous"}</h3>
                <div className="text-2xl font-bold text-secondary mb-1">{leaderboard[1]?.total_score}</div>
                <p className="text-sm text-muted-foreground">Level {leaderboard[1]?.level}</p>
              </CardContent>
            </Card>

            {/* 1st Place */}
            <Card className={`border-2 ${leaderboard[0]?.id === currentUserId ? "border-gold" : "border-gold/50"} bg-gradient-to-br from-gold/10 to-transparent`}>
              <CardContent className="pt-8 text-center">
                <Trophy className="h-16 w-16 text-gold mx-auto mb-4" />
                <div className="text-5xl font-bold mb-2 text-gold">1st</div>
                <Avatar className="mx-auto mb-3 w-16 h-16">
                  <AvatarFallback className="bg-gold text-gold-foreground text-2xl">
                    {leaderboard[0]?.display_name?.charAt(0).toUpperCase() || "?"}
                  </AvatarFallback>
                </Avatar>
                <h3 className="font-semibold text-lg mb-1">{leaderboard[0]?.display_name || "Anonymous"}</h3>
                <div className="text-3xl font-bold text-gold mb-1">{leaderboard[0]?.total_score}</div>
                <p className="text-sm text-muted-foreground">Level {leaderboard[0]?.level}</p>
              </CardContent>
            </Card>

            {/* 3rd Place */}
            <Card className={`border-2 ${leaderboard[2]?.id === currentUserId ? "border-secondary" : "border-border"} mt-8`}>
              <CardContent className="pt-8 text-center">
                <Medal className="h-12 w-12 mx-auto mb-4" style={{ color: "#CD7F32" }} />
                <div className="text-4xl font-bold mb-2">3rd</div>
                <Avatar className="mx-auto mb-3">
                  <AvatarFallback className="bg-secondary text-secondary-foreground text-lg">
                    {leaderboard[2]?.display_name?.charAt(0).toUpperCase() || "?"}
                  </AvatarFallback>
                </Avatar>
                <h3 className="font-semibold mb-1">{leaderboard[2]?.display_name || "Anonymous"}</h3>
                <div className="text-2xl font-bold text-secondary mb-1">{leaderboard[2]?.total_score}</div>
                <p className="text-sm text-muted-foreground">Level {leaderboard[2]?.level}</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Full Leaderboard */}
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle>All Rankings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {leaderboard.map((entry, index) => (
                <div
                  key={entry.id}
                  className={`flex items-center gap-4 p-4 rounded-lg transition-all ${
                    entry.id === currentUserId
                      ? "bg-secondary/20 border-2 border-secondary"
                      : "bg-accent/50 hover:bg-accent"
                  }`}
                >
                  <div className="flex items-center justify-center w-12">
                    {index < 3 ? (
                      getRankIcon(index)
                    ) : (
                      <span className="text-lg font-bold text-muted-foreground">#{index + 1}</span>
                    )}
                  </div>

                  <Avatar>
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {entry.display_name?.charAt(0).toUpperCase() || "?"}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1">
                    <h4 className="font-semibold">{entry.display_name || "Anonymous"}</h4>
                    <p className="text-sm text-muted-foreground">
                      Level {entry.level} • {entry.total_quizzes} quizzes
                    </p>
                  </div>

                  <div className="text-right">
                    <div className="text-2xl font-bold text-secondary">{entry.total_score}</div>
                    <p className="text-xs text-muted-foreground">points</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Leaderboard;
