(() => {
  const safePath=path=>{
    if(typeof path!=="string"||!path.startsWith("data/")||path.split("/").includes(".."))throw new Error("Unsafe content path");
    return path;
  };
  const get=async path=>{const response=await fetch(safePath(path),{cache:"no-store"});if(!response.ok)throw new Error("Unable to load "+path);return response.json();};
  const loadIndex=async path=>{const index=await get(path);const key=index.activities?"activities":"sessions";return Promise.all(index[key].map(get));};
  const seasonOverrideKey="smallside-selected-season";
  const resolveManifest=async defaultManifest=>{
    let override="";
    try{override=localStorage.getItem(seasonOverrideKey)||"";}catch(_){}
    if(!override||override===defaultManifest)return {manifest:defaultManifest,usingNonDefaultSeason:false};
    try{
      const seasonIndex=await get("data/seasons/index.json");
      if((seasonIndex.seasons||[]).includes(override))return {manifest:override,usingNonDefaultSeason:true};
    }catch(_){}
    return {manifest:defaultManifest,usingNonDefaultSeason:false};
  };
  const ready=(async()=>{const current=await get("data/current-season.json");const {manifest,usingNonDefaultSeason}=await resolveManifest(current.manifest);const season=await get(manifest);const [league,curriculum,practicePattern,games,activities,sessions,warmup]=await Promise.all([get(season.league_profile),get(season.curriculum),get(season.practice_pattern),get(season.games),loadIndex(season.activity_index),loadIndex(season.session_index),get(season.warmup)]);return {season,league,curriculum,practicePattern,games,activities,sessions,warmup,usingNonDefaultSeason,defaultManifest:current.manifest};})();
  window.SmallSideContent={ready};
  ready.catch(error=>console.error("SmallSide content fallback active:",error));
})();
