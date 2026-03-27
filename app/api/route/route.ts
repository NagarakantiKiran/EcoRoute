export async function POST(req: Request) {
  // ORS_API_KEY lives HERE ONLY. Never add NEXT_PUBLIC_ prefix.
  try {
    const { origin, destination, profile, alternatives } = await req.json();
    
    // Validate required parameters
    if (!origin || !destination || !profile) {
      return Response.json(
        { error: 'Missing required parameters: origin, destination, profile' },
        { status: 400 }
      );
    }

    const apiKey = process.env.ORS_API_KEY;
    if (!apiKey) {
      console.error('ORS_API_KEY not configured in environment');
      return Response.json(
        { error: 'Routing service not configured' },
        { status: 500 }
      );
    }

    // Validate coordinate format
    if (!Array.isArray(origin) || !Array.isArray(destination) || 
        origin.length !== 2 || destination.length !== 2) {
      return Response.json(
        { error: 'Coordinates must be [lng, lat] arrays' },
        { status: 400 }
      );
    }

    const orsUrl = `https://api.openrouteservice.org/v2/directions/${profile}/geojson`;
    
    const body = {
      coordinates: [origin, destination],
      instructions: false,
      ...(alternatives && { alternatives: true }),
    };

    const orsRes = await fetch(orsUrl, {
      method: 'POST',
      headers: {
        'Authorization': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    // Handle HTTP 429 (rate limit) with clear message for OSRM fallback
    if (orsRes.status === 429) {
      return Response.json(
        { error: 'Route service busy, trying backup...' },
        { status: 429 }
      );
    }

    if (!orsRes.ok) {
      const errorText = await orsRes.text();
      console.error(`ORS API error [${orsRes.status}]:`, errorText);
      return Response.json(
        { error: `Route service error: ${orsRes.statusText}` },
        { status: orsRes.status }
      );
    }

    const data = await orsRes.json();
    return Response.json(data);
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown routing error';
    console.error('Route proxy error:', err);
    return Response.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
