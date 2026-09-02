import {readFile} from "node:fs/promises";
import {resolve,relative,sep} from "node:path";

const projectRoot=process.cwd();
const dataRoot=resolve(projectRoot,"data");
const json=async path=>JSON.parse(await readFile(path,"utf8"));
const dataPath=value=>{
  if(typeof value!=="string"||!value.startsWith("data/")||value.includes("\0"))throw new Error(`unsafe data path: ${value}`);
  const target=resolve(projectRoot,value);
  const rel=relative(dataRoot,target);
  if(rel.startsWith(".."+sep)||rel==="..")throw new Error(`path leaves data directory: ${value}`);
  return target;
};
const readData=value=>json(dataPath(value));
const requireFields=(record,fields,label)=>{for(const field of fields)if(record?.[field]===undefined)throw new Error(`${label}: missing ${field}`);};
const requireSchema=async(path,record,label)=>{const schema=await json(path);requireFields(record,schema.required||[],label);};
const nonEmptyArray=(value,label)=>{if(!Array.isArray(value)||!value.length)throw new Error(`${label}: expected a non-empty array`);};
const finite=(value,label)=>{if(!Number.isFinite(value))throw new Error(`${label}: expected a number`);};
const validDate=(value,label)=>{const time=Date.parse(value+"T00:00:00Z");if(!/^\d{4}-\d{2}-\d{2}$/.test(value)||Number.isNaN(time))throw new Error(`${label}: invalid date`);return time;};

const activityVocabulary=await readData("data/vocabularies/activity.json");
const vocabularySet=name=>new Set(activityVocabulary[name]||[]);
const requireControlled=(values,allowed,label)=>{
  nonEmptyArray(values,label);
  if(new Set(values).size!==values.length)throw new Error(`${label}: duplicate value`);
  for(const value of values)if(!allowed.has(value))throw new Error(`${label}: unsupported value ${value}`);
};
const requireRange=(value,label)=>{
  requireFields(value,["minimum","recommended","maximum"],label);
  for(const field of ["minimum","recommended","maximum"]){finite(value[field],`${label}.${field}`);if(value[field]<1)throw new Error(`${label}.${field}: must be positive`);}
  if(!(value.minimum<=value.recommended&&value.recommended<=value.maximum))throw new Error(`${label}: must be minimum <= recommended <= maximum`);
};
const allowedStates=new Set(["draft","source-checked","field-tested","approved","retired"]);
const allowedSessionStatuses=new Set(["draft","published"]);
const allowedSeasonStatuses=new Set(["active","archived","test"]);
const exceptionTypes=new Set(["cancelled","time_change","location_change"]);
const fourCornersFields=["technical","physical","psychological","social"];
const placeholderMarker="NEEDS_COACH_INPUT";
const rejectPlaceholder=(value,label)=>{if(typeof value==="string"&&value.includes(placeholderMarker))throw new Error(`${label}: still has a backfill placeholder — needs real coaching input`);};

const validateSeason=async manifestPath=>{
  const season=await readData(manifestPath);
  await requireSchema("data/schemas/season.schema.json",season,`season ${manifestPath}`);
  const starts=validDate(season.starts,`${season.id} starts`);
  const ends=validDate(season.ends,`${season.id} ends`);
  if(starts>ends)throw new Error(`${season.id}: starts after it ends`);
  if(season.status!==undefined&&!allowedSeasonStatuses.has(season.status))throw new Error(`${season.id}: invalid status ${season.status}`);

  const [league,curriculum,pattern,games,activityIndex,sessionIndex,warmup]=await Promise.all([
    readData(season.league_profile),readData(season.curriculum),readData(season.practice_pattern),readData(season.games),readData(season.activity_index),readData(season.session_index),readData(season.warmup)
  ]);
  await requireSchema("data/schemas/warmup.schema.json",warmup,`${season.id} warmup`);
  const warmupProgressionIds=new Set();
  for(const progression of warmup.progressions){
    requireFields(progression,["id","title","note"],`${season.id} warmup progression`);
    if(warmupProgressionIds.has(progression.id))throw new Error(`${season.id}: duplicate warmup progression id ${progression.id}`);
    warmupProgressionIds.add(progression.id);
  }
  await requireSchema("data/schemas/league-profile.schema.json",league,`${season.id} league profile`);
  if(league.affiliated_organizations!==undefined){
    nonEmptyArray(league.affiliated_organizations,`${season.id} league profile affiliated_organizations`);
    for(const org of league.affiliated_organizations){
      requireFields(org,["name","url"],`${season.id} league profile affiliated organization`);
      if(!org.name.trim())throw new Error(`${season.id}: league profile affiliated organization has an empty name`);
      if(!/^https:\/\//.test(org.url))throw new Error(`${season.id}: league profile affiliated organization ${org.name} url must use HTTPS`);
    }
  }
  requireFields(pattern,["timezone","starts","ends","recurrence","exceptions"],`${season.id} practice pattern`);
  for(const exception of pattern.exceptions){
    requireFields(exception,["date","note"],`${season.id} practice exception`);
    validDate(exception.date,`${season.id} practice exception date`);
    if(!exception.note.trim())throw new Error(`${season.id}: practice exception has an empty note`);
    if(exception.type!==undefined&&!exceptionTypes.has(exception.type))throw new Error(`${season.id}: practice exception has invalid type ${exception.type}`);
  }
  requireFields(games,["events"],`${season.id} games`);
  nonEmptyArray(activityIndex.activities,`${season.id} activity index`);
  nonEmptyArray(sessionIndex.sessions,`${season.id} session index`);

  const activities=await Promise.all(activityIndex.activities.map(readData));
  const activityKeys=new Set();
  for(const activity of activities){
    await requireSchema("data/schemas/activity.schema.json",activity,`${season.id} activity ${activity.id||"unknown"}`);
    const idMatch=typeof activity.id==="string"?activity.id.match(/^[a-z0-9]+(?:-[a-z0-9]+)*/):null;if(!idMatch||idMatch[0]!==activity.id)throw new Error(`${season.id}: invalid activity id ${activity.id}`);
    const key=String(activity.id)+"@"+String(activity.version);
    if(activityKeys.has(key))throw new Error(`${season.id}: duplicate activity version ${key}`);
    activityKeys.add(key);
    if(!Number.isInteger(activity.version)||activity.version<1)throw new Error(`${season.id}: ${key} invalid version`);
    nonEmptyArray(activity.skills,`${season.id} ${key} skills`);
    nonEmptyArray(activity.instructions,`${season.id} ${key} instructions`);
    requireFields(activity.duration,["minimum","recommended","maximum"],`${season.id} ${key} duration`);
    for(const field of ["minimum","recommended","maximum"])finite(activity.duration[field],`${season.id} ${key} duration.${field}`);
    if(!(activity.duration.minimum<=activity.duration.recommended&&activity.duration.recommended<=activity.duration.maximum))throw new Error(`${season.id}: ${key} duration must be minimum <= recommended <= maximum`);
    requireFields(activity.adaptations,["simplify","challenge"],`${season.id} ${key} adaptations`);
    if(!allowedStates.has(activity.review_status))throw new Error(`${season.id}: ${key} invalid review_status`);
    if(activity.contract_version!==undefined){
      if(!vocabularySet("contract_versions").has(activity.contract_version))throw new Error(`${season.id}: ${key} unsupported contract_version`);
      requireFields(activity,["age_bands","phase","player_count","equipment","decisions","questions","participation","setup_complexity","safety"],`${season.id} ${key}`);
      requireControlled(activity.age_bands,vocabularySet("age_bands"),`${season.id} ${key} age_bands`);
      requireControlled(activity.skills,vocabularySet("skills"),`${season.id} ${key} skills`);
      requireControlled(activity.equipment,vocabularySet("equipment"),`${season.id} ${key} equipment`);
      requireControlled(activity.decisions,vocabularySet("decisions"),`${season.id} ${key} decisions`);
      if(!vocabularySet("phases").has(activity.phase))throw new Error(`${season.id}: ${key} unsupported phase ${activity.phase}`);
      if(!vocabularySet("setup_complexities").has(activity.setup_complexity))throw new Error(`${season.id}: ${key} unsupported setup_complexity ${activity.setup_complexity}`);
      requireRange(activity.player_count,`${season.id} ${key} player_count`);
      nonEmptyArray(activity.questions,`${season.id} ${key} questions`);
      nonEmptyArray(activity.safety,`${season.id} ${key} safety`);
      requireFields(activity.participation,["active_players","elimination","queues"],`${season.id} ${key} participation`);
      if(!vocabularySet("participation_levels").has(activity.participation.active_players))throw new Error(`${season.id}: ${key} unsupported active_players`);
      if(activity.participation.elimination!==false)throw new Error(`${season.id}: ${key} elimination must be false`);
      if(!vocabularySet("queue_levels").has(activity.participation.queues))throw new Error(`${season.id}: ${key} unsupported queues`);
      requireFields(activity.adaptations,["simplify","challenge","low_attendance","high_attendance","limited_equipment"],`${season.id} ${key} adaptations`);
      for(const field of ["simplify","challenge","low_attendance","high_attendance","limited_equipment"])nonEmptyArray(activity.adaptations[field],`${season.id} ${key} adaptations.${field}`);
      if(activity.diagram!==undefined){
        requireFields(activity.diagram,["src","alt"],`${season.id} ${key} diagram`);
        if(typeof activity.diagram.src!=="string"||!activity.diagram.src.startsWith("assets/diagrams/")||activity.diagram.src.includes(".."))throw new Error(`${season.id}: ${key} unsafe diagram path`);
        if(typeof activity.diagram.alt!=="string"||!activity.diagram.alt.trim())throw new Error(`${season.id}: ${key} empty diagram alt`);
        try{await readFile(resolve(projectRoot,activity.diagram.src));}catch(_){throw new Error(`${season.id}: ${key} diagram file not found`);}
      }
    }
    if(activity.all_phase!==undefined&&activity.all_phase!==true)throw new Error(`${season.id}: ${key} all_phase must be true when present`);
    if(activity.all_phase===true){
      if(activity.moment!==undefined)throw new Error(`${season.id}: ${key} cannot set both all_phase and moment — moment describes a single primary focus that doesn't apply here`);
    }else{
      if(activity.moment===undefined)throw new Error(`${season.id}: ${key} missing moment (required unless all_phase is true)`);
      if(!vocabularySet("moments").has(activity.moment))throw new Error(`${season.id}: ${key} unsupported moment ${activity.moment}`);
    }
    requireFields(activity.source,["type","title","publisher","url","reviewed_at","rights_status","adaptation_status","reviewer_notes"],`${season.id} ${key} source`);
    validDate(activity.source.reviewed_at,`${season.id} ${key} source.reviewed_at`);
    if(!/^https:\/\//.test(activity.source.url))throw new Error(`${season.id}: ${key} source URL must use HTTPS`);
  }

  const sessions=await Promise.all(sessionIndex.sessions.map(readData));
  const sessionIds=new Set();
  for(const session of sessions){
    await requireSchema("data/schemas/session.schema.json",session,`${season.id} session ${session.id||"unknown"}`);
    if(sessionIds.has(session.id))throw new Error(`${season.id}: duplicate session id ${session.id}`);
    sessionIds.add(session.id);
    if(!allowedSessionStatuses.has(session.status))throw new Error(`${season.id}: ${session.id} invalid status ${session.status}`);
    const published=session.status==="published";
    nonEmptyArray(session.equipment,`${season.id} ${session.id} equipment`);
    nonEmptyArray(session.coach_cues,`${season.id} ${session.id} coach_cues`);
    nonEmptyArray(session.activities,`${season.id} ${session.id} activities`);
    if(published){
      if(!vocabularySet("themes").has(session.theme))throw new Error(`${season.id}: ${session.id} unsupported theme ${session.theme}`);
      requireFields(session.fourCorners||{},fourCornersFields,`${season.id} ${session.id} fourCorners`);
      for(const corner of fourCornersFields){
        const value=session.fourCorners[corner];
        if(value===null)continue;
        if(typeof value!=="string"||!value.trim())throw new Error(`${season.id}: ${session.id} fourCorners.${corner} must be a non-empty string or null`);
        rejectPlaceholder(value,`${season.id} ${session.id} fourCorners.${corner}`);
      }
    }
    finite(session.duration_minutes,`${season.id} ${session.id} duration_minutes`);
    if(!Number.isInteger(session.duration_minutes)||session.duration_minutes<15)throw new Error(`${season.id}: ${session.id} duration_minutes must be an integer of at least 15`);
    let activityMinutes=0;
    session.activities.forEach((ref,index)=>{
      requireFields(ref,["activity_id","activity_version","minutes"],`${season.id} ${session.id} activity reference`);
      if(!activityKeys.has(`${ref.activity_id}@${ref.activity_version}`))throw new Error(`${season.id}: ${session.id} unknown activity version ${ref.activity_id}@${ref.activity_version}`);
      finite(ref.minutes,`${season.id} ${session.id} activity minutes`);
      if(ref.minutes<=0)throw new Error(`${season.id}: ${session.id} activity minutes must be positive`);
      if(ref.progression!==undefined){
        nonEmptyArray(ref.progression,`${season.id} ${session.id} ${ref.activity_id} progression`);
        let stageMinutes=0;
        for(const stage of ref.progression){
          requireFields(stage,["minutes","note"],`${season.id} ${session.id} ${ref.activity_id} progression stage`);
          finite(stage.minutes,`${season.id} ${session.id} ${ref.activity_id} progression stage minutes`);
          if(stage.minutes<=0)throw new Error(`${season.id}: ${session.id} progression stage minutes must be positive`);
          if(!stage.note.trim())throw new Error(`${season.id}: ${session.id} progression stage note must not be empty`);
          stageMinutes+=stage.minutes;
        }
        if(stageMinutes!==ref.minutes)throw new Error(`${season.id}: ${session.id} ${ref.activity_id} progression stage minutes must sum to ${ref.minutes}`);
      }
      if(ref.shares_setup_with_previous){
        if(index===0)throw new Error(`${season.id}: ${session.id} ${ref.activity_id} cannot share setup with previous — it is the first activity`);
        if(typeof ref.setup_note!=="string"||!ref.setup_note.trim())throw new Error(`${season.id}: ${session.id} ${ref.activity_id} shares_setup_with_previous requires a non-empty setup_note`);
      }
      activityMinutes+=ref.minutes;
    });
    if(activityMinutes>session.duration_minutes||session.duration_minutes-activityMinutes>10)throw new Error(`${season.id}: ${session.id} activity minutes must fit session duration with at most 10 minutes for transitions/reflection`);
  }
  nonEmptyArray(curriculum.cycles,`${season.id} curriculum cycles`);
  const curriculumWeeks=new Set();
  for(const cycle of curriculum.cycles){
    if(!Number.isInteger(cycle.week)||cycle.week<1)throw new Error(`${season.id}: invalid curriculum week`);
    if(curriculumWeeks.has(cycle.week))throw new Error(`${season.id}: duplicate curriculum week ${cycle.week}`);
    nonEmptyArray(cycle.warmup_progressions,`${season.id} week ${cycle.week} warmup_progressions`);
    for(const progressionId of cycle.warmup_progressions){
      if(!warmupProgressionIds.has(progressionId))throw new Error(`${season.id}: week ${cycle.week} unknown warmup progression ${progressionId}`);
    }
    curriculumWeeks.add(cycle.week);
    for(const item of cycle.sessions||[])if(!sessionIds.has(item.session_id))throw new Error(`${season.id}: week ${cycle.week} unknown session ${item.session_id}`);
  }
  if(season.opening_session&&!sessionIds.has(season.opening_session))throw new Error(`${season.id}: unknown opening session ${season.opening_session}`);

  return {season,activityCount:activities.length,sessionCount:sessions.length,cycleCount:curriculum.cycles.length,gameCount:games.events.length};
};

const current=await readData("data/current-season.json");
requireFields(current,["manifest"],"current season");

let seasonIndexManifests=[];
try{
  const seasonIndex=await readData("data/seasons/index.json");
  seasonIndexManifests=seasonIndex.seasons||[];
}catch(_){
  // No seasons index yet; validate only the active season.
}
const manifestPaths=[...new Set([current.manifest,...seasonIndexManifests])];

const results=[];
for(const manifestPath of manifestPaths)results.push(await validateSeason(manifestPath));

const active=results[manifestPaths.indexOf(current.manifest)];
if(active.season.status!==undefined&&active.season.status!=="active")throw new Error(`current-season.json points at ${active.season.id}, whose status is ${active.season.status}, not active`);
const otherActive=results.filter((r,i)=>manifestPaths[i]!==current.manifest&&r.season.status==="active");
if(otherActive.length)throw new Error(`more than one season is marked active: ${active.season.id}, ${otherActive.map(r=>r.season.id).join(", ")}`);

for(const result of results){
  console.log(`Validated ${result.season.id}${result.season.status?` (${result.season.status})`:""}: ${result.activityCount} activity versions, ${result.sessionCount} sessions, ${result.cycleCount} cycles, ${result.gameCount} games.`);
}

const resources=await readData("data/library/resources.json");
nonEmptyArray(resources.resources,"library resources");
for(const resource of resources.resources){
  requireFields(resource,["country","title","age","type","url","use"],"library resource");
  for(const field of ["country","title","age","type","use"])if(!String(resource[field]).trim())throw new Error(`library resource ${resource.title||"unknown"}: empty ${field}`);
  if(!/^https:\/\//.test(resource.url))throw new Error(`library resource ${resource.title}: url must use HTTPS`);
}
console.log(`Validated ${resources.resources.length} federation resources.`);
