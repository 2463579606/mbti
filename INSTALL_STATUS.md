# 📊 当前状态与快速启动指南

## ✅ 已完成

- ✅ 前端依赖安装完成 (220个包)
- 🔄 后端依赖安装中 (~500个包)
- ✅ 所有代码文件创建完成
- ✅ 启动脚本已创建

## 🚀 三种启动方式

### 方式1: 自动启动（推荐）

**macOS/Linux:**
```bash
./quick-start.sh
```

**Windows:**
```cmd
quick-start.bat
```

这将自动：
1. 启动PostgreSQL和Redis (Docker)
2. 初始化数据库
3. 启动后端服务器 (端口8000)
4. 启动前端服务器 (端口3000)

### 方式2: 手动启动

#### 步骤1: 安装Docker并启动数据库

```bash
# PostgreSQL
docker run -d --name mbti-postgres -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=mbti_test -p 5432:5432 postgres:15-alpine

# Redis
docker run -d --name mbti-redis -p 6379:6379 redis:7-alpine

# 等待启动
sleep 5
```

#### 步骤2: 初始化数据库

```bash
docker exec -i mbti-postgres psql -U postgres -d mbti_test < docs/DATABASE.md
```

#### 步骤3: 配置后端

```bash
cd backend
cp .env.example .env
```

#### 步骤4: 启动后端

```bash
cd backend
npm run dev
```

#### 步骤5: 启动前端 (新终端)

```bash
cd frontend
npm run dev
```

### 方式3: 使用本地数据库

如果您本地已安装PostgreSQL和Redis：

#### 1. 启动服务

```bash
# macOS
brew services start postgresql@15
brew services start redis

# Linux
sudo systemctl start postgresql
sudo systemctl start redis
```

#### 2. 创建数据库

```bash
psql -U postgres
CREATE DATABASE mbti_test;
\q
```

#### 3. 初始化数据

```bash
psql -U postgres -d mbti_test -f docs/DATABASE.md
```

#### 4-6. 同方式2的步骤3-6

## 📱 访问地址

启动成功后，访问：

- **前端应用**: http://localhost:3000
- **后端API**: http://localhost:8000
- **健康检查**: http://localhost:8000/api/v1/admin/health
- **API文档**: 查看 `docs/API.md`

## 🔍 验证安装

### 检查数据库

```bash
# PostgreSQL
docker exec -it mbti-postgres psql -U postgres -d mbti_test -c "SELECT COUNT(*) FROM mbti_types;"
# 应该返回: 16

# Redis
docker exec -it mbti-redis redis-cli ping
# 应该返回: PONG
```

### 检查后端

```bash
curl http://localhost:8000/api/v1/admin/health
```

### 检查前端

浏览器访问: http://localhost:3000

## 📝 默认账户

首次使用需要注册：

1. 访问 http://localhost:3000
2. 点击"登录 / 注册"
3. 注册新账户

**管理员账户**需要手动创建或通过数据库设置：

```sql
-- 方式1: 通过API注册后将用户设为管理员
UPDATE users SET status = 'active' WHERE email = 'admin@mbti.com';

-- 方式2: 直接创建管理员账户（需要bcrypt密码）
-- 建议通过应用注册，然后修改数据库
```

## 🛠️ 故障排查

### 数据库连接失败

```bash
# 检查Docker容器
docker ps | grep mbti

# 查看容器日志
docker logs mbti-postgres
docker logs mbti-redis

# 重启容器
docker restart mbti-postgres mbti-redis
```

### 端口被占用

```bash
# 查看端口占用
lsof -i :8000  # 后端
lsof -i :3000  # 前端
lsof -i :5432  # PostgreSQL
lsof -i :6379  # Redis

# 终止进程
kill -9 <PID>
```

### 依赖安装失败

```bash
# 清理重试
cd backend
rm -rf node_modules package-lock.json
npm install
```

## 📚 相关文档

- `START_GUIDE.md` - 详细启动指南
- `TEST_REPORT.md` - 测试报告
- `README.md` - 项目说明
- `docs/API.md` - API文档

## 💡 下一步

1. ✅ 等待后端依赖安装完成
2. 🚀 运行启动脚本
3. 🎉 访问应用开始使用

---

**最后更新**: 2026-04-18
**状态**: 🔄 准备中
