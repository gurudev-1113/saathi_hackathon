-- ==============================================================================
-- ReportSaathi Database Schema with Row Level Security (RLS)
-- ==============================================================================
-- Designed for PostgreSQL on Supabase.
-- Enforces strict patient data privacy: Users can ONLY access their own records.
-- Raw uploaded document files and medical scans are NEVER retained.
-- ==============================================================================

-- 1. Create Profiles Table (Linked to Supabase Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. Create Report History Table (Structured Summaries Only)
CREATE TABLE IF NOT EXISTS public.report_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    report_title TEXT NOT NULL,
    report_date TEXT,
    specimen_type TEXT,
    headline TEXT NOT NULL,
    summary_overview TEXT NOT NULL,
    normal_count INTEGER DEFAULT 0,
    attention_count INTEGER DEFAULT 0,
    total_tests INTEGER DEFAULT 0,
    biomarkers JSONB NOT NULL DEFAULT '[]'::jsonb,
    doctor_questions JSONB DEFAULT '[]'::jsonb,
    ai_engine TEXT DEFAULT 'gemini',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_history ENABLE ROW LEVEL SECURITY;

-- 4. Policies for 'profiles' table
-- Users can only view and update their own profile
CREATE POLICY "Users can view their own profile"
    ON public.profiles
    FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON public.profiles
    FOR UPDATE
    USING (auth.uid() = id);

-- 5. Policies for 'report_history' table
-- Users can strictly view, insert, and delete ONLY their own saved reports
CREATE POLICY "Users can view own report history"
    ON public.report_history
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own report history"
    ON public.report_history
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own report history"
    ON public.report_history
    FOR DELETE
    USING (auth.uid() = user_id);

-- 6. Trigger to automatically create a profile entry when a user registers
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if already exists and recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Indexing for fast queries by user and date
CREATE INDEX IF NOT EXISTS idx_report_history_user_id ON public.report_history(user_id);
CREATE INDEX IF NOT EXISTS idx_report_history_created_at ON public.report_history(created_at DESC);
