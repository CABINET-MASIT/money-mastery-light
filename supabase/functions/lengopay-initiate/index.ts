import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

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
    const amount = Number(body.amount);
    const currency = typeof body.currency === 'string' ? body.currency : 'GNF';
    const country = typeof body.country === 'string' ? body.country : 'GN';
    const return_url = typeof body.return_url === 'string' ? body.return_url : undefined;
    const callback_url = typeof body.callback_url === 'string' ? body.callback_url : undefined;
    const failure_url = typeof body.failure_url === 'string' ? body.failure_url : undefined;

    if (!Number.isFinite(amount) || amount <= 0) {
      return new Response(
        JSON.stringify({ error: 'Montant invalide' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const payload: Record<string, unknown> = {
      websiteid: websiteId,
      amount,
      currency,
      country,
    };
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
    let data: unknown;
    try {
      data = JSON.parse(text);
    } catch {
      data = { raw: text };
    }

    if (!lpRes.ok) {
      console.error('Lengo Pay error', lpRes.status, text);
      return new Response(
        JSON.stringify({ error: 'Erreur passerelle Lengo Pay', status: lpRes.status, details: data }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('lengopay-initiate crash', err);
    return new Response(
      JSON.stringify({ error: 'Erreur interne' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
