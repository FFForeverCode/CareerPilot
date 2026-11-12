/* CareerPilot 产品原型 · 种子数据
   所有姓名、学号、方向、方案均为虚构，仅用于教学演示。 */
(function () {
  'use strict';

  /* 需求基线第 4 节：必须逐字使用的固定原文 */
  var TEXTS = {
    T01: '内容仅供规划参考，不代表学校官方意见。',
    T02: '教学演示',
    T03: '本结果只反映本次作答倾向，不能作为心理诊断、保研或录用依据。',
    T04: '尚未测评，生成方案前需要先完成测评。',
    T05: '当前为模拟回复，不是模型生成。',
    T06: '新的规划对话',
    T07: '题目维护中',
    T08: '助手维护中',
    T09_LIST: ['【当前情况】', '【可选方向】', '【在校安排】', '【待确认问题】'],
    T10: '与你本次测评靠前的类型以及档案里的去向偏好更接近'
  };

  var PREFERENCE_OPTIONS = ['就业', '考研', '考公', '创业', '还没想好'];
  var RANK_BAND_OPTIONS = ['前 30%', '中游', '后 30%', '未填'];
  var DIRECTION_CATEGORIES = ['就业', '考研', '考公', '创业'];
  var HOLLAND = [
    { code: 'R', name: '现实型' },
    { code: 'I', name: '研究型' },
    { code: 'A', name: '艺术型' },
    { code: 'S', name: '社会型' },
    { code: 'E', name: '企业型' },
    { code: 'C', name: '常规型' }
  ];

  /* 24 道种子题：每题两个选项，类型不同；六种类型作为选项各出现 8 次 */
  var QUESTIONS = [
    { stem: '实训分组时，你更愿意承担哪一类工作？', a: ['组装、操作设备，把东西做出来', 'R'], b: ['查阅资料，先把原理弄清楚', 'I'] },
    { stem: '拿到一台没见过的仪器，你会先怎么做？', a: ['直接上手试试，边用边摸索', 'R'], b: ['先读说明书，弄懂它的结构', 'I'] },
    { stem: '下面两种成果，哪一种更让你有成就感？', a: ['做出一个能正常运转的东西', 'R'], b: ['得出一段说得通的结论', 'I'] },
    { stem: '课余时间，你更想参加哪类活动？', a: ['动手实操类的社团或比赛', 'R'], b: ['看专业相关的分析文章和报告', 'I'] },
    { stem: '班级活动缺人时，你更可能去做哪件事？', a: ['设计海报、节目和现场呈现', 'A'], b: ['招呼同学报名、协调分工', 'S'] },
    { stem: '下面两类任务，你更愿意接哪一类？', a: ['有发挥空间的创意任务', 'A'], b: ['需要照顾他人感受的沟通任务', 'S'] },
    { stem: '哪件事更容易让你觉得“这段没白忙”？', a: ['自己的作品被人认可', 'A'], b: ['帮同学解决了实际困难', 'S'] },
    { stem: '小组展示时，你更愿意负责哪一块？', a: ['排版、配色和现场呈现', 'A'], b: ['协调组员、回答现场提问', 'S'] },
    { stem: '下面两种分工，你更愿意接哪一种？', a: ['对外联系、争取资源', 'E'], b: ['把流程和材料逐项核对清楚', 'C'] },
    { stem: '需求描述得很模糊时，你更倾向怎么做？', a: ['先定个方案，边做边推进', 'E'], b: ['先把要求和记录列清楚再动手', 'C'] },
    { stem: '下面两种能力，你更擅长哪一种？', a: ['说服别人接受自己的判断', 'E'], b: ['按规则把事情做对、做细', 'C'] },
    { stem: '未来工作时，你更看重哪一点？', a: ['能带团队把一件事做成', 'E'], b: ['流程清楚、工作稳定', 'C'] },
    { stem: '下面两种活，你更愿意干哪一种？', a: ['把一个问题的来龙去脉研究透', 'I'], b: ['把一批资料整理归档好', 'C'] },
    { stem: '面对一大堆数据，你更想先做什么？', a: ['找出里面的规律并解释它', 'I'], b: ['按统一格式录入并核对', 'C'] },
    { stem: '下面两种状态，你更享受哪一种？', a: ['长时间专注地思考一个问题', 'I'], b: ['把清单上的事逐项完成', 'C'] },
    { stem: '写课程报告时，你更愿意负责哪部分？', a: ['结论和论证过程', 'I'], b: ['校对格式和数据', 'C'] },
    { stem: '下面两种任务，你更愿意接哪一种？', a: ['安装、调试，把设备弄好用', 'R'], b: ['接待来访、解答别人的问题', 'S'] },
    { stem: '在团队里，你更常扮演哪种角色？', a: ['解决具体的技术问题', 'R'], b: ['留意成员状态、做沟通', 'S'] },
    { stem: '你更喜欢哪种做事方式？', a: ['独立完成一件看得见的作品', 'R'], b: ['在集体中为别人提供帮助', 'S'] },
    { stem: '课程实践你更想选哪一类？', a: ['设备操作、动手实训类', 'R'], b: ['志愿服务、社会服务类', 'S'] },
    { stem: '下面两件事，你更愿意先做哪一件？', a: ['提出一个新奇的点子', 'A'], b: ['把点子包装成能落地的方案', 'E'] },
    { stem: '参加比赛时，你更想负责哪一块？', a: ['创意和表达', 'A'], b: ['拉人组队和分工推进', 'E'] },
    { stem: '下面两种环境，你更喜欢哪一种？', a: ['有自由创作空间的环境', 'A'], b: ['目标明确、能看到结果的环境', 'E'] },
    { stem: '你希望未来的工作更接近哪一种？', a: ['有创作自由、能表达自己', 'A'], b: ['有明确目标和清晰回报', 'E'] }
  ];

  /* 至少 8 条方向，四类齐全；没有薪资字段 */
  var DIRECTIONS = [
    {
      name: '软件开发', category: '就业', tags: ['I', 'R'],
      summary: '面向业务需求编写和维护软件系统，是计算机专业最常见的就业方向之一，需要持续的编码练习和项目积累。',
      actions: ['独立完成一个能运行的小项目并写清设计说明', '每周固定复盘一次代码，积累可讲的实践细节']
    },
    {
      name: '软件测试', category: '就业', tags: ['C', 'I'],
      summary: '通过设计并执行测试用例保证软件质量，重视细致、耐心和流程意识，适合愿意把细节做扎实的人。',
      actions: ['系统学一遍测试基础方法，如等价类、边界值', '在课程项目里写一份测试记录和缺陷清单']
    },
    {
      name: '产品助理', category: '就业', tags: ['E', 'S'],
      summary: '协助产品经理做需求整理、原型绘制和跨团队沟通，适合愿意和人打交道、喜欢把问题梳理清楚的人。',
      actions: ['用原型工具画一次完整的功能页面', '跟一次完整的需求讨论并整理会议记录']
    },
    {
      name: '计算机升学', category: '考研', tags: ['I'],
      summary: '通过考研继续攻读计算机相关专业，需要长期稳定的复习节奏和清晰的目标院校，适合愿意深入钻研的人。',
      actions: ['确定目标院校和专业，核对考试科目', '按月份列出专业课和公共课复习计划']
    },
    {
      name: '考公计算机岗', category: '考公', tags: ['C'],
      summary: '报考对计算机专业有需求的公务员岗位，考试内容以行测、申论和岗位具体要求为主，需要提前了解专业限制。',
      actions: ['查看近两年岗位目录，确认专业和学历要求', '开始行测基础练习并做一次完整模考']
    },
    {
      name: '考公综合岗', category: '考公', tags: ['S'],
      summary: '报考不限专业或综合类岗位，更看重稳定、表达与组织协调能力，适合愿意在公共事务中服务他人的人。',
      actions: ['关注招考公告和时间线，建立自己的备考日历', '参加一次模拟面试，练习结构化表达']
    },
    {
      name: '校园技术创业', category: '创业', tags: ['E', 'I'],
      summary: '在校期间基于技术能力做小规模产品尝试，重点在验证需求和团队协作，而不是一开始就追求规模。',
      actions: ['组一个三人小组，先做一次需求访谈和验证', '做出可试用的小范围版本并收集反馈']
    },
    {
      name: '先补基础', category: '就业', tags: ['R', 'C'],
      summary: '暂时不锁定具体岗位，先把编程、数学和英语基础补齐，再根据情况选择方向，适合还没有明确偏好的人。',
      actions: ['制定一学期的补基础计划，写明每周任务', '每周记录完成情况，月末做一次复盘']
    }
  ];

  var DEMO_ACCOUNTS = {
    student: { studentNo: '20230001001', password: 'Stu123456' },
    teacher: { studentNo: '20230009001', password: 'Tea123456' },
    admin: { studentNo: '20230000001', password: 'Adm123456' }
  };

  function createSeed() {
    return {
      users: [
        { id: 1, studentNo: '20230001001', realName: '张小明', role: 'student', password: 'Stu123456', status: 1, failCount: 0, lockedUntil: 0 },
        { id: 2, studentNo: '20230002002', realName: '李思远', role: 'student', password: 'Stu123456', status: 1, failCount: 0, lockedUntil: 0 },
        { id: 3, studentNo: '20230003003', realName: '王雨晴', role: 'student', password: 'Stu123456', status: 1, failCount: 0, lockedUntil: 0 },
        { id: 4, studentNo: '20230004004', realName: '赵一鸣', role: 'student', password: 'Stu123456', status: 0, failCount: 0, lockedUntil: 0 },
        { id: 5, studentNo: '20230009001', realName: '王建国', role: 'teacher', password: 'Tea123456', status: 1, failCount: 0, lockedUntil: 0 },
        { id: 6, studentNo: '20230000001', realName: '系统管理员', role: 'admin', password: 'Adm123456', status: 1, failCount: 0, lockedUntil: 0 }
      ],

      profiles: {
        1: {
          userId: 1, name: '张小明', grade: '大三', major: '软件工程', preference: '考研', rankBand: '中游',
          gender: '男', className: '软 2313', phone: '13800001234', email: 'zhangxm@example.com',
          city: '沈阳', intro: '喜欢把问题拆开慢慢弄明白，做过两次课程项目，还在补数据结构。', completeFlag: 1
        },
        2: {
          userId: 2, name: '李思远', grade: '大三', major: '计算机科学与技术', preference: '就业', rankBand: '前 30%',
          gender: '女', className: '软 2313', phone: '13900005678', email: 'lisy@example.com',
          city: '大连', intro: '做过一个校园二手交易的小程序，想早点进公司做开发。', completeFlag: 1
        },
        3: {
          userId: 3, name: '王雨晴', grade: '大二', major: '', preference: '', rankBand: '未填',
          gender: '女', className: '', phone: '', email: '', city: '',
          intro: '', completeFlag: 0
        },
        4: {
          userId: 4, name: '赵一鸣', grade: '大三', major: '软件工程', preference: '考公', rankBand: '未填',
          gender: '男', className: '软 2313', phone: '', email: '', city: '',
          intro: '', completeFlag: 1
        }
      },

      /* answered 表示已有人作答，按需求只能停用，不能改选项 */
      questions: QUESTIONS.map(function (q, i) {
        return {
          id: i + 1,
          stem: q.stem,
          optionA: q.a[0], typeA: q.a[1],
          optionB: q.b[0], typeB: q.b[1],
          sort: i + 1, enabled: true, answered: true
        };
      }),

      results: {
        1: [
          { id: 1, scores: { R: 4, I: 6, A: 2, S: 4, E: 3, C: 5 }, top1: 'I', top2: 'C', tie: false, at: '2026-11-09 15:20' }
        ],
        2: [
          { id: 2, scores: { R: 4, I: 5, A: 3, S: 6, E: 2, C: 3 }, top1: 'S', top2: 'I', tie: false, at: '2026-11-09 10:05' }
        ]
      },

      directions: DIRECTIONS.map(function (d, i) {
        return {
          id: i + 1, name: d.name, category: d.category, tags: d.tags.slice(),
          summary: d.summary, actions: d.actions.slice(), status: 1
        };
      }),

      favorites: [
        { userId: 1, directionId: 4 },
        { userId: 1, directionId: 2 }
      ],

      sessions: [
        { id: 1, userId: 1, title: '考研和就业怎么选', deleted: false, createdAt: '2026-11-09 15:40' }
      ],
      messages: [
        { id: 1, sessionId: 1, sender: 'user', content: '我在纠结要不要考研，家里希望我早点工作，我自己又怕考不上。', mock: false, at: '2026-11-09 15:40' },
        { id: 2, sessionId: 1, sender: 'assistant', content: '从你档案里的信息看，你的去向偏好是考研，最近一次测评的前两型是研究型、常规型。可以先想清楚两件事：一是你愿意拿出多长时间准备，二是如果没考上，能否接受先就业再二战。这两点想清楚，选择会更容易一些。', mock: false, at: '2026-11-09 15:40' },
        { id: 3, sessionId: 1, sender: 'user', content: '那我这学期应该先做点什么？', mock: false, at: '2026-11-09 15:42' },
        { id: 4, sessionId: 1, sender: 'assistant', content: '建议先把专业课基础补上，同时按月份列一个复习计划；另一边可以准备一份简单的项目经历，万一转向就业也用得上。具体考哪所学校、复习到什么程度，需要你自己结合成绩来判断，我没法替你保证结果。', mock: false, at: '2026-11-09 15:42' }
      ],

      plans: [
        {
          id: 1, userId: 1, sessionId: 1, source: 'mock', createdAt: '2026-11-09 16:40',
          content: '【当前情况】\n大三，软件工程专业，成绩档位为中游；最近一次职业意向测评的前两型是研究型、常规型；档案里的去向偏好是考研。\n\n【可选方向】\n《计算机升学》《考公计算机岗》《软件开发》\n\n【在校安排】\n1. 本学期先补齐数据结构与算法基础，每周固定两晚做练习；\n2. 按月份列出考研专业课和公共课的复习计划，月末复盘一次；\n3. 保留一个能讲清楚的项目经历，作为转向就业的备用。\n\n【待确认问题】\n1. 目标院校和专业方向是否已经确定？\n2. 每周能稳定拿出多少小时复习？\n3. 如果第一次没考上，是否接受先就业再准备？'
        },
        {
          id: 2, userId: 2, sessionId: null, source: 'model', createdAt: '2026-11-08 20:10',
          content: '【当前情况】\n大三，计算机科学与技术专业，成绩档位为前 30%；最近一次测评的前两型是社会型、研究型；去向偏好是就业。\n\n【可选方向】\n《软件开发》《产品助理》《软件测试》\n\n【在校安排】\n1. 把已有的小程序项目整理成可展示的作品；\n2. 每周投递前先完善简历里的项目描述；\n3. 参加一次校园招聘宣讲，了解岗位要求。\n\n【待确认问题】\n1. 更倾向开发岗还是产品岗？\n2. 能否接受先实习再转正？'
        },
        {
          id: 3, userId: 2, sessionId: null, source: 'mock', createdAt: '2026-11-09 19:30',
          content: '【当前情况】\n大三，计算机科学与技术专业，成绩档位为前 30%；最近一次测评前两型是社会型、研究型；去向偏好是就业。\n\n【可选方向】\n《产品助理》《软件开发》《计算机升学》\n\n【在校安排】\n1. 用原型工具完成一份功能页面练习；\n2. 跟一次完整的需求讨论并写会议记录；\n3. 每周复盘一次求职进度。\n\n【待确认问题】\n1. 是否愿意先从产品助理岗位起步？\n2. 实习时间能安排多长？'
        }
      ],

      comments: [
        { planId: 1, teacherId: 5, content: '方案结构完整，方向与测评结果一致。建议把考研时间线再具体到每月任务。', at: '2026-11-10 09:15' },
        { planId: 2, teacherId: 5, content: '就业方向选得比较稳，项目描述还可以再具体一些，写清你负责的部分。', at: '2026-11-10 09:20' }
      ],

      announcements: [
        {
          id: 1, title: '欢迎使用 CareerPilot（教学演示）', pinned: true, offline: false, at: '2026-11-10 09:00',
          content: '本系统是软件实训课程的教学演示项目，页面里的学生、老师、方向和方案均为虚构数据。\n系统提供学业档案、职业意向测评、方向参考和规划对话，结果只作为规划参考，不保证录取或就业。'
        },
        {
          id: 2, title: '测评结果怎么用', pinned: false, offline: false, at: '2026-11-10 09:05',
          content: '测评结果只反映本次作答倾向，请结合自己的实际情况判断。如有疑问，可以找就业指导老师聊一聊。'
        }
      ],

      config: {
        apiUrl: 'https://api.example.com/v1/chat',
        modelName: 'demo-chat-model',
        timeout: 30,
        assistantOn: true,
        mockOn: false,
        disclaimer: TEXTS.T01
      },

      logs: [
        { id: 1, userId: 1, action: '登录', targetType: 'sys_user', targetId: '1', ip: '127.0.0.1', at: '2026-11-09 15:19' },
        { id: 2, userId: 1, action: '生成方案', targetType: 'career_plan', targetId: '1', ip: '127.0.0.1', at: '2026-11-09 16:40' },
        { id: 3, userId: 2, action: '登录', targetType: 'sys_user', targetId: '2', ip: '127.0.0.1', at: '2026-11-09 10:03' },
        { id: 4, userId: 6, action: '改题目', targetType: 'assessment_question', targetId: '8', ip: '127.0.0.1', at: '2026-11-09 18:00' },
        { id: 5, userId: 6, action: '改方向', targetType: 'direction_item', targetId: '8', ip: '127.0.0.1', at: '2026-11-09 18:02' },
        { id: 6, userId: 6, action: '改参数', targetType: 'sys_config', targetId: '-', ip: '127.0.0.1', at: '2026-11-09 18:05' },
        { id: 7, userId: 6, action: '重置密码', targetType: 'sys_user', targetId: '4', ip: '127.0.0.1', at: '2026-11-09 18:10' }
      ],

      nextIds: {
        user: 7, question: 25, direction: 9, session: 2, message: 5,
        plan: 4, comment: 3, announcement: 3, log: 8, result: 3, favorite: 1
      }
    };
  }

  window.CAREER_DATA = {
    TEXTS: TEXTS,
    PREFERENCE_OPTIONS: PREFERENCE_OPTIONS,
    RANK_BAND_OPTIONS: RANK_BAND_OPTIONS,
    DIRECTION_CATEGORIES: DIRECTION_CATEGORIES,
    HOLLAND: HOLLAND,
    DEMO_ACCOUNTS: DEMO_ACCOUNTS,
    createSeed: createSeed
  };
})();
