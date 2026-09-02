(() => {
  window.SmallSideExtensionRoutes?.add("terminology");
  const nav=document.querySelector("#primary-nav"),rulesLink=nav.querySelector('a[href="#rules"]');
  rulesLink.insertAdjacentHTML("afterend",'<a href="#terminology">Terminology</a>');
  const page=(title,eyebrow,body)=>`<article class="page"><header class="hero"><div class="eyebrow">${eyebrow}</div><h1>${title}</h1></header>${body}</article>`;
  const clean=v=>String(v??"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
  const safeHttps=value=>{try{const url=new URL(value);return url.protocol==="https:"?url.href:"";}catch(_){return "";}};

  const universalFieldTerms=[
    ['Field / pitch','Field; pitch is equally correct football language.','The formal Laws call it the field of play. Use whichever word is most natural, then model both over time.'],
    ['Touchline','The long boundary line. Sideline is a common informal synonym.','Say "touchline" when teaching; children will still understand "sideline".'],
    ['Goal line','The short boundary line between the corners, behind the goal.','Avoid "end line" when you want the official word, though it is understandable in practice.'],
    ['Halfway line','The line across the middle of the field.','For young players, "middle line" is a perfectly good first instruction.'],
    ['Center mark / center circle','The spot and circle at the middle, if they are marked.','Small-sided fields may not have either marking. Do not invent a line that is not there.'],
    ['Goal area','The small area directly in front of a full-size goal, sometimes called the six-yard box.','Many small-sided fields do not mark a goal area.'],
    ['Goal / net','The goal is the frame and the scoring target; net is the mesh.','Use "goal" for the target and for scoring: "Can you score a goal?"']
  ];
  const roleTerms=[
    ['Goalkeeper / goalie','Goalkeeper is the formal term; goalie is a friendly shorthand.','Rotate the role. A goalkeeper is still a footballer who can pass, move, and help the team.'],
    ['Attacking / defending','Use these for the moment the team has or does not have the ball.','Say "we are attacking" or "we are defending" rather than assigning a child a permanent identity.'],
    ['Attacker / defender','A player helping with the attack or defense right now.','These are roles that can change in a second, especially in small-sided formats.'],
    ['Forward / striker','A player who starts or is playing nearer the other goal.','Useful words, but avoid fixing a young player as "the forward." Rotate starting places and invite everyone to attack.'],
    ['Fullback','A defender who usually plays wider or deeper in larger-sided football.','Not a necessary small-sided position. Use "help near our goal" or "can you get goal-side?" first.'],
    ['Midfielder','A position connecting defense and attack in larger-sided football.','On a small-sided field, think "middle space" rather than assigning a permanent midfielder.'],
    ['Wide / central','Locations: nearer a touchline or nearer the middle.','Great coaching words: "Can you find wide space?" and "Can you see the middle?"'],
    ['Teammate / opposition','Your own team and the other team.','"Friend" can be warmer for a first practice; gradually introduce teammate and opposition.']
  ];
  const rows=items=>items.map(item=>`<div class="rule-row"><b>${clean(item[0])}</b><span>${clean(item[1])}</span><small>${item[2]}</small></div>`).join("");

  async function terminology(){
    document.querySelector("#app").innerHTML=page("Football words","Coach language",'<p class="lead">Loading league-specific notes…</p>');
    let league=null,team=null;
    try{
      const content=await window.SmallSideContent.ready;
      league=content.league;team=content.season.team;
    }catch(error){console.error("League terminology context unavailable",error);}
    const leagueName=league?league.name:"your league";
    const format=league?.format;
    const playersLabel=format?`${format.players_per_side}v${format.players_per_side}`:"small-sided";
    const restartsNote=format?.restarts?`${clean(leagueName)}'s restart rule: ${clean(format.restarts)}`:`Check ${clean(leagueName)}'s restart rule before assuming corner kicks, goal kicks or throw-ins are used.`;
    const notUsedNote=format?.not_used?`${clean(leagueName)}'s baseline omits: ${clean(format.not_used)}. The field may not mark this line at all.`:`Confirm with ${clean(leagueName)} whether this line and its restart are used, and whether the field marks it.`;
    const fieldTerms=[
      ...universalFieldTerms.slice(0,5),
      ['Corner','One of the four field corners; the corner area is the marked arc on a full field.',restartsNote],
      universalFieldTerms[5],
      ['Penalty area','The larger marked area in front of a full-size goal, often called the box.',notUsedNote],
      universalFieldTerms[6],
      ['Restart','How play begins again after a stoppage or the ball leaves the field.',restartsNote]
    ];
    const localSource=(league?.sources||[]).find(s=>s.role==="controlling-local");
    const localSourceLine=localSource?`Confirm current details with <a href="${clean(safeHttps(localSource.url))}" target="_blank" rel="noreferrer">${clean(leagueName)}</a>.`:`Confirm current details with your league.`;
    const nickname=team?.nickname||team?.name||"your team";
    document.querySelector("#app").innerHTML=page("Football words","Coach language",`<p class="lead">Use clear words without turning the game into a vocabulary test. Name the real thing, pair it with a simple cue, and let the children play.</p><div class="callout"><b>For ${clean(nickname)}:</b> this is a ${clean(playersLabel)} ${clean(leagueName)} environment. The full-size Laws provide useful language, but only the markings and restarts used on the day apply.</div><div class="section-head"><h2>Field words</h2></div><div class="rule-table">${rows(fieldTerms)}</div><div class="section-head"><h2>Roles, not fixed positions</h2></div><div class="rule-table">${rows(roleTerms)}</div><div class="section-head"><h2>Simple cues that grow vocabulary</h2></div><div class="card-grid"><article class="card"><span class="number">01</span><h3>Find space</h3><p>"Can you find grass?" Then add: "Can you find space wide of the ball?"</p></article><article class="card"><span class="number">02</span><h3>Help the ball</h3><p>"Can you help your teammate?" Then add: "Can you give the ball a passing option?"</p></article><article class="card"><span class="number">03</span><h3>Protect the goal</h3><p>"Can you get between the ball and our goal?" Then add: "Can you get goal-side?"</p></article></div><div class="section-head"><h2>Source and local rules</h2></div><div class="panel"><p>The official names for touchlines, goal lines, the halfway line, goal area, penalty area, and corner area come from <a href="https://www.theifab.com/laws/latest/the-field-of-play/" target="_blank" rel="noreferrer">IFAB Law 1</a>. ${clean(leagueName)} rules control the local format and its restart exceptions; ${localSourceLine}</p></div>`);
  }
  function route(){const routeName=location.hash.slice(1);if(routeName==="terminology")terminology();document.querySelectorAll("nav a").forEach(link=>link.classList.toggle("active",link.getAttribute("href")===`#${routeName}`));}
  window.addEventListener("hashchange",()=>setTimeout(route,0));route();
})();
