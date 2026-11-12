-- CareerPilot 数据库验收查询（SQLite 3）
-- 用途：第 4 周用例 52「删除数据库后可以重建种子数据」的核对；也可作为日常自检
-- 用法：sqlite3 career.db < career_check.sql
-- 期望值写在每条的注释里，结果行应与之相同

.headers on
.mode column

-- 1. 建表数量：应为 14（另有 sqlite_sequence 属内部表，不计）
SELECT '01 表数量' AS 检查项, COUNT(*) AS 值, 14 AS 期望
FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%';

-- 2. 索引数量：应为 14（UNIQUE 自动索引不计）
SELECT '02 索引数量' AS 检查项, COUNT(*) AS 值, 14 AS 期望
FROM sqlite_master WHERE type = 'index' AND name NOT LIKE 'sqlite_%';

-- 3. 题目总数：应为 24
SELECT '03 题目总数' AS 检查项, COUNT(*) AS 值, 24 AS 期望 FROM assessment_question;

-- 4. 启用题数量：应为 24
SELECT '04 启用题数' AS 检查项, COUNT(*) AS 值, 24 AS 期望 FROM assessment_question WHERE enabled = 1;

-- 5. 两选项类型相同的题：应为 0
SELECT '05 同类型题数' AS 检查项, COUNT(*) AS 值, 0 AS 期望
FROM assessment_question WHERE type_a = type_b;

-- 6. 六型作为选项出现次数：每型应为 8
SELECT t AS 类型, COUNT(*) AS 出现次数, 8 AS 期望
FROM (
  SELECT type_a AS t FROM assessment_question
  UNION ALL
  SELECT type_b AS t FROM assessment_question
)
GROUP BY t
ORDER BY t;

-- 7. 方向总数：应不少于 8
SELECT '07 方向总数' AS 检查项, COUNT(*) AS 值, '>=8' AS 期望 FROM direction_item;

-- 8. 方向类别分布：就业、考研、考公、创业四类都要有
SELECT category AS 类别, COUNT(*) AS 条数
FROM direction_item GROUP BY category ORDER BY category;

-- 9. 方向表没有薪资字段：应为 0（按建表语句里是否出现 salary 判断）
SELECT '09 方向表薪资字段' AS 检查项, COUNT(*) AS 值, 0 AS 期望
FROM sqlite_master WHERE type = 'table' AND name = 'direction_item' AND lower(sql) LIKE '%salary%';

-- 10. 教学演示公告：置顶且正文写明实训演示，应为 1
SELECT '10 教学演示公告' AS 检查项, COUNT(*) AS 值, 1 AS 期望
FROM announcement WHERE pinned = 1 AND offline = 0 AND content LIKE '%实训演示%';

-- 11. 参数行数：应为 1
SELECT '11 参数行数' AS 检查项, COUNT(*) AS 值, 1 AS 期望 FROM sys_config;

-- 12. 参数默认值：超时 30 秒、模拟回复关闭、助手开启
SELECT '12 参数默认值' AS 检查项,
       timeout_seconds || ' / mock_on=' || mock_on || ' / assistant_on=' || assistant_on AS 值,
       '30 / mock_on=0 / assistant_on=1' AS 期望
FROM sys_config WHERE id = 1;

-- 13. 参数表没有密钥字段：应为 0
SELECT '13 参数表密钥字段' AS 检查项, COUNT(*) AS 值, 0 AS 期望
FROM sqlite_master WHERE type = 'table' AND name = 'sys_config'
  AND (lower(sql) LIKE '%apikey%' OR lower(sql) LIKE '%secret%' OR lower(sql) LIKE '%token%');

-- 14. 账号数量与角色：应为管理员、老师、学生各 1
SELECT role AS 角色, COUNT(*) AS 人数, 1 AS 期望
FROM sys_user GROUP BY role ORDER BY role;

-- 15. 密码只存 bcrypt：应为 3 条 60 位哈希，0 条明文
SELECT '15 密码格式' AS 检查项,
       SUM(CASE WHEN length(password_hash) = 60 AND password_hash LIKE '$2%' THEN 1 ELSE 0 END) AS 合规条数,
       COUNT(*) AS 账号数
FROM sys_user;

-- 16. 外键检查：应返回 0 行
PRAGMA foreign_key_check;

-- 17. 完整性检查：应为 ok
PRAGMA integrity_check;
