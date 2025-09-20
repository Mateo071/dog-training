-- Flores Dog Training Database Schema
-- Complete database schema for production deployment
-- WARNING: This schema is for fresh database setup only
-- For existing databases, use proper migration scripts

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE public.contact_status AS ENUM ('new', 'contacted', 'converted', 'not_interested');
CREATE TYPE public.discount_type AS ENUM ('percentage', 'fixed_amount');
CREATE TYPE public.dog_sex AS ENUM ('male', 'female');
CREATE TYPE public.message_type AS ENUM ('general', 'training', 'reminder', 'welcome', 'scheduling');
CREATE TYPE public.payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded');
CREATE TYPE public.progress_level AS ENUM ('beginner', 'intermediate', 'advanced');
CREATE TYPE public.referral_status AS ENUM ('sent', 'converted', 'expired');
CREATE TYPE public.session_status AS ENUM ('scheduled', 'completed', 'cancelled', 'no_show');
CREATE TYPE public.session_type AS ENUM ('training', 'evaluation', 'follow_up');
CREATE TYPE public.setting_type AS ENUM ('text', 'number', 'boolean', 'json');
CREATE TYPE public.user_role AS ENUM ('admin', 'client');
CREATE TYPE public.content_status AS ENUM ('draft', 'published', 'archived');
CREATE TYPE public.content_field_type AS ENUM ('text', 'textarea', 'rich_text', 'image', 'url', 'json');
CREATE TYPE public.content_section_type AS ENUM ('single', 'multiple');

-- Create tables

-- Users table (linked to auth.users)
CREATE TABLE public.users (
  id uuid NOT NULL,
  email text NOT NULL UNIQUE,
  role user_role NOT NULL DEFAULT 'client',
  is_active boolean NOT NULL DEFAULT true,
  signup_token text,
  signup_expires_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT users_pkey PRIMARY KEY (id),
  CONSTRAINT users_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);

-- Profiles table
CREATE TABLE public.profiles (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid UNIQUE,
  first_name text NOT NULL,
  last_name text NOT NULL,
  phone text,
  address text,
  emergency_contact text,
  emergency_phone text,
  how_heard_about_us text,
  notes text,
  created_from_contact_form boolean DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  profile_completed boolean DEFAULT false,
  onboarding_step integer DEFAULT 0,
  signup_completed_at timestamp with time zone,
  role text DEFAULT 'client',
  is_active boolean NOT NULL DEFAULT true,
  onboarding_data jsonb,
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);

-- Dogs table
CREATE TABLE public.dogs (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  owner_id uuid NOT NULL,
  name text NOT NULL,
  breed text NOT NULL,
  birth_date date NOT NULL,
  photo_url text,
  behavioral_notes text,
  medical_notes text,
  training_goals text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  photo_storage_path text,
  sex dog_sex,
  CONSTRAINT dogs_pkey PRIMARY KEY (id),
  CONSTRAINT dogs_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.profiles(id)
);

-- Sessions table
CREATE TABLE public.sessions (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  dog_id uuid NOT NULL,
  scheduled_date timestamp with time zone NOT NULL,
  duration_minutes integer DEFAULT 60,
  session_type session_type DEFAULT 'training',
  status session_status DEFAULT 'scheduled',
  notes text,
  homework_assigned text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT sessions_pkey PRIMARY KEY (id),
  CONSTRAINT sessions_dog_id_fkey FOREIGN KEY (dog_id) REFERENCES public.dogs(id)
);

-- Messages table
CREATE TABLE public.messages (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  recipient_id uuid NOT NULL,
  sender_id uuid NOT NULL,
  subject text NOT NULL,
  content text NOT NULL,
  message_type message_type DEFAULT 'general',
  is_read boolean DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  thread_id uuid,
  parent_message_id uuid,
  priority text DEFAULT 'normal' CHECK (priority = ANY (ARRAY['low', 'normal', 'high', 'urgent'])),
  scheduled_for timestamp with time zone,
  status text DEFAULT 'sent' CHECK (status = ANY (ARRAY['draft', 'scheduled', 'sent'])),
  CONSTRAINT messages_pkey PRIMARY KEY (id),
  CONSTRAINT messages_recipient_id_fkey FOREIGN KEY (recipient_id) REFERENCES public.profiles(id),
  CONSTRAINT messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.profiles(id),
  CONSTRAINT messages_parent_message_id_fkey FOREIGN KEY (parent_message_id) REFERENCES public.messages(id)
);

-- Contact submissions table
CREATE TABLE public.contact_submissions (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text NOT NULL,
  phone text,
  dog_name text NOT NULL,
  dog_breed text NOT NULL,
  dog_birth_date date NOT NULL,
  message text,
  status contact_status DEFAULT 'new',
  assigned_profile_id uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  dog_sex dog_sex,
  CONSTRAINT contact_submissions_pkey PRIMARY KEY (id),
  CONSTRAINT contact_submissions_assigned_profile_id_fkey FOREIGN KEY (assigned_profile_id) REFERENCES public.profiles(id)
);

-- Training analytics table
CREATE TABLE public.training_analytics (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  dog_id uuid NOT NULL UNIQUE,
  total_sessions integer DEFAULT 0,
  time_in_training_days integer DEFAULT 0,
  last_session_date date,
  next_session_date date,
  next_session_confirmed boolean DEFAULT false,
  progress_level progress_level DEFAULT 'beginner',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT training_analytics_pkey PRIMARY KEY (id),
  CONSTRAINT training_analytics_dog_id_fkey FOREIGN KEY (dog_id) REFERENCES public.dogs(id)
);

-- Referrals table
CREATE TABLE public.referrals (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  referrer_id uuid NOT NULL,
  referral_code text NOT NULL UNIQUE,
  referred_email text NOT NULL,
  referred_profile_id uuid,
  status referral_status DEFAULT 'sent',
  conversion_date timestamp with time zone,
  commission_amount numeric DEFAULT 30.00 CHECK (commission_amount >= 0),
  discount_percentage numeric DEFAULT 10.0 CHECK (discount_percentage >= 0 AND discount_percentage <= 100),
  commission_paid boolean DEFAULT false,
  times_used integer DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT referrals_pkey PRIMARY KEY (id),
  CONSTRAINT referrals_referrer_id_fkey FOREIGN KEY (referrer_id) REFERENCES public.profiles(id),
  CONSTRAINT referrals_referred_profile_id_fkey FOREIGN KEY (referred_profile_id) REFERENCES public.profiles(id)
);

-- Discount codes table
CREATE TABLE public.discount_codes (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  code text NOT NULL UNIQUE,
  discount_type discount_type NOT NULL,
  discount_value numeric NOT NULL CHECK (discount_value > 0),
  is_active boolean DEFAULT true,
  expires_at timestamp with time zone,
  usage_limit integer CHECK (usage_limit IS NULL OR usage_limit > 0),
  times_used integer DEFAULT 0,
  created_by uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT discount_codes_pkey PRIMARY KEY (id),
  CONSTRAINT discount_codes_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id)
);

-- Payments table
CREATE TABLE public.payments (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  profile_id uuid NOT NULL,
  stripe_payment_intent_id text NOT NULL UNIQUE,
  amount numeric NOT NULL CHECK (amount > 0),
  currency text DEFAULT 'usd',
  status payment_status DEFAULT 'pending',
  discount_code_id uuid,
  referral_id uuid,
  service_type text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT payments_pkey PRIMARY KEY (id),
  CONSTRAINT payments_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.profiles(id),
  CONSTRAINT payments_discount_code_id_fkey FOREIGN KEY (discount_code_id) REFERENCES public.discount_codes(id),
  CONSTRAINT payments_referral_id_fkey FOREIGN KEY (referral_id) REFERENCES public.referrals(id)
);

-- Message templates table
CREATE TABLE public.message_templates (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  subject text NOT NULL,
  content text NOT NULL,
  template_type message_type DEFAULT 'general',
  is_active boolean DEFAULT true,
  created_by uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT message_templates_pkey PRIMARY KEY (id),
  CONSTRAINT message_templates_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id)
);

-- Message read receipts table
CREATE TABLE public.message_read_receipts (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  message_id uuid NOT NULL,
  user_id uuid NOT NULL,
  read_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT message_read_receipts_pkey PRIMARY KEY (id),
  CONSTRAINT message_read_receipts_message_id_fkey FOREIGN KEY (message_id) REFERENCES public.messages(id),
  CONSTRAINT message_read_receipts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);

-- Client notes table
CREATE TABLE public.client_notes (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  profile_id uuid NOT NULL,
  note_type text DEFAULT 'general' CHECK (note_type = ANY (ARRAY['general', 'training', 'behavioral', 'medical', 'emergency'])),
  title text,
  content text NOT NULL,
  is_important boolean DEFAULT false,
  created_by uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT client_notes_pkey PRIMARY KEY (id),
  CONSTRAINT client_notes_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.profiles(id),
  CONSTRAINT client_notes_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id)
);

-- Signup invitations table
CREATE TABLE public.signup_invitations (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  contact_submission_id uuid,
  email text NOT NULL,
  invitation_token text NOT NULL UNIQUE,
  expires_at timestamp with time zone NOT NULL,
  used_at timestamp with time zone,
  created_by uuid NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT signup_invitations_pkey PRIMARY KEY (id),
  CONSTRAINT signup_invitations_contact_submission_id_fkey FOREIGN KEY (contact_submission_id) REFERENCES public.contact_submissions(id),
  CONSTRAINT signup_invitations_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id)
);

-- System settings table
CREATE TABLE public.system_settings (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  setting_key text NOT NULL UNIQUE,
  setting_value text NOT NULL,
  setting_type setting_type NOT NULL,
  description text,
  updated_by uuid,
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT system_settings_pkey PRIMARY KEY (id),
  CONSTRAINT system_settings_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.users(id)
);

-- Website sections table
CREATE TABLE public.website_sections (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  section_key text NOT NULL UNIQUE,
  display_name text NOT NULL,
  description text,
  section_type content_section_type NOT NULL DEFAULT 'single',
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT website_sections_pkey PRIMARY KEY (id)
);

-- Website content table
CREATE TABLE public.website_content (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  section_id uuid NOT NULL,
  title text NOT NULL,
  slug text,
  status content_status NOT NULL DEFAULT 'published',
  sort_order integer DEFAULT 0,
  metadata jsonb DEFAULT '{}',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  created_by uuid,
  updated_by uuid,
  CONSTRAINT website_content_pkey PRIMARY KEY (id),
  CONSTRAINT website_content_section_id_fkey FOREIGN KEY (section_id) REFERENCES public.website_sections(id),
  CONSTRAINT website_content_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id),
  CONSTRAINT website_content_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.users(id)
);

-- Website content fields table
CREATE TABLE public.website_content_fields (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  content_id uuid NOT NULL,
  field_key text NOT NULL,
  field_type content_field_type NOT NULL,
  field_value text,
  field_data jsonb DEFAULT '{}',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT website_content_fields_pkey PRIMARY KEY (id),
  CONSTRAINT website_content_fields_content_id_fkey FOREIGN KEY (content_id) REFERENCES public.website_content(id)
);

-- Create useful views

-- Dogs with owners view
CREATE VIEW public.dogs_with_owners AS
SELECT
  d.*,
  p.first_name || ' ' || p.last_name AS owner_name,
  p.phone AS owner_phone,
  p.email AS owner_email
FROM public.dogs d
JOIN public.profiles p ON d.owner_id = p.id
WHERE p.is_active = true;

-- Session analytics view
CREATE VIEW public.session_analytics AS
SELECT
  d.id AS dog_id,
  d.name AS dog_name,
  COUNT(s.id) AS total_sessions,
  MAX(s.scheduled_date) AS last_session_date,
  MIN(s.scheduled_date) AS first_session_date,
  AVG(s.duration_minutes) AS avg_session_duration,
  COUNT(CASE WHEN s.status = 'completed' THEN 1 END) AS completed_sessions,
  COUNT(CASE WHEN s.status = 'cancelled' THEN 1 END) AS cancelled_sessions,
  COUNT(CASE WHEN s.status = 'no_show' THEN 1 END) AS no_show_sessions
FROM public.dogs d
LEFT JOIN public.sessions s ON d.id = s.dog_id
GROUP BY d.id, d.name;

-- Enable Row Level Security on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discount_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_read_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.signup_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.website_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.website_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.website_content_fields ENABLE ROW LEVEL SECURITY;

-- Create indexes for performance
CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX idx_dogs_owner_id ON public.dogs(owner_id);
CREATE INDEX idx_sessions_dog_id ON public.sessions(dog_id);
CREATE INDEX idx_sessions_scheduled_date ON public.sessions(scheduled_date);
CREATE INDEX idx_messages_recipient_id ON public.messages(recipient_id);
CREATE INDEX idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX idx_messages_created_at ON public.messages(created_at);
CREATE INDEX idx_contact_submissions_status ON public.contact_submissions(status);
CREATE INDEX idx_contact_submissions_created_at ON public.contact_submissions(created_at);
CREATE INDEX idx_training_analytics_dog_id ON public.training_analytics(dog_id);
CREATE INDEX idx_referrals_referrer_id ON public.referrals(referrer_id);
CREATE INDEX idx_payments_profile_id ON public.payments(profile_id);
CREATE INDEX idx_client_notes_profile_id ON public.client_notes(profile_id);
CREATE INDEX idx_website_content_section_id ON public.website_content(section_id);
CREATE INDEX idx_website_content_fields_content_id ON public.website_content_fields(content_id);

-- Create functions and triggers for automatic updates

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers to relevant tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_dogs_updated_at BEFORE UPDATE ON public.dogs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_sessions_updated_at BEFORE UPDATE ON public.sessions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_contact_submissions_updated_at BEFORE UPDATE ON public.contact_submissions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_training_analytics_updated_at BEFORE UPDATE ON public.training_analytics FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_discount_codes_updated_at BEFORE UPDATE ON public.discount_codes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON public.payments FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_message_templates_updated_at BEFORE UPDATE ON public.message_templates FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_client_notes_updated_at BEFORE UPDATE ON public.client_notes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_system_settings_updated_at BEFORE UPDATE ON public.system_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_website_sections_updated_at BEFORE UPDATE ON public.website_sections FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_website_content_updated_at BEFORE UPDATE ON public.website_content FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_website_content_fields_updated_at BEFORE UPDATE ON public.website_content_fields FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to automatically create profile when user is created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, role)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'role', 'client')::user_role);
  RETURN NEW;
END;
$$ language 'plpgsql' security definer;

-- Trigger to create user record when auth.users record is created
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update training analytics when sessions change
CREATE OR REPLACE FUNCTION public.update_training_analytics()
RETURNS TRIGGER AS $$
DECLARE
  dog_record RECORD;
BEGIN
  -- Handle both INSERT, UPDATE, and DELETE operations
  IF TG_OP = 'DELETE' THEN
    dog_record.dog_id := OLD.dog_id;
  ELSE
    dog_record.dog_id := NEW.dog_id;
  END IF;

  -- Update or insert training analytics
  INSERT INTO public.training_analytics (
    dog_id,
    total_sessions,
    time_in_training_days,
    last_session_date,
    updated_at
  )
  SELECT
    s.dog_id,
    COUNT(*) as total_sessions,
    COALESCE(DATE_PART('day', MAX(s.scheduled_date) - MIN(s.scheduled_date)), 0) as time_in_training_days,
    MAX(s.scheduled_date::date) as last_session_date,
    NOW() as updated_at
  FROM public.sessions s
  WHERE s.dog_id = dog_record.dog_id
  GROUP BY s.dog_id
  ON CONFLICT (dog_id) DO UPDATE SET
    total_sessions = EXCLUDED.total_sessions,
    time_in_training_days = EXCLUDED.time_in_training_days,
    last_session_date = EXCLUDED.last_session_date,
    updated_at = EXCLUDED.updated_at;

  RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

-- Trigger to update training analytics when sessions change
CREATE TRIGGER update_training_analytics_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.sessions
  FOR EACH ROW EXECUTE FUNCTION public.update_training_analytics();