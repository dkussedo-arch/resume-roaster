-- Create a private Storage bucket for resume PDFs in the Supabase dashboard,
-- or run this in the SQL editor after enabling Storage.
-- Bucket name must match NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET (default: resumes).

insert into storage.buckets (id, name, public)
values ('resumes', 'resumes', false)
on conflict (id) do nothing;

-- Allow service-role uploads (server uses SUPABASE_SERVICE_ROLE_KEY).
-- For anon uploads, add policies as needed for your auth model.
