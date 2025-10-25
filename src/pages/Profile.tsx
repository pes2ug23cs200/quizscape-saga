import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Navbar } from "@/components/Navbar";
import { useToast } from "@/hooks/use-toast";
import { User, Award, Trophy, TrendingUp, Loader2, Save } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

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

const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/auth");
        return;
      }

      setEmail(user.email || "");

      // Fetch profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profileData) {
        setProfile(profileData);
        setDisplayName(profileData.display_name || "");
      }

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

  const handleUpdateProfile = async () => {
    if (!profile) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ display_name: displayName })
        .eq("id", profile.id);

      if (error) throw error;

      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Update failed",
        description: error.message,
      });
    } finally {
      setSaving(false);
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
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Your Profile</h1>
            <p className="text-muted-foreground">Manage your account and view your progress</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            {/* Profile Card */}
            <Card className="md:col-span-1">
              <CardContent className="pt-8 text-center">
                <Avatar className="mx-auto mb-4 w-24 h-24">
                  <AvatarFallback className="bg-secondary text-secondary-foreground text-3xl">
                    {displayName?.charAt(0).toUpperCase() || email?.charAt(0).toUpperCase() || "?"}
                  </AvatarFallback>
                </Avatar>
                <h2 className="text-2xl font-bold mb-1">{displayName || "Quiz Master"}</h2>
                <p className="text-sm text-muted-foreground mb-4">{email}</p>
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/20">
                  <Trophy className="h-4 w-4 text-secondary" />
                  <span className="font-semibold">Level {profile?.level}</span>
                </div>
              </CardContent>
            </Card>

            {/* Stats Cards */}
            <div className="md:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Account Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="displayName">Display Name</Label>
                    <Input
                      id="displayName"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Your display name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      value={email}
                      disabled
                      className="bg-muted"
                    />
                  </div>
                  <Button onClick={handleUpdateProfile} disabled={saving} className="w-full">
                    {saving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              <div className="grid grid-cols-3 gap-4">
                <Card>
                  <CardContent className="pt-6 text-center">
                    <TrendingUp className="h-8 w-8 text-success mx-auto mb-2" />
                    <div className="text-3xl font-bold">{profile?.total_score || 0}</div>
                    <p className="text-sm text-muted-foreground">Total Score</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6 text-center">
                    <Trophy className="h-8 w-8 text-secondary mx-auto mb-2" />
                    <div className="text-3xl font-bold">{profile?.total_quizzes || 0}</div>
                    <p className="text-sm text-muted-foreground">Quizzes</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="pt-6 text-center">
                    <Award className="h-8 w-8 text-gold mx-auto mb-2" />
                    <div className="text-3xl font-bold">{achievements.length}</div>
                    <p className="text-sm text-muted-foreground">Badges</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>

          {/* Achievements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-gold" />
                Your Achievements
              </CardTitle>
            </CardHeader>
            <CardContent>
              {achievements.length > 0 ? (
                <div className="grid md:grid-cols-2 gap-4">
                  {achievements.map((achievement) => (
                    <div
                      key={achievement.id}
                      className="flex items-center gap-3 p-4 rounded-lg bg-accent/50 border border-border"
                    >
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: achievement.badge_color + "30" }}
                      >
                        <Award className="h-6 w-6" style={{ color: achievement.badge_color || "#FFD700" }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold truncate">{achievement.name}</h4>
                        <p className="text-xs text-muted-foreground line-clamp-2">{achievement.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Award className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Complete quizzes to earn your first achievement!</p>
                  <Button onClick={() => navigate("/quizzes")} className="mt-4">
                    Browse Quizzes
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;
