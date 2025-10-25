-- Create user profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  level INTEGER DEFAULT 1,
  xp INTEGER DEFAULT 0,
  total_quizzes INTEGER DEFAULT 0,
  total_score INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create quizzes table
CREATE TABLE public.quizzes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')),
  time_per_question INTEGER DEFAULT 30,
  is_published BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create questions table
CREATE TABLE public.questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quiz_id UUID REFERENCES public.quizzes(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type TEXT CHECK (question_type IN ('multiple-choice', 'true-false')),
  options JSONB NOT NULL,
  correct_answer INTEGER NOT NULL,
  points INTEGER DEFAULT 10,
  order_index INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create quiz attempts table
CREATE TABLE public.quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  quiz_id UUID REFERENCES public.quizzes(id) ON DELETE CASCADE,
  score INTEGER DEFAULT 0,
  total_questions INTEGER,
  correct_answers INTEGER DEFAULT 0,
  time_spent INTEGER,
  answers JSONB,
  completed_at TIMESTAMPTZ DEFAULT now()
);

-- Create achievements table
CREATE TABLE public.achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  badge_color TEXT,
  requirement_type TEXT,
  requirement_value INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create user achievements table
CREATE TABLE public.user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id UUID REFERENCES public.achievements(id) ON DELETE CASCADE,
  earned_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, achievement_id)
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- RLS Policies for quizzes
CREATE POLICY "Published quizzes are viewable by everyone"
  ON public.quizzes FOR SELECT
  USING (is_published = true);

-- RLS Policies for questions
CREATE POLICY "Questions are viewable for published quizzes"
  ON public.questions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.quizzes
      WHERE quizzes.id = questions.quiz_id
      AND quizzes.is_published = true
    )
  );

-- RLS Policies for quiz attempts
CREATE POLICY "Users can view their own attempts"
  ON public.quiz_attempts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own attempts"
  ON public.quiz_attempts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for achievements
CREATE POLICY "Achievements are viewable by everyone"
  ON public.achievements FOR SELECT
  USING (true);

-- RLS Policies for user achievements
CREATE POLICY "Users can view their own achievements"
  ON public.user_achievements FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own achievements"
  ON public.user_achievements FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)));
  RETURN NEW;
END;
$$;

-- Trigger to create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

CREATE TRIGGER update_quizzes_updated_at
  BEFORE UPDATE ON public.quizzes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Insert sample achievements
INSERT INTO public.achievements (name, description, icon, badge_color, requirement_type, requirement_value)
VALUES
  ('First Steps', 'Complete your first quiz', 'Trophy', '#FFD700', 'quizzes_completed', 1),
  ('Quiz Enthusiast', 'Complete 10 quizzes', 'Award', '#FFD700', 'quizzes_completed', 10),
  ('Speed Demon', 'Answer 10 questions in under 5 seconds each', 'Zap', '#FF6B6B', 'fast_answers', 10),
  ('Perfect Score', 'Get 100% on any quiz', 'Star', '#50C878', 'perfect_quiz', 1),
  ('Rising Star', 'Reach level 5', 'TrendingUp', '#C8A2E0', 'level', 5);

-- Insert sample quizzes
INSERT INTO public.quizzes (title, description, category, difficulty, time_per_question, is_published)
VALUES
  ('General Knowledge Basics', 'Test your general knowledge with this beginner-friendly quiz', 'General Knowledge', 'easy', 20, true),
  ('Science Fundamentals', 'Explore basic scientific concepts', 'Science', 'medium', 25, true),
  ('History Challenge', 'Journey through important historical events', 'History', 'hard', 30, true),
  ('Pop Culture Quiz', 'How well do you know modern pop culture?', 'Entertainment', 'easy', 15, true);

-- Insert sample questions for General Knowledge quiz
DO $$
DECLARE
  general_knowledge_id UUID;
BEGIN
  SELECT id INTO general_knowledge_id FROM public.quizzes WHERE title = 'General Knowledge Basics' LIMIT 1;
  
  INSERT INTO public.questions (quiz_id, question_text, question_type, options, correct_answer, points, order_index)
  VALUES
    (general_knowledge_id, 'What is the capital of France?', 'multiple-choice', '["London", "Paris", "Berlin", "Madrid"]'::jsonb, 1, 10, 1),
    (general_knowledge_id, 'The Earth is flat.', 'true-false', '["True", "False"]'::jsonb, 1, 10, 2),
    (general_knowledge_id, 'How many continents are there?', 'multiple-choice', '["5", "6", "7", "8"]'::jsonb, 2, 10, 3),
    (general_knowledge_id, 'Water boils at 100°C at sea level.', 'true-false', '["True", "False"]'::jsonb, 0, 10, 4);
END $$;