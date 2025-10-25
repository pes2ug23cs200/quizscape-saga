import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Trophy, Zap, Award, TrendingUp, Brain, Target } from "lucide-react";
import { Navbar } from "@/components/Navbar";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="container mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/20 text-secondary-foreground mb-6 animate-fade-in">
            <Zap className="h-4 w-4" />
            <span className="text-sm font-medium">Challenge Your Mind Daily</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-secondary via-primary to-secondary bg-clip-text text-transparent animate-fade-in">
            Master Knowledge,
            <br />
            Earn Achievements
          </h1>
          
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto animate-fade-in">
            Join thousands of quiz enthusiasts competing for the top spot. Test your knowledge,
            unlock badges, and climb the leaderboard!
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in">
            <Link to="/auth">
              <Button size="lg" className="text-lg px-8 py-6 shadow-[var(--shadow-elegant)] hover:shadow-[var(--shadow-glow)] transition-all">
                <Trophy className="mr-2 h-5 w-5" />
                Start Playing Now
              </Button>
            </Link>
            <Link to="/leaderboard">
              <Button size="lg" variant="outline" className="text-lg px-8 py-6">
                <Award className="mr-2 h-5 w-5" />
                View Leaderboard
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-accent/30">
        <div className="container mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">
            Why Choose QuizMaster?
          </h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-2 border-border hover:border-secondary transition-all hover:shadow-[var(--shadow-elegant)] group">
              <CardContent className="pt-8 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-secondary/20 mb-4 group-hover:scale-110 transition-transform">
                  <Brain className="h-8 w-8 text-secondary" />
                </div>
                <h3 className="text-2xl font-bold mb-3">Diverse Categories</h3>
                <p className="text-muted-foreground">
                  From science to pop culture, test your knowledge across multiple topics
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-border hover:border-secondary transition-all hover:shadow-[var(--shadow-elegant)] group">
              <CardContent className="pt-8 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-success/20 mb-4 group-hover:scale-110 transition-transform">
                  <TrendingUp className="h-8 w-8 text-success" />
                </div>
                <h3 className="text-2xl font-bold mb-3">Real-time Leaderboard</h3>
                <p className="text-muted-foreground">
                  Compete with players worldwide and track your ranking live
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-border hover:border-secondary transition-all hover:shadow-[var(--shadow-elegant)] group">
              <CardContent className="pt-8 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gold/20 mb-4 group-hover:scale-110 transition-transform">
                  <Award className="h-8 w-8 text-gold" />
                </div>
                <h3 className="text-2xl font-bold mb-3">Unlock Achievements</h3>
                <p className="text-muted-foreground">
                  Earn exclusive badges and level up as you master quizzes
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-3 gap-12 text-center">
            <div>
              <div className="text-5xl font-bold text-secondary mb-2">10K+</div>
              <div className="text-xl text-muted-foreground">Active Players</div>
            </div>
            <div>
              <div className="text-5xl font-bold text-secondary mb-2">50+</div>
              <div className="text-xl text-muted-foreground">Quiz Categories</div>
            </div>
            <div>
              <div className="text-5xl font-bold text-secondary mb-2">1M+</div>
              <div className="text-xl text-muted-foreground">Questions Answered</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-secondary/20 via-primary/5 to-accent/20">
        <div className="container mx-auto text-center">
          <Target className="h-16 w-16 text-secondary mx-auto mb-6" />
          <h2 className="text-4xl font-bold mb-6">Ready to Test Your Knowledge?</h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join our community today and start your journey to becoming a quiz champion!
          </p>
          <Link to="/auth">
            <Button size="lg" className="text-lg px-10 py-6 shadow-[var(--shadow-elegant)]">
              <Trophy className="mr-2 h-5 w-5" />
              Join Free Now
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-border">
        <div className="container mx-auto text-center text-muted-foreground">
          <p>© 2025 QuizMaster. Challenge your mind, unlock achievements.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
