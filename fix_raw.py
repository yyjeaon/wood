#!/usr/bin/env python3
# 从 gen.py 的 GUA64 数组重新生成正确的 RAW 查表
import re

with open("/var/minis/workspace/yijing/gen.py") as f:
    code = f.read()

# 解析 GUA64
gua64 = []
for m in re.finditer(r'\((\d+),"([^"]+)","(..)","([^"]+)","([^"]+)"\)', code):
    no = int(m.group(1))
    name = m.group(2)
    upper = m.group(3)[0]
    lower = m.group(3)[1]
    gua64.append((no, name, upper, lower))

ORDER = ['乾','兑','离','震','巽','坎','艮','坤']

# 构建 RAW 表：RAW[lower][ORDER.indexOf(upper)] = no
RAW = {lower: [0]*8 for lower in ORDER}
for no, name, upper, lower in gua64:
    col = ORDER.index(upper)
    RAW[lower][col] = no

# 验证 64 卦全覆盖
seen = set()
for lower in ORDER:
    for upper in ORDER:
        no = RAW[lower][ORDER.index(upper)]
        seen.add(no)
print(f"覆盖: {len(seen)}/64, 缺失: {set(range(1,65)) - seen}")

# 输出 JS 格式
lines = ["const RAW = {"]
for lower in ORDER:
    vals = ", ".join(str(n) for n in RAW[lower])
    lines.append(f"  {lower}: [{vals}],")
lines.append("};")

with open("/var/minis/workspace/yijing/raw.js", "w") as f:
    f.write("\n".join(lines))
print("已写入 raw.js")

# 同时验证几个关键卦
tests = [
    ("师", "坎", "坤", 7),
    ("比", "坤", "坎", 8),
    ("同人", "离", "乾", 13),
    ("大有", "乾", "离", 14),
    ("蛊", "巽", "艮", 18),
    ("观", "坤", "巽", 20),
    ("贲", "离", "艮", 22),
    ("大过", "巽", "兑", 28),
    ("咸", "艮", "兑", 31),
    ("恒", "巽", "震", 32),
    ("大壮", "乾", "震", 34),
    ("蹇", "艮", "坎", 39),
    ("解", "坎", "震", 40),
    ("夬", "乾", "兑", 43),
    ("萃", "坤", "兑", 45),
    ("困", "坎", "兑", 47),
    ("井", "巽", "坎", 48),
    ("革", "离", "兑", 49),
    ("鼎", "巽", "离", 50),
    ("丰", "离", "震", 55),
    ("旅", "艮", "离", 56),
    ("涣", "坎", "巽", 59),
    ("节", "兑", "坎", 60),
    ("小过", "艮", "震", 62),
]
for name, upper, lower, expect in tests:
    got = RAW[lower][ORDER.index(upper)]
    status = "OK" if got == expect else "FAIL"
    print(f"{status}: {name} 上{upper}下{lower} = {got} (期望{expect})")
