/**
 * 思T-6 AI平台 - 生产模式服务器
 * 调用真实的GPT Image 2 API
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const axios = require('axios');
require('dotenv').config({ path: '.env.local' });

const app = express();
const PORT = process.env.PORT || 3000;

// API配置
const API_KEY = process.env.API_KEY;
const API_BASE_URL = process.env.API_BASE_URL || 'https://api.kie.ai';
const MODEL_NAME = process.env.MODEL_NAME || 'gpt-image-2-text-to-image';

// 中间件配置
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// 存储任务状态（用于轮询）
const taskStore = {};

// ==================== API 路由 ====================

/**
 * 获取API配置
 * GET /api/config
 */
app.get('/api/config', (req, res) => {
    res.json({
        apiBaseUrl: API_BASE_URL,
        modelName: MODEL_NAME,
        defaultAspectRatio: process.env.DEFAULT_ASPECT_RATIO || 'auto',
        isMockMode: false,
        message: 'Production mode - using real API'
    });
});

/**
 * 创建图像生成任务
 * POST /api/generate
 */
app.post('/api/generate', async (req, res) => {
    const { prompt, aspectRatio = 'auto' } = req.body;
    
    console.log(`[生产模式] 收到图像生成请求:`);
    console.log(`  提示词: ${prompt}`);
    console.log(`  宽高比: ${aspectRatio}`);
    
    // 验证API密钥
    if (!API_KEY) {
        return res.status(500).json({
            success: false,
            code: 500,
            error: 'API_KEY not configured'
        });
    }
    
    try {
        // 调用GPT Image 2 API - 使用标准模型推理端点
        const apiEndpoint = `${API_BASE_URL}/models/${MODEL_NAME}/inference`;
        console.log(`  🔄 正在调用API: ${apiEndpoint}`);
        console.log(`  📝 请求体: ${JSON.stringify({ prompt, aspect_ratio: aspectRatio })}`);
        
        const response = await axios.post(
            apiEndpoint,
            {
                prompt: prompt,
                aspect_ratio: aspectRatio
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${API_KEY}`
                }
            }
        );
        
        console.log(`  📤 API响应状态: ${response.status}`);
        console.log(`  📤 API响应数据: ${JSON.stringify(response.data)}`);
        
        const taskId = response.data.data?.taskId || response.data?.taskId;
        
        // 存储任务信息
        taskStore[taskId] = {
            status: 'running',
            prompt,
            aspectRatio,
            createdAt: Date.now()
        };
        
        console.log(`  ✅ 任务创建成功: ${taskId}`);
        
        res.json({
            success: true,
            code: 200,
            data: {
                taskId
            },
            message: 'Task created successfully',
            isMock: false
        });
        
    } catch (error) {
        console.error(`  ❌ 请求失败: ${error.message}`);
        console.error(`  📊 响应状态: ${error.response?.status || 'N/A'}`);
        console.error(`  📊 响应数据: ${error.response?.data ? JSON.stringify(error.response.data) : 'N/A'}`);
        console.error(`  📊 请求URL: ${error.config?.url || 'N/A'}`);
        
        const errorMsg = error.response?.data?.error || error.response?.data?.message || error.message;
        
        res.status(error.response?.status || 500).json({
            success: false,
            code: error.response?.status || 500,
            error: errorMsg,
            details: {
                url: error.config?.url,
                status: error.response?.status,
                responseData: error.response?.data
            }
        });
    }
});

/**
 * 查询任务状态
 * GET /api/query?taskId=xxx
 */
app.get('/api/query', async (req, res) => {
    const { taskId } = req.query;
    
    if (!taskId) {
        return res.status(400).json({
            success: false,
            code: 400,
            error: 'Missing taskId parameter'
        });
    }
    
    // 验证API密钥
    if (!API_KEY) {
        return res.status(500).json({
            success: false,
            code: 500,
            error: 'API_KEY not configured'
        });
    }
    
    try {
        // 调用GPT Image 2 API查询状态
        const response = await axios.get(
            `${API_BASE_URL}/text2image/task`,
            {
                params: { task_id: taskId },
                headers: {
                    'Authorization': `Bearer ${API_KEY}`
                }
            }
        );
        
        const data = response.data.data;
        const state = data.state;
        
        // 更新本地任务状态
        if (taskStore[taskId]) {
            taskStore[taskId].status = state;
            if (state === 'success') {
                taskStore[taskId].imageUrl = data.result?.resultUrls?.[0];
                taskStore[taskId].resultJson = JSON.stringify(data.result);
            }
        }
        
        // 构建响应
        const result = {
            success: true,
            code: 200,
            data: {
                taskId,
                state: state,
                prompt: taskStore[taskId]?.prompt || '',
                resultJson: state === 'success' ? JSON.stringify(data.result) : null
            },
            isMock: false
        };
        
        console.log(`[查询] 任务 ${taskId} 状态: ${state}`);
        
        res.json(result);
        
    } catch (error) {
        console.error(`[查询失败] 任务 ${taskId}: ${error.message}`);
        const errorMsg = error.response?.data?.error || error.message;
        
        res.status(error.response?.status || 500).json({
            success: false,
            code: error.response?.status || 500,
            error: errorMsg
        });
    }
});

/**
 * 健康检查
 * GET /api/health
 */
app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: Date.now(),
        mode: 'production mode',
        apiConfigured: !!API_KEY
    });
});

// ==================== 前端页面路由 ====================

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/create', (req, res) => {
    res.sendFile(path.join(__dirname, 'create.html'));
});

app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, 'about.html'));
});

// ==================== 启动服务器 ====================

app.listen(PORT, () => {
    console.log('========================================');
    console.log('    ST-6 AI Platform - Production Mode  ');
    console.log('========================================');
    console.log(`\n🚀 Server started on port ${PORT}:`);
    console.log(`   Homepage: http://localhost:${PORT}/`);
    console.log(`   Create Page: http://localhost:${PORT}/create`);
    console.log(`   API Config: http://localhost:${PORT}/api/config`);
    console.log(`   Health Check: http://localhost:${PORT}/api/health`);
    console.log(`\n📋 Production Mode Info:`);
    console.log(`   - API Key configured: ${API_KEY ? '✅ Yes' : '❌ No'}`);
    console.log(`   - API Base URL: ${API_BASE_URL}`);
    console.log(`   - Model Name: ${MODEL_NAME}`);
    console.log(`\n⚠️  IMPORTANT:`);
    console.log(`   Make sure to set API_KEY in .env.local file`);
    console.log(`\n========================================`);
});
