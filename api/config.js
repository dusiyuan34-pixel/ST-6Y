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

  return new Response(
    JSON.stringify({
      apiBaseUrl: process.env.API_BASE_URL || 'https://api.kie.ai/api/v1',
      modelName: process.env.MODEL_NAME || 'gpt-image-2-text-to-image',
      defaultAspectRatio: process.env.DEFAULT_ASPECT_RATIO || 'auto'
    }),
    { headers: jsonHeaders }
  );
}
