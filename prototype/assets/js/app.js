/* CareerPilot 产品原型 · 路由与启动 */
(function () {
  'use strict';

  var UI = window.UI;
  var API = window.API;
  var S = window.Store;
  var Views = window.Views;

  var ROUTES = [
    { path: '/login', view: 'auth', params: { mode: 'login' }, layout: 'none' },
    { path: '/login/register', view: 'auth', params: { mode: 'register' }, layout: 'none' },
    { path: '/home', view: 'home', layout: 'shell', roles: ['student'], title: '学生首页', crumb: '首页', nav: 'home' },
    { path: '/profile', view: 'profile', layout: 'shell', roles: ['student'], title: '学业档案', crumb: '首页 / 学业档案', nav: 'profile' },
    { path: '/assessment', view: 'assessment', layout: 'shell', roles: ['student'], title: '职业意向测评', crumb: '首页 / 测评', nav: 'assessment' },
    { path: '/assessment/result', view: 'assessmentResult', layout: 'shell', roles: ['student'], title: '测评结果', crumb: '首页 / 测评 / 结果', nav: 'assessment' },
    { path: '/chat', view: 'chat', layout: 'shell', roles: ['student'], title: '规划对话', crumb: '首页 / 规划对话', nav: 'chat' },
    { path: '/plans', view: 'plans', layout: 'shell', roles: ['student'], title: '我的方案', crumb: '首页 / 我的方案', nav: 'plans' },
    { path: '/plans/:id', view: 'planDetail', layout: 'shell', roles: ['student', 'teacher'], title: '方案详情', crumb: '首页 / 我的方案 / 详情', nav: 'plans' },
    { path: '/directions', view: 'directions', layout: 'shell', roles: ['student'], title: '方向与收藏', crumb: '首页 / 方向与收藏', nav: 'directions' },
    { path: '/teacher/students', view: 'teacherStudents', layout: 'shell', roles: ['teacher'], title: '学生方案', crumb: '老师菜单 / 学生方案', nav: 'teacher' },
    { path: '/admin/library', view: 'adminLibrary', layout: 'shell', roles: ['admin'], title: '题目与方向', crumb: '管理员菜单 / 题目与方向', nav: 'library' },
    { path: '/admin/ops', view: 'adminOps', layout: 'shell', roles: ['admin'], title: '公告、参数、统计、日志', crumb: '管理员菜单 / 公告、参数、统计、日志', nav: 'ops' }
  ];

  var HOME_BY_ROLE = { student: '#/home', teacher: '#/teacher/students', admin: '#/admin/library' };

  function parseHash() {
    var raw = window.location.hash.replace(/^#/, '');
    if (!raw) { return { path: '/login', query: {} }; }
    var qi = raw.indexOf('?');
    var path = qi >= 0 ? raw.slice(0, qi) : raw;
    var query = {};
    if (qi >= 0) {
      raw.slice(qi + 1).split('&').forEach(function (pair) {
        if (!pair) { return; }
        var kv = pair.split('=');
        query[decodeURIComponent(kv[0])] = decodeURIComponent(kv[1] || '');
      });
    }
    if (path.length > 1 && path.slice(-1) === '/') { path = path.slice(0, -1); }
    return { path: path, query: query };
  }

  function match(path) {
    for (var i = 0; i < ROUTES.length; i++) {
      var r = ROUTES[i];
      if (r.path === path) {
        return { route: r, params: {} };
      }
      if (r.path.indexOf(':') >= 0) {
        var segs = r.path.split('/');
        var parts = path.split('/');
        if (segs.length !== parts.length) { continue; }
        var params = {};
        var ok = true;
        for (var j = 0; j < segs.length; j++) {
          if (segs[j].charAt(0) === ':') {
            params[segs[j].slice(1)] = parts[j];
          } else if (segs[j] !== parts[j]) {
            ok = false;
            break;
          }
        }
        if (ok) { return { route: r, params: params }; }
      }
    }
    return null;
  }

  function render() {
    var app = document.getElementById('app');
    var parsed = parseHash();
    var found = match(parsed.path);
    var user = API.currentUser();
    var session = S.session();

    if (!found) {
      window.location.hash = session ? HOME_BY_ROLE[session.role] : '#/login';
      return;
    }

    var route = found.route;
    var params = found.params;
    if (route.view === 'auth') {
      params = { mode: route.params.mode };
    }

    if (route.layout === 'none') {
      if (user) {
        window.location.hash = HOME_BY_ROLE[user.role];
        return;
      }
      app.className = 'app-root';
      Views.auth(app, params);
      window.scrollTo(0, 0);
      return;
    }

    if (!user) {
      window.location.hash = '#/login';
      return;
    }

    if (route.roles && route.roles.indexOf(user.role) < 0) {
      UI.toast('没有权限访问这个页面。', 'error');
      window.location.hash = HOME_BY_ROLE[user.role];
      return;
    }

    /* 管理员端菜单高亮：ops 页按 tab 区分「公告与参数」「统计与日志」 */
    var navKey = route.nav;
    if (route.view === 'adminOps') {
      var tab = parsed.query.tab || 'announce';
      navKey = (tab === 'stats' || tab === 'logs') ? 'ops-stats' : 'ops-announce';
    }

    app.innerHTML = UI.shell({
      user: user,
      title: route.title,
      crumb: route.crumb,
      activeKey: navKey,
      body: ''
    });
    UI.bindShell(user);

    var viewRoot = document.getElementById('view-root');
    if (route.view === 'adminOps') {
      Views.adminOps(viewRoot, { tab: parsed.query.tab || 'announce' });
    } else {
      Views[route.view](viewRoot, params);
    }
    window.scrollTo(0, 0);
  }

  function boot() {
    window.addEventListener('hashchange', render);
    if (!window.location.hash) {
      window.location.hash = '#/login';
    }
    render();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
