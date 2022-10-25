/**
 * © 2022-2022 Burns Recording Company
 * Created: 22/10/2022
 */

import { runCompatibilityCheck } from './helpers/checks';
import { Player } from './player';

runCompatibilityCheck();

const player = new Player();

console.log(`Loaded application`);
