# AI深度分析功能 - 快速参考指南

## 🎯 核心概念速览

### 架构三层
```
前端 (Vue 3) → 后端API (NestJS) → AI服务 (智谱AI)
   ↓              ↓                  ↓
展示结果      业务逻辑+异步队列    调用LLM生成内容
```

### 关键流程
1. **用户点击"AI分析"** → 前端调用 `POST /api/v1/ai/analysis/:reportId`
2. **后端创建任务** → 返回 `taskId`，状态 `pending`
3. **异步队列处理** → 调用智谱AI API生成内容
4. **前端轮询状态** → `GET /api/v1/ai/analysis/status/:taskId`
5. **完成后展示** → `GET /api/v1/ai/result/:reportId`

---

## 📁 关键文件速查

### 后端文件
```
backend/
├── config/ai.config.ts          # AI配置（API密钥等）
├── internal/ai/
│   ├── dto/                     # 数据传输对象
│   │   ├── create-analysis.dto.ts
│   │   ├── analysis-response.dto.ts
│   │   └── analysis-status.dto.ts
│   ├── entities/
│   │   └── ai-analysis.entity.ts        # TypeORM实体
│   ├── repository/
│   │   └── ai-analysis.repository.ts    # 数据访问层
│   ├── service/
│   │   ├── ai-client.service.ts         # AI API客户端
│   │   ├── ai-prompt.builder.ts         # Prompt构建器
│   │   └── ai-analysis.service.ts       # 核心业务逻辑
│   └── handler/
│       └── ai-analysis.controller.ts    # API控制器
└── pkg/openai/
    └── openai-client.ts                 # OpenAI兼容客户端
```

### 前端文件
```
frontend/
└── src/
    ├── pages/AIAnalysisPage.vue         # AI分析页面
    ├── components/ai/
    │   ├── AIAnalysisCard.vue           # 分析卡片
    │   ├── AIAnalysisSection.vue        # 分析章节
    │   ├── AIAnalysisLoading.vue        # 加载动画
    │   └── AIActionButton.vue           # 触发按钮
    ├── api/ai.ts                        # AI API封装
    ├── stores/ai.ts                     # AI状态管理
    └── types/ai.types.ts                # TypeScript类型定义
```

---

## 🔌 API端点速查

| 方法 | 路径 | 说明 | 返回 |
|------|------|------|------|
| POST | `/api/v1/ai/analysis/:reportId` | 创建分析任务 | `{taskId, status}` |
| GET | `/api/v1/ai/analysis/status/:taskId` | 查询任务状态 | `{status, progress}` |
| GET | `/api/v1/ai/result/:reportId` | 获取分析结果 | `{content, metadata}` |

---

## 🔑 环境变量速查

### 必需配置
```bash
# 功能开关
AI_ENABLED=true
AI_PROVIDER=zhipu

# API配置
AI_API_KEY=your_zhipu_api_key_here
AI_API_ENDPOINT=https://open.bigmodel.cn/api/paas/v4/chat/completions
AI_MODEL=glm-4-flash

# 生成参数
AI_TEMPERATURE=0.7        # 创造性程度 (0-1)
AI_MAX_TOKENS=3000        # 最大输出长度
AI_TOP_P=0.9              # 采样参数
```

### 可选配置
```bash
# 超时和重试
AI_TIMEOUT=60000          # API超时(毫秒)
AI_MAX_RETRIES=3          # 重试次数
AI_RETRY_DELAY=2000       # 重试延迟(毫秒)

# 缓存
AI_CACHE_ENABLED=true
AI_CACHE_TTL=86400        # 缓存24小时

# 并发控制
AI_MAX_CONCURRENT=5       # 最大并发数
AI_QUEUE_ENABLED=true     # 启用队列

# 成本控制
AI_DAILY_QUOTA=1000       # 每日限额
```

---

## 🗄️ 数据库速查

### 表结构: ai_analysis_records
```sql
主要字段:
- id: 主键
- report_id: 关联test_reports
- status: pending/processing/completed/failed
- input_data: JSONB (MBTI类型、得分等)
- analysis_content: JSONB (AI生成的内容)
- model_name: 使用的模型
- tokens_used: Token消耗
- created_at, completed_at: 时间戳
```

### 常用查询
```sql
-- 查询某个报告的分析
SELECT * FROM ai_analysis_records WHERE report_id = ?;

-- 查询处理中的任务
SELECT * FROM ai_analysis_records WHERE status = 'processing';

-- 统计今日AI调用
SELECT COUNT(*) FROM ai_analysis_records
WHERE DATE(created_at) = CURRENT_DATE;
```

---

## 🤖 Prompt模板速查

### 综合分析Prompt结构
```markdown
1. System Role: 专业MBTI分析师
2. Context: 用户信息（类型、年龄、职业）
3. Test Results: 维度得分、答题特征
4. Task: 生成深度分析报告
5. Output Format: JSON结构
6. Constraints: 字数、格式、风格要求
```

### AI响应JSON结构
```typescript
{
  overview: { title, summary, keyPoints[] },
  strengths: { items[], application[] },
  weaknesses: { items[], improvementStrategies[] },
  career: { bestMatches[], developmentPaths[], recommendations[] },
  relationships: { style, strengthsInRelationships[], challenges[], advice[] },
  growth: { shortTerm[], longTerm[], habits[] },
  actionPlan: { immediate[], ongoing[] }
}
```

---

## 🧪 测试命令速查

### 后端测试
```bash
# 单元测试
npm run test -- ai-client.service
npm run test -- ai-prompt.builder
npm run test -- ai-analysis.service

# 集成测试
npm run test:e2e -- ai-analysis

# 覆盖率报告
npm run test:cov
```

### API测试
```bash
# 创建分析任务
curl -X POST http://localhost:8000/api/v1/ai/analysis/1 \
  -H "Authorization: Bearer test_token" \
  -H "Content-Type: application/json" \
  -d '{"analysisType": "comprehensive"}'

# 查询状态
curl http://localhost:8000/api/v1/ai/analysis/status/abc123 \
  -H "Authorization: Bearer test_token"

# 获取结果
curl http://localhost:8000/api/v1/ai/result/1 \
  -H "Authorization: Bearer test_token"
```

### 前端测试
```bash
# 组件测试
npm run test -- AIAnalysisPage
npm run test -- AIAnalysisCard

# E2E测试
npm run test:e2e
```

---

## 📊 监控指标速查

### 关键指标
- **成功率**: completed / (completed + failed)
- **平均响应时间**: 从创建到完成的时间
- **Token使用量**: 每日/每月token消耗
- **成本**: 每日/每月费用
- **缓存命中率**: cache_hits / total_requests

### 监控命令
```bash
# 查看今日统计
SELECT
  COUNT(*) as total,
  COUNT(CASE WHEN status='completed' THEN 1 END) as completed,
  COUNT(CASE WHEN status='failed' THEN 1 END) as failed,
  SUM(tokens_used) as total_tokens
FROM ai_analysis_records
WHERE DATE(created_at) = CURRENT_DATE;
```

---

## 🚨 常见问题速查

### 问题: AI API调用失败
**检查**:
- API Key是否正确
- 网络是否可达
- 是否超出配额限制
- 请求格式是否正确

### 问题: 生成内容格式错误
**检查**:
- Prompt中JSON格式要求是否清晰
- AI响应是否被正确解析
- 是否有格式验证

### 问题: 任务一直处于processing状态
**检查**:
- 队列服务是否运行
- Redis连接是否正常
- 是否有死锁或超时

### 问题: 前端轮询无响应
**检查**:
- taskId是否正确
- 后端API是否可访问
- 网络连接是否正常

---

## 📈 性能优化建议

### 已实施的优化
- ✅ 异步任务处理
- ✅ Redis缓存
- ✅ 相似分析复用
- ✅ 并发控制

### 未来优化方向
- 🔄 预生成热门类型分析
- 🔄 CDN缓存静态内容
- 🔄 分批加载大内容
- 🔄 WebSocket替代轮询

---

## 🔐 安全注意事项

### API Key安全
- ✅ 使用环境变量存储
- ✅ 不提交到代码仓库
- ✅ 定期轮换密钥
- ✅ 监控异常使用

### 数据隐私
- ✅ 不记录敏感个人信息
- ✅ 匿名化处理用户数据
- ✅ 符合数据保护法规
- ✅ 提供数据删除选项

---

## 📚 参考文档

### 内部文档
- [AI分析功能设计](./AI_ANALYSIS_DESIGN.md)
- [AI开发任务清单](./AI_ANALYSIS_TASKS.md)
- [API文档](./API.md)

### 外部文档
- [智谱AI官方文档](https://open.bigmodel.cn/dev/api)
- [OpenAI API参考](https://platform.openai.com/docs/api-reference)
- [TypeORM文档](https://typeorm.io/)
- [NestJS文档](https://docs.nestjs.com/)

---

**快速参考版本**: v1.0
**最后更新**: 2026-04-20
**维护者**: Development Team
