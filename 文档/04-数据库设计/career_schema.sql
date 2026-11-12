-- CareerPilot 数据库建表脚本（SQLite 3）
-- 项目：基于 AI 智能体的大学生职业生涯规划系统，SE2313-01
-- 依据：需求定义书-开发周期节奏.md（V1.2）第 8 章、任务清单.md 第 9 章、全部 111 条 RTM
-- 使用：空库首次执行；脚本可重复执行（IF NOT EXISTS），不会改动已有数据
-- 约定：主键 INTEGER 自增，外键 INTEGER，其余文本与时间 TEXT，时间格式 'YYYY-MM-DD HH:MM:SS'（本地时间）
-- 注意：SQLite 的外键约束依赖连接级 PRAGMA，应用启动时必须对每个连接执行 PRAGMA foreign_keys = ON;

PRAGMA foreign_keys = ON;

-- ============================================================
-- 1. sys_user 用户账号（学生 / 就业指导老师 / 系统管理员）
-- ============================================================
CREATE TABLE IF NOT EXISTS sys_user (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  student_no    TEXT    NOT NULL UNIQUE
                CHECK (student_no GLOB '[0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9]'),
  password_hash TEXT    NOT NULL
                CHECK (length(password_hash) = 60 AND password_hash GLOB '$2*'),
  role          TEXT    NOT NULL CHECK (role IN ('student', 'teacher', 'admin')),
  real_name     TEXT    NOT NULL CHECK (length(real_name) BETWEEN 1 AND 20),
  status        INTEGER NOT NULL DEFAULT 1 CHECK (status IN (0, 1)),
  fail_count    INTEGER NOT NULL DEFAULT 0 CHECK (fail_count BETWEEN 0 AND 5),
  locked_until  TEXT,
  created_at    TEXT    NOT NULL DEFAULT (datetime('now', 'localtime')),
  updated_at    TEXT    NOT NULL DEFAULT (datetime('now', 'localtime'))
);
CREATE INDEX IF NOT EXISTS idx_user_role ON sys_user (role);

-- ============================================================
-- 2. student_profile 学业档案（一个学生一条）
--    姓名取 sys_user.real_name；complete_flag 由应用按四项必填计算
-- ============================================================
CREATE TABLE IF NOT EXISTS student_profile (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id       INTEGER NOT NULL UNIQUE REFERENCES sys_user (id) ON DELETE CASCADE,
  grade         TEXT    CHECK (grade IS NULL OR length(grade) <= 10),
  major         TEXT    CHECK (major IS NULL OR length(major) <= 40),
  rank_band     TEXT    NOT NULL DEFAULT '未填'
                CHECK (rank_band IN ('前 30%', '中游', '后 30%', '未填')),
  preference    TEXT    CHECK (preference IS NULL
                OR preference IN ('就业', '考研', '考公', '创业', '还没想好')),
  gender        TEXT    CHECK (gender IS NULL OR length(gender) <= 4),
  class_name    TEXT    CHECK (class_name IS NULL OR length(class_name) <= 20),
  phone         TEXT    CHECK (phone IS NULL OR length(phone) <= 20),
  email         TEXT    CHECK (email IS NULL OR length(email) <= 60),
  city          TEXT    CHECK (city IS NULL OR length(city) <= 20),
  intro         TEXT    CHECK (intro IS NULL OR length(intro) <= 300),
  complete_flag INTEGER NOT NULL DEFAULT 0 CHECK (complete_flag IN (0, 1)),
  created_at    TEXT    NOT NULL DEFAULT (datetime('now', 'localtime')),
  updated_at    TEXT    NOT NULL DEFAULT (datetime('now', 'localtime'))
);

-- ============================================================
-- 3. assessment_question 测评题目（每题两个选项，类型不同且都属于 RIASEC）
--    是否已有人作答不在本表存，按 assessment_answer 是否存在判断
-- ============================================================
CREATE TABLE IF NOT EXISTS assessment_question (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  stem        TEXT    NOT NULL CHECK (length(stem) BETWEEN 1 AND 200),
  option_a    TEXT    NOT NULL CHECK (length(option_a) BETWEEN 1 AND 100),
  option_b    TEXT    NOT NULL CHECK (length(option_b) BETWEEN 1 AND 100),
  type_a      TEXT    NOT NULL CHECK (type_a IN ('R', 'I', 'A', 'S', 'E', 'C')),
  type_b      TEXT    NOT NULL CHECK (type_b IN ('R', 'I', 'A', 'S', 'E', 'C')),
  sort_no     INTEGER NOT NULL DEFAULT 0,
  enabled     INTEGER NOT NULL DEFAULT 1 CHECK (enabled IN (0, 1)),
  created_at  TEXT    NOT NULL DEFAULT (datetime('now', 'localtime')),
  updated_at  TEXT    NOT NULL DEFAULT (datetime('now', 'localtime')),
  CHECK (type_a <> type_b)
);
CREATE INDEX IF NOT EXISTS idx_question_enabled ON assessment_question (enabled, sort_no);

-- ============================================================
-- 4. assessment_result 一次测评结果（每人只保留最近 3 次，由应用删除最早一条）
-- ============================================================
CREATE TABLE IF NOT EXISTS assessment_result (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id    INTEGER NOT NULL REFERENCES sys_user (id) ON DELETE CASCADE,
  score_r    INTEGER NOT NULL DEFAULT 0 CHECK (score_r BETWEEN 0 AND 24),
  score_i    INTEGER NOT NULL DEFAULT 0 CHECK (score_i BETWEEN 0 AND 24),
  score_a    INTEGER NOT NULL DEFAULT 0 CHECK (score_a BETWEEN 0 AND 24),
  score_s    INTEGER NOT NULL DEFAULT 0 CHECK (score_s BETWEEN 0 AND 24),
  score_e    INTEGER NOT NULL DEFAULT 0 CHECK (score_e BETWEEN 0 AND 24),
  score_c    INTEGER NOT NULL DEFAULT 0 CHECK (score_c BETWEEN 0 AND 24),
  top1       TEXT    NOT NULL CHECK (top1 IN ('R', 'I', 'A', 'S', 'E', 'C')),
  top2       TEXT    NOT NULL CHECK (top2 IN ('R', 'I', 'A', 'S', 'E', 'C')),
  tie_flag   INTEGER NOT NULL DEFAULT 0 CHECK (tie_flag IN (0, 1)),
  created_at TEXT    NOT NULL DEFAULT (datetime('now', 'localtime')),
  CHECK (top1 <> top2)
);
CREATE INDEX IF NOT EXISTS idx_result_user ON assessment_result (user_id, created_at DESC);

-- ============================================================
-- 5. assessment_answer 作答明细（删除结果时级联删除；题目被作答后不能物理删除）
-- ============================================================
CREATE TABLE IF NOT EXISTS assessment_answer (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  result_id     INTEGER NOT NULL REFERENCES assessment_result (id) ON DELETE CASCADE,
  question_id   INTEGER NOT NULL REFERENCES assessment_question (id) ON DELETE RESTRICT,
  chosen_option TEXT    NOT NULL CHECK (chosen_option IN ('A', 'B')),
  UNIQUE (result_id, question_id)
);
CREATE INDEX IF NOT EXISTS idx_answer_question ON assessment_answer (question_id);

-- ============================================================
-- 6. chat_session 对话会话（删除只改 deleted_flag，不物理删除）
-- ============================================================
CREATE TABLE IF NOT EXISTS chat_session (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id      INTEGER NOT NULL REFERENCES sys_user (id) ON DELETE CASCADE,
  title        TEXT    NOT NULL DEFAULT '新的规划对话'
               CHECK (length(title) BETWEEN 1 AND 20),
  deleted_flag INTEGER NOT NULL DEFAULT 0 CHECK (deleted_flag IN (0, 1)),
  created_at   TEXT    NOT NULL DEFAULT (datetime('now', 'localtime')),
  updated_at   TEXT    NOT NULL DEFAULT (datetime('now', 'localtime'))
);
CREATE INDEX IF NOT EXISTS idx_session_user ON chat_session (user_id, deleted_flag, id);

-- ============================================================
-- 7. chat_message 会话消息（老师接口和统计接口的查询不得 SELECT content）
-- ============================================================
CREATE TABLE IF NOT EXISTS chat_message (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id INTEGER NOT NULL REFERENCES chat_session (id) ON DELETE CASCADE,
  sender     TEXT    NOT NULL CHECK (sender IN ('user', 'assistant')),
  content    TEXT    NOT NULL CHECK (length(content) BETWEEN 1 AND 500),
  mock_flag  INTEGER NOT NULL DEFAULT 0 CHECK (mock_flag IN (0, 1)),
  created_at TEXT    NOT NULL DEFAULT (datetime('now', 'localtime'))
);
CREATE INDEX IF NOT EXISTS idx_message_session ON chat_message (session_id, id);

-- ============================================================
-- 8. career_plan 职业生涯规划方案（每人最多 5 份，由应用校验）
--    source=model 真实模型；source=mock 模拟回复
-- ============================================================
CREATE TABLE IF NOT EXISTS career_plan (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id    INTEGER NOT NULL REFERENCES sys_user (id) ON DELETE CASCADE,
  session_id INTEGER REFERENCES chat_session (id) ON DELETE SET NULL,
  content    TEXT    NOT NULL CHECK (length(content) BETWEEN 1 AND 5000),
  source     TEXT    NOT NULL CHECK (source IN ('model', 'mock')),
  created_at TEXT    NOT NULL DEFAULT (datetime('now', 'localtime'))
);
CREATE INDEX IF NOT EXISTS idx_plan_user ON career_plan (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_plan_session ON career_plan (session_id);

-- ============================================================
-- 9. direction_item 方向库（名称唯一；没有薪资字段；只下架不物理删除）
--    holland_tags 形如 'I' 或 'I,C'；action_text 两条在校可做的事，用换行分隔
-- ============================================================
CREATE TABLE IF NOT EXISTS direction_item (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  name         TEXT    NOT NULL UNIQUE CHECK (length(name) BETWEEN 1 AND 20),
  category     TEXT    NOT NULL CHECK (category IN ('就业', '考研', '考公', '创业')),
  holland_tags TEXT    NOT NULL
               CHECK (holland_tags GLOB '[RIASEC]' OR holland_tags GLOB '[RIASEC],[RIASEC]'),
  summary      TEXT    NOT NULL CHECK (length(summary) BETWEEN 1 AND 200),
  action_text  TEXT    NOT NULL
               CHECK (length(action_text) - length(replace(action_text, char(10), '')) = 1),
  status       INTEGER NOT NULL DEFAULT 1 CHECK (status IN (0, 1)),
  created_at   TEXT    NOT NULL DEFAULT (datetime('now', 'localtime')),
  updated_at   TEXT    NOT NULL DEFAULT (datetime('now', 'localtime'))
);
CREATE INDEX IF NOT EXISTS idx_direction_status ON direction_item (status, category);

-- ============================================================
-- 10. user_favorite 方向收藏（一个学生对一个方向只有一条）
-- ============================================================
CREATE TABLE IF NOT EXISTS user_favorite (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id      INTEGER NOT NULL REFERENCES sys_user (id) ON DELETE CASCADE,
  direction_id INTEGER NOT NULL REFERENCES direction_item (id) ON DELETE RESTRICT,
  created_at   TEXT    NOT NULL DEFAULT (datetime('now', 'localtime')),
  UNIQUE (user_id, direction_id)
);
CREATE INDEX IF NOT EXISTS idx_favorite_direction ON user_favorite (direction_id);

-- ============================================================
-- 11. plan_comment 老师评语（一个方案只留最新一条，覆盖由应用确认）
-- ============================================================
CREATE TABLE IF NOT EXISTS plan_comment (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  plan_id    INTEGER NOT NULL UNIQUE REFERENCES career_plan (id) ON DELETE CASCADE,
  teacher_id INTEGER NOT NULL REFERENCES sys_user (id) ON DELETE RESTRICT,
  content    TEXT    NOT NULL CHECK (length(content) BETWEEN 1 AND 200),
  created_at TEXT    NOT NULL DEFAULT (datetime('now', 'localtime'))
);
CREATE INDEX IF NOT EXISTS idx_comment_teacher ON plan_comment (teacher_id);

-- ============================================================
-- 12. announcement 公告（标题 40 字、正文 500 字；置顶排前；下线不删）
-- ============================================================
CREATE TABLE IF NOT EXISTS announcement (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  title      TEXT    NOT NULL CHECK (length(title) BETWEEN 1 AND 40),
  content    TEXT    NOT NULL CHECK (length(content) BETWEEN 1 AND 500),
  pinned     INTEGER NOT NULL DEFAULT 0 CHECK (pinned IN (0, 1)),
  offline    INTEGER NOT NULL DEFAULT 0 CHECK (offline IN (0, 1)),
  created_at TEXT    NOT NULL DEFAULT (datetime('now', 'localtime')),
  updated_at TEXT    NOT NULL DEFAULT (datetime('now', 'localtime'))
);
CREATE INDEX IF NOT EXISTS idx_announcement_list ON announcement (offline, pinned DESC, id DESC);

-- ============================================================
-- 13. sys_config 模型参数（单行表；没有密钥字段，密钥只放环境变量）
-- ============================================================
CREATE TABLE IF NOT EXISTS sys_config (
  id              INTEGER PRIMARY KEY CHECK (id = 1),
  api_url         TEXT    NOT NULL,
  model_name      TEXT    NOT NULL,
  timeout_seconds INTEGER NOT NULL DEFAULT 30 CHECK (timeout_seconds BETWEEN 5 AND 60),
  assistant_on    INTEGER NOT NULL DEFAULT 1 CHECK (assistant_on IN (0, 1)),
  mock_on         INTEGER NOT NULL DEFAULT 0 CHECK (mock_on IN (0, 1)),
  disclaimer      TEXT    NOT NULL,
  updated_at      TEXT    NOT NULL DEFAULT (datetime('now', 'localtime'))
);

-- ============================================================
-- 14. operation_log 关键操作日志（只增不改；没有聊天正文字段）
--     只记录：登录、重置密码、生成方案、删除方案、改题目、改方向、改参数
-- ============================================================
CREATE TABLE IF NOT EXISTS operation_log (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id     INTEGER REFERENCES sys_user (id) ON DELETE SET NULL,
  action      TEXT    NOT NULL CHECK (action IN ('登录', '重置密码', '生成方案', '删除方案', '改题目', '改方向', '改参数')),
  target_type TEXT,
  target_id   TEXT,
  client_ip   TEXT,
  created_at  TEXT    NOT NULL DEFAULT (datetime('now', 'localtime'))
);
CREATE INDEX IF NOT EXISTS idx_log_user ON operation_log (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_log_action ON operation_log (action, created_at DESC);
