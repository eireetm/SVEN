// BP05-098 Demon's Epitaph — Havencraft follower, 2, 2/3. 偶像・超克.
// {[evolve]} Discard a card: {[evolve]} this follower. (Not with an empty hand — ruling.)
import { defineCard, evolveAbility } from "../helpers";
import { discardCardsCost } from "../costs";

export default defineCard({
  abilities: [evolveAbility({ custom: discardCardsCost(1) })],
});
