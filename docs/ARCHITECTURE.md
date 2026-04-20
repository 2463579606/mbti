# MBTI 性格测试系统 - 完整架构设计文档

## 一、项目概述

### 1.1 项目目标
构建一个高可用、高可扩展、易维护的MBTI性格测试系统，支持大量用户并发访问，提供精准的性格分析报告。

### 1.2 核心功能
- 用户测试管理（开始、进度保存、断点续测）
- 60道科学题库管理
- 实时进度追踪
- 多维度性格分析计算
- 详细测试报告生成
- 测试历史记录
- 数据统计分析

---

## 二、技术栈选型建议

### 2.1 后端技术栈（推荐方案A：Go + 高性能架构）
```
语言: Go 1.21+
Web框架: Gin / Fiber
数据库: PostgreSQL 15+ (主数据) + Redis (缓存)
ORM: GORM
消息队列: Redis Streams / RabbitMQ
配置管理: Viper
日志: Zap
监控: Prometheus + Grafana
容器化: Docker + Docker Compose
```

**优势**：高性能、并发能力强、部署简单、内存占用小

### 2.2 后端技术栈（推荐方案B：Node.js + TypeScript）
```
语言: TypeScript 5+
运行时: Node.js 20 LTS
Web框架: NestJS / Fastify
数据库: PostgreSQL 15+ + Redis
ORM: Prisma / TypeORM
消息队列: Bull (Redis-based)
验证: class-validator / Zod
日志: Pino / Winston
测试: Jest
```

**优势**：与前端技术栈统一、开发效率高、生态丰富

### 2.3 前端技术栈
```
语言: TypeScript 5+
框架: Vue 3 + Vite / React 18 + Next.js
状态管理: Pinia / Zustand
HTTP客户端: Axios / Fetch API
构建工具: Vite / Next.js
样式: Tailwind CSS / UnoCSS
```

---

## 三、系统架构设计

### 3.1 整体架构图

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client Layer                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Web UI     │  │  Mobile H5   │  │  Future App  │          │
│  │  (Vue/React) │  │   (Same UI)  │  │              │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
                              ↓ HTTPS
┌─────────────────────────────────────────────────────────────────┐
│                       CDN Layer                                  │
│                   (Static Assets)                                │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    Load Balancer                                 │
│                    (Nginx / HAProxy)                            │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    API Gateway                                   │
│            (Rate Limiting, Auth, Routing)                       │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                      Application Layer                           │
│  ┌────────────────────────────────────────────────────────┐    │
│  │              API Service (Multiple Instances)           │    │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │    │
│  │  │ Test API │ │ User API │ │ Report   │ │ Admin    │  │    │
│  │  │          │ │          │ │ API      │ │ API      │  │    │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘  │    │
│  └────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                      Service Layer                               │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐          │
│  │ Question │ │ Scoring  │ │ Report   │ │ Cache    │          │
│  │ Service  │ │ Service  │ │ Service  │ │ Service  │          │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘          │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                      Data Layer                                  │
│  ┌──────────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   PostgreSQL     │  │    Redis     │  │   Message    │     │
│  │   (Primary DB)   │  │    (Cache)   │  │   Queue      │     │
│  └──────────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 核心模块划分

#### 3.2.1 用户模块 (User Module)
- 用户注册/登录（支持匿名用户）
- 用户会话管理
- 用户信息管理

#### 3.2.2 测试模块 (Test Module)
- 创建测试会话
- 获取题目（分页/按维度）
- 提交答案
- 保存进度（支持断点续测）
- 完成测试

#### 3.2.3 题库模块 (Question Module)
- 题目CRUD管理
- 题目分类管理
- 题目版本控制
- 题目启用/禁用

#### 3.2.4 评分模块 (Scoring Module)
- 维度分数计算
- MBTI类型判定
- 百分比计算

#### 3.2.5 报告模块 (Report Module)
- 生成详细报告
- 报告缓存
- 报告分享
- 报告历史

#### 3.2.6 统计模块 (Statistics Module)
- 测试次数统计
- 类型分布统计
- 用户行为分析

#### 3.2.7 管理后台模块 (Admin Module)
- 题库管理
- 用户管理
- 数据看板
- 系统配置

---

## 四、数据库设计

### 4.1 ER图概览

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│    users    │────<│   tests     │>────│  questions  │
└─────────────┘     └─────────────┘     └─────────────┘
       │                   │
       │                   │
       v                   v
┌─────────────┐     ┌─────────────┐
│user_sessions│     │   answers   │
└─────────────┘     └─────────────┘
                           │
                           v
                    ┌─────────────┐
                    │   reports   │
                    └─────────────┘
```

### 4.2 核心表结构

#### 4.2.1 用户表 (users)
```sql
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    anonymous_id VARCHAR(64) UNIQUE,  -- 匿名用户ID（UUID）
    email VARCHAR(255) UNIQUE,        -- 注册邮箱（可选）
    nickname VARCHAR(100),            -- 昵称
    avatar VARCHAR(500),              -- 头像URL

    -- 统计信息
    test_count INT DEFAULT 0,         -- 测试次数
    last_test_at TIMESTAMP,           -- 最后测试时间

    -- 系统字段
    status SMALLINT DEFAULT 1,        -- 状态：1=正常, 0=禁用
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP              -- 软删除
);

-- 索引
CREATE INDEX idx_users_anonymous ON users(anonymous_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_email ON users(email) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_created ON users(created_at DESC);
```

#### 4.2.2 测试会话表 (test_sessions)
```sql
CREATE TABLE test_sessions (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id),  -- 用户ID（可为NULL，匿名用户）
    session_token VARCHAR(64) UNIQUE NOT NULL,  -- 会话令牌

    -- 测试状态
    status SMALLINT DEFAULT 0,        -- 0=进行中, 1=已完成, 2=已放弃

    -- 进度追踪
    current_question INT DEFAULT 0,   -- 当前题号（0-59）
    answered_count INT DEFAULT 0,     -- 已答题数

    -- 时间追踪
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    duration_seconds INT,             -- 完成用时（秒）

    -- 结果（完成后填写）
    result_type VARCHAR(4),           -- MBTI类型：INFJ/INTP等
    result_scores JSONB,              -- 维度分数：{"EI": 15, "SN": 8, ...}

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 索引
CREATE INDEX idx_sessions_user ON test_sessions(user_id);
CREATE INDEX idx_sessions_token ON test_sessions(session_token);
CREATE INDEX idx_sessions_status ON test_sessions(status);
CREATE INDEX idx_sessions_created ON test_sessions(created_at DESC);
```

#### 4.2.3 答案记录表 (test_answers)
```sql
CREATE TABLE test_answers (
    id BIGSERIAL PRIMARY KEY,
    session_id BIGINT NOT NULL REFERENCES test_sessions(id) ON DELETE CASCADE,
    user_id BIGINT REFERENCES users(id),

    -- 题目信息
    question_id INT NOT NULL,         -- 题目序号（0-59）
    dimension VARCHAR(2) NOT NULL,    -- 维度：EI/SN/TF/JP

    -- 答案信息
    selected_option INT NOT NULL,     -- 选择的选项：0或1
    score INT NOT NULL,               -- 得分：0或2

    -- 时间戳
    answered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- 唯一约束：每个会话每题只能答一次
    UNIQUE(session_id, question_id)
);

-- 索引
CREATE INDEX idx_answers_session ON test_answers(session_id);
CREATE INDEX idx_answers_user ON test_answers(user_id);
CREATE INDEX idx_answers_dimension ON test_answers(dimension);
```

#### 4.2.4 题目表 (questions)
```sql
CREATE TABLE questions (
    id SERIAL PRIMARY KEY,
    question_id INT UNIQUE NOT NULL,  -- 题目序号（0-59）
    dimension VARCHAR(2) NOT NULL,    -- 维度：EI/SN/TF/JP
    dimension_order SMALLINT NOT NULL, -- 维度内排序（1-15）

    -- 题目内容
    question_text TEXT NOT NULL,      -- 题目文本
    option_a TEXT NOT NULL,           -- 选项A
    option_b TEXT NOT NULL,           -- 选项B
    score_a INT NOT NULL,             -- 选项A得分
    score_b INT NOT NULL,             -- 选项B得分

    -- 状态管理
    is_active BOOLEAN DEFAULT true,   -- 是否启用
    version INT DEFAULT 1,            -- 版本号

    -- 元数据
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 索引
CREATE INDEX idx_questions_dimension ON questions(dimension, dimension_order);
CREATE INDEX idx_questions_active ON questions(is_active) WHERE is_active = true;

-- 初始化60道题目（来自UI）
```

#### 4.2.5 MBTI类型配置表 (mbti_types)
```sql
CREATE TABLE mbti_types (
    code VARCHAR(4) PRIMARY KEY,      -- 4字母代码：INFJ等

    -- 基本信息
    name VARCHAR(50) NOT NULL,        -- 中文名：提倡者
    emoji VARCHAR(10) NOT NULL,       -- 表情符号
    group_name VARCHAR(20) NOT NULL,  -- 分组：分析家/外交家/哨兵/探险家

    -- 描述信息
    headline TEXT NOT NULL,           -- 一句话描述
    tagline TEXT NOT NULL,            -- 详细描述

    -- 优劣势（JSON数组）
    strengths JSONB NOT NULL,         -- ["组织能力强", ...]
    weaknesses JSONB NOT NULL,         -- ["过于固执", ...]

    -- 兼容性
    best_match JSONB NOT NULL,         -- ["ISFJ", "ISTJ"]
    challenging_match JSONB NOT NULL,  -- ["INFP", "ENFP"]

    -- 职业和名人
    careers JSONB NOT NULL,            -- ["经理", "法官", ...]
    famous_people JSONB NOT NULL,      -- ["名人1", "名人2", ...]

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 初始化16种类型数据
```

#### 4.2.6 测试报告表 (test_reports)
```sql
CREATE TABLE test_reports (
    id BIGSERIAL PRIMARY KEY,
    session_id BIGINT UNIQUE NOT NULL REFERENCES test_sessions(id),
    user_id BIGINT REFERENCES users(id),

    -- 测试结果
    mbti_type VARCHAR(4) NOT NULL REFERENCES mbti_types(code),

    -- 维度分数（百分比）
    ei_score INT NOT NULL,            -- 0-100, E倾向百分比
    sn_score INT NOT NULL,            -- 0-100, S倾向百分比
    tf_score INT NOT NULL,            -- 0-100, T倾向百分比
    jp_score INT NOT NULL,            -- 0-100, J倾向百分比

    -- 详细结果（JSON）
    dimension_details JSONB NOT NULL, -- 各维度详细数据
    personality_analysis JSONB,       -- 性格分析

    -- 分享相关
    share_token VARCHAR(64) UNIQUE,   -- 分享令牌
    share_count INT DEFAULT 0,        -- 分享次数

    -- 时间戳
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 索引
CREATE INDEX idx_reports_session ON test_reports(session_id);
CREATE INDEX idx_reports_user ON test_reports(user_id);
CREATE INDEX idx_reports_type ON test_reports(mbti_type);
CREATE INDEX idx_reports_share ON test_reports(share_token);
CREATE INDEX idx_reports_created ON test_reports(created_at DESC);
```

#### 4.2.7 统计数据表 (statistics)
```sql
-- 每日统计表
CREATE TABLE daily_statistics (
    date DATE PRIMARY KEY,
    test_count INT DEFAULT 0,         -- 当日测试次数
    complete_count INT DEFAULT 0,     -- 当日完成数
    unique_users INT DEFAULT 0,       -- 当日独立用户
    avg_duration INT,                 -- 平均完成时长（秒）

    -- 类型分布
    type_distribution JSONB,          -- {"INFJ": 120, "INTP": 85, ...}

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 实时统计缓存表（用Redis替代）
```

### 4.3 Redis缓存设计

```
# 用户会话缓存
session:{session_token} -> {
    "user_id": 123,
    "current_question": 15,
    "answers": {0: 1, 1: 0, ...},  -- 题号: 选项
    "started_at": "2024-01-01T10:00:00Z",
    "ttl": 7200  -- 2小时过期
}
TTL: 7200秒（2小时）

# 题目缓存
questions:all -> [60道题目的JSON]
questions:dimension:{EI|SN|TF|JP} -> 该维度的15道题
TTL: 3600秒（1小时）

# MBTI类型缓存
mbti:types:all -> 16种类型的JSON
mbti:type:{INFJ} -> 单个类型的详细数据
TTL: 86400秒（24小时）

# 报告缓存
report:{session_id} -> 报告详细数据
TTL: 604800秒（7天）

# 统计缓存
stats:daily:{date} -> 当日统计数据
stats:type:distribution -> 类型分布
TTL: 300秒（5分钟）

# 限流
ratelimit:{ip_or_user}:{endpoint} -> 请求计数
TTL: 60秒
```

---

## 五、API接口设计

### 5.1 API规范
- 协议: HTTPS
- 基础路径: `/api/v1`
- 请求格式: JSON
- 响应格式: JSON
- 认证: Bearer Token / Session Token

### 5.2 通用响应格式
```json
{
    "success": true,
    "code": 200,
    "message": "success",
    "data": {},
    "timestamp": 1704067200000
}
```

### 5.3 错误码定义
```
200  Success
400  Bad Request
401  Unauthorized
403  Forbidden
404  Not Found
429  Too Many Requests
500  Internal Server Error

业务错误码：
10001 参数错误
10001 会话不存在
10003 题目不存在
10004 测试已完成
10005 重复提交答案
20001 未达到测试题数
```

### 5.4 API接口列表

#### 5.4.1 测试相关接口

##### 1. 创建测试会话
```http
POST /api/v1/test/session
Content-Type: application/json

{
    "user_id": 123,           // 可选，匿名用户不传
    "anonymous_id": "uuid"    // 可选，匿名用户追踪
}

Response 200:
{
    "success": true,
    "data": {
        "session_id": 123456,
        "session_token": "sess_xxx",
        "total_questions": 60,
        "expires_at": "2024-01-01T12:00:00Z"
    }
}
```

##### 2. 获取题目（批量）
```http
GET /api/v1/test/questions
Authorization: Bearer {session_token}
Query: ?start=0&count=10

Response 200:
{
    "success": true,
    "data": {
        "total": 60,
        "questions": [
            {
                "id": 0,
                "dimension": "EI",
                "dimension_label": "外向 / 内向",
                "question": "在一次大型聚会之后，你通常感觉如何？",
                "options": [
                    "精力充沛，意犹未尽",
                    "有些疲惫，需要独处恢复"
                ],
                "option_labels": ["A", "B"]
            }
        ]
    }
}
```

##### 3. 获取单题（当前题目）
```http
GET /api/v1/test/question/current
Authorization: Bearer {session_token}

Response 200:
{
    "success": true,
    "data": {
        "question_number": 15,  // 第几题（1-60）
        "dimension": "SN",
        "dimension_label": "实感 / 直觉",
        "question": "题目文本",
        "options": ["选项A", "选项B"],
        "progress": {
            "current": 15,
            "total": 60,
            "percentage": 25,
            "answered": 15
        }
    }
}
```

##### 4. 提交答案
```http
POST /api/v1/test/answer
Authorization: Bearer {session_token}
Content-Type: application/json

{
    "question_id": 0,      // 题目序号（0-59）
    "option": 0            // 选择的选项（0或1）
}

Response 200:
{
    "success": true,
    "data": {
        "answered": true,
        "next_question": 1,
        "is_complete": false,
        "progress": {
            "current": 1,
            "total": 60,
            "percentage": 2
        }
    }
}
```

##### 5. 批量提交答案（断点续测）
```http
POST /api/v1/test/answers/batch
Authorization: Bearer {session_token}
Content-Type: application/json

{
    "answers": [
        {"question_id": 0, "option": 0},
        {"question_id": 1, "option": 1},
        // ...
    ]
}

Response 200:
{
    "success": true,
    "data": {
        "accepted": 10,
        "current_question": 10,
        "progress": {"current": 10, "total": 60, "percentage": 17}
    }
}
```

##### 6. 获取测试进度
```http
GET /api/v1/test/progress
Authorization: Bearer {session_token}

Response 200:
{
    "success": true,
    "data": {
        "current_question": 15,
        "answered_count": 15,
        "total": 60,
        "percentage": 25,
        "dimension_progress": {
            "EI": {"answered": 15, "total": 15},
            "SN": {"answered": 0, "total": 15},
            "TF": {"answered": 0, "total": 15},
            "JP": {"answered": 0, "total": 15}
        }
    }
}
```

##### 7. 完成测试
```http
POST /api/v1/test/complete
Authorization: Bearer {session_token}

Response 200:
{
    "success": true,
    "data": {
        "report_id": 789,
        "mbti_type": "INFJ",
        "report_token": "rpt_xxx"
    }
}
```

##### 8. 获取测试报告
```http
GET /api/v1/report/{report_id}
Authorization: Bearer {session_token}

Response 200:
{
    "success": true,
    "data": {
        "report_id": 789,
        "mbti_type": {
            "code": "INFJ",
            "name": "提倡者",
            "emoji": "🌿",
            "headline": "你是一位富有远见的理想主义者",
            "tagline": "深刻、洞察力强，总是在追求更深层的意义。"
        },
        "dimensions": [
            {
                "key": "EI",
                "left": "外向 (E)",
                "right": "内向 (I)",
                "percentage": 20,
                "description": "内向倾向 80%"
            },
            // ... SN, TF, JP
        ],
        "strengths": ["富有创造力", "洞察力强", ...],
        "weaknesses": ["过于理想化", "容易 burnout", ...],
        "compatibility": {
            "best": ["ENFP", "ENTP"],
            "challenging": ["ISTJ", "ESTJ"]
        },
        "careers": ["心理咨询师", "作家", "艺术家", ...],
        "famous_people": ["柏拉图", "甘地", "马丁·路德·金", ...],
        "test_info": {
            "started_at": "2024-01-01T10:00:00Z",
            "completed_at": "2024-01-01T10:15:32Z",
            "duration_seconds": 932
        }
    }
}
```

##### 9. 分享报告（公开访问）
```http
GET /api/v1/report/share/{share_token}

Response 200:
{
    "success": true,
    "data": {
        "mbti_type": {...},
        "dimensions": [...],
        "strengths": [...],
        // ...（不包含敏感信息）
    }
}
```

#### 5.4.2 用户相关接口

##### 1. 获取用户测试历史
```http
GET /api/v1/user/tests
Authorization: Bearer {user_token}
Query: ?page=1&limit=10

Response 200:
{
    "success": true,
    "data": {
        "total": 25,
        "tests": [
            {
                "session_id": 123456,
                "mbti_type": "INFJ",
                "completed_at": "2024-01-01T10:15:32Z",
                "duration_seconds": 932
            }
        ]
    }
}
```

##### 2. 获取用户统计
```http
GET /api/v1/user/statistics
Authorization: Bearer {user_token}

Response 200:
{
    "success": true,
    "data": {
        "total_tests": 25,
        "most_common_type": "INFJ",
        "type_distribution": {
            "INFJ": 10,
            "INFP": 8,
            "INTJ": 7
        },
        "avg_duration": 850
    }
}
```

#### 5.4.3 题库相关接口（管理员）

##### 1. 获取所有题目
```http
GET /api/v1/admin/questions
Authorization: Bearer {admin_token}

Response 200:
{
    "success": true,
    "data": {
        "total": 60,
        "questions": [...]
    }
}
```

##### 2. 更新题目
```http
PUT /api/v1/admin/questions/{question_id}
Authorization: Bearer {admin_token}
Content-Type: application/json

{
    "question_text": "新题目",
    "option_a": "选项A",
    "option_b": "选项B"
}
```

#### 5.4.4 统计相关接口（管理员）

##### 1. 获取统计数据
```http
GET /api/v1/admin/statistics
Authorization: Bearer {admin_token}
Query: ?date=2024-01-01&range=7d

Response 200:
{
    "success": true,
    "data": {
        "total_tests": 15000,
        "unique_users": 12000,
        "completion_rate": 0.85,
        "avg_duration": 850,
        "type_distribution": {
            "INFJ": 938,
            "INFP": 825,
            // ...
        }
    }
}
```

---

## 六、高可用与可扩展性设计

### 6.1 高可用架构

#### 6.1.1 服务层高可用
- **多实例部署**：至少2个API服务实例
- **健康检查**：/health 端点，返回服务状态
- **自动重启**：使用 systemd / Docker restart policy
- **负载均衡**：Nginx 反向代理 + 轮询策略

#### 6.1.2 数据层高可用
- **PostgreSQL 主从复制**：
  - 1主2从架构
  - 自动故障转移（使用 Patroni + etcd）
  - 读写分离（写主库，读从库）

- **Redis 高可用**：
  - Redis Sentinel（3节点）
  - 自动故障转移
  - 主从复制

#### 6.1.3 降级策略
- 题库数据降级：Redis不可用时从数据库读取
- 报告生成降级：异步生成，先返回基础结果
- 统计服务降级：缓存过期时返回上一次结果

### 6.2 可扩展性设计

#### 6.2.1 水平扩展
- **无状态服务**：API服务不保存状态，支持水平扩展
- **会话外部化**：用户会话存储在Redis
- **数据库分片**：未来可按用户ID分片

#### 6.2.2 缓存策略
- **多级缓存**：
  1. 应用内存缓存（本地LRU）
  2. Redis分布式缓存
  3. 数据库

- **缓存预热**：
  - 服务启动时加载热点数据到Redis
  - 定时刷新统计数据

- **缓存更新**：
  - 题库数据：Write-through缓存
  - 统计数据：定时更新（5分钟）

#### 6.2.3 异步处理
- **报告生成**：使用消息队列异步生成详细报告
- **统计数据**：定时任务聚合统计
- **日志写入**：异步写入日志系统

### 6.3 性能优化

#### 6.3.1 数据库优化
- **索引优化**：覆盖索引、复合索引
- **查询优化**：避免N+1查询、使用JOIN
- **连接池**：合理配置连接池大小
- **慢查询监控**：记录并优化慢查询

#### 6.3.2 接口优化
- **批量接口**：支持批量获取题目、批量提交答案
- **分页查询**：列表接口使用游标分页
- **压缩响应**：Gzip压缩JSON响应
- **CDN加速**：静态资源使用CDN

#### 6.3.3 并发控制
- **限流**：
  - IP级别：100 req/min
  - 用户级别：200 req/min
  - 使用 Redis + 令牌桶算法

- **熔断**：使用熔断器模式防止雪崩
- **超时控制**：设置合理的超时时间

### 6.4 监控与告警

#### 6.4.1 监控指标
- **系统指标**：CPU、内存、磁盘、网络
- **应用指标**：QPS、响应时间、错误率
- **业务指标**：测试完成率、类型分布

#### 6.4.2 告警规则
- QPS突增/突降
- 错误率超过1%
- 响应时间P99超过500ms
- 数据库连接池耗尽
- Redis内存使用超过80%

---

## 七、安全性设计

### 7.1 认证与授权
- **会话认证**：匿名用户使用 session_token
- **JWT认证**：注册用户使用 JWT
- **权限控制**：RBAC权限模型

### 7.2 数据安全
- **敏感数据加密**：用户信息加密存储
- **HTTPS传输**：全站HTTPS
- **SQL注入防护**：使用参数化查询
- **XSS防护**：输入输出过滤

### 7.3 防刷机制
- **IP限流**：防止恶意刷接口
- **验证码**：关键操作需要验证码
- **设备指纹**：识别异常设备

---

## 八、部署架构

### 8.1 开发环境
```
docker-compose up
- API Service (1 instance)
- PostgreSQL
- Redis
- Nginx (reverse proxy)
```

### 8.2 生产环境
```
                    ┌─────────────┐
                    │    CDN      │
                    └─────────────┘
                          ↓
                    ┌─────────────┐
                    │   Nginx LB  │
                    └─────────────┘
                          ↓
        ┌─────────────────┼─────────────────┐
        ↓                 ↓                 ↓
┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│ API Node 1  │  │ API Node 2  │  │ API Node 3  │
└─────────────┘  └─────────────┘  └─────────────┘
        ↓                 ↓                 ↓
        └─────────────────┼─────────────────┘
                          ↓
              ┌─────────────────────┐
              │    Redis Sentinel   │
              │  (1 Master + 2 Slave)│
              └─────────────────────┘
                          ↓
              ┌─────────────────────┐
              │  PostgreSQL Cluster │
              │   (1 Master + 2 Slave)│
              └─────────────────────┘
```

---

## 九、开发计划

### Phase 1: 基础架构搭建（Week 1-2）
- [ ] 技术选型确认
- [ ] 项目初始化
- [ ] 数据库设计与创建
- [ ] Redis缓存配置
- [ ] 基础框架搭建
- [ ] Docker本地环境搭建

### Phase 2: 核心功能开发（Week 3-4）
- [ ] 用户模块开发
- [ ] 测试会话管理
- [ ] 题库管理（导入60道题）
- [ ] 答题逻辑开发
- [ ] 进度保存功能
- [ ] 评分算法实现

### Phase 3: 报告与统计（Week 5）
- [ ] 报告生成模块
- [ ] MBTI类型配置
- [ ] 报告分享功能
- [ ] 测试历史查询
- [ ] 基础统计功能

### Phase 4: 前端开发（Week 6-7）
- [ ] 前端框架搭建
- [ ] 页面组件开发（对接UI设计）
- [ ] API集成
- [ ] 状态管理
- [ ] 响应式适配

### Phase 5: 管理后台（Week 8）
- [ ] 后台框架搭建
- [ ] 题库管理界面
- [ ] 用户管理界面
- [ ] 数据看板
- [ ] 系统配置

### Phase 6: 优化与测试（Week 9-10）
- [ ] 性能优化
- [ ] 缓存优化
- [ ] 压力测试
- [ ] 安全测试
- [ ] Bug修复

### Phase 7: 部署与上线（Week 11）
- [ ] 生产环境搭建
- [ ] CI/CD配置
- [ ] 监控告警配置
- [ ] 灰度发布
- [ ] 正式上线

### Phase 8: 运维与迭代（持续）
- [ ] 数据分析
- [ ] 用户反馈收集
- [ ] 功能迭代
- [ ] 性能优化

---

## 十、技术债务管理

### 10.1 已知限制
1. 初期单库单表，后续可能需要分库分表
2. 消息队列使用Redis Streams，高并发场景可升级为Kafka
3. 监控使用Prometheus，可升级为商业APM

### 10.2 未来优化方向
1. 引入Elasticsearch支持全文搜索
2. 引入ClickHouse支持大数据分析
3. 引入GraphQL支持灵活查询
4. 引入gRPC支持服务间通信

---

## 十一、附录

### 11.1 60道题目完整列表
见UI文件中的 `QUESTIONS` 数组（行1670-1738）

### 11.2 16种MBTI类型完整数据
见UI文件中的 `MBTI_TYPES` 对象（行1517-1645）

### 11.3 评分算法详解
```javascript
// 每个维度共15题，每题最高2分
// 每维度最高分 = 15 * 2 = 30分

// 计算百分比
E_Percentage = (EI_Score / 30) * 100

// 判定类型
if (E_Percentage >= 50) {
    Type = 'E'  // 外向
} else {
    Type = 'I'  // 内向
}

// 依次计算4个维度，得到4字母类型
```

### 11.4 数据库初始化SQL
```sql
-- 导入16种MBTI类型
INSERT INTO mbti_types (code, name, emoji, group_name, headline, tagline, strengths, weaknesses, best_match, challenging_match, careers, famous_people)
VALUES
('INFJ', '提倡者', '🌿', '外交家', '你是一位富有远见的理想主义者', '深刻、洞察力强，总是在追求更深层的意义。',
 '["富有创造力","洞察力强","有原则","富有同情心","利他主义"]'::jsonb,
 '["过于理想化","容易 burnout","对批评敏感","固执己见","忽视现实"]'::jsonb,
 '["ENFP","ENTP"]'::jsonb,
 '["ISTP","ESTP"]'::jsonb,
 '["心理咨询师","作家","艺术家","非营利组织","教育工作者","人力资源"]'::jsonb,
 '["柏拉图","甘地","马丁·路德·金","卡尔·荣格","纳尔逊·曼德拉"]'::jsonb
),
-- ... 其他15种类型

-- 导入60道题目
INSERT INTO questions (question_id, dimension, dimension_order, question_text, option_a, option_b, score_a, score_b)
VALUES
(0, 'EI', 1, '在一次大型聚会之后，你通常感觉如何？', '精力充沛，意犹未尽', '有些疲惫，需要独处恢复', 2, 0),
(1, 'EI', 2, '你更喜欢哪种工作环境？', '开放式办公室，随时可以交流', '独立空间，可以专注思考', 2, 0),
-- ... 其他58道题目
;
```
