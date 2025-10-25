import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Navbar } from "@/components/Navbar";
import { Trophy, Target, TrendingUp, Award, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Profile {
  id: string;
  display_name: string | null;
  level: number;
  xp: number;
  total_quizzes: number;
  total_score: number;
}

interface Achievement {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  badge_color: string | null;
  earned_at: string;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/auth");
        return;
      }

      // Fetch profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      setProfile(profileData);

      // Fetch user achievements
      const { data: achievementsData } = await supabase
        .from("user_achievements")
        .select(`
          earned_at,
          achievements (
            id,
            name,
            description,
            icon,
            badge_color
          )
        `)
        .eq("user_id", user.id);

      if (achievementsData) {
        const formattedAchievements = achievementsData.map((item: any) => ({
          ...item.achievements,
          earned_at: item.earned_at,
        }));
        setAchievements(formattedAchievements);
      }

      setLoading(false);
    };

    checkUser();
  }, [navigate]);

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

  const xpForNextLevel = profile ? profile.level * 100 : 100;
  const xpProgress = profile ? (profile.xp / xpForNextLevel) * 100 : 0;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-24 pb-20">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">
            Welcome back, {profile?.display_name || "Quiz Master"}!
          </h1>
          <p className="text-muted-foreground">Ready to challenge yourself today?</p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="border-2 border-secondary/20 hover:border-secondary transition-all">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Trophy className="h-4 w-4 text-secondary" />
                Level
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-secondary">{profile?.level}</div>
              <div className="mt-2">
                <div className="h-2 rounded-full bg-accent overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-secondary to-primary transition-all"
                    style={{ width: `${xpProgress}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {profile?.xp} / {xpForNextLevel} XP
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-border hover:border-secondary transition-all">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Target className="h-4 w-4 text-primary" />
                Quizzes Completed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{profile?.total_quizzes || 0}</div>
            </CardContent>
          </Card>

          <Card className="border-2 border-border hover:border-secondary transition-all">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-success" />
                Total Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{profile?.total_score || 0}</div>
            </CardContent>
          </Card>

          <Card className="border-2 border-border hover:border-secondary transition-all">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Award className="h-4 w-4 text-gold" />
                Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{achievements.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Achievements Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-gold" />
              Your Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            {achievements.length > 0 ? (
              <div className="grid md:grid-cols-3 gap-4">
                {achievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className="flex items-center gap-3 p-4 rounded-lg bg-accent/50 border border-border"
                  >
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: achievement.badge_color + "30" }}
                    >
                      <Award className="h-6 w-6" style={{ color: achievement.badge_color || "#FFD700" }} />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold">{achievement.name}</h4>
                      <p className="text-xs text-muted-foreground">{achievement.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Award className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Complete quizzes to earn your first achievement!</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="flex gap-4">
          <Button size="lg" onClick={() => navigate("/quizzes")} className="flex-1">
            <Trophy className="mr-2 h-5 w-5" />
            Browse Quizzes
          </Button>
          <Button size="lg" variant="outline" onClick={() => navigate("/leaderboard")} className="flex-1">
            <TrendingUp className="mr-2 h-5 w-5" />
            View Leaderboard
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
