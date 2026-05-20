module.exports = async (req, res) => {
    try {
        const { prompt, aspectRatio } = req.body;
        const apiKey = process.env.API_KEY;

        if (!apiKey || apiKey === 'your_api_key_here') {
            return res.status(400).json({ error: 'API key not configured. Please update .env.local file.' });
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
        console.error('Error creating task:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
