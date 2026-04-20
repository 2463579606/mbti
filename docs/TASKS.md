# MBTI 测试系统 - 开发任务拆分

> 基于架构设计文档的详细任务列表

---

## 📋 目录
1. [后端开发任务](#后端开发任务)
2. [前端开发任务](#前端开发任务)
3. [数据库任务](#数据库任务)
4. [部署运维任务](#部署运维任务)
5. [测试任务](#测试任务)

---

## 后端开发任务

### P0 - 核心基础（必须完成）

#### 1. 项目初始化
- [ ] **1.1** 创建项目目录结构
  ```
  /cmd/api              # 主程序入口
  /internal             # 私有应用代码
    /config            # 配置管理
    /domain            # 领域模型
    /handler           # HTTP处理器
    /middleware        # 中间件
    /repository        # 数据访问层
    /service           # 业务逻辑层
  /pkg                  # 公共库
  /scripts             # 脚本文件
  /docs                # 文档
  /deploy              # 部署配置
  ```

- [ ] **1.2** 配置管理实现
  - 环境变量配置（.env文件）
  - 配置结构体定义
  - 配置加载与验证
  - 支持多环境（dev/staging/prod）

- [ ] **1.3** 日志系统
  - 结构化日志（使用Zap）
  - 日志分级（DEBUG/INFO/WARN/ERROR）
  - 请求ID追踪
  - 日志轮转配置

- [ ] **1.4** 数据库连接
  - PostgreSQL连接池配置
  - GORM初始化
  - 数据库迁移工具集成
  - 健康检查接口

- [ ] **1.5** Redis连接
  - Redis连接池配置
  - 缓存客户端封装
  - 重连机制

#### 2. 数据模型与Repository

- [ ] **2.1** 数据模型定义（internal/domain）
  ```go
  - User (用户)
  - TestSession (测试会话)
  - TestAnswer (答题记录)
  - Question (题目)
  - MBTIType (MBTI类型)
  - TestReport (测试报告)
  ```

- [ ] **2.2** GORM模型定义
  - 表结构定义
  - 关联关系定义
  - 钩子函数（CreatedAT/UpdatedAt）
  - 软删除支持

- [ ] **2.3** Repository接口定义
  ```go
  type UserRepository interface {
      Create(user *User) error
      FindByID(id int64) (*User, error)
      FindByAnonymousID(id string) (*User, error)
      Update(user *User) error
  }

  type TestSessionRepository interface {
      Create(session *TestSession) error
      FindByID(id int64) (*TestSession, error)
      FindByToken(token string) (*TestSession, error)
      Update(session *TestSession) error
      // ...
  }

  // 其他Repository...
  ```

- [ ] **2.4** Repository实现（internal/repository）
  - PostgreSQL实现
  - 单元测试
  - 事务支持

#### 3. 业务服务层（internal/service）

- [ ] **3.1** UserService
  - 创建用户（支持匿名）
  - 生成匿名ID
  - 获取用户信息
  - 更新测试统计

- [ ] **3.2** TestService（核心业务）
  ```
  核心方法：
  - CreateSession() 创建测试会话
  - GetQuestion() 获取当前题目
  - GetQuestions() 批量获取题目
  - SubmitAnswer() 提交单个答案
  - SubmitAnswers() 批量提交答案
  - GetProgress() 获取测试进度
  - CompleteTest() 完成测试
  - CalculateResult() 计算MBTI结果
  ```

- [ ] **3.3** QuestionService
  - 获取所有题目
  - 按维度获取题目
  - 题目缓存预热
  - 题目版本管理

- [ ] **3.4** ScoringService
  - 计算维度分数
  - 判定MBTI类型
  - 计算百分比
  - 生成详细结果

- [ ] **3.5** ReportService
  - 生成测试报告
  - 获取报告详情
  - 生成分享链接
  - 报告缓存管理

- [ ] **3.6** StatisticsService
  - 每日统计聚合
  - 类型分布统计
  - 用户行为统计
  - 统计缓存更新

#### 4. API Handler（internal/handler）

- [ ] **4.1** TestHandler
  ```
  POST /api/v1/test/session       - 创建会话
  GET  /api/v1/test/questions     - 获取题目列表
  GET  /api/v1/test/question/current - 获取当前题
  POST /api/v1/test/answer        - 提交答案
  POST /api/v1/test/answers/batch - 批量提交
  GET  /api/v1/test/progress      - 获取进度
  POST /api/v1/test/complete      - 完成测试
  ```

- [ ] **4.2** ReportHandler
  ```
  GET /api/v1/report/:id          - 获取报告
  GET /api/v1/report/share/:token - 分享报告
  ```

- [ ] **4.3** UserHandler
  ```
  GET /api/v1/user/tests          - 测试历史
  GET /api/v1/user/statistics     - 用户统计
  ```

- [ ] **4.4** AdminHandler
  ```
  GET /api/v1/admin/statistics    - 全局统计
  GET /api/v1/admin/questions     - 题目管理
  PUT /api/v1/admin/questions/:id - 更新题目
  ```

#### 5. 中间件（internal/middleware）

- [ ] **5.1** 认证中间件
  - JWT token验证
  - Session token验证
  - 匿名用户支持

- [ ] **5.2** 限流中间件
  - IP限流
  - 用户限流
  - 令牌桶算法
  - Redis存储计数

- [ ] **5.3** 日志中间件
  - 请求日志记录
  - 响应时间记录
  - 请求ID生成

- [ ] **5.4** 错误恢复中间件
  - Panic恢复
  - 统一错误响应

- [ ] **5.5** CORS中间件
  - 跨域配置
  - 白名单管理

#### 6. 工具函数（pkg/）

- [ ] **6.1** 响应封装
  ```go
  type Response struct {
      Success bool        `json:"success"`
      Code    int         `json:"code"`
      Message string      `json:"message"`
      Data    interface{} `json:"data"`
  }
  ```

- [ ] **6.2** 错误码定义
  ```go
  const (
      ErrCodeSuccess      = 200
      ErrCodeBadRequest   = 400
      ErrCodeUnauthorized = 401
      // ...
  )
  ```

- [ ] **6.3** 工具函数
  - 生成随机Token
  - 生成匿名ID
  - 时间格式化
  - 分页参数处理

### P1 - 重要功能（优先完成）

#### 7. 缓存实现

- [ ] **7.1** 缓存接口定义
  ```go
  type Cache interface {
      Set(key string, value interface{}, ttl time.Duration) error
      Get(key string, dest interface{}) error
      Del(key string) error
      Exists(key string) (bool, error)
  }
  ```

- [ ] **7.2** Redis缓存实现
  - String缓存
  - Hash缓存
  - 序列化/反序列化

- [ ] **7.3** 缓存使用场景
  - 题目缓存
  - MBTI类型缓存
  - 报告缓存
  - 统计数据缓存

#### 8. 数据初始化

- [ ] **8.1** MBTI类型数据初始化
  - 16种类型SQL脚本
  - 数据导入脚本
  - 验证数据完整性

- [ ] **8.2** 题目数据初始化
  - 60道题目SQL脚本
  - 从UI数据提取
  - 验证题目编号连续性

#### 9. 评分算法实现

- [ ] **9.1** 维度分数计算
  ```go
  func CalculateDimensionScore(answers []Answer, dimension string) int
  ```

- [ ] **9.2** 类型判定逻辑
  ```go
  func DetermineMBTIType(scores map[string]int) string
  ```

- [ ] **9.3** 百分比计算
  ```go
  func CalculatePercentage(score int, maxScore int) int
  ```

- [ ] **9.4** 单元测试
  - 测试各维度计算
  - 测试边界情况
  - 测试完整流程

### P2 - 增强功能

#### 10. 异步任务

- [ ] **10.1** 消息队列封装
  - Redis Streams实现
  - 生产者/消费者模式

- [ ] **10.2** 异步任务定义
  - 报告生成任务
  - 统计聚合任务
  - 数据清理任务

#### 11. 管理后台API

- [ ] **11.1** 题目管理API
  - CRUD接口
  - 批量导入
  - 版本管理

- [ ] **11.2** 用户管理API
  - 用户列表
  - 用户详情
  - 用户封禁

- [ ] **11.3** 数据看板API
  - 实时数据
  - 趋势数据
  - 导出功能

---

## 前端开发任务

### P0 - 核心功能

#### 1. 项目初始化

- [ ] **1.1** 创建项目
  - Vue 3 + Vite 或 React + Next.js
  - TypeScript配置
  - ESLint + Prettier

- [ ] **1.2** 目录结构
  ```
  /src
    /api          # API调用
    /components   # 组件
    /pages        # 页面
    /stores       # 状态管理
    /utils        # 工具函数
    /types        # TypeScript类型
    /styles       # 样式文件
  ```

- [ ] **1.3** 基础配置
  - 环境变量配置
  - 路由配置
  - Axios封装
  - 全局样式

#### 2. API集成

- [ ] **2.1** API服务封装
  ```typescript
  // api/test.ts
  export const testApi = {
      createSession: () => axios.post('/test/session'),
      getQuestions: (params) => axios.get('/test/questions', { params }),
      submitAnswer: (data) => axios.post('/test/answer', data),
      // ...
  }
  ```

- [ ] **2.2** 请求/响应拦截
  - Token自动添加
  - 错误统一处理
  - Loading状态管理

- [ ] **2.3** 类型定义
  ```typescript
  // types/index.ts
  interface Question {
      id: number
      dimension: string
      question: string
      options: string[]
  }

  interface TestSession {
      sessionId: number
      sessionToken: string
      totalQuestions: number
  }

  interface MBTIType {
      code: string
      name: string
      emoji: string
      // ...
  }
  ```

#### 3. 状态管理

- [ ] **3.1** Test Store（测试状态）
  ```typescript
  interface TestState {
      sessionToken: string | null
      currentQuestion: number
      answers: Map<number, number>
      isComplete: boolean
      result: MBTIResult | null
  }
  ```

- [ ] **3.2** User Store（用户状态）
  ```typescript
  interface UserState {
      userId: number | null
      anonymousId: string | null
      testHistory: TestHistory[]
  }
  ```

#### 4. 页面组件

- [ ] **4.1** 欢迎页（Welcome Page）
  - Hero区域
  - 16种类型展示
  - 功能特性介绍
  - 开始测试按钮

- [ ] **4.2** 测试页（Test Page）
  - 进度条组件
  - 维度标签组件
  - 题目卡片组件
  - 选项按钮组件
  - 导航控制组件
  - 点状导航组件

- [ ] **4.3** 加载页（Loading Page）
  - 加载动画
  - 步骤进度

- [ ] **4.4** 结果页（Result Page）
  - 类型展示组件
  - 维度分析条组件
  - 优劣势卡片组件
  - 兼容性组件
  - 职业建议组件
  - 著名人物组件
  - 分享按钮

#### 5. 通用组件

- [ ] **5.1** 布局组件
  - 导航栏
  - 页脚
  - 容器布局

- [ ] **5.2** 反馈组件
  - Toast提示
  - Modal弹窗
  - Loading遮罩

- [ ] **5.3** 表单组件
  - 按钮组件
  - 输入框组件

#### 6. 样式实现

- [ ] **6.1** 设计令牌系统
  ```css
  :root {
      --color-bg: #0d0d1a;
      --color-primary: #7c6ff7;
      /* ... */
  }
  ```

- [ ] **6.2** 响应式适配
  - 移动端断点
  - 平板适配
  - 桌面端优化

- [ ] **6.3** 动画效果
  - 页面切换动画
  - 卡片动画
  - 进度条动画

### P1 - 增强功能

#### 7. 用户体验优化

- [ ] **7.1** 断点续测
  - 本地答案缓存
  - 重新进入时恢复
  - 自动保存进度

- [ ] **7.2** 分享功能
  - 生成分享链接
  - 分享卡片预览
  - 社交媒体分享

- [ ] **7.3** 测试历史
  - 历史记录列表
  - 快速查看旧报告

#### 8. 性能优化

- [ ] **8.1** 代码分割
  - 路由懒加载
  - 组件懒加载

- [ ] **8.2** 资源优化
  - 图片压缩
  - 字体优化
  - CDN加速

---

## 数据库任务

### DDL脚本

- [ ] **1.1** 创建数据库
  ```sql
  CREATE DATABASE mbti_test ENCODING 'UTF8';
  ```

- [ ] **1.2** 创建表结构
  - users.sql
  - test_sessions.sql
  - test_answers.sql
  - questions.sql
  - mbti_types.sql
  - test_reports.sql
  - daily_statistics.sql

- [ ] **1.3** 创建索引
  - 性能关键索引
  - 唯一约束索引

### 数据初始化

- [ ] **2.1** MBTI类型数据
  ```sql
  -- insert_mbti_types.sql
  INSERT INTO mbti_types (code, name, emoji, ...) VALUES
  ('INTJ', '建筑师', '🏛️', ...),
  ('INTP', '逻辑学家', '🔬', ...),
  -- ... 16种类型
  ```

- [ ] **2.2** 题目数据
  ```sql
  -- insert_questions.sql
  INSERT INTO questions (question_id, dimension, ...) VALUES
  (0, 'EI', 1, '在一次大型聚会之后...', ...),
  -- ... 60道题目
  ```

### 迁移脚本

- [ ] **3.1** 版本管理
  - migrations/001_init.up.sql
  - migrations/001_init.down.sql

- [ ] **3.2** 数据迁移工具
  - golang-migrate配置
  - 迁移命令脚本

---

## 部署运维任务

### Docker配置

- [ ] **1.1** API服务Dockerfile
  ```dockerfile
  FROM golang:1.21-alpine AS builder
  WORKDIR /app
  COPY . .
  RUN go build -o api ./cmd/api

  FROM alpine:latest
  COPY --from=builder /app/api /usr/local/bin/api
  CMD ["api"]
  ```

- [ ] **1.2** 前端Dockerfile
  ```dockerfile
  FROM node:20-alpine AS builder
  WORKDIR /app
  COPY package*.json ./
  RUN npm install
  COPY . .
  RUN npm run build

  FROM nginx:alpine
  COPY --from=builder /app/dist /usr/share/nginx/html
  ```

- [ ] **1.3** docker-compose.yml
  ```yaml
  services:
    api:
      build: ./backend
      ports: ["8000:8000"]
      depends_on: [postgres, redis]

    postgres:
      image: postgres:15
      environment:
        POSTGRES_DB: mbti_test

    redis:
      image: redis:7-alpine

    frontend:
      build: ./frontend
      ports: ["80:80"]
  ```

### CI/CD

- [ ] **2.1** GitHub Actions配置
  - 自动测试
  - 自动构建
  - 自动部署

- [ ] **2.2** 部署脚本
  - 生产环境部署
  - 数据库迁移
  - 服务重启

### 监控告警

- [ ] **3.1** Prometheus配置
  - API指标暴露
  - 数据库指标
  - Redis指标

- [ ] **3.2** Grafana仪表盘
  - 系统指标
  - 业务指标
  - 告警规则

---

## 测试任务

### 单元测试

- [ ] **1.1** Service层测试
  - TestService
  - ScoringService
  - ReportService

- [ ] **1.2** 工具函数测试
  - 评分算法
  - 类型判定
  - 百分比计算

### 集成测试

- [ ] **2.1** API测试
  - 测试流程完整测试
  - 边界情况测试
  - 错误处理测试

- [ ] **2.2** 数据库测试
  - Repository测试
  - 事务测试
  - 并发测试

### 压力测试

- [ ] **3.1** 性能基准
  - QPS测试
  - 响应时间测试
  - 并发用户测试

- [ ] **3.2** 容量规划
  - 数据库容量
  - Redis容量
  - 服务器资源

---

## 开发优先级建议

### 第1周：基础设施
1. 项目初始化
2. 数据库创建
3. 基础框架搭建
4. Docker本地环境

### 第2周：核心业务
1. 数据模型定义
2. Repository实现
3. TestService核心逻辑
4. 评分算法实现

### 第3周：API开发
1. Test Handler实现
2. 题目数据导入
3. API测试
4. 前端项目初始化

### 第4周：前端开发
1. 测试页面开发
2. API集成
3. 结果页面开发
4. 样式实现

### 第5周：完善与优化
1. 报告功能
2. 缓存实现
3. 前端优化
4. 测试修复

### 第6周：部署上线
1. 生产环境搭建
2. CI/CD配置
3. 监控配置
4. 正式上线

---

## 技术选型建议

### 推荐方案：Go + Vue 3
**理由：**
- Go：高性能、并发强、部署简单
- Vue 3：与UI技术栈一致、开发效率高
- PostgreSQL：可靠稳定、功能完善
- Redis：高性能缓存

### 备选方案：Node.js + React
**适用场景：**
- 团队更熟悉JavaScript
- 需要前后端技术栈统一
- 快速迭代开发
