import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PNG } from 'pngjs';
import { palette, rgba } from './pixels.mjs';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
export const at = name => path.join(ROOT, name);
export const read = name => JSON.parse(fs.readFileSync(at(name), 'utf8'));
export const write = (name, value) => { fs.mkdirSync(path.dirname(at(name)), { recursive: true }); fs.writeFileSync(at(name), typeof value === 'string' ? value : JSON.stringify(value, null, 2) + '\n'); };
export const png = name => PNG.sync.read(fs.readFileSync(at(name)));
const assert = (ok, message) => { if (!ok) throw new Error(message); };
const allowedDirections = ['none','N','NE','E','SE','S','SW','W','NW'];
const colors = Object.values(palette).map(rgba);
const colorSet = new Set(colors.map(c => c.slice(0,3).join(',')));
export const frameKey = (id, frame) => `${id}/${frame.direction}/${frame.animation}/${frame.index}`;

// Exact opaque-pixel collision spans, merged vertically when identical.
// Floe visuals and hull collision therefore share a single source of truth.
export function collisionSpans(image) {
  const spans=[];let previous=new Map();
  for(let y=0;y<image.height;y++) {
    const current=new Map();
    for(let x=0;x<image.width;) {
      if(image.data[(y*image.width+x)*4+3]===0){x++;continue;}
      const start=x;
      while(x<image.width && image.data[(y*image.width+x)*4+3]!==0)x++;
      const key=`${start}:${x-start}`, prior=previous.get(key);
      if(prior!==undefined){spans[prior][3]++;current.set(key,prior);}
      else {current.set(key,spans.length);spans.push([start,y,x-start,1]);}
    }
    previous=current;
  }
  return spans;
}

export function validateDefinition(def) {
  assert(/^[a-z][a-z0-9-]*$/.test(def.id), 'Invalid asset ID');
  assert(['sprite','tile','prop','ui'].includes(def.type), `${def.id}: invalid type`);
  assert(Array.isArray(def.frameSize) && def.frameSize.length === 2 && def.frameSize.every(n => Number.isInteger(n) && n > 0 && n <= 2048), `${def.id}: invalid frameSize`);
  assert(typeof def.transparent === 'boolean', `${def.id}: transparency requirement missing`);
  assert(Array.isArray(def.frames) && def.frames.length > 0, `${def.id}: frames required`);
  const keys = new Set();
  for (const f of def.frames) {
    assert(allowedDirections.includes(f.direction), `${def.id}: invalid direction`);
    assert(/^[a-z][a-z0-9-]*$/.test(f.animation) && Number.isInteger(f.index) && f.index >= 0, `${def.id}: invalid animation frame`);
    const key=frameKey(def.id,f); assert(!keys.has(key), `${def.id}: duplicate frame`); keys.add(key);
    assert(def.animations?.[f.animation]?.fps > 0, `${def.id}: missing animation timing`);
  }
  for(const animation of Object.keys(def.animations)) {
    assert(def.frames.some(f=>f.animation===animation), `${def.id}: empty animation ${animation}`);
    for(const direction of new Set(def.frames.filter(f=>f.animation===animation).map(f=>f.direction))) {
      const indices=def.frames.filter(f=>f.animation===animation && f.direction===direction).map(f=>f.index).sort((a,b)=>a-b);
      assert(indices.every((n,i)=>n===i), `${def.id}: nonconsecutive frames`);
    }
  }
  assert(Array.isArray(def.references) && def.references.length>0, `${def.id}: references required`);
}

export function validateImage(image, def, label) {
  assert(image.width===def.frameSize[0] && image.height===def.frameSize[1], `${label}: incorrect dimensions`);
  let transparent=0, opaque=0;
  const padding=def.padding ?? (def.transparent ? 1 : 0);
  for(let y=0;y<image.height;y++) for(let x=0;x<image.width;x++) {
    const i=(y*image.width+x)*4,a=image.data[i+3];
    assert(a===0 || a===255, `${label}: antialiased alpha`);
    if(a===0){ transparent++;continue; }
    opaque++;
    assert(colorSet.has([...image.data.subarray(i,i+3)].join(',')),`${label}: color outside production palette`);
    if(def.transparent && (x<padding || y<padding || x>=image.width-padding || y>=image.height-padding)) throw new Error(`${label}: inconsistent transparent padding`);
  }
  assert(opaque>0, `${label}: empty image`);
  assert(def.transparent ? transparent>0 : transparent===0, `${label}: missing required ${def.transparent?'transparency':'opacity'}`);
}

export function normalize(source, def) {
  const policy=def.normalization ?? {};
  let input=source;
  if(policy.background) {
    input=PNG.sync.read(PNG.sync.write(source));
    const c=rgba(policy.background);
    for(let i=0;i<input.data.length;i+=4) if(c.slice(0,3).every((v,j)=>input.data[i+j]===v)) input.data[i+3]=0;
  }
  const [w,h]=def.frameSize;
  if(policy.fit!=='contain') assert(input.width===w && input.height===h,`${def.id}: wrong source dimensions; explicitly opt into nearest-neighbor contain`);
  const output=new PNG({width:w,height:h});
  const padding=policy.fit==='contain' ? (def.padding ?? 1) : 0;
  const ratio=policy.fit==='contain' ? Math.min((w-padding*2)/input.width,(h-padding*2)/input.height) : 1;
  const nw=Math.max(1,Math.round(input.width*ratio)),nh=Math.max(1,Math.round(input.height*ratio));
  const ox=Math.floor((w-nw)/2),oy=Math.floor((h-nh)/2);
  for(let y=0;y<nh;y++) for(let x=0;x<nw;x++) {
    const si=(Math.min(input.height-1,Math.floor(y/ratio))*input.width+Math.min(input.width-1,Math.floor(x/ratio)))*4;
    const di=((y+oy)*w+x+ox)*4;
    let c=[...input.data.subarray(si,si+4)];
    if(policy.alpha==='threshold') c[3]=c[3]>=128?255:0;
    if(c[3] && policy.palette==='nearest') {
      let best=colors[0],distance=Infinity;
      for(const candidate of colors){ const d=c.slice(0,3).reduce((sum,v,i)=>sum+(v-candidate[i])**2,0);if(d<distance){distance=d;best=candidate;} }
      c=[...best.slice(0,3),c[3]];
    }
    if(c[3]===0)c=[0,0,0,0];
    output.data.set(c,di);
  }
  validateImage(output,def,def.id);
  return output;
}

export function catalogText(manifest) {
  const first={},frames={},animations=[],masks={};
  for(const asset of manifest.assets) {
    first[asset.id]=frameKey(asset.id,asset.frames[0]);
    frames[asset.id]=asset.frames.map(f=>frameKey(asset.id,f));
    if(asset.collision)for(const frame of asset.frames)masks[frameKey(asset.id,frame)]=collisionSpans(png(frame.output));
    for(const animation of Object.keys(asset.animations)) for(const direction of asset.directions) {
      const list=asset.frames.filter(f=>f.direction===direction && f.animation===animation);
      if(list.length>1) animations.push({key:`${asset.id}/${direction}/${animation}`,frames:list.map(f=>frameKey(asset.id,f)),frameRate:asset.animations[animation].fps,repeat:asset.animations[animation].repeat ?? -1});
    }
  }
  return `// Generated by assets:build. Do not edit.\nimport image from '../../../assets/atlases/game.png?url';\nimport data from '../../../assets/atlases/game.json';\nexport const ATLAS = 'arctic';\nexport const ATLAS_IMAGE = image;\nexport const ATLAS_DATA = data;\nexport const ASSETS = ${JSON.stringify(first,null,2)} as const;\nexport type AssetId = keyof typeof ASSETS;\nexport const ASSET_FRAMES = ${JSON.stringify(frames,null,2)} as const;\nexport const ANIMATIONS = ${JSON.stringify(animations,null,2)};\nexport const COLLISION_MASKS: Record<string, number[][]> = ${JSON.stringify(masks)};\n`;
}

export function build() {
  const manifest=read('assets/manifest.json');
  const packed=[];const ids=new Set();
  const atlasWidth=Math.max(512,2**Math.ceil(Math.log2(Math.max(...manifest.assets.map(a=>a.frameSize[0]))+4)));
  let x=2,y=2,row=0;
  for(const asset of manifest.assets) {
    validateDefinition(asset); assert(!ids.has(asset.id),`Duplicate asset ID ${asset.id}`);ids.add(asset.id);
    for(const frame of asset.frames) {
      const input=png(frame.source);
      assert(input.width===frame.sourceDimensions[0] && input.height===frame.sourceDimensions[1],`${frame.source}: declared source dimensions differ`);
      const output=normalize(input,asset);
      fs.mkdirSync(path.dirname(at(frame.output)),{recursive:true});fs.writeFileSync(at(frame.output),PNG.sync.write(output));
      if(x+output.width+2>atlasWidth){x=2;y+=row+4;row=0;}
      packed.push({key:frameKey(asset.id,frame),image:output,x,y});
      x+=output.width+4;row=Math.max(row,output.height);
    }
  }
  const atlas=new PNG({width:atlasWidth,height:y+row+2});const frames={};
  for(const item of packed) {
    PNG.bitblt(item.image,atlas,0,0,item.image.width,item.image.height,item.x,item.y);
    frames[item.key]={frame:{x:item.x,y:item.y,w:item.image.width,h:item.image.height},rotated:false,trimmed:false,spriteSourceSize:{x:0,y:0,w:item.image.width,h:item.image.height},sourceSize:{w:item.image.width,h:item.image.height}};
  }
  fs.mkdirSync(at('assets/atlases'),{recursive:true});fs.writeFileSync(at('assets/atlases/game.png'),PNG.sync.write(atlas));
  write('assets/atlases/game.json',{frames,meta:{app:'Arctic Drift asset pipeline',image:'game.png',format:'RGBA8888',size:{w:atlas.width,h:atlas.height},scale:'1'}});
  write('src/game/assets/catalog.ts',catalogText(manifest));
  return {assets:manifest.assets.length,frames:packed.length};
}

export function validate() {
  const manifest=read('assets/manifest.json');assert(manifest.version===1,'Unsupported manifest version');
  const atlas=png('assets/atlases/game.png'),metadata=read('assets/atlases/game.json');
  const ids=new Set(),keys=new Set();
  for(const asset of manifest.assets) {
    validateDefinition(asset);assert(!ids.has(asset.id),`Duplicate asset ID ${asset.id}`);ids.add(asset.id);
    assert(JSON.stringify(asset.directions)===JSON.stringify([...new Set(asset.frames.map(f=>f.direction))]),`${asset.id}: inconsistent directions`);
    assert(asset.output==='assets/atlases/game.png',`${asset.id}: wrong atlas output`);
    for(const reference of asset.references) assert(fs.existsSync(at(reference)),`${asset.id}: missing reference ${reference}`);
    for(const f of asset.frames) {
      const input=png(f.source),output=png(f.output),key=frameKey(asset.id,f);keys.add(key);
      assert(input.width===f.sourceDimensions[0] && input.height===f.sourceDimensions[1],`${key}: source dimensions differ`);
      validateImage(output,asset,key);
      assert(normalize(input,asset).data.equals(output.data),`${key}: stale normalized output`);
      const rect=metadata.frames[key]?.frame;
      assert(rect && rect.w===output.width && rect.h===output.height,`${key}: missing/incorrect atlas rectangle`);
      assert(rect.x>=0 && rect.y>=0 && rect.x+rect.w<=atlas.width && rect.y+rect.h<=atlas.height,`${key}: atlas bounds`);
      for(let y=0;y<rect.h;y++) {
        const actual=atlas.data.subarray(((rect.y+y)*atlas.width+rect.x)*4,((rect.y+y)*atlas.width+rect.x+rect.w)*4);
        assert(actual.equals(output.data.subarray(y*rect.w*4,(y+1)*rect.w*4)),`${key}: atlas pixels differ`);
      }
    }
  }
  assert(Object.keys(metadata.frames).length===keys.size,'Unexpected atlas frames');
  assert(fs.readFileSync(at('src/game/assets/catalog.ts'),'utf8')===catalogText(manifest),'Stale Phaser registry');
  return `${ids.size} assets / ${keys.size} frames: dimensions, alpha, palette, references, atlas and registry valid`;
}
