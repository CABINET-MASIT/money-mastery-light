CREATE TABLE public.payment_attempts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  amount NUMERIC NOT NULL,
  currency TEXT NOT NULL,
  country TEXT,
  return_url TEXT,
  callback_url TEXT,
  failure_url TEXT,
  payment_url TEXT,
  status TEXT NOT NULL DEFAULT 'initiated',
  provider_response JSONB,
  error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT ALL ON public.payment_attempts TO service_role;
ALTER TABLE public.payment_attempts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "No client access to payment_attempts"
ON public.payment_attempts FOR SELECT TO authenticated, anon USING (false);