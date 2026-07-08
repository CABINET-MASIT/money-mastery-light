import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const admin = supabaseUrl && serviceKey ? createClient(supabaseUrl, serviceKey) : null;

  let attemptId: string | null = null;
  let amount = 0;
  let currency = 'GNF';
  let country = 'GN';
  let return_url: string | undefined;
  let callback_url: string | undefined;
  let failure_url: string | undefined;

  const logAttempt = async (patch: Record<string, unknown>) => {
    if (!admin) return;
    try {
      if (attemptId) {
        await admin.from('payment_attempts').update(patch).eq('id', attemptId);
      } else {
        const { data } = await admin
          .from('payment_attempts')
          .insert({ amount, currency, country, return_url, callback_url, failure_url, ...patch })
          .select('id')
          .single();
        attemptId = data?.id ?? null;
      }
    } catch (e) {
      console.error('logAttempt failed', e);
    }
  };

  try {
    const licenseKey = Deno.env.get('LENGOPAY_LICENSE_KEY');
    const websiteId = Deno.env.get('LENGOPAY_WEBSITE_ID');

    if (!licenseKey || !websiteId) {
      console.error('Missing Lengo Pay secrets');
      return new Response(
        JSON.stringify({ error: 'Configuration serveur manquante' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body = await req.json().catch(() => ({}));
    amount = Number(body.amount);
    currency = typeof body.currency === 'string' ? body.currency : 'GNF';
    country = typeof body.country === 'string' ? body.country : 'GN';
    return_url = typeof body.return_url === 'string' ? body.return_url : undefined;
    callback_url = typeof body.callback_url === 'string' ? body.callback_url : undefined;
    failure_url = typeof body.failure_url === 'string' ? body.failure_url : undefined;

    if (!Number.isFinite(amount) || amount <= 0) {
      await logAttempt({ status: 'invalid', error: 'invalid amount' });
      return new Response(
        JSON.stringify({ error: 'Montant invalide' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    await logAttempt({ status: 'initiated' });

    const payload: Record<string, unknown> = { websiteid: websiteId, amount, currency, country };
    if (return_url) payload.return_url = return_url;
    if (callback_url) payload.callback_url = callback_url;
    if (failure_url) payload.failure_url = failure_url;

    const lpRes = await fetch('https://portal.lengopay.com/api/v1/payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Basic ${licenseKey}`,
      },
      body: JSON.stringify(payload),
    });

    const text = await lpRes.text();
    let data: any;
    try { data = JSON.parse(text); } catch { data = { raw: text }; }

    if (!lpRes.ok) {
      console.error('Lengo Pay error', lpRes.status, text);
      await logAttempt({ status: 'gateway_error', provider_response: data, error: `HTTP ${lpRes.status}` });
      return new Response(
        JSON.stringify({ error: 'Erreur passerelle Lengo Pay', status: lpRes.status, details: data }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const payment_url: string | undefined = data?.payment_url || data?.url || data?.data?.payment_url;
    await logAttempt({ status: payment_url ? 'redirected' : 'no_url', provider_response: data, payment_url });

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('lengopay-initiate crash', err);
    await logAttempt({ status: 'crash', error: String((err as Error)?.message ?? err) });
    return new Response(
      JSON.stringify({ error: 'Erreur interne' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
