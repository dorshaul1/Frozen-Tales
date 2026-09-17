import { validate } from './core.mjs';
try { console.log(validate()); } catch(error) { console.error(error.message);process.exitCode=1; }
