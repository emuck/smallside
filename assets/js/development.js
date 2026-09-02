(() => {
window.SmallSideExtensionRoutes?.add("development");
const nav=document.querySelector("#primary-nav");nav.insertAdjacentHTML("beforeend",'<a href="#development">Development</a>');
const page=(t,l,c)=>`<article class="page"><header class="hero"><div class="eyebrow">${l}</div><h1>${t}</h1></header>${c}</article>`;
function show(){document.querySelector("#app").innerHTML=page("Platform development","SmallSide platform plan",`
<p class="lead">Current product direction, research and implementation milestones. The detailed Markdown files are in this repository's <code>docs/</code> directory.</p>
<div class="card-grid"><div class="card"><span class="number">01</span><h3>Foundation</h3><p>Portal, calendar, reflection workflow, league rules and curated sources are operational.</p></div><div class="card"><span class="number">02</span><h3>Current milestone</h3><p>Define the game schema and build the first 12 reviewed game cards.</p></div><div class="card"><span class="number">03</span><h3>Next capability</h3><p>Filter the library and assemble a rules-aware 60-minute session in under five minutes.</p></div></div>
<div class="section-head"><h2>Project documents</h2></div><div class="panel">
<div class="resource"><span class="icon">Plan</span><div><a href="../docs/product/PLATFORM_PLAN.md">Platform plan</a><div class="muted">Milestones, progress, content model and near-term work.</div></div></div>
<div class="resource"><span class="icon">Scan</span><div><a href="../docs/research/COMPETITIVE_RESEARCH.md">Competitive research</a><div class="muted">Commercial products, open-source landscape, positioning and naming review.</div></div></div>
<div class="resource"><span class="icon">Log</span><div><a href="../docs/development/DECISIONS.md">Decision log</a><div class="muted">Architecture and curriculum decisions.</div></div></div></div>`);}
function route(){const n=location.hash.slice(1);if(n==="development")show();document.querySelectorAll("nav a").forEach(a=>a.classList.toggle("active",a.getAttribute("href")===`#${n}`));}
window.addEventListener("hashchange",()=>setTimeout(route,0));route();
})();