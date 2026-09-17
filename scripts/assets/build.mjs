import { build } from './core.mjs';
try { console.log('Assets built:',build()); } catch(error) { console.error(error.message);process.exitCode=1; }
