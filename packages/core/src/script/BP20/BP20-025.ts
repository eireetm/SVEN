// BP20-025 Fearful Fighter — Swordcraft follower, 5, 5/5. 兵士.
// Intimidate.
// Whenever an enemy follower that took damage from this is put from the field into the cemetery during your turn, put the
// top card of your deck into your EX area. (Damage this turn — the Japanese and official English texts; also after its
// Fanfare damage, however it is then put there — ruling; also when this leaves at the same time, CR 10.7.4.2.)
// {[fanfare]} Select up to 2 enemy followers on the field and deal 6 damage divided between them.
import type { AutomaticAbility } from "../types";
import { defineCard, fanfare } from "../helpers";
import { enemyFollower } from "../targets";

const refill: AutomaticAbility = {
  kind: "automatic",
  timing: "other",
  triggerIf: (g, c) => g.activePlayer === c,
  trigger: (e, me, game) => {
    if (e.type !== "cardsMoved" || me.zone !== "field") return false;
    return e.moves
      .filter(
        (m) =>
          m.card !== null &&
          m.from?.zone === "field" &&
          m.to.zone === "cemetery" &&
          m.before !== null &&
          m.before.controller !== me.controller &&
          game.db.get(m.before.abilityDef).type === "follower" &&
          game.tookDamageThisTurnFrom(m.card, me.card),
      )
      .map((m) => ({ card: m.newCard ?? m.card! }));
  },
  *resolve(fx) {
    yield* fx.topToEx(1);
  },
};

export default defineCard({
  keywords: ["intimidate"],
  abilities: [
    refill,
    fanfare({
      targets: [enemyFollower({ count: 2, upTo: true, max: () => 6 })],
      *resolve(fx) {
        yield* fx.dealDividedDamage(fx.targets[0] ?? [], 6);
      },
    }),
  ],
});
