#!/usr/bin/env python3
# 把 index.html + data.js + app.js 打包为单个 standalone.html
import re
from pathlib import Path

ROOT = Path(__file__).parent
HTML = ROOT / "index.html"
DATA = ROOT / "data.js"
APP = ROOT / "app.js"
OUT = ROOT / "dist" / "周易摇卦.html"

def escape_script(text: str) -> str:
    # 避免内联脚本被 </script> 提前终止
    return text.replace("</script>", "<\\/script>")

def main():
    html = HTML.read_text(encoding="utf-8")
    data = escape_script(DATA.read_text(encoding="utf-8"))
    app = escape_script(APP.read_text(encoding="utf-8"))

    html = html.replace('<script src="data.js"></script>', f'<script>\n{data}\n</script>')
    html = html.replace('<script src="app.js"></script>', f'<script>\n{app}\n</script>')

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(html, encoding="utf-8")
    print(f"单文件版已生成: {OUT}")

if __name__ == "__main__":
    main()
