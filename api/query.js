export const config = { runtime: 'edge' };

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization'
};

const jsonHeaders = {
  'Content-Type': 'application/json',
  ...corsHeaders
};

export default async function handler(request) {
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (request.method !== 'GET') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: jsonHeaders }
    );
  }

  const { searchParams } = new URL(request.url);
  const taskId = searchParams.get('taskId');
  const apiKey = process.env.API_KEY;

  if (!apiKey || apiKey === 'your_api_key_here') {
    return new Response(
      JSON.stringify({ error: 'API key not configured' }),
      { status: 400, headers: jsonHeaders }
    );
  }

  if (!taskId) {
    return new Response(
      JSON.stringify({ error: 'Task ID is required' }),
      { status: 400, headers: jsonHeaders }
    );
  }

  const apiBaseUrl = process.env.API_BASE_URL || 'https://api.kie.ai/api/v1';

  try {
    const upstream = await fetch(`${apiBaseUrl}/jobs/recordInfo?taskId=${encodeURIComponent(taskId)}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`
      }
    });

    const data = await upstream.json();

    if (!upstream.ok) {
      return new Response(
        JSON.stringify({ error: data.msg || data.message || 'Failed to query task', upstream: data }),
        { status: upstream.status, headers: jsonHeaders }
      );
    }

    return new Response(JSON.stringify(data), { headers: jsonHeaders });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Internal server error: ' + error.message }),
      { status: 500, headers: jsonHeaders }
    );
  }
}
