// World pixels and seconds. Keep the feel of this prototype in one place.
export const MOVEMENT = {
  acceleration: 520, // Responsive launch: reaches cruising speed in about 0.24 seconds.
  maxSpeed: 125,
  drag: 4.5, // Exponential water resistance when no direction is held.
  stopSpeed: 2, // Finish the drift cleanly instead of creeping forever.
  turnResponsiveness: 11, // Sprite follows actual travel, including during drift.
  facingMinSpeed: 8,
  spriteScale: 1, // Native 48×60 art: fisherman body matches villagers.
  hullRadius: 17, // Native world pixels.
  cameraResponsiveness: 6,
};

export const WAKE = {
  intensity: 0.28,
  minSpeed: 20,
  interval: 0.14,
  lifetime: 0.7,
  sternOffset: 24,
  spread: 8,
};

// Fishing durations are in seconds, distance/speed use world pixels.
export const FISHING = {
  interactionDistance: 64,
  maxStartSpeed: 18,
  castDuration: 0.25,
  minBiteDelay: 0.65,
  maxBiteDelay: 1.65,
  spotRespawnTime: 12,
};

export const TENSION = {
  startingTension: .42,
  reelRate: .52,
  releaseRate: .42,
  dangerRecovery: 1.4,
};

export const CARGO = { capacity: 5 };
export const HOME = {
  dockX: 2148,
  dockY: 2716,
  sellDistance: 64,
  feedbackDuration: 1.4,
  spawnX: 2186,
  spawnY: 2716,
};

// Optional paddle maneuvers; no equipment or resource requirement.
export const MANEUVERS = {
  brakeDrag: 8, reverseAcceleration: 1.3, slowSpeed: 65,
  slowControl: 1.55, braceDuration: .85, braceCooldown: 2.8,
  braceResistance: .7, braceBlend: 12,
};
