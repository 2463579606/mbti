# 🚀 开发服务器启动指南

## 当前状态

✅ **正在安装依赖**...
- 后端依赖安装中...
- 前端依赖安装中...

## 环境要求

### 必需软件
- ✅ Node.js 24.12.0 (已安装，符合要求)
- ⚠️ PostgreSQL 15+ (未检测到)
- ⚠️ Redis 7+ (未检测到)

### 快速安装数据库

#### 方案1: 使用Docker（推荐）

```bash
# 启动PostgreSQL和Redis
docker run -d \
  --name mbti-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=mbti_test \
  -p 5432:5432 \
  postgres:15-alpine

docker run -d \
  --name mbti-redis \
  -p 6379:6379 \
  redis:7-alpine
```

#### 方案2: 本地安装

**macOS**:
```bash
# PostgreSQL
brew install postgresql@15
brew services start postgresql@15

# Redis
brew install redis
brew services start redis
```

**Ubuntu/Debian**:
```bash
# PostgreSQL
sudo apt update
sudo apt install postgresql-15 postgresql-contrib-15
sudo systemctl start postgresql

# Redis
sudo apt install redis-server
sudo systemctl start redis
```

## 启动步骤

### 1. 初始化数据库

```bash
# 连接到PostgreSQL
psql -U postgres -d mbti_test

# 或使用Docker
docker exec -it mbti-postgres psql -U postgres -d mbti_test

# 执行初始化脚本
\i /Users/jiangyz/Documents/jiangyz/myproject/mbti/docs/DATABASE.md
```

### 2. 配置环境变量

```bash
cd /Users/jiangyz/Documents/jiangyz/myproject/mbti/backend
cp .env.example .env

# 编辑.env文件（如果需要）
# 默认配置应该可以工作
```

### 3. 启动后端服务器

```bash
cd /Users/jiangyz/Documents/jiangyz/myproject/mbti/backend
npm run dev
```

后端将运行在: **http://localhost:8000**

### 4. 启动前端服务器

```bash
# 新开一个终端
cd /Users/jiangyz/Documents/jiangyz/myproject/mbti/frontend
npm run dev
```

前端将运行在: **http://localhost:3000**

## 验证安装

### 检查后端
```bash
curl http://localhost:8000/api/v1/admin/health
```

应该返回:
```json
{
  "status": "healthy",
  "uptime": ...,
  "timestamp": "..."
}
```

### 检查前端
浏览器访问: http://localhost:3000

应该看到欢迎页面。

## 常见问题

### Q: 数据库连接失败？
**A**: 确保PostgreSQL正在运行：
```bash
# 检查Docker容器
docker ps | grep mbti-postgres

# 或检查本地服务
brew services list | grep postgresql  # macOS
sudo systemctl status postgresql     # Linux
```

### Q: Redis连接失败？
**A**: 确保Redis正在运行：
```bash
# 检查Docker容器
docker ps | grep mbti-redis

# 或检查本地服务
brew services list | grep redis      # macOS
sudo systemctl status redis         # Linux
```

### Q: 端口被占用？
**A**: 修改.env文件中的端口：
```env
PORT=8001  # 后端端口
```

或终止占用进程：
```bash
lsof -ti:8000 | xargs kill -9
lsof -ti:3000 | xargs kill -9
```

### Q: 依赖安装失败？
**A**: 清理缓存重试：
```bash
# 后端
cd backend
rm -rf node_modules package-lock.json
npm cache clean --force
npm install

# 前端
cd frontend
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

## 开发工具推荐

### 数据库管理
- **pgAdmin** - PostgreSQL图形界面
- **DBeaver** - 通用数据库工具
- **命令行**: `psql -U postgres -d mbti_test`

### Redis管理
- **RedisInsight** - Redis图形界面
- **命令行**: `redis-cli`

### API测试
- **Postman** - API测试工具
- **Insomnia** - 轻量级API客户端
- **curl** - 命令行工具

## 下一步

1. ✅ 等待依赖安装完成
2. ⚠️ 安装并启动PostgreSQL和Redis
3. 📝 初始化数据库
4. 🚀 启动后端和前端服务
5. 🎉 访问 http://localhost:3000

---

**当前进度**: 依赖安装中...
**预计时间**: 2-3分钟

---

Made with ❤️ by MBTI Team
