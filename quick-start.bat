@echo off
REM MBTI快速启动脚本 (Windows)

echo 🚀 MBTI开发服务器快速启动
echo ================================

REM 检查Docker
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker未安装，请先安装Docker Desktop
    echo    访问: https://www.docker.com/products/docker-desktop
    pause
    exit /b 1
)

echo ✅ Docker已安装

REM 启动PostgreSQL
echo.
echo 📦 启动PostgreSQL...
docker run -d ^
  --name mbti-postgres ^
  --restart always ^
  -e POSTGRES_PASSWORD=postgres ^
  -e POSTGRES_DB=mbti_test ^
  -p 5432:5432 ^
  postgres:15-alpine

if %errorlevel% equ 0 (
    echo ✅ PostgreSQL启动成功
) else (
    echo ⚠️  PostgreSQL可能已存在
    docker start mbti-postgres 2>nul
)

REM 启动Redis
echo.
echo ⚡ 启动Redis...
docker run -d ^
  --name mbti-redis ^
  --restart always ^
  -p 6379:6379 ^
  redis:7-alpine

if %errorlevel% equ 0 (
    echo ✅ Redis启动成功
) else (
    echo ⚠️  Redis可能已存在
    docker start mbti-redis 2>nul
)

REM 等待数据库启动
echo.
echo ⏳ 等待数据库启动...
timeout /t 5 /nobreak >nul

REM 初始化数据库
echo.
echo 📝 初始化数据库...
docker exec -i mbti-postgres psql -U postgres -d mbti_test < %~dp0docs\DATABASE.md

if %errorlevel% equ 0 (
    echo ✅ 数据库初始化成功
) else (
    echo ❌ 数据库初始化失败，可能已经初始化过
)

REM 配置后端环境变量
echo.
echo ⚙️  配置后端...
cd %~dp0backend
if not exist .env (
    copy .env.example .env
    echo ✅ 后端配置文件已创建
) else (
    echo ✅ 后端配置文件已存在
)

REM 启动后端
echo.
echo 🔧 启动后端服务器...
echo    运行在: http://localhost:8000
echo    按 Ctrl+C 停止
start "MBTI Backend" cmd /k "cd %~dp0backend && npm run dev"

REM 等待后端启动
timeout /t 5 /nobreak >nul

REM 启动前端
echo.
echo 🎨 启动前端服务器...
echo    运行在: http://localhost:3000
echo    按 Ctrl+C 停止
start "MBTI Frontend" cmd /k "cd %~dp0frontend && npm run dev"

echo.
echo ================================
echo ✅ 服务启动完成！
echo.
echo 📱 访问地址:
echo    前端: http://localhost:3000
echo    后端: http://localhost:8000
echo    API:  http://localhost:8000/api/v1
echo.
echo 💡 提示:
echo    - 后端和前端在新的命令行窗口中运行
echo    - 关闭窗口即可停止服务
echo.
echo 🎉 开始开发吧！

pause
