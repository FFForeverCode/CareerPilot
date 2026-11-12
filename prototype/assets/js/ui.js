/* CareerPilot 产品原型 · 公共界面工具 */
(function () {
  'use strict';

  var D = window.CAREER_DATA;
  var T = D.TEXTS;

  var ROLE_NAME = { student: '学生', teacher: '就业指导老师', admin: '管理员' };

  var NAV = {
    student: [
      { key: 'home', label: '首页', path: '#/home' },
      { key: 'profile', label: '学业档案', path: '#/profile' },
      { key: 'assessment', label: '测评', path: '#/assessment' },
      { key: 'chat', label: '规划对话', path: '#/chat' },
      { key: 'plans', label: '我的方案', path: '#/plans' },
      { key: 'directions', label: '方向与收藏', path: '#/directions' }
    ],
    teacher: [
      { key: 'teacher', label: '学生方案', path: '#/teacher/students' }
    ],
    admin: [
      { key: 'library', label: '题目与方向', path: '#/admin/library' },
      { key: 'ops-announce', label: '公告与参数', path: '#/admin/ops?tab=announce' },
      { key: 'ops-stats', label: '统计与日志', path: '#/admin/ops?tab=stats' }
    ]
  };

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function typeName(code) {
    var item = D.HOLLAND.filter(function (h) { return h.code === code; })[0];
    return item ? item.name : code;
  }

  function roleName(role) { return ROLE_NAME[role] || role; }

  function shell(opts) {
    var user = opts.user;
    var navs = NAV[user.role] || [];
    var navHtml = navs.map(function (n) {
      var cls = n.key === opts.activeKey ? 'nav-item active' : 'nav-item';
      return '<a class="' + cls + '" href="' + n.path + '"><span class="dot"></span>' + n.label + '</a>';
    }).join('');
    var menuLabel = user.role === 'student' ? '学生菜单' : (user.role === 'teacher' ? '老师菜单' : '管理员菜单');
    return '' +
      '<div class="shell">' +
        '<aside class="sidebar">' +
          '<div class="brand">' +
            '<div class="brand-mark">CP</div>' +
            '<div class="brand-text"><span class="brand-name">CareerPilot</span>' +
              '<span class="brand-sub">' + T.T02 + ' · 产品原型</span></div>' +
          '</div>' +
          '<div class="nav-label">' + menuLabel + '</div>' +
          '<nav class="nav">' + navHtml + '</nav>' +
          '<div class="sidebar-foot">' +
            '原型数据存在浏览器本地。<br>所有姓名、学号均为虚构。' +
          '</div>' +
        '</aside>' +
        '<div class="main-col">' +
          '<header class="topbar">' +
            '<div><div class="topbar-title">' + esc(opts.title) + '</div>' +
            '<div class="topbar-crumb">' + esc(opts.crumb || '') + '</div></div>' +
            '<div class="topbar-right">' +
              '<div class="user-chip">' +
                '<span class="avatar">' + esc(user.realName.slice(0, 1)) + '</span>' +
                '<span>' + esc(user.realName) + '</span>' +
                '<span class="role-tag">' + roleName(user.role) + '</span>' +
              '</div>' +
              '<button class="btn btn-ghost btn-sm" id="btn-reset-demo">重置数据</button>' +
              '<button class="btn btn-plain btn-sm" id="btn-logout">退出登录</button>' +
            '</div>' +
          '</header>' +
          '<main class="page" id="view-root">' + opts.body + '</main>' +
        '</div>' +
      '</div>';
  }

  function pageHead(title, desc, actionsHtml) {
    return '<div class="page-head">' +
      '<div><h1 class="page-title">' + esc(title) + '</h1>' +
      (desc ? '<p class="page-desc">' + desc + '</p>' : '') + '</div>' +
      (actionsHtml ? '<div class="page-actions">' + actionsHtml + '</div>' : '') +
      '</div>';
  }

  function empty(text) {
    return '<div class="empty">' + text + '</div>';
  }

  function notice(text, kind) {
    return '<div class="notice notice-' + (kind || 'info') + '">' + text + '</div>';
  }

  function declaration() {
    return '<div class="declaration">' + T.T01 + '</div>';
  }

  function toast(msg, type) {
    var box = document.getElementById('toast');
    if (!box) { return; }
    box.textContent = msg;
    box.className = 'toast' + (type ? ' ' + type : '');
    box.hidden = false;
    window.clearTimeout(toast._t);
    toast._t = window.setTimeout(function () { box.hidden = true; }, 3200);
  }

  function confirm(opts) {
    var root = document.getElementById('modal-root');
    root.innerHTML =
      '<div class="modal-mask" id="modal-mask">' +
        '<div class="modal" role="dialog" aria-modal="true">' +
          '<h3>' + esc(opts.title || '请确认') + '</h3>' +
          '<p>' + esc(opts.message || '') + '</p>' +
          '<div class="modal-foot">' +
            '<button class="btn btn-ghost" id="modal-cancel">' + esc(opts.cancelText || '取消') + '</button>' +
            '<button class="btn ' + (opts.danger ? 'btn-danger' : 'btn-primary') + '" id="modal-ok">' + esc(opts.okText || '确定') + '</button>' +
          '</div>' +
        '</div>' +
      '</div>';
    function close() { root.innerHTML = ''; }
    root.querySelector('#modal-cancel').onclick = close;
    root.querySelector('#modal-mask').onclick = function (e) {
      if (e.target.id === 'modal-mask') { close(); }
    };
    root.querySelector('#modal-ok').onclick = function () {
      close();
      if (opts.onOk) { opts.onOk(); }
    };
  }

  function bindShell(user) {
    var logout = document.getElementById('btn-logout');
    if (logout) {
      logout.onclick = function () {
        window.API.logout();
        window.location.hash = '#/login';
      };
    }
    var reset = document.getElementById('btn-reset-demo');
    if (reset) {
      reset.onclick = function () {
        confirm({
          title: '重置演示数据',
          message: '会把原型数据恢复成初始种子（学生 3 人、老师 1 人、管理员 1 人、24 道题、8 个方向、2 条公告）。当前的操作记录和登录状态会清空。',
          okText: '重置并回到登录页',
          danger: true,
          onOk: function () {
            window.Store.reset();
            window.location.hash = '#/login';
            window.location.reload();
          }
        });
      };
    }
  }

  window.UI = {
    esc: esc,
    typeName: typeName,
    roleName: roleName,
    shell: shell,
    pageHead: pageHead,
    empty: empty,
    notice: notice,
    declaration: declaration,
    toast: toast,
    confirm: confirm,
    bindShell: bindShell,
    T: T
  };
})();
