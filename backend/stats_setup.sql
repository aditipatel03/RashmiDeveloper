-- Add site_visits table for dashboard tracking
CREATE TABLE IF NOT EXISTS public.site_visits (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    visit_date DATE UNIQUE DEFAULT CURRENT_DATE,
    count INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Function to increment visit count
CREATE OR REPLACE FUNCTION public.increment_visit_count()
RETURNS VOID AS $$
BEGIN
    INSERT INTO public.site_visits (visit_date, count)
    VALUES (CURRENT_DATE, 1)
    ON CONFLICT (visit_date)
    DO UPDATE SET 
        count = public.site_visits.count + 1,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable RLS (though usually we'll use service role or public insert)
ALTER TABLE public.site_visits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can increment visits" ON public.site_visits FOR ALL USING (true);
