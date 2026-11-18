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

    for tag, code in (('<script src="data.js"></script>', data), ('<script src="app.js"></script>', app)):
        if tag not in html:
            raise SystemExit(f"index.html 中找不到 {tag}，无法内联")
        html = html.replace(tag, f'<script>\n{code}\n</script>')

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(html, encoding="utf-8")
    print(f"单文件版已生成: {OUT}")

if __name__ == "__main__":
    main()
