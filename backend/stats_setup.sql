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
DROP POLICY IF EXISTS "Public can increment visits" ON public.site_visits;
CREATE POLICY "Public can increment visits" ON public.site_visits FOR ALL USING (true);

-- Add appointments table for enquiries and site visits
CREATE TABLE IF NOT EXISTS public.appointments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL,
    message TEXT,
    status TEXT DEFAULT 'pending',
    type TEXT DEFAULT 'Enquiry'
);

-- Enable RLS for appointments
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can insert appointments" ON public.appointments;
CREATE POLICY "Public can insert appointments" ON public.appointments FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Public can view appointments" ON public.appointments;
CREATE POLICY "Public can view appointments" ON public.appointments FOR SELECT USING (true);
DROP POLICY IF EXISTS "Public can delete appointments" ON public.appointments;
CREATE POLICY "Public can delete appointments" ON public.appointments FOR DELETE USING (true);
