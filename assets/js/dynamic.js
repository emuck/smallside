/* Calendar and reflection extension. */
(() => {
  ["calendar","reflect"].forEach(route=>window.SmallSideExtensionRoutes?.add(route));
  const nav=document.querySelector("#primary-nav");
  nav.querySelector('a[href="#season"]').insertAdjacentHTML("beforebegin",'<a href="#calendar">Calendar</a>');
  nav.querySelector('a[href="#activities"]').insertAdjacentHTML("beforebegin",'<a href="#reflect">Reflect</a>');
  const page=(t,e,b)=>`<article class="page"><header class="hero"><div class="eyebrow">${e}</div><h1>${t}</h1></header>${b}</article>`;
  const clean=v=>String(v??"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
  const dateLabel=value=>new Intl.DateTimeFormat("en-US",{month:"long",day:"numeric",year:"numeric",timeZone:"UTC"}).format(new Date(value+"T12:00:00Z"));
  const timeLabel=value=>new Intl.DateTimeFormat("en-US",{hour:"numeric",minute:"2-digit",timeZone:"UTC"}).format(new Date("2000-01-01T"+value+":00Z"));
  const exceptionTypeLabel={cancelled:"Cancelled",time_change:"Time change",location_change:"Location change"};
  async function showCalendar(){
    document.querySelector("#app").innerHTML=page("Team schedule","Practices and games",'<div id="team-schedule" class="panel">Loading team schedule...</div><div class="section-head"><h2>Games</h2></div><p class="lead">Game days, times and locations for the season.</p><div id="schedule" class="activity-list"><div class="panel">Loading schedule...</div></div>');
    const teamHost=document.querySelector("#team-schedule");
    const host=document.querySelector("#schedule");
    try{
      const content=await window.SmallSideContent.ready;
      const data={team:content.season.team.name,coach:content.season.team.coach,practices:content.practicePattern.recurrence};
      const crest=content.season.team?.crest||{};const crestSrc=typeof crest.src==="string"&&/^assets\/images\/[a-z0-9-]+\.(?:png|jpe?g|webp)$/i.test(crest.src)?crest.src:"";const crestMarkup=crestSrc?`<figure class="calendar-team-crest"><img src="${clean(crestSrc)}" alt="${clean(crest.alt||"Team crest")}"></figure>`:"";
      const today=new Date().toISOString().slice(0,10);
      const exceptions=(content.practicePattern.exceptions||[]).filter(item=>item.date>=today).sort((a,b)=>a.date.localeCompare(b.date));
      const exceptionsMarkup=exceptions.length?`<div class="callout" style="margin-top:14px"><b>Practice changes</b><ul>${exceptions.map(item=>`<li>${dateLabel(item.date)}${item.type&&exceptionTypeLabel[item.type]?` — ${clean(exceptionTypeLabel[item.type])}`:""}: ${clean(item.note)}</li>`).join("")}</ul></div>`:"";
      teamHost.innerHTML=`<div class="calendar-team-summary"><div><div class="eyebrow">${clean(data.team)}</div><h2>${clean(data.coach)}</h2><p><b>Season:</b> ${dateLabel(content.season.starts)}-${dateLabel(content.season.ends)}</p><p><b>Practices:</b> ${data.practices.map(p=>`${clean(p.weekday)} ${timeLabel(p.starts_at)}-${timeLabel(p.ends_at)}`).join(" and ")}</p><small class="muted">All times Pacific.</small></div>${crestMarkup}</div>${exceptionsMarkup}`;
      teamHost.insertAdjacentHTML("afterend",`<details class="panel" id="add-exception-panel" style="margin-top:14px"><summary>Add a schedule change</summary>
<p class="muted">Generates an updated <code>practice-pattern.json</code> to save and redeploy — this page cannot write to the repository itself.</p>
<form id="exception-form"><label>Date<input name="date" type="date" required></label><label>Type<select name="type"><option value="cancelled">Cancelled</option><option value="time_change">Time change</option><option value="location_change">Location change</option></select></label><label class="wide">Note<input name="note" type="text" placeholder="e.g. Moved to the small gym, 5:30-6:15pm" required></label><div class="wide"><button class="button" type="submit">Generate updated practice-pattern.json</button></div></form>
<div id="exception-output" hidden><pre id="exception-json" style="white-space:pre-wrap;word-break:break-word;background:#0f1a14;color:#d8f0e0;padding:14px;border-radius:10px;max-height:260px;overflow:auto;font-size:13px"></pre><p class="muted">Save this over <code id="exception-target-path"></code> and redeploy.</p></div></details>`);
      const exceptionForm=document.querySelector("#exception-form");
      exceptionForm.onsubmit=event=>{
        event.preventDefault();
        const f=new FormData(exceptionForm);
        const updated={...content.practicePattern,exceptions:[...(content.practicePattern.exceptions||[]),{date:f.get("date"),type:f.get("type"),note:f.get("note")}].sort((a,b)=>a.date.localeCompare(b.date))};
        const json=JSON.stringify(updated,null,2)+"\n";
        document.querySelector("#exception-json").textContent=json;
        document.querySelector("#exception-target-path").textContent=`data/seasons/${content.season.id}/practice-pattern.json`;
        document.querySelector("#exception-output").hidden=false;
      };
    }catch(error){console.error("Team schedule unavailable",error);teamHost.innerHTML='<div class="callout">Team practice schedule unavailable.</div>';}
    try{const content=await window.SmallSideContent.ready;const data=content.games;host.innerHTML=data.events.map(e=>`<article class="panel match"><div><span class="pill">${clean(e.home_away)}</span><h3>vs. ${clean(e.opponent)}</h3><p class="muted">${clean(e.location)}</p></div><div><b>${clean(e.date_label)}</b><div>${clean(e.game_time_label||e.kickoff_label||"")}</div>${e.arrival_label?`<small class="muted">Arrive ${clean(e.arrival_label)}</small>`:""}</div></article>`).join("")+`<p class="schedule-status muted"><b>Snapshot last refreshed:</b> ${new Date(data.synced_at).toLocaleString()} · ${data.events.length} matches</p>`;}catch(_){host.innerHTML='<div class="callout">Schedule unavailable. Check back soon.</div>';}
  }
  function showReflect(){
    const focuses=["moving with the ball","1v1 attacking","protecting the ball","finding space","finishing","winning it back","playing with others","confidence / belonging"];
    document.querySelector("#app").innerHTML=page("Practice and game reflection","Feedback form",`<p class="lead">Record what happened so upcoming sessions can be adjusted using evidence from practices and games.</p><form id="reflection-form" class="panel reflection-form"><label>Event type<select name="event_type"><option>practice</option><option>game</option></select></label><label>Date<input name="date" type="date" required></label><label class="wide">What went well or did the players enjoy?<textarea name="joy" placeholder="A short summary is enough." required></textarea></label><label class="wide">What happened today?<textarea name="independent_behaviour" placeholder="Include games, player choices, and team moments." required></textarea></label><fieldset class="wide"><legend>Areas needing more practice</legend><div class="check-row">${focuses.map(x=>`<label><input type="checkbox" name="focus" value="${x}"> ${x}</label>`).join("")}</div></fieldset><label>Engagement<select name="engagement"><option value="3">High</option><option value="2">Mixed</option><option value="1">Low</option></select></label><label>Challenge<select name="challenge"><option>about right</option><option>too easy</option><option>too hard</option><option>varied by player</option></select></label><label class="wide">Context for the next plan<textarea name="context" placeholder="Numbers, space, weather or equipment - not medical details"></textarea></label><div class="wide"><button class="button" type="submit">Download private reflection</button> <span id="reflect-status" class="muted"></span></div></form><div class="panel" style="margin-top:18px"><h3>Save this reflection</h3><p class="muted">This static version downloads a private JSON record. Move it into <code>data/reflections/inbox/</code>, or send it to Codex here, so it can be reviewed with the session plans.</p></div>`);
    const form=document.querySelector("#reflection-form");form.elements.date.value=new Date().toISOString().slice(0,10);
    form.onsubmit=async event=>{event.preventDefault();const f=new FormData(form);let seasonId="";try{seasonId=(await window.SmallSideContent.ready).season.id||"";}catch(_){}const result={schema_version:1,season_id:seasonId,event_type:f.get("event_type"),date:f.get("date"),joy:f.get("joy"),independent_behaviour:f.get("independent_behaviour"),focus:f.getAll("focus"),engagement:Number(f.get("engagement")),challenge:f.get("challenge"),context:f.get("context"),created_at:new Date().toISOString()};const blob=new Blob([JSON.stringify(result,null,2)+"\n"],{type:"application/json"});const link=document.createElement("a");link.href=URL.createObjectURL(blob);link.download=`${result.date}-${result.event_type}-reflection.json`;link.click();URL.revokeObjectURL(link.href);document.querySelector("#reflect-status").textContent="Downloaded. Move it to data/reflections/inbox, or send it to Codex here.";};
  }
  function routeExtension(){const route=location.hash.slice(1);if(route==="calendar")showCalendar();if(route==="reflect")showReflect();document.querySelectorAll("nav a").forEach(a=>a.classList.toggle("active",a.getAttribute("href")===`#${route}`));}
  window.addEventListener("hashchange",()=>setTimeout(routeExtension,0));routeExtension();
})();
