/* CareerPilot 原型自检 · Node 运行器
   用法：node prototype/tools/selfcheck-node.mjs
   不依赖浏览器：用最小 window / localStorage 垫片加载 data.js、store.js、mock-api.js 和 selftests.js。 */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const here = path.dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1'));
const root = path.resolve(here, '..', 'assets', 'js');

const storage = new Map();
const sandboxBase = {
  console,
  JSON, Date, Math, Number, Object, Array, String, RegExp, Error,
  parseInt, parseFloat, isFinite, setTimeout, clearTimeout,
  localStorage: {
    getItem: (k) => (storage.has(k) ? storage.get(k) : null),
    setItem: (k, v) => { storage.set(k, String(v)); },
    removeItem: (k) => { storage.delete(k); }
  },
  document: {
    readyState: 'complete',
    addEventListener() {},
    getElementById() { return null; }
  },
  location: { hash: '#/login' }
};
sandboxBase.window = sandboxBase;
const context = vm.createContext(sandboxBase);

for (const file of ['data.js', 'store.js', 'mock-api.js']) {
  const code = fs.readFileSync(path.join(root, file), 'utf8');
  vm.runInContext(code, context, { filename: file });
}
vm.runInContext(fs.readFileSync(path.join(here, 'selftests.js'), 'utf8'), context, { filename: 'selftests.js' });

const result = vm.runInContext('window.runSelfTests()', context);
console.log(result.lines.join('\n'));
console.log('');
console.log(`SELFCHECK ${result.ok ? 'PASS' : 'FAIL'} 通过 ${result.pass} 项，失败 ${result.fail} 项`);
process.exit(result.ok ? 0 : 1);
