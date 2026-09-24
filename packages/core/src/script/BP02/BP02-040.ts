// BP02-040 Grea the Dragonborn — Runecraft follower, 4, 5/4.
// If there is an Anne, Belle of Mysteria on your field, this card costs 2 less to play. (Still 2
// with two Annes — ruling; CR 10.4.4.1.)
// {[act]}{[engage]}: Select an enemy follower on the field and deal it 3 damage. If there is an
// Anne, Belle of Mysteria on your field, deal 6 damage instead.
import { activated, defineCard } from "../helpers";
import { enemyFollower, named } from "../targets";
import type { GameReader } from "../../engine/query";
import type { PlayerId } from "../../model/ids";

const anneOnField = (g: GameReader, p: PlayerId) => g.cards(p, "field").some((id) => named("Anne, Belle of Mysteria")(g, id));

export default defineCard({
  playCost: (g, _self, controller) => (anneOnField(g, controller) ? -2 : 0),
  abilities: [
    activated(
      { engageSelf: true },
      {
        targets: [enemyFollower()],
        *resolve(fx) {
          yield* fx.dealDamage(fx.targets[0]![0]!, anneOnField(fx.game, fx.controller) ? 6 : 3);
        },
      },
    ),
  ],
});
