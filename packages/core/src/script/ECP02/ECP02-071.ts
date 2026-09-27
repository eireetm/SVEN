// ECP02-071 A Sweet Romantic Summer — Havencraft amulet, 3. デレマス・パッション.
// {[fanfare]} Select an enemy follower on the field. If there is an iM@S CG follower on your field, deal it 4 damage and give your
// leader {[defense]}+2. (Not playable without an enemy follower to select — ruling.)
// {[act]} {[cost01]}, {[engage]}, bury this: Search your deck for a follower with "Shin Sato" in its name, summon it, then shuffle.
// Activate only if there are at least 10 Passion cards in your cemetery. (The engage cost is in the Japanese and official English
// texts, not in this printing's English.)
import { activated, defineCard, fanfare } from "../helpers";
import { enemyFollower } from "../targets";
import { followerNamed, followersOnYourField, imas, inYourCemetery, passion } from "./shared";

export default defineCard({
  abilities: [
    fanfare({
      targets: [enemyFollower()],
      *resolve(fx) {
        if (followersOnYourField(fx.game, fx.controller, imas) === 0) return;
        yield* fx.dealDamage(fx.targets[0]![0]!, 4);
        yield* fx.giveLeaderDefense(fx.controller, 2);
      },
    }),
    activated(
      { playPoints: 1, engageSelf: true, burySelf: true },
      {
        condition: (g, c) => inYourCemetery(g, c, passion) >= 10,
        *resolve(fx) {
          yield* fx.search((id) => followerNamed("Shin Sato")(fx.game, id), { to: "field" });
        },
      },
    ),
  ],
});
