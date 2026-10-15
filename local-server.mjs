import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';

const root = fileURLToPath(new URL('./dist/', import.meta.url));
const types = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.geojson':'application/geo+json; charset=utf-8','.svg':'image/svg+xml','.png':'image/png'};
const server = http.createServer((req,res) => {
  let relative;
  try {relative=decodeURIComponent(new URL(req.url,'http://localhost').pathname);} catch {res.writeHead(400).end();return;}
  const file=path.resolve(root,'.'+relative+(relative.endsWith('/')?'index.html':''));
  if(!file.startsWith(path.resolve(root)+path.sep)) {res.writeHead(403).end();return;}
  fs.stat(file,(err,stat)=>{
    if(err||!stat.isFile()){res.writeHead(404).end('File not found');return;}
    res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store'});
    fs.createReadStream(file).pipe(res);
  });
});
let port=53762;
server.on('error',error=>{if(error.code==='EADDRINUSE' && port<53782){server.listen(++port,'127.0.0.1');}else{console.error(error.message);process.exitCode=1;}});
server.on('listening',()=>{
  const url=`http://127.0.0.1:${port}/`;
  console.log(`\nSNOW — A WORD ATLAS\n\n${url}\n\nKeep this window open while exploring. Close it to stop the local server.\nAll map libraries and data are included; dictionary links need internet.\n`);
  if(process.platform==='win32') spawn('rundll32.exe',['url.dll,FileProtocolHandler',url],{detached:true,stdio:'ignore',windowsHide:true}).unref();
});
server.listen(port,'127.0.0.1');
