/**
 * 前端静态文件服务器
 * 用于解决 CORS 和 file:// 协议问题
 */

const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 8080;

// 启用 CORS
app.use(cors({
    origin: '*',
    credentials: true
}));

// 解析 JSON 请求体
app.use(express.json({ limit: '10mb' }));

// 提供静态文件
app.use(express.static(__dirname));

// 提供 API 代理服务
const axios = require('axios');
const crypto = require('crypto');
require('dotenv').config({ path: '.env.local' });

// 火山引擎 API 配置
const VOLCENGINE_CONFIG = {
    apiKey: process.env.VOLCENGINE_API_KEY,
    baseUrl: 'https://ark.bytedance.net/api/text2image'
};

// 生成签名
function generateSignature(method, uri, params = {}) {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const nonce = Math.random().toString(36).substring(2, 15);
    const sortedParams = Object.keys(params).sort().map(key => `${key}=${encodeURIComponent(params[key])}`).join('&');
    const signStr = `${method}\n${uri}\n${timestamp}\n${nonce}\n${VOLCENGINE_CONFIG.apiKey}\n${sortedParams}`;
    const signature = crypto.createHmac('sha256', process.env.VOLCENGINE_API_SECRET || '').update(signStr).digest('base64');
    return { 'X-Date': timestamp, 'X-Nonce': nonce, 'X-Key': VOLCENGINE_CONFIG.apiKey, 'X-Signature': signature };
}

// 图像生成 API 代理
app.post('/api/ai/image/generate', async (req, res) => {
    try {
        const { prompt, model = 'doubao-seedream-5-0-260128', width = 1024, height = 1024, style = 'auto', num_images = 1, mock = false } = req.body;

        if (!prompt || !prompt.trim()) {
            return res.status(400).json({ error: 'prompt 不能为空' });
        }

        console.log('图像生成请求:', { prompt, model, mock });

        // 模拟模式或无 API Key
        if (mock || !VOLCENGINE_CONFIG.apiKey) {
            await new Promise(resolve => setTimeout(resolve, 2000));
            return res.json({
                success: true,
                data: {
                    images: [{ url: `https://picsum.photos/${width}/${height}?random=${Math.random()}` }],
                    task_id: `task_${Date.now()}`,
                    status: 'SUCCESS'
                },
                model,
                prompt,
                mock: true
            });
        }

        // 真实 API 调用
        const requestData = { model, prompt, width, height, style, num_images, response_format: 'url' };
        const headers = generateSignature('POST', '/api/text2image', requestData);
        headers['Content-Type'] = 'application/json';
        headers['Authorization'] = `Bearer ${VOLCENGINE_CONFIG.apiKey}`;

        try {
            const response = await axios({
                method: 'POST',
                url: VOLCENGINE_CONFIG.baseUrl,
                headers,
                data: requestData,
                timeout: 120000
            });

            res.json({ success: true, data: response.data, model, prompt });
        } catch (apiError) {
            console.error('API 调用失败，使用模拟模式:', apiError.message);
            await new Promise(resolve => setTimeout(resolve, 2000));
            res.json({
                success: true,
                data: {
                    images: [{ url: `https://picsum.photos/${width}/${height}?random=${Math.random()}` }],
                    task_id: `task_${Date.now()}`,
                    status: 'SUCCESS'
                },
                model,
                prompt,
                mock: true,
                warning: '已切换到模拟模式'
            });
        }
    } catch (error) {
        console.error('图像生成失败:', error.message);
        res.status(500).json({ success: false, error: error.message });
    }
});

// 聊天 API 代理
app.post('/api/ai/chat', async (req, res) => {
    try {
        const { messages, model = 'Doubao', temperature = 0.7 } = req.body;

        if (!messages || !Array.isArray(messages)) {
            return res.status(400).json({ error: 'messages 必须是数组格式' });
        }

        console.log('聊天请求:', { model, messageCount: messages.length });

        // 模拟模式
        await new Promise(resolve => setTimeout(resolve, 1000));
        const lastMessage = messages[messages.length - 1]?.content || '';
        const mockResponse = `这是对"${lastMessage}"的模拟回复。实际上，这需要真实的AI API支持。`;

        res.json({
            success: true,
            data: {
                choices: [{
                    message: {
                        role: 'assistant',
                        content: mockResponse
                    }
                }]
            },
            model,
            mock: true
        });
    } catch (error) {
        console.error('聊天失败:', error.message);
        res.status(500).json({ success: false, error: error.message });
    }
});

// 健康检查
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        apiKeyConfigured: !!VOLCENGINE_CONFIG.apiKey,
        port: PORT
    });
});

// 主页
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'create.html'));
});

app.listen(PORT, () => {
    console.log('===========================================');
    console.log('  前端静态文件服务器已启动');
    console.log('===========================================');
    console.log(`  访问地址: http://localhost:${PORT}`);
    console.log(`  或直接访问: http://localhost:${PORT}/create.html`);
    console.log('===========================================');
    console.log('  请在浏览器中打开上述地址');
    console.log('  不要直接双击 HTML 文件！');
    console.log('===========================================');
});
