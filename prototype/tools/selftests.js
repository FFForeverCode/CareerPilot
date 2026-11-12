/* CareerPilot 原型自检 · 业务规则测试
   同一份测试既可以在浏览器里跑（tools/selfcheck.html），也可以在 Node 里跑（tools/selfcheck-node.mjs）。 */
(function () {
  'use strict';

  window.runSelfTests = function () {
    var D = window.CAREER_DATA, T = D.TEXTS, S = window.Store, API = window.API;
    var lines = [], pass = 0, fail = 0;

    function check(name, cond, extra) {
      if (cond) { pass++; lines.push('PASS  ' + name); }
      else { fail++; lines.push('FAIL  ' + name + (extra ? '  → ' + extra : '')); }
    }
    function section(name) { lines.push(''); lines.push('== ' + name + ' =='); }
    function loginAs(key) {
      var acc = D.DEMO_ACCOUNTS[key];
      var r = API.login(acc);
      if (!r.ok) { throw new Error('login failed: ' + key + ' ' + r.msg); }
      return r.data;
    }

    /* ---------- 账号 ---------- */
    section('注册与登录');
    S.reset();
    var r = API.register({ studentNo: '2023', password: 'Abcd1234' });
    check('10 位学号被拒绝', !r.ok && r.msg.indexOf('11 位') >= 0, r.msg);
    r = API.register({ studentNo: '20230001001', password: 'Abcd1234' });
    check('重复学号被拒绝', !r.ok && r.msg.indexOf('已存在') >= 0, r.msg);
    r = API.register({ studentNo: '20230009999', password: '12345678' });
    check('纯数字密码被拒绝', !r.ok && r.msg.indexOf('字母') >= 0, r.msg);
    r = API.register({ studentNo: '20230009999', password: 'Abcd123' });
    check('7 位密码被拒绝', !r.ok, r.msg);
    r = API.register({ studentNo: '20230009999', password: 'Abcd1234' });
    check('合法注册成功', r.ok, r.msg);

    S.reset();
    r = API.login({ studentNo: '20230009001', password: 'wrong' });
    check('错误密码给出中文提示', !r.ok && /还可以尝试/.test(r.msg), r.msg);
    var lastMsg = '';
    for (var i = 0; i < 4; i++) { lastMsg = API.login({ studentNo: '20230009001', password: 'wrong' }).msg; }
    check('连续 5 次失败后锁定 15 分钟', /锁定 15 分钟/.test(lastMsg), lastMsg);
    r = API.login(D.DEMO_ACCOUNTS.teacher);
    check('锁定期间正确密码也不能登录', !r.ok && /锁定/.test(r.msg), r.msg);

    /* ---------- 档案 ---------- */
    section('学业档案');
    S.reset();
    loginAs('student');
    var p = API.getProfile(1).data;
    check('手机号脱敏展示', p.phoneMasked === '138****1234', p.phoneMasked);
    r = API.saveProfile(1, { name: '张小明', grade: '大三', major: '', preference: '考研', rankBand: '中游' });
    check('缺专业仍可保存但未完成', r.ok && r.data.completeFlag === 0 && r.data.missing.indexOf('专业') >= 0, JSON.stringify(r.data && r.data.missing));
    r = API.saveProfile(1, { major: '软件工程', intro: new Array(302).join('字') });
    check('自我说明 301 字被拒绝', !r.ok, r.msg);
    r = API.saveProfile(1, { major: '软件工程' });
    check('补全专业后档案完成', r.ok && r.data.completeFlag === 1, JSON.stringify(r.data && r.data.missing));
    r = API.saveProfile(1, { preference: '留学' });
    check('去向偏好只允许五项', !r.ok && r.msg.indexOf('就业') >= 0, r.msg);

    /* ---------- 测评 ---------- */
    section('测评作答与计分');
    S.reset();
    loginAs('student');
    var page = API.getAssessmentPage();
    check('启用 24 题可作答', page.ok && page.data.available && page.data.questions.length === 24, page.data && page.data.questions.length);
    var counts = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };
    page.data.questions.forEach(function (q) { counts[q.typeA]++; counts[q.typeB]++; });
    check('六型作为选项各出现 8 次', ['R', 'I', 'A', 'S', 'E', 'C'].every(function (k) { return counts[k] === 8; }), JSON.stringify(counts));

    var qs = page.data.questions;
    var answers = {};
    qs.forEach(function (q, idx) {
      var n = idx + 1, pick;
      if (n <= 8) { pick = 'B'; }
      else if (n <= 11) { pick = 'B'; }
      else if (n === 12) { pick = 'A'; }
      else if (n <= 14) { pick = 'A'; }
      else if (n <= 16) { pick = 'B'; }
      else if (n <= 20) { pick = 'A'; }
      else if (n <= 22) { pick = 'A'; }
      else { pick = 'B'; }
      answers[q.id] = pick;
    });
    r = API.submitAssessment(1, answers);
    check('标准样例前两型为研究型、常规型', r.ok && r.data.top1 === 'I' && r.data.top2 === 'C', JSON.stringify(r.data && r.data.scores));
    check('标准样例六型得分为 I=6、C=5、R=4、S=4、E=3、A=2',
      r.ok && r.data.scores.I === 6 && r.data.scores.C === 5 && r.data.scores.R === 4 && r.data.scores.S === 4 && r.data.scores.E === 3 && r.data.scores.A === 2,
      JSON.stringify(r.data && r.data.scores));

    var partial = {};
    Object.keys(answers).slice(0, 23).forEach(function (k) { partial[k] = answers[k]; });
    r = API.submitAssessment(1, partial);
    check('漏一题不能提交', !r.ok && /没有选择/.test(r.msg), r.msg);

    var tieAnswers = {};
    qs.forEach(function (q, idx) {
      var n = idx + 1, pick;
      if (n <= 6) { pick = 'A'; }
      else if (n <= 8) { pick = 'B'; }
      else if (n <= 12) { pick = 'B'; }
      else if (n <= 16) { pick = 'A'; }
      else if (n <= 20) { pick = 'A'; }
      else if (n === 21) { pick = 'A'; }
      else { pick = 'B'; }
      tieAnswers[q.id] = pick;
    });
    r = API.submitAssessment(1, tieAnswers);
    check('并列时按 RIASEC 顺序截取并标记并列',
      r.ok && r.data.tie === true && r.data.top1 === 'R' && r.data.top2 === 'I',
      JSON.stringify(r.data && { s: r.data.scores, tie: r.data.tie, t1: r.data.top1, t2: r.data.top2 }));
    check('每人只保留最近 3 次', API.getResultPage(1).data.list.length === 3, API.getResultPage(1).data.list.length);

    r = API.submitAssessment(1, answers);
    check('推荐和对话使用最近一次结果（I、C）', r.ok && r.data.top1 === 'I' && r.data.top2 === 'C', r.data && r.data.top1);

    /* ---------- 推荐 ---------- */
    section('方向推荐');
    var rec = API.getDirectionsPage(1).data.recommendation;
    check('偏好考研且研究型时，带 I 标签的考研方向排第一',
      !rec.needAssessment && rec.list.length === 3 && rec.list[0].name === '计算机升学',
      JSON.stringify(rec.list.map(function (d) { return d.name + ':' + d.score; })));
    check('推荐最多 3 条', rec.list.length <= 3, rec.list.length);
    check('推荐理由用模板句', rec.list.every(function (d) { return d.reason === T.T10; }));
    check('方向简介不含薪资', rec.list.every(function (d) { return d.summary.indexOf('薪资') < 0; }));

    r = API.toggleFavorite(1, 1);
    check('收藏成功', r.ok && r.data.favorite === true, r.msg);
    r = API.toggleFavorite(1, 1);
    check('再点一次取消收藏', r.ok && r.data.favorite === false, r.msg);

    /* ---------- 对话 ---------- */
    section('规划对话');
    S.reset();
    loginAs('student');
    var chat = API.getChatPage(1).data;
    check('模拟回复默认关闭', chat.mockOn === false);
    var before = API.messagesOf(1).length;
    r = API.sendMessage(1, 1, '我想了解一下考研和就业');
    check('模拟回复关闭时发送按失败分支处理', !r.ok && /没有可用的模型回复/.test(r.msg), r.msg);
    check('失败时本轮不入库', API.messagesOf(1).length === before, API.messagesOf(1).length);
    r = API.sendMessage(1, 1, new Array(502).join('字'));
    check('超过 500 字拒绝发送', !r.ok && /500/.test(r.msg), r.msg);

    loginAs('admin');
    var cfg = API.getConfig().data.config;
    cfg.mockOn = true;
    cfg.timeout = 30;
    r = API.saveConfig(cfg);
    check('管理员可打开模拟回复开关', r.ok, r.msg);
    r = API.saveConfig({ timeout: 4 });
    check('超时 4 秒不能保存', !r.ok && /5～60/.test(r.msg), r.msg);
    var cfgLeak = JSON.stringify(API.getConfig().data);
    check('参数接口不含密钥字段', cfgLeak.indexOf('apiKey') < 0 && cfgLeak.indexOf('secret') < 0);

    loginAs('student');
    r = API.sendMessage(1, 1, '我有点纠结要不要考研。');
    check('打开模拟回复后能收到回复', r.ok && r.data.mock === true, r.msg);
    var msgsList = API.messagesOf(1);
    check('模拟回复带 mock 标记', msgsList[msgsList.length - 1].mock === true);
    r = API.sendMessage(1, 1, '帮我写一份简历并打分');
    check('拒绝代写简历', r.ok && /不能帮你写简历/.test(r.data.reply), r.data && r.data.reply.slice(0, 20));
    r = API.createSession(1, new Array(22).join('标'));
    check('会话标题 21 字被拒绝', !r.ok && /20/.test(r.msg), r.msg);
    var newSession = API.createSession(1, '');
    check('标题留空默认「新的规划对话」', newSession.ok && newSession.data.title === T.T06, JSON.stringify(newSession.data));
    r = API.deleteSession(1, newSession.data.id);
    check('删除会话后列表消失', r.ok && !API.listSessions(1).some(function (s) { return s.id === newSession.data.id; }));

    /* ---------- 方案 ---------- */
    section('生成与保存方案');
    var pre = API.planPreconditions(1);
    check('四项前置条件都满足', pre.missing.length === 0, JSON.stringify(pre.missing));
    var planCount = API.listPlans(1).data.plans.length;
    r = API.generatePlan(1, 1);
    check('模拟回复下可生成合格方案', r.ok, r.msg);
    check('方案条数 +1', API.listPlans(1).data.plans.length === planCount + 1);
    var planDetail = API.getPlanDetail(1, 'student', r.data.id);
    check('四个标题原样存在', T.T09_LIST.every(function (h) { return planDetail.data.plan.content.indexOf(h) >= 0; }));
    var names = (planDetail.data.plan.content.match(/《[^《》]*》/g) || []);
    check('方案里的方向名称来自方向库',
      names.every(function (n) { return ['软件开发', '软件测试', '产品助理', '计算机升学', '考公计算机岗', '考公综合岗', '校园技术创业', '先补基础'].indexOf(n.slice(1, -1)) >= 0; }),
      JSON.stringify(names));
    check('方案来源记为 mock', planDetail.data.plan.source === 'mock');

    loginAs('admin');
    cfg = API.getConfig().data.config;
    cfg.mockOn = false;
    API.saveConfig(cfg);
    loginAs('student');
    var beforeCount = API.listPlans(1).data.plans.length;
    r = API.generatePlan(1, 1);
    check('没有模型回复时不保存方案', !r.ok && API.listPlans(1).data.plans.length === beforeCount, r.msg);
    loginAs('admin');
    cfg = API.getConfig().data.config;
    cfg.mockOn = true;
    cfg.assistantOn = false;
    API.saveConfig(cfg);
    loginAs('student');
    r = API.generatePlan(1, 1);
    check('助手关闭时不能生成方案', !r.ok && /助手维护中/.test(r.msg), r.msg);
    r = API.sendMessage(1, 1, '还在吗');
    check('助手关闭时不能发送消息', !r.ok && /助手维护中/.test(r.msg), r.msg);
    loginAs('admin');
    cfg = API.getConfig().data.config;
    cfg.assistantOn = true;
    API.saveConfig(cfg);
    loginAs('student');

    while (API.listPlans(1).data.plans.length < 5) { API.generatePlan(1, 1); }
    r = API.generatePlan(1, 1);
    check('已有 5 份时不能生成第 6 份', !r.ok && /份数/.test(r.msg), r.msg);
    var firstPlanId = API.listPlans(1).data.plans[0].id;
    r = API.deletePlan(1, firstPlanId);
    check('删除方案成功', r.ok && API.listPlans(1).data.plans.length === 4, r.msg);
    r = API.getPlanDetail(1, 'student', firstPlanId);
    check('已删除方案不可查看', !r.ok, r.msg);

    /* ---------- 老师 ---------- */
    section('老师端权限');
    var studentPlanIds = API.listPlans(1).data.plans.map(function (x) { return x.id; });
    loginAs('teacher');
    r = API.teacherMessagesDenied();
    check('老师访问消息接口返回 403', !r.ok && r.code === 403, JSON.stringify(r));
    r = API.teacherSearch('');
    check('老师可按姓名或学号查询', r.ok && r.data.list.length >= 2, r.data && r.data.list.length);
    var detail = API.teacherStudentDetail(1);
    check('老师视图含档案摘要和最近一次测评', detail.ok && detail.data.profile && detail.data.latest);
    check('老师视图不含逐题答案和聊天记录',
      detail.ok && JSON.stringify(detail.data).indexOf('optionA') < 0 && JSON.stringify(detail.data).indexOf('chat_message') < 0);
    r = API.saveComment(studentPlanIds[0], new Array(202).join('字'));
    check('评语 201 字被拒绝', !r.ok && /200/.test(r.msg), r.msg);
    r = API.saveComment(studentPlanIds[0], '建议把时间安排写细一点。');
    check('老师可保存评语', r.ok, r.msg);
    var planForComment = API.getPlanDetail(1, 'teacher', studentPlanIds[0]);
    check('学生方案详情能看到评语', planForComment.ok && planForComment.data.comment && planForComment.data.comment.content.indexOf('时间安排') >= 0);

    /* ---------- 管理员 ---------- */
    section('管理端');
    loginAs('admin');
    var stats = API.stats().data;
    check('四个统计数字存在',
      typeof stats.studentCount === 'number' && typeof stats.completeCount === 'number' &&
      typeof stats.assessedCount === 'number' && typeof stats.planCount === 'number', JSON.stringify(stats));
    check('注册学生数含停用说明', stats.disabledCount >= 1, stats.disabledCount);
    var logs = API.listLogs({}).data;
    check('日志只含规定动作', logs.logs.every(function (l) {
      return ['登录', '重置密码', '生成方案', '删除方案', '改题目', '改方向', '改参数'].indexOf(l.action) >= 0;
    }));
    var logsOfStudent = API.listLogs({ userId: 1 }).data;
    check('可按学生筛选日志', logsOfStudent.logs.every(function (l) { return l.operator.indexOf('张小明') >= 0; }), logsOfStudent.logs.length);

    r = API.addQuestion({ stem: '测试题', optionA: 'A', typeA: 'R', optionB: 'B', typeB: 'R' });
    check('两个选项类型相同不能保存', !r.ok && /不能相同/.test(r.msg), r.msg);
    r = API.addQuestion({ stem: '测试题', optionA: 'A', typeA: 'R', optionB: 'B', typeB: 'I' });
    check('合法题目可以新增', r.ok, r.msg);
    var qsAfter = API.adminQuestions().data;
    var newQ = qsAfter.questions[qsAfter.questions.length - 1];
    r = API.setQuestionEnabled(newQ.id, false);
    check('题目可以停用', r.ok && API.adminQuestions().data.enabledCount === 24, r.msg);
    r = API.updateQuestion(newQ.id, { optionA: 'A2' });
    check('未作答题目可以改选项', r.ok, r.msg);
    var answeredQ = API.adminQuestions().data.questions[0];
    r = API.updateQuestion(answeredQ.id, { optionA: '改一下' });
    check('已作答题目只能停用不能改选项', !r.ok && /只能停用/.test(r.msg), r.msg);

    r = API.addDirection({ name: '软件开发', category: '就业', tags: ['I'], summary: 'x', actions: ['a', 'b'] });
    check('方向重名被拒绝', !r.ok && /重复/.test(r.msg), r.msg);
    r = API.addDirection({ name: '留学申请', category: '留学', tags: ['I'], summary: 'x', actions: ['a', 'b'] });
    check('方向类别非法被拒绝', !r.ok && /就业/.test(r.msg), r.msg);
    r = API.addDirection({ name: '数据分析', category: '就业', tags: ['I', 'C'], summary: '面向业务的数据整理与分析。', actions: ['完成一份数据报告', '参加一次数据类比赛'] });
    check('合法方向可以新增', r.ok, r.msg);
    var newDirId = API.adminDirections().data.directions[API.adminDirections().data.directions.length - 1].id;
    r = API.setDirectionStatus(newDirId, 0);
    check('方向可以下架', r.ok && API.adminDirections().data.directions.filter(function (d) { return d.id === newDirId; })[0].status === 0, r.msg);

    r = API.addAnnouncement({ title: new Array(42).join('题'), content: '正文', pinned: false });
    check('公告标题超过 40 字被拒绝', !r.ok && /40/.test(r.msg), r.msg);
    r = API.addAnnouncement({ title: '测试公告', content: '正文', pinned: false });
    check('合法公告可以发布', r.ok, r.msg);
    var annId = API.adminAnnouncements().data.announcements.filter(function (a) { return a.title === '测试公告'; })[0].id;
    API.setAnnouncementOffline(annId, true);
    check('公告下线后学生端不再显示', !API.announcementsForStudent().some(function (a) { return a.title === '测试公告'; }));
    loginAs('student');
    var studentLogs = API.listLogs({});
    check('学生不能查询日志', !studentLogs.ok && studentLogs.code === 403, studentLogs.msg);
    r = API.teacherMessagesDenied();
    check('学生也不能用老师消息接口', !r.ok);

    loginAs('admin');
    var all = API.adminQuestions().data.questions;
    for (var k = 0; k < 7; k++) { API.setQuestionEnabled(all[k].id, false); }
    var enabledNow = API.adminQuestions().data.enabledCount;
    loginAs('student');
    var page2 = API.getAssessmentPage();
    check('启用题不足 18 道时不能作答并显示「题目维护中」（当前启用 ' + enabledNow + ' 道）',
      page2.ok && page2.data.available === false && page2.data.text === T.T07,
      JSON.stringify(page2.data && { available: page2.data.available, text: page2.data.text }));

    r = API.getProfile(2);
    check('学生 A 不能读学生 B 的档案', !r.ok && r.code === 403, r.msg);
    r = API.getPlanDetail(1, 'student', 9999);
    check('不存在的方案返回中文错误', !r.ok && r.code === 404, r.msg);

    S.reset();
    return { pass: pass, fail: fail, lines: lines, ok: fail === 0 };
  };
})();
