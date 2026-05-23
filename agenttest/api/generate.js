export const config = { runtime: 'edge' };

export async function OPTIONS() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}

export async function POST(request) {
  const { prompt, aspectRatio } = await request.json();
  const apiKey = process.env.API_KEY;

  if (!apiKey || apiKey === 'your_api_key_here') {
    return new Response(
      JSON.stringify({ error: 'API key not configured' }),
      { status: 400, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
    );
  }

  if (!prompt) {
    return new Response(
      JSON.stringify({ error: 'Prompt is required' }),
      { status: 400, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
    );
  }

  const apiBaseUrl = process.env.API_BASE_URL || 'https://api.kie.ai/api/v1';
  const ratio = aspectRatio || process.env.DEFAULT_ASPECT_RATIO || 'auto';

  try {
    const response = await fetch(`${apiBaseUrl}/jobs/createTask`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: process.env.MODEL_NAME || 'gpt-image-2-text-to-image',
        input: {
          prompt: prompt,
          aspect_ratio: ratio
        }
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return new Response(
        JSON.stringify({ error: data.msg || data.message || 'Failed to create task' }),
        { status: response.status, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
      );
    }

    // Wrap the response to match frontend expected format: { data: { taskId } }
    let wrappedData;
    
    if (data.data && data.data.taskId) {
      // API returns { data: { taskId } } format
      wrappedData = data;
    } else if (data.taskId) {
      // API returns { taskId } format, wrap it
      wrappedData = { data: { taskId: data.taskId } };
    } else if (data.result && data.result.taskId) {
      // API returns { result: { taskId } } format
      wrappedData = { data: { taskId: data.result.taskId } };
    } else {
      // Unknown format, return as-is with error
      return new Response(
        JSON.stringify({ 
          error: 'Unexpected API response format',
          rawResponse: data 
        }),
        { status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
      );
    }

    return new Response(
      JSON.stringify(wrappedData),
      { headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Internal server error: ' + error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
    );
  }
}
