import {cp, mkdir, readFile, rm, stat, writeFile} from "node:fs/promises";
import {dirname, relative, resolve, sep} from "node:path";

const root=process.cwd();
const dist=resolve(root,"dist");
const dataRoot=resolve(root,"data");
const readText=path=>readFile(path,"utf8");
const readJson=async path=>JSON.parse(await readText(path));
const copied=new Set();
const headers=`/*
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), geolocation=(), microphone=(), payment=(), usb=()
  X-Frame-Options: DENY
  Content-Security-Policy: default-src 'self'; base-uri 'self'; object-src 'none'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data:; font-src 'self' https://fonts.gstatic.com; connect-src 'self'; frame-ancestors 'none'; form-action 'self'; upgrade-insecure-requests

/data/*
  Cache-Control: public, max-age=300
`;

const dataPath=value=>{
  if(typeof value!=="string"||!value.startsWith("data/")||value.includes("\0"))throw new Error(`Unsafe data path: ${value}`);
  const target=resolve(root,value);
  const rel=relative(dataRoot,target);
  if(rel===".."||rel.startsWith(".."+sep))throw new Error(`Data path leaves data/: ${value}`);
  return target;
};
const copyFile=async source=>{
  const file=resolve(root,source);
  const rel=relative(root,file);
  if(rel===""||rel===".."||rel.startsWith(".."+sep))throw new Error(`Path leaves project: ${source}`);
  if(copied.has(rel))return;
  if(!(await stat(file)).isFile())throw new Error(`Expected file: ${source}`);
  await mkdir(dirname(resolve(dist,rel)),{recursive:true});
  await cp(file,resolve(dist,rel));
  copied.add(rel);
};
const copyData=async value=>{
  await copyFile(value);
  return readJson(dataPath(value));
};
const requireArray=(value,label)=>{
  if(!Array.isArray(value)||!value.length)throw new Error(`Expected non-empty ${label}`);
  return value;
};
const imagePattern=/^assets\/images\/[a-z0-9-]+\.(?:png|jpe?g|webp)$/i;
const copyTeamImage=async(src,label)=>{
  if(src===undefined)return;
  if(typeof src!=="string"||!imagePattern.test(src))throw new Error(`Unsafe or missing ${label} image path: ${src}`);
  await copyFile(src);
};

await rm(dist,{recursive:true,force:true});
await mkdir(dist,{recursive:true});
await copyFile("index.html");
await Promise.all([
  "assets/css/styles.css",
  "assets/js/activity-filters.js",
  "assets/js/app.js",
  "assets/js/content-loader.js",
  "assets/js/data-driven.js",
  "assets/js/dynamic.js",
  "assets/js/rules-resources.js",
  "assets/js/terminology.js",
  "assets/js/theme.js",
  "assets/images/smallside-app-logo.webp",
  "assets/images/modularity-mallards-hero.webp",
  "data/library/resources.json"
].map(copyFile));
await writeFile(resolve(dist,"_headers"),headers);
await cp(resolve(root,"public/404.html"),resolve(dist,"404.html"));
const dynamicPath=resolve(dist,"assets/js/dynamic.js");
const dynamic=await readText(dynamicPath);
const withoutReflectNav=dynamic.replace(`  nav.querySelector('a[href="#activities"]').insertAdjacentHTML("beforebegin",'<a href="#reflect">Reflect</a>');\n`,"");
const withoutReflectRoute=withoutReflectNav.replace('if(route==="reflect")showReflect();',"");
const publicDynamic=withoutReflectRoute.replace(/\n  function showReflect\(\)\{[\s\S]*?\n  function routeExtension/,"\n  function routeExtension");
if(publicDynamic===dynamic||publicDynamic.includes('href="#reflect"')||publicDynamic.includes('route==="reflect"'))throw new Error("Public build could not remove reflection route");
await writeFile(dynamicPath,publicDynamic);
const indexPath=resolve(dist,"index.html");
const index=await readText(indexPath);
const withoutDevelopment=index.replace(/\s*<script src="assets\/js\/development\.js[^>]*><\/script>/,"\n");
if(withoutDevelopment===index)throw new Error("Public build could not remove private Development route");
const publicIndex=withoutDevelopment.replace(/\s*<script src="assets\/js\/seasons\.js[^>]*><\/script>/,"\n");
if(publicIndex===withoutDevelopment)throw new Error("Public build could not remove local-only Seasons route");
await writeFile(indexPath,publicIndex);

const current=await copyData("data/current-season.json");
const season=await copyData(current.manifest);
await copyTeamImage(season.team?.crest?.src,"team crest");
await copyTeamImage(season.team?.coach_bio?.photo?.src,"coach bio photo");
const [,,,activityIndex,sessionIndex,,]=await Promise.all([
  copyData(season.curriculum),
  copyData(season.practice_pattern),
  copyData(season.games),
  copyData(season.activity_index),
  copyData(season.session_index),
  copyData(season.league_profile),
  copyData(season.warmup)
]);
const activityRecords=await Promise.all(requireArray(activityIndex.activities,"activity index").map(copyData));
await Promise.all(requireArray(sessionIndex.sessions,"session index").map(copyData));
const diagramPattern=/^assets\/diagrams\/[a-z0-9-]+\.svg$/;
const diagramPaths=[...new Set(activityRecords.map(activity=>activity?.diagram?.src).filter(Boolean))];
for(const path of diagramPaths)if(!diagramPattern.test(path))throw new Error(`Unsafe diagram path: ${path}`);
await Promise.all(diagramPaths.map(copyFile));

const prohibited=["docs/","deploy/","server/","tools/","data/reflections/",".git/"];
for(const path of copied)if(prohibited.some(prefix=>path.startsWith(prefix)))throw new Error(`Private path copied: ${path}`);

const sensitivePatterns=[
  {name:"email address",pattern:/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i},
  {name:"phone number",pattern:/\(?\d{3}\)?[-.\s]\d{3}[-.\s]\d{4}\b/},
  {name:"medical or safeguarding keyword",pattern:/\b(medical|medication|allergy|allergies|diagnosis|social security|\bssn\b)\b/i}
];
for(const path of copied){
  if(!path.startsWith("data"+sep))continue;
  const text=await readText(resolve(dist,path));
  for(const {name,pattern} of sensitivePatterns)if(pattern.test(text))throw new Error(`Public build blocked: possible ${name} found in ${path}. Review before deploying.`);
}
console.log(`Built public site: ${copied.size} entry/data files plus assets → dist/`);
