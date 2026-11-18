// 纯逻辑测试：不依赖 DOM，验证摇卦、查表、本卦/变卦核心算法
const fs = require('fs');
const vm = require('vm');
const context = vm.createContext({ console, document: { querySelector: () => ({ addEventListener: () => {} }) } });
const code = fs.readFileSync('./data.js', 'utf8') + '\n' + fs.readFileSync('./app.js', 'utf8');
vm.runInContext(code, context);

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

// 按爻值构造一次 toss 结果（6 老阴 / 7 少阳 / 8 少阴 / 9 老阳）
const T = v => ({ val: v, coins: [], yang: v === 7 || v === 9, moving: v === 6 || v === 9 });
const cast = vals => context.buildState(vals.map(T), '');

// 1. 查表正确性抽样
assert(context.hexInfo([1,1,1,1,1,1]).no === 1, '乾为天应为 1');
assert(context.hexInfo([0,0,0,0,0,0]).no === 2, '坤为地应为 2');
assert(context.hexInfo([0,0,0,1,1,1]).no === 12, '天地否应为 12');
assert(context.hexInfo([1,1,1,0,0,0]).no === 11, '地天泰应为 11');
assert(context.hexInfo([0,1,0,1,0,1]).no === 64, '火水未济应为 64');
assert(context.hexInfo([1,0,1,0,1,0]).no === 63, '水火既济应为 63');

// 2. toss() 返回值域
for (let i = 0; i < 200; i++) {
  const t = context.toss();
  assert([6,7,8,9].includes(t.val), 'val 必须在 6/7/8/9 之间');
  assert(t.coins.length === 3, '必须抛三枚');
  assert(t.coins.every(c => c === 0 || c === 1), '硬币结果只能是 0 或 1');
  assert(t.yang === (t.val === 7 || t.val === 9), 'yang 与 val 一致');
  assert(t.moving === (t.val === 6 || t.val === 9), 'moving 与 val 一致');
}

// 3. 本卦取摇出的原始阴阳，变卦翻转动爻
let s = cast([6,6,6,6,6,6]);
assert(context.hexInfo(s.lines).no === 2, '六爻老阴：本卦应为坤 2');
assert(context.changedHexInfo(s).no === 1, '六爻老阴：变卦应为乾 1');

s = cast([9,9,9,9,9,9]);
assert(context.hexInfo(s.lines).no === 1, '六爻老阳：本卦应为乾 1');
assert(context.changedHexInfo(s).no === 2, '六爻老阳：变卦应为坤 2');

s = cast([9,7,7,7,7,9]);
assert(s.moves.map(m => m.pos).join(',') === '0,5', '动爻位置应为初爻、上爻');
assert(context.hexInfo(s.lines).no === 1, '初上老阳：本卦应为乾 1');
assert(context.changedLines(s).join(',') === '0,1,1,1,1,0', '变卦只翻动爻位置');
assert(context.changedHexInfo(s).no === 28, '初上老阳变后应为泽风大过 28');

// 4. 静卦
s = cast([7,8,7,8,7,8]);
assert(s.moves.length === 0, '静卦无动爻');
assert(context.changedLines(s).join(',') === '1,0,1,0,1,0', '静卦 lines 不变');

// 5. 所问内容需转义
assert(context.escapeHtml('<img onerror="x">') === '&lt;img onerror=&quot;x&quot;&gt;', 'escapeHtml 转义');

console.log('✓ app.js 逻辑测试通过');
