module.exports = (req, res) => {
    res.json({
        apiBaseUrl: process.env.API_BASE_URL || 'https://api.kie.ai/api/v1',
        modelName: process.env.MODEL_NAME || 'gpt-image-2-text-to-image',
        defaultAspectRatio: process.env.DEFAULT_ASPECT_RATIO || 'auto'
    });
};
