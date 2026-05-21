/**
 * 思T-6 AI平台 - 本地测试服务器
 * 模拟Vercel环境，验证图像生成功能
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件配置
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// 模拟图像生成结果（测试数据）- 使用可靠的图像服务
const mockImages = [
    'https://picsum.photos/800/600?random=1',
    'https://picsum.photos/800/600?random=2',
    'https://picsum.photos/800/600?random=3',
    'https://picsum.photos/800/600?random=4',
    'https://picsum.photos/800/600?random=5',
    'https://picsum.photos/1200/800?random=6',
    'https://picsum.photos/1024/768?random=7'
];

// 模拟任务状态
const taskStore = {};

// ==================== API 路由 ====================

/**
 * 获取API配置
 * GET /api/config
 */
app.get('/api/config', (req, res) => {
    res.json({
        apiBaseUrl: process.env.API_BASE_URL || 'https://api.kie.ai/api/v1',
        modelName: process.env.MODEL_NAME || 'gpt-image-2-text-to-image',
        defaultAspectRatio: process.env.DEFAULT_ASPECT_RATIO || 'auto',
        isMockMode: true,
        message: 'Local test mode - using mock data'
    });
});

/**
 * 创建图像生成任务
 * POST /api/generate
 */
app.post('/api/generate', async (req, res) => {
    const { prompt, aspectRatio = 'auto' } = req.body;
    
    console.log(`[测试] 收到图像生成请求:`);
    console.log(`  提示词: ${prompt}`);
    console.log(`  宽高比: ${aspectRatio}`);
    
    // 生成任务ID
    const taskId = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // 存储任务状态
    taskStore[taskId] = {
        status: 'running',
        prompt,
        aspectRatio,
        createdAt: Date.now()
    };
    
    // 模拟异步处理（2-5秒后完成）
    setTimeout(() => {
        const randomImage = mockImages[Math.floor(Math.random() * mockImages.length)];
        const resultJson = JSON.stringify({
            resultUrls: [randomImage],
            taskId: taskId,
            status: 'success'
        });
        taskStore[taskId] = {
            ...taskStore[taskId],
            status: 'success',
            imageUrl: randomImage,
            resultJson: resultJson,
            completedAt: Date.now()
        };
    }, 2000 + Math.random() * 3000);
    
    res.json({
        success: true,
        code: 200,
        data: {
            taskId
        },
        message: 'Task created successfully',
        isMock: true
    });
});

/**
 * 查询任务状态
 * GET /api/query?taskId=xxx
 */
app.get('/api/query', (req, res) => {
    const { taskId } = req.query;
    
    if (!taskId) {
        return res.status(400).json({
            success: false,
            code: 400,
            error: 'Missing taskId parameter'
        });
    }
    
    const task = taskStore[taskId];
    
    if (!task) {
        return res.status(404).json({
            success: false,
            code: 404,
            error: 'Task not found'
        });
    }
    
    res.json({
        success: true,
        code: 200,
        data: {
            taskId,
            state: task.status,
            imageUrl: task.imageUrl || null,
            prompt: task.prompt,
            resultJson: task.resultJson || null
        },
        isMock: true
    });
});

/**
 * 健康检查
 * GET /api/health
 */
app.get('/api/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: Date.now(),
        mode: 'local test mode'
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
    console.log('    ST-6 AI Platform - Local Test Server');
    console.log('========================================');
    console.log(`\n🚀 Server started:`);
    console.log(`   Homepage: http://localhost:${PORT}/`);
    console.log(`   Create Page: http://localhost:${PORT}/create`);
    console.log(`   API Config: http://localhost:${PORT}/api/config`);
    console.log(`   Health Check: http://localhost:${PORT}/api/health`);
    console.log(`\n📋 Test Mode Info:`);
    console.log(`   - Using mock data, no real API key required`);
    console.log(`   - Image generation delay: 2-5 seconds`);
    console.log(`   - Refresh page for different test images`);
    console.log(`\n========================================`);
});
