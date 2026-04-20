/**
 * Seed Database Script (Fixed)
 * Populates the database with MBTI types and questions
 */

const { Client } = require('pg');

const client = new Client({
  host: 'localhost',
  port: 5432,
  user: 'jiangyz',
  password: '',
  database: 'mbti_test',
});

// 16 MBTI Types (simplified for testing)
const mbtiTypes = [
  { code: 'INTJ', name: '建筑师', emoji: '🧠', groupName: '分析家', headline: '富有想象力和战略性的思考者', tagline: '一切皆在计划之中', strengths: ['战略思维', '高度专注', '独立自主'], weaknesses: ['过度分析', '社交困难', '固执'], bestMatch: ['ENFP'], challengingMatch: ['ESFP'], careers: ['软件架构师', '科学家', '战略顾问'], famousPeople: ['埃隆·马斯克', '艾萨克·牛顿'] },
  { code: 'INTP', name: '逻辑学家', emoji: '🔬', groupName: '分析家', headline: '具有创新性的发明家', tagline: '对知识有着止不住的渴望', strengths: ['理论思维', '创新', '适应力强'], weaknesses: ['拖延', '心不在焉', '过于挑剔'], bestMatch: ['ENTJ'], challengingMatch: ['ESFJ'], careers: ['研究员', '程序员', '哲学家'], famousPeople: ['阿尔伯特·爱因斯坦', '查尔斯·达尔文'] },
  { code: 'ENTJ', name: '指挥官', emoji: '👑', groupName: '分析家', headline: '大胆、富有想象力且意志强大的领导者', tagline: '天生的领导者', strengths: ['天生的领导者', '战略规划', '高效执行'], weaknesses: ['过于强势', '不耐烦', '忽视他人感受'], bestMatch: ['INFP'], challengingMatch: ['ISFP'], careers: ['CEO', '管理顾问', '律师'], famousPeople: ['史蒂夫·乔布斯', '拿破仑'] },
  { code: 'ENTP', name: '辩论家', emoji: '💡', groupName: '分析家', headline: '聪明好奇的思考者', tagline: '无法抗拒智力上的挑战', strengths: ['知识渊博', '思维敏捷', '善于辩论'], weaknesses: ['注意力分散', '争议性强', '难以专注'], bestMatch: ['INFJ'], challengingMatch: ['ISFJ'], careers: ['创业者', '咨询顾问', '记者'], famousPeople: ['马克·吐温', '本杰明·富兰克林'] },
  { code: 'INFJ', name: '提倡者', emoji: '🔮', groupName: '外交家', headline: '安静而神秘', tagline: '鼓舞人心且不知疲倦的理想主义者', strengths: ['洞察力强', '富有同情心', '坚持不懈'], weaknesses: ['过度敏感', '完美主义', '容易倦怠'], bestMatch: ['ENTP'], challengingMatch: ['ESTP'], careers: ['心理咨询师', '作家', '非营利组织'], famousPeople: ['甘地', '马丁·路德·金'] },
  { code: 'INFP', name: '调停者', emoji: '🌸', groupName: '外交家', headline: '诗意，善良的利他主义者', tagline: '总是热情地为正义事业提供帮助', strengths: ['富有创造力', '同理心强', '价值观坚定'], weaknesses: ['过于理想化', '难以处理实际事务', '自我批评'], bestMatch: ['ENFJ'], challengingMatch: ['ESTJ'], careers: ['艺术家', '作家', '社会工作者'], famousPeople: ['莎士比亚', 'J.R.R.托尔金'] },
  { code: 'ENFJ', name: '主人公', emoji: '🌟', groupName: '外交家', headline: '有魅力鼓舞人心的领袖', tagline: '有着令听众着迷的能力', strengths: ['天生的领导者', '富有魅力', '善于激励'], weaknesses: ['过度理想化', '过于无私', '难以接受批评'], bestMatch: ['INFP'], challengingMatch: ['ISTP'], careers: ['教师', '人力资源', '政治家'], famousPeople: ['奥普拉·温弗瑞', '巴拉克·奥巴马'] },
  { code: 'ENFP', name: '竞选者', emoji: '🎭', groupName: '外交家', headline: '充满热情，有创造力爱社交的自由人', tagline: '总能找到理由微笑', strengths: ['充满热情', '创造力强', '社交能力强'], weaknesses: ['注意力分散', '缺乏实用技能', '过度思考'], bestMatch: ['INFJ'], challengingMatch: ['ISTJ'], careers: ['记者', '活动家', '公关'], famousPeople: ['罗宾·威廉姆斯', '威尔·史密斯'] },
  { code: 'ISTJ', name: '物流师', emoji: '📋', groupName: '守护者', headline: '实际且注重事实的个人', tagline: '可靠性不容怀疑', strengths: ['高度可靠', '注重细节', '组织能力强'], weaknesses: ['过于保守', '抗拒变化', '缺乏灵活性'], bestMatch: ['ESFP'], challengingMatch: ['ENFP'], careers: ['会计师', '律师', '医生'], famousPeople: ['华盛顿', '沃伦·巴菲特'] },
  { code: 'ISFJ', name: '守卫者', emoji: '🛡️', groupName: '守护者', headline: '非常专注而温暖的守护者', tagline: '时刻准备保护爱着的人们', strengths: ['支持性强', '注重细节', '忠诚可靠'], weaknesses: ['过度谦逊', '难以接受赞扬', '回避冲突'], bestMatch: ['ESTP'], challengingMatch: ['ENTP'], careers: ['护士', '教师', '行政人员'], famousPeople: ['特蕾莎修女', '金·卡戴珊'] },
  { code: 'ESTJ', name: '总经理', emoji: '🎯', groupName: '守护者', headline: '出色的管理者', tagline: '在管理事情或人的时候无与伦比', strengths: ['优秀的组织者', '务实', '高效'], weaknesses: ['固执', '难以容忍不同观点', '过于传统'], bestMatch: ['ISFP'], challengingMatch: ['INFP'], careers: ['高管', '军官', '项目经理'], famousPeople: ['唐纳德·特朗普', '希拉里·克林顿'] },
  { code: 'ESFJ', name: '执政官', emoji: '❤️', groupName: '守护者', headline: '极有同情心，爱社交受欢迎的人', tagline: '总是热心提供帮助', strengths: ['社交能力强', '乐于助人', '团队合作'], weaknesses: ['过度在意他人看法', '难以创新', '容易受伤'], bestMatch: ['ISFP'], challengingMatch: ['INTP'], careers: ['教师', '销售', '公关'], famousPeople: ['泰勒·斯威夫特', '比尔·克林顿'] },
  { code: 'ISTP', name: '鉴赏家', emoji: '🔧', groupName: '探险家', headline: '大胆而实际的实验家', tagline: '擅长使用各种工具', strengths: ['适应力强', '冷静', '动手能力强'], weaknesses: ['过于独立', '难以承诺', '容易冒险'], bestMatch: ['ESFJ'], challengingMatch: ['ENFJ'], careers: ['工程师', '机械师', '飞行员'], famousPeople: ['汤姆·克鲁斯', '布鲁斯·李'] },
  { code: 'ISFP', name: '探险家', emoji: '🎨', groupName: '探险家', headline: '灵活有魅力的艺术家', tagline: '时刻准备探索和体验新事物', strengths: ['富有创造力', '适应力强', '价值观坚定'], weaknesses: ['过于敏感', '缺乏长期规划', '难以预测'], bestMatch: ['ESTJ'], challengingMatch: ['ENTJ'], careers: ['设计师', '艺术家', '摄影师'], famousPeople: ['鲍勃·迪伦', '迈克尔·杰克逊'] },
  { code: 'ESTP', name: '企业家', emoji: '🚀', groupName: '探险家', headline: '聪明精力充沛的感知者', tagline: '真心享受生活在边缘', strengths: ['适应力强', '充满活力', '善于解决问题'], weaknesses: ['缺乏耐心', '容易冲动', '难以规划'], bestMatch: ['ISFJ'], challengingMatch: ['INFJ'], careers: ['销售', '企业家', '运动员'], famousPeople: ['唐纳德·特朗普', '埃迪·墨菲'] },
  { code: 'ESFP', name: '表演者', emoji: '🎤', groupName: '探险家', headline: '自发的，精力充沛而热情的表演者', tagline: '生活在他们周围永远不会无聊', strengths: ['充满活力', '善于表演', '乐观开朗'], weaknesses: ['缺乏专注', '难以规划', '容易厌倦'], bestMatch: ['ISFJ'], challengingMatch: ['INTJ'], careers: ['演员', '销售', '活动策划'], famousPeople: ['玛丽莲·梦露', '猫王'] },
];

// 60 Questions (same as before)
const questions = [
  // E/I Dimension (1-15)
  { questionId: 0, dimension: 'EI', dimensionOrder: 1, questionText: '在社交场合中，你通常...', optionA: '主动与他人交流', optionB: '等待他人来和你交谈', scoreA: 2, scoreB: 0, isActive: true },
  { questionId: 1, dimension: 'EI', dimensionOrder: 2, questionText: '在周末，你更倾向于...', optionA: '和朋友一起活动', optionB: '独自在家休息', scoreA: 2, scoreB: 0, isActive: true },
  { questionId: 2, dimension: 'EI', dimensionOrder: 3, questionText: '在工作中，你更喜欢...', optionA: '团队合作讨论', optionB: '独立完成任务', scoreA: 2, scoreB: 0, isActive: true },
  { questionId: 3, dimension: 'EI', dimensionOrder: 4, questionText: '遇到问题时，你通常会...', optionA: '找人商量', optionB: '自己思考解决', scoreA: 2, scoreB: 0, isActive: true },
  { questionId: 4, dimension: 'EI', dimensionOrder: 5, questionText: '在聚会中，你通常...', optionA: '认识很多新朋友', optionB: '只和熟悉的人交谈', scoreA: 2, scoreB: 0, isActive: true },
  { questionId: 5, dimension: 'EI', dimensionOrder: 6, questionText: '你更喜欢的沟通方式是...', optionA: '面对面交流', optionB: '通过文字信息', scoreA: 2, scoreB: 0, isActive: true },
  { questionId: 6, dimension: 'EI', dimensionOrder: 7, questionText: '在公共场合，你通常感到...', optionA: '自在和兴奋', optionB: '有些拘谨', scoreA: 2, scoreB: 0, isActive: true },
  { questionId: 7, dimension: 'EI', dimensionOrder: 8, questionText: '你更倾向于...', optionA: '成为关注的焦点', optionB: '在人群中保持低调', scoreA: 2, scoreB: 0, isActive: true },
  { questionId: 8, dimension: 'EI', dimensionOrder: 9, questionText: '在学习新知识时，你更喜欢...', optionA: '和他人一起学习讨论', optionB: '独自研究和学习', scoreA: 2, scoreB: 0, isActive: true },
  { questionId: 9, dimension: 'EI', dimensionOrder: 10, questionText: '你的朋友圈...', optionA: '很广，有很多朋友', optionB: '较小，但都是深交', scoreA: 2, scoreB: 0, isActive: true },
  { questionId: 10, dimension: 'EI', dimensionOrder: 11, questionText: '在团队中，你通常...', optionA: '积极发言和参与', optionB: '多听少说', scoreA: 2, scoreB: 0, isActive: true },
  { questionId: 11, dimension: 'EI', dimensionOrder: 12, questionText: '你更喜欢的休息方式是...', optionA: '和朋友聚会', optionB: '独自阅读或看电影', scoreA: 2, scoreB: 0, isActive: true },
  { questionId: 12, dimension: 'EI', dimensionOrder: 13, questionText: '在陌生环境中，你通常会...', optionA: '主动与人攀谈', optionB: '观察环境再行动', scoreA: 2, scoreB: 0, isActive: true },
  { questionId: 13, dimension: 'EI', dimensionOrder: 14, questionText: '你认为自己是...', optionA: '外向开朗的人', optionB: '内向深沉的人', scoreA: 2, scoreB: 0, isActive: true },
  { questionId: 14, dimension: 'EI', dimensionOrder: 15, questionText: '在社交网络中，你...', optionA: '经常分享和互动', optionB: '很少主动发言', scoreA: 2, scoreB: 0, isActive: true },

  // S/N Dimension (16-30)
  { questionId: 15, dimension: 'SN', dimensionOrder: 1, questionText: '在解决问题时，你更依赖...', optionA: '过往经验和事实', optionB: '直觉和可能性', scoreA: 2, scoreB: 0, isActive: true },
  { questionId: 16, dimension: 'SN', dimensionOrder: 2, questionText: '你更关注...', optionA: '现实和细节', optionB: '概念和意义', scoreA: 2, scoreB: 0, isActive: true },
  { questionId: 17, dimension: 'SN', dimensionOrder: 3, questionText: '在学习时，你更喜欢...', optionA: '具体的步骤和方法', optionB: '整体的理解和框架', scoreA: 2, scoreB: 0, isActive: true },
  { questionId: 18, dimension: 'SN', dimensionOrder: 4, questionText: '你更擅长...', optionA: '处理实际问题', optionB: '探索抽象概念', scoreA: 2, scoreB: 0, isActive: true },
  { questionId: 19, dimension: 'SN', dimensionOrder: 5, questionText: '在阅读时，你更注意...', optionA: '具体的细节和事实', optionB: '深层含义和象征', scoreA: 2, scoreB: 0, isActive: true },
  { questionId: 20, dimension: 'SN', dimensionOrder: 6, questionText: '你认为更重要的是...', optionA: '实践和经验', optionB: '理论和创新', scoreA: 2, scoreB: 0, isActive: true },
  { questionId: 21, dimension: 'SN', dimensionOrder: 7, questionText: '你更倾向于...', optionA: '相信已知的事实', optionB: '探索未知的可能', scoreA: 2, scoreB: 0, isActive: true },
  { questionId: 22, dimension: 'SN', dimensionOrder: 8, questionText: '在工作中，你更注重...', optionA: '准确性和细节', optionB: '创新性和愿景', scoreA: 2, scoreB: 0, isActive: true },
  { questionId: 23, dimension: 'SN', dimensionOrder: 9, questionText: '你更喜欢...', optionA: '具体明确的信息', optionB: '抽象模糊的构思', scoreA: 2, scoreB: 0, isActive: true },
  { questionId: 24, dimension: 'SN', dimensionOrder: 10, questionText: '在做决定时，你更看重...', optionA: '实际的数据和证据', optionB: '直觉和预感', scoreA: 2, scoreB: 0, isActive: true },
  { questionId: 25, dimension: 'SN', dimensionOrder: 11, questionText: '你认为自己是...', optionA: '务实的人', optionB: '有想象力的人', scoreA: 2, scoreB: 0, isActive: true },
  { questionId: 26, dimension: 'SN', dimensionOrder: 12, questionText: '你更信任...', optionA: '确切的经历', optionB: '灵感和直觉', scoreA: 2, scoreB: 0, isActive: true },
  { questionId: 27, dimension: 'SN', dimensionOrder: 13, questionText: '在艺术欣赏中，你更注重...', optionA: '技法和细节', optionB: '意境和情感', scoreA: 2, scoreB: 0, isActive: true },
  { questionId: 28, dimension: 'SN', dimensionOrder: 14, questionText: '你更喜欢...', optionA: '传统的方法', optionB: '新颖的思路', scoreA: 2, scoreB: 0, isActive: true },
  { questionId: 29, dimension: 'SN', dimensionOrder: 15, questionText: '在生活中，你更注重...', optionA: '当下的现实', optionB: '未来的可能性', scoreA: 2, scoreB: 0, isActive: true },

  // T/F Dimension (31-45)
  { questionId: 30, dimension: 'TF', dimensionOrder: 1, questionText: '在做决定时，你更依赖...', optionA: '逻辑分析', optionB: '个人价值观', scoreA: 2, scoreB: 0, isActive: true },
  { questionId: 31, dimension: 'TF', dimensionOrder: 2, questionText: '你认为更重要...', optionA: '真理和正义', optionB: '和谐和同情', scoreA: 2, scoreB: 0, isActive: true },
  { questionId: 32, dimension: 'TF', dimensionOrder: 3, questionText: '在冲突中，你更倾向于...', optionA: '分析对错', optionB: '考虑各方感受', scoreA: 2, scoreB: 0, isActive: true },
  { questionId: 33, dimension: 'TF', dimensionOrder: 4, questionText: '你更看重...', optionA: '原则和规则', optionB: '人情和关系', scoreA: 2, scoreB: 0, isActive: true },
  { questionId: 34, dimension: 'TF', dimensionOrder: 5, questionText: '在评价他人时，你更注重...', optionA: '能力和成就', optionB: '品格和动机', scoreA: 2, scoreB: 0, isActive: true },
  { questionId: 35, dimension: 'TF', dimensionOrder: 6, questionText: '你认为更好的沟通方式是...', optionA: '直接坦诚', optionB: '委婉体贴', scoreA: 2, scoreB: 0, isActive: true },
  { questionId: 36, dimension: 'TF', dimensionOrder: 7, questionText: '在帮助他人时，你更愿意...', optionA: '提供解决方案', optionB: '给予情感支持', scoreA: 2, scoreB: 0, isActive: true },
  { questionId: 37, dimension: 'TF', dimensionOrder: 8, questionText: '你认为自己是...', optionA: '理性的人', optionB: '感性的人', scoreA: 2, scoreB: 0, isActive: true },
  { questionId: 38, dimension: 'TF', dimensionOrder: 9, questionText: '在面对批评时，你更...', optionA: '分析其合理性', optionB: '关注其情感影响', scoreA: 2, scoreB: 0, isActive: true },
  { questionId: 39, dimension: 'TF', dimensionOrder: 10, questionText: '你认为成功的标准是...', optionA: '能力和成就', optionB: '幸福和和谐', scoreA: 2, scoreB: 0, isActive: true },
  { questionId: 40, dimension: 'TF', dimensionOrder: 11, questionText: '在团队中，你更注重...', optionA: '效率和目标', optionB: '团队氛围', scoreA: 2, scoreB: 0, isActive: true },
  { questionId: 41, dimension: 'TF', dimensionOrder: 12, questionText: '你更倾向于...', optionA: '客观公正', optionB: '主观共情', scoreA: 2, scoreB: 0, isActive: true },
  { questionId: 42, dimension: 'TF', dimensionOrder: 13, questionText: '在决策时，你更看重...', optionA: '利弊分析', optionB: '对他人的影响', scoreA: 2, scoreB: 0, isActive: true },
  { questionId: 43, dimension: 'TF', dimensionOrder: 14, questionText: '你认为更好的领导风格是...', optionA: '果断和公正', optionB: '关怀和包容', scoreA: 2, scoreB: 0, isActive: true },
  { questionId: 44, dimension: 'TF', dimensionOrder: 15, questionText: '在生活中，你更追求...', optionA: '真理和理解', optionB: '善良和和谐', scoreA: 2, scoreB: 0, isActive: true },

  // J/P Dimension (46-60)
  { questionId: 45, dimension: 'JP', dimensionOrder: 1, questionText: '在日常生活中，你更喜欢...', optionA: '有计划的安排', optionB: '灵活随性', scoreA: 2, scoreB: 0, isActive: true },
  { questionId: 46, dimension: 'JP', dimensionOrder: 2, questionText: '面对deadline，你通常会...', optionA: '提前完成', optionB: '最后一刻冲刺', scoreA: 2, scoreB: 0, isActive: true },
  { questionId: 47, dimension: 'JP', dimensionOrder: 3, questionText: '你更喜欢的工作方式是...', optionA: '按计划执行', optionB: '随机应变', scoreA: 2, scoreB: 0, isActive: true },
  { questionId: 48, dimension: 'JP', dimensionOrder: 4, questionText: '在旅行时，你倾向于...', optionA: '详细规划行程', optionB: '随性探索', scoreA: 2, scoreB: 0, isActive: true },
  { questionId: 49, dimension: 'JP', dimensionOrder: 5, questionText: '你认为自己是...', optionA: '有条理的人', optionB: '随性的人', scoreA: 2, scoreB: 0, isActive: true },
  { questionId: 50, dimension: 'JP', dimensionOrder: 6, questionText: '面对变化，你通常...', optionA: '希望提前知道', optionB: '乐于接受惊喜', scoreA: 2, scoreB: 0, isActive: true },
  { questionId: 51, dimension: 'JP', dimensionOrder: 7, questionText: '在完成任务时，你...', optionA: '按部就班', optionB: '跳跃式进行', scoreA: 2, scoreB: 0, isActive: true },
  { questionId: 52, dimension: 'JP', dimensionOrder: 8, questionText: '你的工作环境通常是...', optionA: '井井有条', optionB: '有些凌乱', scoreA: 2, scoreB: 0, isActive: true },
  { questionId: 53, dimension: 'JP', dimensionOrder: 9, questionText: '在周末，你更倾向于...', optionA: '提前安排好活动', optionB: '看心情决定', scoreA: 2, scoreB: 0, isActive: true },
  { questionId: 54, dimension: 'JP', dimensionOrder: 10, questionText: '面对多种选择，你通常...', optionA: '快速决定', optionB: '反复权衡', scoreA: 2, scoreB: 0, isActive: true },
  { questionId: 55, dimension: 'JP', dimensionOrder: 11, questionText: '你认为更重要的是...', optionA: '完成目标', optionB: '享受过程', scoreA: 2, scoreB: 0, isActive: true },
  { questionId: 56, dimension: 'JP', dimensionOrder: 12, questionText: '在处理信息时，你更倾向于...', optionA: '按顺序整理', optionB: '整体把握', scoreA: 2, scoreB: 0, isActive: true },
  { questionId: 57, dimension: 'JP', dimensionOrder: 13, questionText: '你的决策风格是...', optionA: '果断迅速', optionB: '灵活开放', scoreA: 2, scoreB: 0, isActive: true },
  { questionId: 58, dimension: 'JP', dimensionOrder: 14, questionText: '面对未完成的事务，你会感到...', optionA: '不安，尽快完成', optionB: '无所谓，慢慢来', scoreA: 2, scoreB: 0, isActive: true },
  { questionId: 59, dimension: 'JP', dimensionOrder: 15, questionText: '你更喜欢的生活态度是...', optionA: '有计划和秩序', optionB: '自由和灵活', scoreA: 2, scoreB: 0, isActive: true },
];

async function seedDatabase() {
  try {
    await client.connect();
    console.log('✅ Connected to database');

    // Insert MBTI Types
    console.log('\n📊 Seeding MBTI types...');
    for (const type of mbtiTypes) {
      await client.query(
        `INSERT INTO mbti_types (code, name, emoji, "groupName", headline, tagline, strengths, weaknesses, "bestMatch", "challengingMatch", careers, "famousPeople")
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
        [type.code, type.name, type.emoji, type.groupName, type.headline, type.tagline, JSON.stringify(type.strengths), JSON.stringify(type.weaknesses), JSON.stringify(type.bestMatch), JSON.stringify(type.challengingMatch), JSON.stringify(type.careers), JSON.stringify(type.famousPeople)]
      );
      console.log(`✓ Inserted ${type.code} - ${type.name}`);
    }

    // Insert Questions
    console.log('\n❓ Seeding questions...');
    for (const question of questions) {
      await client.query(
        `INSERT INTO questions ("questionId", dimension, "dimensionOrder", "questionText", "optionA", "optionB", "scoreA", "scoreB", "isActive")
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [question.questionId, question.dimension, question.dimensionOrder, question.questionText, question.optionA, question.optionB, question.scoreA, question.scoreB, question.isActive]
      );
      console.log(`✓ Inserted question ${question.questionId}`);
    }

    console.log('\n🎉 Database seeded successfully!');
    console.log(`📊 Inserted ${mbtiTypes.length} MBTI types`);
    console.log(`❓ Inserted ${questions.length} questions`);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.end();
  }
}

seedDatabase();
