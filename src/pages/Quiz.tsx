import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Navbar } from "@/components/Navbar";
import { useToast } from "@/hooks/use-toast";
import { Clock, CheckCircle, XCircle, Loader2, Trophy } from "lucide-react";

interface Question {
  id: string;
  question_text: string;
  question_type: string;
  options: string[];
  correct_answer: number;
  points: number;
  order_index: number;
}

interface Quiz {
  id: string;
  title: string;
  time_per_question: number;
}

const Quiz = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answers, setAnswers] = useState<{ questionId: string; answer: number; timeSpent: number }[]>([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [quizComplete, setQuizComplete] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/auth");
        return;
      }

      setUserId(user.id);
      fetchQuizData();
    };

    checkUser();
  }, [id, navigate]);

  const fetchQuizData = async () => {
    // Fetch quiz details
    const { data: quizData } = await supabase
      .from("quizzes")
      .select("*")
      .eq("id", id)
      .single();

    if (quizData) {
      setQuiz(quizData);
      setTimeLeft(quizData.time_per_question || 30);
    }

    // Fetch questions
    const { data: questionsData } = await supabase
      .from("questions")
      .select("*")
      .eq("quiz_id", id)
      .order("order_index", { ascending: true });

    if (questionsData) {
      const formattedQuestions = questionsData.map((q) => ({
        ...q,
        options: q.options as unknown as string[],
      }));
      setQuestions(formattedQuestions);
    }

    setLoading(false);
  };

  useEffect(() => {
    if (loading || quizComplete) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleNextQuestion();
          return quiz?.time_per_question || 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentQuestionIndex, loading, quizComplete]);

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
  };

  const handleNextQuestion = async () => {
    const currentQuestion = questions[currentQuestionIndex];
    const timeSpent = (quiz?.time_per_question || 30) - timeLeft;
    
    // Calculate score
    let questionScore = 0;
    if (selectedAnswer === currentQuestion.correct_answer) {
      const timeBonus = Math.floor((timeLeft / (quiz?.time_per_question || 30)) * currentQuestion.points * 0.5);
      questionScore = currentQuestion.points + timeBonus;
      setScore((prev) => prev + questionScore);
    }

    // Store answer
    setAnswers((prev) => [
      ...prev,
      {
        questionId: currentQuestion.id,
        answer: selectedAnswer ?? -1,
        timeSpent,
      },
    ]);

    // Move to next question or complete quiz
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      setSelectedAnswer(null);
      setTimeLeft(quiz?.time_per_question || 30);
    } else {
      await completeQuiz(questionScore);
    }
  };

  const completeQuiz = async (finalQuestionScore: number) => {
    setQuizComplete(true);
    const finalScore = score + finalQuestionScore;

    // Save quiz attempt
    if (userId && quiz) {
      const correctAnswers = answers.filter((a, index) => 
        a.answer === questions[index].correct_answer
      ).length + (selectedAnswer === questions[currentQuestionIndex].correct_answer ? 1 : 0);

      await supabase.from("quiz_attempts").insert({
        user_id: userId,
        quiz_id: quiz.id,
        score: finalScore,
        total_questions: questions.length,
        correct_answers: correctAnswers,
        time_spent: answers.reduce((acc, curr) => acc + curr.timeSpent, 0),
        answers: JSON.stringify(answers),
      });

      // Update profile stats
      const { data: profileData } = await supabase
        .from("profiles")
        .select("total_quizzes, total_score, xp")
        .eq("id", userId)
        .single();

      if (profileData) {
        await supabase
          .from("profiles")
          .update({
            total_quizzes: (profileData.total_quizzes || 0) + 1,
            total_score: (profileData.total_score || 0) + finalScore,
            xp: (profileData.xp || 0) + finalScore,
          })
          .eq("id", userId);

        // Check for first quiz achievement
        if ((profileData.total_quizzes || 0) === 0) {
          const { data: achievement } = await supabase
            .from("achievements")
            .select("id")
            .eq("name", "First Steps")
            .single();

          if (achievement) {
            await supabase.from("user_achievements").insert({
              user_id: userId,
              achievement_id: achievement.id,
            });

            toast({
              title: "🎉 Achievement Unlocked!",
              description: "First Steps - Complete your first quiz",
            });
          }
        }
      }
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

  if (quizComplete) {
    const correctAnswers = answers.filter((a, index) => 
      a.answer === questions[index]?.correct_answer
    ).length + (selectedAnswer === questions[currentQuestionIndex]?.correct_answer ? 1 : 0);
    const accuracy = Math.round((correctAnswers / questions.length) * 100);

    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 pt-24 pb-20">
          <Card className="max-w-2xl mx-auto text-center shadow-[var(--shadow-elegant)]">
            <CardContent className="pt-12 pb-8">
              <Trophy className="h-20 w-20 text-gold mx-auto mb-6" />
              <h1 className="text-4xl font-bold mb-4">Quiz Complete!</h1>
              
              <div className="grid grid-cols-3 gap-6 my-8">
                <div>
                  <div className="text-4xl font-bold text-secondary mb-2">{score}</div>
                  <div className="text-sm text-muted-foreground">Total Score</div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-success mb-2">{correctAnswers}/{questions.length}</div>
                  <div className="text-sm text-muted-foreground">Correct</div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-primary mb-2">{accuracy}%</div>
                  <div className="text-sm text-muted-foreground">Accuracy</div>
                </div>
              </div>

              <div className="flex gap-4 justify-center mt-8">
                <Button onClick={() => navigate("/quizzes")}>
                  Browse More Quizzes
                </Button>
                <Button variant="outline" onClick={() => navigate("/dashboard")}>
                  Back to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
  const timeProgress = (timeLeft / (quiz?.time_per_question || 30)) * 100;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-24 pb-20">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">
              Question {currentQuestionIndex + 1} of {questions.length}
            </span>
            <span className="text-sm font-medium">Score: {score}</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <Card className="max-w-3xl mx-auto shadow-[var(--shadow-elegant)]">
          <CardContent className="pt-8">
            {/* Timer */}
            <div className="flex items-center justify-center gap-2 mb-8">
              <Clock className="h-5 w-5 text-secondary" />
              <span className="text-2xl font-bold">{timeLeft}s</span>
              <Progress 
                value={timeProgress} 
                className="w-32 h-2"
              />
            </div>

            {/* Question */}
            <h2 className="text-2xl font-bold mb-8 text-center">
              {currentQuestion?.question_text}
            </h2>

            {/* Answer Options */}
            <div className="space-y-3">
              {currentQuestion?.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(index)}
                  className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                    selectedAnswer === index
                      ? "border-secondary bg-secondary/10"
                      : "border-border hover:border-secondary/50 hover:bg-accent"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                        selectedAnswer === index
                          ? "border-secondary bg-secondary text-secondary-foreground"
                          : "border-border"
                      }`}
                    >
                      {String.fromCharCode(65 + index)}
                    </div>
                    <span className="font-medium">{option}</span>
                  </div>
                </button>
              ))}
            </div>

            {/* Submit Button */}
            <Button
              size="lg"
              onClick={handleNextQuestion}
              disabled={selectedAnswer === null}
              className="w-full mt-8"
            >
              {currentQuestionIndex < questions.length - 1 ? "Next Question" : "Finish Quiz"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Quiz;
