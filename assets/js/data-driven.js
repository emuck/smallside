(() => {
  let activityData=[];
  const html=value=>String(value??"").replace(/[&<>"]/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[char]));
  const safeHttps=value=>{try{const url=new URL(value);return url.protocol==="https:"?url.href:"";}catch(_){return "";}};
  const safeDiagram=value=>typeof value==="string"&&/^assets\/diagrams\/[a-z0-9-]+\.svg$/.test(value)?value:"";
  const safeImage=value=>typeof value==="string"&&/^assets\/images\/[a-z0-9-]+\.(?:png|jpe?g|webp)$/i.test(value)?value:"";
  const label=value=>String(value??"").replaceAll("-"," ").replace(/\b\w/g,letter=>letter.toUpperCase());
  const showFailure=message=>{
    let notice=document.querySelector("#content-status");
    if(!notice){notice=document.createElement("div");notice.id="content-status";notice.className="callout";document.querySelector("#app").before(notice);}
    notice.textContent=message;
  };
  const adaptActivity=a=>{
    if(!a||!a.id||!a.title||!Array.isArray(a.skills)||!a.duration||!Array.isArray(a.instructions)||!a.adaptations)throw new Error("Invalid activity record");
    return {
      id:a.id,version:a.version,icon:a.icon||"Ball",name:a.title,skills:a.skills,phaseId:a.phase||"",moment:a.moment||"",allPhase:a.all_phase===true,playerCount:a.player_count||null,durationMax:a.duration.maximum,equipment:a.equipment||[],
      focus:a.skills.map(label).join(" · "),time:`${a.duration.minimum}–${a.duration.maximum} min`,
      phase:a.phase?label(a.phase):"Flexible",players:a.player_count?`${a.player_count.minimum}–${a.player_count.maximum} players`:"Adapt to attendance",
      story:a.story,setup:a.setup,run:a.instructions,coach:a.coach_lens,questions:a.questions||[],
      adaptations:a.adaptations,safety:a.safety||[],diagram:a.diagram,
      source:a.source,reviewStatus:a.review_status
    };
  };
  const list=items=>items?.length?`<ul>${items.map(item=>`<li>${html(item)}</li>`).join("")}</ul>`:"";
  const sourceBlock=activity=>{
    const source=activity.source||{};const url=safeHttps(source.url);
    const title=`${html(source.publisher||"Source")} — ${html(source.title||"Reference")}`;
    return `<div class="activity-source"><b>Source and adaptation</b><p>${url?`<a href="${html(url)}" target="_blank" rel="noopener noreferrer">${title}</a>`:title}<br><small>${html(source.adaptation_status||"")} · reviewed ${html(source.reviewed_at||"")} · ${html(activity.reviewStatus||"")}</small></p></div>`;
  };
  const richActivityCard=(activity,index=0)=>{
    const diagram=activity.diagram&&safeDiagram(activity.diagram.src);
    return `<details class="activity" ${index===0?"open":""}><summary><span class="icon">${html(activity.icon)}</span><div><b>${html(activity.name)}</b><div class="muted">${html(activity.focus)} · ${html(activity.time)}</div></div></summary><div class="activity-body"><div><div class="activity-facts"><span class="pill">${html(activity.phase)}</span><span class="pill">${html(activity.players)}</span></div><p><b>The game:</b> ${html(activity.story)}</p><p><b>Setup:</b> ${html(activity.setup)}</p><ol>${activity.run.map(item=>`<li>${html(item)}</li>`).join("")}</ol><p><b>Coach lens</b><br>${html(activity.coach)}</p>${activity.questions.length?`<p><b>Ask</b></p>${list(activity.questions)}`:""}</div><aside>${diagram?`<figure class="activity-diagram"><img src="${html(diagram)}" alt="${html(activity.diagram.alt)}" loading="lazy"></figure>`:""}<div class="adapt-grid"><div><b>Make it easier</b>${list(activity.adaptations.simplify)}</div><div><b>Add challenge</b>${list(activity.adaptations.challenge)}</div><div><b>Attendance</b>${list([...(activity.adaptations.low_attendance||[]),...(activity.adaptations.high_attendance||[])])}</div><div><b>Limited equipment</b>${list(activity.adaptations.limited_equipment)}</div></div>${activity.safety.length?`<div class="safety-note"><b>Safety</b>${list(activity.safety)}</div>`:""}${sourceBlock(activity)}</aside></div></details>`;
  };
  const timedSession=(template,versions)=>{
    let elapsed=0;
    const rows=template.activities.map(ref=>{
      const activity=versions.find(item=>item.id===ref.activity_id&&item.version===ref.activity_version);
      const start=elapsed;elapsed+=ref.minutes;
      const body=Array.isArray(ref.progression)?`<p class="muted">Same setup, one continuous practice — progress through it:</p><ol class="progression-stages">${ref.progression.map(stage=>`<li><b>${html(stage.minutes)} min</b> — ${html(stage.note)}</li>`).join("")}</ol>`:`<p>${html(ref.variation||"Play, observe and adapt.")}</p>`;
      const setupNote=ref.shares_setup_with_previous?`<p class="muted setup-continuity">↳ No new setup — ${html(ref.setup_note)}</p>`:"";
      const rowClass=ref.shares_setup_with_previous?"timeline-row timeline-row--continued":"timeline-row";
      return `<div class="${rowClass}"><strong>${start}–${elapsed}</strong><div>${setupNote}<b>${html(activity?.name||ref.activity_id)}</b>${body}</div><span class="pill">Play</span></div>`;
    });
    if(elapsed<template.duration_minutes)rows.push(`<div class="timeline-row"><strong>${elapsed}–${template.duration_minutes}</strong><div><b>Team huddle and transitions</b><p>Water, celebrate effort and ask what was fun.</p></div><span class="pill">Reflect</span></div>`);
    return `<div class="timeline">${rows.join("")}</div>`;
  };
  const warmupBlock=(warmup,progressionIds,isActiveWeek)=>{
    if(!warmup)return "";
    const selected=new Set(progressionIds||[]);
    const marker=isActiveWeek?"This week":"Default progression";
    return `<div class="section-head"><h2>Standing warm-up</h2></div><div class="panel warmup-panel"><p>${html(warmup.description)}</p><p class="muted"><b>Setup:</b> ${html(warmup.setup)}</p><ol class="warmup-progressions">${warmup.progressions.map(progression=>`<li class="${selected.has(progression.id)?"active":""}">${selected.has(progression.id)?`<span class="pill">${marker}</span> `:""}<b>${html(progression.title)}</b> — ${html(progression.note)}</li>`).join("")}</ol></div>`;
  };
  const renderSession=(template,allActivities,warmup,warmupProgression)=>{
    const chosen=[...new Map(template.activities.map(ref=>[`${ref.activity_id}@${ref.activity_version}`,allActivities.find(item=>item.id===ref.activity_id&&item.version===ref.activity_version)])).values()].filter(Boolean);
    return `${warmupBlock(warmup,warmupProgression?.progressionIds,warmupProgression?.isActiveWeek)}${fourCornersBlock(template.fourCorners)}${momentCoverage(template,allActivities)}<div class="two-col"><section><p class="lead">Outcome: ${html(template.outcome)}</p><div class="panel"><b>Equipment</b><p class="muted">${template.equipment.map(html).join(" · ")}</p></div></section><aside class="panel green"><div class="kicker muted">COACH CUES</div><h3>Use, then observe</h3><p>${template.coach_cues.map(cue=>`“${html(cue)}”`).join("<br>")}</p><p class="muted">Avoid a running commentary. Give them space to solve.</p></aside></div><div class="section-head"><div><div class="eyebrow">Session delivery</div><h2>Session schedule</h2></div><div class="button-row"><button class="button secondary" type="button" data-print-plan>Print plan</button><button class="button secondary" type="button" data-copy-html="${html(template.id)}">Copy for Docs/Word</button><button class="button secondary" type="button" data-download-html="${html(template.id)}">Download .html</button></div></div>${timedSession(template,allActivities)}<div class="section-head"><h2>Activity detail</h2></div>${chosen.map(richActivityCard).join("")}<div class="panel" style="margin-top:20px"><h3>After-session reflection — 3 minutes</h3><textarea class="notes" data-note="${html(template.id)}"></textarea><small class="muted">Saved on this device.</small></div>`;
  };
  window.SmallSideRenderSession=renderSession;
  const cornerOrder=["technical","physical","psychological","social"];
  const momentOrder=["in-possession","out-of-possession","transition"];
  const fourCornersBlock=fourCorners=>`<div class="section-head"><h2>Session outcomes</h2></div><ul class="four-corners-list">${cornerOrder.map(corner=>{const value=fourCorners?.[corner];return `<li><b>${html(label(corner))}:</b> ${value?html(value):'<span class="not-addressed">Not a focus in this session</span>'}</li>`;}).join("")}</ul>`;
  const momentCoverage=(template,versions)=>{
    const totals=Object.fromEntries(momentOrder.map(moment=>[moment,0]));
    let total=0;let excludedMinutes=0;
    template.activities.forEach(ref=>{
      const activity=versions.find(item=>item.id===ref.activity_id&&item.version===ref.activity_version);
      if(!activity)return;
      if(activity.allPhase||activity.moment==="none"){excludedMinutes+=ref.minutes;return;}
      if(!(activity.moment in totals))return;
      totals[activity.moment]+=ref.minutes;total+=ref.minutes;
    });
    if(!total&&!excludedMinutes)return "";
    const excludedNote=excludedMinutes?`<p class="muted moment-excluded">${excludedMinutes} min not counted in the percentages above (free play or no-ball activities).</p>`:"";
    if(!total)return `<div class="section-head"><h2>Moments of the game</h2></div>${excludedNote}`;
    return `<div class="section-head"><h2>Moments of the game</h2></div><div class="moment-coverage">${momentOrder.map(moment=>{const minutes=totals[moment];const pct=Math.round((minutes/total)*100);return minutes?`<div class="moment-segment" style="flex:${minutes}"><b>${pct}%</b> ${html(label(moment))}</div>`:"";}).join("")}</div>${excludedNote}`;
  };
  let selectedThemeFilter="";
  const filterApi=window.SmallSideActivityFilters;
  const filterStorageKey="smallside-activity-filters";
  const loadFilterState=()=>{try{return filterApi.normalize(JSON.parse(localStorage.getItem(filterStorageKey)||"{}"));}catch(_){return filterApi.empty();}};
  let activityFilterState=loadFilterState();
  const saveFilterState=()=>{try{localStorage.setItem(filterStorageKey,JSON.stringify(activityFilterState));}catch(_){}};
  const selected=(value,current)=>value===current?" selected":"";
  const seasonClock=timezone=>{const parts=Object.fromEntries(new Intl.DateTimeFormat("en-US",{timeZone:timezone,weekday:"long",year:"numeric",month:"2-digit",day:"2-digit"}).formatToParts(new Date()).filter(part=>part.type!=="literal").map(part=>[part.type,part.value]));return {date:parts.year+"-"+parts.month+"-"+parts.day,weekday:parts.weekday};};
  const activeCycleIndex=content=>{const today=seasonClock(content.season.timezone).date;const start=Date.parse(content.season.starts+"T12:00:00Z");const now=Date.parse(today+"T12:00:00Z");return Math.max(0,Math.min(content.curriculum.cycles.length-1,Math.floor((now-start)/604800000)));};
  const plannedSessionId=content=>{const cycle=content.curriculum.cycles[activeCycleIndex(content)];const day=seasonClock(content.season.timezone).weekday;const planned=(cycle?.sessions||[]).find(item=>item.day===day)||(cycle?.sessions||[])[0];return planned?.session_id||content.season.opening_session;};
  const warmupProgressionsForSession=(content,sessionId)=>{
    const activeCycle=content.curriculum.cycles[activeCycleIndex(content)];
    if(activeCycle&&(activeCycle.sessions||[]).some(item=>item.session_id===sessionId))return {progressionIds:activeCycle.warmup_progressions||[],isActiveWeek:true};
    const anyCycle=content.curriculum.cycles.find(cycle=>(cycle.sessions||[]).some(item=>item.session_id===sessionId));
    return {progressionIds:anyCycle?.warmup_progressions||[],isActiveWeek:false};
  };
  const optionList=(values,current)=>values.map(value=>`<option value="${html(value)}"${selected(value,current)}>${html(label(value))}</option>`).join("");
  const activityFilterForm=()=>`<form id="activity-filters" class="panel activity-filters" aria-label="Filter activities"><label class="filter-search">Search<input type="search" name="query" value="${html(activityFilterState.query)}" placeholder="Name or coaching idea" autocomplete="off"></label><label>Skill<select name="skill"><option value="">All skills</option>${optionList(filterApi.options(activityData,"skills"),activityFilterState.skill)}</select></label><label>Practice part<select name="phase"><option value="">Any practice part</option>${optionList(filterApi.options(activityData,"phaseId"),activityFilterState.phase)}</select></label><label>Players<input type="number" name="players" min="1" max="30" inputmode="numeric" value="${html(activityFilterState.players)}" placeholder="Any"></label><label>Maximum time<select name="maxDuration"><option value="">Any length</option>${[10,12,15,20,25].map(value=>`<option value="${value}"${selected(String(value),activityFilterState.maxDuration)}>${value} minutes</option>`).join("")}</select></label><label>Equipment<select name="equipment"><option value="">Any equipment</option>${optionList(filterApi.options(activityData,"equipment"),activityFilterState.equipment)}</select></label><label class="filter-check"><input type="checkbox" name="goalkeeper" ${activityFilterState.goalkeeper?"checked":""}> Goalkeeper involved</label><button class="button secondary" id="clear-activity-filters" type="button">Clear filters</button></form>`;
  const currentActivities=()=>filterApi.apply(activityData,activityFilterState);
  const activityResultsMarkup=items=>items.length?items.map(richActivityCard).join(""):`<div class="panel empty-state"><h3>No matching activities</h3><p>Remove a filter or increase the player count or duration.</p><button class="button secondary" type="button" id="clear-activity-filters">Clear filters</button></div>`;
  const renderActivityResults=()=>{const items=currentActivities();const count=document.querySelector("#activity-result-count");const list=document.querySelector("#activity-results");if(count)count.textContent=`${items.length} ${items.length===1?"activity":"activities"}`;if(list)list.innerHTML=activityResultsMarkup(items);};
  const stateFromForm=form=>{const data=new FormData(form);return filterApi.normalize({query:data.get("query"),skill:data.get("skill"),phase:data.get("phase"),players:data.get("players"),maxDuration:data.get("maxDuration"),equipment:data.get("equipment"),goalkeeper:data.has("goalkeeper")});};
  window.SmallSideContent.ready.then(content=>{
    const rejected=[];
    const allActivities=content.activities.flatMap(activity=>{try{return [adaptActivity(activity)];}catch(error){rejected.push(activity?.id||"unknown");console.error("Skipped invalid activity",activity,error);return [];}});
    if(!allActivities.length)throw new Error("No valid activities were loaded");
    activityData=[...allActivities.reduce((latest,item)=>{const current=latest.get(item.id);if(!current||item.version>current.version)latest.set(item.id,item);return latest;},new Map()).values()];
    const fallbackHome=home;const ageGroup=String(content.league.age_group||"").toLowerCase();const ageLabel=(ageGroup.charAt(0)==="u"&&Number.isInteger(Number(ageGroup.slice(1))))?"Under "+ageGroup.slice(1):"";const nickname=content.season.team?.nickname||"";const homeTitle=nickname?`Welcome to the ${nickname}!`:(ageGroup?ageGroup.toUpperCase()+" coaching runbook":"Coaching runbook");const homeEyebrow=(ageLabel?ageLabel+" · ":"")+"Coach runbook";const crest=content.season.team?.crest||{};const crestSrc=safeImage(crest.src);const crestMarkup=crestSrc?`<figure class="team-crest"><img src="${html(crestSrc)}" alt="${html(crest.alt||"Team crest")}" loading="eager"></figure>`:"";home=()=>fallbackHome().replace("Coaching runbook",homeTitle).replace("Coach runbook",homeEyebrow).replace('<div id="team-crest"></div>',crestMarkup);const seasonLabel=document.querySelector("#season-label");if(seasonLabel)seasonLabel.textContent=(ageGroup?ageGroup.toUpperCase()+" coaching companion":"Coaching companion");
    season=()=>layout("Season plan","Theme progression",`<p class="lead">Themes return in new games. Children need familiarity, repetition and freedom—not unrelated sessions. Open Sessions for the active week’s planned session.</p><div class="week-grid">${content.curriculum.cycles.map((cycle,i)=>`<div class="week ${i===activeCycleIndex(content)?"current":""}"><div class="week-no">Week ${cycle.week}</div><h3>${html(cycle.theme)}</h3><small>${html(cycle.focus)}</small>${(cycle.sessions||[]).map(item=>{const planned=content.sessions.find(session=>session.id===item.session_id);return "<a class='week-session' href='#sessions/"+encodeURIComponent(item.session_id)+"'>"+html(item.day)+" · "+html(planned?.title||item.session_id)+(item.variation?"<small class='week-variation'>"+html(item.variation)+"</small>":"")+"</a>";}).join("")}</div>`).join("")}</div><div class="two-col" style="margin-top:24px"><div class="panel"><h3>When to repeat an activity</h3><p>Repeat a game when children loved it, needed more time, or the behavior did not yet appear in free play. Change one variable.</p></div><div class="panel"><h3>When to move on</h3><p>Move forward when most players attempt the behavior independently in a game.</p></div></div>`);
    sessions=(param)=>{
      const requestedId=param?decodeURIComponent(param):"";
      const publishedSessions=content.sessions.filter(item=>item.status==="published");
      const defaultId=plannedSessionId(content)||publishedSessions[0]?.id;
      const visibleSessions=selectedThemeFilter?publishedSessions.filter(item=>item.theme===selectedThemeFilter):publishedSessions;
      const template=content.sessions.find(item=>item.id===requestedId)||visibleSessions.find(item=>item.id===defaultId)||visibleSessions[0];
      if(!template)return layout("No published sessions yet","Session plans",'<p class="lead">Sessions currently in draft aren\'t shown here until they\'re published. Open one directly by its share link if you have one.</p>');
      const themesPresent=[...new Set(publishedSessions.map(item=>item.theme))];
      const themeFilter=`<label class="theme-filter">Theme<select data-theme-filter aria-label="Filter sessions by theme"><option value="">All themes</option>${themesPresent.map(theme=>`<option value="${html(theme)}"${theme===selectedThemeFilter?" selected":""}>${html(label(theme))}</option>`).join("")}</select></label>`;
      const picker=`<div class="tabs session-tabs" aria-label="Session plans">${visibleSessions.map(item=>`<a href="#sessions/${encodeURIComponent(item.id)}" class="${item.id===template.id?"active":""}">${html(item.title)}</a>`).join("")}</div>`;
      return layout(html(template.title),"60-minute session plan",`${themeFilter}${picker}${renderSession(template,allActivities,content.warmup,warmupProgressionsForSession(content,template.id))}`);
    };
    activities=()=>{const items=currentActivities();return layout("Activity library","Activity library",`<p class="lead">Find a reviewed activity by skill, attendance, time or available equipment.</p>${activityFilterForm()}<div class="activity-results-head"><b id="activity-result-count" aria-live="polite">${items.length} ${items.length===1?"activity":"activities"}</b><span class="muted">Expand a card for setup, diagram and source.</span></div><div class="activity-list" id="activity-results">${activityResultsMarkup(items)}</div>`);};
    const coachBio=content.season.team?.coach_bio;
    if(coachBio&&typeof coachBio==="object"){
      const coachLink=document.querySelector('a[href="#coach"]');
      if(coachLink){coachLink.href="#about";coachLink.textContent="About Coach";}
      const photo=coachBio.photo||{};const photoSrc=safeImage(photo.src);
      const photoMarkup=photoSrc?`<figure class="coach-about-photo"><img src="${html(photoSrc)}" alt="${html(photo.alt||"Coach playing youth soccer")}" loading="eager"><figcaption>Every coach starts somewhere.</figcaption></figure>`:"";
      const bioCrest=safeImage(crest.src);const bioCrestMarkup=bioCrest?`<figure class="coach-about-crest"><img src="${html(bioCrest)}" alt="${html(crest.alt||"Team crest")}"></figure>`:"";
      const approachMarkup=`<section><h2>The observation and intervention cycle</h2><div class="timeline"><div class="timeline-row"><strong>See</strong><div><b>Observe before intervening</b><p>What are children actually doing—not what did the plan predict?</p></div></div><div class="timeline-row"><strong>Ask</strong><div><b>One short, useful question</b><p>Ask “Where is the space?” rather than explaining scanning at length.</p></div></div><div class="timeline-row"><strong>Try</strong><div><b>Let them test an answer</b><p>Learning needs attempts, mistakes and another go.</p></div></div><div class="timeline-row"><strong>Notice</strong><div><b>Identify the behavior</b><p>“You looked, then changed direction” is specific and repeatable.</p></div></div><div class="timeline-row"><strong>Play</strong><div><b>Keep play moving</b><p>Step in for safety or a quick, useful prompt. Otherwise coach an individual while the game continues or save it for the drinks break.</p></div></div></div></section><div class="section-head"><h2>Four areas of player development</h2></div><div class="card-grid"><div class="card"><h3>Technical / tactical</h3><p>Touches, movement, perception and decisions—not isolated “perfect technique”.</p></div><div class="card"><h3>Physical</h3><p>Agility, balance, coordination and varied movement through playful football.</p></div><div class="card"><h3>Social / psychological</h3><p>Belonging, courage, creativity, teamwork and handling the emotions of competition.</p></div></div>`;
      routes.about=()=>layout(html(coachBio.title||"About your coach"),"",`<div class="two-col coach-about"><section class="panel"><p class="lead">${html(coachBio.intro)}</p><h2>Day job</h2><p>${html(coachBio.day_job)}</p><h2>Soccer credentials</h2><p>${html(coachBio.soccer_credentials)}</p>${coachBio.club_experience?`<p class="coach-club-experience">${html(coachBio.club_experience)}</p>`:""}<div class="coach-plan"><h3>Philosophy</h3><p>${html(coachBio.plan)}</p><p>${html(coachBio.sign_off)}</p>${bioCrestMarkup}</div></section><aside>${photoMarkup}</aside></div><section class="coach-approach"><div class="eyebrow">Coaching approach</div>${approachMarkup}</section>`,"coach-about-page");
      routes.coach=routes.about;
    }
    const exportStyle="body{font-family:Arial,Helvetica,sans-serif;color:#16241c;line-height:1.5;max-width:820px;margin:24px auto;padding:0 16px}h1{font-size:30px}h2{font-size:20px;margin-top:26px;border-bottom:2px solid #16241c;padding-bottom:4px}h3{font-size:16px}.lead{color:#4b5a51}.panel,.card{border:1px solid #ccc;border-radius:8px;padding:12px;margin-bottom:12px}.two-col,.adapt-grid,.card-grid{display:block}.pill{display:inline-block;border:1px solid #999;border-radius:999px;padding:2px 8px;font-size:12px;margin-right:6px}.timeline-row{border-left:3px solid #999;padding:8px 12px;margin-bottom:8px}.four-corners-list{list-style:none;padding:0}.four-corners-list li{border:1px solid #ccc;border-radius:6px;padding:8px 12px;margin-bottom:6px}.moment-coverage{display:block;margin-bottom:16px}.moment-segment{border:1px solid #999;padding:8px;margin-bottom:4px}.warmup-progressions{padding-left:18px}.warmup-progressions li.active{font-weight:bold}.button-row,.tabs,.notes,textarea{display:none!important}";
    const exportDocument=template=>{
      const bodyHtml=renderSession(template,allActivities,content.warmup,warmupProgressionsForSession(content,template.id));
      return `<!doctype html><html><head><meta charset="utf-8"><title>${html(template.title)}</title><style>${exportStyle}</style></head><body><h1>${html(template.title)}</h1>${bodyHtml}</body></html>`;
    };
    const downloadSessionHtml=id=>{
      const template=content.sessions.find(item=>item.id===id);if(!template)return;
      const blob=new Blob([exportDocument(template)],{type:"text/html"});
      const url=URL.createObjectURL(blob);
      const link=document.createElement("a");link.href=url;link.download=`${template.id}.html`;
      document.body.appendChild(link);link.click();link.remove();
      URL.revokeObjectURL(url);
    };
    const copySessionHtml=async id=>{
      const template=content.sessions.find(item=>item.id===id);if(!template)return false;
      const doc=exportDocument(template);
      if(!navigator.clipboard?.write)return false;
      try{
        const container=document.createElement("div");container.innerHTML=doc;
        const plain=container.textContent||"";
        await navigator.clipboard.write([new ClipboardItem({"text/html":new Blob([doc],{type:"text/html"}),"text/plain":new Blob([plain],{type:"text/plain"})})]);
        return true;
      }catch(error){console.error("Copy session failed",error);return false;}
    };
    routes.home=home;routes.season=season;routes.sessions=sessions;routes.activities=activities;render();
    document.addEventListener("click",event=>{
      const clear=event.target.closest("#clear-activity-filters");
      if(clear){activityFilterState=filterApi.empty();try{localStorage.removeItem(filterStorageKey);}catch(_){}render();return;}
      const copyButton=event.target.closest("[data-copy-html]");
      if(copyButton){
        const original=copyButton.textContent;
        copySessionHtml(copyButton.dataset.copyHtml).then(ok=>{copyButton.textContent=ok?"Copied ✓":"Copy failed — use Download instead";setTimeout(()=>{copyButton.textContent=original;},2500);});
        return;
      }
      const downloadButton=event.target.closest("[data-download-html]");
      if(downloadButton){downloadSessionHtml(downloadButton.dataset.downloadHtml);return;}
    });
    document.addEventListener("input",event=>{
      const form=event.target.closest("#activity-filters");if(!form)return;
      activityFilterState=stateFromForm(form);saveFilterState();renderActivityResults();
    });
    document.addEventListener("change",event=>{
      const themeSelect=event.target.closest("[data-theme-filter]");if(!themeSelect)return;
      selectedThemeFilter=themeSelect.value;
      const publishedSessions=content.sessions.filter(item=>item.status==="published");
      const visible=selectedThemeFilter?publishedSessions.filter(item=>item.theme===selectedThemeFilter):publishedSessions;
      const defaultId=plannedSessionId(content)||publishedSessions[0]?.id;
      const next=visible.find(item=>item.id===defaultId)||visible[0];
      if(next)location.hash=`sessions/${encodeURIComponent(next.id)}`;
      render();
    });
    if(rejected.length)showFailure("Some season activities were invalid and have been omitted. Run the content validator before the next session.");
  }).catch(error=>{console.error("Season content unavailable",error);["season","sessions","activities","coach","about"].forEach(route=>{routes[route]=contentUnavailable;});render();});
})();
