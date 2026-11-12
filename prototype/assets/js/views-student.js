/* CareerPilot 产品原型 · 学生端页面（含登录注册） */
(function () {
  'use strict';

  var D = window.CAREER_DATA;
  var T = D.TEXTS;
  var UI = window.UI;
  var API = window.API;
  var S = window.Store;
  var esc = UI.esc;

  var Views = window.Views = window.Views || {};
  var AppState = window.AppState = window.AppState || { chatSessionId: null };

  function uid() { return S.session().userId; }

  function badge(text, kind) { return '<span class="badge ' + (kind || '') + '">' + text + '</span>'; }

  /* ================= P-01 注册 / 登录 ================= */

  Views.auth = function (root, params) {
    var mode = (params && params.mode) === 'register' ? 'register' : 'login';
    var isReg = mode === 'register';
    root.className = 'app-root';
    root.innerHTML = '' +
      '<div class="auth-wrap">' +
        '<section class="auth-hero">' +
          '<div class="auth-brand">' +
            '<div class="brand-mark">CP</div>' +
            '<div><div class="auth-brand-name">CareerPilot</div>' +
            '<div class="brand-sub">大学生职业生涯规划系统</div></div>' +
          '</div>' +
          '<h1>把档案、测评、方向和规划方案<br>放在一个页面里</h1>' +
          '<p class="lead">围绕一次简化测评和一个规划助手，帮你在就业、考研、考公和创业之间把思路理清楚。</p>' +
          '<div class="auth-feature">' +
            '<div><span class="tick">✓</span><span>学业档案只记必要信息，成绩只收档次</span></div>' +
            '<div><span class="tick">✓</span><span>测评自编 24 题，计分不调用大模型</span></div>' +
            '<div><span class="tick">✓</span><span>方向推荐按规则计分，理由用统一模板</span></div>' +
            '<div><span class="tick">✓</span><span>方案可保存、可打印，老师能写评语</span></div>' +
          '</div>' +
          '<div class="hero-foot">' + T.T02 + ' · 本系统为软件实训课程项目，不替代老师咨询。</div>' +
        '</section>' +
        '<section class="auth-panel">' +
          '<div class="auth-card">' +
            '<div class="brand-row">' +
              '<span class="badge badge-demo">' + T.T02 + '</span>' +
              '<span class="badge badge-muted">产品原型 · 数据仅存本机</span>' +
            '</div>' +
            '<h2 class="auth-title">' + (isReg ? '学生注册' : '学生登录') + '</h2>' +
            '<p class="auth-sub">' + (isReg ? '只有学生可以在这里注册，注册后请回到登录页。' : '使用学号和密码登录。登录后 8 小时无操作需要重新登录。') + '</p>' +
            '<form id="auth-form" class="stack" novalidate>' +
              '<div class="field"><label>学号<span class="req">*</span></label>' +
                '<input type="text" id="f-student-no" inputmode="numeric" maxlength="11" placeholder="11 位数字学号" autocomplete="username">' +
                '<span class="hint">学号必须是 11 位数字，全库唯一。</span></div>' +
              '<div class="field"><label>密码<span class="req">*</span></label>' +
                '<input type="password" id="f-password" maxlength="16" placeholder="8～16 位，含字母和数字" autocomplete="' + (isReg ? 'new-password' : 'current-password') + '">' +
                '<span class="hint">' + (isReg ? '密码 8～16 位，必须同时包含字母和数字。' : '密码输入以圆点遮蔽，库中只存哈希。') + '</span></div>' +
              (isReg ? '<div class="notice notice-accent">注册范围：只有学生可以在此注册；老师由初始化或管理员创建；管理员来自初始化脚本。本系统不提供短信、邮箱找回密码和学校统一身份认证。</div>' : '') +
              '<button class="btn btn-primary btn-block" type="submit" id="auth-submit">' + (isReg ? '注册' : '登录') + '</button>' +
            '</form>' +
            '<p class="auth-switch">' +
              (isReg ? '<button class="btn-link" id="to-login">返回登录</button>' : '还没有账号？<button class="btn-link" id="to-register">切换到注册</button>') +
            '</p>' +
            (isReg ? '' :
              '<div class="demo-box">' +
                '<div class="demo-title">原型演示快捷登录（正式版页面不提供）</div>' +
                '<div class="row">' +
                  '<button class="btn btn-ghost btn-sm" data-demo="student">学生</button>' +
                  '<button class="btn btn-ghost btn-sm" data-demo="teacher">就业指导老师</button>' +
                  '<button class="btn btn-ghost btn-sm" data-demo="admin">管理员</button>' +
                '</div>' +
                '<div class="demo-note">演示账号写在 prototype/README.md 里，网页上不显示密码。</div>' +
              '</div>') +
          '</div>' +
        '</section>' +
      '</div>';

    var form = root.querySelector('#auth-form');
    var noInput = root.querySelector('#f-student-no');
    var pwdInput = root.querySelector('#f-password');

    function go(role) {
      var home = role === 'student' ? '#/home' : (role === 'teacher' ? '#/teacher/students' : '#/admin/library');
      window.location.hash = home;
    }

    form.onsubmit = function (e) {
      e.preventDefault();
      var payload = { studentNo: noInput.value, password: pwdInput.value };
      var res = isReg ? API.register(payload) : API.login(payload);
      if (!res.ok) {
        UI.toast(res.msg, 'error');
        return;
      }
      UI.toast(res.msg, 'ok');
      if (isReg) {
        window.location.hash = '#/login';
      } else {
        go(res.data.role);
      }
    };

    if (isReg) {
      root.querySelector('#to-login').onclick = function () { window.location.hash = '#/login'; };
    } else {
      root.querySelector('#to-register').onclick = function () { window.location.hash = '#/login/register'; };
    }

    var demoBtns = root.querySelectorAll('[data-demo]');
    Array.prototype.forEach.call(demoBtns, function (btn) {
      btn.onclick = function () {
        var key = btn.getAttribute('data-demo');
        var acc = D.DEMO_ACCOUNTS[key];
        var res = API.login(acc);
        if (!res.ok) { UI.toast(res.msg, 'error'); return; }
        UI.toast('已用演示账号登录：' + UI.roleName(res.data.role), 'ok');
        go(res.data.role);
      };
    });
  };

  /* ================= P-02 学生首页 ================= */

  Views.home = function (root) {
    var user = API.currentUser();
    var profileRes = API.getProfile(user.id);
    var profile = profileRes.ok ? profileRes.data.profile : null;
    var resultRes = API.getResultPage(user.id);
    var latest = resultRes.ok ? resultRes.data.latest : null;
    var anns = API.announcementsForStudent();
    var sessions = API.listSessions(user.id);

    var missing = [];
    if (profile) {
      if (!profile.name) { missing.push('姓名'); }
      if (!profile.grade) { missing.push('年级'); }
      if (!profile.major) { missing.push('专业'); }
      if (!profile.preference) { missing.push('去向偏好'); }
    }
    var complete = profile && profile.completeFlag === 1;

    var statusHtml = complete
      ? '<div class="status-item"><span class="st-title">档案已完成</span>' +
        '<span class="st-flag">' + badge('已完成', 'badge-ok') + '</span></div>'
      : '<div class="status-item"><span><span class="st-title">档案未完成</span>' +
        '<div class="st-sub">还缺：' + (missing.length ? missing.join('、') : '暂无') + '</div></span>' +
        '<span class="st-flag"><a class="btn btn-ghost btn-sm" href="#/profile">去补全</a></span></div>';

    var resultHtml = latest
      ? '<div class="status-item"><span><span class="st-title">最近一次测评</span>' +
        '<div class="st-sub">' + esc(latest.at) + ' · 前两型：' + UI.typeName(latest.top1) + '、' + UI.typeName(latest.top2) + '</div></span>' +
        '<span class="st-flag"><a class="btn btn-ghost btn-sm" href="#/assessment/result">看结果</a></span></div>'
      : '<div class="status-item"><span><span class="st-title">最近一次测评</span>' +
        '<div class="st-sub">还没有测评记录，先完成一次测评。</div></span>' +
        '<span class="st-flag"><a class="btn btn-ghost btn-sm" href="#/assessment">去测评</a></span></div>';

    var annHtml = anns.length ? anns.map(function (a) {
      return '<div class="ann-item"><div class="ann-title">' +
        (a.pinned ? badge('置顶', 'badge-warn') : '') + esc(a.title) + '</div>' +
        '<div class="ann-body">' + esc(a.content) + '</div>' +
        '<div class="ann-meta">' + esc(a.at) + '</div></div>';
    }).join('') : UI.empty('暂无公告。');

    root.innerHTML = UI.pageHead('学生首页',
      '先看清自己的档案、测评和最近的方向，再决定从哪一步开始。',
      badge(T.T02, 'badge-demo')) +
      '<div class="stack">' +
        UI.declaration() +
        '<div class="grid grid-3">' +
          '<div class="card hero-card">' +
            '<h2>欢迎回来，' + esc(user.realName) + '</h2>' +
            '<p>' + (complete ? '你的档案已经完整，可以继续测评、对话和生成方案。' : '档案还差几项，先把必填项补齐。') + '</p>' +
            '<div class="hero-meta">' +
              '<div>已保存方案<strong>' + API.listPlans(user.id).data.plans.length + ' / 5</strong></div>' +
              '<div>会话数<strong>' + sessions.length + '</strong></div>' +
            '</div>' +
          '</div>' +
          '<div class="card">' +
            '<div class="card-head"><span class="card-title">档案状态</span>' +
              '<span class="spacer"></span><a class="btn-link" href="#/profile">学业档案</a></div>' +
            '<div class="status-list">' + statusHtml + '</div>' +
          '</div>' +
          '<div class="card">' +
            '<div class="card-head"><span class="card-title">最近测评</span>' +
              '<span class="spacer"></span><a class="btn-link" href="#/assessment/result">全部记录</a></div>' +
            '<div class="status-list">' + resultHtml + '</div>' +
          '</div>' +
        '</div>' +
        '<div class="grid grid-2">' +
          '<div class="card">' +
            '<div class="card-head"><span class="card-title">公告</span><span class="spacer"></span>' +
              badge(T.T02, 'badge-demo') + '</div>' +
            '<div class="ann-list">' + annHtml + '</div>' +
          '</div>' +
          '<div class="card">' +
            '<div class="card-head"><span class="card-title">接下来做什么</span></div>' +
            '<div class="stack">' +
              '<a class="btn btn-primary btn-block" href="#/chat">继续对话</a>' +
              '<a class="btn btn-ghost btn-block" href="#/assessment">做一次职业意向测评</a>' +
              '<a class="btn btn-ghost btn-block" href="#/directions">查看方向与收藏</a>' +
              '<div class="hint" style="color:var(--muted);font-size:12px">生成方案需要同时满足：档案完成、至少一次测评、推荐至少 1 条、已保存方案少于 5 份。</div>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>';
  };

  /* ================= P-03 学业档案 ================= */

  Views.profile = function (root) {
    var user = API.currentUser();
    var res = API.getProfile(user.id);
    if (!res.ok) { root.innerHTML = UI.notice(res.msg, 'danger'); return; }
    var p = res.data.profile;
    var phoneEditing = false;

    function missingList() {
      var m = [];
      if (!p.name) { m.push('姓名'); }
      if (!p.grade) { m.push('年级'); }
      if (!p.major) { m.push('专业'); }
      if (!p.preference) { m.push('去向偏好'); }
      return m;
    }

    function render() {
      var missing = missingList();
      var complete = p.completeFlag === 1;
      var banner = complete
        ? '<div class="complete-banner ok"><span class="cb-main">档案已完成（四项必填齐全），可以生成规划方案。</span></div>'
        : '<div class="complete-banner todo"><span class="cb-main">档案未完成，还缺：' + missing.join('、') + '。仍可保存，仍可对话，但生成方案按钮不可用。</span></div>';

      var phoneArea = phoneEditing
        ? '<input type="text" id="f-phone" maxlength="11" value="" placeholder="输入新的手机号">'
        : '<div class="row"><span style="font-size:13.5px">' + (p.phone ? esc(API.maskPhone(p.phone)) : '未填写') + '</span>' +
          '<button class="btn btn-ghost btn-sm" id="edit-phone" type="button">' + (p.phone ? '修改手机号' : '填写手机号') + '</button></div>' +
          '<span class="hint">保存后只按隐藏中间四位展示，再次打开看不到完整号码。</span>';

      root.innerHTML = UI.pageHead('学业档案', '必填四项：姓名、年级、专业、去向偏好。成绩只收档次，不收各科分数。') +
        banner +
        '<form class="card" id="profile-form">' +
          '<div class="form-grid">' +
            '<div class="field"><label>姓名<span class="req">*</span></label>' +
              '<input type="text" id="f-name" maxlength="20" value="' + esc(p.name) + '" placeholder="本人姓名"></div>' +
            '<div class="field"><label>年级<span class="req">*</span></label>' +
              '<input type="text" id="f-grade" maxlength="10" value="' + esc(p.grade) + '" placeholder="如：大三"></div>' +
            '<div class="field"><label>专业<span class="req">*</span></label>' +
              '<input type="text" id="f-major" maxlength="40" value="' + esc(p.major) + '" placeholder="如：软件工程"></div>' +
            '<div class="field"><label>去向偏好<span class="req">*</span></label>' +
              '<select id="f-preference">' + D.PREFERENCE_OPTIONS.map(function (o) {
                return '<option value="' + o + '"' + (p.preference === o ? ' selected' : '') + '>' + o + '</option>';
              }).join('') + '</select>' +
              '<span class="hint">只能选就业、考研、考公、创业、还没想好。</span></div>' +
            '<div class="field"><label>成绩档次</label>' +
              '<select id="f-rank">' + D.RANK_BAND_OPTIONS.map(function (o) {
                return '<option value="' + o + '"' + (p.rankBand === o ? ' selected' : '') + '>' + o + '</option>';
              }).join('') + '</select>' +
              '<span class="hint">成绩档次不参与档案完成判断。</span></div>' +
            '<div class="field"><label>性别</label><input type="text" id="f-gender" maxlength="4" value="' + esc(p.gender) + '"></div>' +
            '<div class="field"><label>班级</label><input type="text" id="f-class" maxlength="20" value="' + esc(p.className) + '"></div>' +
            '<div class="field"><label>手机号（选填）</label>' + phoneArea + '</div>' +
            '<div class="field"><label>邮箱（选填）</label><input type="text" id="f-email" maxlength="60" value="' + esc(p.email) + '"></div>' +
            '<div class="field"><label>意向城市（选填）</label><input type="text" id="f-city" maxlength="20" value="' + esc(p.city) + '"></div>' +
            '<div class="field span-2"><label>自我说明（选填，300 字以内）</label>' +
              '<textarea id="f-intro" maxlength="300" placeholder="简单写写自己的情况、优势和困惑">' + esc(p.intro) + '</textarea>' +
              '<span class="hint" id="intro-count">' + (p.intro ? p.intro.length : 0) + ' / 300</span></div>' +
          '</div>' +
          '<div class="row" style="margin-top:18px">' +
            '<button class="btn btn-primary" type="submit">保存档案</button>' +
            '<span class="hint" style="color:var(--muted);font-size:12px">四项必填齐全才会把 complete_flag 置为 1。</span>' +
          '</div>' +
        '</form>' +
        '<div class="notice notice-info" style="margin-top:16px">缺项提示会写清缺哪几项。缺专业时仍能保存，但生成方案按钮不可用；补全后若还没有测评，按钮旁会改为提示缺测评。</div>';

      var intro = root.querySelector('#f-intro');
      var count = root.querySelector('#intro-count');
      intro.oninput = function () {
        if (intro.value.length > 300) { intro.value = intro.value.slice(0, 300); }
        count.textContent = intro.value.length + ' / 300';
      };

      var editPhone = root.querySelector('#edit-phone');
      if (editPhone) {
        editPhone.onclick = function () { phoneEditing = true; render(); };
      }

      root.querySelector('#profile-form').onsubmit = function (e) {
        e.preventDefault();
        var form = {
          name: root.querySelector('#f-name').value,
          grade: root.querySelector('#f-grade').value,
          major: root.querySelector('#f-major').value,
          preference: root.querySelector('#f-preference').value,
          rankBand: root.querySelector('#f-rank').value,
          gender: root.querySelector('#f-gender').value,
          className: root.querySelector('#f-class').value,
          email: root.querySelector('#f-email').value,
          city: root.querySelector('#f-city').value,
          intro: root.querySelector('#f-intro').value
        };
        var phoneInput = root.querySelector('#f-phone');
        if (phoneInput && phoneInput.value.trim()) {
          if (!/^\d{11}$/.test(phoneInput.value.trim())) {
            UI.toast('手机号必须是 11 位数字。', 'error');
            return;
          }
          form.phone = phoneInput.value.trim();
        }
        var saveRes = API.saveProfile(user.id, form);
        if (!saveRes.ok) { UI.toast(saveRes.msg, 'error'); return; }
        phoneEditing = false;
        var fresh = API.getProfile(user.id);
        p = fresh.data.profile;
        UI.toast(saveRes.msg, saveRes.data.missing.length ? '' : 'ok');
        render();
        if (!saveRes.data.missing.length) {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      };
    }

    render();
  };

  /* ================= P-04 测评作答 ================= */

  Views.assessment = function (root) {
    var res = API.getAssessmentPage();
    if (!res.ok) { root.innerHTML = UI.notice(res.msg, 'danger'); return; }
    if (!res.data.available) {
      root.innerHTML = UI.pageHead('职业意向测评', '一次展示全部启用题，全部答完才能提交。') +
        '<div class="card" style="text-align:center;padding:56px 24px">' +
          '<div style="font-size:22px;font-weight:600;color:var(--primary)">' + T.T07 + '</div>' +
          '<p style="color:var(--muted);margin-top:10px">当前启用的题目少于 18 道，暂时不能作答。请联系管理员启用足够的题目。</p>' +
          '<p style="color:var(--muted);font-size:12.5px;margin-top:6px">已启用题目：' + res.data.questions.length + ' 道</p>' +
        '</div>';
      return;
    }

    var questions = res.data.questions;
    var answers = {};

    var body = questions.map(function (q, i) {
      return '<div class="q-card" data-qid="' + q.id + '">' +
        '<div class="q-head"><span class="q-no">' + (i + 1) + '</span>' +
          '<span class="q-stem">' + esc(q.stem) + '</span></div>' +
        '<div class="q-opts">' +
          '<label class="opt" data-opt="A"><input type="radio" name="q' + q.id + '" value="A"><span class="opt-key">A</span><span>' + esc(q.optionA) + '</span></label>' +
          '<label class="opt" data-opt="B"><input type="radio" name="q' + q.id + '" value="B"><span class="opt-key">B</span><span>' + esc(q.optionB) + '</span></label>' +
        '</div>' +
      '</div>';
    }).join('');

    root.innerHTML = UI.pageHead('职业意向测评',
      '共 ' + questions.length + ' 题，一次展示全部题目，全部答完才能提交。中途退出不会保留半份答案。',
      badge('计分不调用大模型', 'badge-muted')) +
      '<div class="card" style="position:sticky;top:74px;z-index:5;display:flex;align-items:center;gap:14px;padding:12px 18px;margin-bottom:14px">' +
        '<span style="font-size:13px">已答 <strong id="answered-count">0</strong> / ' + questions.length + ' 题</span>' +
        '<span class="hint" id="assess-hint" style="font-size:12.5px;color:var(--muted)">还有 ' + questions.length + ' 题未作答</span>' +
        '<span class="spacer" style="margin-left:auto"></span>' +
        '<button class="btn btn-primary" id="submit-assess" disabled>提交答卷</button>' +
      '</div>' +
      '<div class="grid grid-2">' + body + '</div>' +
      '<p style="color:var(--muted);font-size:12px;margin-top:16px">每人只保留最近 3 次测评记录；第 4 次提交时会删掉最早一次及其作答明细。</p>';

    function refresh() {
      var count = Object.keys(answers).length;
      root.querySelector('#answered-count').textContent = count;
      var left = questions.length - count;
      root.querySelector('#assess-hint').textContent = left ? '还有 ' + left + ' 题未作答' : '已经全部答完，可以提交';
      root.querySelector('#submit-assess').disabled = left > 0;
    }

    Array.prototype.forEach.call(root.querySelectorAll('.q-card'), function (card) {
      var qid = Number(card.getAttribute('data-qid'));
      Array.prototype.forEach.call(card.querySelectorAll('.opt'), function (opt) {
        opt.onclick = function () {
          answers[qid] = opt.getAttribute('data-opt');
          Array.prototype.forEach.call(card.querySelectorAll('.opt'), function (o) { o.classList.remove('checked'); });
          opt.classList.add('checked');
          opt.querySelector('input').checked = true;
          refresh();
        };
      });
    });

    root.querySelector('#submit-assess').onclick = function () {
      var res2 = API.submitAssessment(uid(), answers);
      if (!res2.ok) { UI.toast(res2.msg, 'error'); return; }
      UI.toast('提交成功，已生成测评结果。', 'ok');
      window.location.hash = '#/assessment/result';
    };
  };

  /* ================= P-05 测评结果 ================= */

  Views.assessmentResult = function (root) {
    var res = API.getResultPage(uid());
    if (!res.ok) { root.innerHTML = UI.notice(res.msg, 'danger'); return; }
    var latest = res.data.latest;
    if (!latest) {
      root.innerHTML = UI.pageHead('测评结果', '这里显示你的最近 3 次测评。') +
        UI.empty('还没有测评记录。<br><a class="btn btn-primary" style="margin-top:14px" href="#/assessment">去完成一次测评</a>');
      return;
    }
    var scores = latest.scores;
    var max = Math.max.apply(null, Object.keys(scores).map(function (k) { return scores[k]; })) || 1;
    var bars = D.HOLLAND.map(function (h) {
      var val = scores[h.code] || 0;
      var w = Math.max(4, Math.round(val / max * 100));
      var cls = (h.code === latest.top1 || h.code === latest.top2) ? 'accent' : '';
      return '<div class="score-row"><span>' + h.code + ' ' + h.name + '</span>' +
        '<div class="bar"><i class="' + cls + '" style="width:' + w + '%"></i></div>' +
        '<span style="text-align:right;color:var(--muted)">' + val + '</span></div>';
    }).join('');

    var history = res.data.list.map(function (r, i) {
      return '<tr><td>' + (i === 0 ? badge('最近一次', 'badge-ok') + ' ' : '') + esc(r.at) + '</td>' +
        '<td>' + UI.typeName(r.top1) + '、' + UI.typeName(r.top2) + '</td>' +
        '<td>R ' + r.scores.R + ' / I ' + r.scores.I + ' / A ' + r.scores.A + ' / S ' + r.scores.S + ' / E ' + r.scores.E + ' / C ' + r.scores.C + '</td></tr>';
    }).join('');

    root.innerHTML = UI.pageHead('测评结果', '结果只反映本次作答倾向，推荐和对话都使用最近一次结果。') +
      '<div class="stack">' +
        '<div class="card">' +
          '<div class="card-head"><span class="card-title">前两型</span>' +
            (latest.tie ? badge('本次出现并列，按 R、I、A、S、E、C 顺序截取', 'badge-warn') : '') + '</div>' +
          '<div class="top2">' +
            '<div class="t2-card"><div class="t2-rank">第 1 型</div>' +
              '<div class="t2-name">' + UI.typeName(latest.top1) + '（' + latest.top1 + '）</div>' +
              '<div class="t2-sub">得分 ' + (scores[latest.top1] || 0) + '</div></div>' +
            '<div class="t2-card"><div class="t2-rank">第 2 型</div>' +
              '<div class="t2-name">' + UI.typeName(latest.top2) + '（' + latest.top2 + '）</div>' +
              '<div class="t2-sub">得分 ' + (scores[latest.top2] || 0) + '</div></div>' +
          '</div>' +
        '</div>' +
        '<div class="grid grid-2">' +
          '<div class="card"><div class="card-head"><span class="card-title">六型得分</span></div>' +
            '<div class="score-bars">' + bars + '</div></div>' +
          '<div class="card"><div class="card-head"><span class="card-title">说明</span></div>' +
            '<div class="notice notice-warn" style="margin-bottom:12px">' + T.T03 + '</div>' +
            '<p style="font-size:13px;color:var(--ink-2)">测评是小组自编题，计分在后端完成，不调用大模型。结果用来参考方向，不作为心理诊断依据。</p>' +
            '<div class="row" style="margin-top:14px">' +
              '<a class="btn btn-primary" href="#/directions">查看方向与收藏</a>' +
              '<a class="btn btn-ghost" href="#/chat">去规划对话</a>' +
            '</div>' +
          '</div>' +
        '</div>' +
        '<div class="card"><div class="card-head"><span class="card-title">最近 3 次记录</span></div>' +
          '<table><thead><tr><th>时间</th><th>前两型</th><th>六型得分</th></tr></thead>' +
          '<tbody>' + history + '</tbody></table></div>' +
      '</div>';
  };

  /* ================= P-06 规划对话 ================= */

  Views.chat = function (root) {
    var user = API.currentUser();
    var chatRes = API.getChatPage(user.id);
    if (!chatRes.ok) { root.innerHTML = UI.notice(chatRes.msg, 'danger'); return; }
    var sessions = chatRes.data.sessions;
    if (!AppState.chatSessionId || !sessions.some(function (s) { return s.id === AppState.chatSessionId; })) {
      AppState.chatSessionId = sessions.length ? sessions[0].id : null;
    }
    render();

    function render() {
      var chat = API.getChatPage(user.id).data;
      var assistantOn = chat.assistantOn;
      var mockOn = chat.mockOn;
      var current = chat.sessions.filter(function (s) { return s.id === AppState.chatSessionId; })[0] || null;
      var messages = current ? API.messagesOf(current.id) : [];
      var pre = API.planPreconditions(user.id);
      var planCount = pre.plans.length;

      var sessionHtml = chat.sessions.length ? chat.sessions.map(function (s) {
        return '<button class="session-item' + (current && current.id === s.id ? ' active' : '') + '" data-sid="' + s.id + '">' +
          '<span class="s-title">' + esc(s.title) + '</span>' +
          '<span class="s-meta">' + esc(s.createdAt) + '</span>' +
        '</button>';
      }).join('') : '<div class="empty" style="padding:18px 10px">还没有会话，点下面的按钮新建。</div>';

      var msgHtml = messages.length ? messages.map(function (m) {
        var isUser = m.sender === 'user';
        return '<div class="msg ' + (isUser ? 'msg-user' : 'msg-ai') + '">' +
          '<div class="msg-meta">' + (isUser ? '我' : '规划助手') + ' · ' + esc(m.at) + '</div>' +
          (m.sender === 'assistant' && m.mock ? '<div class="notice notice-warn" style="padding:6px 10px;font-size:12px">' + T.T05 + '</div>' : '') +
          '<div class="bubble' + (m.mock ? ' mock' : '') + '">' + esc(m.content) + '</div>' +
        '</div>';
      }).join('') : '<div class="empty">还没有消息。先在下面写一句你的情况，再点发送。</div>';

      var missing = pre.missing;
      var genHint;
      if (!assistantOn) {
        genHint = T.T08 + '，暂时不能生成方案。';
      } else if (missing.length) {
        genHint = '还不能生成方案，缺：' + missing.join('、') + '。';
      } else if (!mockOn) {
        genHint = '前置条件已满足；当前未接入真实模型，可先让管理员打开模拟回复。';
      } else {
        genHint = '前置条件已满足，可以生成方案。';
      }

      root.innerHTML = UI.pageHead('规划对话', '一个助手，只依据你的档案、最近一次测评和当前推荐回答；不承诺录取或薪资。',
        badge('会话 ' + chat.sessions.length + ' 个', 'badge-muted')) +
        '<div class="stack">' +
          UI.declaration() +
          (chat.needAssessment ? '<div class="notice notice-warn">' + T.T04 + '</div>' : '') +
          (mockOn ? '<div class="notice notice-warn">' + T.T05 + '（管理端已打开模拟回复开关）</div>' : '') +
          (!mockOn && assistantOn ? '<div class="notice notice-info">原型没有接入真实模型：请先用管理员账号在「公告与参数」打开「模拟回复开关」，再回到这里发送消息；开关关闭时发送会按失败分支处理。</div>' : '') +
          (assistantOn ? '' : '<div class="notice notice-danger">' + T.T08 + '：助手开关已关闭，输入框不可用，也不能生成方案。档案和测评仍可正常使用。</div>') +
          '<div class="chat-layout">' +
            '<div class="card">' +
              '<div class="card-head"><span class="card-title">会话</span>' +
                '<span class="spacer"></span><span class="hint" style="font-size:12px;color:var(--muted)">' + chat.sessions.length + ' 个</span></div>' +
              '<div class="session-list">' + sessionHtml + '</div>' +
              '<div class="stack" style="margin-top:12px">' +
                '<input type="text" id="new-session-title" maxlength="20" placeholder="会话标题（可空，默认「新的规划对话」）">' +
                '<button class="btn btn-ghost btn-sm" id="btn-new-session">新建会话</button>' +
              '</div>' +
              (current ? '<div class="row" style="margin-top:10px">' +
                '<button class="btn btn-plain btn-sm" id="btn-rename-session">重命名</button>' +
                '<button class="btn btn-plain btn-sm" id="btn-del-session">删除会话</button>' +
              '</div>' : '') +
            '</div>' +
            '<div class="card chat-panel">' +
              '<div class="chat-head">' +
                '<span class="chat-title">' + (current ? esc(current.title) : '未选择会话') + '</span>' +
                '<span class="spacer"></span>' +
                (current ? badge('标题最多 20 字', 'badge-muted') : '') +
              '</div>' +
              '<div class="chat-body" id="chat-body">' + msgHtml + '</div>' +
              '<div class="chat-composer">' +
                '<div class="composer-row">' +
                  '<textarea id="chat-input" maxlength="500" placeholder="' + (assistantOn ? '说说你的情况，例如专业、纠结的选择、能投入的时间（1～500 字）' : T.T08 + '，输入框不可用') + '"' + (assistantOn ? '' : ' disabled') + '></textarea>' +
                  '<div class="composer-side">' +
                    '<button class="btn btn-primary" id="btn-send"' + (assistantOn ? '' : ' disabled') + '>发送</button>' +
                    '<button class="btn btn-accent" id="btn-generate"' + ((!assistantOn || missing.length) ? ' disabled' : '') + '>生成方案</button>' +
                  '</div>' +
                '</div>' +
                '<div class="composer-foot">' +
                  '<span>输入 <strong id="char-count">0</strong> / 500 字</span>' +
                  '<span class="gen-hint" id="gen-hint">' + genHint + '</span>' +
                '</div>' +
              '</div>' +
            '</div>' +
          '</div>' +
        '</div>';

      var body = root.querySelector('#chat-body');
      if (body) { body.scrollTop = body.scrollHeight; }
      var input = root.querySelector('#chat-input');
      var counter = root.querySelector('#char-count');
      if (input) {
        input.oninput = function () {
          if (input.value.length > 500) { input.value = input.value.slice(0, 500); }
          counter.textContent = input.value.length;
          counter.className = input.value.length > 500 ? 'counter warn' : 'counter';
        };
      }

      Array.prototype.forEach.call(root.querySelectorAll('[data-sid]'), function (btn) {
        btn.onclick = function () {
          AppState.chatSessionId = Number(btn.getAttribute('data-sid'));
          render();
        };
      });

      var newBtn = root.querySelector('#btn-new-session');
      if (newBtn) {
        newBtn.onclick = function () {
          var titleInput = root.querySelector('#new-session-title');
          var res = API.createSession(user.id, titleInput.value);
          if (!res.ok) { UI.toast(res.msg, 'error'); return; }
          AppState.chatSessionId = res.data.id;
          UI.toast(res.msg, 'ok');
          render();
        };
      }

      var renameBtn = root.querySelector('#btn-rename-session');
      if (renameBtn && current) {
        renameBtn.onclick = function () {
          var next = window.prompt('会话标题（可空，默认「新的规划对话」，最多 20 字）', current.title);
          if (next == null) { return; }
          var res = API.renameSession(user.id, current.id, next);
          UI.toast(res.msg, res.ok ? 'ok' : 'error');
          if (res.ok) { render(); }
        };
      }

      var delBtn = root.querySelector('#btn-del-session');
      if (delBtn && current) {
        delBtn.onclick = function () {
          UI.confirm({
            title: '删除会话', message: '删除后该会话从列表消失，统计不再计入。确认删除「' + current.title + '」吗？',
            danger: true, okText: '删除',
            onOk: function () {
              var res = API.deleteSession(user.id, current.id);
              UI.toast(res.msg, res.ok ? 'ok' : 'error');
              AppState.chatSessionId = null;
              render();
            }
          });
        };
      }

      var sendBtn = root.querySelector('#btn-send');
      if (sendBtn) {
        sendBtn.onclick = function () {
          if (!current) { UI.toast('请先新建一个会话。', 'error'); return; }
          var text = input.value;
          var res = API.sendMessage(user.id, current.id, text);
          if (!res.ok) { UI.toast(res.msg, 'error'); return; }
          UI.toast('已收到回复。', 'ok');
          render();
        };
      }

      var genBtn = root.querySelector('#btn-generate');
      if (genBtn) {
        genBtn.onclick = function () {
          if (!current) { UI.toast('请先新建一个会话。', 'error'); return; }
          var res = API.generatePlan(user.id, current.id);
          if (!res.ok) { UI.toast(res.msg, 'error'); return; }
          UI.toast(res.msg, 'ok');
          window.location.hash = '#/plans/' + res.data.id;
        };
      }
    }
  };

  /* ================= P-08 我的方案 ================= */

  Views.plans = function (root) {
    var res = API.listPlans(uid());
    if (!res.ok) { root.innerHTML = UI.notice(res.msg, 'danger'); return; }
    var plans = res.data.plans;

    function render() {
      var fresh = API.listPlans(uid()).data;
      var rows = fresh.plans.length ? fresh.plans.map(function (p) {
        return '<div class="plan-row" data-pid="' + p.id + '">' +
          '<div class="pr-main">' +
            '<div class="pr-title">规划方案 · ' + esc(p.createdAt) + '</div>' +
            '<div class="pr-meta">' +
              '<span>来源：' + (p.source === 'mock' ? '模拟回复' : '模型生成') + '</span>' +
              '<span>' + (p.hasComment ? '老师已写评语' : '暂无评语') + '</span>' +
            '</div>' +
          '</div>' +
          '<div class="pr-actions">' +
            '<a class="btn btn-ghost btn-sm" href="#/plans/' + p.id + '">查看详情</a>' +
            '<button class="btn btn-danger btn-sm" data-del="' + p.id + '">删除</button>' +
          '</div>' +
        '</div>';
      }).join('') : UI.empty('还没有保存方案。去规划对话生成一份，最多可以保存 5 份。');

      root.innerHTML = UI.pageHead('我的方案', '每份方案保存后正文不可修改，不满意可以重新生成。删除需要确认。',
        '<a class="btn btn-accent" href="#/chat">去生成方案</a>') +
        '<div class="stack">' +
          '<div class="notice ' + (fresh.plans.length >= 5 ? 'notice-warn' : 'notice-info') + '">' +
            '已保存 <strong>' + fresh.plans.length + '</strong> / 5 份' +
            (fresh.plans.length >= 5 ? '，已达上限。要生成新方案，请先删除一份。' : '。') +
          '</div>' +
          '<div class="card"><div class="plan-list">' + rows + '</div></div>' +
        '</div>';

      Array.prototype.forEach.call(root.querySelectorAll('[data-del]'), function (btn) {
        btn.onclick = function () {
          var planId = Number(btn.getAttribute('data-del'));
          UI.confirm({
            title: '删除方案',
            message: '删除后方案正文和老师评语一起删除，无法恢复。确认删除吗？',
            danger: true, okText: '确认删除',
            onOk: function () {
              var del = API.deletePlan(uid(), planId);
              UI.toast(del.msg, del.ok ? 'ok' : 'error');
              if (del.ok) { render(); }
            }
          });
        };
      });
    }

    render();
  };

  /* ================= P-07 方案详情 ================= */

  Views.planDetail = function (root, params) {
    var planId = Number(params && params.id);
    var session = S.session();
    var detail = API.getPlanDetail(session.userId, session.role, planId);
    if (!detail.ok) { root.innerHTML = UI.notice(detail.msg, 'danger') + '<a class="btn btn-ghost" href="#/plans">返回我的方案</a>'; return; }
    var plan = detail.data.plan;
    var comment = detail.data.comment;
    var isTeacher = session.role === 'teacher';

    function contentHtml() {
      return plan.content.split('\n').map(function (line) {
        var isHead = T.T09_LIST.indexOf(line.trim()) >= 0;
        return '<div class="' + (isHead ? 'plan-h' : '') + '">' + (line ? esc(line) : '&nbsp;') + '</div>';
      }).join('');
    }

    function render() {
      var fresh = API.getPlanDetail(session.userId, session.role, planId);
      if (!fresh.ok) { root.innerHTML = UI.notice(fresh.msg, 'danger'); return; }
      comment = fresh.data.comment;

      var commentHtml = comment
        ? '<div class="comment-box"><div class="row"><strong style="font-size:13px">老师评语</strong>' +
          '<span class="badge badge-muted">' + esc(fresh.data.teacherName) + '</span>' +
          '<span class="spacer" style="margin-left:auto"></span>' +
          '<span class="hint" style="font-size:12px;color:var(--muted)">' + esc(comment.at) + '</span></div>' +
          '<p style="margin-top:8px;font-size:13.5px;white-space:pre-wrap">' + esc(comment.content) + '</p></div>'
        : '<div class="comment-box"><span class="hint" style="color:var(--muted);font-size:13px">老师还没有写评语。</span></div>';

      var teacherForm = isTeacher
        ? '<div class="card"><div class="card-head"><span class="card-title">写评语</span>' +
          '<span class="spacer"></span><span class="hint" style="font-size:12px;color:var(--muted)">1～200 字</span></div>' +
          '<textarea id="comment-input" maxlength="200" placeholder="给这份方案写一句可执行的建议">' + (comment ? esc(comment.content) : '') + '</textarea>' +
          '<div class="row" style="margin-top:12px">' +
            '<button class="btn btn-primary" id="save-comment">保存评语</button>' +
            '<span class="hint" style="font-size:12px;color:var(--muted)" id="comment-count">' + (comment ? comment.content.length : 0) + ' / 200</span>' +
          '</div></div>'
        : '';

      root.innerHTML = UI.pageHead('方案详情',
        '学生和老师都能查看已保存方案；正文不可编辑，不满意就重新生成。',
        badge(T.T02, 'badge-demo') +
          '<button class="btn btn-primary" id="btn-print">打印</button>') +
        '<div class="stack">' +
          UI.declaration() +
          '<div class="card" id="plan-sheet">' +
            '<div class="plan-sheet-head">' +
              '<div class="ps-title">CareerPilot 规划方案</div>' +
              '<div class="ps-sub">' + T.T02 + ' · ' + T.T01 + '</div>' +
            '</div>' +
            '<div class="row" style="margin-bottom:8px">' +
              (plan.source === 'mock' ? badge('来源：模拟回复', 'badge-warn') : badge('来源：模型生成', 'badge-ok')) +
              '<span class="hint" style="font-size:12px;color:var(--muted)">生成时间：' + esc(plan.createdAt) + '</span>' +
              (isTeacher ? badge('老师视图 · 无查看对话入口', 'badge-muted') : '') +
              '<span class="spacer" style="margin-left:auto"></span>' +
              badge('正文不可编辑', 'badge-muted') +
            '</div>' +
            '<div class="plan-content">' + contentHtml() + '</div>' +
            '<div style="margin-top:18px">' + commentHtml + '</div>' +
          '</div>' +
          teacherForm +
          (isTeacher ? '' : '<div class="notice notice-info">正文不可编辑。若需要调整，请回到规划对话重新生成一份新的方案。</div>') +
        '</div>';

      root.querySelector('#btn-print').onclick = function () { window.print(); };

      var saveBtn = root.querySelector('#save-comment');
      if (saveBtn) {
        var input = root.querySelector('#comment-input');
        var count = root.querySelector('#comment-count');
        input.oninput = function () {
          if (input.value.length > 200) { input.value = input.value.slice(0, 200); }
          count.textContent = input.value.length + ' / 200';
        };
        saveBtn.onclick = function () {
          function doSave() {
            var res = API.saveComment(planId, input.value);
            UI.toast(res.msg, res.ok ? 'ok' : 'error');
            if (res.ok) { render(); }
          }
          if (comment) {
            UI.confirm({
              title: '覆盖评语',
              message: '这个方案已经有一条评语，保存会覆盖原来的评语。确认覆盖吗？',
              okText: '覆盖保存',
              onOk: doSave
            });
          } else {
            doSave();
          }
        };
      }
    }

    render();
  };

  /* ================= P-09 方向与收藏 ================= */

  Views.directions = function (root) {
    var user = API.currentUser();
    var res = API.getDirectionsPage(user.id);
    if (!res.ok) { root.innerHTML = UI.notice(res.msg, 'danger'); return; }
    var data = res.data;

    function render() {
      var fresh = API.getDirectionsPage(user.id).data;
      var rec = fresh.recommendation;
      var recHtml;
      if (rec.needAssessment) {
        recHtml = '<div class="card" style="text-align:center;padding:40px 24px">' +
          '<p style="font-size:14px;color:var(--ink-2)">还没有测评记录，暂时没有推荐结果。推荐需要用到你最近一次测评的前两型。</p>' +
          '<a class="btn btn-primary" style="margin-top:14px" href="#/assessment">先完成一次测评</a></div>';
      } else if (!rec.list.length) {
        recHtml = UI.empty('按当前档案和测评结果，暂时没有匹配的方向。可以先把档案里的去向偏好补上。');
      } else {
        recHtml = '<div class="grid grid-3">' + rec.list.map(function (d) {
          var fav = fresh.favoriteIds.indexOf(d.id) >= 0;
          return '<div class="dir-card">' +
            '<div class="dir-head"><span class="dir-name">' + esc(d.name) + '</span>' +
              badge(d.category, 'badge-muted') + '</div>' +
            '<div class="dir-tags">' + d.tags.map(function (t) { return '<span class="tag">' + t + ' ' + UI.typeName(t) + '</span>'; }).join('') + '</div>' +
            '<div class="dir-reason">' + T.T10 + '</div>' +
            '<div class="dir-summary">' + esc(d.summary) + '</div>' +
            '<div class="dir-actions"><span style="color:var(--muted);font-size:12px">在校可做的事</span><ul>' +
              d.actions.map(function (a) { return '<li>' + esc(a) + '</li>'; }).join('') + '</ul></div>' +
            '<div class="dir-foot">' +
              '<button class="btn ' + (fav ? 'btn-ghost' : 'btn-primary') + ' btn-sm" data-fav="' + d.id + '">' + (fav ? '已收藏 · 取消' : '收藏') + '</button>' +
              '<span class="hint" style="font-size:12px;color:var(--muted)">得分 ' + d.score + '</span>' +
            '</div>' +
          '</div>';
        }).join('') + '</div>';
      }

      var favHtml = fresh.favorites.length ? '<div class="grid grid-2">' + fresh.favorites.map(function (d) {
        return '<div class="dir-card">' +
          '<div class="dir-head"><span class="dir-name">' + esc(d.name) + '</span>' +
            badge(d.category, 'badge-muted') +
            (d.offline ? badge('已下架', 'badge-warn') : '') + '</div>' +
          '<div class="dir-summary">' + esc(d.summary) + '</div>' +
          '<div class="dir-foot">' +
            (d.offline
              ? '<span class="hint" style="font-size:12px;color:var(--muted)">方向已下架，保留在收藏里，不能再次收藏。</span>'
              : '<button class="btn btn-ghost btn-sm" data-unfav="' + d.id + '">取消收藏</button>') +
          '</div>' +
        '</div>';
      }).join('') + '</div>' : UI.empty('还没有收藏任何方向。在推荐卡片上点「收藏」即可加入这里。');

      root.innerHTML = UI.pageHead('方向与收藏',
        '推荐在后端按规则打分：方向标签与测评前两型每重合一个加 2 分，类别与去向偏好相同加 3 分，取大于 0 分的前 3 名。理由用统一模板，不出现薪资和录取概率。',
        badge('最多 3 条推荐', 'badge-muted')) +
        '<div class="stack">' +
          '<div class="card"><div class="card-head"><span class="card-title">推荐方向</span>' +
            '<span class="spacer"></span><span class="hint" style="font-size:12px;color:var(--muted)">规则打分，不交给模型</span></div>' +
            recHtml + '</div>' +
          '<div class="card"><div class="card-head"><span class="card-title">我的收藏</span>' +
            '<span class="spacer"></span><span class="hint" style="font-size:12px;color:var(--muted)">' + fresh.favorites.length + ' 条</span></div>' +
            favHtml + '</div>' +
        '</div>';

      Array.prototype.forEach.call(root.querySelectorAll('[data-fav],[data-unfav]'), function (btn) {
        btn.onclick = function () {
          var dirId = Number(btn.getAttribute('data-fav') || btn.getAttribute('data-unfav'));
          var favRes = API.toggleFavorite(user.id, dirId);
          UI.toast(favRes.msg, favRes.ok ? 'ok' : 'error');
          if (favRes.ok) { render(); }
        };
      });
    }

    render();
  };
})();
