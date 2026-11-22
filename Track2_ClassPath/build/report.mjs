// 极简 Markdown → HTML（只覆盖这份报告用到的语法），输出可打印的 report.html
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const src = readFileSync(resolve(root, "01_逆向设计报告.md"), "utf8");

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function inline(s) {
  let t = esc(s);
  t = t.replace(/`([^`]+)`/g, (_, c) => `<code>${c}</code>`);
  t = t.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, txt, href) => `<a href="${href}">${txt}</a>`);
  t = t.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
  return t;
}

const lines = src.split(/\r?\n/);
const out = [];
let i = 0;
let listType = null;

function closeList() {
  if (listType) { out.push(`</${listType}>`); listType = null; }
}

while (i < lines.length) {
  const line = lines[i];

  // 代码块
  if (/^```/.test(line)) {
    closeList();
    const buf = [];
    i++;
    while (i < lines.length && !/^```/.test(lines[i])) buf.push(lines[i++]);
    i++;
    out.push(`<pre><code>${esc(buf.join("\n"))}</code></pre>`);
    continue;
  }

  // 标题
  const h = line.match(/^(#{1,4})\s+(.*)$/);
  if (h) {
    closeList();
    const lvl = h[1].length;
    out.push(`<h${lvl}>${inline(h[2])}</h${lvl}>`);
    i++;
    continue;
  }

  // 分隔线
  if (/^---+$/.test(line.trim())) {
    closeList();
    out.push("<hr>");
    i++;
    continue;
  }

  // 表格
  if (/^\s*\|/.test(line) && /^\s*\|[\s:-]+\|/.test(lines[i + 1] || "")) {
    closeList();
    const rows = [];
    const header = line.trim().replace(/^\||\|$/g, "").split("|").map((c) => c.trim());
    i += 2;
    while (i < lines.length && /^\s*\|/.test(lines[i])) {
      rows.push(lines[i].trim().replace(/^\||\|$/g, "").split("|").map((c) => c.trim()));
      i++;
    }
    out.push("<table>");
    out.push(`<thead><tr>${header.map((c) => `<th>${inline(c)}</th>`).join("")}</tr></thead><tbody>`);
    for (const r of rows) {
      out.push(`<tr>${r.map((c) => `<td>${inline(c)}</td>`).join("")}</tr>`);
    }
    out.push("</tbody></table>");
    continue;
  }

  // 引用
  if (/^>\s?/.test(line)) {
    closeList();
    const buf = [];
    while (i < lines.length && /^>\s?/.test(lines[i])) {
      buf.push(lines[i].replace(/^>\s?/, ""));
      i++;
    }
    out.push(`<blockquote>${buf.map((b) => inline(b)).join("<br>")}</blockquote>`);
    continue;
  }

  // 列表
  const ul = line.match(/^\s*[-*]\s+(.*)$/);
  const ol = line.match(/^\s*(\d+)\.\s+(.*)$/);
  if (ul || ol) {
    const type = ul ? "ul" : "ol";
    if (listType !== type) { closeList(); out.push(`<${type}>`); listType = type; }
    out.push(`<li>${inline(ul ? ul[1] : ol[2])}</li>`);
    i++;
    continue;
  }

  // 空行
  if (!line.trim()) { closeList(); i++; continue; }

  // 段落
  closeList();
  const buf = [];
  while (
    i < lines.length &&
    lines[i].trim() &&
    !/^(#{1,4})\s/.test(lines[i]) &&
    !/^```/.test(lines[i]) &&
    !/^>\s?/.test(lines[i]) &&
    !/^\s*\|/.test(lines[i]) &&
    !/^\s*[-*]\s+/.test(lines[i]) &&
    !/^\s*\d+\.\s+/.test(lines[i]) &&
    !/^---+$/.test(lines[i].trim())
  ) {
    buf.push(lines[i++]);
  }
  out.push(`<p>${inline(buf.join(" "))}</p>`);
}
closeList();

const html = `<!doctype html>
<html lang="zh-CN"><head><meta charset="utf-8">
<title>ClassPath 课路 · 逆向设计报告</title>
<style>
@page { size: A4; margin: 18mm 16mm 16mm; }
* { box-sizing: border-box; }
body{
  font-family:"PingFang SC","HarmonyOS Sans SC","Microsoft YaHei","Noto Sans SC",system-ui,sans-serif;
  font-size:10.4pt; line-height:1.78; color:#16181D; margin:0;
  -webkit-font-smoothing:antialiased;
}
h1{font-size:23pt;line-height:1.25;letter-spacing:-.02em;margin:0 0 2mm;}
h2{font-size:14pt;margin:9mm 0 3mm;padding-bottom:2mm;border-bottom:1.2px solid #16181D;letter-spacing:-.01em;page-break-after:avoid;}
h3{font-size:11.6pt;margin:6mm 0 2mm;color:#1B3FD8;page-break-after:avoid;}
h4{font-size:10.6pt;margin:4mm 0 1.5mm;page-break-after:avoid;}
p{margin:0 0 2.6mm;}
strong{font-weight:700;}
em{font-style:normal;color:#1B3FD8;font-weight:600;}
code{font-family:"Cascadia Mono",Consolas,monospace;font-size:9pt;background:#F2EFE7;padding:.4mm 1.2mm;border-radius:1mm;}
pre{background:#0E1015;color:#EDEAE2;padding:4mm 5mm;border-radius:2mm;overflow:hidden;page-break-inside:avoid;}
pre code{background:none;color:inherit;font-size:8.8pt;line-height:1.75;padding:0;}
blockquote{margin:3mm 0;padding:3mm 4mm;border-left:2.4px solid #1B3FD8;background:#F4F6FF;color:#2C323D;
  font-size:10.2pt;page-break-inside:avoid;}
blockquote strong{color:#111;}
table{width:100%;border-collapse:collapse;margin:3mm 0 4mm;font-size:9pt;page-break-inside:avoid;}
th{background:#16181D;color:#F6F3EC;font-weight:600;text-align:left;padding:1.8mm 2.2mm;font-size:8.8pt;letter-spacing:.04em;}
td{padding:1.7mm 2.2mm;border-bottom:.5px solid #DCD6C8;vertical-align:top;}
tr:nth-child(even) td{background:#FAF8F2;}
ul,ol{margin:0 0 3mm;padding-left:5mm;}
li{margin:0 0 1.2mm;}
hr{border:none;border-top:.6px solid #D8D2C4;margin:6mm 0;}
a{color:#1B3FD8;text-decoration:none;}
h1 + h2{margin-top:6mm;}
</style></head><body>
${out.join("\n")}
</body></html>`;

writeFileSync(resolve(root, "submission", "report.html"), html, "utf8");
console.log("written: submission/report.html");
