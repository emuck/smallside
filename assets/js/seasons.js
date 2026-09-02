(() => {
  window.SmallSideExtensionRoutes?.add("seasons");
  const nav=document.querySelector("#primary-nav");
  const developmentLink=nav.querySelector('a[href="#development"]');
  const seasonsLink='<a href="#seasons">Seasons</a>';
  if(developmentLink)developmentLink.insertAdjacentHTML("beforebegin",seasonsLink);
  else nav.insertAdjacentHTML("beforeend",seasonsLink);

  const page=(t,l,c)=>`<article class="page"><header class="hero"><div class="eyebrow">${l}</div><h1>${t}</h1></header>${c}</article>`;
  const clean=v=>String(v??"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
  const overrideKey="smallside-selected-season";
  const statusLabel={active:"Active",archived:"Archived",test:"Test",unlabeled:"Unlabeled (missing status — treat as not live)"};

  const viewSeason=manifest=>{
    try{
      if(manifest)localStorage.setItem(overrideKey,manifest);
      else localStorage.removeItem(overrideKey);
    }catch(_){}
    location.reload();
  };

  const banner=async()=>{
    try{
      const content=await window.SmallSideContent.ready;
      const nonActive=content.season.status&&content.season.status!=="active";
      if(!content.usingNonDefaultSeason&&!nonActive)return;
      const label=statusLabel[content.season.status]||statusLabel.unlabeled;
      const el=document.createElement("div");
      el.className="callout season-banner";
      el.innerHTML=`<b>Viewing ${clean(label)} season:</b> ${clean(content.season.team?.nickname||content.season.id)} — this is not the live season. <button type="button" id="season-banner-reset" class="button ghost">Return to current season</button>`;
      document.body.prepend(el);
      document.querySelector("#season-banner-reset").onclick=()=>viewSeason("");
    }catch(_){}
  };
  banner();

  async function seasons(){
    document.querySelector("#app").innerHTML=page("Seasons","Switch and archive","<p class=\"lead\">Loading seasons…</p>");
    try{
      const content=await window.SmallSideContent.ready;
      let current="";
      try{current=localStorage.getItem(overrideKey)||content.defaultManifest;}catch(_){current=content.defaultManifest;}
      const res=await fetch("data/seasons/index.json",{cache:"no-store"});
      if(!res.ok)throw new Error("no season index");
      const index=await res.json();
      const manifests=index.seasons||[];
      const records=await Promise.all(manifests.map(async m=>{
        try{
          const data=await (await fetch(m,{cache:"no-store"})).json();
          return {manifest:m,data,status:statusLabel[data.status]?data.status:"unlabeled"};
        }catch(_){return {manifest:m,data:null,status:"unlabeled"};}
      }));
      const groups=["active","test","archived","unlabeled"].map(status=>({
        status,
        items:records.filter(r=>r.data&&r.status===status)
      })).filter(g=>g.items.length);
      const card=r=>{
        const isCurrent=r.manifest===current;
        return `<article class="card catalogue-card">
          <div class="eyebrow">${clean(statusLabel[r.status])}</div>
          <h3>${clean(r.data.team?.nickname||r.data.team?.name||r.data.id)}</h3>
          <p>${clean(r.data.team?.name||"")}${r.data.starts?` · ${clean(r.data.starts)}–${clean(r.data.ends)}`:""}</p>
          ${isCurrent?`<span class="pill">Currently viewing</span>`:`<button type="button" class="button secondary" data-manifest="${clean(r.manifest)}">View this season</button>`}
        </article>`;
      };
      const resetVisible=current!==content.defaultManifest;
      document.querySelector("#app").innerHTML=page("Seasons","Switch and archive",`
        <p class="lead">Every season configured for this deployment. Switching only changes what this browser shows you — it never edits data or affects the public site.</p>
        ${resetVisible?`<div class="callout">You're viewing a non-default season. <button type="button" id="seasons-reset" class="button ghost">Return to current season</button></div>`:""}
        ${groups.map(g=>`<div class="section-head"><h2>${clean(statusLabel[g.status])}</h2></div><div class="catalogue-grid">${g.items.map(card).join("")}</div>`).join("")}
      `);
      document.querySelectorAll("[data-manifest]").forEach(btn=>btn.onclick=()=>viewSeason(btn.dataset.manifest));
      const resetBtn=document.querySelector("#seasons-reset");
      if(resetBtn)resetBtn.onclick=()=>viewSeason("");
    }catch(error){
      console.error("Season list unavailable",error);
      document.querySelector("#app").innerHTML=page("Seasons unavailable","Local/LAN only",'<div class="callout">Season switching needs <code>data/seasons/index.json</code>, which is only present on the local or LAN deployment — it is intentionally excluded from the public site.</div>');
    }
  }
  function route(){const n=location.hash.slice(1);if(n==="seasons")seasons();document.querySelectorAll("nav a").forEach(a=>a.classList.toggle("active",a.getAttribute("href")===`#${n}`));}
  window.addEventListener("hashchange",()=>setTimeout(route,0));route();
})();
