// 最终权威全量核验：从八卦定义推导 64 卦查表，确保 100% 正确
const fs = require('fs');

const vm = require('vm');

// 直接核验 app.js 中实际使用的查表
const ctx = vm.createContext({ console, document: { querySelector: () => ({ addEventListener: () => {} }) } });
vm.runInContext(fs.readFileSync('data.js', 'utf8') + '\n' + fs.readFileSync('app.js', 'utf8') + '\nthis.RAW = RAW; this.ORDER = ORDER;', ctx);
const { RAW, ORDER } = ctx;

// 八卦标准二进制编码（初爻在下，1=阳 0=阴）
// 阳爻在下为震[1,0,0]，阳爻在中为坎[0,1,0]，阳爻在上为艮[0,0,1]
// 阴爻在下为巽[0,1,1]，阴爻在中为离[1,0,1]，阴爻在上为兑[1,1,0]
const B8 = {
  乾: [1,1,1], 坤: [0,0,0],
  震: [1,0,0], 坎: [0,1,0], 艮: [0,0,1],
  巽: [0,1,1], 离: [1,0,1], 兑: [1,1,0]
};

// TRI index = 初*4 + 二*2 + 三
const TRI = ['坤','艮','坎','巽','震','离','兑','乾'];

function lookup(upper, lower) { return RAW[lower][ORDER.indexOf(upper)]; }
function hexNo(lines) {
  const lv = lines[0]*4 + lines[1]*2 + lines[2];
  const uv = lines[3]*4 + lines[4]*2 + lines[5];
  return lookup(TRI[uv], TRI[lv]);
}

// 读取权威定义
const code = fs.readFileSync('gen_authoritative.py', 'utf8');
const re = /\((\d+),"([^"]+)","([^"]+)","([^"]+)","([^"]+)","([^"]+)"\)/g;
let m, ok = 0, total = 0;
while ((m = re.exec(code)) !== null) {
  const no = parseInt(m[1]);
  const name = m[2];
  const upper = m[3];
  const lower = m[4];
  const lines = [...B8[lower], ...B8[upper]]; // 初爻到三爻是下卦，四爻到上爻是上卦
  const got = hexNo(lines);
  total++;
  if (got === no) {
    ok++;
  } else {
    console.log(`FAIL: ${name}(${no}) 期望=${no} 实际=${got} 上=${upper} 下=${lower}`);
  }
}
console.log(`全量权威核验结果: ${ok}/${total} 通过`);
if (ok === 64) console.log('✓ 64 卦查表算法 100% 正确！');
