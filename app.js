// 周易摇卦 · 前端逻辑
// 三枚铜钱，背为阳：3背=老阳9，2背=少阳7，1背=少阴8，0背=老阴6
// 卦象查表：行=下卦，列=上卦，八卦顺序 乾兑离震巽坎艮坤

const ORDER = ["乾", "兑", "离", "震", "巽", "坎", "艮", "坤"];
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
const TRI = ["坤", "艮", "坎", "巽", "震", "离", "兑", "乾"]; // index = 初*4+二*2+三
const IMG = { 乾: "天", 兑: "泽", 离: "火", 震: "雷", 巽: "风", 坎: "水", 艮: "山", 坤: "地" };
const YAO_TIP = ["初爻，事之始。起步阶段，宜稳不宜快。",
  "二爻，居中得位。守中道，可获助力。",
  "三爻，上下交界。进退两难，最易出岔子。",
  "四爻，逼近核心。位高责重，言行需谨慎。",
  "五爻，尊位得中。多半是吉，可放手施为。",
  "上爻，事之终。过犹不及，亢则有悔。"];

// 行=下卦，列=上卦
function lookup(upper, lower) { return RAW[lower][ORDER.indexOf(upper)]; }

console.assert(lookup("乾", "乾") === 1 && lookup("坤", "坤") === 2 &&
  lookup("坤", "乾") === 11 && lookup("乾", "坤") === 12 &&
  lookup("坎", "震") === 3 && lookup("坎", "离") === 63 &&
  lookup("离", "坎") === 64 && lookup("震", "艮") === 62, "卦表有误");

// 六爻（初爻在下）→ 上下卦名与查表序号
function hexInfo(lines) {
  const lv = lines[0] * 4 + lines[1] * 2 + lines[2];
  const uv = lines[3] * 4 + lines[4] * 2 + lines[5];
  const lower = TRI[lv], upper = TRI[uv];
  const no = lookup(upper, lower);
  const name = upper === lower ? `${upper}为${IMG[upper]}` : `${IMG[upper]}${IMG[lower]}${GUA[no - 1].q}`;
  return { lower, upper, no, name, data: GUA[no - 1] };
}

function toss() {
  let backs = 0;
  const coins = [0, 1, 2].map(() => { const b = Math.random() < 0.5 ? 1 : 0; backs += b; return b; });
  const val = [6, 8, 7, 9][backs];
  return { val, coins, yang: val === 7 || val === 9, moving: val === 6 || val === 9 };
}

const $ = s => document.querySelector(s);
const sleep = ms => new Promise(r => setTimeout(r, ms));

// 当前卦的状态（摇完保存，解卦时用）
let cur = null;
 
 function changedLines(state = cur) {
   if (!state) return null;
   if (!state.moves.length) return [...state.lines];
   const movesSet = new Set(state.moves.map(m => m.pos));
   return state.lines.map((v, i) => movesSet.has(i) ? 1 - v : v);
 }
 
 function changedHexInfo(state = cur) {
   return hexInfo(changedLines(state));
 }

function yaoHtml(yang, moving, small) {
  const h = small ? 7 : 11;
  const cls = "yao" + (moving ? " mv" : "") + (small ? " sm" : "");
  const bar = `<i style="height:${h}px"></i>`;
  return `<div class="${cls}">${yang ? bar : bar + bar}</div>`;
}

async function divinate() {
  const btn = $("#btn"), jie = $("#jie"), out = $("#out"), coins = $("#coins");
  const question = $("#q").value.trim();
  btn.disabled = true;
  jie.classList.remove("show");
  out.innerHTML = "";
  $("#jieOut").innerHTML = "";
  cur = null;
  coins.classList.add("show");
  const lines = [], moves = [], all = [];
  for (let i = 0; i < 6; i++) {
    const t = toss();
    all.push(t);
    lines.push(t.moving ? 1 - (t.yang ? 1 : 0) : (t.yang ? 1 : 0));
    if (t.moving) moves.push({ pos: i, was: t.yang });
    coins.innerHTML = `<div class="coinrow">${t.coins.map(b =>
      `<span class="coin ${b ? "b" : "z"}">${b ? "背" : "字"}</span>`).join("")}</div>
      <div class="cointxt">第 ${i + 1} 爻 · ${["老阴","少阳","少阴","老阳"][t.val === 6 ? 0 : t.val === 7 ? 1 : t.val === 8 ? 2 : 3]}${t.moving ? "（动）" : ""}</div>`;
    await sleep(260);
  }
  cur = { all, lines, moves, question };
  renderGua();
  btn.disabled = false;
}

function renderGua() {
  const ben = hexInfo(cur.lines);
  const hasMove = cur.moves.length > 0;
  let html = cur.question ? `<div class="ask">所问：${cur.question}</div>` : "";
  html += `<div class="panels">`;
  html += `<div class="panel">
    <div class="ptitle">本卦 · 现状</div>
    <div class="gua">${[5, 4, 3, 2, 1, 0].map(i =>
      yaoHtml(cur.all[i].yang, cur.all[i].moving, false)).join("")}</div>
    <div class="gname">${ben.name}</div>
  </div>`;
  if (hasMove) {
    const bx = changedHexInfo(cur);
    html += `<div class="arrow">→</div>`;
    html += `<div class="panel">
      <div class="ptitle">变卦 · 趋势</div>
      <div class="gua">${[5, 4, 3, 2, 1, 0].map(i =>
        yaoHtml(cur.lines[i] === 1, false, true)).join("")}</div>
      <div class="gname">${bx.name}</div>
    </div>`;
  }
  html += `</div>`;
  $("#out").innerHTML = html;
  const jie = $("#jie");
  jie.classList.add("show");
  jie.scrollIntoView({ behavior: "smooth", block: "start" });
}

function renderJie() {
  if (!cur) return;
  const ben = hexInfo(cur.lines);
  const hasMove = cur.moves.length > 0;
  let html = "";
  html += `<div class="card"><h3>卦辞</h3><p>${ben.data.s}</p></div>`;
  html += `<div class="card"><h3>象曰</h3><p class="xiang">${ben.data.x}</p></div>`;
  html += `<div class="card hi"><h3>解卦</h3><p>${ben.data.j}</p></div>`;

  if (hasMove) {
    html += `<div class="card"><h3>动爻 · ${cur.moves.length} 爻动</h3>` +
      cur.moves.map(m => `<p class="mvp">第 ${m.pos + 1} 爻（${"初二三四五上"[m.pos]}爻）：${YAO_TIP[m.pos]}</p>`).join("") + `</div>`;
    const bx = changedHexInfo(cur);
    html += `<div class="card hi"><h3>由变卦看走向</h3>
      <p class="gn">${bx.name}</p><p>${bx.data.j}</p></div>`;
  } else {
    html += `<div class="card"><h3>静卦</h3><p>六爻皆静，事态稳定。以本卦卦辞断之，不必再问变化。</p></div>`;
  }
  html += `<div class="end">一卦既出，仅供参考 · 事在人为</div>`;
  $("#jieOut").innerHTML = html;
}

$("#btn").addEventListener("click", divinate);
$("#jie").addEventListener("click", renderJie);
