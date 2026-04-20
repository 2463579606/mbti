# 快速启动指南

## 前置要求

确保你的系统已安装以下软件：

- **Node.js** 20+ ([下载](https://nodejs.org/))
- **PostgreSQL** 15+ ([下载](https://www.postgresql.org/download/))
- **Redis** 7+ ([下载](https://redis.io/download))
- **Git** ([下载](https://git-scm.com/downloads))

---

## 1. 数据库设置

### 启动 PostgreSQL

```bash
# macOS (Homebrew)
brew services start postgresql@15

# Linux
sudo systemctl start postgresql

# Windows
# 通过服务管理器启动 PostgreSQL 服务
```

### 创建数据库

```bash
# 连接到 PostgreSQL
psql -U postgres

# 创建数据库
CREATE DATABASE mbti_test;

# 退出
\q
```

### 初始化数据表和数据

```bash
# 在项目根目录执行
psql -U postgres -d mbti_test -f docs/DATABASE.md
```

验证数据：

```bash
psql -U postgres -d mbti_test

-- 检查表是否创建成功
\dt

-- 检查MBTI类型数据
SELECT COUNT(*) FROM mbti_types;  -- 应该返回 16

-- 检查题目数据
SELECT COUNT(*) FROM questions;   -- 应该返回 60

-- 退出
\q
```

### 启动 Redis

```bash
# macOS (Homebrew)
brew services start redis

# Linux
sudo systemctl start redis

# Windows
# 运行 redis-server.exe
```

验证 Redis：

```bash
redis-cli ping
# 应该返回: PONG
```

---

## 2. 后端启动

### 安装依赖

```bash
cd backend
npm install
```

### 配置环境变量

已提供默认配置（`.env`），如需修改：

```bash
# 编辑 .env 文件
vim .env
```

关键配置项：

```env
# 数据库
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=mbti_test

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
```

### 启动开发服务器

```bash
npm run dev
```

服务器将在 `http://localhost:8000` 启动

---

## 3. 前端启动

### 安装依赖

```bash
cd frontend
npm install
```

### 启动开发服务器

```bash
npm run dev
```

应用将在 `http://localhost:3000` 启动

---

## 4. 验证安装

### 测试后端 API

```bash
# 健康检查（待实现）
curl http://localhost:8000/api/v1/health

# 创建测试会话（待实现）
curl -X POST http://localhost:8000/api/v1/test/session
```

### 测试前端

打开浏览器访问：`http://localhost:3000`

应该能看到欢迎页面。

---

## 5. 开发工作流

### 推荐的终端布局

打开3个终端窗口：

```bash
# 终端1: 后端
cd backend
npm run dev

# 终端2: 前端
cd frontend
npm run dev

# 终端3: Git/其他命令
# 用于 git 操作、查看日志等
```

### 代码热重载

- **后端**: 修改代码后自动重启
- **前端**: 修改代码后自动刷新浏览器

### 查看日志

```bash
# 后端日志在终端直接输出

# PostgreSQL 日志
# macOS: /usr/local/var/log/postgresql@15/
# Linux: /var/log/postgresql/
```

---

## 6. 常见问题

### PostgreSQL 连接失败

```bash
# 检查 PostgreSQL 是否运行
brew services list | grep postgresql  # macOS
sudo systemctl status postgresql    # Linux

# 检查端口是否被占用
lsof -i :5432
```

### Redis 连接失败

```bash
# 检查 Redis 是否运行
redis-cli ping

# 如果失败，启动 Redis
brew services start redis  # macOS
sudo systemctl start redis  # Linux
```

### 端口被占用

```bash
# 查看端口占用
lsof -i :8000  # 后端端口
lsof -i :3000  # 前端端口

# 杀死占用进程
kill -9 <PID>
```

### npm install 失败

```bash
# 清理缓存
npm cache clean --force

# 删除 node_modules 重新安装
rm -rf node_modules package-lock.json
npm install
```

---

## 7. IDE 配置推荐

### VS Code 扩展

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "Vue.volar",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-typescript-next"
  ]
}
```

### VS Code 设置

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[vue]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  }
}
```

---

## 8. 下一步

查看 `PROJECT_STATUS.md` 了解完整的开发进度和任务清单。

查看 `CLAUDE.md` 了解开发规范和最佳实践。

查看 `docs/` 目录了解详细的架构设计。

---

**遇到问题？** 查看各文档中的"故障排查"章节，或参考 `CLAUDE.md` 中的开发原则。
