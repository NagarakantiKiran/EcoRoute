import { NextRequest, NextResponse } from 'next/server';
import { RouteResult } from '@/types';

const GROQ_API_KEY = process.env.GROQ_API_KEY ?? '';
const GROQ_MODEL = 'llama-3.3-70b-versatile';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

interface AdvisorRequest {
  routes: RouteResult[];
  origin: string;
  destination: string;
}

interface AdvisorResponse {
  advice: string;
  tip: string;
}

export async function POST(req: NextRequest) {
  if (!GROQ_API_KEY) {
    return NextResponse.json(
      { error: 'GROQ_API_KEY not configured' },
      { status: 500 }
    );
  }

  let body: AdvisorRequest;
  try {
    body = (await req.json()) as AdvisorRequest;
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { routes, origin, destination } = body;

  if (!routes?.length) {
    return NextResponse.json({ error: 'No routes provided' }, { status: 400 });
  }

  const routeSummary = routes
    .map((route) => {
      const distKm = (route.distanceMeters / 1000).toFixed(2);
      const durMin = (route.durationSeconds / 60).toFixed(0);
      return `${route.mode}: ${distKm} km, ${durMin} min, ${route.co2Kg} kg CO2, Grade ${route.ecoGrade}`;
    })
    .join('\n');

  const prompt = `You are a friendly eco-travel advisor for EcoRoute, a green navigation app.\n\nThe user is travelling from "${origin || 'origin'}" to "${destination || 'destination'}".\n\nHere are the calculated route options:\n${routeSummary}\n\nWrite a response in exactly this JSON format:\n{\n  "advice": "2-3 sentences. Explain which route is greenest and why, using the actual numbers. Express the CO2 difference in a relatable way (e.g. equivalent to charging a phone 40 times, or 3% of a daily footprint). Keep it warm and encouraging.",\n  "tip": "One short practical tip starting with an action verb. Maximum 20 words. Make it specific to this journey — the distance, mode, or conditions."\n}\n\nReturn only valid JSON. No markdown fences, no backticks, no extra text outside the JSON object.`;

  try {
    const groqRes = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 220,
        temperature: 0.6,
      }),
    });

    if (!groqRes.ok) {
      const errText = await groqRes.text();
      console.error('Groq API error:', groqRes.status, errText);
      return NextResponse.json(
        { error: `Groq responded with ${groqRes.status}` },
        { status: 502 }
      );
    }

    const groqData = (await groqRes.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };

    const content = groqData.choices?.[0]?.message?.content?.trim() ?? '';
    if (!content) {
      return NextResponse.json({ error: 'Empty response from Groq' }, { status: 502 });
    }

    const clean = content.replace(/```json|```/g, '').trim();

    let parsed: AdvisorResponse;
    try {
      parsed = JSON.parse(clean) as AdvisorResponse;
    } catch {
      console.error('Failed to parse Groq JSON:', clean);
      return NextResponse.json({ error: 'Groq returned malformed JSON' }, { status: 502 });
    }

    if (!parsed.advice || !parsed.tip) {
      return NextResponse.json({ error: 'Incomplete response from Groq' }, { status: 502 });
    }

    return NextResponse.json(parsed);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('Advisor proxy error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
