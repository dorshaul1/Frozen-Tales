import {SIDE_ROUTES,routeSpan} from './sideRoutes';
// Only these authored, optional sheets can break. Permanent terrain is never queried.
export const ICE_PASSAGES=[{id:'ice-cut-sheet',route:'ice-cut',y:2490,momentum:85},{id:'sluice-sheet',route:'glacier-sluice',y:4380,momentum:100},{id:'blueglass-sheet',route:'blueglass',y:2615,momentum:95},{id:'vault-sheet',route:'echo-vault',y:6500,momentum:110},{id:'rime-sheet',route:'rime-channel',y:615,momentum:75}] as const;
export function passageBounds(p:typeof ICE_PASSAGES[number]){const route=SIDE_ROUTES.find(r=>r.id===p.route)!;const spans=[p.y-6,p.y,p.y+14].map(y=>routeSpan(route,y)!);const l=Math.min(...spans.map(s=>s[0]))-3,r=Math.max(...spans.map(s=>s[1]))+3;return {x:l,y:p.y,width:r-l,height:14};}
