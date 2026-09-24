// BP02-054 Dragonsong Flute — Dragoncraft amulet, 1.
// When this card is discarded, put a Hellflame Dragon token into your EX area.
// ----------
// {[fanfare]} {[cost03]} Summon a Hellflame Dragon token. Draw a card.
// {[act]}{[engage]}, discard a card: Put a Hellflame Dragon token into your EX area. This ability
// can be activated if Overflow is active for you.
// (The fanfare's play points are an optional cost, CR 10.4.7.4 — ruling; the act needs a card to
// discard — ruling; Overflow, CR 13.4.)
import { activated, defineCard, fanfare, whenDiscarded } from "../helpers";
import { discardA, playPointsCost } from "../costs";

export default defineCard({
  abilities: [
    whenDiscarded({
      *resolve(fx) {
        yield* fx.tokensToEx(["Hellflame Dragon"]);
      },
    }),
    fanfare({
      cost: playPointsCost(3),
      *resolve(fx) {
        yield* fx.summon(["Hellflame Dragon"]);
        yield* fx.draw(1);
      },
    }),
    activated(
      { engageSelf: true, custom: discardA(() => true) },
      {
        condition: (g, c) => g.overflow(c),
        *resolve(fx) {
          yield* fx.tokensToEx(["Hellflame Dragon"]);
        },
      },
    ),
  ],
});
