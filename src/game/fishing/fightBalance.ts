// Shared fight pacing, independent of species. Equipment still supplies adjusted FishDifficulty.
export const FIGHT = {
 castMin:24,castMax:130,chargeSeconds:.8,assistRadius:55,landDistance:16,landingWindow:3,
 reelPressure:.28,releasePressure:.32,followRelief:.08,baseReel:14,runDistance:18,
};
export const FIGHT_TIERS = {
 veryEasy:{stamina:2.6,distance:42,tire:1.2},easy:{stamina:3.3,distance:46,tire:1.1},
 medium:{stamina:4.3,distance:53,tire:1},hard:{stamina:5.7,distance:58,tire:.95},
 extreme:{stamina:7,distance:62,tire:.9},legendary:{stamina:9,distance:68,tire:.85},
};
export const FIGHT_PROFILES = {
 rhythmic:{run:.35,reel:1,secondWind:0},runner:{run:1.4,reel:1.05,secondWind:0},
 burst:{run:1.15,reel:1.1,secondWind:0},steady:{run:.8,reel:.85,secondWind:0},
 erratic:{run:1,reel:1,secondWind:.15},ambush:{run:1.4,reel:1.1,secondWind:.25},
 endurance:{run:1.1,reel:.9,secondWind:.3},
};
