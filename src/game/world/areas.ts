// World-pixel boundaries and gentle flow speeds; no unlock gates.
export const AREAS = { bendStart: 2150, lakeStart: 3370, gorgeStart: 4060 };
export const CURRENTS = [
  { y:5680,length:160,speed:30 },
  { y:6740,length:180,speed:35 },
  { y:4210,length:200,speed:33 },
  { y:4830,length:230,speed:39 },
  { y: 2190, length: 190, speed: 19 },
  { y: 2890, length: 220, speed: 24 },
];
export function currentAt(y: number) {
  const section = CURRENTS.find(c => y > c.y && y < c.y + c.length);
  return section ? Math.sin((y - section.y) / section.length * Math.PI) * section.speed : 0;
}
