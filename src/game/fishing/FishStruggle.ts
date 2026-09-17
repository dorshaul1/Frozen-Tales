import type { FishDifficulty } from './difficulty';

export type StrugglePhase = 'calm' | 'pull' | 'burst' | 'recovery';

export const PERSONALITIES = {
  runner: { durations: [.9,.55,.5,1.0], pulse: .15, response: 8 },
  rhythmic: { durations: [1.1,.65,.2,1.0], pulse: 0, response: 7 },
  burst: { durations: [.7,.55,.45,.7], pulse: .1, response: 9 },
  steady: { durations: [.45,1.7,.3,.65], pulse: 0, response: 5 },
  erratic: { durations: [.4,.7,.35,.5], pulse: .6, response: 10 },
  ambush: { durations: [1.4,.3,.65,.8], pulse: 0, response: 9 },
  endurance: { durations: [.65,2,.5,.8], pulse: .2, response: 6 },
} as const;
// Small rhythmic simulation, independent of UI, input, and fish names.
export class FishStruggle {
  phase: StrugglePhase = 'calm';
  force = 0;
  angle = 0;
  private remaining = .55;
  private directionTime = 0;
  private targetAngle = 0;

  constructor(private data: FishDifficulty, private random: () => number = Math.random) {}

  update(dt: number) {
    this.remaining -= dt;
    if (this.remaining <= 0) {
      const next = this.phase === 'calm' ? 'pull'
        : this.phase === 'pull' ? (this.random() < this.data.burstChance ? 'burst' : 'recovery')
        : this.phase === 'burst' ? 'recovery' : 'calm';
      this.phase = next;
      this.remaining = PERSONALITIES[this.data.personality ?? 'rhythmic'].durations[['calm','pull','burst','recovery'].indexOf(next)]
        * (.85 + this.random() * .3) / this.data.struggleSpeed;
    }
    const rhythm = PERSONALITIES[this.data.personality ?? 'rhythmic'];
    const desired = this.phase === 'pull' ? this.data.struggleStrength * (1 + rhythm.pulse * Math.sin(this.remaining * 17))
      : this.phase === 'burst' ? this.data.struggleStrength + this.data.burstStrength
      : this.phase === 'calm' ? this.data.struggleStrength * .12 : 0;
    this.force += (desired - this.force) * (1 - Math.exp(-rhythm.response * this.data.struggleSpeed * dt));
    this.directionTime -= dt;
    if (this.directionTime <= 0) {
      this.targetAngle = this.random() * Math.PI * 2;
      this.directionTime = 1 / Math.max(.01, this.data.directionChangeFrequency);
    }
    const difference = Math.atan2(Math.sin(this.targetAngle - this.angle), Math.cos(this.targetAngle - this.angle));
    this.angle += difference * (1 - Math.exp(-3 * dt));
  }
}
