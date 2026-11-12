/* CareerPilot 产品原型 · 模拟后端
   真实系统里这些规则在 Spring Boot 里校验；原型把同一套规则集中在这里，方便对照需求基线。
   页面按钮状态只是辅助，校验以这里为准。 */
(function () {
  'use strict';

  var D = window.CAREER_DATA;
  var T = D.TEXTS;
  var S = window.Store;

  function ok(data, msg) { return { ok: true, data: data, msg: msg || '' }; }
  function fail(msg, code) { return { ok: false, msg: msg, code: code || 400 }; }

  function db() { return S.get(); }

  function userById(id) {
    return db().users.filter(function (u) { return u.id === id; })[0] || null;
  }

  function currentUser() {
    var s = S.session();
    if (!s) { return null; }
    var u = userById(s.userId);
    if (!u) { return null; }
    return u;
  }

  function requireRole(role) {
    var u = currentUser();
    if (!u) { return { error: fail('登录已失效，请重新登录。', 401) }; }
    if (role && u.role !== role) { return { error: fail('没有权限执行这个操作。', 403) }; }
    return { user: u };
  }

  function addLog(userId, action, targetType, targetId) {
    var allowed = ['登录', '重置密码', '生成方案', '删除方案', '改题目', '改方向', '改参数'];
    if (allowed.indexOf(action) < 0) {
      /* 需求基线：只记录规定动作，其他行为不写日志 */
      return;
    }
    db().logs.unshift({
      id: S.nextId('log'), userId: userId, action: action,
      targetType: targetType, targetId: String(targetId == null ? '-' : targetId),
      ip: '127.0.0.1', at: S.now()
    });
    S.save();
  }

  function typeName(code) {
    var item = D.HOLLAND.filter(function (h) { return h.code === code; })[0];
    return item ? item.name : code;
  }

  function maskPhone(phone) {
    if (!phone) { return ''; }
    var p = String(phone);
    if (p.length < 7) { return p; }
    return p.slice(0, 3) + '****' + p.slice(7);
  }

  function latestResult(userId) {
    var list = db().results[userId] || [];
    return list.length ? list[list.length - 1] : null;
  }

  /* ---------------- 账号 ---------------- */

  function register(payload) {
    var studentNo = String(payload.studentNo || '').trim();
    var password = String(payload.password || '');
    if (!/^\d{11}$/.test(studentNo)) {
      return fail('学号必须是 11 位数字。');
    }
    var exists = db().users.some(function (u) { return u.studentNo === studentNo; });
    if (exists) {
      return fail('该学号已存在，请直接登录或换一个学号。');
    }
    if (!/^(?=.*[A-Za-z])(?=.*\d).{8,16}$/.test(password)) {
      return fail('密码必须是 8～16 位，并且同时包含字母和数字。');
    }
    var id = S.nextId('user');
    db().users.push({
      id: id, studentNo: studentNo, realName: '学生' + studentNo.slice(-4),
      role: 'student', password: password, status: 1, failCount: 0, lockedUntil: 0
    });
    db().profiles[id] = {
      userId: id, name: '', grade: '', major: '', preference: '', rankBand: '未填',
      gender: '', className: '', phone: '', email: '', city: '', intro: '', completeFlag: 0
    };
    S.save();
    return ok({ id: id }, '注册成功，请用新账号登录。');
  }

  function login(payload) {
    var studentNo = String(payload.studentNo || '').trim();
    var password = String(payload.password || '');
    if (!/^\d{11}$/.test(studentNo)) {
      return fail('学号必须是 11 位数字。');
    }
    if (!password) {
      return fail('请输入密码。');
    }
    var user = db().users.filter(function (u) { return u.studentNo === studentNo; })[0];
    if (!user) {
      return fail('学号或密码不正确。');
    }
    if (user.status === 0) {
      return fail('该账号已停用，请联系管理员。');
    }
    var now = Date.now();
    if (user.lockedUntil && user.lockedUntil > now) {
      var mins = Math.ceil((user.lockedUntil - now) / 60000);
      return fail('连续登录失败次数过多，账号已锁定，请 ' + mins + ' 分钟后再试。');
    }
    if (user.password !== password) {
      user.failCount = (user.failCount || 0) + 1;
      if (user.failCount >= 5) {
        user.failCount = 0;
        user.lockedUntil = now + 15 * 60 * 1000;
        S.save();
        return fail('连续 5 次登录失败，账号已锁定 15 分钟。');
      }
      var left = 5 - user.failCount;
      S.save();
      return fail('学号或密码不正确，还可以尝试 ' + left + ' 次。');
    }
    user.failCount = 0;
    user.lockedUntil = 0;
    S.save();
    S.setSession(user.id, user.role);
    addLog(user.id, '登录', 'sys_user', user.id);
    return ok({ id: user.id, realName: user.realName, role: user.role }, '登录成功。');
  }

  function logout() {
    S.clearSession();
    return ok(null, '已退出登录。');
  }

  /* ---------------- 档案 ---------------- */

  function getProfile(userId) {
    var check = requireRole('student');
    if (check.error) { return check.error; }
    if (check.user.id !== userId) {
      return fail('没有权限查看别人的档案。', 403);
    }
    var p = db().profiles[userId];
    return ok({ profile: p, phoneMasked: maskPhone(p.phone) });
  }

  function missingRequired(p) {
    var missing = [];
    if (!p.name) { missing.push('姓名'); }
    if (!p.grade) { missing.push('年级'); }
    if (!p.major) { missing.push('专业'); }
    if (!p.preference) { missing.push('去向偏好'); }
    return missing;
  }

  function saveProfile(userId, form) {
    var check = requireRole('student');
    if (check.error) { return check.error; }
    if (check.user.id !== userId) {
      return fail('没有权限修改别人的档案。', 403);
    }
    if (form.preference && D.PREFERENCE_OPTIONS.indexOf(form.preference) < 0) {
      return fail('去向偏好只能是就业、考研、考公、创业、还没想好。');
    }
    if (form.rankBand && D.RANK_BAND_OPTIONS.indexOf(form.rankBand) < 0) {
      return fail('成绩档次只能是前 30%、中游、后 30%、未填。');
    }
    if (form.intro && String(form.intro).length > 300) {
      return fail('自我说明最多 300 字。');
    }
    var p = db().profiles[userId];
    ['name', 'grade', 'major', 'preference', 'rankBand', 'gender', 'className', 'phone', 'email', 'city', 'intro'].forEach(function (k) {
      if (Object.prototype.hasOwnProperty.call(form, k)) {
        p[k] = typeof form[k] === 'string' ? form[k].trim() : form[k];
      }
    });
    var missing = missingRequired(p);
    p.completeFlag = missing.length === 0 ? 1 : 0;
    S.save();
    return ok({ profile: p, missing: missing, completeFlag: p.completeFlag }, '已保存。' + (missing.length ? '还缺：' + missing.join('、') + '。' : '档案已完整。'));
  }

  /* ---------------- 测评 ---------------- */

  function enabledQuestions() {
    return db().questions.filter(function (q) { return q.enabled; })
      .sort(function (a, b) { return a.sort - b.sort; });
  }

  function getAssessmentPage() {
    var check = requireRole('student');
    if (check.error) { return check.error; }
    var qs = enabledQuestions();
    if (qs.length < 18) {
      return ok({ questions: qs, available: false, text: T.T07 });
    }
    return ok({ questions: qs, available: true });
  }

  function submitAssessment(userId, answers) {
    var check = requireRole('student');
    if (check.error) { return check.error; }
    if (check.user.id !== userId) {
      return fail('没有权限提交别人的答卷。', 403);
    }
    var qs = enabledQuestions();
    if (qs.length < 18) {
      return fail(T.T07 + '，暂时不能作答。');
    }
    var unanswered = qs.filter(function (q) { return !answers[q.id]; });
    if (unanswered.length) {
      return fail('还有 ' + unanswered.length + ' 道题没有选择，全部答完才能提交。');
    }
    var scores = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };
    qs.forEach(function (q) {
      var pick = answers[q.id];
      var code = pick === 'A' ? q.typeA : q.typeB;
      scores[code] = (scores[code] || 0) + 1;
      q.answered = true;
    });
    var order = D.HOLLAND.map(function (h) { return h.code; });
    var sorted = order.slice().sort(function (a, b) {
      if (scores[b] !== scores[a]) { return scores[b] - scores[a]; }
      return order.indexOf(a) - order.indexOf(b);
    });
    var tie = scores[sorted[1]] === scores[sorted[2]];
    var result = {
      id: S.nextId('result'), scores: scores,
      top1: sorted[0], top2: sorted[1], tie: tie, at: S.now(),
      order: sorted.slice()
    };
    var list = db().results[userId] || (db().results[userId] = []);
    list.push(result);
    while (list.length > 3) {
      list.shift();
    }
    S.save();
    return ok(result, '提交成功。');
  }

  function getResultPage(userId) {
    var check = requireRole('student');
    if (check.error) { return check.error; }
    if (check.user.id !== userId) {
      return fail('没有权限查看别人的测评结果。', 403);
    }
    var list = db().results[userId] || [];
    return ok({ latest: list.length ? list[list.length - 1] : null, list: list.slice().reverse() });
  }

  /* ---------------- 方向与推荐 ---------------- */

  function favoriteIds(userId) {
    return db().favorites.filter(function (f) { return f.userId === userId; })
      .map(function (f) { return f.directionId; });
  }

  function directionById(id) {
    return db().directions.filter(function (d) { return d.id === id; })[0] || null;
  }

  function recommend(userId) {
    var profile = db().profiles[userId] || null;
    var result = latestResult(userId);
    if (!profile || !result) {
      return { needAssessment: true, list: [] };
    }
    var top = [result.top1, result.top2];
    var preference = profile.preference;
    var scored = db().directions.filter(function (d) { return d.status === 1; }).map(function (d) {
      var tagHits = d.tags.filter(function (t) { return top.indexOf(t) >= 0; }).length;
      var score = tagHits * 2;
      if (preference && preference !== '还没想好' && d.category === preference) {
        score += 3;
      }
      return { direction: d, score: score, tagHits: tagHits, sameCategory: preference !== '还没想好' && d.category === preference };
    }).filter(function (x) { return x.score > 0; });
    scored.sort(function (a, b) {
      if (b.score !== a.score) { return b.score - a.score; }
      return a.direction.id - b.direction.id;
    });
    var list = scored.slice(0, 3).map(function (x) {
      return {
        id: x.direction.id, name: x.direction.name, category: x.direction.category,
        tags: x.direction.tags.slice(), summary: x.direction.summary,
        actions: x.direction.actions.slice(), score: x.score,
        reason: T.T10
      };
    });
    return { needAssessment: false, list: list };
  }

  function getDirectionsPage(userId) {
    var check = requireRole('student');
    if (check.error) { return check.error; }
    var rec = recommend(userId);
    var favIds = favoriteIds(userId);
    var favorites = db().favorites.filter(function (f) { return f.userId === userId; }).map(function (f) {
      var d = directionById(f.directionId);
      if (!d) { return null; }
      return {
        id: d.id, name: d.name, category: d.category, tags: d.tags.slice(),
        summary: d.summary, actions: d.actions.slice(), offline: d.status !== 1
      };
    }).filter(Boolean);
    return ok({ recommendation: rec, favorites: favorites, favoriteIds: favIds });
  }

  function toggleFavorite(userId, directionId) {
    var check = requireRole('student');
    if (check.error) { return check.error; }
    if (check.user.id !== userId) {
      return fail('没有权限修改别人的收藏。', 403);
    }
    var d = directionById(directionId);
    if (!d) { return fail('方向不存在。'); }
    var idx = -1;
    db().favorites.forEach(function (f, i) {
      if (f.userId === userId && f.directionId === directionId) { idx = i; }
    });
    if (idx >= 0) {
      db().favorites.splice(idx, 1);
      S.save();
      return ok({ favorite: false }, '已取消收藏。');
    }
    if (d.status !== 1) {
      return fail('该方向已下架，不能收藏。');
    }
    db().favorites.push({ userId: userId, directionId: directionId });
    S.save();
    return ok({ favorite: true }, '已收藏。');
  }

  /* ---------------- 对话 ---------------- */

  function ownSession(userId, sessionId) {
    return db().sessions.filter(function (s) {
      return s.id === sessionId && s.userId === userId && !s.deleted;
    })[0] || null;
  }

  function listSessions(userId) {
    return db().sessions.filter(function (s) { return s.userId === userId && !s.deleted; })
      .sort(function (a, b) { return b.id - a.id; });
  }

  function messagesOf(sessionId) {
    return db().messages.filter(function (m) { return m.sessionId === sessionId; })
      .sort(function (a, b) { return a.id - b.id; });
  }

  function getChatPage(userId) {
    var check = requireRole('student');
    if (check.error) { return check.error; }
    var result = latestResult(userId);
    return ok({
      sessions: listSessions(userId),
      needAssessment: !result,
      assistantOn: db().config.assistantOn,
      mockOn: db().config.mockOn
    });
  }

  function createSession(userId, title) {
    var check = requireRole('student');
    if (check.error) { return check.error; }
    var t = String(title || '').trim();
    if (t.length > 20) {
      return fail('会话标题最多 20 个字。');
    }
    var id = S.nextId('session');
    db().sessions.push({
      id: id, userId: userId, title: t || T.T06, deleted: false, createdAt: S.now()
    });
    S.save();
    return ok({ id: id, title: t || T.T06 }, '已新建会话。');
  }

  function renameSession(userId, sessionId, title) {
    var check = requireRole('student');
    if (check.error) { return check.error; }
    var s = ownSession(userId, sessionId);
    if (!s) { return fail('会话不存在或已删除。'); }
    var t = String(title || '').trim();
    if (t.length > 20) {
      return fail('会话标题最多 20 个字。');
    }
    s.title = t || T.T06;
    S.save();
    return ok({ title: s.title }, '会话标题已更新。');
  }

  function deleteSession(userId, sessionId) {
    var check = requireRole('student');
    if (check.error) { return check.error; }
    var s = ownSession(userId, sessionId);
    if (!s) { return fail('会话不存在或已删除。'); }
    s.deleted = true;
    S.save();
    return ok(null, '会话已删除。');
  }

  function mockReply(userId, userText) {
    var profile = db().profiles[userId];
    var result = latestResult(userId);
    var rec = recommend(userId);
    var parts = [];
    if (profile && profile.completeFlag === 1) {
      parts.push('你的档案是完整的：' + profile.major + '专业，去向偏好是' + profile.preference + '。');
    } else {
      parts.push('你的档案还没填完，先把姓名、年级、专业和去向偏好补齐，后面的建议会更贴合你。');
    }
    if (result) {
      parts.push('最近一次测评的前两型是' + typeName(result.top1) + '、' + typeName(result.top2) + '。');
    } else {
      parts.push('你还没有做测评，做完之后我能给出更具体的参考。');
    }
    if (rec.list && rec.list.length) {
      parts.push('按当前规则，参考方向有：' + rec.list.map(function (d) { return '《' + d.name + '》'; }).join('') + '。');
    }
    parts.push('这些都是参考，具体选择要结合你自己的成绩和时间安排，我没法替你保证结果。');
    if (userText) {
      parts.push('你刚才提到的情况我记下了，如果方便，可以再说说每天能投入多少时间。');
    }
    return parts.join('');
  }

  function sendMessage(userId, sessionId, content) {
    var check = requireRole('student');
    if (check.error) { return check.error; }
    var s = ownSession(userId, sessionId);
    if (!s) { return fail('会话不存在或已删除。'); }
    if (!db().config.assistantOn) {
      return fail(T.T08 + '，暂时不能发送消息。');
    }
    var text = String(content || '').trim();
    if (!text) { return fail('请输入内容再发送。'); }
    if (text.length > 500) {
      return fail('每条消息最多 500 字，请删减后再发送。');
    }
    if (!db().config.mockOn) {
      return fail('发送失败：当前没有可用的模型回复（未接入真实模型），本轮内容没有保存。可以请管理员打开模拟回复后再试。');
    }
    var refusal = /简历|打分/.test(text);
    var reply;
    if (refusal) {
      reply = '抱歉，我不能帮你写简历，也不能给简历打分，这两项不在本系统的能力范围内。我可以陪你梳理职业方向、在校安排和待确认的问题。';
    } else {
      reply = mockReply(userId, text);
    }
    var uid = S.nextId('message');
    db().messages.push({ id: uid, sessionId: sessionId, sender: 'user', content: text, mock: false, at: S.now() });
    db().messages.push({ id: uid + 1, sessionId: sessionId, sender: 'assistant', content: reply, mock: true, at: S.now() });
    S.nextId('message');
    S.save();
    return ok({ reply: reply, mock: true }, '已收到回复。');
  }

  /* ---------------- 方案 ---------------- */

  function checkPlanText(content) {
    var missing = T.T09_LIST.filter(function (h) { return content.indexOf(h) < 0; });
    if (missing.length) {
      return { ok: false, msg: '方案缺少标题：' + missing.join('、') + '，没有保存。' };
    }
    var names = [];
    var re = /《([^《》]*)》/g;
    var m;
    while ((m = re.exec(content)) !== null) {
      names.push(m[1]);
    }
    var lib = db().directions.map(function (d) { return d.name; });
    var unknown = names.filter(function (n) { return lib.indexOf(n) < 0; });
    if (unknown.length) {
      return { ok: false, msg: '方案里的方向名称不在方向库：' + unknown.join('、') + '，没有保存。' };
    }
    return { ok: true };
  }

  function planPreconditions(userId) {
    var profile = db().profiles[userId];
    var rec = recommend(userId);
    var plans = db().plans.filter(function (p) { return p.userId === userId; });
    var checks = [
      { key: 'profile', label: '档案', ok: !!(profile && profile.completeFlag === 1) },
      { key: 'assessment', label: '测评', ok: !!(db().results[userId] || []).length },
      { key: 'recommend', label: '推荐', ok: !!(rec.list && rec.list.length) },
      { key: 'quota', label: '份数', ok: plans.length < 5 }
    ];
    return { checks: checks, missing: checks.filter(function (c) { return !c.ok; }).map(function (c) { return c.label; }), plans: plans };
  }

  function buildMockPlan(userId) {
    var profile = db().profiles[userId];
    var result = latestResult(userId);
    var rec = recommend(userId);
    var names = (rec.list || []).slice(0, 2);
    var dirLabel = names.length ? names.map(function (d) { return '《' + d.name + '》'; }).join('') : '《先补基础》';
    var actions = [];
    names.forEach(function (d) {
      d.actions.slice(0, 1).forEach(function (a) { actions.push(a); });
    });
    if (!actions.length) { actions.push('先把编程基础补齐，再确定方向。'); }
    return '【当前情况】\n' +
      profile.grade + '，' + profile.major + '专业，成绩档位为' + (profile.rankBand || '未填') +
      '；最近一次测评的前两型是' + typeName(result.top1) + '、' + typeName(result.top2) +
      '；档案里的去向偏好是' + profile.preference + '。\n\n' +
      '【可选方向】\n' + dirLabel + '\n\n' +
      '【在校安排】\n' + actions.map(function (a, i) { return (i + 1) + '. ' + a + '；'; }).join('\n') + '\n\n' +
      '【待确认问题】\n1. 目标岗位或目标院校是否已经确定？\n2. 每周能稳定投入多少小时？\n3. 如果第一次结果不理想，是否接受先积累再调整？';
  }

  function generatePlan(userId, sessionId) {
    var check = requireRole('student');
    if (check.error) { return check.error; }
    var pre = planPreconditions(userId);
    if (pre.missing.length) {
      return fail('还不能生成方案，缺：' + pre.missing.join('、') + '。');
    }
    if (!db().config.assistantOn) {
      return fail(T.T08 + '，暂时不能生成方案。');
    }
    if (!db().config.mockOn) {
      return fail('生成失败：当前没有可用的模型回复，方案没有保存。可以请管理员打开模拟回复后再试。');
    }
    var content = buildMockPlan(userId);
    var valid = checkPlanText(content);
    if (!valid.ok) {
      return fail(valid.msg);
    }
    var id = S.nextId('plan');
    db().plans.push({
      id: id, userId: userId, sessionId: sessionId || null,
      content: content, source: 'mock', createdAt: S.now()
    });
    S.save();
    addLog(userId, '生成方案', 'career_plan', id);
    return ok({ id: id }, '方案已生成并保存。');
  }

  function listPlans(userId) {
    var check = requireRole('student');
    if (check.error) { return check.error; }
    if (check.user.id !== userId) {
      return fail('没有权限查看别人的方案。', 403);
    }
    var plans = db().plans.filter(function (p) { return p.userId === userId; })
      .sort(function (a, b) { return b.id - a.id; })
      .map(function (p) {
        var c = db().comments.filter(function (x) { return x.planId === p.id; })[0];
        return { id: p.id, createdAt: p.createdAt, source: p.source, hasComment: !!c };
      });
    return ok({ plans: plans, limit: 5 });
  }

  function getPlanDetail(userId, role, planId) {
    var plan = db().plans.filter(function (p) { return p.id === planId; })[0];
    if (!plan) { return fail('方案不存在。', 404); }
    if (role === 'student' && plan.userId !== userId) {
      return fail('没有权限查看别人的方案。', 403);
    }
    if (role === 'admin') {
      return fail('管理员没有查看方案正文的入口。', 403);
    }
    var owner = userById(plan.userId);
    var comment = db().comments.filter(function (c) { return c.planId === plan.id; })[0] || null;
    return ok({
      plan: plan, ownerName: owner ? owner.realName : '',
      comment: comment,
      teacherName: (function () {
        var t = comment ? userById(comment.teacherId) : null;
        return t ? t.realName : '';
      })()
    });
  }

  function deletePlan(userId, planId) {
    var check = requireRole('student');
    if (check.error) { return check.error; }
    var idx = -1;
    db().plans.forEach(function (p, i) {
      if (p.id === planId && p.userId === userId) { idx = i; }
    });
    if (idx < 0) { return fail('方案不存在，或不属于当前学生。'); }
    db().plans.splice(idx, 1);
    db().comments = db().comments.filter(function (c) { return c.planId !== planId; });
    S.save();
    addLog(userId, '删除方案', 'career_plan', planId);
    return ok(null, '方案已删除，相关评语一并删除。');
  }

  /* ---------------- 老师 ---------------- */

  function teacherSearch(keyword) {
    var check = requireRole('teacher');
    if (check.error) { return check.error; }
    var q = String(keyword || '').trim();
    var students = db().users.filter(function (u) {
      if (u.role !== 'student') { return false; }
      if (!q) { return true; }
      return u.realName.indexOf(q) >= 0 || u.studentNo.indexOf(q) >= 0;
    });
    var list = students.map(function (u) {
      var p = db().profiles[u.id] || null;
      var r = latestResult(u.id);
      var plans = db().plans.filter(function (x) { return x.userId === u.id; }).length;
      return {
        id: u.id, studentNo: u.studentNo, name: u.realName,
        grade: p ? p.grade : '', major: p ? p.major : '',
        completeFlag: p ? p.completeFlag : 0,
        planCount: plans,
        latest: r ? { top1: r.top1, top2: r.top2, scores: r.scores, at: r.at } : null
      };
    });
    return ok({ list: list });
  }

  function teacherStudentDetail(studentId) {
    var check = requireRole('teacher');
    if (check.error) { return check.error; }
    var u = userById(studentId);
    if (!u || u.role !== 'student') { return fail('学生不存在。', 404); }
    var p = db().profiles[studentId] || null;
    var r = latestResult(studentId);
    var plans = db().plans.filter(function (x) { return x.userId === studentId; })
      .sort(function (a, b) { return b.id - a.id; })
      .map(function (x) {
        var c = db().comments.filter(function (y) { return y.planId === x.id; })[0] || null;
        return {
          id: x.id, createdAt: x.createdAt, source: x.source,
          comment: c ? c.content : '',
          commentAt: c ? c.at : '',
          preview: x.content.replace(/【/g, '').replace(/】/g, ' ').replace(/\n+/g, ' ').slice(0, 46) + '…'
        };
      });
    return ok({
      student: { id: u.id, studentNo: u.studentNo, name: u.realName, status: u.status },
      profile: p,
      latest: r ? { top1: r.top1, top2: r.top2, scores: r.scores, at: r.at } : null,
      plans: plans
      /* 老师视图没有逐题答案，也没有聊天记录 */
    });
  }

  function saveComment(planId, content) {
    var check = requireRole('teacher');
    if (check.error) { return check.error; }
    var plan = db().plans.filter(function (p) { return p.id === planId; })[0];
    if (!plan) { return fail('方案不存在。', 404); }
    var text = String(content || '').trim();
    if (!text) { return fail('评语不能为空。'); }
    if (text.length > 200) {
      return fail('评语最多 200 字。');
    }
    var existing = db().comments.filter(function (c) { return c.planId === planId; })[0];
    if (existing) {
      existing.content = text;
      existing.at = S.now();
      existing.teacherId = check.user.id;
    } else {
      db().comments.push({ planId: planId, teacherId: check.user.id, content: text, at: S.now() });
    }
    S.save();
    return ok(null, '评语已保存。');
  }

  function teacherMessagesDenied() {
    /* 老师令牌访问消息接口：403，响应里没有正文 */
    return fail('没有权限：老师不能查看聊天记录。', 403);
  }

  /* ---------------- 管理员：题目 ---------------- */

  function adminQuestions() {
    var check = requireRole('admin');
    if (check.error) { return check.error; }
    var list = db().questions.slice().sort(function (a, b) { return a.sort - b.sort; });
    return ok({ questions: list, enabledCount: list.filter(function (q) { return q.enabled; }).length });
  }

  function addQuestion(payload) {
    var check = requireRole('admin');
    if (check.error) { return check.error; }
    var stem = String(payload.stem || '').trim();
    var a = String(payload.optionA || '').trim();
    var b = String(payload.optionB || '').trim();
    var ta = payload.typeA;
    var tb = payload.typeB;
    var codes = D.HOLLAND.map(function (h) { return h.code; });
    if (!stem) { return fail('题干不能为空。'); }
    if (!a || !b) { return fail('两个选项都要填写。'); }
    if (codes.indexOf(ta) < 0 || codes.indexOf(tb) < 0) {
      return fail('选项类型只能是 R、I、A、S、E、C。');
    }
    if (ta === tb) {
      return fail('两个选项的类型不能相同。');
    }
    var maxSort = db().questions.reduce(function (m, q) { return Math.max(m, q.sort); }, 0);
    db().questions.push({
      id: S.nextId('question'), stem: stem, optionA: a, typeA: ta,
      optionB: b, typeB: tb, sort: maxSort + 1, enabled: true, answered: false
    });
    S.save();
    addLog(check.user.id, '改题目', 'assessment_question', S.get().nextIds.question - 1);
    return ok(null, '题目已新增。');
  }

  function updateQuestion(id, payload) {
    var check = requireRole('admin');
    if (check.error) { return check.error; }
    var q = db().questions.filter(function (x) { return x.id === id; })[0];
    if (!q) { return fail('题目不存在。'); }
    if (q.answered) {
      return fail('这道题已经有人作答，只能停用，不能修改选项。');
    }
    var codes = D.HOLLAND.map(function (h) { return h.code; });
    var ta = payload.typeA || q.typeA;
    var tb = payload.typeB || q.typeB;
    if (codes.indexOf(ta) < 0 || codes.indexOf(tb) < 0) { return fail('选项类型只能是 R、I、A、S、E、C。'); }
    if (ta === tb) { return fail('两个选项的类型不能相同。'); }
    if (payload.stem) { q.stem = String(payload.stem).trim(); }
    if (payload.optionA) { q.optionA = String(payload.optionA).trim(); }
    if (payload.optionB) { q.optionB = String(payload.optionB).trim(); }
    q.typeA = ta;
    q.typeB = tb;
    S.save();
    addLog(check.user.id, '改题目', 'assessment_question', id);
    return ok(null, '题目已保存。');
  }

  function setQuestionEnabled(id, enabled) {
    var check = requireRole('admin');
    if (check.error) { return check.error; }
    var q = db().questions.filter(function (x) { return x.id === id; })[0];
    if (!q) { return fail('题目不存在。'); }
    q.enabled = !!enabled;
    S.save();
    addLog(check.user.id, '改题目', 'assessment_question', id);
    return ok(null, enabled ? '题目已启用。' : '题目已停用。');
  }

  /* ---------------- 管理员：方向 ---------------- */

  function adminDirections() {
    var check = requireRole('admin');
    if (check.error) { return check.error; }
    return ok({ directions: db().directions.slice() });
  }

  function addDirection(payload) {
    var check = requireRole('admin');
    if (check.error) { return check.error; }
    var name = String(payload.name || '').trim();
    var category = payload.category;
    var tags = payload.tags || [];
    var summary = String(payload.summary || '').trim();
    var actions = (payload.actions || []).map(function (a) { return String(a || '').trim(); }).filter(Boolean);
    if (!name) { return fail('方向名称不能为空。'); }
    if (db().directions.some(function (d) { return d.name === name; })) {
      return fail('方向名称不能重复。');
    }
    if (D.DIRECTION_CATEGORIES.indexOf(category) < 0) {
      return fail('方向类别只能是就业、考研、考公、创业。');
    }
    var codes = D.HOLLAND.map(function (h) { return h.code; });
    if (!tags.length || tags.some(function (t) { return codes.indexOf(t) < 0; })) {
      return fail('类型标签只能是 R、I、A、S、E、C 中的字母。');
    }
    if (summary.length > 200) { return fail('简介最多 200 字。'); }
    if (actions.length !== 2) { return fail('请填写两条在校可做的事。'); }
    db().directions.push({
      id: S.nextId('direction'), name: name, category: category,
      tags: tags.slice(), summary: summary, actions: actions, status: 1
    });
    S.save();
    addLog(check.user.id, '改方向', 'direction_item', S.get().nextIds.direction - 1);
    return ok(null, '方向已新增。');
  }

  function setDirectionStatus(id, status) {
    var check = requireRole('admin');
    if (check.error) { return check.error; }
    var d = directionById(id);
    if (!d) { return fail('方向不存在。'); }
    d.status = status ? 1 : 0;
    S.save();
    addLog(check.user.id, '改方向', 'direction_item', id);
    return ok(null, status ? '方向已上架。' : '方向已下架，之后的推荐里不再出现。');
  }

  /* ---------------- 管理员：公告 ---------------- */

  function announcementsForStudent() {
    return db().announcements.filter(function (a) { return !a.offline; })
      .sort(function (a, b) {
        if (a.pinned !== b.pinned) { return a.pinned ? -1 : 1; }
        return b.id - a.id;
      });
  }

  function adminAnnouncements() {
    var check = requireRole('admin');
    if (check.error) { return check.error; }
    return ok({
      announcements: db().announcements.slice().sort(function (a, b) {
        if (a.pinned !== b.pinned) { return a.pinned ? -1 : 1; }
        return b.id - a.id;
      })
    });
  }

  function addAnnouncement(payload) {
    var check = requireRole('admin');
    if (check.error) { return check.error; }
    var title = String(payload.title || '').trim();
    var content = String(payload.content || '').trim();
    if (!title) { return fail('公告标题不能为空。'); }
    if (title.length > 40) { return fail('公告标题最多 40 字。'); }
    if (!content) { return fail('公告正文不能为空。'); }
    if (content.length > 500) { return fail('公告正文最多 500 字。'); }
    db().announcements.push({
      id: S.nextId('announcement'), title: title, content: content,
      pinned: !!payload.pinned, offline: false, at: S.now()
    });
    S.save();
    return ok(null, '公告已发布。');
  }

  function setAnnouncementOffline(id, offline) {
    var check = requireRole('admin');
    if (check.error) { return check.error; }
    var a = db().announcements.filter(function (x) { return x.id === id; })[0];
    if (!a) { return fail('公告不存在。'); }
    a.offline = !!offline;
    S.save();
    return ok(null, offline ? '公告已下线，学生首页不再显示。' : '公告已恢复显示。');
  }

  function toggleAnnouncementPin(id) {
    var check = requireRole('admin');
    if (check.error) { return check.error; }
    var a = db().announcements.filter(function (x) { return x.id === id; })[0];
    if (!a) { return fail('公告不存在。'); }
    a.pinned = !a.pinned;
    S.save();
    return ok(null, a.pinned ? '已置顶。' : '已取消置顶。');
  }

  /* ---------------- 管理员：参数、统计、日志 ---------------- */

  function getConfig() {
    var check = requireRole('admin');
    if (check.error) { return check.error; }
    /* 页面和接口都不出现密钥 */
    return ok({ config: JSON.parse(JSON.stringify(db().config)) });
  }

  function saveConfig(payload) {
    var check = requireRole('admin');
    if (check.error) { return check.error; }
    var timeout = Number(payload.timeout);
    if (!isFinite(timeout) || timeout < 5 || timeout > 60) {
      return fail('超时时间只能是 5～60 秒。');
    }
    var c = db().config;
    c.apiUrl = String(payload.apiUrl || '').trim();
    c.modelName = String(payload.modelName || '').trim();
    c.timeout = Math.round(timeout);
    c.assistantOn = !!payload.assistantOn;
    c.mockOn = !!payload.mockOn;
    c.disclaimer = String(payload.disclaimer || '').trim();
    S.save();
    addLog(check.user.id, '改参数', 'sys_config', '-');
    return ok(null, '参数已保存，开关对学生端立即生效。');
  }

  function stats() {
    var check = requireRole('admin');
    if (check.error) { return check.error; }
    var students = db().users.filter(function (u) { return u.role === 'student'; });
    var complete = students.filter(function (u) {
      var p = db().profiles[u.id];
      return p && p.completeFlag === 1;
    }).length;
    var assessed = students.filter(function (u) { return (db().results[u.id] || []).length > 0; }).length;
    var plans = db().plans.length;
    return ok({
      studentCount: students.length,
      disabledCount: students.filter(function (u) { return u.status === 0; }).length,
      completeCount: complete,
      assessedCount: assessed,
      planCount: plans
    });
  }

  function listLogs(filter) {
    var check = requireRole('admin');
    if (check.error) { return check.error; }
    var userId = filter && filter.userId ? Number(filter.userId) : null;
    var action = filter && filter.action ? filter.action : '';
    var list = db().logs.filter(function (l) {
      if (userId && l.userId !== userId) { return false; }
      if (action && l.action !== action) { return false; }
      return true;
    }).map(function (l) {
      var u = l.userId ? userById(l.userId) : null;
      return {
        id: l.id, action: l.action, targetType: l.targetType, targetId: l.targetId,
        ip: l.ip, at: l.at,
        operator: u ? u.realName + '（' + u.studentNo + '）' : '匿名'
        /* 日志没有聊天正文字段 */
      };
    });
    return ok({ logs: list, students: db().users.filter(function (u) { return u.role === 'student'; }).map(function (u) { return { id: u.id, name: u.realName, studentNo: u.studentNo }; }) });
  }

  function resetPassword(studentId) {
    var check = requireRole('admin');
    if (check.error) { return check.error; }
    var u = userById(studentId);
    if (!u || u.role !== 'student') { return fail('学生不存在。'); }
    u.password = 'Stu123456';
    u.failCount = 0;
    u.lockedUntil = 0;
    S.save();
    addLog(check.user.id, '重置密码', 'sys_user', studentId);
    return ok(null, '密码已重置并解锁（原型里新密码为 Stu123456，正式版由后端生成并只在提示里出现）。');
  }

  window.API = {
    ok: ok, fail: fail,
    currentUser: currentUser,
    typeName: typeName,
    maskPhone: maskPhone,
    latestResult: latestResult,
    register: register,
    login: login,
    logout: logout,
    getProfile: getProfile,
    saveProfile: saveProfile,
    getAssessmentPage: getAssessmentPage,
    submitAssessment: submitAssessment,
    getResultPage: getResultPage,
    getDirectionsPage: getDirectionsPage,
    toggleFavorite: toggleFavorite,
    getChatPage: getChatPage,
    listSessions: listSessions,
    messagesOf: messagesOf,
    createSession: createSession,
    renameSession: renameSession,
    deleteSession: deleteSession,
    sendMessage: sendMessage,
    generatePlan: generatePlan,
    planPreconditions: planPreconditions,
    listPlans: listPlans,
    getPlanDetail: getPlanDetail,
    deletePlan: deletePlan,
    teacherSearch: teacherSearch,
    teacherStudentDetail: teacherStudentDetail,
    saveComment: saveComment,
    teacherMessagesDenied: teacherMessagesDenied,
    adminQuestions: adminQuestions,
    addQuestion: addQuestion,
    updateQuestion: updateQuestion,
    setQuestionEnabled: setQuestionEnabled,
    adminDirections: adminDirections,
    addDirection: addDirection,
    setDirectionStatus: setDirectionStatus,
    announcementsForStudent: announcementsForStudent,
    adminAnnouncements: adminAnnouncements,
    addAnnouncement: addAnnouncement,
    setAnnouncementOffline: setAnnouncementOffline,
    toggleAnnouncementPin: toggleAnnouncementPin,
    getConfig: getConfig,
    saveConfig: saveConfig,
    stats: stats,
    listLogs: listLogs,
    resetPassword: resetPassword
  };
})();
