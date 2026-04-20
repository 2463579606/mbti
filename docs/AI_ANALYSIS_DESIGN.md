# AI深度分析功能设计文档

## 📋 需求概述

基于现有MBTI测试系统，增加AI深度分析功能，为用户提供更个性化、更深入的性格洞察和发展建议。

### 核心价值
- **个性化洞察**：基于用户的实际答题情况，不仅给出类型标签，更提供深度解读
- **行动建议**：提供具体的职业发展、人际关系、个人成长建议
- **差异化体验**：每个用户即使类型相同，分析内容也会因答题细节而不同

### 技术选型
- **AI提供商**：智谱AI (Zhipu AI / BigModel)
- **API方式**：OpenAI兼容接口（便于后续切换）
- **模型**：GLM-4-Flash（性价比高）或 GLM-4（质量更高）

---

## 🏗️ 系统架构设计

### 整体架构图

```
┌─────────────────────────────────────────────────────────────┐
│                         前端 (Vue 3)                        │
├─────────────────────────────────────────────────────────────┤
│  ResultPage.vue                                             │
│  ├─ 显示基础报告（已有）                                    │
│  ├─ [AI深度分析] 按钮                                       │
│  │  └─ AIAnalysisPage.vue (新增)                           │
│  │     ├─ 加载动画（AI思考中）                              │
│  │     ├─ 分析进度展示                                      │
│  │     └─ 分模块展示分析结果                                │
│  └─ AIAnalysisCard.vue (可复用组件)                        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      后端 API (NestJS)                      │
├─────────────────────────────────────────────────────────────┤
│  POST /api/v1/ai/analysis/:reportId                        │
│  ├─ 创建分析任务                                            │
│  ├─ 返回 taskId（异步）                                     │
│  └─ 立即响应，不等待AI生成                                  │
│                                                             │
│  GET  /api/v1/ai/analysis/:taskId                          │
│  ├─ 查询分析任务状态                                        │
│  └─ 返回状态：pending/processing/completed/failed          │
│                                                             │
│  GET  /api/v1/ai/result/:reportId                          │
│  ├─ 获取AI分析结果                                          │
│  └─ 返回完整分析内容（缓存优先）                            │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    业务逻辑层 (Service)                      │
├─────────────────────────────────────────────────────────────┤
│  AIAnalysisService                                          │
│  ├─ generateAnalysis(reportId, userData)                   │
│  ├─ buildPrompt(mbtiType, answers, dimensions)             │
│  ├─ streamAIGeneration(prompt)                             │
│  ├─ parseAIResponse(rawResponse)                           │
│  └─ cacheResult(analysisId, result)                        │
│                                                             │
│  AIService (基础服务)                                       │
│  ├─ chat(messages, options)                                │
│  ├─ streamChat(messages, options)                          │
│  └─ 适配智谱AI / OpenAI接口                                │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      数据层 (Repository)                     │
├─────────────────────────────────────────────────────────────┤
│  AIAnalysisRepository                                       │
│  ├─ create(analysisData)                                   │
│  ├─ findById(id)                                           │
│  ├─ findByReportId(reportId)                               │
│  ├─ updateStatus(id, status)                               │
│  └─ updateContent(id, content)                             │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   外部服务 (智谱AI)                          │
├─────────────────────────────────────────────────────────────┤
│  API: https://open.bigmodel.cn/api/paas/v4/chat/completions│
│  模型: glm-4-flash / glm-4-plus                            │
│  认证: Authorization: Bearer {API_KEY}                     │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 数据库设计

### 新增表：ai_analysis_records

```sql
CREATE TABLE ai_analysis_records (
  id BIGSERIAL PRIMARY KEY,
  report_id BIGINT NOT NULL REFERENCES test_reports(id),
  user_id BIGINT REFERENCES users(id),

  -- 任务状态
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  -- pending: 已创建，等待处理
  -- processing: AI生成中
  -- completed: 已完成
  -- failed: 失败

  -- 分析类型
  analysis_type VARCHAR(50) NOT NULL DEFAULT 'comprehensive',
  -- comprehensive: 综合分析
  -- career: 职业专项
  -- relationship: 人际关系专项
  -- growth: 成长规划专项

  -- 输入数据快照
  input_data JSONB NOT NULL,
  -- {
  --   mbtiType: "INTJ",
  --   dimensionScores: { EI: 30, SN: 20, TF: 28, JP: 25 },
  --   answerSummary: "...",
  --   userContext: {...}
  -- }

  -- AI生成内容
  analysis_content JSONB,
  -- {
  --   overview: { title, content, keyPoints: [] },
  --   strengths: { items: [], detailed: [] },
  --   weaknesses: { items: [], improvementStrategies: [] },
  --   career: { directions: [], recommendations: [] },
  --   relationships: { style: [], advice: [] },
  --   growth: { shortTerm: [], longTerm: [], habits: [] }
  -- }

  -- 元数据
  model_name VARCHAR(50),
  model_version VARCHAR(50),
  tokens_used INTEGER,
  cost_in_cents INTEGER,

  -- 时间戳
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP,

  -- 索引
  CONSTRAINT fk_report FOREIGN KEY (report_id) REFERENCES test_reports(id) ON DELETE CASCADE
);

-- 索引优化
CREATE INDEX idx_ai_analysis_report_id ON ai_analysis_records(report_id);
CREATE INDEX idx_ai_analysis_user_id ON ai_analysis_records(user_id);
CREATE INDEX idx_ai_analysis_status ON ai_analysis_records(status);
CREATE INDEX idx_ai_analysis_created_at ON ai_analysis_records(created_at DESC);

-- 复合索引用于常见查询
CREATE INDEX idx_ai_analysis_report_status ON ai_analysis_records(report_id, status);
```

---

## 🔌 API接口设计

### 1. 创建AI分析任务

**POST** `/api/v1/ai/analysis/:reportId`

**请求头**：
```http
Authorization: Bearer {session_token}
Content-Type: application/json
```

**请求体**（可选）：
```json
{
  "analysisType": "comprehensive",  // comprehensive | career | relationship | growth
  "userContext": {                  // 可选的额外上下文
    "age": 25,
    "occupation": "工程师",
    "goals": ["提升领导力", "改善人际关系"]
  }
}
```

**响应**：
```json
{
  "success": true,
  "code": 200,
  "message": "AI analysis task created",
  "data": {
    "taskId": "ai_task_abc123",
    "reportId": 123,
    "status": "pending",
    "estimatedTime": 30,  // 预计秒数
    "createdAt": "2026-04-20T12:00:00Z"
  }
}
```

---

### 2. 查询任务状态

**GET** `/api/v1/ai/analysis/status/:taskId`

**响应**：
```json
{
  "success": true,
  "code": 200,
  "data": {
    "taskId": "ai_task_abc123",
    "status": "processing",  // pending | processing | completed | failed
    "progress": 60,          // 0-100，仅processing时有效
    "stage": "正在生成职业建议...",
    "createdAt": "2026-04-20T12:00:00Z",
    "completedAt": null
  }
}
```

---

### 3. 获取AI分析结果

**GET** `/api/v1/ai/result/:reportId`

**响应**（成功时）：
```json
{
  "success": true,
  "code": 200,
  "data": {
    "reportId": 123,
    "analysisId": 456,
    "analysisType": "comprehensive",
    "content": {
      "overview": {
        "title": "你的性格密码：战略建筑师",
        "summary": "作为一名INTJ，你是...",
        "keyPoints": [
          "战略性思维：擅长看到全局和长远规划",
          "独立自主：重视个人空间和自主决策",
          "追求卓越：对自我和他人都有高标准"
        ]
      },
      "strengths": {
        "items": [
          { "name": "系统化思维", "description": "..." },
          { "name": "执行力", "description": "..." }
        ],
        "application": [
          "在工作中：适合需要复杂规划和战略制定的岗位",
          "在学习中：通过构建知识体系来提升效率"
        ]
      },
      "weaknesses": {
        "items": [
          { "name": "过于批判", "description": "..." },
          { "name": "忽视情感", "description": "..." }
        ],
        "improvementStrategies": [
          "定期进行自我反思，记录情绪变化",
          "主动倾听他人观点，练习共情能力"
        ]
      },
      "career": {
        "bestMatches": [
          { "role": "系统架构师", "reason": "...", "score": 95 },
          { "role": "战略顾问", "reason": "...", "score": 90 }
        ],
        "developmentPaths": [
          "技术专家路线：深化专业能力",
          "管理路线：培养团队领导技能"
        ],
        "recommendations": [
          "选择允许独立工作的环境",
          "寻找重视创新和长期规划的公司"
        ]
      },
      "relationships": {
        "style": "深度优先型",
        "strengthsInRelationships": ["忠诚", "深度对话"],
        "challenges": ["小社交", "直接表达"],
        "advice": [
          "质量重于数量：维护少数深度关系",
          "提前沟通：让亲密的人了解你的社交需求"
        ]
      },
      "growth": {
        "shortTerm": [
          "本月目标：每周主动与一位同事深入交流",
          "习惯养成：每日记录3个感恩事项"
        ],
        "longTerm": [
          "年度目标：在公开场合做3次演讲",
          "能力提升：完成一门心理学课程"
        ],
        "habits": [
          { "name": "战略回顾", "frequency": "每周", "description": "..." },
          { "name": "社交练习", "frequency": "每日", "description": "..." }
        ]
      },
      "actionPlan": {
        "immediate": [
          { "priority": "高", "action": "...", "timeline": "本周" }
        ],
        "ongoing": [
          { "priority": "中", "action": "...", "timeline": "持续" }
        ]
      }
    },
    "metadata": {
      "model": "glm-4-flash",
      "generatedAt": "2026-04-20T12:00:30Z",
      "tokensUsed": 2500
    }
  }
}
```

**响应**（处理中）：
```json
{
  "success": true,
  "code": 202,  // Accepted
  "data": {
    "status": "processing",
    "progress": 45,
    "message": "AI正在深度分析中..."
  }
}
```

**响应**（失败）：
```json
{
  "success": false,
  "code": 500,
  "message": "AI analysis failed",
  "error": "API rate limit exceeded"
}
```

---

## 🤖 AI提示词设计

### Prompt模板结构

```typescript
interface AIPromptTemplate {
  systemRole: string;      // AI角色定义
  context: string;         // 用户背景
  task: string;           // 具体任务
  inputData: any;         // 用户数据
  outputFormat: string;   // 输出格式要求
  constraints: string[];  // 约束条件
}
```

### 综合分析Prompt示例

```markdown
你是一位专业的MBTI性格分析师和心理咨询师，拥有15年的性格分析经验。

## 用户信息
- MBTI类型：{mbtiType}
- 年龄：{age}（如果提供）
- 职业：{occupation}（如果提供）

## 测试结果分析
### 维度得分
- E({scoreE}) vs I({scoreI})：{dimensionAnalysis.EI}
- S({scoreS}) vs N({scoreN})：{dimensionAnalysis.SN}
- T({scoreT}) vs F({scoreF})：{dimensionAnalysis.TF}
- J({scoreJ}) vs P({scoreP})：{dimensionAnalysis.JP}

### 答题特征
{answerPatterns}

## 分析任务
请基于以上信息，为用户提供深度、个性化、可操作的分析报告。

## 输出要求
### 1. 结构化输出
必须严格按照以下JSON结构输出：

```json
{
  "overview": {
    "title": "吸引人的标题",
    "summary": "3-5句话总结核心性格特征",
    "keyPoints": ["要点1", "要点2", "要点3"]
  },
  "strengths": {
    "items": [
      {"name": "优势名称", "description": "详细描述", "examples": ["应用场景1", "应用场景2"]}
    ],
    "application": ["在工作中的应用", "在学习中的应用", "在生活中应用"]
  },
  "weaknesses": {
    "items": [
      {"name": "挑战名称", "description": "详细描述"}
    ],
    "improvementStrategies": ["具体改进策略1", "具体改进策略2"]
  },
  "career": {
    "bestMatches": [
      {"role": "职业名称", "reason": "推荐理由", "score": 95}
    ],
    "developmentPaths": ["发展路径1", "发展路径2"],
    "recommendations": ["具体建议1", "具体建议2"]
  },
  "relationships": {
    "style": "关系风格描述",
    "strengthsInRelationships": ["优势1", "优势2"],
    "challenges": ["挑战1", "挑战2"],
    "advice": ["具体建议1", "具体建议2"]
  },
  "growth": {
    "shortTerm": ["短期目标1", "短期目标2"],
    "longTerm": ["长期目标1", "长期目标2"],
    "habits": [
      {"name": "习惯名称", "frequency": "频率", "description": "具体做法"}
    ]
  },
  "actionPlan": {
    "immediate": [
      {"priority": "高/中/低", "action": "具体行动", "timeline": "时间范围"}
    ],
    "ongoing": [
      {"priority": "高/中/低", "action": "持续行动", "timeline": "时间范围"}
    ]
  }
}
```

### 2. 内容要求
- **个性化**：基于用户具体的维度得分，不要泛泛而谈
- **可操作**：每条建议都要具体、可执行
- **正面导向**：用成长思维看待挑战，强调发展潜力
- **科学依据**：基于MBTI理论和心理学研究
- **避免陈词滥调**：提供新鲜、有深度的洞察

### 3. 语言风格
- 专业但不晦涩
- 鼓励性和启发性
- 使用第二人称"你"，建立对话感
- 适当使用emoji增加亲和力（但不过度）

### 4. 约束条件
- JSON格式必须正确，可被解析
- 每个数组至少包含3个有效项目
- 避免重复和冗余
- 总字数控制在1500-2500字之间

现在，请开始分析并输出结果：
```

---

## ⚙️ 配置管理

### AI配置文件：`backend/config/ai.config.ts`

```typescript
export interface AIConfig {
  enabled: boolean;
  provider: 'zhipu' | 'openai';
  model: string;
  apiEndpoint: string;
  apiKey: string;

  // 生成参数
  temperature: number;
  maxTokens: number;
  topP: number;

  // 超时和重试
  timeout: number;      // 毫秒
  maxRetries: number;
  retryDelay: number;   // 毫秒

  // 缓存配置
  cacheEnabled: boolean;
  cacheTTL: number;     // 秒

  // 并发控制
  maxConcurrent: number;
  queueEnabled: boolean;

  // 成本控制
  dailyQuota: number;   // 每日请求限额
  quotaResetAt: string; // 重置时间

  // 功能开关
  features: {
    comprehensive: boolean;  // 综合分析
    career: boolean;         // 职业专项
    relationship: boolean;   // 人际关系专项
    growth: boolean;         // 成长规划专项
  };
}

const aiConfig: AIConfig = {
  enabled: process.env.AI_ENABLED === 'true',
  provider: (process.env.AI_PROVIDER as any) || 'zhipu',
  model: process.env.AI_MODEL || 'glm-4-flash',
  apiEndpoint: process.env.AI_API_ENDPOINT || 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
  apiKey: process.env.AI_API_KEY || '',

  temperature: parseFloat(process.env.AI_TEMPERATURE || '0.7'),
  maxTokens: parseInt(process.env.AI_MAX_TOKENS || '3000', 10),
  topP: parseFloat(process.env.AI_TOP_P || '0.9'),

  timeout: parseInt(process.env.AI_TIMEOUT || '60000', 10),
  maxRetries: parseInt(process.env.AI_MAX_RETRIES || '3', 10),
  retryDelay: parseInt(process.env.AI_RETRY_DELAY || '2000', 10),

  cacheEnabled: process.env.AI_CACHE_ENABLED !== 'false',
  cacheTTL: parseInt(process.env.AI_CACHE_TTL || '86400', 10),  // 24小时

  maxConcurrent: parseInt(process.env.AI_MAX_CONCURRENT || '5', 10),
  queueEnabled: process.env.AI_QUEUE_ENABLED !== 'false',

  dailyQuota: parseInt(process.env.AI_DAILY_QUOTA || '1000', 10),
  quotaResetAt: process.env.AI_QUOTA_RESET_AT || '00:00',

  features: {
    comprehensive: process.env.AI_FEATURE_COMPREHENSIVE !== 'false',
    career: process.env.AI_FEATURE_CAREER !== 'false',
    relationship: process.env.AI_FEATURE_RELATIONSHIP !== 'false',
    growth: process.env.AI_FEATURE_GROWTH !== 'false',
  },
};

export function validateAIConfig(): void {
  if (aiConfig.enabled && !aiConfig.apiKey) {
    throw new Error('AI_API_KEY is required when AI is enabled');
  }

  if (aiConfig.enabled && !aiConfig.apiEndpoint) {
    throw new Error('AI_API_ENDPOINT is required when AI is enabled');
  }
}

export { aiConfig };
```

### 环境变量配置：`.env.ai`

```bash
# AI功能开关
AI_ENABLED=true
AI_PROVIDER=zhipu

# API配置
AI_API_KEY=your_zhipu_api_key_here
AI_API_ENDPOINT=https://open.bigmodel.cn/api/paas/v4/chat/completions
AI_MODEL=glm-4-flash

# 生成参数
AI_TEMPERATURE=0.7
AI_MAX_TOKENS=3000
AI_TOP_P=0.9

# 超时和重试
AI_TIMEOUT=60000
AI_MAX_RETRIES=3
AI_RETRY_DELAY=2000

# 缓存配置
AI_CACHE_ENABLED=true
AI_CACHE_TTL=86400

# 并发控制
AI_MAX_CONCURRENT=5
AI_QUEUE_ENABLED=true

# 成本控制
AI_DAILY_QUOTA=1000
AI_QUOTA_RESET_AT=00:00

# 功能开关
AI_FEATURE_COMPREHENSIVE=true
AI_FEATURE_CAREER=true
AI_FEATURE_RELATIONSHIP=true
AI_FEATURE_GROWTH=true
```

---

## 📁 文件结构

### 后端文件结构

```
backend/
├── internal/
│   ├── ai/
│   │   ├── dto/
│   │   │   ├── create-analysis.dto.ts
│   │   │   ├── analysis-response.dto.ts
│   │   │   └── analysis-status.dto.ts
│   │   ├── entities/
│   │   │   └── ai-analysis.entity.ts
│   │   ├── repository/
│   │   │   └── ai-analysis.repository.ts
│   │   ├── service/
│   │   │   ├── ai-analysis.service.ts
│   │   │   ├── ai-prompt.builder.ts
│   │   │   └── ai-client.service.ts
│   │   ├── handler/
│   │   │   └── ai-analysis.controller.ts
│   │   └── types/
│   │       ├── ai-config.types.ts
│   │       ├── ai-response.types.ts
│   │       └── analysis-content.types.ts
│   └── queue/
│       └── ai-queue.service.ts
├── config/
│   ├── config.ts (已有)
│   └── ai.config.ts (新增)
└── pkg/
    └── openai/
        └── openai-client.ts
```

### 前端文件结构

```
frontend/
├── src/
│   ├── pages/
│   │   └── AIAnalysisPage.vue (新增)
│   ├── components/
│   │   ├── ai/
│   │   │   ├── AIAnalysisCard.vue (新增)
│   │   │   ├── AIAnalysisSection.vue (新增)
│   │   │   ├── AIAnalysisLoading.vue (新增)
│   │   │   └── AIActionButton.vue (新增)
│   │   └── ...
│   ├── api/
│   │   └── ai.ts (新增)
│   ├── stores/
│   │   └── ai.ts (新增)
│   └── types/
│       └── ai.types.ts (新增)
```

---

## 🔄 核心流程设计

### 1. AI分析生成流程

```typescript
// AIAnalysisService.generateAnalysis()

async generateAnalysis(reportId: number, options?: AnalysisOptions) {
  // 1. 获取报告数据
  const report = await this.reportService.findById(reportId);
  if (!report) throw new ReportNotFoundError();

  // 2. 检查是否已有分析
  const existing = await this.repository.findByReportId(reportId);
  if (existing && existing.status === 'completed') {
    return existing;  // 返回缓存结果
  }

  // 3. 创建分析任务记录
  const task = await this.repository.create({
    reportId,
    status: 'pending',
    analysisType: options?.type || 'comprehensive',
    inputData: this.prepareInputData(report),
  });

  // 4. 异步执行AI生成
  this.queueService.add('ai-analysis', {
    taskId: task.id,
    reportId,
    options,
  });

  // 5. 立即返回任务ID
  return {
    taskId: task.id,
    status: 'pending',
    estimatedTime: this.estimateTime(options?.type),
  };
}

// 后台任务执行
async processAITask(task: Job) {
  const { taskId, reportId, options } = task.data;

  try {
    // 1. 更新状态为processing
    await this.repository.updateStatus(taskId, 'processing');

    // 2. 构建Prompt
    const prompt = await this.promptBuilder.build(reportId, options);

    // 3. 调用AI API
    const response = await this.aiClient.chat({
      messages: [
        { role: 'system', content: prompt.systemRole },
        { role: 'user', content: prompt.task }
      ],
      temperature: aiConfig.temperature,
      maxTokens: aiConfig.maxTokens,
    });

    // 4. 解析响应
    const content = this.parseAIResponse(response);

    // 5. 保存结果
    await this.repository.updateContent(taskId, {
      content,
      status: 'completed',
      modelName: aiConfig.model,
      tokensUsed: response.usage.totalTokens,
    });

  } catch (error) {
    await this.repository.updateStatus(taskId, 'failed');
    throw error;
  }
}
```

### 2. 前端轮询流程

```typescript
// AIAnalysisPage.vue

const taskId = ref<string | null>(null);
const analysis = ref<AIAnalysis | null>(null);
const pollInterval = ref<NodeJS.Timeout | null>(null);

async function requestAIAnalysis() {
  // 1. 请求创建分析任务
  const result = await aiApi.createAnalysis(reportId);
  taskId.value = result.taskId;

  // 2. 开始轮询状态
  startPolling();
}

function startPolling() {
  pollInterval.value = setInterval(async () => {
    const status = await aiApi.getAnalysisStatus(taskId.value!);

    if (status.status === 'completed') {
      // 3. 获取完整结果
      analysis.value = await aiApi.getAnalysisResult(reportId);
      stopPolling();
    } else if (status.status === 'failed') {
      // 4. 处理失败
      handleError();
      stopPolling();
    } else {
      // 5. 更新进度
      updateProgress(status.progress);
    }
  }, 2000);  // 每2秒轮询一次
}

function stopPolling() {
  if (pollInterval.value) {
    clearInterval(pollInterval.value);
    pollInterval.value = null;
  }
}
```

---

## 💰 成本估算与优化

### 智谱AI定价（参考）
- **GLM-4-Flash**: ¥0.1/千tokens（输入），¥0.5/千tokens（输出）
- **GLM-4**: ¥1/千tokens（输入），¥2/千tokens（输出）

### 单次分析成本估算
- 输入：约1500 tokens（Prompt + 用户数据）
- 输出：约2500 tokens（分析内容）
- 总计：约4000 tokens

使用GLM-4-Flash：
- 单次成本：¥0.15 + ¥1.25 = ¥1.4

### 优化策略
1. **缓存优先**：相同类型+相同维度得分的分析可以复用（24小时）
2. **增量生成**：首次生成完整分析，后续只更新变化部分
3. **批量处理**：低峰期批量处理，降低实时压力
4. **分层模型**：简单分析用Flash，复杂需求用Plus

---

## 🧪 测试策略

### 单元测试
- [ ] AI Prompt Builder测试
- [ ] AI Response Parser测试
- [ ] AI Client测试（mock API）
- [ ] Analysis Service业务逻辑测试

### 集成测试
- [ ] 完整分析流程测试
- [ ] 异步任务处理测试
- [ ] 缓存机制测试
- [ ] 错误处理和重试测试

### 性能测试
- [ ] 并发请求测试
- [ ] 超时处理测试
- [ ] 内存占用测试

---

## 🚀 上线计划

### Phase 1: MVP (最小可行产品)
- ✅ 基础AI分析功能
- ✅ 综合分析类型
- ✅ 基本前端展示
- ⏱️ 预计：3-5天

### Phase 2: 优化
- ✅ 缓存机制
- ✅ 异步任务队列
- ✅ 成本优化
- ⏱️ 预计：2-3天

### Phase 3: 扩展
- ✅ 多种分析类型（职业、关系、成长）
- ✅ 历史记录
- ✅ 分享功能
- ⏱️ 预计：2-3天

---

## 📝 待确认事项

1. **API Key获取**：需要智谱AI API Key
2. **预算审批**：确认每月AI调用成本预算
3. **内容审核**：是否需要AI生成内容的审核机制
4. **用户付费**：是否考虑为AI分析功能设置付费门槛
5. **数据隐私**：用户答题数据发送到AI的隐私政策

---

**文档版本**: v1.0
**创建时间**: 2026-04-20
**最后更新**: 2026-04-20
