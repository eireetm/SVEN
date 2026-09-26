// BP10-017 Deepwood Wolf — Forestcraft follower, 7, 4/4. 獣.
// Storm.
// Whenever another Beast follower is put onto your field, give this follower {[attack]}+2/{[defense]}+2.
// {[act]} {[cost01]}, put this card from your hand into your EX area: Select a card on your field and
// put it into its owner's EX area. (Valid in the hand; with a full EX area it can't be played, and
// when this card fills it the selected card stays — rulings, CR 4.8.3.2.)
import { putThisFromHandIntoEx } from "../costs";
import { activated, defineCard, whenFollowerEntersYourField } from "../helpers";
import { hasTrait, yourCardOnField } from "../targets";

export default defineCard({
  keywords: ["storm"],
  abilities: [
    whenFollowerEntersYourField(
      {
        *resolve(fx) {
          if (fx.game.card(fx.self)?.zone === "field") yield* fx.giveStats(fx.self, 2, 2);
        },
      },
      { another: true, filter: hasTrait("獣") },
    ),
    activated(
      { playPoints: 1, custom: putThisFromHandIntoEx },
      {
        validIn: ["hand"],
        targets: [yourCardOnField()],
        *resolve(fx) {
          yield* fx.putIntoEx(fx.targets[0]!);
        },
      },
    ),
  ],
});
