// BP14-070 Itsurugi, Eager Admirer — Abysscraft follower, 2, 3/2. 宴楽・魔界・獣.
// {[adv]} {[cost04]}, banish this: You may summon an Itsurugi, Paradise's End from your evolve deck. Activate
// only if there are at least 5 Festive cards or at least 10 {[abysscraft]} cards in your cemetery. (An advanced
// activated ability, CR 12.16: this turn's evolve ability — ruling.)
// {[fanfare]} Put a Wolfling's Struggle token into your EX area.
import { banishThis } from "../costs";
import { activated, defineCard, fanfare } from "../helpers";
import { named } from "../targets";
import { paradiseReady } from "./shared";

export default defineCard({
  abilities: [
    activated(
      { playPoints: 4, custom: banishThis },
      {
        advanced: true,
        condition: paradiseReady("Abysscraft"),
        *resolve(fx) {
          yield* fx.fromEvolveDeck((id) => named("Itsurugi, Paradise's End")(fx.game, id), { to: "field" });
        },
      },
    ),
    fanfare({
      *resolve(fx) {
        yield* fx.tokensToEx(["Wolfling's Struggle"]);
      },
    }),
  ],
});
