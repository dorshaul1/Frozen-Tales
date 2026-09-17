export interface FishDifficulty {
  staminaMultiplier?: number;
  personality?: 'runner' | 'rhythmic' | 'burst' | 'steady' | 'erratic' | 'ambush' | 'endurance';
  difficulty: 'veryEasy' | 'easy' | 'medium' | 'hard' | 'extreme' | 'legendary';
  struggleStrength: number; // Added tension / second during a steady pull.
  struggleSpeed: number; // Multiplier for the readable calm/pull/recovery rhythm.
  burstChance: number; // Chance of a brief burst after each steady pull.
  burstStrength: number;
  directionChangeFrequency: number; // Visual direction changes / second.
  safeTensionWidth: number; // 0–1; centered around 0.5.
  progressRequired: number; // Seconds spent within the safe range.
  escapeTolerance: number; // Seconds of accumulated loose-line danger.
  snapTolerance: number; // Seconds of accumulated high-tension danger.
}
