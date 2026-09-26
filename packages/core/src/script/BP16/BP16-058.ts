// BP16-058 Burnite, Anathema of Flame (Evolved) — Dragoncraft follower, 6/6. アナテマ・ドラゴニュート.
// On Evolve - Discard a card: Select an enemy follower on the field. Deal it damage equal to the discarded card's
// cost and draw a card.
// On Super-Evolve - Give your leader {[defense]}+5.
// At the start of your end phase, if there are at least 7 {[dragoncraft]} cards in your cemetery that cost 7 or
// more, deal 7 damage to each enemy leader.
import { atStartOfYourEndPhase, defineCard, onEvolve, onSuperEvolve } from "../helpers";
import { bigDragonsInCemetery, burniteFlames } from "./shared-dragon";

export default defineCard({
  abilities: [
    onEvolve(burniteFlames),
    onSuperEvolve({
      *resolve(fx) {
        yield* fx.giveLeaderDefense(fx.controller, 5);
      },
    }),
    atStartOfYourEndPhase({
      condition: (g, p) => bigDragonsInCemetery(g, p) >= 7,
      *resolve(fx) {
        yield* fx.dealDamage(fx.game.leader(fx.game.opponent(fx.controller)), 7);
      },
    }),
  ],
});
