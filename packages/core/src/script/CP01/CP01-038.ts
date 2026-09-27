// CP01-038 Tosen Jordan — Runecraft follower, 2, 2/1. ウマ娘.
// {[feed]} {[cost01]}: Race this follower. (A serve ability, CR 14.2.2.)
// {[lastwords]} Select a spell in your cemetery and add it to your hand.
import { defineCard, lastWords, serveAbility } from "../helpers";
import { inYourZone, isSpell } from "../targets";

export default defineCard({
  abilities: [
    serveAbility(1, 1),
    lastWords({
      targets: [inYourZone("cemetery", { filter: isSpell })],
      *resolve(fx) {
        yield* fx.returnToHand(fx.targets[0]!);
      },
    }),
  ],
});
