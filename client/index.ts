/**
 * © 2022-2022 Burns Recording Company
 * Created: 22/10/2022
 */

import { runCompatibilityCheck } from './helpers/checks';
import { Player } from './player';

/**
 * Player startup
 * 
 * 1. Check that the user's browser can run the client code
 * 2. Start a player instance. If you try and do this more than once,
 *    you might get some strange effects or crash your (or worse, your listeners') browser.
 * 3. If the player still didn't start properly for some reason, throw an error and call it a day.
 */

runCompatibilityCheck(); // (1)
let player;
player = new Player(); // (2)

if (!player) {
  throw new Error(`Failed to load player`); // (3)
} else {
  console.log(`Loaded application`);
}
