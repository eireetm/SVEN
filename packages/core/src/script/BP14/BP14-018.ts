// BP14-018 Taketsumi, Aconite Paladin — Swordcraft follower, 2, 2/3. 宴楽・指揮官.
// {[adv]} {[cost04]}, banish this: Summon a Taketsumi, Creator of Paradise from your evolve deck. Activate only
// if there are at least 5 Festive cards or at least 10 {[swordcraft]} cards in your cemetery. (The Japanese
// text says "may"; an advanced activated ability, CR 12.16: 1 evolution point may pay 1 play point, and it
// is this turn's evolve ability — ruling.)
// {[fanfare]} Draw a card. Discard a card. Put a Glittering Gold token into your EX area.
import { banishThis } from "../costs";
import { activated, defineCard, fanfare } from "../helpers";
import { named } from "../targets";
import { GLITTERING_GOLD, paradiseReady } from "./shared";

export default defineCard({
  abilities: [
    activated(
      { playPoints: 4, custom: banishThis },
      {
        advanced: true,
        condition: paradiseReady("Swordcraft"),
        *resolve(fx) {
          yield* fx.fromEvolveDeck((id) => named("Taketsumi, Creator of Paradise")(fx.game, id), { to: "field" });
        },
      },
    ),
    fanfare({
      *resolve(fx) {
        yield* fx.draw(1);
        yield* fx.discard(fx.controller, 1, 1);
        yield* fx.tokensToEx([GLITTERING_GOLD]);
      },
    }),
  ],
});
