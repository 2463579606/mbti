# MBTI 性格测试系统

> 一个科学、精准的MBTI性格测试平台，基于迈尔斯-布里格斯类型指标（MBTI）理论，提供60道专业题库和详细的分析报告。

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Node](https://img.shields.io/badge/Node.js-20+-339933?logo=node.js)](https://nodejs.org/)
[![Vue](https://img.shields.io/badge/Vue-3.4+-35495E?logo=vue.js)](https://vuejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-336791?logo=postgresql)](https://www.postgresql.org/)
[![Redis](https://img.shields.io/badge/Redis-7+-DC382D?logo=redis)](https://redis.io/)
[![Status](https://img.shields.io/badge/status-ready-success)]()

---

## 📖 项目简介

这是一个完整的MBTI性格测试系统，包含精美的前端界面和强大的后端架构。系统通过60道专业题目，从四个维度（E/I、S/N、T/F、J/P）分析用户的性格类型，生成详细的测试报告。

### 核心特性

- 🎯 **60道专业题库** - 每个维度15道题目，科学严谨
- 📊 **多维度分析** - 4个维度独立评分，百分比呈现
- 📝 **详细报告** - 优势、劣势、职业建议、兼容性分析
- 💫 **精美UI** - 现代化设计，流畅的动画效果，完全匹配设计稿
- 🚀 **高性能** - 支持高并发，响应速度快
- 🔒 **安全可靠** - 数据加密，隐私保护
- 💾 **断点续测** - 保存进度，随时继续
- 👤 **用户系统** - 注册/登录、个人中心、测试历史 ⭐ NEW
- 📈 **统计分析** - 用户统计、类型分布、趋势分析 ⭐ NEW
- 🔧 **管理后台** - 题库管理、用户管理、会话监控、系统状态 ⭐ NEW

---

## ✨ 项目完成状态

**核心功能 + 非核心功能已完成** ✅ - 可立即投入使用

- ✅ 完整的后端API（Node.js + NestJS + TypeORM）
- ✅ 完整的前端界面（Vue 3 + TypeScript + Vite）
- ✅ 数据库设计和初始化脚本
- ✅ 评分算法实现（完全匹配UI逻辑）
- ✅ 所有页面完全匹配UI设计
- ✅ 用户认证系统（JWT + bcrypt）
- ✅ 用户个人中心（测试历史、统计分析、设置）
- ✅ 管理后台（仪表盘、题库管理、用户管理、会话监控、系统状态）

查看 [DEVELOPMENT_PROGRESS_REPORT.md](DEVELOPMENT_PROGRESS_REPORT.md) 了解详情。

---

## 🏗️ 技术架构

### 技术栈

| 层级 | 技术 | 说明 |
|------|------|------|
| **前端** | Vue 3 + Vite + TypeScript | 现代化前端框架 |
| **后端** | Node.js 20 + NestJS + TypeScript | 高性能企业级框架 |
| **数据库** | PostgreSQL 15+ | 主数据存储 |
| **ORM** | TypeORM 0.3+ | TypeScript ORM |
| **缓存** | Redis 7+ (ioredis) | 分布式缓存 |
| **状态管理** | Pinia | Vue 3 官方推荐 |
| **构建工具** | Vite 5+ | 快速开发构建 |

### 系统架构

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Web UI    │────▶│  API Gateway│────▶│ API Service │
│  (Vue/React)│     │   (Nginx)   │     │  (Go/Node)  │
└─────────────┘     └─────────────┘     └──────┬──────┘
                                              │
                    ┌─────────────────────────┼─────────────────┐
                    ▼                         ▼                 ▼
              ┌──────────┐            ┌──────────┐      ┌──────────┐
              │PostgreSQL│            │  Redis   │      │ Message  │
              │          │            │          │      │  Queue   │
              └──────────┘            └──────────┘      └──────────┘
```

---

## 📚 文档导航

| 文档 | 说明 | 链接 |
|------|------|------|
| **架构设计文档** | 系统架构、技术选型、模块划分 | [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) |
| **API接口文档** | RESTful API详细说明 | [docs/API.md](docs/API.md) |
| **数据库设计** | 表结构、索引、初始化脚本 | [docs/DATABASE.md](docs/DATABASE.md) |
| **开发任务清单** | 详细任务拆分、开发计划 | [docs/TASKS.md](docs/TASKS.md) |
| **开发指南** | Claude Code工作指南 | [CLAUDE.md](CLAUDE.md) |

---

## 🚀 快速开始

### 环境要求

- Go 1.21+ / Node.js 20+
- PostgreSQL 15+
- Redis 7+
- Docker & Docker Compose（可选）

### 1. 克隆项目

```bash
git clone https://github.com/your-username/mbti.git
cd mbti
```

### 2. 数据库初始化

```bash
# 连接PostgreSQL
psql -U postgres

# 执行初始化脚本
\i docs/DATABASE.md
```

或使用Docker：

```bash
docker-compose up -d postgres redis
```

### 3. 后端服务启动

#### Go版本：
```bash
cd backend
go mod download
go run cmd/api/main.go
```

#### Node.js版本：
```bash
cd backend
npm install
npm run dev
```

### 4. 前端服务启动

```bash
cd frontend
npm install
npm run dev
```

访问：http://localhost:3000

---

## 📊 数据模型

### 核心数据表

```sql
users           -- 用户表
test_sessions   -- 测试会话表
test_answers    -- 答案记录表
questions       -- 题目表（60道）
mbti_types      -- MBTI类型配置表（16种）
test_reports    -- 测试报告表
daily_statistics -- 每日统计表
```

### MBTI类型分布

| 分组 | 类型 |
|------|------|
| **分析家** | INTJ、INTP、ENTJ、ENTP |
| **外交家** | INFJ、INFP、ENFJ、ENFP |
| **哨兵** | ISTJ、ISFJ、ESTJ、ESFJ |
| **探险家** | ISTP、ISFP、ESTP、ESFP |

---

## 🎯 核心功能

### 1. 测试流程

```
开始测试 → 答题（60道） → 提交 → 生成报告 → 查看/分享
```

### 2. 评分算法

```javascript
// 每个维度15题，每题最高2分
// 维度分数 = 用户得分 / 30 * 100

// 判定类型（以E/I为例）
if (EI_Percentage >= 50) {
    Type = 'E'  // 外向
} else {
    Type = 'I'  // 内向
}

// 得到4字母类型，如：INFJ
```

### 3. API接口

**测试相关**:
- `POST /api/v1/test/session` - 创建测试会话
- `GET /api/v1/test/question/current` - 获取当前题目
- `POST /api/v1/test/answer` - 提交答案
- `POST /api/v1/test/answers/batch` - 批量提交答案
- `POST /api/v1/test/complete` - 完成测试

**认证相关** ⭐:
- `POST /api/v1/auth/register` - 用户注册
- `POST /api/v1/auth/login` - 用户登录
- `GET /api/v1/auth/me` - 获取当前用户
- `PUT /api/v1/auth/profile` - 更新个人信息
- `POST /api/v1/auth/change-password` - 修改密码

**用户相关** ⭐:
- `GET /api/v1/user/tests` - 测试历史
- `GET /api/v1/user/statistics` - 用户统计

**管理后台** ⭐:
- `GET /api/v1/admin/statistics` - 仪表盘统计
- `GET /api/v1/admin/questions` - 题库列表
- `PUT /api/v1/admin/questions/:id` - 更新题目
- `GET /api/v1/admin/users` - 用户列表
- `GET /api/v1/admin/sessions` - 会话监控
- `POST /api/v1/admin/cache/clear` - 清除缓存
- `GET /api/v1/admin/health` - 系统状态

**报告相关**:
- `GET /api/v1/report/:id` - 获取报告
- `GET /api/v1/report/share/:token` - 公开分享链接

完整API文档：[docs/API.md](docs/API.md)

---

## 🎨 UI设计

### 页面结构

**核心页面**:
1. **欢迎页** - 展示16种性格类型和功能特性
2. **测试页** - 60道题目，进度追踪，维度标签
3. **加载页** - 分析动画
4. **结果页** - 详细报告，包括：
   - 性格类型展示
   - 维度分析图表
   - 优劣势卡片
   - 兼容性分析
   - 职业建议
   - 著名人物

**用户功能** ⭐:
5. **登录/注册页** - 用户认证
6. **个人中心** - 三个Tab:
   - 测试历史（分页列表）
   - 统计分析（类型分布、趋势图）
   - 设置（个人信息、密码修改）

**管理后台** ⭐:
7. **管理仪表盘** - 五个Tab:
   - 仪表盘总览（全局统计、类型分布、每日趋势）
   - 题库管理（60道题目CRUD、统计信息）
   - 用户管理（用户列表、状态管理）
   - 会话监控（实时会话状态、进度追踪）
   - 系统状态（健康状态、内存监控、连接状态）

### 设计特点

- 🌙 深色主题，护眼舒适
- ✨ 流畅动画，提升体验
- 📱 响应式设计，支持移动端
- 🎨 渐变色彩，现代美观

---

## 🔧 开发指南

### 项目结构

```
mbti/
├── backend/              # 后端代码
│   ├── cmd/             # 主程序入口
│   ├── internal/        # 私有应用代码
│   │   ├── config/     # 配置
│   │   ├── domain/     # 领域模型
│   │   ├── handler/    # HTTP处理器
│   │   ├── middleware/ # 中间件
│   │   ├── repository/ # 数据访问层
│   │   └── service/    # 业务逻辑层
│   ├── pkg/            # 公共库
│   └── scripts/        # 脚本文件
├── frontend/            # 前端代码
│   ├── src/
│   │   ├── api/       # API调用
│   │   ├── components/# 组件
│   │   ├── pages/     # 页面
│   │   ├── stores/    # 状态管理
│   │   └── styles/    # 样式
│   └── public/        # 静态资源
├── ui/                 # UI设计文件
│   └── index.html     # 原型UI
├── docs/               # 文档
│   ├── ARCHITECTURE.md # 架构设计
│   ├── API.md         # API文档
│   ├── DATABASE.md    # 数据库设计
│   └── TASKS.md       # 任务清单
├── deploy/             # 部署配置
│   ├── docker/
│   │   └── docker-compose.yml
│   └── nginx/
└── CLAUDE.md          # 开发指南
```

### 开发流程

1. **阅读文档** - 了解系统架构和设计方案
2. **选择技术栈** - 确认使用Go或Node.js
3. **环境搭建** - 配置开发环境
4. **数据库初始化** - 执行DATABASE.md中的脚本
5. **按任务开发** - 参考TASKS.md中的任务列表
6. **测试验证** - 完成功能后进行测试
7. **代码提交** - 提交代码并创建PR

---

## 📈 性能指标

| 指标 | 目标值 | 说明 |
|------|--------|------|
| **QPS** | 1000+ | 每秒请求数 |
| **响应时间** | < 200ms | P95响应时间 |
| **并发用户** | 5000+ | 同时在线用户 |
| **可用性** | 99.9% | 系统可用率 |

---

## 🔐 安全性

- ✅ HTTPS加密传输
- ✅ Token认证机制
- ✅ SQL注入防护
- ✅ XSS防护
- ✅ API限流
- ✅ 数据加密存储

---

## 📝 开发计划

| 阶段 | 时间 | 内容 |
|------|------|------|
| **Phase 1** | Week 1-2 | 基础架构搭建 |
| **Phase 2** | Week 3-4 | 核心功能开发 |
| **Phase 3** | Week 5 | 报告与统计 |
| **Phase 4** | Week 6-7 | 前端开发 |
| **Phase 5** | Week 8 | 管理后台 |
| **Phase 6** | Week 9-10 | 优化与测试 |
| **Phase 7** | Week 11 | 部署上线 |

详见：[docs/TASKS.md](docs/TASKS.md)

---

## 🤝 贡献指南

欢迎贡献代码！请遵循以下流程：

1. Fork本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建Pull Request

### 代码规范

- **Go**: 遵循 [Effective Go](https://golang.org/doc/effective_go) 规范
- **TypeScript**: 遵循 [Google TypeScript Style Guide](https://google.github.io/styleguide/tsguide.html)
- **数据库**: 遵循数据库命名规范

---

## 📄 许可证

本项目采用 MIT 许可证 - 详见 [LICENSE](LICENSE) 文件

---

## 📞 联系方式

- 项目地址：https://github.com/your-username/mbti
- 问题反馈：https://github.com/your-username/mbti/issues
- 邮箱：your-email@example.com

---

## 🙏 致谢

- MBTI理论基于 [Myers-Briggs Type Indicator](https://www.myersbriggs.org/)
- UI设计灵感来源于现代化设计趋势
- 感谢所有贡献者

---

**Made with ❤️ by MBTI Team**
