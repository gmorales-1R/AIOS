#!/usr/bin/env python3
"""Generate .this/interfaces/dashboard.html. Run to refresh."""

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
OUT  = Path(__file__).parent / "dashboard.html"
SKIP = {'.git', '__pycache__', 'node_modules', '.DS_Store'}

def build_tree(path: Path) -> dict:
    rel = str(path.relative_to(ROOT))
    if rel == '.':
        rel = ''
    this_md = path / 'this.md'
    children = [
        build_tree(c)
        for c in sorted(path.iterdir(),
                        key=lambda p: (not p.name.startswith('.'), p.name.lower()))
        if c.name not in SKIP and c.is_dir()
    ]
    return {
        'name': 'AIOS' if not rel else path.name,
        'rel': rel,
        'hasThis': this_md.exists(),
        'content': this_md.read_text(encoding='utf-8') if this_md.exists() else '',
        'children': children,
    }

TREE_JSON = json.dumps(build_tree(ROOT), ensure_ascii=False)

TEMPLATE = r"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>AIOS Dashboard</title>
<style>
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
:root{
  --bg:#0d0d0d;--surface:#111;--surface2:#161616;--border:#222;
  --text:#e0e0e0;--muted:#666;--dim:#333;--accent:#5b9cf6;--hover:#1a1a1a;
  --sidebar-w:220px;--panel-w:440px;--bar-h:48px;
}
html,body{height:100%;overflow:hidden}
body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",system-ui,sans-serif;
  background:var(--bg);color:var(--text);font-size:14px}

/* layout */
.layout{display:flex;height:100vh}

/* sidebar */
.sidebar{width:var(--sidebar-w);background:var(--surface);
  border-right:1px solid var(--border);display:flex;flex-direction:column;
  flex-shrink:0;transition:width .22s ease;overflow:hidden}
.sidebar.collapsed{width:0;border-right:none}
.sb-header{height:var(--bar-h);display:flex;align-items:center;padding:0 16px;
  border-bottom:1px solid var(--border);font-weight:600;letter-spacing:.1em;
  color:#fff;font-size:13px;flex-shrink:0;white-space:nowrap}
.sb-nav{padding:12px 0;flex:1}
.sb-nav a{display:block;padding:8px 16px;color:var(--muted);text-decoration:none;
  font-size:13px;border-radius:6px;margin:0 8px;transition:background .1s,color .1s;
  white-space:nowrap}
.sb-nav a:hover{background:var(--hover);color:var(--text)}

/* main */
.main{flex:1;display:flex;flex-direction:column;overflow:hidden;min-width:0}
.topbar{height:var(--bar-h);display:flex;align-items:center;padding:0 16px;gap:12px;
  border-bottom:1px solid var(--border);background:var(--surface);flex-shrink:0}
.burger{background:none;border:none;color:var(--muted);cursor:pointer;padding:4px;
  display:flex;align-items:center;border-radius:4px;transition:color .1s,background .1s}
.burger:hover{color:var(--text);background:var(--hover)}
.topbar-title{font-size:13px;color:var(--muted)}

/* tree */
.tree-area{flex:1;overflow-y:auto;padding:8px 0}
.tree-children{display:none}
.tree-children.open{display:block}
.tree-row{display:flex;align-items:center;gap:4px;padding:3px 8px 3px 0;
  cursor:pointer;border-radius:4px;position:relative;user-select:none}
.tree-row:hover{background:var(--hover)}
.tree-row:hover .row-actions{opacity:1}
.chevron{flex-shrink:0;width:16px;height:16px;display:flex;align-items:center;
  justify-content:center;color:var(--dim);font-size:10px;transition:transform .15s}
.chevron.open{transform:rotate(90deg)}
.ch-spacer{width:16px;flex-shrink:0}
.node-name{flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;
  font-size:13px;color:var(--text)}
.node-name.lit{color:#fff;font-weight:500}
.node-name.dot{color:var(--muted);font-style:italic}
.this-pip{width:5px;height:5px;border-radius:50%;background:var(--accent);
  flex-shrink:0;opacity:.5}
.row-actions{display:flex;gap:2px;opacity:0;transition:opacity .1s;flex-shrink:0}
.act{background:none;border:none;color:var(--muted);cursor:pointer;padding:2px 5px;
  border-radius:4px;font-size:12px;display:flex;align-items:center;
  transition:color .1s,background .1s;line-height:1}
.act:hover{color:var(--text);background:var(--border)}
.act.lit{color:var(--accent);opacity:.7}
.act.lit:hover{opacity:1}

/* panel */
.overlay{position:fixed;inset:0;background:rgba(0,0,0,.5);opacity:0;
  pointer-events:none;transition:opacity .2s;z-index:10}
.overlay.open{opacity:1;pointer-events:all}
.panel{position:fixed;top:0;right:0;width:var(--panel-w);height:100%;
  background:var(--surface);border-left:1px solid var(--border);
  display:flex;flex-direction:column;transform:translateX(100%);
  transition:transform .25s ease;z-index:11}
.panel.open{transform:translateX(0)}
.panel-head{height:var(--bar-h);display:flex;align-items:center;padding:0 16px;
  border-bottom:1px solid var(--border);gap:8px;flex-shrink:0}
.panel-path{flex:1;font-family:monospace;font-size:12px;color:var(--muted);
  white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.panel-x{background:none;border:none;color:var(--muted);cursor:pointer;
  font-size:16px;padding:4px;border-radius:4px;transition:color .1s;line-height:1}
.panel-x:hover{color:var(--text)}
.panel-body{flex:1;overflow-y:auto;padding:20px;line-height:1.65}

/* markdown */
.panel-body h1{font-size:1.25rem;margin-bottom:12px;color:#fff}
.panel-body h2{font-size:1rem;margin:20px 0 8px;color:#fff;
  border-bottom:1px solid var(--border);padding-bottom:4px}
.panel-body h3{font-size:.92rem;margin:16px 0 6px;color:#ddd}
.panel-body p{margin-bottom:10px;font-size:13px}
.panel-body ul,.panel-body ol{margin:0 0 10px 20px}
.panel-body li{margin:3px 0;font-size:13px}
.panel-body code{font-family:monospace;background:var(--surface2);padding:1px 5px;
  border-radius:3px;font-size:12px;color:#a8d8ff}
.panel-body pre{background:var(--surface2);padding:12px;border-radius:6px;
  overflow-x:auto;margin-bottom:12px;border:1px solid var(--border)}
.panel-body pre code{background:none;padding:0}
.panel-body table{border-collapse:collapse;width:100%;margin-bottom:12px;font-size:13px}
.panel-body th{background:var(--surface2);padding:6px 10px;text-align:left;
  border:1px solid var(--border);color:#ccc;font-weight:500}
.panel-body td{padding:5px 10px;border:1px solid var(--border)}
.panel-body strong{color:#fff;font-weight:600}
.panel-body em{color:#bbb}
.no-content{color:var(--muted);font-style:italic;font-size:13px}

/* scrollbar */
::-webkit-scrollbar{width:5px}
::-webkit-scrollbar-track{background:transparent}
::-webkit-scrollbar-thumb{background:var(--border);border-radius:3px}
::-webkit-scrollbar-thumb:hover{background:var(--dim)}
</style>
</head>
<body>
<div class="layout">
  <aside class="sidebar" id="sb">
    <div class="sb-header">AIOS</div>
    <nav class="sb-nav">
      <a href="#">Home</a>
      <a href="#">About</a>
      <a href="#">Contact</a>
    </nav>
  </aside>
  <div class="main">
    <div class="topbar">
      <button class="burger" id="burger" title="Toggle sidebar">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <rect y="2"    width="16" height="1.5" rx=".75"/>
          <rect y="7.25" width="16" height="1.5" rx=".75"/>
          <rect y="12.5" width="16" height="1.5" rx=".75"/>
        </svg>
      </button>
      <span class="topbar-title">Dashboard</span>
    </div>
    <div class="tree-area" id="tree-area"></div>
  </div>
</div>

<div class="overlay" id="overlay"></div>
<div class="panel" id="panel">
  <div class="panel-head">
    <span class="panel-path" id="panel-path"></span>
    <button class="panel-x" id="panel-x">✕</button>
  </div>
  <div class="panel-body" id="panel-body"></div>
</div>

<script>
const TREE = __TREE__;

// ── persistence ────────────────────────────────
const openSet = new Set(JSON.parse(localStorage.getItem('aios_open') || '[]'));
const save    = () => localStorage.setItem('aios_open', JSON.stringify([...openSet]));

// ── sidebar ────────────────────────────────────
const sb     = document.getElementById('sb');
const burger = document.getElementById('burger');
const setSB  = open => { sb.classList.toggle('collapsed', !open); localStorage.setItem('aios_sb', open?'1':'0'); };
burger.addEventListener('click', () => setSB(sb.classList.contains('collapsed')));
setSB(localStorage.getItem('aios_sb') !== '0');

// ── panel ──────────────────────────────────────
const overlay   = document.getElementById('overlay');
const panel     = document.getElementById('panel');
const panelPath = document.getElementById('panel-path');
const panelBody = document.getElementById('panel-body');

const openPanel = node => {
  panelPath.textContent = node.rel ? '/'+node.rel : '/';
  panelBody.innerHTML   = renderMd(node.content);
  panel.classList.add('open'); overlay.classList.add('open');
};
const closePanel = () => { panel.classList.remove('open'); overlay.classList.remove('open'); };
document.getElementById('panel-x').addEventListener('click', closePanel);
overlay.addEventListener('click', closePanel);

// ── markdown ───────────────────────────────────
const esc = s => s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

function inline(s) {
  s = esc(s);
  s = s.replace(/`([^`]+)`/g,        '<code>$1</code>');
  s = s.replace(/\*\*([^*]+)\*\*/g,  '<strong>$1</strong>');
  s = s.replace(/\*([^*]+)\*/g,      '<em>$1</em>');
  s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
  return s;
}

function renderMd(md) {
  if (!md || !md.trim()) return '<p class="no-content">No this.md defined.</p>';

  // extract code blocks
  const blocks = [];
  md = md.replace(/```[^\n]*\n([\s\S]*?)```/g, (_, code) => {
    blocks.push(`<pre><code>${esc(code.trim())}</code></pre>`);
    return `<!--CB:${blocks.length-1}-->`;
  });

  const lines = md.split('\n');
  const out   = [];
  let i = 0;

  while (i < lines.length) {
    const l = lines[i];

    // code block placeholder
    if (/^<!--CB:\d+-->$/.test(l.trim())) {
      out.push(blocks[+l.match(/\d+/)[0]]);
      i++; continue;
    }

    // table
    if (l.includes('|') && l.trim().startsWith('|')) {
      const rows = [];
      while (i < lines.length && lines[i].includes('|')) { rows.push(lines[i]); i++; }
      const data = rows.filter(r => !/^\s*\|[-:\s|]+\|\s*$/.test(r));
      if (data.length) {
        let t = '<table>';
        data.forEach((r,ri) => {
          const cells = r.split('|').slice(1,-1);
          const tag   = ri===0 ? 'th' : 'td';
          t += '<tr>'+cells.map(c=>`<${tag}>${inline(c.trim())}</${tag}>`).join('')+'</tr>';
        });
        out.push(t+'</table>');
      }
      continue;
    }

    // list
    if (/^\s*[-*+] /.test(l)) {
      const items = [];
      while (i < lines.length && /^\s*[-*+] /.test(lines[i]))
        items.push(`<li>${inline(lines[i++].replace(/^\s*[-*+] /,''))}</li>`);
      out.push('<ul>'+items.join('')+'</ul>'); continue;
    }

    // headings
    const h = l.match(/^(#{1,3}) (.+)/);
    if (h) { out.push(`<h${h[1].length}>${inline(h[2])}</h${h[1].length}>`); i++; continue; }

    // blank
    if (!l.trim()) { i++; continue; }

    // comment / html passthrough
    if (l.startsWith('<') || l.startsWith('<!--')) { out.push(l); i++; continue; }

    // paragraph — gather until blank or structural line
    const para = [];
    while (i < lines.length) {
      const cur = lines[i];
      if (!cur.trim() || cur.match(/^#+/) || cur.includes('|') || /^\s*[-*+] /.test(cur) || cur.startsWith('<')) break;
      para.push(cur); i++;
    }
    if (para.length) out.push(`<p>${inline(para.join(' '))}</p>`);
  }

  return out.join('\n');
}

// ── icons ──────────────────────────────────────
const ICON_ADD  = `<svg width="11" height="11" viewBox="0 0 11 11" fill="currentColor"><path d="M4.75 0v4.75H0v1.5h4.75V11h1.5V6.25H11v-1.5H6.25V0z"/></svg>`;
const ICON_FIND = `<svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><circle cx="5.5" cy="5.5" r="4"/><line x1="8.5" y1="8.5" x2="12" y2="12"/></svg>`;

// ── tree ───────────────────────────────────────
function renderNode(node, depth, container) {
  const row = document.createElement('div');
  row.className = 'tree-row';
  row.style.paddingLeft = (depth * 20 + 8) + 'px';

  const hasKids = node.children && node.children.length > 0;
  const isOpen  = openSet.has(node.rel);

  // chevron / spacer
  const chev = document.createElement('span');
  chev.className = hasKids ? 'chevron' + (isOpen ? ' open' : '') : 'ch-spacer';
  if (hasKids) chev.innerHTML = '&#9656;';
  row.appendChild(chev);

  // name
  const nm = document.createElement('span');
  nm.className = 'node-name' + (node.hasThis ? ' lit' : '') + (node.name.startsWith('.') ? ' dot' : '');
  nm.textContent = node.name;
  row.appendChild(nm);

  // pip
  if (node.hasThis) {
    const pip = document.createElement('span');
    pip.className = 'this-pip';
    row.appendChild(pip);
  }

  // actions (right-aligned via flex:1 on name)
  const acts = document.createElement('div');
  acts.className = 'row-actions';

  const addBtn = document.createElement('button');
  addBtn.className = 'act';
  addBtn.title     = 'Add child node';
  addBtn.innerHTML = ICON_ADD;
  addBtn.onclick   = e => e.stopPropagation();
  acts.appendChild(addBtn);

  const viewBtn = document.createElement('button');
  viewBtn.className = 'act' + (node.hasThis ? ' lit' : '');
  viewBtn.title     = node.hasThis ? 'View this.md' : 'No this.md';
  viewBtn.innerHTML = ICON_FIND;
  viewBtn.onclick   = e => { e.stopPropagation(); openPanel(node); };
  acts.appendChild(viewBtn);

  row.appendChild(acts);

  // children container
  let childrenEl = null;
  if (hasKids) {
    childrenEl = document.createElement('div');
    childrenEl.className = 'tree-children' + (isOpen ? ' open' : '');
    node.children.forEach(c => renderNode(c, depth + 1, childrenEl));

    row.onclick = () => {
      const nowOpen = !childrenEl.classList.contains('open');
      nowOpen ? openSet.add(node.rel) : openSet.delete(node.rel);
      save();
      chev.classList.toggle('open', nowOpen);
      childrenEl.classList.toggle('open', nowOpen);
    };
  }

  container.appendChild(row);
  if (childrenEl) container.appendChild(childrenEl);
}

// render & auto-expand root on first visit
const area = document.getElementById('tree-area');
renderNode(TREE, 0, area);
if (!openSet.has('')) {
  openSet.add(''); save();
  area.querySelector('.chevron').classList.add('open');
  area.querySelector('.tree-children').classList.add('open');
}
</script>
</body>
</html>"""

html = TEMPLATE.replace('__TREE__', TREE_JSON)
OUT.write_text(html, encoding='utf-8')
print(f"Written → {OUT}")
