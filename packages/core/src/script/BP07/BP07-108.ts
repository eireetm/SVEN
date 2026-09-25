// BP07-108 Maisha, Hero of Purgation — Neutral follower, 2, 2/3. 超克.
// {[evolve]} {[cost02]}: Evolve this follower.
// Strike - Select a Neutral spell that costs 3 or less in your cemetery and play it for 0 play
// points.
import { defineCard, evolveAbility } from "../helpers";
import { maishaStrike } from "./shared";

export default defineCard({
  abilities: [evolveAbility(2), maishaStrike],
});
