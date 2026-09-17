import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { PNG } from 'pngjs';
import { at, read, write, validateDefinition, normalize, build, validate } from './core.mjs';
import { render } from './renderers.mjs';

export function generate(def,options={provider:'procedural'}, rebuild=true) {
  validateDefinition(def);
  const style=fs.readFileSync(at('docs/art-style.md'),'utf8');
  for(const reference of def.references) if(!fs.existsSync(at(reference))) throw new Error(`Missing canonical reference: ${reference}`);
  const base=`assets/source/${def.id}`;
  fs.mkdirSync(at(base),{recursive:true});
  const request={id:def.id,style,description:def.description,referenceAssets:def.references.map(at),frameSize:def.frameSize,transparent:def.transparent,frames:def.frames.map(f=>({...f,filename:`${f.direction.toLowerCase()}-${f.animation}-${f.index}.png`})),instructions:'Inspect the reference images. Generate/edit each source frame independently with true transparency. Do not generate a sheet. Preserve fixed canvas and shared anchor. Agent owns all processing and integration.'};
  if(options.provider==='agent' || options.provider==='command') {
    write(`${base}/request.json`,request);
    write(`${base}/prompt.md`,`${style}\n\n## Requested asset: ${def.id}\n${def.description}\n\n${request.instructions}\n\n${JSON.stringify(request.frames,null,2)}\n\nReferences: ${def.references.join(', ')}\n`);
    if(options.provider==='agent'){console.log(`Prepared ${base}/request.json and prompt.md. Agent: inspect references, use image generation for individual frames, then import.`);return;}
    if(!options.command || !path.isAbsolute(options.command)) throw new Error('--command requires an absolute provider executable path');
    const directory=at(`${base}/provider-output`);fs.mkdirSync(directory,{recursive:true});
    const result=spawnSync(options.command,[at(`${base}/request.json`),directory],{stdio:'inherit',shell:false});
    if(result.status!==0) throw new Error('Asset provider failed; manifest unchanged');
    options={provider:'import',input:directory};
  }
  const prepared=[];
  for(const f of request.frames) {
    let image,raw;
    if(options.provider==='procedural') image=render(def,f);
    else if(options.provider==='import') {
      if(!options.input) throw new Error('Import requires --input');
      raw=fs.statSync(options.input).isDirectory()?path.join(options.input,f.filename):options.input;
      if(!fs.statSync(options.input).isDirectory() && request.frames.length!==1) throw new Error('Multi-frame import requires a directory of individual frames');
      image=PNG.sync.read(fs.readFileSync(raw));
    } else throw new Error(`Unknown provider ${options.provider}`);
    normalize(image,def); // Fail before touching manifest or existing source frames.
    prepared.push({f,image,raw});
  }
  const frames=[];
  for(const {f,image,raw} of prepared) {
    const source=`${base}/${f.filename}`;
    if(raw) {fs.mkdirSync(at(`${base}/raw`),{recursive:true});fs.copyFileSync(raw,at(`${base}/raw/${f.filename}`));}
    fs.writeFileSync(at(source),PNG.sync.write(image));
    frames.push({direction:f.direction,animation:f.animation,index:f.index,source,sourceDimensions:[image.width,image.height],output:`assets/generated/${def.id}/${f.filename}`});
  }
  const manifest=fs.existsSync(at('assets/manifest.json'))?read('assets/manifest.json'):{version:1,assets:[]};
  const entry={...def,sourceProvider:options.provider,directions:[...new Set(frames.map(f=>f.direction))],frames,output:'assets/atlases/game.png'};
  manifest.assets=manifest.assets.filter(asset=>asset.id!==def.id).concat(entry).sort((a,b)=>a.id.localeCompare(b.id));
  write('assets/manifest.json',manifest);
  if(rebuild){build();console.log(validate());}
}

if(process.argv[1] && path.resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
  try {
    const [definition,...args]=process.argv.slice(2);if(!definition) throw new Error('Usage: generate.mjs <definition.json> [--provider procedural|agent|import|command] [--input path] [--command executable]');
    const options={provider:'procedural'};
    for(let i=0;i<args.length;i+=2) {if(!['--provider','--input','--command'].includes(args[i]) || !args[i+1]) throw new Error('Invalid option');options[args[i].slice(2)]=args[i+1];}
    generate(JSON.parse(fs.readFileSync(path.resolve(definition),'utf8')),options);
  }catch(error){console.error(error.message);process.exitCode=1;}
}
