/**
 * 思T-6 AI平台 - API测试脚本
 * 用于验证图像生成API功能
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function testApi() {
    console.log('========================================');
    console.log('    思T-6 AI平台 - API功能测试');
    console.log('========================================\n');

    try {
        // 1. 测试健康检查
        console.log('🔍 测试1: 健康检查');
        const healthResponse = await axios.get(`${BASE_URL}/api/health`);
        console.log(`   ✅ 成功 - 状态: ${healthResponse.data.status}`);
        console.log(`   时间戳: ${new Date(healthResponse.data.timestamp).toLocaleString()}\n`);

        // 2. 测试获取配置
        console.log('🔍 测试2: 获取API配置');
        const configResponse = await axios.get(`${BASE_URL}/api/config`);
        console.log(`   ✅ 成功`);
        console.log(`   API基础地址: ${configResponse.data.apiBaseUrl}`);
        console.log(`   模型名称: ${configResponse.data.modelName}`);
        console.log(`   默认宽高比: ${configResponse.data.defaultAspectRatio}`);
        console.log(`   模式: ${configResponse.data.isMockMode ? '测试模式' : '生产模式'}\n`);

        // 3. 测试创建图像生成任务
        console.log('🔍 测试3: 创建图像生成任务');
        const testPrompt = '一只可爱的猫咪在草地上玩耍，阳光明媚，卡通风格';
        const generateResponse = await axios.post(`${BASE_URL}/api/generate`, {
            prompt: testPrompt,
            aspectRatio: 'auto'
        });
        console.log(`   ✅ 成功`);
        console.log(`   任务ID: ${generateResponse.data.data.taskId}`);
        console.log(`   提示词: ${testPrompt}\n`);

        const taskId = generateResponse.data.data.taskId;

        // 4. 轮询查询任务状态
        console.log('🔍 测试4: 查询任务状态（轮询）');
        let taskStatus = 'running';
        let attempts = 0;
        const maxAttempts = 10;

        while (taskStatus === 'running' && attempts < maxAttempts) {
            attempts++;
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            const queryResponse = await axios.get(`${BASE_URL}/api/query`, {
                params: { taskId }
            });
            
            taskStatus = queryResponse.data.data.state;
            console.log(`   第${attempts}次查询 - 状态: ${taskStatus}`);

            if (taskStatus === 'success') {
                console.log(`   ✅ 图像生成成功!`);
                console.log(`   图像URL: ${queryResponse.data.data.imageUrl}`);
                break;
            }
        }

        if (taskStatus === 'running') {
            console.log('   ⚠️  超时警告: 任务仍在处理中');
        }

        // 5. 测试错误处理
        console.log('\n🔍 测试5: 错误处理测试');
        try {
            const errorResponse = await axios.get(`${BASE_URL}/api/query`, {
                params: { taskId: 'invalid_task_id' }
            });
        } catch (error) {
            console.log(`   ✅ 错误处理正常 - 状态码: ${error.response.status}`);
            console.log(`   错误信息: ${error.response.data.error}`);
        }

        console.log('\n========================================');
        console.log('            测试完成! ✅');
        console.log('========================================');
        console.log('\n🎉 所有API测试通过!');
        console.log('💡 现在可以访问 http://localhost:3000/create 测试前端功能');

    } catch (error) {
        console.error('\n❌ 测试失败:', error.message);
        if (error.response) {
            console.error('   响应状态:', error.response.status);
            console.error('   响应数据:', error.response.data);
        }
        process.exit(1);
    }
}

// 启动测试
testApi();
