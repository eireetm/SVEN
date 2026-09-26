// BP20-020 Sinciro, Heir to Usurpation — Swordcraft follower, 3, 3/3. 絶傑・継承者・盗賊.
// {[evolve]} {[cost01]}: Evolve this.
// {[fanfare]} If there's at least 1 fusion counter on this, draw a card. If there are no fusion counters on this, put a
// Gilded Blade token into your EX area. (Counters it got in the EX area carry over when played, CR 10.6.2.1.3.)
// Activate, Fuse 2 or less Loot cards that cost at least 1: Put X fusion counters on this. X equals the number of cards
// fused. (Hand and EX area cards together; valid in the hand — rulings; at least 1, CR 12.18.2.2.)
import { defineCard, evolveAbility, fanfare } from "../helpers";
import { GILDED_BLADE } from "./shared";
import { fuseLootForCounters } from "./shared-sword";

export default defineCard({
  abilities: [
    evolveAbility(1),
    fanfare({
      *resolve(fx) {
        if (fx.game.card(fx.self)?.zone === "field" && fx.game.counters(fx.self, "fusion") >= 1) yield* fx.draw(1);
        else yield* fx.tokensToEx([GILDED_BLADE]);
      },
    }),
    fuseLootForCounters(2, (fused) => fused, true),
  ],
});
