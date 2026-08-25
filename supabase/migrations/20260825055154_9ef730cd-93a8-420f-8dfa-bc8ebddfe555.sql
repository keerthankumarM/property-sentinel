CREATE TABLE public.policy_notices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  title TEXT NOT NULL,
  notice_type TEXT NOT NULL DEFAULT 'RULE',
  state TEXT NOT NULL DEFAULT 'Bihar',
  district TEXT,
  block TEXT,
  summary TEXT,
  body TEXT,
  reference_number TEXT,
  issuing_authority TEXT,
  effective_date DATE,
  source_url TEXT,
  tags TEXT[] NOT NULL DEFAULT '{}',
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

GRANT SELECT ON public.policy_notices TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.policy_notices TO authenticated;
GRANT ALL ON public.policy_notices TO service_role;

ALTER TABLE public.policy_notices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published notices are readable by everyone"
  ON public.policy_notices FOR SELECT
  USING (is_published = true);

CREATE POLICY "Authors can read their own notices"
  ON public.policy_notices FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Authors can insert their own notices"
  ON public.policy_notices FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authors can update their own notices"
  ON public.policy_notices FOR UPDATE TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authors can delete their own notices"
  ON public.policy_notices FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX policy_notices_state_district_idx ON public.policy_notices (state, district);

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$
LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_policy_notices_updated_at
  BEFORE UPDATE ON public.policy_notices
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();