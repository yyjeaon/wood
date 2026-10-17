// 64 卦查表反向验证
// 八卦标准三爻（初爻在前，1=阳 0=阴）
// index = 初*4 + 二*2 + 三
const B8 = {
  乾: [1,1,1], 兑: [1,1,0], 离: [1,0,1], 震: [1,0,0],
  巽: [0,1,1], 坎: [0,1,0], 艮: [0,0,1], 坤: [0,0,0]
};
const TRI = ['坤','艮','坎','巽','震','离','兑','乾']; // index -> 卦名
const ORDER = ['乾','兑','离','震','巽','坎','艮','坤']; // 自然序
const RAW = {
  乾: [1, 43, 14, 34, 9, 5, 26, 11],
  兑: [10, 58, 38, 54, 61, 60, 41, 19],
  离: [13, 49, 30, 55, 37, 63, 22, 36],
  震: [25, 17, 21, 51, 42, 3, 27, 24],
  巽: [44, 28, 50, 32, 57, 48, 18, 46],
  坎: [6, 47, 64, 40, 59, 29, 4, 7],
  艮: [33, 31, 56, 62, 53, 39, 52, 15],
  坤: [12, 45, 35, 16, 20, 8, 23, 2]
};
function lookup(upper, lower) { return RAW[lower][ORDER.indexOf(upper)]; }
function hexNo(lines) {
  const lv = lines[0]*4 + lines[1]*2 + lines[2];
  const uv = lines[3]*4 + lines[4]*2 + lines[5];
  return lookup(TRI[uv], TRI[lv]);
}

// 解析 gen.py 里的 GUA64 数组
const fs = require('fs');
const code = fs.readFileSync('gen.py', 'utf8');
const re = /\((\d+),"([^"]+)","(..)","([^"]+)","([^"]+)"\)/g;
let m, ok = 0, fail = 0;
while ((m = re.exec(code)) !== null) {
  const no = parseInt(m[1]);
  const name = m[2];
  const upper = m[3][0], lower = m[3][1];
  const lines = [...B8[lower], ...B8[upper]];
  const got = hexNo(lines);
  if (got === no) { ok++; }
  else { fail++; console.log('FAIL:', name, no, '期望', no, '实际', got, '上:', upper, '下:', lower); }
}
console.log('64 卦反向验证:', ok + '/64 通过,', fail, '个失败');
