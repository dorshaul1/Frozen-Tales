import { FishFight } from '../src/game/fishing/FishFight';
import { FISH } from '../src/game/fishing/data';
import type { FishDifficulty } from '../src/game/fishing/difficulty';

export function checkFightModel() {
  const results: string[] = [];
  const assert = (ok: boolean, message: string) => { if (!ok) throw new Error(message); };
  const simulate = (data: FishDifficulty, mode: 'hold' | 'release' | 'respond', seed: number, fps = 60) => {
    const random = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
    const fight = new FishFight(data, random);
    let held = false;
    while (fight.outcome === 'fighting' && fight.elapsed < 30) {
      if (mode === 'hold') held = true;
      else if (mode === 'release') held = false;
      else {
        const margin = data.safeTensionWidth * .22;
        if (fight.tension < .5 - margin) held = true;
        if (fight.tension > .5 + margin) held = false;
      }
      fight.update(1 / fps, held);
    }
    return fight;
  };
  for (const fish of Object.values(FISH)) {
    for (let seed = 1; seed <= 40; seed++) {
      assert(simulate(fish.fight, 'hold', seed).outcome === 'snapped', `${fish.name}: continuous holding should snap`);
      assert(simulate(fish.fight, 'release', seed).outcome === 'escaped', `${fish.name}: no input should escape`);
      for (const fps of [30, 60, 120]) {
        const fight = simulate(fish.fight, 'respond', seed, fps);
        assert(fight.outcome === 'landed', `${fish.name}: responsive control must win seed ${seed} at ${fps} FPS`);
        assert(fight.elapsed >= fish.fight.progressRequired && fight.elapsed <= fish.fight.progressRequired + 1.4, `${fish.name}: responsive fight should stay close to its configured duration`);
      }
    }
    results.push(`PASS ${fish.name}: 40 seeds, both failure modes, responsive catches at 30/60/120 FPS at the configured fight duration`);
  }
  const future: FishDifficulty = { difficulty: 'legendary', struggleStrength: .25, struggleSpeed: 2, burstChance: .8, burstStrength: .15, directionChangeFrequency: 2, safeTensionWidth: .22, progressRequired: 10, escapeTolerance: .65, snapTolerance: .65 };
  assert(simulate(future, 'respond', 55, 120).outcome === 'landed', 'Data-only future difficulty should use the same model');
  results.push('PASS Data-only difficult profile works without fish-name logic');
  return results;
}
