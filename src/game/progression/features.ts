import type Phaser from 'phaser';import type {CoreQuests} from './CoreQuests';import type {Feature} from './coreData';
export function hasFeature(scene:Phaser.Scene,feature:Feature){const core=scene.registry.get('coreQuests') as CoreQuests|undefined;return core?core.has(feature):true;}
export function requireFeature(scene:Phaser.Scene,feature:Feature,hint:string){if(hasFeature(scene,feature))return true;scene.events.emit('core-hint',hint);return false;}
