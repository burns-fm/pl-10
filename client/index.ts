/**
 * © 2022-2022 Burns Recording Company
 * Created: 22/10/2022
 */

import { runCompatibilityCheck } from './helpers/checks';
import { Player } from './player';

runCompatibilityCheck();
let player;
player = new Player();

if (!player) {
  throw new Error(`Failed to load player`);
} else {
  console.log(`Loaded application`);
}
