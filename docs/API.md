# MBTI 测试系统 - API 接口文档

## 基础信息

- **Base URL**: `https://api.example.com/api/v1`
- **协议**: HTTPS
- **数据格式**: JSON
- **字符编码**: UTF-8

## 认证方式

### 匿名用户（Session Token）
```
Authorization: Bearer {session_token}
```

### 注册用户（JWT Token）
```
Authorization: Bearer {jwt_token}
```

---

## 目录

1. [测试相关](#测试相关)
2. [报告相关](#报告相关)
3. [用户相关](#用户相关)
4. [管理后台](#管理后台)
5. [错误码](#错误码)

---

## 测试相关

### 1. 创建测试会话

创建一个新的测试会话。

**请求**
```http
POST /test/session
Content-Type: application/json
```

**请求体**
```json
{
    "user_id": 123,              // 可选，注册用户ID
    "anonymous_id": "uuid-xxx"   // 可选，匿名用户追踪ID
}
```

**响应**
```json
{
    "success": true,
    "code": 200,
    "message": "success",
    "data": {
        "session_id": 123456,
        "session_token": "sess_a1b2c3d4e5f6",
        "total_questions": 60,
        "expires_at": "2024-01-01T12:00:00Z"
    },
    "timestamp": 1704067200000
}
```

---

### 2. 获取题目列表（批量）

批量获取题目，支持分页。

**请求**
```http
GET /test/questions?start=0&count=10
Authorization: Bearer {session_token}
```

**Query参数**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| start | int | 否 | 起始题号，默认0 |
| count | int | 否 | 获取数量，默认10，最大60 |

**响应**
```json
{
    "success": true,
    "data": {
        "total": 60,
        "questions": [
            {
                "id": 0,
                "dimension": "EI",
                "dimension_label": "外向 / 内向",
                "dimension_order": 1,
                "question": "在一次大型聚会之后，你通常感觉如何？",
                "options": [
                    "精力充沛，意犹未尽",
                    "有些疲惫，需要独处恢复"
                ],
                "option_labels": ["A", "B"]
            },
            {
                "id": 1,
                "dimension": "EI",
                "dimension_label": "外向 / 内向",
                "dimension_order": 2,
                "question": "你更喜欢哪种工作环境？",
                "options": [
                    "开放式办公室，随时可以交流",
                    "独立空间，可以专注思考"
                ],
                "option_labels": ["A", "B"]
            }
        ]
    }
}
```

---

### 3. 获取当前题目

获取当前应该回答的题目。

**请求**
```http
GET /test/question/current
Authorization: Bearer {session_token}
```

**响应**
```json
{
    "success": true,
    "data": {
        "question_number": 15,
        "id": 14,
        "dimension": "SN",
        "dimension_label": "实感 / 直觉",
        "dimension_order": 14,
        "question": "在阅读文章时，你更感兴趣的是...",
        "options": [
            "具体的事实、数据和实例",
            "背后的理论和宏观含义"
        ],
        "option_labels": ["A", "B"],
        "progress": {
            "current": 15,
            "total": 60,
            "percentage": 25,
            "answered": 14
        }
    }
}
```

---

### 4. 提交答案

提交单题答案。

**请求**
```http
POST /test/answer
Authorization: Bearer {session_token}
Content-Type: application/json
```

**请求体**
```json
{
    "question_id": 0,    // 题目序号（0-59）
    "option": 0          // 选择的选项（0=A, 1=B）
}
```

**响应**
```json
{
    "success": true,
    "data": {
        "answered": true,
        "question_id": 0,
        "selected_option": 0,
        "score": 2,
        "next_question": 1,
        "is_complete": false,
        "progress": {
            "current": 1,
            "total": 60,
            "percentage": 2,
            "answered": 1
        }
    }
}
```

**错误响应**
```json
{
    "success": false,
    "code": 10005,
    "message": "该题目已回答",
    "timestamp": 1704067200000
}
```

---

### 5. 批量提交答案

批量提交多个答案，用于断点续测。

**请求**
```http
POST /test/answers/batch
Authorization: Bearer {session_token}
Content-Type: application/json
```

**请求体**
```json
{
    "answers": [
        {"question_id": 0, "option": 0},
        {"question_id": 1, "option": 1},
        {"question_id": 2, "option": 0}
    ]
}
```

**响应**
```json
{
    "success": true,
    "data": {
        "accepted": 3,
        "rejected": [],
        "current_question": 3,
        "progress": {
            "current": 3,
            "total": 60,
            "percentage": 5,
            "answered": 3
        }
    }
}
```

---

### 6. 获取测试进度

获取当前测试进度。

**请求**
```http
GET /test/progress
Authorization: Bearer {session_token}
```

**响应**
```json
{
    "success": true,
    "data": {
        "current_question": 15,
        "answered_count": 15,
        "total": 60,
        "percentage": 25,
        "dimension_progress": {
            "EI": {
                "dimension": "EI",
                "label": "外向 / 内向",
                "answered": 15,
                "total": 15,
                "is_complete": true
            },
            "SN": {
                "dimension": "SN",
                "label": "实感 / 直觉",
                "answered": 0,
                "total": 15,
                "is_complete": false
            },
            "TF": {
                "dimension": "TF",
                "label": "思考 / 情感",
                "answered": 0,
                "total": 15,
                "is_complete": false
            },
            "JP": {
                "dimension": "JP",
                "label": "判断 / 感知",
                "answered": 0,
                "total": 15,
                "is_complete": false
            }
        }
    }
}
```

---

### 7. 完成测试

完成测试，生成报告。

**请求**
```http
POST /test/complete
Authorization: Bearer {session_token}
```

**响应**
```json
{
    "success": true,
    "data": {
        "session_id": 123456,
        "report_id": 789,
        "mbti_type": "INFJ",
        "share_token": "rpt_xyz123",
        "report_url": "https://example.com/report/rpt_xyz123"
    }
}
```

**错误响应**（未完成所有题目）
```json
{
    "success": false,
    "code": 20001,
    "message": "测试未完成，请回答所有题目",
    "data": {
        "answered": 58,
        "total": 60,
        "missing": [23, 45]
    }
}
```

---

## 报告相关

### 8. 获取测试报告

获取详细的测试报告。

**请求**
```http
GET /report/789
Authorization: Bearer {session_token}
```

**响应**
```json
{
    "success": true,
    "data": {
        "report_id": 789,
        "session_id": 123456,
        "mbti_type": {
            "code": "INFJ",
            "name": "提倡者",
            "emoji": "🌿",
            "group": "外交家",
            "headline": "你是一位富有远见的理想主义者",
            "tagline": "深刻、洞察力强，总是在追求更深层的意义。"
        },
        "dimensions": [
            {
                "key": "EI",
                "left": "外向 (E)",
                "right": "内向 (I)",
                "percentage": 20,
                "left_percentage": 20,
                "right_percentage": 80,
                "description": "内向倾向 80%"
            },
            {
                "key": "SN",
                "left": "实感 (S)",
                "right": "直觉 (N)",
                "percentage": 30,
                "left_percentage": 30,
                "right_percentage": 70,
                "description": "直觉倾向 70%"
            },
            {
                "key": "TF",
                "left": "思考 (T)",
                "right": "情感 (F)",
                "percentage": 40,
                "left_percentage": 40,
                "right_percentage": 60,
                "description": "情感倾向 60%"
            },
            {
                "key": "JP",
                "left": "判断 (J)",
                "right": "感知 (P)",
                "percentage": 65,
                "left_percentage": 65,
                "right_percentage": 35,
                "description": "判断倾向 65%"
            }
        ],
        "strengths": [
            "富有创造力",
            "洞察力强",
            "有原则",
            "富有同情心",
            "利他主义"
        ],
        "weaknesses": [
            "过于理想化",
            "容易 burnout",
            "对批评敏感",
            "固执己见",
            "忽视现实"
        ],
        "compatibility": {
            "best": [
                {
                    "code": "ENFP",
                    "name": "竞选者",
                    "emoji": "🎨"
                },
                {
                    "code": "ENTP",
                    "name": "辩论家",
                    "emoji": "💡"
                }
            ],
            "challenging": [
                {
                    "code": "ISTP",
                    "name": "鉴赏家",
                    "emoji": "🔧"
                },
                {
                    "code": "ESTP",
                    "name": "企业家",
                    "emoji": "🚀"
                }
            ]
        },
        "careers": [
            "心理咨询师",
            "作家",
            "艺术家",
            "非营利组织",
            "教育工作者",
            "人力资源"
        ],
        "famous_people": [
            "柏拉图",
            "甘地",
            "马丁·路德·金",
            "卡尔·荣格",
            "纳尔逊·曼德拉"
        ],
        "test_info": {
            "started_at": "2024-01-01T10:00:00Z",
            "completed_at": "2024-01-01T10:15:32Z",
            "duration_seconds": 932,
            "duration_formatted": "15分32秒"
        },
        "share": {
            "token": "rpt_xyz123",
            "url": "https://example.com/share/rpt_xyz123"
        }
    }
}
```

---

### 9. 获取分享报告（公开）

无需认证，通过分享token访问。

**请求**
```http
GET /report/share/rpt_xyz123
```

**响应**
```json
{
    "success": true,
    "data": {
        "mbti_type": {
            "code": "INFJ",
            "name": "提倡者",
            "emoji": "🌿",
            "headline": "你是一位富有远见的理想主义者",
            "tagline": "深刻、洞察力强，总是在追求更深层的意义。"
        },
        "dimensions": [...],
        "strengths": [...],
        "weaknesses": [...],
        "compatibility": {...},
        "careers": [...],
        "famous_people": [...]
    }
}
```

**注意**：分享报告不包含敏感信息（用户ID、测试时间等）。

---

## 用户相关

### 10. 获取用户测试历史

**请求**
```http
GET /user/tests?page=1&limit=10
Authorization: Bearer {user_token}
```

**Query参数**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| page | int | 否 | 页码，默认1 |
| limit | int | 否 | 每页数量，默认10，最大50 |

**响应**
```json
{
    "success": true,
    "data": {
        "total": 25,
        "page": 1,
        "limit": 10,
        "tests": [
            {
                "session_id": 123456,
                "report_id": 789,
                "mbti_type": {
                    "code": "INFJ",
                    "name": "提倡者",
                    "emoji": "🌿"
                },
                "completed_at": "2024-01-01T10:15:32Z",
                "duration_seconds": 932,
                "share_url": "https://example.com/share/rpt_xyz123"
            },
            {
                "session_id": 123455,
                "report_id": 788,
                "mbti_type": {
                    "code": "INFP",
                    "name": "调停者",
                    "emoji": "🦋"
                },
                "completed_at": "2023-12-15T14:20:10Z",
                "duration_seconds": 1085,
                "share_url": "https://example.com/share/rpt_abc456"
            }
        ]
    }
}
```

---

### 11. 获取用户统计

**请求**
```http
GET /user/statistics
Authorization: Bearer {user_token}
```

**响应**
```json
{
    "success": true,
    "data": {
        "total_tests": 25,
        "most_common_type": {
            "code": "INFJ",
            "name": "提倡者",
            "count": 10
        },
        "type_distribution": [
            {"code": "INFJ", "name": "提倡者", "count": 10},
            {"code": "INFP", "name": "调停者", "count": 8},
            {"code": "INTJ", "name": "建筑师", "count": 7}
        ],
        "avg_duration": 850,
        "last_test_at": "2024-01-01T10:15:32Z"
    }
}
```

---

## 管理后台

### 12. 获取全局统计

**请求**
```http
GET /admin/statistics?date=2024-01-01&range=7d
Authorization: Bearer {admin_token}
```

**Query参数**
| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| date | date | 否 | 统计日期 |
| range | string | 否 | 时间范围：1d/7d/30d/all |

**响应**
```json
{
    "success": true,
    "data": {
        "summary": {
            "total_tests": 15000,
            "unique_users": 12000,
            "completion_rate": 0.85,
            "avg_duration": 850
        },
        "type_distribution": [
            {"code": "INFJ", "count": 938, "percentage": 6.25},
            {"code": "INFP", "count": 825, "percentage": 5.5},
            {"code": "INTJ", "count": 750, "percentage": 5.0}
        ],
        "daily_stats": [
            {
                "date": "2024-01-01",
                "tests": 2500,
                "completions": 2125,
                "unique_users": 2000
            },
            {
                "date": "2024-01-02",
                "tests": 2200,
                "completions": 1870,
                "unique_users": 1800
            }
        ],
        "dimension_stats": {
            "E": 45,
            "I": 55,
            "S": 52,
            "N": 48,
            "T": 49,
            "F": 51,
            "J": 53,
            "P": 47
        }
    }
}
```

---

### 13. 获取题目列表（管理）

**请求**
```http
GET /admin/questions?dimension=EI&page=1&limit=20
Authorization: Bearer {admin_token}
```

**响应**
```json
{
    "success": true,
    "data": {
        "total": 60,
        "questions": [
            {
                "id": 1,
                "question_id": 0,
                "dimension": "EI",
                "dimension_order": 1,
                "question_text": "在一次大型聚会之后，你通常感觉如何？",
                "option_a": "精力充沛，意犹未尽",
                "option_b": "有些疲惫，需要独处恢复",
                "score_a": 2,
                "score_b": 0,
                "is_active": true,
                "version": 1
            }
        ]
    }
}
```

---

### 14. 更新题目

**请求**
```http
PUT /admin/questions/0
Authorization: Bearer {admin_token}
Content-Type: application/json
```

**请求体**
```json
{
    "question_text": "在一次大型聚会之后，你通常感觉如何？（已更新）",
    "option_a": "精力充沛，意犹未尽",
    "option_b": "有些疲惫，需要独处恢复",
    "is_active": true
}
```

**响应**
```json
{
    "success": true,
    "data": {
        "id": 1,
        "question_id": 0,
        "version": 2
    }
}
```

---

## 错误码

### HTTP状态码

| 状态码 | 说明 |
|--------|------|
| 200 | 请求成功 |
| 201 | 创建成功 |
| 400 | 请求参数错误 |
| 401 | 未认证 |
| 403 | 无权限 |
| 404 | 资源不存在 |
| 429 | 请求过于频繁 |
| 500 | 服务器内部错误 |

### 业务错误码

| 错误码 | 说明 |
|--------|------|
| 10001 | 参数错误 |
| 10002 | 会话不存在 |
| 10003 | 会话已过期 |
| 10004 | 题目不存在 |
| 10005 | 重复提交答案 |
| 10006 | 测试已完成 |
| 10007 | 测试未完成 |
| 20001 | 未达到完成题数 |
| 20002 | 报告不存在 |
| 30001 | 用户不存在 |
| 30002 | 无权限访问 |
| 50001 | 系统错误 |

### 错误响应示例

```json
{
    "success": false,
    "code": 10002,
    "message": "会话不存在或已过期",
    "data": {
        "session_token": "sess_invalid"
    },
    "timestamp": 1704067200000
}
```

---

## 限流规则

### 匿名用户
- 每IP: 100 requests/minute
- 创建会话: 10 requests/hour

### 注册用户
- 每用户: 200 requests/minute
- 提交答案: 60 requests/minute

### 超出限制响应
```http
HTTP/1.1 429 Too Many Requests
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 0
X-RateLimit-Reset: 1704067260

{
    "success": false,
    "code": 429,
    "message": "请求过于频繁，请稍后再试",
    "data": {
        "retry_after": 60
    }
}
```

---

## 数据模型

### Question
```typescript
{
    id: number              // 数据库ID
    question_id: number     // 题目序号（0-59）
    dimension: "EI" | "SN" | "TF" | "JP"
    dimension_label: string // 维度显示名称
    dimension_order: number // 维度内排序（1-15）
    question: string        // 题目文本
    options: string[]       // 选项数组（2个）
    option_labels: string[] // 选项标签 ["A", "B"]
}
```

### TestSession
```typescript
{
    session_id: number
    session_token: string
    status: "in_progress" | "completed" | "abandoned"
    current_question: number
    answered_count: number
    total_questions: 60
    started_at: string      // ISO 8601
    expires_at: string      // ISO 8601
}
```

### MBTIType
```typescript
{
    code: string            // 4字母代码
    name: string            // 中文名称
    emoji: string           // 表情符号
    group: string           // 分组
    headline: string        // 一句话描述
    tagline: string         // 详细描述
}
```

### DimensionScore
```typescript
{
    key: string             // "EI" | "SN" | "TF" | "JP"
    left: string            // "外向 (E)"
    right: string           // "内向 (I)"
    percentage: number      // 0-100
    left_percentage: number // 0-100
    right_percentage: number // 0-100
    description: string
}
```

### TestReport
```typescript
{
    report_id: number
    session_id: number
    mbti_type: MBTIType
    dimensions: DimensionScore[]
    strengths: string[]
    weaknesses: string[]
    compatibility: {
        best: MBTIType[]
        challenging: MBTIType[]
    }
    careers: string[]
    famous_people: string[]
    test_info: {
        started_at: string
        completed_at: string
        duration_seconds: number
        duration_formatted: string
    }
    share: {
        token: string
        url: string
    }
}
```
