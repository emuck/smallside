(() => {
["rules","catalogue"].forEach(route=>window.SmallSideExtensionRoutes?.add(route));
const nav=document.querySelector("#primary-nav"), safety=nav.querySelector('a[href="#safety"]');
safety.insertAdjacentHTML("beforebegin",'<a href="#rules">Rules</a><a href="#catalogue">Resources</a>');
const page=(t,l,c)=>`<article class="page"><header class="hero"><div class="eyebrow">${l}</div><h1>${t}</h1></header>${c}</article>`;
const clean=v=>String(v??"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const safeHttps=value=>{try{const url=new URL(value);return url.protocol==="https:"?url.href:"";}catch(_){return "";}};
async function rules(){
  document.querySelector("#app").innerHTML=page("Match rules","Match rules",'<p class="lead">Loading the active league rules…</p>');
  try{
    const content=await window.SmallSideContent.ready;
    const league=content.league;
    const format=league.format;
    const halvesWord={1:"One",2:"Two",3:"Three",4:"Four"}[format.halves]||format.halves;
    const rows=[
      ["Format",`${format.players_per_side}v${format.players_per_side}${format.goalkeeper?" with goalkeepers":""}`,"Rotate goalkeeper opportunities; avoid early specialization."],
      ["Ball",format.ball_size,"Bring spare match-ready balls for quick restarts."],
      ["Required equipment",format.required_equipment,"Check every player before kickoff."],
      ["Game time",`${halvesWord} ${format.minutes_per_half}-minute halves; ${format.halftime_minutes}-minute halftime`,"Keep halftime brief and use it for water and encouragement."],
      ["Playing time",format.playing_time_policy,"Plan rotations before kickoff; do not rely on memory."],
      ["Substitutions",format.substitutions_policy,"Use short, frequent shifts while keeping the game moving."],
      ["Uneven numbers",format.uneven_numbers_policy,"Protect participation and playing time. Do not use guest players from unrelated teams."],
      ["Restarts",format.restarts,"Have spare balls ready and restart quickly into playable space."],
      ["Not used",format.not_used,`The baseline omits these adult-game rules; verify any ${league.name} season update.`],
      ["Goalkeeper",format.goalkeeper_handling,"Agree on goalkeeper and restart handling with the other coach before kickoff."],
      ["Officials",format.officials==="coaches"?"Coaches manage time and calls":format.officials,"Agree on safety, substitutions and restart handling with the other coach before kickoff."]
    ];
    const localSource=(league.sources||[]).find(s=>s.role==="controlling-local");
    const handbookSource=(league.sources||[]).find(s=>s.role==="coach-handbook");
    const quickLinks=[
      localSource?`<a class="button secondary" href="${clean(safeHttps(localSource.url))}" target="_blank" rel="noreferrer">Open club rules page</a>`:"",
      handbookSource?`<a class="button secondary" href="${clean(safeHttps(handbookSource.url))}" target="_blank" rel="noreferrer">Open official coach handbook</a>`:""
    ].filter(Boolean).join(" ");
    document.querySelector("#app").innerHTML=page(`${clean(league.name)} match format`,"Match rules",`
<div class="callout"><b>Source and scope:</b> The ${clean(league.name)} rules are the current source for this summary. Current season Rules and Regulations prevail if they differ; confirm changes with the club before each season.</div>
<div class="section-head"><h2>Quick reference</h2><div>${quickLinks}</div></div>
<div class="rule-table">${rows.map(r=>`<div class="rule-row"><b>${clean(r[0])}</b><span>${clean(r[1])}</span><small>${clean(r[2])}</small></div>`).join("")}</div>
<div class="section-head"><h2>Coach responsibilities</h2></div><div class="card-grid">
<div class="card"><span class="number">01</span><h3>Before kickoff</h3><p>Confirm field setup, secure goals, ${clean(String(format.ball_size).toLowerCase())} ball, ${clean(String(format.required_equipment).toLowerCase())}, ${clean(String(halvesWord).toLowerCase())} ${format.minutes_per_half}-minute halves, equal-time rotation plan and restart handling with the other coach.</p></div>
<div class="card"><span class="number">02</span><h3>During play</h3><p>Manage restarts and substitutions with the other coach. Keep instructions brief, apply rules consistently and protect each player's minimum playing time.</p></div>
<div class="card"><span class="number">03</span><h3>After the game</h3><p>Do not record standings or frame the result as the objective. Note participation, enjoyment and football behaviors to revisit in practice.</p></div></div>
<div class="section-head"><h2>Heading and suspected head injury</h2></div><div class="two-col">
<div class="panel"><h3>Heading policy</h3><p>${clean(format.heading_policy)}</p></div>
<div class="panel"><h3>When a head injury is suspected</h3><p>Stop play immediately and remove the player. Do not allow a suspected head injury to return for the rest of that practice or game; use the club's reporting pathway immediately. Never allow match pressure to influence this decision.</p></div></div>
<div class="callout" style="margin-top:20px"><b>Memory aid:</b> ${format.players_per_side} players including a goalkeeper - ${clean(String(format.ball_size).toLowerCase())} ball - ${clean(String(halvesWord).toLowerCase())} ${format.minutes_per_half}-minute halves - coaches manage calls and restarts.</div>`);
  }catch(error){
    console.error("League rules unavailable",error);
    document.querySelector("#app").innerHTML=page("Match rules unavailable","Try again shortly",'<div class="callout"><b>The current league rules could not load.</b> Check your connection and refresh the page.</div>');
  }
}
function card(s){return `<article class="card catalogue-card" data-country="${clean(s.country)}"><div class="eyebrow">${clean(s.country)} - ${clean(s.type)}</div><h3>${clean(s.title)}</h3><span class="pill">${clean(s.age)}</span><p>${clean(s.use)}</p><a href="${clean(safeHttps(s.url))}" target="_blank" rel="noreferrer">Open resource</a></article>`;}
function orgCard(o){return `<article class="card catalogue-card"><h3>${clean(o.name)}</h3>${o.purpose?`<p>${clean(o.purpose)}</p>`:""}<a href="${clean(safeHttps(o.url))}" target="_blank" rel="noreferrer">Open site</a></article>`;}
async function catalogue(){
  document.querySelector("#app").innerHTML=page("Coaching resources","Useful sources",'<p class="lead">Loading resources…</p>');
  let affiliatedMarkup="";
  try{
    const content=await window.SmallSideContent.ready;
    const orgs=content.league?.affiliated_organizations||[];
    if(orgs.length)affiliatedMarkup=`<div class="section-head"><h2>Affiliated organizations</h2></div><div class="catalogue-grid">${orgs.map(orgCard).join("")}</div>`;
  }catch(error){console.error("Affiliated organizations unavailable",error);}
  let sources=[];
  try{
    const res=await fetch("data/library/resources.json",{cache:"no-store"});
    if(!res.ok)throw new Error("resources fetch failed");
    sources=(await res.json()).resources||[];
  }catch(error){console.error("Federation resources unavailable",error);}
  const federationMarkup=sources.length?`
<div class="section-head"><h2>Federation resources</h2></div>
<p class="lead">Federation-produced resources selected for clear practice design and development-first coaching across young age bands. Add an activity only after checking that most players remain active and make football decisions.</p>
<div class="tabs" id="resource-filters"><button class="active" data-filter="All">All</button>${[...new Set(sources.map(s=>s.country))].map(x=>`<button data-filter="${clean(x)}">${clean(x)}</button>`).join("")}</div>
<div class="catalogue-grid">${sources.map(card).join("")}</div>`:'<div class="callout">Federation resources could not load. Check your connection and refresh the page.</div>';
  document.querySelector("#app").innerHTML=page("Coaching resources","Useful sources",`
${affiliatedMarkup}
${federationMarkup}
<div class="section-head"><h2>Selection check</h2></div><div class="panel checklist-static"><p>Before importing an activity, confirm that it:</p><ul><li>keeps nearly everyone active;</li><li>provides frequent ball contacts;</li><li>includes perception or a decision;</li><li>takes less than a minute to explain;</li><li>can be adapted without ability labels;</li><li>avoids elimination and long lines;</li><li>connects to the game the children play.</li></ul></div>`);
const filters=document.querySelector("#resource-filters");
if(filters)filters.onclick=e=>{const b=e.target.closest("button");if(!b)return;document.querySelectorAll("#resource-filters button").forEach(x=>x.classList.toggle("active",x===b));document.querySelectorAll("[data-country]").forEach(c=>c.hidden=b.dataset.filter!=="All"&&c.dataset.country!==b.dataset.filter);};}
function route(){const n=location.hash.slice(1);if(n==="rules")rules();if(n==="catalogue")catalogue();document.querySelectorAll("nav a").forEach(a=>a.classList.toggle("active",a.getAttribute("href")===`#${n}`));}
window.addEventListener("hashchange",()=>setTimeout(route,0));route();
})();
