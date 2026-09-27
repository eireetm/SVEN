// CP02-074 Chitose Kurosaki — Abysscraft follower, 2, 2/2. デレマス・キュート.
// While this card is on your field, your leader and each other follower on your field don't take ability damage during your
// turn.
// {[act]} {[cost01]}, Lesson (1): Select an enemy follower on the field and deal it 3 damage. Activate only once per turn.
// (Rulings: ability damage is any damage but combat damage and attack damage on a leader (CR 5.14.3); prevented damage is no
// loss of defense (no Sanguine); "-2 defense" and "-1/-1" are not damage; two Chitoses protect each other.)
import { lesson } from "../costs";
import { activated, defineCard } from "../helpers";
import { enemyFollower } from "../targets";

export default defineCard({
  field: {
    damageToLeader: (g, self, damage) => {
      const me = g.controller(self);
      return damage.kind === "ability" && g.activePlayer === me && damage.target === g.leader(me) ? -damage.amount : 0;
    },
    damageToFollower: (g, self, damage) => {
      const me = g.controller(self);
      const other = damage.target !== self && g.card(damage.target)?.zone === "field" && g.controller(damage.target) === me;
      return damage.kind === "ability" && g.activePlayer === me && other ? -damage.amount : 0;
    },
  },
  abilities: [
    activated(
      { playPoints: 1, custom: lesson(1) },
      {
        oncePerTurn: true,
        targets: [enemyFollower()],
        *resolve(fx) {
          yield* fx.dealDamage(fx.targets[0]![0]!, 3);
        },
      },
    ),
  ],
});
