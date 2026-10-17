#!/usr/bin/env python3
# 把 index.html + data.js + app.js 打包为单个 standalone.html
with open('/var/minis/workspace/yijing/index.html') as f:
    html = f.read()
with open('/var/minis/workspace/yijing/data.js') as f:
    data = f.read()
with open('/var/minis/workspace/yijing/app.js') as f:
    app = f.read()

# 替换 script src 为内联
html = html.replace('<script src="data.js"></script>', f'<script>\n{data}\n</script>')
html = html.replace('<script src="app.js"></script>', f'<script>\n{app}\n</script>')

target = '/sdcard/Download/摇卦/周易摇卦_单文件版.html'
with open(target, 'w') as f:
    f.write(html)
print(f'单文件版已生成: {target}')
