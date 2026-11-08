import {defineConfig} from 'vite'
import {readdirSync,readFileSync,writeFileSync} from 'node:fs'
import {createHash} from 'node:crypto'
export default defineConfig({plugins:[{
 name:'offline-game',apply:'build',closeBundle(){
  const files=readdirSync('dist',{recursive:true,withFileTypes:true}).filter(f=>f.isFile()&&f.name!=='sw.js').map(f=>(f.parentPath+'/'+f.name).replace(/^dist/,''))
  const digest=createHash('sha256')
  for(const f of files.sort())digest.update(readFileSync('dist'+f))
  const cache='singularity-'+digest.digest('hex').slice(0,12)
  writeFileSync('dist/sw.js',`
const name=${JSON.stringify(cache)}, urls=${JSON.stringify(files)};
self.addEventListener('install',e=>e.waitUntil(caches.open(name).then(c=>c.addAll(urls)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('singularity-')&&k!==name).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',e=>{if(e.request.method!=='GET'||new URL(e.request.url).origin!==location.origin)return;e.respondWith(caches.open(name).then(async c=>(await c.match(e.request.mode==='navigate'?'/index.html':e.request,{ignoreVary:true}))||fetch(e.request)))});
`)
 }
}]})
