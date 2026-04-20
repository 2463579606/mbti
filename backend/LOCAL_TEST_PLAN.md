# 本地开发测试计划

## 环境检查

✅ Redis: 运行中 (localhost:6379)
⚠️ PostgreSQL: 需要安装或启动
✅ Node.js: 已安装
✅ 后端代码: 已准备

## 本地测试步骤

### Phase 1: 单元测试 (不需要数据库)

#### 1. 测试 Prompt Builder
```bash
cd backend
npm run test -- ai-prompt.builder.spec.ts
```

#### 2. 测试 Cache Service
```bash
npm run test -- ai-cache.service.spec.ts
```

#### 3. 测试 AI Client
```bash
# 测试与智谱AI的连接
curl -X POST https://open.bigmodel.cn/api/paas/v4/chat/completions \
  -H "Authorization: Bearer 4ab39f92516643278999cd616737929a.Qlzxugox1PWNINqu" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "glm-4.7",
    "messages": [
      {"role": "user", "content": "你好"}
    ]
  }'
```

### Phase 2: 集成测试 (需要数据库)

#### 启动本地 PostgreSQL
```bash
# macOS with Homebrew
brew services start postgresql@14

# 或使用 Docker
docker run -d \
  --name mbti-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=mbti_dev \
  -p 5432:5432 \
  postgres:16-alpine
```

#### 初始化数据库
```bash
psql -U postgres -h localhost -c "CREATE DATABASE mbti_dev;"
psql -U postgres -h localhost -d mbti_dev -f migrations/init.sql
```

#### 启动后端
```bash
cd backend
cp .env.local .env
npm run build
npm run start
```

### Phase 3: 前端测试

#### 启动前端
```bash
cd frontend
npm run dev
# 访问 http://localhost:3000
```

#### 测试流程
1. 完成 MBTI 测试
2. 查看结果页面
3. 点击 "AI深度分析" 按钮
4. 查看AI分析结果

## 当前问题

### 编译错误需要修复

1. **TypeScript 错误**: 需要修复类型问题
2. **依赖问题**: 需要安装 `@nestjs/testing`
3. **导入路径**: 需要修复模块导入

### 下一步行动

1. ✅ 创建本地环境配置 (.env.local)
2. ⏳ 修复编译错误
3. ⏳ 运行单元测试
4. ⏳ 启动本地开发服务器
5. ⏳ 进行端到端测试

## 安全提醒

⚠️ **重要**: 所有开发和测试都在本地完成！
- 本地数据库: localhost:5432
- 本地Redis: localhost:6379
- 本地后端: localhost:8000
- 本地前端: localhost:3000

✅ 测试通过后才能部署到生产环境
