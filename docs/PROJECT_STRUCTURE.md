# MBTI 测试系统 - 项目目录结构

本文档详细说明了项目的目录结构和各文件的作用。

---

## 📁 完整目录结构

```
mbti/
├── README.md                    # 项目说明文档
├── CLAUDE.md                    # Claude Code 开发指南
├── LICENSE                      # 开源许可证
│
├── docs/                        # 📚 项目文档
│   ├── ARCHITECTURE.md          # 系统架构设计文档
│   ├── API.md                   # API接口文档
│   ├── DATABASE.md              # 数据库设计文档
│   ├── TASKS.md                 # 开发任务清单
│   └── PROJECT_STRUCTURE.md     # 本文档
│
├── ui/                          # 🎨 UI设计文件
│   └── index.html               # 完整的UI原型（包含所有页面和数据）
│
├── backend/                     # 🔧 后端服务
│   │
│   ├── cmd/                     # 主程序入口
│   │   └── api/
│   │       └── main.go          # API服务启动文件
│   │
│   ├── internal/                # 私有应用代码（不可被外部导入）
│   │   │
│   │   ├── config/              # 配置管理
│   │   │   ├── config.go        # 配置结构体定义
│   │   │   └── loader.go        # 配置加载逻辑
│   │   │
│   │   ├── domain/              # 领域模型（业务实体）
│   │   │   ├── user.go          # 用户实体
│   │   │   ├── test_session.go  # 测试会话实体
│   │   │   ├── test_answer.go   # 答案记录实体
│   │   │   ├── question.go      # 题目实体
│   │   │   ├── mbti_type.go     # MBTI类型实体
│   │   │   └── test_report.go   # 测试报告实体
│   │   │
│   │   ├── handler/             # HTTP处理器（Controller层）
│   │   │   ├── test_handler.go  # 测试相关接口
│   │   │   ├── report_handler.go # 报告相关接口
│   │   │   ├── user_handler.go  # 用户相关接口
│   │   │   └── admin_handler.go # 管理后台接口
│   │   │
│   │   ├── middleware/          # 中间件
│   │   │   ├── auth.go          # 认证中间件
│   │   │   ├── ratelimit.go     # 限流中间件
│   │   │   ├── logger.go        # 日志中间件
│   │   │   ├── recovery.go      # 错误恢复中间件
│   │   │   └── cors.go          # CORS中间件
│   │   │
│   │   ├── repository/          # 数据访问层（DAO层）
│   │   │   ├── interfaces.go    # Repository接口定义
│   │   │   ├── user_repo.go     # 用户数据访问
│   │   │   ├── session_repo.go  # 会话数据访问
│   │   │   ├── answer_repo.go   # 答案数据访问
│   │   │   ├── question_repo.go # 题目数据访问
│   │   │   └── report_repo.go   # 报告数据访问
│   │   │
│   │   └── service/             # 业务逻辑层
│   │       ├── user_service.go  # 用户业务逻辑
│   │       ├── test_service.go  # 测试业务逻辑
│   │       ├── question_service.go # 题目业务逻辑
│   │       ├── scoring_service.go  # 评分算法
│   │       ├── report_service.go   # 报告业务逻辑
│   │       └── statistics_service.go # 统计业务逻辑
│   │
│   ├── pkg/                     # 公共库（可被外部导入）
│   │   ├── cache/               # 缓存封装
│   │   │   ├── interface.go     # 缓存接口
│   │   │   └── redis.go         # Redis实现
│   │   ├── database/            # 数据库封装
│   │   │   ├── postgres.go      # PostgreSQL连接
│   │   │   └── redis.go         # Redis连接
│   │   ├── response/            # 响应封装
│   │   │   └── response.go      # 统一响应格式
│   │   ├── errors/              # 错误处理
│   │   │   ├── codes.go         # 错误码定义
│   │   │   └── errors.go        # 错误处理函数
│   │   └── utils/               # 工具函数
│   │       ├── token.go         # Token生成
│   │       ├── time.go          # 时间处理
│   │       └── validator.go     # 数据验证
│   │
│   ├── scripts/                 # 脚本文件
│   │   ├── init_db.sh           # 数据库初始化脚本
│   │   ├── migrate.sh           # 数据迁移脚本
│   │   └── seed_data.sh         # 数据种子脚本
│   │
│   ├── migrations/              # 数据库迁移文件
│   │   ├── 001_init_schema.up.sql
│   │   ├── 001_init_schema.down.sql
│   │   ├── 002_add_indexes.up.sql
│   │   └── 002_add_indexes.down.sql
│   │
│   ├── tests/                   # 测试文件
│   │   ├── unit/                # 单元测试
│   │   ├── integration/         # 集成测试
│   │   └── e2e/                 # 端到端测试
│   │
│   ├── config/                  # 配置文件
│   │   ├── config.yaml          # 配置文件
│   │   ├── config.dev.yaml      # 开发环境配置
│   │   ├── config.staging.yaml  # 预发布环境配置
│   │   └── config.prod.yaml     # 生产环境配置
│   │
│   ├── .env.example             # 环境变量示例
│   ├── .air.toml                # Air热重载配置
│   ├── go.mod                   # Go模块定义
│   ├── go.sum                   # Go依赖锁定
│   ├── Dockerfile               # Docker镜像构建文件
│   └── Makefile                 # Make命令定义
│
├── frontend/                    # 🎨 前端服务
│   │
│   ├── src/                     # 源代码
│   │   │
│   │   ├── api/                 # API调用封装
│   │   │   ├── client.ts        # Axios客户端配置
│   │   │   ├── test.ts          # 测试相关API
│   │   │   ├── report.ts        # 报告相关API
│   │   │   └── user.ts          # 用户相关API
│   │   │
│   │   ├── assets/              # 静态资源
│   │   │   ├── images/          # 图片
│   │   │   ├── fonts/           # 字体
│   │   │   └── icons/           # 图标
│   │   │
│   │   ├── components/          # 通用组件
│   │   │   ├── common/          # 基础组件
│   │   │   │   ├── Button.vue
│   │   │   │   ├── Card.vue
│   │   │   │   ├── Modal.vue
│   │   │   │   └── Toast.vue
│   │   │   ├── layout/          # 布局组件
│   │   │   │   ├── Header.vue
│   │   │   │   ├── Footer.vue
│   │   │   │   └── Container.vue
│   │   │   └── test/            # 测试相关组件
│   │   │       ├── ProgressBar.vue
│   │   │       ├── QuestionCard.vue
│   │   │       ├── OptionButton.vue
│   │   │       └── DimensionBar.vue
│   │   │
│   │   ├── pages/               # 页面组件
│   │   │   ├── WelcomePage.vue  # 欢迎页
│   │   │   ├── TestPage.vue     # 测试页
│   │   │   ├── LoadingPage.vue  # 加载页
│   │   │   └── ResultPage.vue   # 结果页
│   │   │
│   │   ├── stores/              # 状态管理（Pinia）
│   │   │   ├── test.ts          # 测试状态
│   │   │   ├── user.ts          # 用户状态
│   │   │   └── app.ts           # 应用状态
│   │   │
│   │   ├── router/              # 路由配置
│   │   │   └── index.ts         # 路由定义
│   │   │
│   │   ├── types/               # TypeScript类型定义
│   │   │   ├── test.ts          # 测试相关类型
│   │   │   ├── report.ts        # 报告相关类型
│   │   │   └── user.ts          # 用户相关类型
│   │   │
│   │   ├── utils/               # 工具函数
│   │   │   ├── storage.ts       # 本地存储
│   │   │   ├── format.ts        # 格式化函数
│   │   │   └── validate.ts      # 验证函数
│   │   │
│   │   ├── styles/              # 样式文件
│   │   │   ├── variables.css    # CSS变量
│   │   │   ├── reset.css        # 样式重置
│   │   │   └── main.css         # 主样式
│   │   │
│   │   ├── App.vue              # 根组件
│   │   └── main.ts              # 入口文件
│   │
│   ├── public/                  # 公共静态资源
│   │   ├── favicon.ico
│   │   └── robots.txt
│   │
│   ├── index.html               # HTML模板
│   ├── vite.config.ts           # Vite配置
│   ├── tsconfig.json            # TypeScript配置
│   ├── tailwind.config.js       # Tailwind CSS配置
│   ├── package.json             # 项目依赖
│   ├── package-lock.json        # 依赖锁定
│   ├── .eslintrc.js             # ESLint配置
│   ├── .prettierrc              # Prettier配置
│   └── Dockerfile               # Docker镜像构建文件
│
├── deploy/                      # 🚀 部署配置
│   ├── docker/
│   │   ├── docker-compose.yml   # Docker Compose配置
│   │   ├── docker-compose.prod.yml # 生产环境配置
│   │   └── .env.example         # 环境变量示例
│   │
│   ├── nginx/
│   │   ├── nginx.conf           # Nginx主配置
│   │   ├── conf.d/
│   │   │   ├── api.conf         # API服务配置
│   │   │   └── frontend.conf    # 前端服务配置
│   │   └── ssl/                 # SSL证书
│   │       ├── cert.pem
│   │       └── key.pem
│   │
│   ├── kubernetes/              # K8s配置（可选）
│   │   ├── namespace.yaml
│   │   ├── deployment.yaml
│   │   ├── service.yaml
│   │   └── ingress.yaml
│   │
│   └── scripts/
│       ├── deploy.sh            # 部署脚本
│       ├── backup.sh            # 备份脚本
│       └── restart.sh           # 重启脚本
│
├── .gitignore                   # Git忽略文件
├── .dockerignore                # Docker忽略文件
└── .env.example                 # 环境变量示例
```

---

## 📂 目录说明

### 1. `/docs` - 项目文档

存放所有项目相关文档，包括架构设计、API文档、数据库设计等。

**关键文件：**
- `ARCHITECTURE.md` - 必读！包含完整的系统架构设计
- `API.md` - API接口详细说明
- `DATABASE.md` - 数据库表结构和初始化脚本
- `TASKS.md` - 开发任务清单和时间表

### 2. `/ui` - UI设计文件

包含完整的UI原型设计（单页HTML），展示所有页面效果和交互逻辑。

**用途：**
- 设计参考
- 数据结构参考
- 交互逻辑参考

### 3. `/backend` - 后端服务

后端Go服务代码，采用分层架构设计。

**架构分层：**
```
Handler (Controller) → Service (Business Logic) → Repository (Data Access)
```

**关键目录：**
- `internal/domain/` - 领域模型，定义业务实体
- `internal/handler/` - HTTP处理器，处理请求响应
- `internal/service/` - 业务逻辑，核心算法实现
- `internal/repository/` - 数据访问，数据库操作
- `pkg/` - 公共库，可复用组件

### 4. `/frontend` - 前端服务

前端Vue/React应用代码。

**关键目录：**
- `src/api/` - API调用封装
- `src/stores/` - 状态管理
- `src/pages/` - 页面组件
- `src/components/` - 通用组件

### 5. `/deploy` - 部署配置

包含Docker、Nginx、K8s等部署配置文件。

---

## 🔄 数据流转

### 请求处理流程

```
用户请求
    ↓
Nginx (负载均衡)
    ↓
API Gateway (路由/限流)
    ↓
Handler (参数验证)
    ↓
Service (业务逻辑)
    ↓
Repository (数据访问)
    ↓
PostgreSQL / Redis
```

### 数据返回流程

```
PostgreSQL / Redis
    ↓
Repository (数据映射)
    ↓
Service (数据处理)
    ↓
Handler (响应封装)
    ↓
API Gateway
    ↓
Nginx
    ↓
用户响应
```

---

## 📝 文件命名规范

### Go文件
- 包文件：`package_name.go`
- 测试文件：`package_name_test.go`
- 接口文件：`interfaces.go`

### TypeScript文件
- 组件：`ComponentName.vue` / `ComponentName.tsx`
- 类型定义：`types.ts`
- API调用：`api.ts`
- 工具函数：`utils.ts`

### 配置文件
- 环境配置：`.env.{environment}`
- Docker配置：`Dockerfile`、`docker-compose.yml`
- Nginx配置：`nginx.conf`

---

## 🔧 开发工作流

### 1. 新功能开发

```bash
# 1. 创建特性分支
git checkout -b feature/new-function

# 2. 按照目录结构创建文件
# - domain: 定义实体
# - repository: 实现数据访问
# - service: 实现业务逻辑
# - handler: 实现HTTP接口

# 3. 编写测试
# - tests/unit: 单元测试
# - tests/integration: 集成测试

# 4. 提交代码
git add .
git commit -m "feat: add new function"
git push origin feature/new-function
```

### 2. Bug修复

```bash
# 1. 创建修复分支
git checkout -b fix/bug-description

# 2. 修复问题并添加测试

# 3. 提交代码
git commit -m "fix: resolve bug description"
```

---

## 📊 模块依赖关系

```
┌──────────────────────────────────────────────────────┐
│                    Handler Layer                     │
│  (TestHandler, ReportHandler, UserHandler)           │
└─────────────────────┬────────────────────────────────┘
                      │ 依赖
                      ↓
┌──────────────────────────────────────────────────────┐
│                   Service Layer                      │
│  (TestService, ScoringService, ReportService)        │
└─────────────────────┬────────────────────────────────┘
                      │ 依赖
                      ↓
┌──────────────────────────────────────────────────────┐
│                 Repository Layer                     │
│  (UserRepository, SessionRepository, QuestionRepo)   │
└─────────────────────┬────────────────────────────────┘
                      │ 依赖
                      ↓
┌──────────────────────────────────────────────────────┐
│                   Data Layer                         │
│              (PostgreSQL, Redis)                     │
└──────────────────────────────────────────────────────┘
```

---

## 🎯 快速定位

### 找测试相关代码
- Handler: `backend/internal/handler/test_handler.go`
- Service: `backend/internal/service/test_service.go`
- Repository: `backend/internal/repository/session_repo.go`
- Frontend: `frontend/src/pages/TestPage.vue`

### 找评分算法
- Service: `backend/internal/service/scoring_service.go`
- 算法说明: `docs/ARCHITECTURE.md` (第11.3节)

### 找数据库表定义
- SQL脚本: `docs/DATABASE.md`
- Domain模型: `backend/internal/domain/*.go`

### 找API接口定义
- API文档: `docs/API.md`
- Handler实现: `backend/internal/handler/*.go`

---

## 📖 延伸阅读

- [架构设计文档](ARCHITECTURE.md) - 系统整体架构
- [API接口文档](API.md) - 接口详细说明
- [数据库设计](DATABASE.md) - 数据库表结构
- [任务清单](TASKS.md) - 开发任务拆分
