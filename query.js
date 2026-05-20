module.exports = async (req, res) => {
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
        console.error('Error querying task:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
