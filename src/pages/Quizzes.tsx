import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Navbar } from "@/components/Navbar";
import { Clock, Target, Play, Loader2 } from "lucide-react";

interface Quiz {
  id: string;
  title: string;
  description: string | null;
  category: string;
  difficulty: string | null;
  time_per_question: number | null;
}

const Quizzes = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/auth");
        return;
      }

      fetchQuizzes();
    };

    checkUser();
  }, [navigate]);

  const fetchQuizzes = async () => {
    const { data } = await supabase
      .from("quizzes")
      .select("*")
      .eq("is_published", true)
      .order("created_at", { ascending: false });

    if (data) {
      setQuizzes(data);
    }
    setLoading(false);
  };

  const categories = Array.from(new Set(quizzes.map((q) => q.category)));
  const filteredQuizzes =
    selectedCategory === "all"
      ? quizzes
      : quizzes.filter((q) => q.category === selectedCategory);

  const getDifficultyColor = (difficulty: string | null) => {
    switch (difficulty) {
      case "easy":
        return "bg-success/20 text-success";
      case "medium":
        return "bg-secondary/20 text-secondary";
      case "hard":
        return "bg-destructive/20 text-destructive";
      default:
        return "bg-muted text-muted-foreground";
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
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Explore Quizzes</h1>
          <p className="text-muted-foreground">Choose a quiz and test your knowledge</p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-8">
          <Button
            variant={selectedCategory === "all" ? "default" : "outline"}
            onClick={() => setSelectedCategory("all")}
          >
            All Quizzes
          </Button>
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Quiz Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredQuizzes.map((quiz) => (
            <Card
              key={quiz.id}
              className="border-2 border-border hover:border-secondary transition-all hover:shadow-[var(--shadow-elegant)] group cursor-pointer"
              onClick={() => navigate(`/quiz/${quiz.id}`)}
            >
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <Badge className={getDifficultyColor(quiz.difficulty)}>
                    {quiz.difficulty?.toUpperCase() || "MEDIUM"}
                  </Badge>
                  <Target className="h-5 w-5 text-secondary opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <CardTitle className="group-hover:text-secondary transition-colors">
                  {quiz.title}
                </CardTitle>
                <CardDescription className="line-clamp-2">
                  {quiz.description || "Test your knowledge with this quiz"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{quiz.time_per_question || 30}s per question</span>
                  </div>
                  <Badge variant="outline">{quiz.category}</Badge>
                </div>
                <Button className="w-full group-hover:shadow-[var(--shadow-glow)] transition-all">
                  <Play className="mr-2 h-4 w-4" />
                  Start Quiz
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredQuizzes.length === 0 && (
          <div className="text-center py-20">
            <Target className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-xl font-semibold mb-2">No quizzes found</h3>
            <p className="text-muted-foreground">
              Try selecting a different category or check back later
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Quizzes;
