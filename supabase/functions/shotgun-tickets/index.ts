import "jsr:@supabase/functions-js/edge-runtime.d.ts";

interface ShotgunTicket {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  quantity: number;
  ticket_type: string;
  price_cents: number;
  status: string;
  created_at: string;
  venue?: string;
}

Deno.serve(async (req: Request) => {
  // Vérifier la méthode
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Récupérer le body
  const { date } = await req.json();
  
  if (!date) {
    return new Response(JSON.stringify({ error: 'Date required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // Token API Shotgun et Organizer ID (stockés dans les variables d'environnement côté serveur)
  const shotgunToken = Deno.env.get('SHOTGUN_API_TOKEN');
  const organizerId = Deno.env.get('SHOTGUN_ORGANIZER_ID');
  
  if (!shotgunToken || !organizerId) {
    return new Response(JSON.stringify({ error: 'Shotgun API not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    // Appel à l'API Shotgun
    // Format de date: YYYY-MM-DD
    const startDate = `${date}T00:00:00Z`;
    const endDate = `${date}T23:59:59Z`;
    
    const url = `https://api.shotgun.live/v1/organizers/${organizerId}/orders?created_after=${encodeURIComponent(startDate)}&created_before=${encodeURIComponent(endDate)}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${shotgunToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Shotgun API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    // Transformer les données Shotgun en format simplifié
    const tickets: ShotgunTicket[] = (data.orders || []).flatMap((order: any) => {
      return (order.tickets || []).map((ticket: any) => ({
        id: ticket.id,
        first_name: order.customer?.first_name || '',
        last_name: order.customer?.last_name || '',
        email: order.customer?.email || '',
        phone: order.customer?.phone || null,
        quantity: 1,
        ticket_type: ticket.ticket_type?.name || 'Standard',
        price_cents: ticket.price_cents || 0,
        status: ticket.status || 'unknown',
        created_at: order.created_at,
        venue: ticket.venue?.name || null
      }));
    });

    return new Response(JSON.stringify({ tickets }), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        'Cache-Control': 'max-age=60'
      }
    });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
});
