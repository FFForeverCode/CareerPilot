# 第 3 周前端走查清单（2026-11-20）

对照 `任务清单.md` 第 7.3 节。启动：

```powershell
cd frontend
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
npm.cmd run dev
```

> PowerShell 若禁止脚本，请用 `npm.cmd` 而不是 `npm`。

快捷登录（走查/截图）：

- `/login?demo=student`
- `/login?demo=teacher`
- `/login?demo=admin`
- 老师打开学生：`/teacher/students?studentId=1`

截图已落盘：`frontend/screenshots/`（见该目录 README，对应矩阵图 1～图 13）。

## 公共

- [x] 三个色值：主色 `#1F4E79`、强调色 `#C47B3A`、背景 `#F6F4F1`（CSS 变量已用）
- [x] 登录页 / 首页 / 方案详情可见「教学演示」
- [x] 学生菜单无管理、日志、重置密码
- [x] 老师页无「查看对话」

## 陈晓飞：登录 / 档案 / 菜单

- [x] 登录标题「学生登录」，注册标题「学生注册」，可切换（截图 01、02）
- [x] 学号非 11 位、密码不合规有中文提示（校验文案已在表单）
- [x] 档案缺项提示；四项齐全后完成标记变化（截图 04）
- [x] 角色菜单正确（学生 / 老师 / 管理员三套）
- [ ] 本人签字确认（周五收口）

## 高研：测评

- [x] 一次展示全部启用题（截图 05，24 题）
- [x] 结果页前两型 + T-03 原文（截图 06）
- [x] 六型得分可见
- [ ] 本人签字确认

## 辛译维：对话

- [x] 顶部 T-01 固定（截图 07）
- [x] 未测评可见 T-04，仍可聊天（逻辑已实现；演示账号已测评则不显示）
- [x] 管理员打开模拟回复后出现 T-05 黄条（开关在 `/admin/ops?tab=config`；关闭时有引导提示）
- [x] 生成按钮旁只写缺少的前置条件
- [x] 超过 500 字拒绝发送
- [ ] 本人签字确认

## 陈清驰：方案 / 老师

- [x] 方案四个标题原样；正文不可编辑（截图 08）
- [x] 删除需确认（我的方案删除弹窗）
- [x] 老师页按姓名/学号查；无查看对话（截图 11）
- [ ] 本人签字确认

## 范雨涵：方向 / 管理 / 截图

- [x] 推荐理由模板、无薪资（截图 10）
- [x] 统计四个卡片；参数页无密钥框（截图 13）
- [x] 打印只在方案详情，预览去掉侧栏
- [x] 截图已放入 `frontend/screenshots/`（01～13）
- [ ] 粘贴进矩阵 Excel 图 1～图 13 并本人签字

## 本次自检结论（2026-11-20）

| 项 | 结论 |
| --- | --- |
| `npm run build` | 通过 |
| 方案详情角色布局 | RoleAwareLayout |
| 接口封装层 | 全部视图经 `src/api`（含 admin / teacher / meta） |
| 矩阵截图素材 | 已截 13 张至 `frontend/screenshots/` |
| Excel 粘贴与全员签字 | 待范雨涵贴图、各成员签字 |
