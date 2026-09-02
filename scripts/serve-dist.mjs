import {createReadStream, existsSync, readFileSync, statSync} from "node:fs";
import {createServer} from "node:http";
import {extname, resolve} from "node:path";

const root=resolve("dist");
const types={".css":"text/css; charset=utf-8",".html":"text/html; charset=utf-8",".js":"text/javascript; charset=utf-8",".json":"application/json; charset=utf-8",".svg":"image/svg+xml",".webp":"image/webp"};

const parseHeaders=text=>{
  const blocks=[];
  let current=null;
  for(const rawLine of text.split("\n")){
    const line=rawLine.replace(/\r$/,"");
    if(!line.trim()){current=null;continue;}
    if(!/^[ \t]/.test(line)){current={pattern:line.trim(),headers:{}};blocks.push(current);continue;}
    if(!current)continue;
    const index=line.indexOf(":");
    if(index===-1)continue;
    current.headers[line.slice(0,index).trim()]=line.slice(index+1).trim();
  }
  return blocks;
};
const globToRegExp=pattern=>new RegExp("^"+pattern.split("*").map(part=>part.replace(/[.+?^${}()|[\]\\]/g,"\\$&")).join(".*")+"$");
const headerBlocks=parseHeaders(readFileSync(resolve(root,"_headers"),"utf8")).map(block=>({...block,test:globToRegExp(block.pattern)}));
const headersFor=path=>{
  const merged={};
  for(const block of headerBlocks)if(block.test.test(path))Object.assign(merged,block.headers);
  return merged;
};

createServer((request,response)=>{
  const raw=new URL(request.url,"http://localhost").pathname;
  const relative=(raw==="/"?"index.html":raw.replace(/^\/+/,""));
  const file=resolve(root,relative);
  if(!file.startsWith(root+"/")||!existsSync(file)||!statSync(file).isFile()){response.writeHead(404,{"content-type":"text/plain; charset=utf-8"});response.end("Not found");return;}
  response.writeHead(200,{"content-type":types[extname(file)]||"application/octet-stream",...headersFor(raw)});
  createReadStream(file).pipe(response);
}).listen(4173,"127.0.0.1",()=>console.log("Serving dist on http://127.0.0.1:4173"));
