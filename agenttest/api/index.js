module.exports = async (req, res) => {
    const { pathname } = new URL(req.url, 'http://localhost');
    
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (pathname === '/api/config') {
        res.json({
            apiBaseUrl: process.env.API_BASE_URL || 'https://api.kie.ai/api/v1',
            modelName: process.env.MODEL_NAME || 'gpt-image-2-text-to-image',
            defaultAspectRatio: process.env.DEFAULT_ASPECT_RATIO || 'auto'
        });
        return;
    }

    if (pathname === '/api/generate') {
        try {
            const { prompt, aspectRatio } = req.body;
            const apiKey = process.env.API_KEY;

            if (!apiKey || apiKey === 'your_api_key_here') {
                return res.status(400).json({ error: 'API key not configured' });
            }

            if (!prompt) {
                return res.status(400).json({ error: 'Prompt is required' });
            }

            const apiBaseUrl = process.env.API_BASE_URL || 'https://api.kie.ai/api/v1';
            const ratio = aspectRatio || process.env.DEFAULT_ASPECT_RATIO || 'auto';

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
                return res.status(response.status).json({ error: data.msg || 'Failed to create task' });
            }

            res.json(data);
        } catch (error) {
            console.error('Error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
        return;
    }

    if (pathname === '/api/query') {
        try {
            const { taskId } = req.query;
            const apiKey = process.env.API_KEY;

            if (!apiKey || apiKey === 'your_api_key_here') {
                return res.status(400).json({ error: 'API key not configured' });
            }

            if (!taskId) {
                return res.status(400).json({ error: 'Task ID is required' });
            }

            const apiBaseUrl = process.env.API_BASE_URL || 'https://api.kie.ai/api/v1';

            const response = await fetch(`${apiBaseUrl}/jobs/recordInfo?taskId=${taskId}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${apiKey}`
                }
            });

            const data = await response.json();

            if (!response.ok) {
                return res.status(response.status).json({ error: data.msg || 'Failed to query task' });
            }

            res.json(data);
        } catch (error) {
            console.error('Error:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
        return;
    }

    res.status(404).json({ error: 'Not found' });
};
