#!/bin/bash

# MBTI快速启动脚本

echo "🚀 MBTI开发服务器快速启动"
echo "================================"

# 检查Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker未安装，请先安装Docker"
    echo "   访问: https://www.docker.com/products/docker-desktop"
    exit 1
fi

echo "✅ Docker已安装"

# 启动PostgreSQL
echo ""
echo "📦 启动PostgreSQL..."
docker run -d \
  --name mbti-postgres \
  --restart always \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=mbti_test \
  -p 5432:5432 \
  postgres:15-alpine

if [ $? -eq 0 ]; then
    echo "✅ PostgreSQL启动成功"
else
    echo "⚠️  PostgreSQL可能已存在，尝试启动现有容器..."
    docker start mbti-postgres 2>/dev/null
fi

# 启动Redis
echo ""
echo "⚡ 启动Redis..."
docker run -d \
  --name mbti-redis \
  --restart always \
  -p 6379:6379 \
  redis:7-alpine

if [ $? -eq 0 ]; then
    echo "✅ Redis启动成功"
else
    echo "⚠️  Redis可能已存在，尝试启动现有容器..."
    docker start mbti-redis 2>/dev/null
fi

# 等待数据库启动
echo ""
echo "⏳ 等待数据库启动..."
sleep 5

# 初始化数据库
echo ""
echo "📝 初始化数据库..."
docker exec -i mbti-postgres psql -U postgres -d mbti_test < /Users/jiangyz/Documents/jiangyz/myproject/mbti/docs/DATABASE.md

if [ $? -eq 0 ]; then
    echo "✅ 数据库初始化成功"
else
    echo "❌ 数据库初始化失败，可能已经初始化过"
fi

# 配置后端环境变量
echo ""
echo "⚙️  配置后端..."
cd /Users/jiangyz/Documents/jiangyz/myproject/mbti/backend
if [ ! -f .env ]; then
    cp .env.example .env
    echo "✅ 后端配置文件已创建"
else
    echo "✅ 后端配置文件已存在"
fi

# 启动后端
echo ""
echo "🔧 启动后端服务器..."
echo "   运行在: http://localhost:8000"
echo "   按 Ctrl+C 停止"
cd /Users/jiangyz/Documents/jiangyz/myproject/mbti/backend
npm run dev &
BACKEND_PID=$!

# 等待后端启动
sleep 5

# 启动前端
echo ""
echo "🎨 启动前端服务器..."
echo "   运行在: http://localhost:3000"
echo "   按 Ctrl+C 停止"
npm run dev &
FRONTEND_PID=$!

echo ""
echo "================================"
echo "✅ 服务启动完成！"
echo ""
echo "📱 访问地址:"
echo "   前端: http://localhost:3000"
echo "   后端: http://localhost:8000"
echo "   API:  http://localhost:8000/api/v1"
echo ""
echo "💡 提示:"
echo "   - 后端日志: 在当前终端"
echo "   - 前端日志: 新开终端查看"
echo "   - 停止服务: 按 Ctrl+C 或运行: kill $BACKEND_PID $FRONTEND_PID"
echo ""
echo "🎉 开始开发吧！"

# 保持脚本运行
wait
