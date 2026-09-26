// BP08-052 Dragon Empress Otohime — Dragoncraft follower, 4, 2/4. ドラゴニュート・海洋.
// {[fanfare]} Summon an Otohime's Vanguard token. If Overflow is active for you, summon 3 instead.
// During your turn, whenever another Dragoncraft follower is put from your field into the
// cemetery, select an enemy leader or follower and deal it 1 damage. Each simultaneous departure
// triggers separately, and Otohime still sees the others when it leaves with them (ruling,
// CR 10.7.2.1, 10.7.4.1.2, 10.7.4.2).
import { defineCard, fanfare } from "../helpers";
import { enemyLeaderOrFollower } from "../targets";

export default defineCard({
  abilities: [
    fanfare({
      *resolve(fx) {
        const n = fx.game.overflow(fx.controller) ? 3 : 1;
        yield* fx.summon(Array<string>(n).fill("Otohime's Vanguard"));
      },
    }),
    {
      kind: "automatic",
      timing: "other",
      trigger(event, me, game) {
        if (game.activePlayer !== me.controller || event.type !== "cardsMoved") return false;
        return event.moves
          .filter(
            (move) =>
              move.card !== me.card &&
              move.from?.zone === "field" &&
              move.to.zone === "cemetery" &&
              move.before?.controller === me.controller &&
              game.db.get(move.before.abilityDef).type === "follower" &&
              game.db.get(move.before.abilityDef).class === "Dragoncraft",
          )
          .map((move) => ({ card: move.newCard ?? move.card! }));
      },
      targets: [enemyLeaderOrFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 1);
      },
    },
  ],
});
