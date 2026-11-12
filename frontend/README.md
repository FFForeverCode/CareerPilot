# CareerPilot 前端（Vue 3）

对应任务清单 ENG-01 / ENG-10。本阶段用本地 mock 假数据，按主链路点通 12 个路由；规则移植自 `prototype/`。

## 技术栈

Vue 3 + TypeScript + Vite + Vue Router + Pinia + Axios + Element Plus

## 启动

需要本机已安装 Node.js 18+（推荐 LTS）。

```powershell
cd frontend
npm install
npm run dev
```

浏览器打开终端提示的本地地址（默认 http://127.0.0.1:5173）。

```powershell
npm run build    # 生产构建
npm run preview  # 预览构建产物
```

开发代理：`/api` → `http://localhost:8080`（第 5 周接 Spring Boot 时使用）。当前业务调用走 `src/mock/`，Axios 客户端在 `src/api/client.ts` 预留。

## 演示账号

密码不写在页面常驻区域，开发期登录页提供快捷登录按钮。

| 角色 | 学号 | 密码 |
| --- | --- | --- |
| 学生 | 20230001001 | Stu123456 |
| 老师 | 20230009001 | Tea123456 |
| 管理员 | 20230000001 | Adm123456 |

主链路演示前，请先用管理员打开「模拟回复开关」并保存，再回学生端对话与生成方案。

## 路由

| 路径 | 页面 |
| --- | --- |
| `/login`、`/login/register` | P-01 |
| `/home` | P-02 |
| `/profile` | P-03 |
| `/assessment` | P-04 |
| `/assessment/result` | P-05 |
| `/chat` | P-06 |
| `/plans/:id` | P-07 |
| `/plans` | P-08 |
| `/directions` | P-09 |
| `/teacher/students` | P-10 |
| `/admin/library` | P-11 |
| `/admin/ops` | P-12 |

## 目录要点

```text
src/layouts/          学生布局 / 管理布局
src/views/            12 个页面
src/mock/             假数据与业务规则（对齐 prototype）
src/api/client.ts     Axios 预留
src/assets/styles/    视觉基线（主色 #1F4E79 等）
```

接口能力合同见仓库 `文档/05-接口设计/接口说明.md`。
