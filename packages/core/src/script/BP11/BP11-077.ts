// BP11-077 Wretch (Evolved) — Abysscraft follower, 4/3. 荒野・死者・魔界.
// Storm.
// On Evolve - Select an enemy follower on the field and deal it 5 damage.
// {[lastwords]} Summon a Bullet Bike token. Bury the top 2 cards of your deck.
import { defineCard, onEvolve } from "../helpers";
import { enemyFollower } from "../targets";
import { bikeAndBury } from "./shared-abyss";

export default defineCard({
  keywords: ["storm"],
  abilities: [
    onEvolve({
      targets: [enemyFollower()],
      *resolve(fx) {
        yield* fx.dealDamage(fx.targets[0]![0]!, 5);
      },
    }),
    bikeAndBury(2),
  ],
});
