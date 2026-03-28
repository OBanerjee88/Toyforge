-- VastuForge Supabase Setup
-- Run this in Supabase SQL Editor to set up all tables

-- ============================================
-- PROFILES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    email TEXT,
    plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'pro')),
    daily_queries_used INTEGER DEFAULT 0,
    last_query_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own profile"
    ON profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, email, plan, daily_queries_used)
    VALUES (
        NEW.id,
        NEW.raw_user_meta_data->>'full_name',
        NEW.email,
        'free',
        0
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for auto-profile creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ============================================
-- SAVED PLANS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS saved_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    plan_data JSONB NOT NULL,
    title TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE saved_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own saved plans"
    ON saved_plans FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own saved plans"
    ON saved_plans FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own saved plans"
    ON saved_plans FOR DELETE
    USING (auth.uid() = user_id);


-- ============================================
-- PAYMENT LOGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS payment_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_id TEXT UNIQUE NOT NULL,
    order_id TEXT NOT NULL,
    user_id UUID REFERENCES profiles(id),
    amount INTEGER NOT NULL,
    expected_amount INTEGER DEFAULT 19900,
    status TEXT NOT NULL,
    verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_payment_logs_payment_id ON payment_logs(payment_id);
CREATE INDEX IF NOT EXISTS idx_payment_logs_user_id ON payment_logs(user_id);


-- ============================================
-- HOME PROFILES TABLE (for Phase 6 Level 5)
-- ============================================
CREATE TABLE IF NOT EXISTS home_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
    home_type TEXT,
    city TEXT,
    entrance_direction TEXT,
    rooms JSONB DEFAULT '{}',
    floor_count INTEGER DEFAULT 1,
    notes TEXT,
    vastu_score INTEGER,
    last_analysis JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE home_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own home profile"
    ON home_profiles FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own home profile"
    ON home_profiles FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own home profile"
    ON home_profiles FOR UPDATE
    USING (auth.uid() = user_id);
