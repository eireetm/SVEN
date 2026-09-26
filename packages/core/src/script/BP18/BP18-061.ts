// BP18-061 Fafnir, Cunning Wyrm — Dragoncraft follower, 8, 7/8. 竜族.
// Ward.
// If an enemy follower would be put from the field into the cemetery, banish it instead. (CR 10.10.1: no Last Words; a cost
// burying it is still paid; one that can't be banished goes to the cemetery, CR 1.3.3 — rulings.)
// {[fanfare]} Deal 8 damage to each enemy follower on the field. Deal 4 damage to each enemy leader.
import { defineCard, fanfare } from "../helpers";

export default defineCard({
  keywords: ["ward"],
  field: { banishesEnemyFollowersInsteadOfCemetery: true },
  abilities: [
    fanfare({
      *resolve(fx) {
        const opp = fx.game.opponent(fx.controller);
        yield* fx.dealDamageEach(fx.game.followers(opp), 8);
        yield* fx.dealDamage(fx.game.leader(opp), 4);
      },
    }),
  ],
});
