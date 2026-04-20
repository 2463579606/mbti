# MBTI 测试系统 - 安装和运行指南

## 系统要求

- Node.js 20+
- PostgreSQL 15+
- Redis 7+
- Git

## 快速开始

### 1. 克隆项目

```bash
git clone <repository-url>
cd mbti
```

### 2. 数据库设置

#### 创建数据库

```bash
# 连接到PostgreSQL
psql -U postgres

# 创建数据库
CREATE DATABASE mbti_test;

# 退出
\q
```

#### 初始化数据表和数据

```bash
# 执行初始化脚本
psql -U postgres -d mbti_test -f docs/DATABASE.md
```

#### 验证数据

```bash
psql -U postgres -d mbti_test

-- 检查表
\dt

-- 检查数据
SELECT COUNT(*) FROM mbti_types;  -- 应该返回 16
SELECT COUNT(*) FROM questions;   -- 应该返回 60

-- 退出
\q
```

### 3. 启动 Redis

```bash
# macOS
brew services start redis

# Linux
sudo systemctl start redis

# Windows
redis-server
```

### 4. 后端设置

```bash
cd backend

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

后端将在 `http://localhost:8000` 启动

### 5. 前端设置

```bash
cd frontend

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

前端将在 `http://localhost:3000` 启动

## 访问应用

打开浏览器访问：`http://localhost:3000`

## 项目结构

```
mbti/
├── backend/              # 后端 (Node.js + TypeScript + NestJS)
│   ├── cmd/api/         # 应用入口
│   ├── internal/        # 私有代码
│   │   ├── entities/    # TypeORM实体
│   │   ├── service/     # 业务逻辑
│   │   ├── repository/  # 数据访问
│   │   └── handler/     # API控制器
│   ├── pkg/             # 公共代码
│   └── package.json
├── frontend/            # 前端 (Vue 3 + TypeScript)
│   ├── src/
│   │   ├── api/        # API调用
│   │   ├── pages/      # 页面组件
│   │   ├── stores/     # 状态管理
│   │   └── styles/     # 样式
│   ├── package.json
│   └── vite.config.ts
├── ui/                 # UI设计原型
├── docs/               # 文档
└── README.md
```

## 开发命令

### 后端

```bash
cd backend

npm run dev      # 开发服务器
npm run build    # 构建生产版本
npm start        # 运行生产版本
npm test         # 运行测试
npm run lint     # 代码检查
```

### 前端

```bash
cd frontend

npm run dev      # 开发服务器
npm run build    # 构建生产版本
npm run preview  # 预览生产版本
npm run lint     # 代码检查
```

## 环境变量

### 后端 (.env)

```env
NODE_ENV=development
PORT=8000
API_PREFIX=api/v1

# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=mbti_test

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
```

### 前端 (.env)

```env
VITE_API_BASE_URL=/api/v1
```

## 功能特性

✅ **60道专业题库** - 每个维度15道题目
✅ **多维度分析** - EI/SN/TF/JP 四个维度
✅ **详细报告** - 优势、劣势、职业建议、兼容性
✅ **精美UI** - 现代化设计，流畅动画
✅ **断点续测** - 保存进度，随时继续
✅ **分享功能** - 分享测试结果

## 技术栈

- **后端**: Node.js 20 + TypeScript + NestJS + TypeORM
- **前端**: Vue 3 + TypeScript + Vite + Pinia
- **数据库**: PostgreSQL 15+
- **缓存**: Redis 7+
- **认证**: Session Token / JWT

## 故障排查

### PostgreSQL 连接失败

```bash
# 检查PostgreSQL是否运行
brew services list | grep postgresql  # macOS
sudo systemctl status postgresql    # Linux

# 检查端口
lsof -i :5432
```

### Redis 连接失败

```bash
# 检查Redis
redis-cli ping
```

### 端口被占用

```bash
# 查看占用端口的进程
lsof -i :8000  # 后端
lsof -i :3000  # 前端

# 杀死进程
kill -9 <PID>
```

## 下一步

- 查看 `PROJECT_STATUS.md` 了解开发进度
- 查看 `CLAUDE.md` 了解开发规范
- 查看 `docs/` 目录了解详细文档

## 许可证

MIT
