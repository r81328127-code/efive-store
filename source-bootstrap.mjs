// EFIVE deployment bootstrap. Restores source and public assets before Vite builds.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)));
const source = PLACEHOLDER_SOURCE;
const embeddedSrcAssets = PLACEHOLDER_SRC_ASSETS;
const publicFiles = PLACEHOLDER_PUBLIC_FILES;
const embeddedGlbs = PLACEHOLDER_GLBS;
const assetBase = 'https://efive.store/';
for (const [rel, content] of Object.entries(source)) { const target=path.join(root,rel); fs.mkdirSync(path.dirname(target),{recursive:true}); fs.writeFileSync(target,content,'utf8'); }
for (const [rel,encoded] of Object.entries(embeddedSrcAssets)) { const target=path.join(root,rel); fs.mkdirSync(path.dirname(target),{recursive:true}); fs.writeFileSync(target,Buffer.from(encoded,'base64')); }
async function download(url) { const res=await fetch(url); if(!res.ok) throw new Error(`Asset download failed ${res.status}: ${url}`); return Buffer.from(await res.arrayBuffer()); }
for (const rel of publicFiles) { const target=path.join(root,'public',rel); if(fs.existsSync(target)&&fs.statSync(target).size>0) continue; fs.mkdirSync(path.dirname(target),{recursive:true}); try { fs.writeFileSync(target,await download(assetBase+rel.split('/').map(encodeURIComponent).join('/'))); } catch(error) { console.warn(String(error)); } }
for (const [name,encoded] of Object.entries(embeddedGlbs)) { const target=path.join(root,'public',name); fs.mkdirSync(path.dirname(target),{recursive:true}); fs.writeFileSync(target,Buffer.from(encoded,'base64')); }
console.log(`EFIVE bootstrap restored ${Object.keys(source).length} source files and prepared ${publicFiles.length+Object.keys(embeddedGlbs).length} public assets.`);
