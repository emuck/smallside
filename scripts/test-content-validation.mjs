import {cp,mkdtemp,readFile,rm,writeFile} from "node:fs/promises";
import {spawnSync} from "node:child_process";
import {tmpdir} from "node:os";
import {join,resolve} from "node:path";

const validator=resolve("scripts/validate-content.mjs");
const sourceData=resolve("data");
const mutateJson=async(path,mutate)=>{const value=JSON.parse(await readFile(path,"utf8"));mutate(value);await writeFile(path,JSON.stringify(value,null,2)+"\n");};
const run=async(name,mutate,shouldPass=false)=>{
  const root=await mkdtemp(join(tmpdir(),"smallside-validation-"));
  try{
    await cp(sourceData,join(root,"data"),{recursive:true});
    await cp(resolve("assets/diagrams"),join(root,"assets/diagrams"),{recursive:true});
    if(mutate)await mutate(root);
    const result=spawnSync(process.execPath,[validator],{cwd:root,encoding:"utf8"});
    if((result.status===0)!==shouldPass)throw new Error(`${name}: expected ${shouldPass?"pass":"failure"}\n${result.stdout}${result.stderr}`);
    console.log(`ok - ${name}`);
  }finally{await rm(root,{recursive:true,force:true});}
};

const activity=root=>join(root,"data/library/activities/treasure-island/v2.json");
await run("valid active season",null,true);
await run("missing duration fields",root=>mutateJson(activity(root),value=>{value.duration={};}));
await run("invalid review state",root=>mutateJson(activity(root),value=>{value.review_status="aproved";}));
await run("invalid controlled skill",root=>mutateJson(activity(root),value=>{value.contract_version=2;value.skills=["magic-dribbling"];}));
await run("missing diagram asset",root=>mutateJson(activity(root),value=>{value.diagram.src="assets/diagrams/not-there.svg";}));
await run("missing provenance",root=>mutateJson(activity(root),value=>{delete value.source;}));
await run("season date order",root=>mutateJson(join(root,"data/seasons/2026-fictional-archived-demo/season.json"),value=>{value.starts="2026-11-01";}));
await run("path traversal",root=>mutateJson(join(root,"data/current-season.json"),value=>{value.manifest="data/../README.md";}));
await run("unversioned activity reference",root=>mutateJson(join(root,"data/library/sessions/welcome-ball-control.json"),value=>{delete value.activities[0].activity_version;}));
await run("duplicate session id",async root=>{
  const source=join(root,"data/library/sessions/welcome-ball-control.json");
  const duplicate=join(root,"data/library/sessions/duplicate.json");
  await cp(source,duplicate);
  await mutateJson(join(root,"data/library/sessions/index.json"),value=>value.sessions.push("data/library/sessions/duplicate.json"));
});

await run("invalid activity id",root=>mutateJson(activity(root),value=>{value.id="Treasure Island!";}));
await run("invalid session duration",root=>mutateJson(join(root,"data/library/sessions/welcome-ball-control.json"),value=>{value.duration_minutes=5.5;}));
await run("duplicate curriculum week",root=>mutateJson(join(root,"data/seasons/2026-fictional-archived-demo/curriculum.json"),value=>{value.cycles[1].week=value.cycles[0].week;}));
await run("invalid practice exception",root=>mutateJson(join(root,"data/seasons/2026-fictional-archived-demo/practice-pattern.json"),value=>{value.exceptions=[{date:"2026-09-01",type:"weather"}];}));
await run("two seasons marked active",root=>mutateJson(join(root,"data/seasons/2026-fictional-archived-demo/season.json"),value=>{value.status="active";}));
await run("current season not marked active",root=>mutateJson(join(root,"data/seasons/2027-test-modularity-demo-u9/season.json"),value=>{value.status="archived";}));
await run("invalid season status",root=>mutateJson(join(root,"data/seasons/2027-test-modularity-demo-u9/season.json"),value=>{value.status="retired";}));
await run("archived season still fully validated",root=>mutateJson(join(root,"data/seasons/2027-test-modularity-demo-u9/season.json"),value=>{value.opening_session="not-a-real-session";}));
await run("season missing status",root=>mutateJson(join(root,"data/seasons/2027-test-modularity-demo-u9/season.json"),value=>{delete value.status;}));
// theme/fourCorners enum/placeholder checks only hard-fail once a session is
// published (draft sessions may still carry NEEDS_COACH_INPUT); welcome-ball-control
// is now published with real content, so these tests break exactly the field under
// test. Activity moment/all_phase, by contrast, are validated unconditionally for
// every activity regardless of whether any session references it or that session's
// publish status - there's no draft state for an activity record itself.
const sessionPath=root=>join(root,"data/library/sessions/welcome-ball-control.json");
const validBaseline=value=>{
  value.status="published";
  value.theme="defending";
  value.fourCorners={technical:"real outcome",physical:"real outcome",psychological:"real outcome",social:"real outcome"};
};

await run("published session with a fully backfilled baseline passes",root=>mutateJson(sessionPath(root),validBaseline),true);
await run("unsupported activity moment on a published session's activity",async root=>{
  await mutateJson(sessionPath(root),validBaseline);
  await mutateJson(join(root,"data/library/activities/traffic-lights/v2.json"),value=>{value.moment="sideways";});
});
await run("unsupported activity moment is rejected even on an activity no session uses",root=>mutateJson(activity(root),value=>{value.moment="sideways";}));
await run("all_phase must be true when present",root=>mutateJson(activity(root),value=>{value.all_phase="yes";}));
await run("all_phase activity with no moment passes",root=>mutateJson(join(root,"data/library/activities/team-scrimmage/v1.json"),value=>{delete value.moment;}),true);
await run("all_phase and moment together is rejected",root=>mutateJson(join(root,"data/library/activities/team-scrimmage/v1.json"),value=>{value.moment="in-possession";}));
await run("an activity missing both moment and all_phase is rejected",root=>mutateJson(join(root,"data/library/activities/four-goal-switch/v1.json"),value=>{delete value.all_phase;}));
await run("unsupported session theme",root=>mutateJson(sessionPath(root),value=>{validBaseline(value);value.theme="counter-attacking";}));
await run("fourCorners placeholder rejected",root=>mutateJson(sessionPath(root),value=>{validBaseline(value);value.fourCorners.social="NEEDS_COACH_INPUT: still a placeholder";}));
await run("fourCorners null is a valid not-addressed value, not a placeholder",root=>mutateJson(sessionPath(root),value=>{validBaseline(value);value.fourCorners.social=null;}),true);
await run("invalid session status",root=>mutateJson(sessionPath(root),value=>{value.status="in-review";}));
await run("unknown warmup progression id on a curriculum week",root=>mutateJson(join(root,"data/seasons/2026-fictional-archived-demo/curriculum.json"),value=>{value.cycles[0].warmup_progressions=["not-a-real-progression"];}));
await run("duplicate warmup progression id",root=>mutateJson(join(root,"data/library/warmup.json"),value=>{value.progressions[1].id=value.progressions[0].id;}));
await run("season missing warmup",root=>mutateJson(join(root,"data/seasons/2026-fictional-archived-demo/season.json"),value=>{delete value.warmup;}));
await run("curriculum week missing warmup_progressions",root=>mutateJson(join(root,"data/seasons/2026-fictional-archived-demo/curriculum.json"),value=>{delete value.cycles[0].warmup_progressions;}));
