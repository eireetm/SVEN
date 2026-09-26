// BP18-T06 Adelle, Jealous Dragon — Dragoncraft follower token, 4, 4/4. 竜族.
// Whenever an Ian, Dragon Buster is put from your field into the cemetery, deal 5 damage to each enemy leader. (Destroyed
// counts; also when this leaves together with it: two of these, two triggers — rulings, CR 10.7.4.2.)
import { defineCard, whenYourFollowerLeaves } from "../helpers";

export default defineCard({
  abilities: [
    whenYourFollowerLeaves(
      {
        *resolve(fx) {
          yield* fx.dealDamage(fx.game.leader(fx.game.opponent(fx.controller)), 5);
        },
      },
      { to: "cemetery", includeSelf: true, filter: (m) => m.before?.names.includes("Ian, Dragon Buster") ?? false },
    ),
  ],
});
