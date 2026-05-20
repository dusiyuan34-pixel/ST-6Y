@echo off
chcp 65001 >nul
title 思T-6 AI Creative Platform

echo ===========================================
echo   思T-6 AI Creative Platform 启动器
echo ===========================================
echo.

cd /d "%~dp0"

echo [1/3] 检查 Node.js 环境...
node --version >nul 2>&1
if errorlevel 1 (
    echo   错误: 未找到 Node.js，请先安装 Node.js
    pause
    exit /b 1
)
echo   Node.js 已就绪
echo.

echo [2/3] 安装依赖...
call npm install --silent
if errorlevel 1 (
    echo   错误: 依赖安装失败
    pause
    exit /b 1
)
echo   依赖安装完成
echo.

echo [3/3] 启动服务器...
echo.
echo ===========================================
echo   服务器启动中...
echo ===========================================
echo.
echo   重要提示：
echo   - 请在浏览器中打开: http://localhost:8080
echo   - 不要直接双击 HTML 文件！
echo   - 按 Ctrl+C 停止服务器
echo.
echo ===========================================
echo.

start http://localhost:8080

npm run start:frontend
