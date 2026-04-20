-- MBTI 测试系统 - 数据库初始化脚本
-- PostgreSQL 15+

-- ============================================
-- 1. 创建数据库
-- ============================================
-- CREATE DATABASE mbti_test ENCODING 'UTF8' LC_COLLATE 'zh_CN.UTF-8' LC_CTYPE 'zh_CN.UTF-8';
-- \c mbti_test;

-- ============================================
-- 2. 创建扩展
-- ============================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";  -- 用于模糊搜索

-- ============================================
-- 3. 创建枚举类型
-- ============================================
CREATE TYPE user_status AS ENUM ('active', 'banned', 'deleted');
CREATE TYPE session_status AS ENUM ('in_progress', 'completed', 'abandoned');

-- ============================================
-- 4. 创建表结构
-- ============================================

-- 4.1 用户表
CREATE TABLE users (
    id BIGSERIAL PRIMARY KEY,
    anonymous_id VARCHAR(64) UNIQUE,
    email VARCHAR(255) UNIQUE,
    nickname VARCHAR(100),
    avatar VARCHAR(500),

    -- 统计信息
    test_count INT DEFAULT 0,
    last_test_at TIMESTAMP,

    -- 系统字段
    status user_status DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- 4.2 测试会话表
CREATE TABLE test_sessions (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    session_token VARCHAR(64) UNIQUE NOT NULL,

    -- 测试状态
    status session_status DEFAULT 'in_progress',

    -- 进度追踪
    current_question INT DEFAULT 0,
    answered_count INT DEFAULT 0,

    -- 时间追踪
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    duration_seconds INT,

    -- 结果
    result_type VARCHAR(4),
    result_scores JSONB,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4.3 答案记录表
CREATE TABLE test_answers (
    id BIGSERIAL PRIMARY KEY,
    session_id BIGINT NOT NULL REFERENCES test_sessions(id) ON DELETE CASCADE,
    user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,

    -- 题目信息
    question_id INT NOT NULL,
    dimension VARCHAR(2) NOT NULL,

    -- 答案信息
    selected_option INT NOT NULL CHECK (selected_option IN (0, 1)),
    score INT NOT NULL CHECK (score IN (0, 2)),

    -- 时间戳
    answered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- 唯一约束
    UNIQUE(session_id, question_id)
);

-- 4.4 题目表
CREATE TABLE questions (
    id SERIAL PRIMARY KEY,
    question_id INT UNIQUE NOT NULL,
    dimension VARCHAR(2) NOT NULL,
    dimension_order SMALLINT NOT NULL,

    -- 题目内容
    question_text TEXT NOT NULL,
    option_a TEXT NOT NULL,
    option_b TEXT NOT NULL,
    score_a INT NOT NULL,
    score_b INT NOT NULL,

    -- 状态管理
    is_active BOOLEAN DEFAULT true,
    version INT DEFAULT 1,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CHECK (dimension IN ('EI', 'SN', 'TF', 'JP')),
    CHECK (question_id BETWEEN 0 AND 59),
    CHECK (dimension_order BETWEEN 1 AND 15)
);

-- 4.5 MBTI类型配置表
CREATE TABLE mbti_types (
    code VARCHAR(4) PRIMARY KEY,

    -- 基本信息
    name VARCHAR(50) NOT NULL,
    emoji VARCHAR(10) NOT NULL,
    group_name VARCHAR(20) NOT NULL,

    -- 描述信息
    headline TEXT NOT NULL,
    tagline TEXT NOT NULL,

    -- 优劣势（JSON数组）
    strengths JSONB NOT NULL,
    weaknesses JSONB NOT NULL,

    -- 兼容性
    best_match JSONB NOT NULL,
    challenging_match JSONB NOT NULL,

    -- 职业和名人
    careers JSONB NOT NULL,
    famous_people JSONB NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4.6 测试报告表
CREATE TABLE test_reports (
    id BIGSERIAL PRIMARY KEY,
    session_id BIGINT UNIQUE NOT NULL REFERENCES test_sessions(id) ON DELETE CASCADE,
    user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,

    -- 测试结果
    mbti_type VARCHAR(4) NOT NULL REFERENCES mbti_types(code),

    -- 维度分数（百分比）
    ei_score INT NOT NULL CHECK (ei_score BETWEEN 0 AND 100),
    sn_score INT NOT NULL CHECK (sn_score BETWEEN 0 AND 100),
    tf_score INT NOT NULL CHECK (tf_score BETWEEN 0 AND 100),
    jp_score INT NOT NULL CHECK (jp_score BETWEEN 0 AND 100),

    -- 详细结果（JSON）
    dimension_details JSONB NOT NULL,
    personality_analysis JSONB,

    -- 分享相关
    share_token VARCHAR(64) UNIQUE,
    share_count INT DEFAULT 0,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4.7 每日统计表
CREATE TABLE daily_statistics (
    date DATE PRIMARY KEY,
    test_count INT DEFAULT 0,
    complete_count INT DEFAULT 0,
    unique_users INT DEFAULT 0,
    avg_duration INT,

    -- 类型分布
    type_distribution JSONB,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 5. 创建索引
-- ============================================

-- 5.1 users表索引
CREATE INDEX idx_users_anonymous ON users(anonymous_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_email ON users(email) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_created ON users(created_at DESC);

-- 5.2 test_sessions表索引
CREATE INDEX idx_sessions_user ON test_sessions(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX idx_sessions_token ON test_sessions(session_token);
CREATE INDEX idx_sessions_status ON test_sessions(status);
CREATE INDEX idx_sessions_created ON test_sessions(created_at DESC);
CREATE INDEX idx_sessions_result ON test_sessions(result_type) WHERE result_type IS NOT NULL;

-- 5.3 test_answers表索引
CREATE INDEX idx_answers_session ON test_answers(session_id);
CREATE INDEX idx_answers_user ON test_answers(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX idx_answers_dimension ON test_answers(dimension);
CREATE INDEX idx_answers_question ON test_answers(question_id);
CREATE INDEX idx_answers_session_question ON test_answers(session_id, question_id);

-- 5.4 questions表索引
CREATE INDEX idx_questions_dimension ON questions(dimension, dimension_order);
CREATE INDEX idx_questions_active ON questions(is_active) WHERE is_active = true;
CREATE INDEX idx_questions_id ON questions(question_id);

-- 5.5 test_reports表索引
CREATE INDEX idx_reports_session ON test_reports(session_id);
CREATE INDEX idx_reports_user ON test_reports(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX idx_reports_type ON test_reports(mbti_type);
CREATE INDEX idx_reports_share ON test_reports(share_token) WHERE share_token IS NOT NULL;
CREATE INDEX idx_reports_created ON test_reports(created_at DESC);

-- 5.6 复合索引（用于查询优化）
CREATE INDEX idx_answers_session_dim ON test_answers(session_id, dimension);
CREATE INDEX idx_sessions_user_status ON test_sessions(user_id, status) WHERE user_id IS NOT NULL;

-- ============================================
-- 6. 创建视图
-- ============================================

-- 6.1 测试会话详情视图
CREATE VIEW v_session_details AS
SELECT
    s.id,
    s.session_token,
    s.user_id,
    s.status,
    s.current_question,
    s.answered_count,
    s.started_at,
    s.completed_at,
    s.duration_seconds,
    s.result_type,
    u.anonymous_id,
    u.email,
    COUNT(DISTINCT a.id) as answer_count
FROM test_sessions s
LEFT JOIN users u ON s.user_id = u.id
LEFT JOIN test_answers a ON s.id = a.session_id
GROUP BY s.id, u.id;

-- 6.2 用户统计视图
CREATE VIEW v_user_stats AS
SELECT
    u.id as user_id,
    u.anonymous_id,
    u.email,
    COUNT(DISTINCT s.id) as total_tests,
    MAX(s.completed_at) as last_test_at,
    AVG(s.duration_seconds) as avg_duration,
    s.result_type as last_type
FROM users u
LEFT JOIN test_sessions s ON u.id = s.user_id AND s.status = 'completed'
WHERE u.deleted_at IS NULL
GROUP BY u.id, s.result_type;

-- ============================================
-- 7. 创建函数
-- ============================================

-- 7.1 更新时间戳触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 7.2 为需要的表添加触发器
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sessions_updated_at BEFORE UPDATE ON test_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_questions_updated_at BEFORE UPDATE ON questions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_mbti_types_updated_at BEFORE UPDATE ON mbti_types
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_daily_stats_updated_at BEFORE UPDATE ON daily_statistics
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 7.3 用户测试计数更新函数
CREATE OR REPLACE FUNCTION update_user_test_count()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
        UPDATE users
        SET test_count = test_count + 1,
            last_test_at = NEW.completed_at
        WHERE id = NEW.user_id;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_test_count_trigger
AFTER UPDATE ON test_sessions
FOR EACH ROW
WHEN (NEW.status = 'completed')
EXECUTE FUNCTION update_user_test_count();

-- 7.4 生成唯一token函数
CREATE OR REPLACE FUNCTION generate_token(prefix TEXT DEFAULT '')
RETURNS VARCHAR(64) AS $$
DECLARE
    chars TEXT := 'abcdefghijklmnopqrstuvwxyz0123456789';
    result TEXT := prefix;
    i INT;
BEGIN
    IF prefix != '' THEN
        result := prefix || '_';
    END IF;

    FOR i IN 1..16 LOOP
        result := result || SUBSTRING(chars FROM FLOOR(1 + RANDOM() * 36)::INT FOR 1);
    END LOOP;

    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 8. 初始化数据
-- ============================================

-- 8.1 插入16种MBTI类型
INSERT INTO mbti_types (code, name, emoji, group_name, headline, tagline, strengths, weaknesses, best_match, challenging_match, careers, famous_people) VALUES
-- 分析家组
('INTJ', '建筑师', '🏛️', '分析家', '富有想象力和战略性的思想家',
 '一切皆在计划之中。独立、冷静、坚韧，追求能力和知识的提升。',
 '["战略性思维","高度专注","独立自主","追求完美","逻辑严密"]'::jsonb,
 '["过于挑剔","难以容忍无能","忽视社交礼仪","过于独立","固执"]'::jsonb,
 '["ENFP","ENTP"]'::jsonb,
 '["ESFP","ESTP"]'::jsonb,
 '["科学家","系统分析师","战略规划","软件开发","投资顾问","大学教授"]'::jsonb,
 '["艾萨克·牛顿","尼采","史蒂芬·霍金","特斯拉","埃隆·马斯克"]'::jsonb
),

('INTP', '逻辑学家', '🔬', '分析家', '具有创新性的发明家',
 '对知识有着止不住的渴望。善于分析、创新，追求理解和解释世界。',
 '["逻辑思维强","好奇心强","适应力强","客观公正","善于解决问题"]'::jsonb,
 '["拖延症","不切实际","情感疏离","难以专注","敏感"]'::jsonb,
 '["ENTJ","ESTJ"]'::jsonb,
 '["ESFJ","ISFJ"]'::jsonb,
 '["程序员","物理学家","数学家","研究员","哲学家","数据分析师"]'::jsonb,
 '["阿尔伯特·爱因斯坦","卡尔·荣格","亚当·斯密","查尔斯·达尔文","比尔·盖茨"]'::jsonb
),

('ENTJ', '指挥官', '⚡', '分析家', '果断、大胆的领导者',
 '天生的领导者，擅长规划和执行。精力充沛、自信，追求效率和组织。',
 '["天生的领导力","目标导向","高效执行","自信果断","战略思维"]'::jsonb,
 '["过于强势","不耐烦","难以接受批评","忽视情感","控制欲强"]'::jsonb,
 '["INFP","INTP"]'::jsonb,
 '["ISFP","INFP"]'::jsonb,
 '["CEO","管理咨询","律师","项目经理","政治家","创业者"]'::jsonb,
 '["史蒂夫·乔布斯","拿破仑·波拿巴","玛格丽特·撒切尔","温斯顿·丘吉尔","唐纳德·特朗普"]'::jsonb
),

('ENTP', '辩论家', '💡', '分析家', '聪明的挑战者',
 '热衷于智力挑战。善于辩论、创新，总是寻找新的可能性。',
 '["思维敏捷","创新力强","善于辩论","知识渊博","适应性强"]'::jsonb,
 '["争论不休","难以专注","不切实际","情绪化","易分散注意力"]'::jsonb,
 '["INFJ","INTJ"]'::jsonb,
 '["ISFJ","ISTJ"]'::jsonb,
 '["创业者","律师","顾问、记者","营销总监","风险投资","演说家"]'::jsonb,
 '["马克·吐温","本杰明·富兰克林","理查德·费曼","奥斯卡·王尔德","汤姆·汉克斯"]'::jsonb
),

-- 外交家组
('INFJ', '提倡者', '🌿', '外交家', '富有远见的理想主义者',
 '深刻、洞察力强，总是在追求更深层的意义。富有创造力和同情心。',
 '["富有创造力","洞察力强","有原则","富有同情心","利他主义"]'::jsonb,
 '["过于理想化","容易 burnout","对批评敏感","固执己见","忽视现实"]'::jsonb,
 '["ENFP","ENTP"]'::jsonb,
 '["ISTP","ESTP"]'::jsonb,
 '["心理咨询师","作家","艺术家","非营利组织","教育工作者","人力资源"]'::jsonb,
 '["柏拉图","甘地","马丁·路德·金","卡尔·荣格","纳尔逊·曼德拉"]'::jsonb
),

('INFP', '调停者', '🦋', '外交家', '诗意、善良的利他主义者',
 '总是热情地帮助正义事业。富有想象力、忠诚，但有时过于理想化。',
 '["富有创造力","理想主义","善良忠诚","适应力强","善于理解他人"]'::jsonb,
 '["过于理想化","难以应对实际","过于敏感","自我批评","难以处理冲突"]'::jsonb,
 '["ENFJ","ENTJ"]'::jsonb,
 '["ISTJ","ESTJ"]'::jsonb,
 '["作家","艺术家","心理咨询师、社会工作者","教师","翻译","平面设计"]'::jsonb,
 '["莎士比亚","J.R.R.托尔金","约翰·列侬","简·奥斯汀","比莉·哈乐黛"]'::jsonb
),

('ENFJ', '主人公', '🌟', '外交家', '有魅力和鼓舞人心的领导者',
 '善于激励他人。热情、有魅力，天生的领导者和沟通者。',
 '["天生的领导力","富有魅力","善于激励他人","同理心强","沟通能力强"]'::jsonb,
 '["过于理想化","过于在意他人看法","难以做艰难决定","易受他人影响","过度自我牺牲"]'::jsonb,
 '["INFP","ISFP"]'::jsonb,
 '["INTP","ISTP"]'::jsonb,
 '["教师","人力资源","培训师、销售经理","政治家","公关","非营利组织"]'::jsonb,
 '["奥普拉·温弗瑞","巴拉克·奥巴马","玛雅·安吉洛","罗纳德·里根","比尔·克林顿"]'::jsonb
),

('ENFP', '竞选者', '🎨', '外交家', '充满热情、有创造力的自由精神',
 '热情、有创造力、社交能力强。总是寻找新的可能性，善于激励他人。',
 '["热情洋溢","创造力强","社交能力强","善于沟通","适应力强"]'::jsonb,
 '["注意力分散","难以专注","情绪化","不切实际","容易感到压力"]'::jsonb,
 '["INFJ","INTJ"]'::jsonb,
 '["ISTJ","ISFJ"]'::jsonb,
 '["记者","广告创意","活动策划","心理咨询师","教师","演员"]'::jsonb,
 '["罗宾·威廉姆斯","威尔·史密斯","史蒂芬·科尔伯特","艾伦·德杰尼勒斯","昆汀·塔伦蒂诺"]'::jsonb
),

-- 哨兵组
('ISTJ', '检查员', '📋', '哨兵', '实际且注重事实的个人',
 '稳重、可靠，注重细节和传统。负责任、有条理，追求秩序和稳定。',
 '["诚实可靠","注重细节","责任感强","组织能力强","实用主义"]'::jsonb,
 '["过于固执","难以适应变化","过于保守","对批评敏感","缺乏灵活性"]'::jsonb,
 '["ESFP","ESTP"]'::jsonb,
 '["ENFP","ENTP"]'::jsonb,
 '["会计","审计","律师","医生","工程师","军官"]'::jsonb,
 '["华盛顿","沃伦·巴菲特","安格拉·默克尔","纳塔莉·波特曼","哈里·S·杜鲁门"]'::jsonb
),

('ISFJ', '守护者', '🛡️', '哨兵', '非常专注、温暖的守护者',
 '总是准备保护爱的人。安静、友善、负责任、忠诚。',
 '["温暖友善","负责任","忠诚可靠","注重细节","善于支持他人"]'::jsonb,
 '["过于谦虚","难以接受表扬","过度自我牺牲","难以应对变化","过于在意他人"]'::jsonb,
 '["ESFP","ESTP"]'::jsonb,
 '["ENTP","ENTJ"]'::jsonb,
 '["护士","教师、社工","行政助理","办公室经理","图书管理员","咨询师"]'::jsonb,
 '["特蕾莎修女","金·卡戴珊","罗莎·帕克斯","埃尔顿·约翰","布拉德·皮特"]'::jsonb
),

('ESTJ', '总经理', '📊', '哨兵', '出色的管理者',
 '擅长管理事务和人。注重效率、组织能力强，追求秩序和成果。',
 '["组织能力强","果断直接","值得信赖","系统思维","责任心强"]'::jsonb,
 '["过于固执","忽视情感","不够灵活","好控制","难以接受新事物"]'::jsonb,
 '["ISFJ","ISTJ"]'::jsonb,
 '["INFP","ENFP"]'::jsonb,
 '["经理","法官","银行家","医院管理员","学校校长","工程项目主管"]'::jsonb,
 '["山姆·沃尔顿","弗兰克·辛纳特拉","约翰·D·洛克菲勒","米歇尔·奥巴马","艾维·李"]'::jsonb
),

('ESFJ', '执政官', '🤝', '哨兵', '热心肠的社区凝聚者',
 '关心他人的感受，用实际行动传递温暖和爱。受欢迎、有爱心。',
 '["关心他人","善于交际","组织能力","责任心强","体贴入微"]'::jsonb,
 '["过于在意他人看法","难以接受批评","回避争论","过于传统","情绪化"]'::jsonb,
 '["ISFJ","ISTJ"]'::jsonb,
 '["INTP","INTJ"]'::jsonb,
 '["护士","教师","销售经理","活动策划","人力资源","社区协调员"]'::jsonb,
 '["泰勒·斯威夫特","比尔·克林顿","珍妮弗·洛佩兹","休·杰克曼","戴安娜王妃"]'::jsonb
),

-- 探险家组
('ISTP', '鉴赏家', '🔧', '探险家', '冷静利落的实用主义高手',
 '观察力敏锐，擅长用最少的资源解决最复杂的问题。动手能力强、冷静。',
 '["动手能力强","冷静理性","适应力强","观察细致","独立自主"]'::jsonb,
 '["情感淡漠","难以承诺","容易厌倦","私密内敛","固执己见"]'::jsonb,
 '["ESTJ","ENTJ"]'::jsonb,
 '["ENFJ","INFJ"]'::jsonb,
 '["工程师","飞行员","警察","外科医生","电工","赛车手"]'::jsonb,
 '["克林特·伊斯特伍德","迈克尔·乔丹","布鲁斯·李","詹姆斯·迪恩","安吉丽娜·朱莉"]'::jsonb
),

('ISFP', '探险家', '🎭', '探险家', '灵动自由的艺术灵魂',
 '用行动而非语言表达内心，活在当下，享受美好的感官体验。',
 '["富有魅力","体贴温柔","艺术感强","灵活开放","忠诚热情"]'::jsonb,
 '["过于敏感","难以远见","回避冲突","过度自我批评","无法应对压力"]'::jsonb,
 '["ESFJ","ENFJ"]'::jsonb,
 '["ENTJ","INTJ"]'::jsonb,
 '["设计师","音乐家","厨师","护士","摄影师","时装设计师"]'::jsonb,
 '["迈克尔·杰克逊","玛丽莲·梦露","奥黛丽·赫本","大卫·鲍伊","凯特·布兰切特"]'::jsonb
),

('ESTP', '企业家', '🚀', '探险家', '行动派的魅力冒险家',
 '思维敏捷，善于把握机会，总能在混乱中找到最优解。',
 '["行动力强","适应能力强","魅力四射","解决问题能力强","善于观察"]'::jsonb,
 '["缺乏耐心","冲动鲁莽","漠视规则","不擅长理论","情绪化"]'::jsonb,
 '["ISFJ","ISTJ"]'::jsonb,
 '["INFJ","INTJ"]'::jsonb,
 '["销售","警察","演员","运动员","商人","急救医生"]'::jsonb,
 '["唐纳德·特朗普","麦当娜","欧内斯特·海明威","杰克·尼科尔森","艾迪·墨菲"]'::jsonb
),

('ESFP', '表演者', '🎉', '探险家', '活力四射的生命派对主角',
 '天生的表演者，用无尽热情和欢笑点亮身边的每一个人。',
 '["充满活力","善于社交","实用灵活","观察人心","享受生活"]'::jsonb,
 '["容易分心","厌倦例行","冲动消费","回避困难","过于在乎他人"]'::jsonb,
 '["ISFJ","ISTJ"]'::jsonb,
 '["INTJ","INFJ"]'::jsonb,
 '["演员","活动策划","旅游顾问","健身教练","时尚博主","主持人"]'::jsonb,
 '["阿黛尔","里奥纳多·迪卡普里奥","杰米·福克斯","查理·卓别林","成龙"]'::jsonb
);

-- 8.2 插入60道题目
-- E/I 维度 (0-14)
INSERT INTO questions (question_id, dimension, dimension_order, question_text, option_a, option_b, score_a, score_b) VALUES
(0, 'EI', 1, '在一次大型聚会之后，你通常感觉如何？', '精力充沛，意犹未尽', '有些疲惫，需要独处恢复', 2, 0),
(1, 'EI', 2, '你更喜欢哪种工作环境？', '开放式办公室，随时可以交流', '独立空间，可以专注思考', 2, 0),
(2, 'EI', 3, '当你遇到难题时，你通常会...', '和朋友或同事讨论，集思广益', '独自思考，想清楚再说', 2, 0),
(3, 'EI', 4, '周末你更愿意如何度过？', '参加朋友聚会或社交活动', '待在家里看书或做自己的事', 2, 0),
(4, 'EI', 5, '在你不熟悉的人群中，你会...', '主动出击，认识新朋友', '等待他人来主动交谈', 2, 0),
(5, 'EI', 6, '你通常是如何"充电"的？', '与他人互动，社交活动', '独处，给自己安静的时间', 2, 0),
(6, 'EI', 7, '你更倾向于哪种沟通方式？', '直接面对面交谈', '文字消息或电子邮件', 2, 0),
(7, 'EI', 8, '在课堂或会议上，你更可能...', '主动发言，分享观点', '只在有把握时才开口', 2, 0),
(8, 'EI', 9, '你的朋友圈是怎样的？', '朋友很多，各种类型的人都有', '朋友不多，但关系都很深厚', 2, 0),
(9, 'EI', 10, '你在工作中喜欢...', '多任务并行，保持活跃', '一次专注做好一件事', 2, 0),
(10, 'EI', 11, '别人眼中的你通常是...', '开朗、健谈、外向', '安静、沉稳、内敛', 2, 0),
(11, 'EI', 12, '当你感到压力时，你会...', '找人倾诉，寻求支持', '独自处理，需要空间', 2, 0),
(12, 'EI', 13, '对于"一个人旅行"你觉得...', '可以，但更喜欢和朋友同行', '太好了，享受自由独处的感觉', 2, 0),
(13, 'EI', 14, '在团队合作中，你更喜欢...', '在讨论中碰撞想法', '独立完成自己的部分', 2, 0),
(14, 'EI', 15, '对于社交媒体，你更倾向于...', '频繁更新，分享生活点滴', '很少发帖，更多是浏览', 2, 0),

-- S/N 维度 (15-29)
(15, 'SN', 1, '在阅读文章时，你更感兴趣的是...', '具体的事实、数据和实例', '背后的理论和宏观含义', 2, 0),
(16, 'SN', 2, '你更相信...', '亲身经历和已验证的事实', '直觉和对未来的预感', 2, 0),
(17, 'SN', 3, '在学习新技能时，你倾向于...', '按步骤从基础开始学', '先了解大局，再填充细节', 2, 0),
(18, 'SN', 4, '面对一个项目，你会...', '制定详细计划，按部就班', '先有整体构想，细节边做边定', 2, 0),
(19, 'SN', 5, '你更擅长...', '记住细节和具体信息', '把握规律、发现关联和可能性', 2, 0),
(20, 'SN', 6, '描述自己时，你更认为自己是...', '脚踏实地的务实派', '富有想象力的理想派', 2, 0),
(21, 'SN', 7, '在工作中，你更喜欢...', '有明确指导和操作规程的任务', '可以自由探索和发挥创意的任务', 2, 0),
(22, 'SN', 8, '谈到未来，你更倾向于...', '考虑当下的实际情况', '畅想各种可能性', 2, 0),
(23, 'SN', 9, '你对历史更感兴趣的是...', '具体的事件、人物和时间线', '历史背后的模式和规律', 2, 0),
(24, 'SN', 10, '做决定时，你更依赖...', '过去的经验和已有的证据', '对未来的预感和直觉', 2, 0),
(25, 'SN', 11, '你描述一件事时倾向于...', '具体准确，细节详细', '抽象概括，重点突出', 2, 0),
(26, 'SN', 12, '对于创意性的工作，你觉得...', '更喜欢有具体标准和参考的任务', '喜欢开放性任务，自由发挥', 2, 0),
(27, 'SN', 13, '学习时你更注重...', '掌握已有的知识体系', '提出新的问题和假设', 2, 0),
(28, 'SN', 14, '对于"理论"，你的态度是...', '只有实用才有意义', '本身就很有趣，值得探索', 2, 0),
(29, 'SN', 15, '你的思维方式更像...', '现实的地图，记录已知世界', '望远镜，探索未知可能', 2, 0),

-- T/F 维度 (30-44)
(30, 'TF', 1, '做重大决定时，你更依靠...', '逻辑分析和客观事实', '个人价值观和对他人的影响', 2, 0),
(31, 'TF', 2, '当朋友向你倾诉问题时，你通常...', '给出分析和解决建议', '先表示理解和情感支持', 2, 0),
(32, 'TF', 3, '你更容易被什么样的人吸引？', '智慧、能力强、理性的人', '温暖、善良、有同理心的人', 2, 0),
(33, 'TF', 4, '面对批评，你通常...', '关注批评本身是否有理有据', '先在意对方是否尊重自己的感受', 2, 0),
(34, 'TF', 5, '你认为好的领导者应该...', '客观公正，基于能力做决策', '关心团队感受，维护关系和谐', 2, 0),
(35, 'TF', 6, '在争论中，你更倾向于...', '坚持逻辑，即便会伤害感情', '考虑他人感受，避免激烈冲突', 2, 0),
(36, 'TF', 7, '你觉得批评别人时...', '应该直接指出问题，这样更有帮助', '应该委婉措辞，避免伤害感情', 2, 0),
(37, 'TF', 8, '对你来说，"正确"还是"和谐"更重要？', '正确，真相最重要', '和谐，关系更珍贵', 2, 0),
(38, 'TF', 9, '你更容易被感动于...', '逻辑严密、精妙的论述', '真实感人的情感故事', 2, 0),
(39, 'TF', 10, '在团队中，你更擅长...', '分析问题，提出理性方案', '激励成员，增强团队凝聚力', 2, 0),
(40, 'TF', 11, '你认为公平意味着...', '每人按规则和能力得到应得的', '每人都被平等善待，感受被尊重', 2, 0),
(41, 'TF', 12, '做决定时，你最担心...', '犯逻辑错误，做出不理性的判断', '伤害他人或破坏重要的关系', 2, 0),
(42, 'TF', 13, '看到他人犯错，你会...', '直接指出，帮助对方改进', '先照顾情绪，再委婉提醒', 2, 0),
(43, 'TF', 14, '你欣赏的品质更倾向于...', '能力、智慧、效率', '善良、体贴、温柔', 2, 0),
(44, 'TF', 15, '对于"心软"，你的看法是...', '有时会妨碍正确决策', '是一种可贵的品质', 2, 0),

-- J/P 维度 (45-59)
(45, 'JP', 1, '你的桌面通常是...', '整洁有序，一切各归其位', '随性一些，知道东西在哪就够了', 2, 0),
(46, 'JP', 2, '对于旅行计划，你更倾向于...', '提前规划好行程和住宿', '走到哪算哪，随机应变', 2, 0),
(47, 'JP', 3, '面对截止日期，你通常...', '提前完成，避免最后冲刺', '有时候压线，但结果也不差', 2, 0),
(48, 'JP', 4, '你更喜欢哪种工作方式？', '有明确目标和时间节点的计划性工作', '灵活多变、可以随时调整的工作', 2, 0),
(49, 'JP', 5, '临时改变计划，你会...', '感到烦躁，希望一切按计划进行', '觉得还好，甚至喜欢意外的可能', 2, 0),
(50, 'JP', 6, '你的日常生活更...', '有规律，固定的作息和习惯', '随机应变，每天可能不一样', 2, 0),
(51, 'JP', 7, '购物时，你通常...', '提前列好清单，按需购买', '看到喜欢的就买', 2, 0),
(52, 'JP', 8, '在完成一项任务时，你...', '喜欢有清晰的阶段和检查节点', '更喜欢在截止前一气呵成', 2, 0),
(53, 'JP', 9, '面对选择，你通常...', '希望快速决定，不喜欢悬而未决', '愿意保留选项，多考虑一会儿', 2, 0),
(54, 'JP', 10, '你的时间管理是...', '精打细算，合理安排每一个小时', '比较自由，感觉时间差不多就行', 2, 0),
(55, 'JP', 11, '新的项目开始时，你...', '立即制定计划和时间表', '先了解情况，等感觉来了再动手', 2, 0),
(56, 'JP', 12, '你对"完成"的定义是...', '全部按计划完成，没有遗漏', '大体上做完，不纠结完美', 2, 0),
(57, 'JP', 13, '工作中的规则和流程，你认为...', '很重要，保证质量和一致性', '有时过于僵化，灵活变通更好', 2, 0),
(58, 'JP', 14, '你更擅长...', '坚持长期计划，有始有终', '快速应对突发情况', 2, 0),
(59, 'JP', 15, '你更向往哪种生活方式？', '井然有序、规律充实的生活', '自由随性、充满可能性的生活', 2, 0);

-- ============================================
-- 9. 数据验证查询
-- ============================================

-- 验证数据完整性
SELECT 'MBTI类型数量' as check_item, COUNT(*) as count FROM mbti_types;
SELECT '题目数量' as check_item, COUNT(*) as count FROM questions;
SELECT 'EI维度题目' as check_item, COUNT(*) as count FROM questions WHERE dimension = 'EI';
SELECT 'SN维度题目' as check_item, COUNT(*) as count FROM questions WHERE dimension = 'SN';
SELECT 'TF维度题目' as check_item, COUNT(*) as count FROM questions WHERE dimension = 'TF';
SELECT 'JP维度题目' as check_item, COUNT(*) as count FROM questions WHERE dimension = 'JP';

-- ============================================
-- 10. 权限设置（可选）
-- ============================================

-- 创建应用用户
-- CREATE USER mbti_app WITH PASSWORD 'your_password_here';
-- GRANT CONNECT ON DATABASE mbti_test TO mbti_app;
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO mbti_app;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO mbti_app;
-- GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO mbti_app;

-- 创建只读用户
-- CREATE USER mbti_readonly WITH PASSWORD 'your_password_here';
-- GRANT CONNECT ON DATABASE mbti_test TO mbti_readonly;
-- GRANT SELECT ON ALL TABLES IN SCHEMA public TO mbti_readonly;

-- ============================================
-- 11. 完成
-- ============================================

-- 输出初始化完成信息
SELECT 'Database initialization completed!' as status;
