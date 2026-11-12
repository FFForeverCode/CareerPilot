/* CareerPilot 产品原型 · 老师端与管理端页面 */
(function () {
  'use strict';

  var D = window.CAREER_DATA;
  var T = D.TEXTS;
  var UI = window.UI;
  var API = window.API;
  var esc = UI.esc;
  var Views = window.Views = window.Views || {};

  function badge(text, kind) { return '<span class="badge ' + (kind || '') + '">' + text + '</span>'; }
  function typeName(c) { return UI.typeName(c); }

  /* ================= P-10 学生方案（老师） ================= */

  Views.teacherStudents = function (root) {
    var keyword = '';
    var selectedId = null;

    function render() {
      var listRes = API.teacherSearch(keyword);
      if (!listRes.ok) { root.innerHTML = UI.notice(listRes.msg, 'danger'); return; }
      var list = listRes.data.list;
      var selected = null;
      if (selectedId) {
        var d = API.teacherStudentDetail(selectedId);
        if (d.ok) { selected = d.data; }
      }

      var rows = list.length ? list.map(function (s) {
        return '<tr><td><strong>' + esc(s.name) + '</strong></td>' +
          '<td>' + esc(s.studentNo) + '</td>' +
          '<td>' + esc(s.grade || '—') + ' / ' + esc(s.major || '—') + '</td>' +
          '<td>' + (s.completeFlag ? badge('已完成', 'badge-ok') : badge('未完成', 'badge-muted')) + '</td>' +
          '<td>' + (s.latest ? typeName(s.latest.top1) + '、' + typeName(s.latest.top2) : '未测评') + '</td>' +
          '<td>' + s.planCount + ' 份</td>' +
          '<td><button class="btn btn-ghost btn-sm" data-open="' + s.id + '">打开</button></td></tr>';
      }).join('') : '<tr><td colspan="7"><div class="empty">' + (keyword ? '没有匹配的学生。可以按姓名或学号再查一次。' : '输入姓名或学号查询学生。') + '</div></td></tr>';

      var detailHtml = '';
      if (selected) {
        var p = selected.profile || {};
        var latest = selected.latest;
        var scores = latest ? latest.scores : null;
        var plans = selected.plans;
        var planRows = plans.length ? plans.map(function (pl) {
          return '<tr><td>规划方案 · ' + esc(pl.createdAt) + '</td>' +
            '<td>' + (pl.source === 'mock' ? badge('模拟回复', 'badge-warn') : badge('模型生成', 'badge-ok')) + '</td>' +
            '<td style="max-width:280px;color:var(--ink-2);font-size:12.5px">' + esc(pl.preview) + '</td>' +
            '<td style="max-width:260px;font-size:12.5px">' + (pl.comment ? esc(pl.comment) + '<div class="hint" style="font-size:11.5px;color:var(--muted);margin-top:2px">' + esc(pl.commentAt) + '</div>' : '<span style="color:var(--muted)">暂无评语</span>') + '</td>' +
            '<td><button class="btn btn-ghost btn-sm" data-comment="' + pl.id + '">' + (pl.comment ? '修改评语' : '写评语') + '</button>' +
            '<a class="btn btn-plain btn-sm" href="#/plans/' + pl.id + '">看方案</a></td></tr>';
        }).join('') : '<tr><td colspan="5"><div class="empty">该生还没有保存方案。</div></td></tr>';

        detailHtml = '<div class="grid grid-2">' +
          '<div class="card"><div class="card-head"><span class="card-title">档案摘要</span>' +
            '<span class="spacer"></span>' + badge('只读，不能修改', 'badge-muted') + '</div>' +
            '<dl class="kv">' +
              '<dt>姓名</dt><dd>' + esc(p.name || '—') + '</dd>' +
              '<dt>学号</dt><dd>' + esc(selected.student.studentNo) + '</dd>' +
              '<dt>年级 / 专业</dt><dd>' + esc(p.grade || '—') + ' / ' + esc(p.major || '—') + '</dd>' +
              '<dt>去向偏好</dt><dd>' + esc(p.preference || '—') + '</dd>' +
              '<dt>成绩档次</dt><dd>' + esc(p.rankBand || '未填') + '</dd>' +
              '<dt>手机号</dt><dd>' + esc(API.maskPhone(p.phone) || '—') + '</dd>' +
              '<dt>档案状态</dt><dd>' + (p.completeFlag ? badge('已完成', 'badge-ok') : badge('未完成', 'badge-muted')) + '</dd>' +
            '</dl></div>' +
          '<div class="card"><div class="card-head"><span class="card-title">最近一次测评</span>' +
            '<span class="spacer"></span>' + badge('不含逐题答案', 'badge-muted') + '</div>' +
            (latest
              ? '<div class="top2" style="margin-bottom:12px">' +
                  '<div class="t2-card"><div class="t2-rank">第 1 型</div><div class="t2-name">' + typeName(latest.top1) + '</div></div>' +
                  '<div class="t2-card"><div class="t2-rank">第 2 型</div><div class="t2-name">' + typeName(latest.top2) + '</div></div>' +
                '</div>' +
                '<div class="hint" style="font-size:12.5px;color:var(--muted)">六型得分：R ' + scores.R + ' / I ' + scores.I + ' / A ' + scores.A + ' / S ' + scores.S + ' / E ' + scores.E + ' / C ' + scores.C + '　' + esc(latest.at) + '</div>'
              : '<div class="empty">该生还没有测评记录。</div>') +
            '<div class="notice notice-warn" style="margin-top:12px;font-size:12.5px">老师只能看最近一次的类型和得分，看不到逐题选项；页面上也没有「查看对话」入口。</div>' +
          '</div></div>' +
          '<div class="card"><div class="card-head"><span class="card-title">' + esc(selected.student.name) + ' 的方案</span>' +
            '<span class="spacer"></span><span class="hint" style="font-size:12px;color:var(--muted)">' + plans.length + ' 份 · 只能写评语，不能改正文</span></div>' +
            '<table><thead><tr><th>方案</th><th>来源</th><th>摘要</th><th>老师评语</th><th>操作</th></tr></thead>' +
            '<tbody>' + planRows + '</tbody></table></div>';
      }

      root.innerHTML = UI.pageHead('学生方案', '按姓名或学号查询学生，查看档案摘要、最近一次测评和已保存方案，并写 1～200 字的评语。',
        badge('老师视图', 'badge-muted')) +
        '<div class="stack">' +
          '<div class="notice notice-warn">权限约束：老师不能查看聊天记录，调用消息接口会返回 403 且响应里没有正文；方案正文对老师只读。</div>' +
          '<div class="card"><form class="row" id="search-form">' +
            '<input type="text" id="kw" placeholder="输入姓名或学号，例如「张小明」或「20230001001」" value="' + esc(keyword) + '" style="max-width:360px">' +
            '<button class="btn btn-primary" type="submit">查询</button>' +
            '<button class="btn btn-ghost" type="button" id="btn-all">显示全部学生</button>' +
            (selected ? '<button class="btn btn-plain" type="button" id="btn-back">返回列表</button>' : '') +
          '</form>' +
          '<div style="margin-top:14px"><table><thead><tr><th>姓名</th><th>学号</th><th>年级 / 专业</th><th>档案</th><th>最近测评</th><th>方案</th><th></th></tr></thead>' +
            '<tbody>' + rows + '</tbody></table></div></div>' +
          detailHtml +
        '</div>';

      root.querySelector('#search-form').onsubmit = function (e) {
        e.preventDefault();
        keyword = root.querySelector('#kw').value;
        selectedId = null;
        render();
      };
      root.querySelector('#btn-all').onclick = function () {
        keyword = '';
        selectedId = null;
        render();
      };
      var back = root.querySelector('#btn-back');
      if (back) {
        back.onclick = function () { selectedId = null; render(); };
      }
      Array.prototype.forEach.call(root.querySelectorAll('[data-open]'), function (btn) {
        btn.onclick = function () {
          selectedId = Number(btn.getAttribute('data-open'));
          render();
        };
      });
      Array.prototype.forEach.call(root.querySelectorAll('[data-comment]'), function (btn) {
        btn.onclick = function () {
          var planId = Number(btn.getAttribute('data-comment'));
          var plan = selected.plans.filter(function (x) { return x.id === planId; })[0];
          var old = plan ? plan.comment : '';
          var text = window.prompt('评语 1～200 字：', old || '');
          if (text == null) { return; }
          function save() {
            var res = API.saveComment(planId, text);
            UI.toast(res.msg, res.ok ? 'ok' : 'error');
            if (res.ok) { render(); }
          }
          if (old) {
            UI.confirm({
              title: '覆盖评语',
              message: '这个方案已经有一条评语，保存会覆盖原来的评语。确认覆盖吗？',
              okText: '覆盖保存',
              onOk: save
            });
          } else {
            save();
          }
        };
      });
    }

    render();
  };

  /* ================= P-11 题目与方向（管理员） ================= */

  Views.adminLibrary = function (root) {
    var qRes = API.adminQuestions();
    var dRes = API.adminDirections();
    if (!qRes.ok) { root.innerHTML = UI.notice(qRes.msg, 'danger'); return; }
    if (!dRes.ok) { root.innerHTML = UI.notice(dRes.msg, 'danger'); return; }

    function render() {
      var qs = API.adminQuestions();
      var ds = API.adminDirections();
      if (!qs.ok || !ds.ok) { root.innerHTML = UI.notice((qs.msg || ds.msg), 'danger'); return; }
      var questions = qs.data.questions;
      var enabledCount = qs.data.enabledCount;
      var directions = ds.data.directions;

      var qRows = questions.map(function (q) {
        return '<tr><td style="width:40px;color:var(--muted)">' + q.sort + '</td>' +
          '<td style="max-width:260px">' + esc(q.stem) + '</td>' +
          '<td style="font-size:12.5px">A. ' + esc(q.optionA) + ' <span class="tag">' + q.typeA + '</span><br>B. ' + esc(q.optionB) + ' <span class="tag">' + q.typeB + '</span></td>' +
          '<td>' + (q.answered ? badge('已有人作答', 'badge-warn') : badge('未作答', 'badge-muted')) + '</td>' +
          '<td>' + (q.enabled ? badge('启用', 'badge-ok') : badge('停用', 'badge-muted')) + '</td>' +
          '<td>' +
            '<button class="btn btn-ghost btn-sm" data-toggle-q="' + q.id + '">' + (q.enabled ? '停用' : '启用') + '</button>' +
            '<button class="btn btn-plain btn-sm" data-edit-q="' + q.id + '"' + (q.answered ? ' disabled title="已经有人作答，只能停用，不能修改选项"' : '') + '>改选项</button>' +
          '</td></tr>';
      }).join('');

      var dRows = directions.map(function (d) {
        return '<tr><td><strong>' + esc(d.name) + '</strong></td>' +
          '<td>' + badge(d.category, 'badge-muted') + '</td>' +
          '<td>' + d.tags.map(function (t) { return '<span class="tag">' + t + '</span>'; }).join(' ') + '</td>' +
          '<td style="max-width:280px;font-size:12.5px;color:var(--ink-2)">' + esc(d.summary) + '</td>' +
          '<td>' + (d.status === 1 ? badge('上架', 'badge-ok') : badge('已下架', 'badge-warn')) + '</td>' +
          '<td><button class="btn btn-ghost btn-sm" data-toggle-d="' + d.id + '">' + (d.status === 1 ? '下架' : '上架') + '</button></td></tr>';
      }).join('');

      var typeOpts = D.HOLLAND.map(function (h) {
        return '<option value="' + h.code + '">' + h.code + ' ' + h.name + '</option>';
      }).join('');
      var typeOptsB = D.HOLLAND.map(function (h) {
        return '<option value="' + h.code + '"' + (h.code === 'I' ? ' selected' : '') + '>' + h.code + ' ' + h.name + '</option>';
      }).join('');
      var tagChecks = D.HOLLAND.map(function (h) {
        return '<label class="row tight" style="gap:5px;font-size:13px"><input type="checkbox" value="' + h.code + '" name="dir-tag"> ' + h.code + ' ' + h.name + '</label>';
      }).join('');

      root.innerHTML = UI.pageHead('题目与方向', '题目维护和方向维护都只有管理员能进。启用题少于 18 道时，学生作答页整页显示「题目维护中」。',
        badge('管理员视图', 'badge-muted')) +
        '<div class="stack">' +
          '<div class="notice notice-info">种子数据：24 道题（六种类型作为选项各出现 8 次）、8 个方向（就业 4 条、考研 1 条、考公 2 条、创业 1 条）。已有人作答的题只能停用，不能改选项。</div>' +
          '<div class="grid grid-2">' +
            '<div class="card"><div class="card-head"><span class="card-title">题目</span>' +
              '<span class="spacer"></span>' + badge('启用 ' + enabledCount + ' 道', enabledCount >= 18 ? 'badge-ok' : 'badge-warn') + '</div>' +
              '<div class="stack">' +
                '<input type="text" id="q-stem" maxlength="60" placeholder="题干，例如：你更愿意做哪类事？">' +
                '<div class="row" style="align-items:flex-start">' +
                  '<input type="text" id="q-a" maxlength="50" placeholder="选项 A 文字" style="flex:1">' +
                  '<select id="q-ta" style="width:118px">' + typeOpts + '</select>' +
                '</div>' +
                '<div class="row" style="align-items:flex-start">' +
                  '<input type="text" id="q-b" maxlength="50" placeholder="选项 B 文字" style="flex:1">' +
                  '<select id="q-tb" style="width:118px">' + typeOptsB + '</select>' +
                '</div>' +
                '<div class="row"><button class="btn btn-primary btn-sm" id="btn-add-q">新增题目</button>' +
                  '<span class="hint" style="font-size:12px;color:var(--muted)">两个选项的类型不能相同，且都属于 RIASEC。</span></div>' +
              '</div></div>' +
            '<div class="card"><div class="card-head"><span class="card-title">方向</span>' +
              '<span class="spacer"></span>' + badge('共 ' + directions.length + ' 条', 'badge-muted') + '</div>' +
              '<div class="stack">' +
                '<div class="row"><input type="text" id="d-name" maxlength="20" placeholder="方向名称，例如：数据分析" style="flex:1">' +
                  '<select id="d-cat" style="width:110px">' + D.DIRECTION_CATEGORIES.map(function (c) { return '<option>' + c + '</option>'; }).join('') + '</select></div>' +
                '<div class="row tight" id="d-tags">' + tagChecks + '</div>' +
                '<textarea id="d-summary" maxlength="200" placeholder="简介，200 字以内，不写薪资"></textarea>' +
                '<input type="text" id="d-a1" maxlength="40" placeholder="在校可做的事（第一条）">' +
                '<input type="text" id="d-a2" maxlength="40" placeholder="在校可做的事（第二条）">' +
                '<div class="row"><button class="btn btn-primary btn-sm" id="btn-add-d">新增方向</button>' +
                  '<span class="hint" style="font-size:12px;color:var(--muted)">名称唯一、类别四选一、标签只能 RIASEC。</span></div>' +
              '</div></div>' +
          '</div>' +
          '<div class="card"><div class="card-head"><span class="card-title">题目列表</span>' +
            '<span class="spacer"></span><span class="hint" style="font-size:12px;color:var(--muted)">共 ' + questions.length + ' 道，启用 ' + enabledCount + ' 道</span></div>' +
            '<table><thead><tr><th>#</th><th>题干</th><th>选项与类型</th><th>作答</th><th>状态</th><th>操作</th></tr></thead><tbody>' + qRows + '</tbody></table></div>' +
          '<div class="card"><div class="card-head"><span class="card-title">方向列表</span>' +
            '<span class="spacer"></span><span class="hint" style="font-size:12px;color:var(--muted)">下架后不再参与新推荐；已被收藏或被方案引用的方向不物理删除</span></div>' +
            '<table><thead><tr><th>名称</th><th>类别</th><th>类型标签</th><th>简介</th><th>状态</th><th>操作</th></tr></thead><tbody>' + dRows + '</tbody></table></div>' +
        '</div>';

      root.querySelector('#btn-add-q').onclick = function () {
        var res = API.addQuestion({
          stem: root.querySelector('#q-stem').value,
          optionA: root.querySelector('#q-a').value,
          typeA: root.querySelector('#q-ta').value,
          optionB: root.querySelector('#q-b').value,
          typeB: root.querySelector('#q-tb').value
        });
        UI.toast(res.msg, res.ok ? 'ok' : 'error');
        if (res.ok) { render(); }
      };

      root.querySelector('#btn-add-d').onclick = function () {
        var tags = Array.prototype.filter.call(root.querySelectorAll('input[name="dir-tag"]'), function (c) { return c.checked; })
          .map(function (c) { return c.value; });
        var res = API.addDirection({
          name: root.querySelector('#d-name').value,
          category: root.querySelector('#d-cat').value,
          tags: tags,
          summary: root.querySelector('#d-summary').value,
          actions: [root.querySelector('#d-a1').value, root.querySelector('#d-a2').value]
        });
        UI.toast(res.msg, res.ok ? 'ok' : 'error');
        if (res.ok) { render(); }
      };

      Array.prototype.forEach.call(root.querySelectorAll('[data-toggle-q]'), function (btn) {
        btn.onclick = function () {
          var id = Number(btn.getAttribute('data-toggle-q'));
          var q = questions.filter(function (x) { return x.id === id; })[0];
          var res = API.setQuestionEnabled(id, !q.enabled);
          UI.toast(res.msg, res.ok ? 'ok' : 'error');
          if (res.ok) { render(); }
        };
      });

      Array.prototype.forEach.call(root.querySelectorAll('[data-edit-q]'), function (btn) {
        btn.onclick = function () {
          var id = Number(btn.getAttribute('data-edit-q'));
          var q = questions.filter(function (x) { return x.id === id; })[0];
          var a = window.prompt('选项 A 文字：', q.optionA);
          if (a == null) { return; }
          var b = window.prompt('选项 B 文字：', q.optionB);
          if (b == null) { return; }
          var res = API.updateQuestion(id, { optionA: a, optionB: b });
          UI.toast(res.msg, res.ok ? 'ok' : 'error');
          if (res.ok) { render(); }
        };
      });

      Array.prototype.forEach.call(root.querySelectorAll('[data-toggle-d]'), function (btn) {
        btn.onclick = function () {
          var id = Number(btn.getAttribute('data-toggle-d'));
          var d = directions.filter(function (x) { return x.id === id; })[0];
          var res = API.setDirectionStatus(id, d.status !== 1);
          UI.toast(res.msg, res.ok ? 'ok' : 'error');
          if (res.ok) { render(); }
        };
      });
    }

    render();
  };

  /* ================= P-12 公告、参数、统计、日志（管理员） ================= */

  Views.adminOps = function (root, params) {
    var tab = (params && params.tab) || 'announce';

    function render() {
      var anns = API.adminAnnouncements();
      var cfg = API.getConfig();
      var st = API.stats();
      var logs = API.listLogs({});
      if (!anns.ok) { root.innerHTML = UI.notice(anns.msg, 'danger'); return; }
      if (!cfg.ok) { root.innerHTML = UI.notice(cfg.msg, 'danger'); return; }
      if (!st.ok) { root.innerHTML = UI.notice(st.msg, 'danger'); return; }
      if (!logs.ok) { root.innerHTML = UI.notice(logs.msg, 'danger'); return; }

      var tabHtml = '<div class="tabs">' +
        ['announce:公告', 'params:模型参数', 'stats:统计', 'logs:日志'].map(function (t) {
          var key = t.split(':')[0];
          return '<button class="tab' + (tab === key ? ' active' : '') + '" data-tab="' + key + '">' + t.split(':')[1] + '</button>';
        }).join('') + '</div>';

      var annRows = anns.data.announcements.map(function (a) {
        return '<div class="ann-item"><div class="ann-title">' +
          (a.pinned ? badge('置顶', 'badge-warn') : '') +
          (a.offline ? badge('已下线', 'badge-muted') : badge('显示中', 'badge-ok')) +
          esc(a.title) + '</div>' +
          '<div class="ann-body">' + esc(a.content) + '</div>' +
          '<div class="ann-meta">' + esc(a.at) +
            '<span style="margin-left:10px">' +
              '<button class="btn btn-plain btn-sm" data-pin="' + a.id + '">' + (a.pinned ? '取消置顶' : '置顶') + '</button>' +
              '<button class="btn btn-plain btn-sm" data-offline="' + a.id + '">' + (a.offline ? '恢复显示' : '下线') + '</button>' +
            '</span></div></div>';
      }).join('') || UI.empty('还没有公告。');

      var announcePanel = '<div class="grid grid-2">' +
        '<div class="card"><div class="card-head"><span class="card-title">发布公告</span>' +
          '<span class="spacer"></span><span class="hint" style="font-size:12px;color:var(--muted)">标题 ≤ 40 字，正文 ≤ 500 字</span></div>' +
          '<div class="stack">' +
            '<input type="text" id="a-title" maxlength="40" placeholder="公告标题">' +
            '<textarea id="a-content" maxlength="500" placeholder="公告正文"></textarea>' +
            '<label class="row tight" style="font-size:13px"><input type="checkbox" id="a-pinned"> 置顶（学生首页排在第一条）</label>' +
            '<div class="row"><button class="btn btn-primary btn-sm" id="btn-add-a">发布</button>' +
            '<span class="hint" style="font-size:12px;color:var(--muted)">下线后学生和老师首页都不再显示。</span></div>' +
          '</div></div>' +
        '<div class="card"><div class="card-head"><span class="card-title">公告列表</span><span class="spacer"></span></div>' +
          '<div class="ann-list">' + annRows + '</div></div>' +
      '</div>';

      var c = cfg.data.config;
      var paramsPanel = '<div class="card" style="max-width:720px">' +
        '<div class="card-head"><span class="card-title">模型参数</span>' +
          '<span class="spacer"></span>' + badge('不含密钥', 'badge-ok') + '</div>' +
        '<div class="stack">' +
          '<div class="field"><label>接口地址</label><input type="text" id="c-url" value="' + esc(c.apiUrl) + '"></div>' +
          '<div class="field"><label>模型名</label><input type="text" id="c-model" value="' + esc(c.modelName) + '"></div>' +
          '<div class="field"><label>超时（秒，5～60）</label><input type="number" id="c-timeout" min="5" max="60" value="' + c.timeout + '">' +
            '<span class="hint">默认 30 秒，只能用 5～60 的整数。</span></div>' +
          '<div class="field"><label>免责声明</label><textarea id="c-disclaimer" maxlength="120">' + esc(c.disclaimer) + '</textarea></div>' +
          '<div class="row" style="gap:22px;margin-top:4px">' +
            '<label class="row tight" style="font-size:13px"><input type="checkbox" id="c-assistant"' + (c.assistantOn ? ' checked' : '') + '> 助手开关（关闭后学生不能对话、不能生成方案）</label>' +
            '<label class="row tight" style="font-size:13px"><input type="checkbox" id="c-mock"' + (c.mockOn ? ' checked' : '') + '> 模拟回复开关</label>' +
          '</div>' +
          '<div class="notice notice-warn">模型密钥只放环境变量，页面和接口都不返回密钥，sys_config 不保存密钥。这里没有密钥输入框。</div>' +
          '<div class="row"><button class="btn btn-primary btn-sm" id="btn-save-cfg">保存参数</button>' +
            '<span class="hint" style="font-size:12px;color:var(--muted)">对学生端立即生效。</span></div>' +
        '</div></div>';

      var s = st.data;
      var statsPanel = '<div class="stat-grid">' +
        '<div class="stat-card"><div class="st-label">注册学生数</div><div class="st-value">' + s.studentCount + '</div>' +
          '<div class="st-foot">含停用 ' + s.disabledCount + ' 人</div></div>' +
        '<div class="stat-card"><div class="st-label">档案完成数</div><div class="st-value">' + s.completeCount + '</div>' +
          '<div class="st-foot">四项必填齐全</div></div>' +
        '<div class="stat-card"><div class="st-label">测评人数</div><div class="st-value">' + s.assessedCount + '</div>' +
          '<div class="st-foot">至少一次测评</div></div>' +
        '<div class="stat-card"><div class="st-label">方案份数</div><div class="st-value">' + s.planCount + '</div>' +
          '<div class="st-foot">已保存方案</div></div>' +
      '</div>' +
      '<div class="notice notice-info" style="margin-top:16px">四个数字用卡片展示，不做数据大屏，也没有导出报表。统计页没有「查看对话」，不能从数字点进某一次聊天。</div>';

      var studentOpts = logs.data.students.map(function (u) {
        return '<option value="' + u.id + '">' + esc(u.name) + '（' + esc(u.studentNo) + '）' + '</option>';
      }).join('');
      var actions = ['登录', '重置密码', '生成方案', '删除方案', '改题目', '改方向', '改参数'];
      var logRows = logs.data.logs.map(function (l) {
        return '<tr data-log="' + l.id + '"><td>' + esc(l.at) + '</td><td>' + esc(l.operator) + '</td>' +
          '<td>' + esc(l.action) + '</td><td>' + esc(l.targetType) + '</td><td>' + esc(l.targetId) + '</td><td>' + esc(l.ip) + '</td></tr>';
      }).join('') || '<tr><td colspan="6"><div class="empty">没有匹配的日志。</div></td></tr>';

      var logsPanel = '<div class="card"><div class="card-head"><span class="card-title">关键操作日志</span>' +
        '<span class="spacer"></span><span class="hint" style="font-size:12px;color:var(--muted)">只记登录、重置密码、生成方案、删除方案、改题目、改方向、改参数</span></div>' +
        '<form class="row" id="log-filter">' +
          '<select id="log-student" style="max-width:220px"><option value="">全部学生</option>' + studentOpts + '</select>' +
          '<select id="log-action" style="max-width:160px"><option value="">全部动作</option>' +
            actions.map(function (a) { return '<option value="' + a + '">' + a + '</option>'; }).join('') + '</select>' +
          '<button class="btn btn-primary btn-sm" type="submit">筛选</button>' +
        '</form>' +
        '<div style="margin-top:14px"><table><thead><tr><th>时间</th><th>操作者</th><th>动作</th><th>对象类型</th><th>对象编号</th><th>IP</th></tr></thead>' +
          '<tbody id="log-tbody">' + logRows + '</tbody></table></div>' +
        '<div class="log-detail" id="log-detail" style="margin-top:12px;display:none"></div>' +
        '<div class="notice notice-warn" style="margin-top:12px">日志只增不改，详情里没有聊天正文。统计页也不能从日志点进某一次聊天。</div>' +
      '</div>' +
      '<div class="card"><div class="card-head"><span class="card-title">学生账号维护</span>' +
        '<span class="spacer"></span><span class="hint" style="font-size:12px;color:var(--muted)">重置密码并解锁</span></div>' +
        '<form class="row" id="reset-form">' +
          '<select id="reset-student" style="max-width:220px">' + logs.data.students.map(function (u) {
            return '<option value="' + u.id + '">' + esc(u.name) + '（' + esc(u.studentNo) + '）' + '</option>';
          }).join('') + '</select>' +
          '<button class="btn btn-primary btn-sm" type="submit">重置密码并解锁</button>' +
          '<span class="hint" style="font-size:12px;color:var(--muted)">学生和老师不能调用这个接口。</span>' +
        '</form></div>';

      var panel = tab === 'announce' ? announcePanel : (tab === 'params' ? paramsPanel : (tab === 'stats' ? statsPanel : logsPanel));

      root.innerHTML = UI.pageHead('公告、参数、统计、日志',
        '公告对学生和老师可见；参数、统计和日志仅管理员可进。',
        badge('管理员视图', 'badge-muted')) +
        tabHtml +
        '<div class="stack">' + panel + '</div>';

      Array.prototype.forEach.call(root.querySelectorAll('[data-tab]'), function (btn) {
        btn.onclick = function () { window.location.hash = '#/admin/ops?tab=' + btn.getAttribute('data-tab'); };
      });

      /* 公告 */
      var addA = root.querySelector('#btn-add-a');
      if (addA) {
        addA.onclick = function () {
          var res = API.addAnnouncement({
            title: root.querySelector('#a-title').value,
            content: root.querySelector('#a-content').value,
            pinned: root.querySelector('#a-pinned').checked
          });
          UI.toast(res.msg, res.ok ? 'ok' : 'error');
          if (res.ok) { render(); }
        };
      }
      Array.prototype.forEach.call(root.querySelectorAll('[data-pin]'), function (btn) {
        btn.onclick = function () {
          var res = API.toggleAnnouncementPin(Number(btn.getAttribute('data-pin')));
          UI.toast(res.msg, res.ok ? 'ok' : 'error');
          if (res.ok) { render(); }
        };
      });
      Array.prototype.forEach.call(root.querySelectorAll('[data-offline]'), function (btn) {
        btn.onclick = function () {
          var id = Number(btn.getAttribute('data-offline'));
          var a = API.adminAnnouncements().data.announcements.filter(function (x) { return x.id === id; })[0];
          var res = API.setAnnouncementOffline(id, !a.offline);
          UI.toast(res.msg, res.ok ? 'ok' : 'error');
          if (res.ok) { render(); }
        };
      });

      /* 参数 */
      var saveCfg = root.querySelector('#btn-save-cfg');
      if (saveCfg) {
        saveCfg.onclick = function () {
          var res = API.saveConfig({
            apiUrl: root.querySelector('#c-url').value,
            modelName: root.querySelector('#c-model').value,
            timeout: root.querySelector('#c-timeout').value,
            disclaimer: root.querySelector('#c-disclaimer').value,
            assistantOn: root.querySelector('#c-assistant').checked,
            mockOn: root.querySelector('#c-mock').checked
          });
          UI.toast(res.msg, res.ok ? 'ok' : 'error');
          if (res.ok) { render(); }
        };
      }

      /* 日志 */
      var filter = root.querySelector('#log-filter');
      if (filter) {
        filter.onsubmit = function (e) {
          e.preventDefault();
          var userId = root.querySelector('#log-student').value;
          var action = root.querySelector('#log-action').value;
          var res = API.listLogs({ userId: userId, action: action });
          if (!res.ok) { UI.toast(res.msg, 'error'); return; }
          root.querySelector('#log-tbody').innerHTML = res.data.logs.length ? res.data.logs.map(function (l) {
            return '<tr data-log="' + l.id + '"><td>' + esc(l.at) + '</td><td>' + esc(l.operator) + '</td>' +
              '<td>' + esc(l.action) + '</td><td>' + esc(l.targetType) + '</td><td>' + esc(l.targetId) + '</td><td>' + esc(l.ip) + '</td></tr>';
          }).join('') : '<tr><td colspan="6"><div class="empty">没有匹配的日志。</div></td></tr>';
          root.querySelector('#log-detail').style.display = 'none';
          bindLogRows(res.data.logs);
        };
        bindLogRows(logs.data.logs);
      }
      var resetForm = root.querySelector('#reset-form');
      if (resetForm) {
        resetForm.onsubmit = function (e) {
          e.preventDefault();
          var id = Number(root.querySelector('#reset-student').value);
          UI.confirm({
            title: '重置密码并解锁',
            message: '会把该学生的密码重置为初始密码并解除锁定，同时写一条重置密码日志。确认继续吗？',
            okText: '确认重置',
            onOk: function () {
              var res = API.resetPassword(id);
              UI.toast(res.msg, res.ok ? 'ok' : 'error');
              if (res.ok) { render(); }
            }
          });
        };
      }

      function bindLogRows(list) {
        var detail = root.querySelector('#log-detail');
        Array.prototype.forEach.call(root.querySelectorAll('[data-log]'), function (tr) {
          tr.style.cursor = 'pointer';
          tr.onclick = function () {
            var id = Number(tr.getAttribute('data-log'));
            var log = list.filter(function (x) { return x.id === id; })[0];
            if (!log) { return; }
            detail.style.display = 'block';
            detail.textContent = '时间：' + log.at + '\n操作者：' + log.operator + '\n动作：' + log.action +
              '\n对象类型：' + log.targetType + '\n对象编号：' + log.targetId + '\n客户端 IP：' + log.ip +
              '\n说明：日志没有聊天正文字段，这里看不到任何对话内容。';
          };
        });
      }
    }

    render();
  };
})();
