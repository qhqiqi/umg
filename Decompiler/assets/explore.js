/* 全站探索进度：记录访问过哪些页面，右下角显示进度 */
(function(){
  const ORDER = [
    ["lab",       "实验室主页"],
    ["method",    "方法 · 判据打分器"],
    ["devices",   "装置库"],
    ["archive",   "档案库"],
    ["dossier",   "读一份档案"],
    ["case",      "案例 ClassPath"],
    ["sound",     "声音板"],
    ["quiz",      "机制测验"],
    ["workbench", "逆向工作台"]
  ];
  const KEY = "dd_explore", DONE_KEY = "dd_explore_done";
  const load = () => { try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch(e){ return []; } };
  const save = v => { try { localStorage.setItem(KEY, JSON.stringify(v)); } catch(e){} };

  let done = load();
  const page = document.body.dataset.page;
  if(page && ORDER.some(([k]) => k === page) && !done.includes(page)){ done.push(page); save(done); }

  const total = ORDER.length, n = done.length;

  /* 进度条 */
  const bar = document.createElement("div");
  bar.className = "xp";
  bar.innerHTML = `<span class="xp-dot"></span><span class="xp-txt">探索 ${n}/${total}</span><i><b style="width:${(n/total*100).toFixed(0)}%"></b></i>`;
  document.body.appendChild(bar);

  /* 面板 */
  const panel = document.createElement("div");
  panel.className = "xp-panel";
  panel.innerHTML = `
    <div class="xp-h">EXPLORE · ${n}/${total}</div>
    <div class="xp-list">${ORDER.map(([k,label]) =>
      `<div class="xp-item ${done.includes(k) ? "on" : ""}"><s>${done.includes(k) ? "✓" : ""}</s>${label}</div>`).join("")}</div>
    <div class="xp-foot">完成度存在你自己的浏览器里，不上传。</div>`;
  document.body.appendChild(panel);

  bar.addEventListener("click", () => {
    panel.classList.toggle("on");
    if(n === total) panel.querySelector(".xp-h").textContent = "EXPLORE · 全部完成 🎉";
  });
  document.addEventListener("click", e => {
    if(!panel.contains(e.target) && !bar.contains(e.target)) panel.classList.remove("on");
  });

  /* 全部完成的一次性提示 */
  if(n === total && !localStorage.getItem(DONE_KEY)){
    localStorage.setItem(DONE_KEY, "1");
    const t = document.createElement("div");
    t.className = "xp-toast";
    t.textContent = "9/9 全部探索完成 —— 你比大多数用户更懂自己怎么被抓住。";
    document.body.appendChild(t);
    setTimeout(() => t.classList.add("on"), 400);
    setTimeout(() => { t.classList.remove("on"); setTimeout(() => t.remove(), 500); }, 6000);
  }
})();
