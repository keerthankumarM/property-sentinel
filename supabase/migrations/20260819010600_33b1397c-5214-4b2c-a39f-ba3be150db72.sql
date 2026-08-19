CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own profile" ON public.profiles FOR ALL TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END; $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TABLE public.newspapers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  mime_type TEXT,
  newspaper_name TEXT,
  publication_date DATE,
  language TEXT,
  page_count INTEGER,
  status TEXT NOT NULL DEFAULT 'pending',
  error_message TEXT,
  ocr_text TEXT,
  articles_detected INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.newspapers TO authenticated;
GRANT ALL ON public.newspapers TO service_role;
ALTER TABLE public.newspapers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own newspapers" ON public.newspapers FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.land_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  newspaper_id UUID NOT NULL REFERENCES public.newspapers ON DELETE CASCADE,
  title TEXT,
  original_text TEXT,
  summary TEXT,
  newspaper_name TEXT,
  publication_date DATE,
  language TEXT,
  source_page TEXT,
  persons TEXT[] NOT NULL DEFAULT '{}',
  owner_names TEXT[] NOT NULL DEFAULT '{}',
  organizations TEXT[] NOT NULL DEFAULT '{}',
  survey_number TEXT,
  location TEXT,
  village TEXT,
  taluk TEXT,
  district TEXT,
  state TEXT,
  area_extent TEXT,
  dispute_type TEXT,
  court_info TEXT,
  important_dates TEXT[] NOT NULL DEFAULT '{}',
  risk_level TEXT NOT NULL DEFAULT 'LOW',
  confidence NUMERIC,
  verification_status TEXT NOT NULL DEFAULT 'AI_DETECTED',
  latitude NUMERIC,
  longitude NUMERIC,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.land_articles TO authenticated;
GRANT ALL ON public.land_articles TO service_role;
ALTER TABLE public.land_articles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own articles" ON public.land_articles FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.monitored_properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  label TEXT,
  survey_number TEXT,
  village TEXT,
  taluk TEXT,
  district TEXT,
  state TEXT,
  owner_name TEXT,
  area_extent TEXT,
  latitude NUMERIC,
  longitude NUMERIC,
  notify_email BOOLEAN NOT NULL DEFAULT true,
  notify_sms BOOLEAN NOT NULL DEFAULT false,
  notify_whatsapp BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.monitored_properties TO authenticated;
GRANT ALL ON public.monitored_properties TO service_role;
ALTER TABLE public.monitored_properties ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own properties" ON public.monitored_properties FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TABLE public.alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  property_id UUID REFERENCES public.monitored_properties ON DELETE CASCADE,
  article_id UUID REFERENCES public.land_articles ON DELETE CASCADE,
  match_reason TEXT,
  match_score NUMERIC,
  risk_level TEXT NOT NULL DEFAULT 'MEDIUM',
  is_read BOOLEAN NOT NULL DEFAULT false,
  channels TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.alerts TO authenticated;
GRANT ALL ON public.alerts TO service_role;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own alerts" ON public.alerts FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_articles_user ON public.land_articles(user_id, created_at DESC);
CREATE INDEX idx_alerts_user ON public.alerts(user_id, created_at DESC);