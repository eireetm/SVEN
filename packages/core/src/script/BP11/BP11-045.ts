// BP11-045 Rapid Fire — Runecraft spell, 1. 荒野・魔法使い.
// {[quick]}
// Select an enemy follower on the field and deal it 2 damage. If there are at least 3 cards named Rapid
// Fire in your cemetery, deal 3 damage instead. If there are at least 5, deal 4 damage to its leader.
// ----------
// You can put up to 6 of this card into your deck. (CR 6.1.2)
import { defineCard, spell } from "../helpers";
import { enemyFollower, named } from "../targets";

export default defineCard({
  keywords: ["quick"],
  deckLimit: 6,
  abilities: [
    spell({
      targets: [enemyFollower()],
      *resolve(fx) {
        const target = fx.targets[0]![0]!;
        const leader = fx.game.leader(fx.game.controller(target));
        const n = fx.game.cards(fx.controller, "cemetery").filter((id) => named("Rapid Fire")(fx.game, id)).length;
        yield* fx.dealDamage(target, n >= 3 ? 3 : 2);
        if (n >= 5) yield* fx.dealDamage(leader, 4);
      },
    }),
  ],
});
