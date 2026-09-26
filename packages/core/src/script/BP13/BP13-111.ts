// BP13-111 Frostfire — Neutral spell, 4. 魔王.
// {[quick]}
// This card costs 3 less to play if there's an Archfiend follower on your field. (CR 10.4.4.1)
// ----------
// Select 2 enemy followers on the field. Deal 5 damage to one and engage the other. (Only playable with 2
// enemy followers — ruling. The Japanese text selects "one and another" and names them the former and the
// latter; here the player says which one takes the damage as it resolves — nothing can happen between
// playing and resolving it, CR 10.6.2.)
import { defineCard, spell } from "../helpers";
import { enemyFollower, hasTrait } from "../targets";

const archfiend = hasTrait("魔王");

export default defineCard({
  keywords: ["quick"],
  playCost: (g, _self, p) => (g.followers(p).some((id) => archfiend(g, id)) ? -3 : 0),
  abilities: [
    spell({
      targets: [enemyFollower({ count: 2 })],
      *resolve(fx) {
        const both = (fx.targets[0] ?? []).filter((id) => fx.game.card(id)?.zone === "field");
        const [hit] = yield* fx.chooseCards(both, Math.min(1, both.length), 1);
        if (hit !== undefined) yield* fx.dealDamage(hit, 5);
        yield* fx.engage(both.filter((id) => id !== hit));
      },
    }),
  ],
});
