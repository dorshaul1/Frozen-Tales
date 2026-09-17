import { ICE_PASSAGES } from '../world/traversalData';
import type { MapMarker } from './discovery';

export interface MapProgress { icebreaker: boolean; openedPassages: readonly string[] }
// Areas have no unlock gates in this world. Only the actual thin-ice crossings are
// blocked at the sole entrance. Discovered chambers have no ungated rear approach.
export function crossingAccess(marker: MapMarker, progress: MapProgress) {
  const passage = ICE_PASSAGES.find(p => p.route === marker.id);
  if (!passage || progress.openedPassages.includes(passage.id)) return { state: 'open', text: '' } as const;
  return progress.icebreaker
    ? { state: 'breakable', text: 'Crossing iced.\nUse your icebreaker\nwith a running start.' } as const
    : { state: 'blocked', text: 'Entrance sealed.\nFit an icebreaker bow.\nBreak the thin ice\nto enter.' } as const;
}
export const placeGroup = (marker: MapMarker) => marker.kind === 'village' || marker.kind === 'entrance'
  ? 'areas' : marker.kind === 'npc' || marker.id === 'dock' ? 'services' : 'landmarks';
export type PlaceGroup = ReturnType<typeof placeGroup>;
