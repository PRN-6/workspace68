-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger to auto-create profile on auth signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (new.id, COALESCE(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)))
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. Projects Table
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL DEFAULT 'Untitled Website',
  slug TEXT,
  document JSONB NOT NULL,
  thumbnail_url TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Case-insensitive unique slug index (nullable for drafts without slugs)
CREATE UNIQUE INDEX IF NOT EXISTS idx_projects_slug_unique 
  ON public.projects (LOWER(slug)) WHERE slug IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_projects_owner_id ON public.projects(owner_id);

-- 4. Published Sites Table (Public Snapshots)
CREATE TABLE IF NOT EXISTS public.published_sites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL UNIQUE REFERENCES public.projects(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  slug TEXT NOT NULL UNIQUE,
  published_document JSONB NOT NULL,
  published_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT check_reserved_slugs CHECK (
    LOWER(slug) NOT IN ('admin', 'api', 'login', 'register', 'dashboard', 'settings', 'publishers', 'auth', 'reset-password')
  )
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_published_sites_slug_lower 
  ON public.published_sites (LOWER(slug));

-- 5. Project Versions Table (History)
CREATE TABLE IF NOT EXISTS public.project_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  document_snapshot JSONB NOT NULL,
  version_number INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Enable Row Level Security (RLS) on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.published_sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_versions ENABLE ROW LEVEL SECURITY;

-- 7. Policies for Profiles
CREATE POLICY "Users can read own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- 8. Policies for Projects
CREATE POLICY "Users can view own projects" ON public.projects
  FOR SELECT USING (auth.uid() = owner_id);

CREATE POLICY "Users can create own projects" ON public.projects
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update own projects" ON public.projects
  FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete own projects" ON public.projects
  FOR DELETE USING (auth.uid() = owner_id);

-- 9. Policies for Published Sites
-- Anyone (even unauthenticated) can view published sites
CREATE POLICY "Public can view published sites" ON public.published_sites
  FOR SELECT USING (true);

CREATE POLICY "Owners can publish site" ON public.published_sites
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Owners can update published site" ON public.published_sites
  FOR UPDATE USING (auth.uid() = owner_id);

CREATE POLICY "Owners can delete published site" ON public.published_sites
  FOR DELETE USING (auth.uid() = owner_id);

-- 10. Policies for Project Versions
CREATE POLICY "Owners can view own versions" ON public.project_versions
  FOR SELECT USING (auth.uid() = owner_id);

CREATE POLICY "Owners can insert own versions" ON public.project_versions
  FOR INSERT WITH CHECK (auth.uid() = owner_id);
