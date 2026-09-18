# Wildlife encounter density

Population uses authored regional water footprint, with regional budgets of roughly 41–62 animals and a global ceiling of 96. Common/uncommon species have regional caps; rare species retain their global caps, base probabilities, cooldowns, and shared rare-event timer. At most seven nearby groups / 24 nearby animals can occupy the encounter neighborhood. Animals still spawn outside view on valid terrain.

Common ambient species receive higher baseline activity and shorter cooldowns. Ravens and reindeer also occur around Frozen Lake. Existing ecology weights and time/weather multipliers remain authoritative; caves remain excluded. No new species assets or discovery state are introduced.

After 25 seconds without visible wildlife, common spawn probability gradually increases (up to twice its normal regional rate). It never bypasses habitat, weather, recent-location, or crowding checks and cannot boost rare animals. Arrival candidates follow both horizontal and vertical travel; seal floes are selected within a local radius. Group spacing varies and candidate order rotates to avoid one species filling every budget. Expiring common groups no longer impose another full cooldown.

Flying wildlife updates within 400 world pixels of the view, allowing invisible approach flights to reach the camera. Land animals retain the smaller activation margin. Existing feeding, resting, herd formation, perching, takeoff, and swimming behaviors are reused.

Checks: wildlife-density.html exercises eight seeded trips per region with varied weather/time, verifying group/species/rare caps; wildlife-visibility.html verifies offscreen flight activation and a bounded update workload. Production asset validation and build also pass. These checks do not replace prolonged playtesting at maximum population on low-end hardware.
