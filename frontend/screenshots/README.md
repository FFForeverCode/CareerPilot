# 第 3 周页面截图（矩阵图 1～图 13）

对照 `文档/02-需求跟踪矩阵/需求跟踪矩阵说明.md`。把下列 PNG 按编号贴进 Excel「详细说明」里的图 1～图 13；图 14 仍放全站规则，不要改编号。

| 文件 | 矩阵图 | 对应路由 |
| --- | --- | --- |
| `01-login.png` | 图1 登录界面 | `/login` |
| `02-register.png` | 图2 注册界面 | `/login/register` |
| `03-home.png` | 图3 学生首页 | `/home` |
| `04-profile.png` | 图4 学业档案 | `/profile` |
| `05-assessment.png` | 图5 测评作答 | `/assessment` |
| `06-assessment-result.png` | 图6 测评结果 | `/assessment/result` |
| `07-chat.png` | 图7 规划对话 | `/chat` |
| `08-plan-detail.png` | 图8 方案详情 | `/plans/:id` |
| `09-plans.png` | 图9 我的方案 | `/plans` |
| `10-directions.png` | 图10 方向与收藏 | `/directions` |
| `11-teacher-students.png` | 图11 学生方案（老师） | `/teacher/students` |
| `12-admin-library.png` | 图12 题目与方向 | `/admin/library` |
| `13-admin-ops.png` | 图13 公告、参数、统计、日志 | `/admin/ops?tab=stats` |

截取日期：2026-11-20。运行中的页面：`npm.cmd run dev` → `http://127.0.0.1:5173`。

走查快捷登录：`/login?demo=student`、`/login?demo=teacher`、`/login?demo=admin`。老师打开某生：`/teacher/students?studentId=1`。
