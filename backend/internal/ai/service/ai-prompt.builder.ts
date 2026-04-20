/**
 * AI Prompt Builder
 * Constructs professional prompts for MBTI analysis
 */

import { Injectable } from '@nestjs/common';
import { AnalysisType } from '../entities/ai-analysis.entity';
import { AnalysisInputData } from '../types/ai-config.types';

@Injectable()
export class AIPromptBuilder {
  /**
   * Build complete prompt for AI analysis
   */
  async buildPrompt(
    mbtiType: string,
    inputData: AnalysisInputData,
    analysisType: AnalysisType,
    userContext?: any
  ): Promise<{ systemRole: string; userPrompt: string }> {
    switch (analysisType) {
      case AnalysisType.COMPREHENSIVE:
        return this.buildComprehensivePrompt(mbtiType, inputData, userContext);
      case AnalysisType.CAREER:
        return this.buildCareerPrompt(mbtiType, inputData, userContext);
      case AnalysisType.RELATIONSHIP:
        return this.buildRelationshipPrompt(mbtiType, inputData, userContext);
      case AnalysisType.GROWTH:
        return this.buildGrowthPrompt(mbtiType, inputData, userContext);
      default:
        return this.buildComprehensivePrompt(mbtiType, inputData, userContext);
    }
  }

  /**
   * Build comprehensive analysis prompt
   */
  private buildComprehensivePrompt(
    mbtiType: string,
    inputData: AnalysisInputData,
    userContext?: any
  ): { systemRole: string; userPrompt: string } {
    const systemRole = `你是一位拥有15年经验的专业MBTI性格分析师和心理咨询师。你深谙迈尔斯-布里格斯类型指标（MBTI）理论，结合荣格分析心理学，能够为用户提供深度、准确、可操作的性格洞察。

你的分析风格：
- 科学严谨：基于心理学理论和MBTI框架
- 深度洞察：超越表面标签，揭示深层心理机制
- 正面导向：以成长思维看待挑战，强调发展潜力
- 实用导向：提供具体、可执行的建议
- 对话感：使用第二人称"你"，建立真诚连接

你必须严格遵守JSON格式输出要求，确保返回的内容可以被程序正确解析。`;

    const dimensionAnalysis = this.buildDimensionAnalysis(inputData);
    const userContextSection = this.buildUserContextSection(userContext);

    const userPrompt = `## 用户信息

${userContextSection}

## 测试结果分析

### MBTI类型：${mbtiType}

### 维度得分详细分析
${dimensionAnalysis}

### 答题特征
- 完成题目数量：${inputData.answerCount}/60
- 测试完成时间：${new Date(inputData.completedAt).toLocaleString('zh-CN')}

---

## 分析任务

请基于以上信息，为用户生成一份**深度、个性化、可操作**的MBTI性格分析报告。

---

## 输出格式要求

你必须严格按照以下JSON结构输出（不要使用markdown代码块，直接输出JSON）：

\`\`\`json
{
  "overview": {
    "title": "吸引人的4字标题（如：战略建筑师）",
    "summary": "3-5句话精准概括核心性格特征",
    "keyPoints": [
      "核心特质1（5-8个字）",
      "核心特质2（5-8个字）",
      "核心特质3（5-8个字）"
    ]
  },
  "strengths": {
    "items": [
      {
        "name": "优势名称（4字以内）",
        "description": "详细描述（2-3句话）",
        "examples": ["应用场景1", "应用场景2"]
      }
    ],
    "application": [
      "在工作中：如何发挥优势",
      "在学习中：如何利用优势",
      "在生活中：优势的具体体现"
    ]
  },
  "weaknesses": {
    "items": [
      {
        "name": "挑战名称（4字以内）",
        "description": "详细描述（2-3句话）"
      }
    ],
    "improvementStrategies": [
      "具体改进策略1（可执行）",
      "具体改进策略2（可执行）",
      "具体改进策略3（可执行）"
    ]
  },
  "career": {
    "bestMatches": [
      {
        "role": "职业名称",
        "reason": "推荐理由（2-3句话）",
        "score": 95
      }
    ],
    "developmentPaths": [
      "发展路径1：具体说明",
      "发展路径2：具体说明"
    ],
    "recommendations": [
      "职业选择建议1（具体）",
      "职业选择建议2（具体）",
      "工作环境建议（具体）"
    ]
  },
  "relationships": {
    "style": "关系风格描述（一句话）",
    "strengthsInRelationships": [
      "关系优势1",
      "关系优势2"
    ],
    "challenges": [
      "关系挑战1",
      "关系挑战2"
    ],
    "advice": [
      "具体建议1（可执行）",
      "具体建议2（可执行）"
    ]
  },
  "growth": {
    "shortTerm": [
      "本月目标1（具体可衡量）",
      "本月目标2（具体可衡量）"
    ],
    "longTerm": [
      "年度目标1（具体可衡量）",
      "年度目标2（具体可衡量）"
    ],
    "habits": [
      {
        "name": "习惯名称",
        "frequency": "每日/每周",
        "description": "具体做法（2-3句话）"
      }
    ]
  },
  "actionPlan": {
    "immediate": [
      {
        "priority": "高",
        "action": "具体行动（本周内可完成）",
        "timeline": "本周"
      }
    ],
    "ongoing": [
      {
        "priority": "中",
        "action": "持续行动（日常习惯）",
        "timeline": "持续"
      }
    ]
  }
}
\`\`\`

---

## 内容要求

### 1. 个性化
- 基于用户具体的维度得分分析
- 避免泛泛而谈的通用描述
- 考虑用户的答题特征和提供的上下文信息

### 2. 科学性
- 基于MBTI理论和心理学研究
- 准确解读各维度的含义
- 符合该类型的经典特征描述

### 3. 可操作性
- 每条建议都必须具体、可执行
- 避免空泛的"要努力"、"要坚持"
- 提供明确的行动步骤和时间框架

### 4. 正面导向
- 用成长思维看待挑战和弱点
- 强调发展潜力和改进方向
- 鼓励用户接纳自己并持续成长

### 5. 深度洞察
- 超越表面的类型标签
- 揭示深层心理机制和行为模式
- 提供新鲜、有价值的观点

---

## 约束条件

1. **格式严格**：必须返回正确的JSON格式，可以被程序解析
2. **内容完整**：每个数组至少包含3个有效项目
3. **避免重复**：不同部分的内容要有区分度
4. **字数控制**：总字数在1500-2500字之间
5. **语言风格**：专业但易懂，鼓励但不夸张
6. **原创性**：避免陈词滥调，提供新鲜观点

---

现在，请开始分析并输出JSON格式的结果：`;

    return { systemRole, userPrompt };
  }

  /**
   * Build career-focused analysis prompt
   */
  private buildCareerPrompt(
    mbtiType: string,
    inputData: AnalysisInputData,
    userContext?: any
  ): { systemRole: string; userPrompt: string } {
    const systemRole = `你是一位资深的职业规划师和MBTI认证分析师，专注于帮助人们找到与自己性格特质匹配的职业发展方向。`;

    const userPrompt = `请为MBTI类型为${mbtiType}的用户生成深度职业分析报告。

## 用户背景
${userContext ? JSON.stringify(userContext, null, 2) : '无额外背景信息'}

## 测试数据
- MBTI类型: ${mbtiType}
- 维度得分: ${JSON.stringify(inputData.dimensionScores)}

请从以下维度进行分析（JSON格式）：
1. 职业匹配度分析（10个最适合的职业及理由）
2. 工作环境偏好
3. 团队角色定位
4. 领导力风格
5. 职业发展路径
6. 技能提升建议
7. 职业转换建议（如适用）

输出格式：
\`\`\`json
{
  "careerOverview": {
    "title": "职业定位概述",
    "summary": "3句话概括"
  },
  "bestMatches": [
    { "role": "职业名", "reason": "推荐理由", "score": 95, "industry": "行业" }
  ],
  "workEnvironment": {
    "preferred": ["环境偏好1", "环境偏好2"],
    "avoid": ["应避免的环境1"]
  },
  "teamRole": "团队角色描述",
  "leadershipStyle": "领导风格分析",
  "developmentPaths": [
    { "path": "发展路径", "timeline": "3-5年", "requirements": ["要求1", "要求2"] }
  ],
  "skillRecommendations": [
    { "skill": "技能", "importance": "核心/辅助", "howToDevelop": "提升方法" }
  ]
}
\`\`\``;

    return { systemRole, userPrompt };
  }

  /**
   * Build relationship-focused analysis prompt
   */
  private buildRelationshipPrompt(
    mbtiType: string,
    inputData: AnalysisInputData,
    userContext?: any
  ): { systemRole: string; userPrompt: string } {
    const systemRole = `你是一位专业的心理咨询师和人际关系专家，擅长基于MBTI理论分析人们的沟通模式、关系需求和冲突解决方式。`;

    const userPrompt = `请为MBTI类型为${mbtiType}的用户生成深度人际关系分析报告。

## 测试数据
- MBTI类型: ${mbtiType}
- 维度得分: ${JSON.stringify(inputData.dimensionScores)}

请分析以下方面（JSON格式）：
1. 沟通风格和偏好
2. 关系中的优势和挑战
3. 与不同类型的相处之道
4. 冲突处理方式
5. 亲密关系建议
6. 社交能量管理
7. 建立深度关系的方法

输出格式：
\`\`\`json
{
  "communicationStyle": "沟通风格描述",
  "relationshipStrengths": ["优势1", "优势2"],
  "relationshipChallenges": ["挑战1", "挑战2"],
  "bestMatchTypes": [
    { "type": "匹配类型", "reason": "匹配原因", "synergy": "协作优势" }
  ],
  "potentialConflicts": [
    { "type": "可能冲突类型", "reason": "原因", "solution": "解决方案" }
  ],
  "intimacyAdvice": ["亲密关系建议1", "建议2"],
  "socialEnergy": "社交能量分析",
  "buildingDepth": ["建立深度关系的方法1", "方法2"]
}
\`\`\``;

    return { systemRole, userPrompt };
  }

  /**
   * Build growth planning analysis prompt
   */
  private buildGrowthPrompt(
    mbtiType: string,
    inputData: AnalysisInputData,
    userContext?: any
  ): { systemRole: string; userPrompt: string } {
    const systemRole = `你是一位专业的个人成长教练和MBTI分析师，专注于帮助人们基于自己的性格特质制定可持续的个人发展计划。`;

    const userPrompt = `请为MBTI类型为${mbtiType}的用户生成深度个人成长分析报告。

## 用户背景
${userContext ? JSON.stringify(userContext, null, 2) : '无额外背景信息'}

## 测试数据
- MBTI类型: ${mbtiType}
- 维度得分: ${JSON.stringify(inputData.dimensionScores)}

请从以下维度进行分析（JSON格式）：
1. 核心成长领域识别
2. 盲点和发展机会
3. 学习风格优化建议
4. 目标设定策略
5. 习惯养成计划
6. 克服 procrastination 的方法
7. 保持动力和可持续性

输出格式：
\`\`\`json
{
  "growthOverview": {
    "title": "成长定位概述",
    "summary": "3句话概括"
  },
  "growthAreas": [
    { "area": "成长领域", "priority": "高/中/低", "why": "为什么重要", "how": "如何发展" }
  ],
  "blindSpots": ["盲点1", "盲点2"],
  "learningStyle": {
    "preferred": "偏好学习方式",
    "avoid": "应避免的学习方式",
    "tips": ["优化建议1", "建议2"]
  },
  "goalSetting": {
    "approach": "适合的目标设定方法",
    "example": "具体示例"
  },
  "habits": [
    { "name": "习惯名", "frequency": "频率", "benefits": "预期收益", "howToStart": "开始方法" }
  ],
  "overcomingProcrastination": [
    "方法1（具体）", "方法2（具体）"
  ],
  "sustainability": [
    "保持动力建议1", "建议2"
  ]
}
\`\`\``;

    return { systemRole, userPrompt };
  }

  /**
   * Build dimension analysis section
   */
  private buildDimensionAnalysis(inputData: AnalysisInputData): string {
    const { dimensionScores, percentages } = inputData;
    const dimensionLabels: Record<string, string> = {
      EI: '外向 (E) vs 内向 (I)',
      SN: '实感 (S) vs 直觉 (N)',
      TF: '思考 (T) vs 情感 (F)',
      JP: '判断 (J) vs 感知 (P)',
    };

    let analysis = '';

    for (const [dim, scores] of Object.entries(dimensionScores)) {
      const label = dimensionLabels[dim];
      const score = scores as number;
      const percentage = percentages[dim];
      const isLeft = score >= 15; // Assuming max score is 30

      analysis += `**${label}**\n`;
      analysis += `- 得分: ${score}/30 (${percentage}%)\n`;
      analysis += `- 倾向: ${isLeft ? '左侧倾向' : '右侧倾向'}\n`;
      analysis += `- 含义: ${this.getDimensionMeaning(dim, score)}\n\n`;
    }

    return analysis;
  }

  /**
   * Get dimension meaning
   */
  private getDimensionMeaning(dimension: string, score: number): string {
    const meanings: Record<string, { high: string; low: string }> = {
      EI: {
        high: '外向型：从外部世界获得能量，喜欢与人互动',
        low: '内向型：从内心世界获得能量，喜欢独立思考'
      },
      SN: {
        high: '实感型：注重现实和具体细节',
        low: '直觉型：关注可能性和抽象概念'
      },
      TF: {
        high: '思考型：基于逻辑和客观分析做决策',
        low: '情感型：基于价值观和他人感受做决策'
      },
      JP: {
        high: '判断型：喜欢计划和结构化',
        low: '感知型：喜欢灵活和开放选择'
      }
    };

    const isHigh = score >= 15;
    return meanings[dimension][isHigh ? 'high' : 'low'];
  }

  /**
   * Build user context section
   */
  private buildUserContextSection(userContext?: any): string {
    if (!userContext) {
      return '**用户背景**: 未提供额外背景信息';
    }

    let context = '**用户背景信息**:\n';

    if (userContext.age) {
      context += `- 年龄: ${userContext.age}岁\n`;
    }
    if (userContext.occupation) {
      context += `- 职业: ${userContext.occupation}\n`;
    }
    if (userContext.education) {
      context += `- 教育背景: ${userContext.education}\n`;
    }
    if (userContext.goals && userContext.goals.length > 0) {
      context += `- 目标: ${userContext.goals.join('、')}\n`;
    }
    if (userContext.challenges && userContext.challenges.length > 0) {
      context += `- 当前挑战: ${userContext.challenges.join('、')}\n`;
    }

    return context;
  }

  /**
   * Extract JSON from AI response
   * AI sometimes wraps JSON in markdown code blocks
   */
  extractJSON(content: string): string {
    // Try to find JSON between ```json and ```
    const jsonRegex = /```json\s*([\s\S]*?)\s*```/;
    const match = content.match(jsonRegex);

    if (match && match[1]) {
      return match[1].trim();
    }

    // Try to find JSON between ``` and ```
    const codeRegex = /```\s*([\s\S]*?)\s*```/;
    const codeMatch = content.match(codeRegex);

    if (codeMatch && codeMatch[1]) {
      return codeMatch[1].trim();
    }

    // Return as is if no code blocks found
    return content.trim();
  }
}
