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

  if (request.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: jsonHeaders }
    );
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return new Response(
      JSON.stringify({ error: 'Invalid JSON body' }),
      { status: 400, headers: jsonHeaders }
    );
  }

  const { prompt, aspectRatio } = body || {};
  const apiKey = process.env.API_KEY;

  if (!apiKey || apiKey === 'your_api_key_here') {
    return new Response(
      JSON.stringify({ error: 'API key not configured' }),
      { status: 400, headers: jsonHeaders }
    );
  }

  if (!prompt) {
    return new Response(
      JSON.stringify({ error: 'Prompt is required' }),
      { status: 400, headers: jsonHeaders }
    );
  }

  const apiBaseUrl = process.env.API_BASE_URL || 'https://api.kie.ai/api/v1';
  const ratio = aspectRatio || process.env.DEFAULT_ASPECT_RATIO || 'auto';
  const model = process.env.MODEL_NAME || 'gpt-image-2-text-to-image';

  try {
    const upstream = await fetch(`${apiBaseUrl}/jobs/createTask`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model,
        input: {
          prompt,
          aspect_ratio: ratio
        }
      })
    });

    const data = await upstream.json();

    if (!upstream.ok) {
      return new Response(
        JSON.stringify({ error: data.msg || data.message || 'Failed to create task', upstream: data }),
        { status: upstream.status, headers: jsonHeaders }
      );
    }

    let wrapped;
    if (data?.data?.taskId) {
      wrapped = data;
    } else if (data?.taskId) {
      wrapped = { data: { taskId: data.taskId } };
    } else if (data?.result?.taskId) {
      wrapped = { data: { taskId: data.result.taskId } };
    } else {
      return new Response(
        JSON.stringify({ error: 'Unexpected API response format', rawResponse: data }),
        { status: 502, headers: jsonHeaders }
      );
    }

    return new Response(JSON.stringify(wrapped), { headers: jsonHeaders });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Internal server error: ' + error.message }),
      { status: 500, headers: jsonHeaders }
    );
  }
}
