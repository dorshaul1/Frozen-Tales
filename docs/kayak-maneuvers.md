# Paddle maneuvers

- Hold C: smooth back-paddle braking. Overrides Turbo and bleeds flow-riding momentum.
- Tap C: brace for 0.85 seconds, with a 2.8-second interval between braces. Force resistance fades in/out; holding does not retrigger it.
- Steer slowly: stronger acceleration control and tighter heading response. Hold C and steer to pivot near rest.
- Opposing movement inputs naturally back-paddle before reversing.

The existing paddle animation plays backward for braking and restores forward playback afterward. Bracing plants the paddle. A single reused world-space graphics object draws paddle wash relative to hull heading. Existing wake strength responds to speed, and AudioManager limits paddle cues.

Current Stabilizer combines with brace resistance. Turbo resumes after releasing brake. No ownership, save state, resources, damage, or collision geometry added. Pause controls list C and low-speed steering.

Validation: production build and asset checks passed. Maneuver checks at 30/60/120 FPS cover smooth braking, force resistance, cooldown, low-speed control, Turbo override, animation direction and menu cleanup. Full river travel without using the new key passed downstream in 41.9s and upstream in 44.7s.
