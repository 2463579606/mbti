# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MBTI Personality Test Application - A scientific, visually appealing personality assessment platform based on Myers-Briggs Type Indicator with 60 questions across 4 dimensions (EI, SN, TF, JP).

**Tech Stack Decision Required** - Choose Go or Node.js for backend. See `docs/ARCHITECTURE.md` for detailed comparison.

## Environment Definitions (IMPORTANT)

### 🖥️ 本地开发环境 (Local Development)
- **位置**: 你的Mac电脑
- **路径**: `/Users/jiangyz/Documents/jiangyz/myproject/mbti/`
- **IDE**: IntelliJ IDEA / WebStorm
- **数据库**: 本地PostgreSQL (localhost:5432)
- **Redis**: 本地Redis (localhost:6379)
- **后端**: localhost:8000
- **前端**: localhost:3000
- **用途**: 所有代码开发、测试、调试

### ☁️ 云服务器生产环境 (Production)
- **位置**: 阿里云服务器
- **IP**: 101.201.150.140
- **用途**: 生产环境部署
- **访问**: 通过SSH远程连接
- **部署**: 本地测试通过后才部署

### ⚠️ 关键区别
- **本地环境**: 你的Mac电脑，IDEA工程所在位置
- **生产环境**: 云服务器，远程部署目标
- **开发流程**: 本地开发 → 本地测试 → 验收通过 → Git提交 → 部署到云服务器

## Development Principles (MUST FOLLOW)

### ⚠️ CRITICAL: Local Development First

**ALWAYS develop and test on localhost first. NEVER deploy directly to production.**

**Current Working Directory**:
- Backend: `/Users/jiangyz/Documents/jiangyz/myproject/mbti/backend`
- Frontend: `/Users/jiangyz/Documents/jiangyz/myproject/mbti/frontend`
- This is your LOCAL Mac environment, NOT the cloud server

**ALWAYS develop and test on localhost first. NEVER deploy directly to production.**

**Development Workflow**:
1. **Local Development**: All code changes must be made and tested on localhost (127.0.0.1)
2. **Local Testing**: Complete full testing on local environment before any remote deployment
3. **验收标准**: Local testing must pass all acceptance criteria before proceeding
4. **Remote Deployment**: Only after local testing is complete and approved
5. **Version Control**: Commit changes to remote repository after local validation

**Environment Configuration**:
- **Local Development**: Use `localhost`, `127.0.0.1`, or local ports
- **Local Database**: Use local PostgreSQL instance
- **Local Redis**: Use local Redis instance
- **Testing**: Run all tests locally before deployment

**What NOT to do**:
- ❌ NEVER edit code directly on production server
- ❌ NEVER test on production environment
- ❌ NEVER deploy without local testing
- ❌ NEVER modify production database directly

**Consequences**:
- Violating this rule can cause production downtime
- Data loss or corruption
- Poor user experience
- Difficult to rollback changes

### 1. Troubleshooting Protocol

When encountering issues, follow this systematic approach:

```
Understand Context → Examine Code → Identify Logic → Diagnose Problem → Design Minimal Fix
```

**Step-by-step process**:
1. **Understand the full context** first
   - What is the expected behavior?
   - What is the actual behavior?
   - What changed recently?
   - Check error logs, stack traces, and error messages

2. **Examine related code**
   - Read the relevant source files
   - Understand the execution flow
   - Check data flow and dependencies
   - Review recent changes in the area

3. **Identify the root cause**
   - Is it a logic error?
   - Is it a configuration issue?
   - Is it an environment problem?
   - Is it a version mismatch?
   - Is it a missing dependency?

4. **Design minimal changes**
   - Fix only what's broken
   - Don't refactor unrelated code
   - Ensure existing functionality remains intact
   - Add tests to prevent regression

5. **Verify the fix**
   - Test the specific issue
   - Test related functionality
   - Run existing tests
   - Document the solution

**Critical**: Never make changes without understanding the full context and impact. Premature optimization or fixes often introduce new bugs.

### 2. Code Development Standards

When writing code, always think beyond the immediate task:

**Extensibility**:
- Design for future requirements
- Use abstraction and interfaces
- Avoid hard-coding values (use configuration)
- Make components loosely coupled
- Follow open/closed principle (open for extension, closed for modification)

**Maintainability**:
- Write self-documenting code (clear names, logical structure)
- Add comments for complex logic, not obvious things
- Keep functions focused and small (< 50 lines ideally)
- Follow DRY principle (Don't Repeat Yourself)
- Use consistent naming conventions

**Reusability**:
- Extract common patterns into utilities
- Create composable functions/components
- Design generic solutions that can be parameterized
- Build libraries, not one-off solutions

**Examples**:
```javascript
// ❌ Bad: Hard-coded, not reusable
function getUserData() {
    const url = 'https://api.example.com/users';
    return fetch(url).then(r => r.json());
}

// ✅ Good: Configurable, reusable, testable
function fetchFromAPI(endpoint, options = {}) {
    const baseUrl = config.api.baseUrl;
    const url = `${baseUrl}${endpoint}`;
    return fetch(url, options).then(r => r.json());
}

function getUserData() {
    return fetchFromAPI('/users');
}
```

**Before implementing**:
- Ask: "Will this need to change in the future?"
- Ask: "Can this be reused elsewhere?"
- Ask: "Is this easy to test?"
- Ask: "Will another developer understand this?"

### 3. Environment & Operational Issues

When facing runtime problems, configuration issues, or environment setup failures:

**Investigation Protocol**:
1. **Document everything** about the issue
   - Error messages (exact text)
   - Steps to reproduce
   - Environment details (OS, versions, config)
   - What you've already tried

2. **Systematic investigation** - don't skip steps
   - Check logs (application, system, database)
   - Verify configuration files
   - Check environment variables
   - Verify dependencies and versions
   - Test database connectivity
   - Check network/firewall settings
   - Verify file permissions

3. **Research and learn**
   - Search error messages online
   - Read documentation for related tools
   - Check GitHub issues for similar problems
   - Understand the underlying technology

4. **Document the solution**
   - Write down what was wrong
   - Document how you fixed it
   - Note what you learned
   - Update this file or project docs if helpful

5. **Apply and verify**
   - Implement the fix
   - Test thoroughly
   - Ensure it works in all environments
   - Add monitoring/alerts if appropriate

**Common issues to investigate thoroughly**:
- Missing environment variables → Don't guess, find the correct value
- Version conflicts → Check package.json/go.mod, verify compatibility
- Database connection failures → Check credentials, host, port, firewall
- Port already in use → Find what's using it, don't just change ports
- CORS errors → Understand why, configure properly
- Cache issues → Clear cache, understand cache strategy

**Growth mindset**: Every issue is an opportunity to learn. Take time to understand the root cause, not just patch the symptom.

### 4. Completion Criteria

A task is only "done" when:

1. **Code is complete**
   - All requirements implemented
   - Code follows project conventions
   - Code is reviewed (self or peer)
   - Comments added where needed

2. **Testing is complete**
   - Unit tests written and passing
   - Integration tests written and passing
   - Manual testing completed
   - Edge cases tested

3. **Documentation updated**
   - API docs updated (if applicable)
   - README updated if user-facing changes
   - Code comments added for complex logic
   - Changelog updated (if maintained)

4. **No known issues**
   - No console errors
   - No test failures
   - No obvious bugs
   - Performance acceptable

**Before marking a task complete**, ask:
- "Does this work as specified?"
- "Have I tested the happy path and error cases?"
- "Did I break anything else?"
- "Is this ready for production?"

## Essential Documentation

| Document | Purpose |
|----------|---------|
| `docs/ARCHITECTURE.md` | Complete system architecture, tech stack options, module design |
| `docs/API.md` | RESTful API specifications (14 endpoints) |
| `docs/DATABASE.md` | Database schema with DDL scripts, 16 MBTI types, 60 questions |
| `docs/TASKS.md` | Detailed task breakdown with 6-week development plan |
| `docs/PROJECT_STRUCTURE.md` | Directory structure and file organization |
| `README.md` | Quick start guide and project overview |

## UI Reference (ui/index.html)

The UI prototype contains complete implementation with:
- **4 pages**: Welcome, Test (60 questions), Loading (3-step animation), Result (detailed report)
- **Data structures**: `MBTI_TYPES` (16 types with full details), `QUESTIONS` (60 questions with scoring)
- **Scoring logic**: See `showResult()` function (lines 1933-2022)
- **All CSS styles**: Design tokens, animations, responsive design

**Important**: Frontend must match UI exactly. Use the HTML as the single source of truth for:
- Page layouts and component structure
- CSS variables (lines 11-45): colors, gradients, spacing, animations
- MBTI type data (lines 1517-1645)
- Question data (lines 1670-1738)

## Core Architecture

### Backend Layering (Go or Node.js)
```
Handler (Controller) → Service (Business Logic) → Repository (Data Access)
```

- **Handler**: HTTP request/response, validation, auth
- **Service**: Business rules, scoring algorithm, report generation
- **Repository**: Database operations, caching

### Key Business Logic

**Scoring Algorithm** (must match UI exactly):
```javascript
// Each dimension: 15 questions × 2 points max = 30 points
dimensionPercentage = (userScore / 30) * 100

// Determine 4-letter type (example for EI)
typeLetter = (EIPercentage >= 50) ? 'E' : 'I'
// Repeat for SN, TF, JP
```

**Critical**: The UI implements this at lines 1935-1940. Backend must produce identical results.

### Database Schema (7 tables)

**Core tables**:
- `users` - User accounts (supports anonymous users)
- `test_sessions` - Test sessions with progress tracking
- `test_answers` - Individual answer records
- `questions` - 60 questions (question_id 0-59)
- `mbti_types` - 16 MBTI type configurations
- `test_reports` - Generated reports with share tokens
- `daily_statistics` - Aggregated statistics

**Key relationships**:
- `test_sessions.user_id → users.id` (nullable for anonymous)
- `test_answers.session_id → test_sessions.id` (cascade delete)
- `test_reports.session_id → test_sessions.id` (unique)
- `test_reports.mbti_type → mbti_types.code`

**Initialization**: Run `docs/DATABASE.md` to create tables and seed 16 types + 60 questions.

## API Design Patterns

**Base URL**: `/api/v1`

**Authentication**:
- Anonymous users: `Authorization: Bearer {session_token}`
- Registered users: `Authorization: Bearer {jwt_token}`

**Response format**:
```json
{
    "success": true,
    "code": 200,
    "message": "success",
    "data": {},
    "timestamp": 1704067200000
}
```

**Rate limiting**:
- IP-based: 100 req/min
- User-based: 200 req/min
- Use Redis with token bucket algorithm

**Key endpoints**:
- `POST /test/session` - Create session (returns session_token)
- `GET /test/question/current` - Get current question
- `POST /test/answer` - Submit single answer
- `POST /test/answers/batch` - Batch submit (for resume)
- `POST /test/complete` - Complete test and generate report
- `GET /report/:id` - Get report details
- `GET /report/share/:token` - Public report sharing

## Development Commands

### Backend (Go - if chosen)
```bash
cd backend
go mod download
go run cmd/api/main.go          # Run API server
go test ./...                    # Run all tests
go test ./internal/service -v   # Run specific package tests
go build -o bin/api ./cmd/api   # Build binary
```

### Backend (Node.js - if chosen)
```bash
cd backend
npm install
npm run dev                     # Development server
npm run test                    # Run tests
npm run test:unit               # Unit tests only
npm run build                   # Build for production
```

### Frontend (Vue 3)
```bash
cd frontend
npm install
npm run dev                     # Dev server (localhost:3000)
npm run build                   # Production build
npm run preview                 # Preview production build
npm run lint                    # Lint code
```

### Frontend (React)
```bash
cd frontend
npm install
npm run dev                     # Dev server
npm run build                   # Production build
npm run test                    # Run tests
```

### Database
```bash
# Initialize database
psql -U postgres -d mbti_test -f docs/DATABASE.md

# Or use Docker
docker-compose up -d postgres redis

# Connect to PostgreSQL
docker exec -it mbti-postgres psql -U postgres mbti_test
```

### Docker
```bash
docker-compose up -d            # Start all services
docker-compose up -d postgres redis  # Start only DB services
docker-compose logs -f api      # Follow API logs
docker-compose down             # Stop all services
```

## Important Conventions

### Naming Conventions
- **Database**: snake_case (e.g., `test_sessions`, `user_id`)
- **Go**: PascalCase for exported, camelCase for private (e.g., `TestService`, `getUser`)
- **TypeScript/JavaScript**: camelCase (e.g., `testService`, `getUser`)
- **API endpoints**: kebab-case (e.g., `/test/session`)

### Error Handling
- Use defined error codes (see `docs/API.md` section "错误码")
- Always return consistent error response format
- Log errors with context (request ID, user ID, timestamp)

### Caching Strategy
- **Questions**: Cache in Redis (1 hour TTL)
- **MBTI types**: Cache in Redis (24 hour TTL)
- **Reports**: Cache in Redis (7 day TTL)
- **User sessions**: Cache in Redis (2 hour TTL)

### Session Management
- Anonymous users: Generate `anonymous_id` (UUID) and `session_token`
- Session tokens: Format `sess_{random}` (16 chars)
- Share tokens: Format `rpt_{random}` (16 chars)
- TTL: 2 hours for test sessions

## Scoring Implementation Notes

The UI scoring algorithm (lines 1933-1940) must be replicated exactly:

```javascript
// Calculate dimension scores from answers
const E = (dimScores.EI / dimMax.EI) >= 0.5;
const S = (dimScores.SN / dimMax.SN) >= 0.5;
const T = (dimScores.TF / dimMax.TF) >= 0.5;
const J = (dimScores.JP / dimMax.JP) >= 0.5;

const typeCode = (E?'E':'I') + (S?'S':'N') + (T?'T':'F') + (J?'J':'P');
```

**Backend must ensure**:
1. Same max score per dimension (30 points = 15 questions × 2)
2. Same threshold (50% for first letter)
3. Same 4-letter code generation

## Testing Strategy

### Unit Tests
- Test scoring algorithm with known inputs/outputs
- Test type determination logic
- Test percentage calculations
- Verify against UI results

### Integration Tests
- Test complete flow: create session → answer all 60 questions → complete → get report
- Test resume flow: create session → answer 30 questions → disconnect → reconnect → finish
- Test error cases: invalid session token, duplicate answers, incomplete submission

### Validation
- Compare backend-generated reports with UI-generated reports
- Use same test data (answers array) and verify identical results

## Performance Requirements

- **QPS**: 1000+ requests per second
- **Response time**: P95 < 200ms
- **Concurrent users**: 5000+ simultaneous users
- **Database**: Use connection pooling, read replicas for SELECT queries
- **Cache**: 80%+ cache hit rate for questions and MBTI types

## Security Considerations

- All endpoints require authentication (session token or JWT)
- SQL injection prevention: use parameterized queries (ORM handles this)
- XSS prevention: sanitize and validate all user inputs
- Rate limiting: enforce at API gateway level
- Share tokens: only expose non-sensitive data (no user IDs, timestamps)
- HTTPS only in production
