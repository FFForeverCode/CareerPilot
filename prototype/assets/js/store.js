/* CareerPilot 产品原型 · 本地状态
   纯前端原型：所有数据存在浏览器 localStorage，刷新不丢，可一键重置。 */
(function () {
  'use strict';

  var KEY = 'careerpilot-proto-v1';
  var SESSION_KEY = 'careerpilot-proto-session-v1';

  function clone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  var state = null;
  var session = null;

  function load() {
    var raw = null;
    try { raw = window.localStorage.getItem(KEY); } catch (e) { raw = null; }
    if (raw) {
      try {
        state = JSON.parse(raw);
      } catch (e) {
        state = null;
      }
    }
    if (!state || !state.users) {
      state = clone(window.CAREER_DATA.createSeed());
      save();
    }
    try {
      var s = window.localStorage.getItem(SESSION_KEY);
      session = s ? JSON.parse(s) : null;
    } catch (e) { session = null; }
    return state;
  }

  function save() {
    try { window.localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* 忽略隐私模式下的写入失败 */ }
  }

  function saveSession() {
    try {
      if (session) { window.localStorage.setItem(SESSION_KEY, JSON.stringify(session)); }
      else { window.localStorage.removeItem(SESSION_KEY); }
    } catch (e) { /* 忽略 */ }
  }

  function reset() {
    state = clone(window.CAREER_DATA.createSeed());
    session = null;
    save();
    saveSession();
  }

  window.Store = {
    load: load,
    save: save,
    reset: reset,
    get: function () { return state; },
    nextId: function (name) {
      var id = state.nextIds[name] || 1;
      state.nextIds[name] = id + 1;
      return id;
    },
    session: function () { return session; },
    setSession: function (userId, role) {
      session = { userId: userId, role: role, loginAt: Date.now() };
      saveSession();
    },
    clearSession: function () {
      session = null;
      saveSession();
    },
    now: function () {
      return formatTime(new Date());
    }
  };

  function pad(n) { return n < 10 ? '0' + n : '' + n; }

  function formatTime(d) {
    return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()) +
      ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes());
  }

  window.formatTime = formatTime;

  window.Store.load();
})();
