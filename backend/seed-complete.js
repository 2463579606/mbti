/**
 * Complete Database Seed Script
 * Populates database with full MBTI types and 60 questions from UI
 */

const { Client } = require('pg');

const client = new Client({
  host: 'localhost',
  port: 5432,
  user: 'mbti_user',
  password: 'mbti_password_2026',
  database: 'mbti_test'
});

// 16 MBTI Types (complete data from UI)
const mbtiTypes = [
  {
    code: 'INTJ',
    name: '建筑师',
    emoji: '🏛️',
    groupName: '分析家',
    headline: '冷静睿智的战略规划大师',
    tagline: '思维独立、意志坚定，拥有将想象力与可靠性融合的天赋。',
    strengths: ['战略思维', '逻辑分析', '长远规划', '独立自主', '追求完美'],
    weaknesses: ['情绪表达困难', '过度批判', '难以融入社交', '固执己见', '完美主义困扰'],
    bestMatch: ['ENFP', 'ENTP'],
    challengingMatch: ['ESFJ', 'ESTJ'],
    careers: ['战略顾问', '软件工程师', '科学家', '法官', '建筑师', '数据分析师'],
    famousPeople: ['埃隆·马斯克', '尼古拉·特斯拉', '马克·扎克伯格', '弗里德里希·尼采', '亚瑟·柯南·道尔']
  },
  {
    code: 'INTP',
    name: '逻辑学家',
    emoji: '🔬',
    groupName: '分析家',
    headline: '充满求知欲的创新思考者',
    tagline: '热爱理论、喜欢探索规律，对知识有无尽渴望。',
    strengths: ['逻辑严密', '创新思考', '客观分析', '博学多才', '理性公正'],
    weaknesses: ['犹豫不决', '不善表达情感', '容易走神', '忽视实际细节', '社交冷漠'],
    bestMatch: ['ENTJ', 'ESTJ'],
    challengingMatch: ['ESFJ', 'ENFJ'],
    careers: ['科学家', '程序员', '哲学家', '数学家', '研究员', '系统分析师'],
    famousPeople: ['艾尔伯特·爱因斯坦', '比尔·盖茨', '查尔斯·达尔文', '亚伯拉罕·林肯', '史蒂芬·霍金']
  },
  {
    code: 'ENTJ',
    name: '指挥官',
    emoji: '⚡',
    groupName: '分析家',
    headline: '天生领袖，驱动力十足的决策者',
    tagline: '自信、果断，善于制定目标并激励他人实现它。',
    strengths: ['领导力强', '高效决断', '目标清晰', '组织能力', '自信魅力'],
    weaknesses: ['过于强势', '缺乏耐心', '忽视情感', '不能接受批评', '工作狂倾向'],
    bestMatch: ['INTP', 'ISTP'],
    challengingMatch: ['INFP', 'ISFP'],
    careers: ['CEO', '律师', '企业家', '政治家', '投资经理', '项目总监'],
    famousPeople: ['史蒂夫·乔布斯', '拿破仑·波拿巴', '玛格丽特·撒切尔', '杰克·韦尔奇', '戈登·拉姆齐']
  },
  {
    code: 'ENTP',
    name: '辩论家',
    emoji: '💡',
    groupName: '分析家',
    headline: '思维敏锐的智慧挑战者',
    tagline: '喜欢探索新想法，善于辩论，总能看到问题的多面性。',
    strengths: ['思维灵活', '创意无限', '善于沟通', '适应力强', '充满热情'],
    weaknesses: ['难以坚持', '不擅细节', '争论好胜', '容易分心', '拖延症'],
    bestMatch: ['INFJ', 'INTJ'],
    challengingMatch: ['ISFJ', 'ISTJ'],
    careers: ['创业者', '律师', '顾问', '媒体人', '创意总监', '产品经理'],
    famousPeople: ['马克·吐温', '本杰明·富兰克林', '托马斯·爱迪生', '史蒂夫·乔布斯早期', '尼尔·德格拉斯·泰森']
  },
  {
    code: 'INFJ',
    name: '提倡者',
    emoji: '🌿',
    groupName: '外交家',
    headline: '富有远见的理想主义守护者',
    tagline: '深刻、洞察力强，用温柔而坚定的力量追求更美好的世界。',
    strengths: ['洞察力极强', '同理心丰富', '创造力十足', '坚守价值观', '激励他人'],
    weaknesses: ['过度敏感', '容易精疲力竭', '完美主义', '难以拒绝', '过于私密'],
    bestMatch: ['ENFP', 'ENTP'],
    challengingMatch: ['ESTP', 'ISTP'],
    careers: ['心理咨询师', '作家', '医生', '社会工作者', '教育家', '艺术家'],
    famousPeople: ['纳尔逊·曼德拉', '马丁·路德·金', '卡尔·荣格', '托尔斯泰', '达芬奇']
  },
  {
    code: 'INFP',
    name: '调停者',
    emoji: '🦋',
    groupName: '外交家',
    headline: '充满理想的温柔梦想家',
    tagline: '忠于内心价值观，用创意与同理心触动他人的灵魂。',
    strengths: ['同理心强', '创意丰富', '忠诚可靠', '适应力好', '沉浸专注'],
    weaknesses: ['过于理想化', '情绪化', '拖延拖拉', '难以接受批评', '自我怀疑'],
    bestMatch: ['ENFJ', 'ENTJ'],
    challengingMatch: ['ESTJ', 'ESTP'],
    careers: ['作家', '心理学家', '艺术家', '社会工作者', '设计师', '音乐家'],
    famousPeople: ['威廉·莎士比亚', '奥黛丽·赫本', '约翰·列侬', 'J.K.罗琳', '安徒生']
  },
  {
    code: 'ENFJ',
    name: '主人公',
    emoji: '🌟',
    groupName: '外交家',
    headline: '天赋异禀的领袖，人群中的光芒',
    tagline: '充满热情与魅力，天生就能感召和激励周围的每一个人。',
    strengths: ['感染力强', '关怀他人', '组织协调', '沟通出色', '善解人意'],
    weaknesses: ['过度付出', '自我批评', '不切实际', '难以拒绝', '过于情绪化'],
    bestMatch: ['INFP', 'ISFP'],
    challengingMatch: ['ISTP', 'INTP'],
    careers: ['教师', '政治家', '培训师', '公关顾问', '社区领袖', '演员'],
    famousPeople: ['贝拉克·奥巴马', '奥普拉·温弗瑞', '德斯蒙德·图图', '约翰·科特', '马雅·安吉洛']
  },
  {
    code: 'ENFP',
    name: '竞选者',
    emoji: '🎨',
    groupName: '外交家',
    headline: '热情奔放的创意灵魂',
    tagline: '用无限热情感染世界，总能在人群中发现每个人的潜能。',
    strengths: ['充满热情', '富有创意', '社交达人', '观察敏锐', '灵活多变'],
    weaknesses: ['难以专注', '情绪波动', '过于乐观', '不擅计划', '容易走神'],
    bestMatch: ['INTJ', 'INFJ'],
    challengingMatch: ['ISTJ', 'ESTJ'],
    careers: ['演员', '记者', '创业者', '心理咨询师', '广告创意', '旅行博主'],
    famousPeople: ['罗宾·威廉姆斯', '马克·吐温', '查理·卓别林', '安·弗兰克', '菲尼亚斯·泰勒·巴纳姆']
  },
  {
    code: 'ISTJ',
    name: '检查员',
    emoji: '📋',
    groupName: '哨兵',
    headline: '诚实可靠的责任守护者',
    tagline: '以勤勉和诚信著称，用踏实的行动维护秩序与传统。',
    strengths: ['高度负责', '条理清晰', '坚持不懈', '值得信赖', '注重细节'],
    weaknesses: ['固执守旧', '不善表达情感', '难以变通', '工作狂', '忽视娱乐'],
    bestMatch: ['ESFJ', 'ESTJ'],
    challengingMatch: ['ENFP', 'INFP'],
    careers: ['会计师', '工程师', '法官', '军官', '医生', '档案管理员'],
    famousPeople: ['华伦·巴菲特', '安吉拉·默克尔', '乔治·华盛顿', '坚尼·李察生', '斯汀']
  },
  {
    code: 'ISFJ',
    name: '守护者',
    emoji: '🛡️',
    groupName: '哨兵',
    headline: '默默付出的温暖守护天使',
    tagline: '慷慨而敏锐，总在幕后默默守护着每一个在乎的人。',
    strengths: ['温柔体贴', '责任心强', '记忆力好', '耐心细致', '善于倾听'],
    weaknesses: ['过于谦虚', '难以拒绝', '情绪压抑', '过度担忧', '回避冲突'],
    bestMatch: ['ESFP', 'ESTP'],
    challengingMatch: ['ENTJ', 'ENTP'],
    careers: ['护士', '幼教', '行政助理', '图书馆员', '社会工作者', '室内设计师'],
    famousPeople: ['碧昂斯', '凯特·米德尔顿', '安妮·赫沙薇', '伊丽莎白二世', '罗莎·帕克斯']
  },
  {
    code: 'ESTJ',
    name: '总经理',
    emoji: '📊',
    groupName: '哨兵',
    headline: '务实高效的管理型领导者',
    tagline: '尊重规则和秩序，用行动力和组织能力确保事情有条不紊地推进。',
    strengths: ['组织能力强', '果断直接', '值得信赖', '系统思维', '责任心强'],
    weaknesses: ['过于固执', '忽视情感', '不够灵活', '好控制', '难以接受新事物'],
    bestMatch: ['ISFJ', 'ISTJ'],
    challengingMatch: ['INFP', 'ENFP'],
    careers: ['经理', '法官', '银行家', '医院管理员', '学校校长', '工程项目主管'],
    famousPeople: ['山姆·沃尔顿', '弗兰克·辛纳特拉', '约翰·D·洛克菲勒', '米歇尔·奥巴马', '艾维·李']
  },
  {
    code: 'ESFJ',
    name: '执政官',
    emoji: '🤝',
    groupName: '哨兵',
    headline: '热心肠的社区凝聚者',
    tagline: '关心他人的感受，用实际行动传递温暖和爱。',
    strengths: ['关心他人', '善于交际', '组织能力', '责任心强', '体贴入微'],
    weaknesses: ['过于在意他人看法', '难以接受批评', '回避争论', '过于传统', '情绪化'],
    bestMatch: ['ISFJ', 'ISTJ'],
    challengingMatch: ['INTP', 'INTJ'],
    careers: ['护士', '教师', '销售经理', '活动策划', '人力资源', '社区协调员'],
    famousPeople: ['泰勒·斯威夫特', '比尔·克林顿', '珍妮弗·洛佩兹', '休·杰克曼', '戴安娜王妃']
  },
  {
    code: 'ISTP',
    name: '鉴赏家',
    emoji: '🔧',
    groupName: '探险家',
    headline: '冷静利落的实用主义高手',
    tagline: '观察力敏锐，擅长用最少的资源解决最复杂的问题。',
    strengths: ['动手能力强', '冷静理性', '适应力强', '观察细致', '独立自主'],
    weaknesses: ['情感淡漠', '难以承诺', '容易厌倦', '私密内敛', '固执己见'],
    bestMatch: ['ESTJ', 'ENTJ'],
    challengingMatch: ['ENFJ', 'INFJ'],
    careers: ['工程师', '飞行员', '警察', '外科医生', '电工', '赛车手'],
    famousPeople: ['克林特·伊斯特伍德', '迈克尔·乔丹', '布鲁斯·李', '詹姆斯·迪恩', '安吉丽娜·朱莉']
  },
  {
    code: 'ISFP',
    name: '探险家',
    emoji: '🎭',
    groupName: '探险家',
    headline: '灵动自由的艺术灵魂',
    tagline: '用行动而非语言表达内心，活在当下，享受美好的感官体验。',
    strengths: ['富有魅力', '体贴温柔', '艺术感强', '灵活开放', '忠诚热情'],
    weaknesses: ['过于敏感', '难以远见', '回避冲突', '过度自我批评', '无法应对压力'],
    bestMatch: ['ESFJ', 'ENFJ'],
    challengingMatch: ['ENTJ', 'INTJ'],
    careers: ['设计师', '音乐家', '厨师', '护士', '摄影师', '时装设计师'],
    famousPeople: ['迈克尔·杰克逊', '玛丽莲·梦露', '奥黛丽·赫本', '大卫·鲍伊', '凯特·布兰切特']
  },
  {
    code: 'ESTP',
    name: '企业家',
    emoji: '🚀',
    groupName: '探险家',
    headline: '行动派的魅力冒险家',
    tagline: '思维敏捷，善于把握机会，总能在混乱中找到最优解。',
    strengths: ['行动力强', '适应能力强', '魅力四射', '解决问题能力强', '善于观察'],
    weaknesses: ['缺乏耐心', '冲动鲁莽', '漠视规则', '不擅长理论', '情绪化'],
    bestMatch: ['ISFJ', 'ISTJ'],
    challengingMatch: ['INFJ', 'INTJ'],
    careers: ['销售', '警察', '演员', '运动员', '商人', '急救医生'],
    famousPeople: ['唐纳德·特朗普', '麦当娜', '欧内斯特·海明威', '杰克·尼科尔森', '艾迪·墨菲']
  },
  {
    code: 'ESFP',
    name: '表演者',
    emoji: '🎉',
    groupName: '探险家',
    headline: '活力四射的生命派对主角',
    tagline: '天生的表演者，用无尽热情和欢笑点亮身边的每一个人。',
    strengths: ['充满活力', '善于社交', '实用灵活', '观察人心', '享受生活'],
    weaknesses: ['容易分心', '厌倦例行', '冲动消费', '回避困难', '过于在乎他人'],
    bestMatch: ['ISFJ', 'ISTJ'],
    challengingMatch: ['INTJ', 'INFJ'],
    careers: ['演员', '活动策划', '旅游顾问', '健身教练', '时尚博主', '主持人'],
    famousPeople: ['阿黛尔', '里奥纳多·迪卡普里奥', '杰米·福克斯', '查理·卓别林', '成龙']
  }
];

// 60 Questions (complete data from UI)
const questions = [
  // E/I Dimension (0-14)
  { questionId: 0, dimension: 'EI', dimensionOrder: 1, questionText: '在一次大型聚会之后，你通常感觉如何？', optionA: '精力充沛，意犹未尽', optionB: '有些疲惫，需要独处恢复', scoreA: 2, scoreB: 0, isActive: true },
  { questionId: 1, dimension: 'EI', dimensionOrder: 2, questionText: '你更喜欢哪种工作环境？', optionA: '开放式办公室，随时可以交流', optionB: '独立空间，可以专注思考', scoreA: 2, scoreB: 0, isActive: true },
  { questionId: 2, dimension: 'EI', dimensionOrder: 3, questionText: '当你遇到难题时，你通常会...', optionA: '和朋友或同事讨论，集思广益', optionB: '独自思考，想清楚再说', scoreA: 2, scoreB: 0, isActive: true },
  { questionId: 3, dimension: 'EI', dimensionOrder: 4, questionText: '周末你更愿意如何度过？', optionA: '参加朋友聚会或社交活动', optionB: '待在家里看书或做自己的事', scoreA: 2, scoreB: 0, isActive: true },
  { questionId: 4, dimension: 'EI', dimensionOrder: 5, questionText: '在你不熟悉的人群中，你会...', optionA: '主动出击，认识新朋友', optionB: '等待他人来主动交谈', scoreA: 2, scoreB: 0, isActive: true },
  { questionId: 5, dimension: 'EI', dimensionOrder: 6, questionText: '你通常是如何"充电"的？', optionA: '与他人互动，社交活动', optionB: '独处，给自己安静的时间', scoreA: 2, scoreB: 0, isActive: true },
  { questionId: 6, dimension: 'EI', dimensionOrder: 7, questionText: '你更倾向于哪种沟通方式？', optionA: '直接面对面交谈', optionB: '文字消息或电子邮件', scoreA: 2, scoreB: 0, isActive: true },
  { questionId: 7, dimension: 'EI', dimensionOrder: 8, questionText: '在课堂或会议上，你更可能...', optionA: '主动发言，分享观点', optionB: '只在有把握时才开口', scoreA: 2, scoreB: 0, isActive: true },
  { questionId: 8, dimension: 'EI', dimensionOrder: 9, questionText: '你的朋友圈是怎样的？', optionA: '朋友很多，各种类型的人都有', optionB: '朋友不多，但关系都很深厚', scoreA: 2, scoreB: 0, isActive: true },
  { questionId: 9, dimension: 'EI', dimensionOrder: 10, questionText: '你在工作中喜欢...', optionA: '多任务并行，保持活跃', optionB: '一次专注做好一件事', scoreA: 2, scoreB: 0, isActive: true },
  { questionId: 10, dimension: 'EI', dimensionOrder: 11, questionText: '别人眼中的你通常是...', optionA: '开朗、健谈、外向', optionB: '安静、沉稳、内敛', scoreA: 2, scoreB: 0, isActive: true },
  { questionId: 11, dimension: 'EI', dimensionOrder: 12, questionText: '当你感到压力时，你会...', optionA: '找人倾诉，寻求支持', optionB: '独自处理，需要空间', scoreA: 2, scoreB: 0, isActive: true },
  { questionId: 12, dimension: 'EI', dimensionOrder: 13, questionText: '对于"一个人旅行"你觉得...', optionA: '可以，但更喜欢和朋友同行', optionB: '太好了，享受自由独处的感觉', scoreA: 2, scoreB: 0, isActive: true },
  { questionId: 13, dimension: 'EI', dimensionOrder: 14, questionText: '在团队合作中，你更喜欢...', optionA: '在讨论中碰撞想法', optionB: '独立完成自己的部分', scoreA: 2, scoreB: 0, isActive: true },
  { questionId: 14, dimension: 'EI', dimensionOrder: 15, questionText: '对于社交媒体，你更倾向于...', optionA: '频繁更新，分享生活点滴', optionB: '很少发帖，更多是浏览', scoreA: 2, scoreB: 0, isActive: true },

  // S/N Dimension (15-29)
  { questionId: 15, dimension: 'SN', dimensionOrder: 1, questionText: '在阅读文章时，你更感兴趣的是...', optionA: '具体的事实、数据和实例', optionB: '背后的理论和宏观含义', scoreA: 2, scoreB: 0, isActive: true },
  { questionId: 16, dimension: 'SN', dimensionOrder: 2, questionText: '你更相信...', optionA: '亲身经历和已验证的事实', optionB: '直觉和对未来的预感', scoreA: 2, scoreB: 0, isActive: true },
  { questionId: 17, dimension: 'SN', dimensionOrder: 3, questionText: '在学习新技能时，你倾向于...', optionA: '按步骤从基础开始学', optionB: '先了解大局，再填充细节', scoreA: 2, scoreB: 0, isActive: true },
  { questionId: 18, dimension: 'SN', dimensionOrder: 4, questionText: '面对一个项目，你会...', optionA: '制定详细计划，按部就班', optionB: '先有整体构想，细节边做边定', scoreA: 2, scoreB: 0, isActive: true },
  { questionId: 19, dimension: 'SN', dimensionOrder: 5, questionText: '你更擅长...', optionA: '记住细节和具体信息', optionB: '把握规律、发现关联和可能性', scoreA: 2, scoreB: 0, isActive: true },
  { questionId: 20, dimension: 'SN', dimensionOrder: 6, questionText: '描述自己时，你更认为自己是...', optionA: '脚踏实地的务实派', optionB: '富有想象力的理想派', scoreA: 2, scoreB: 0, isActive: true },
  { questionId: 21, dimension: 'SN', dimensionOrder: 7, questionText: '在工作中，你更喜欢...', optionA: '有明确指导和操作规程的任务', optionB: '可以自由探索和发挥创意的任务', scoreA: 2, scoreB: 0, isActive: true },
  { questionId: 22, dimension: 'SN', dimensionOrder: 8, questionText: '谈到未来，你更倾向于...', optionA: '考虑当下的实际情况', optionB: '畅想各种可能性', scoreA: 2, scoreB: 0, isActive: true },
  { questionId: 23, dimension: 'SN', dimensionOrder: 9, questionText: '你对历史更感兴趣的是...', optionA: '具体的事件、人物和时间线', optionB: '历史背后的模式和规律', scoreA: 2, scoreB: 0, isActive: true },
  { questionId: 24, dimension: 'SN', dimensionOrder: 10, questionText: '做决定时，你更依赖...', optionA: '过去的经验和已有的证据', optionB: '对未来的预感和直觉', scoreA: 2, scoreB: 0, isActive: true },
  { questionId: 25, dimension: 'SN', dimensionOrder: 11, questionText: '你描述一件事时倾向于...', optionA: '具体准确，细节详细', optionB: '抽象概括，重点突出', scoreA: 2, scoreB: 0, isActive: true },
  { questionId: 26, dimension: 'SN', dimensionOrder: 12, questionText: '对于创意性的工作，你觉得...', optionA: '更喜欢有具体标准和参考的任务', optionB: '喜欢开放性任务，自由发挥', scoreA: 2, scoreB: 0, isActive: true },
  { questionId: 27, dimension: 'SN', dimensionOrder: 13, questionText: '学习时你更注重...', optionA: '掌握已有的知识体系', optionB: '提出新的问题和假设', scoreA: 2, scoreB: 0, isActive: true },
  { questionId: 28, dimension: 'SN', dimensionOrder: 14, questionText: '对于"理论"，你的态度是...', optionA: '只有实用才有意义', optionB: '本身就很有趣，值得探索', scoreA: 2, scoreB: 0, isActive: true },
  { questionId: 29, dimension: 'SN', dimensionOrder: 15, questionText: '你的思维方式更像...', optionA: '现实的地图，记录已知世界', optionB: '望远镜，探索未知可能', scoreA: 2, scoreB: 0, isActive: true },

  // T/F Dimension (30-44)
  { questionId: 30, dimension: 'TF', dimensionOrder: 1, questionText: '做重大决定时，你更依靠...', optionA: '逻辑分析和客观事实', optionB: '个人价值观和对他人的影响', scoreA: 2, scoreB: 0, isActive: true },
  { questionId: 31, dimension: 'TF', dimensionOrder: 2, questionText: '当朋友向你倾诉问题时，你通常...', optionA: '给出分析和解决建议', optionB: '先表示理解和情感支持', scoreA: 2, scoreB: 0, isActive: true },
  { questionId: 32, dimension: 'TF', dimensionOrder: 3, questionText: '你更容易被什么样的人吸引？', optionA: '智慧、能力强、理性的人', optionB: '温暖、善良、有同理心的人', scoreA: 2, scoreB: 0, isActive: true },
  { questionId: 33, dimension: 'TF', dimensionOrder: 4, questionText: '面对批评，你通常...', optionA: '关注批评本身是否有理有据', optionB: '先在意对方是否尊重自己的感受', scoreA: 2, scoreB: 0, isActive: true },
  { questionId: 34, dimension: 'TF', dimensionOrder: 5, questionText: '你认为好的领导者应该...', optionA: '客观公正，基于能力做决策', optionB: '关心团队感受，维护关系和谐', scoreA: 2, scoreB: 0, isActive: true },
  { questionId: 35, dimension: 'TF', dimensionOrder: 6, questionText: '在争论中，你更倾向于...', optionA: '坚持逻辑，即便会伤害感情', optionB: '考虑他人感受，避免激烈冲突', scoreA: 2, scoreB: 0, isActive: true },
  { questionId: 36, dimension: 'TF', dimensionOrder: 7, questionText: '你觉得批评别人时...', optionA: '应该直接指出问题，这样更有帮助', optionB: '应该委婉措辞，避免伤害感情', scoreA: 2, scoreB: 0, isActive: true },
  { questionId: 37, dimension: 'TF', dimensionOrder: 8, questionText: '对你来说，"正确"还是"和谐"更重要？', optionA: '正确，真相最重要', optionB: '和谐，关系更珍贵', scoreA: 2, scoreB: 0, isActive: true },
  { questionId: 38, dimension: 'TF', dimensionOrder: 9, questionText: '你更容易被感动于...', optionA: '逻辑严密、精妙的论述', optionB: '真实感人的情感故事', scoreA: 2, scoreB: 0, isActive: true },
  { questionId: 39, dimension: 'TF', dimensionOrder: 10, questionText: '在团队中，你更擅长...', optionA: '分析问题，提出理性方案', optionB: '激励成员，增强团队凝聚力', scoreA: 2, scoreB: 0, isActive: true },
  { questionId: 40, dimension: 'TF', dimensionOrder: 11, questionText: '你认为公平意味着...', optionA: '每人按规则和能力得到应得的', optionB: '每人都被平等善待，感受被尊重', scoreA: 2, scoreB: 0, isActive: true },
  { questionId: 41, dimension: 'TF', dimensionOrder: 12, questionText: '做决定时，你最担心...', optionA: '犯逻辑错误，做出不理性的判断', optionB: '伤害他人或破坏重要的关系', scoreA: 2, scoreB: 0, isActive: true },
  { questionId: 42, dimension: 'TF', dimensionOrder: 13, questionText: '看到他人犯错，你会...', optionA: '直接指出，帮助对方改进', optionB: '先照顾情绪，再委婉提醒', scoreA: 2, scoreB: 0, isActive: true },
  { questionId: 43, dimension: 'TF', dimensionOrder: 14, questionText: '你欣赏的品质更倾向于...', optionA: '能力、智慧、效率', optionB: '善良、体贴、温柔', scoreA: 2, scoreB: 0, isActive: true },
  { questionId: 44, dimension: 'TF', dimensionOrder: 15, questionText: '对于"心软"，你的看法是...', optionA: '有时会妨碍正确决策', optionB: '是一种可贵的品质', scoreA: 2, scoreB: 0, isActive: true },

  // J/P Dimension (45-59)
  { questionId: 45, dimension: 'JP', dimensionOrder: 1, questionText: '你的桌面通常是...', optionA: '整洁有序，一切各归其位', optionB: '随性一些，知道东西在哪就够了', scoreA: 2, scoreB: 0, isActive: true },
  { questionId: 46, dimension: 'JP', dimensionOrder: 2, questionText: '对于旅行计划，你更倾向于...', optionA: '提前规划好行程和住宿', optionB: '走到哪算哪，随机应变', scoreA: 2, scoreB: 0, isActive: true },
  { questionId: 47, dimension: 'JP', dimensionOrder: 3, questionText: '面对截止日期，你通常...', optionA: '提前完成，避免最后冲刺', optionB: '有时候压线，但结果也不差', scoreA: 2, scoreB: 0, isActive: true },
  { questionId: 48, dimension: 'JP', dimensionOrder: 4, questionText: '你更喜欢哪种工作方式？', optionA: '有明确目标和时间节点的计划性工作', optionB: '灵活多变、可以随时调整的工作', scoreA: 2, scoreB: 0, isActive: true },
  { questionId: 49, dimension: 'JP', dimensionOrder: 5, questionText: '临时改变计划，你会...', optionA: '感到烦躁，希望一切按计划进行', optionB: '觉得还好，甚至喜欢意外的可能', scoreA: 2, scoreB: 0, isActive: true },
  { questionId: 50, dimension: 'JP', dimensionOrder: 6, questionText: '你的日常生活更...', optionA: '有规律，固定的作息和习惯', optionB: '随机应变，每天可能不一样', scoreA: 2, scoreB: 0, isActive: true },
  { questionId: 51, dimension: 'JP', dimensionOrder: 7, questionText: '购物时，你通常...', optionA: '提前列好清单，按需购买', optionB: '看到喜欢的就买', scoreA: 2, scoreB: 0, isActive: true },
  { questionId: 52, dimension: 'JP', dimensionOrder: 8, questionText: '在完成一项任务时，你...', optionA: '喜欢有清晰的阶段和检查节点', optionB: '更喜欢在截止前一气呵成', scoreA: 2, scoreB: 0, isActive: true },
  { questionId: 53, dimension: 'JP', dimensionOrder: 9, questionText: '面对选择，你通常...', optionA: '希望快速决定，不喜欢悬而未决', optionB: '愿意保留选项，多考虑一会儿', scoreA: 2, scoreB: 0, isActive: true },
  { questionId: 54, dimension: 'JP', dimensionOrder: 10, questionText: '你的时间管理是...', optionA: '精打细算，合理安排每一个小时', optionB: '比较自由，感觉时间差不多就行', scoreA: 2, scoreB: 0, isActive: true },
  { questionId: 55, dimension: 'JP', dimensionOrder: 11, questionText: '新的项目开始时，你...', optionA: '立即制定计划和时间表', optionB: '先了解情况，等感觉来了再动手', scoreA: 2, scoreB: 0, isActive: true },
  { questionId: 56, dimension: 'JP', dimensionOrder: 12, questionText: '你对"完成"的定义是...', optionA: '全部按计划完成，没有遗漏', optionB: '大体上做完，不纠结完美', scoreA: 2, scoreB: 0, isActive: true },
  { questionId: 57, dimension: 'JP', dimensionOrder: 13, questionText: '工作中的规则和流程，你认为...', optionA: '很重要，保证质量和一致性', optionB: '有时过于僵化，灵活变通更好', scoreA: 2, scoreB: 0, isActive: true },
  { questionId: 58, dimension: 'JP', dimensionOrder: 14, questionText: '你更擅长...', optionA: '坚持长期计划，有始有终', optionB: '快速应对突发情况', scoreA: 2, scoreB: 0, isActive: true },
  { questionId: 59, dimension: 'JP', dimensionOrder: 15, questionText: '你更向往哪种生活方式？', optionA: '井然有序、规律充实的生活', optionB: '自由随性、充满可能性的生活', scoreA: 2, scoreB: 0, isActive: true }
];

async function seedDatabase() {
  try {
    await client.connect();
    console.log('✅ Connected to database');

    // Clear existing data
    console.log('\n🗑️  Clearing existing data...');
    await client.query('DELETE FROM test_answers');
    await client.query('DELETE FROM test_reports');
    await client.query('DELETE FROM test_sessions');
    await client.query('DELETE FROM questions');
    await client.query('DELETE FROM mbti_types');
    console.log('✓ Cleared all existing data');

    // Insert MBTI Types
    console.log('\n📊 Seeding MBTI types...');
    for (const type of mbtiTypes) {
      await client.query(
        `INSERT INTO mbti_types (
          code, name, emoji, "groupName", headline, tagline,
          strengths, weaknesses, "bestMatch", "challengingMatch",
          careers, "famousPeople"
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
        [
          type.code,
          type.name,
          type.emoji,
          type.groupName,
          type.headline,
          type.tagline,
          JSON.stringify(type.strengths),
          JSON.stringify(type.weaknesses),
          JSON.stringify(type.bestMatch),
          JSON.stringify(type.challengingMatch),
          JSON.stringify(type.careers),
          JSON.stringify(type.famousPeople)
        ]
      );
      console.log(`✓ Inserted ${type.code} - ${type.name}`);
    }

    // Insert Questions
    console.log('\n❓ Seeding questions...');
    for (const question of questions) {
      await client.query(
        `INSERT INTO questions (
          "questionId", dimension, "dimensionOrder", "questionText",
          "optionA", "optionB", "scoreA", "scoreB", "isActive"
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          question.questionId,
          question.dimension,
          question.dimensionOrder,
          question.questionText,
          question.optionA,
          question.optionB,
          question.scoreA,
          question.scoreB,
          question.isActive
        ]
      );
      console.log(`✓ Inserted question ${question.questionId + 1}: ${question.questionText.substring(0, 30)}...`);
    }

    // Verify counts
    const typeCount = await client.query('SELECT COUNT(*) FROM mbti_types');
    const questionCount = await client.query('SELECT COUNT(*) FROM questions');

    console.log('\n🎉 Database seeded successfully!');
    console.log(`📊 MBTI Types: ${typeCount.rows[0].count} / 16`);
    console.log(`❓ Questions: ${questionCount.rows[0].count} / 60`);

    if (typeCount.rows[0].count == 16 && questionCount.rows[0].count == 60) {
      console.log('\n✅ All data inserted successfully!');
    } else {
      console.log('\n⚠️  Warning: Data counts do not match expected values');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.code) {
      console.error('   Error code:', error.code);
    }
    if (error.detail) {
      console.error('   Detail:', error.detail);
    }
  } finally {
    await client.end();
    console.log('\n👋 Database connection closed');
  }
}

seedDatabase();
