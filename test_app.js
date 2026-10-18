// 纯逻辑测试：不依赖 DOM，验证摇卦、查表、变卦核心算法
const fs = require('fs');
const vm = require('vm');
const context = vm.createContext({ document: { querySelector: () => ({ addEventListener: () => {} }) } });
const code = fs.readFileSync('./data.js', 'utf8') + '\n' + fs.readFileSync('./app.js', 'utf8');
vm.runInContext(code, context);

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

// 1. 查表正确性抽样
assert(context.hexInfo([1,1,1,1,1,1]).no === 1, '乾为天应为 1');
assert(context.hexInfo([0,0,0,0,0,0]).no === 2, '坤为地应为 2');
assert(context.hexInfo([0,0,0,1,1,1]).no === 12, '地天泰应为 12');
assert(context.hexInfo([1,1,1,0,0,0]).no === 11, '天地否应为 11');
assert(context.hexInfo([0,1,0,1,0,1]).no === 64, '水火既济应为 64');
assert(context.hexInfo([1,0,1,0,1,0]).no === 63, '火水未济应为 63');

// 2. toss() 返回值域
for (let i = 0; i < 200; i++) {
  const t = context.toss();
  assert([6,7,8,9].includes(t.val), 'val 必须在 6/7/8/9 之间');
  assert(t.coins.length === 3, '必须抛三枚');
  assert(t.coins.every(c => c === 0 || c === 1), '硬币结果只能是 0 或 1');
  assert(t.yang === (t.val === 7 || t.val === 9), 'yang 与 val 一致');
  assert(t.moving === (t.val === 6 || t.val === 9), 'moving 与 val 一致');
}

// 3. 变卦：设定一个全老阳的极端状态
context.cur = { all: [], lines: [1,1,1,1,1,1], moves: [{pos:0},{pos:5}], question: '测试' };
assert(context.changedLines(context.cur).join(',') === '0,1,1,1,1,0', '变卦只翻动爻位置');
assert(context.changedHexInfo(context.cur).no === 28, '老阳全变后应为泽风大过 28');

// 4. 静卦
context.cur = { lines: [1,0,1,0,1,0], moves: [], question: '' };
assert(context.changedLines(context.cur).join(',') === '1,0,1,0,1,0', '静卦 lines 不变');

console.log('✓ app.js 逻辑测试通过');
