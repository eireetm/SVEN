// BP05-094 Unidentified Subject — Havencraft follower, 5, 3/7. 狂信.
// {[evolve]} {[cost02]}: Evolve this follower.
// Whenever you draw a card outside of your start phase, give this follower
// {[attack]}+1/{[defense]}+1.
import { defineCard, evolveAbility } from "../helpers";
import { growsOnDraw } from "./shared";

export default defineCard({
  abilities: [evolveAbility(2), growsOnDraw],
});
