// BP06-091 Karula, Arts Master — Havencraft follower, 3, 3/3. 挑戦者・信仰.
// {[evolve]} {[cost01]}: Evolve this follower.
// At the start of your end phase, if you have at least 2 play points, deal 2 damage to each enemy
// leader. If you have at least 4, draw a card. If you have at least 6, select up to 1 enemy follower
// on the field and destroy it.
// Rulings: the "up to 1" follower is selected when the ability is played, before drawing or
// recovering (CR 10.6.2.3); the play points are counted when each part happens.
import { atStartOfYourEndPhase, defineCard, evolveAbility } from "../helpers";
import { enemyFollower } from "../targets";
import { karulaStrikes, playPointsOf } from "./shared";

export default defineCard({
  abilities: [
    evolveAbility(1),
    atStartOfYourEndPhase({
      targets: [enemyFollower({ upTo: true, when: (g, c) => playPointsOf(g, c) >= 6 })],
      resolve: karulaStrikes,
    }),
  ],
});
