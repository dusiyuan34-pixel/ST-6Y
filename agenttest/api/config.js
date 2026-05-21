export async function GET() {
  return new Response(
    JSON.stringify({
      apiBaseUrl: process.env.API_BASE_URL || 'https://api.kie.ai/api/v1',
      modelName: process.env.MODEL_NAME || 'gpt-image-2-text-to-image',
      defaultAspectRatio: process.env.DEFAULT_ASPECT_RATIO || 'auto'
    }),
    {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
      }
    }
  );
}
