import fs from 'node:fs';import crypto from 'node:crypto';
const hashes=JSON.parse(fs.readFileSync('assets/reviews/native/penguin-preserved.json'));
for(const [p,h]of Object.entries(hashes))if(crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex')!==h)throw Error('Original penguin modified: '+p);
for(const p of ['assets/high-detail','scripts/assets/high-detail','src/game/assets/assetSet.ts','src/game/assets/characterAnimations.ts'])if(fs.existsSync(p))throw Error('Removed migration infrastructure returned: '+p);
console.log('PASS native renderer only; all 96 original penguin source frames unchanged.');
